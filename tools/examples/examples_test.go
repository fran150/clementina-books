// SPDX-License-Identifier: GPL-3.0-only
// Runs the books' BASIC examples in the emulator. tools/run-examples.py overlays this file into
// clementina-6502's pkg/computers/clementina package, so it can use that package's test helpers
// (bootClementinaToPrompt, typeLine, ...). It is not built on its own.
package clementina

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"testing"
)

type bookExample struct {
	ID     string            `json:"id"`
	Lines  []string          `json:"lines"`
	Keys   string            `json:"keys"`
	Cycles int               `json:"cycles"`
	Files  map[string][]byte `json:"files"`
	// Hold lists keyboard HID usage codes held down before the lines are typed.
	Hold []uint16 `json:"hold"`
	// After lists lines typed once the keys and cycles have run, to inspect the result.
	After []string `json:"after"`
}

type hidHolder interface {
	DebugSetHidUsage(usagePage, usageID uint16, down bool)
}

type bookResult struct {
	ID     string            `json:"id"`
	Screen []string          `json:"screen"`
	Attrs  []string          `json:"attrs"`
	Files  map[string][]byte `json:"files"`
}

func screenRows(vr videoReader) []string {
	rows := make([]string, 25)
	for r := 0; r < 25; r++ {
		row := make([]byte, 40)
		for c := 0; c < 40; c++ {
			b := ntCell(vr, r, c)
			switch {
			case b >= 0x20 && b < 0x7f:
				row[c] = b
			default:
				row[c] = '.'
			}
		}
		rows[r] = string(row)
	}
	return rows
}

// attrRows gives each row's overlay attribute bytes as hex, two digits a cell.
func attrRows(vr videoReader) []string {
	rows := make([]string, 25)
	for r := 0; r < 25; r++ {
		row := make([]byte, 0, 80)
		for c := 0; c < 40; c++ {
			row = append(row, fmt.Sprintf("%02X", attrCell(vr, r, c))...)
		}
		rows[r] = string(row)
	}
	return rows
}

func TestBookExamples(t *testing.T) {
	in := os.Getenv("BOOK_EXAMPLES")
	if in == "" {
		t.Skip("BOOK_EXAMPLES not set")
	}
	data, err := os.ReadFile(in)
	if err != nil {
		t.Fatal(err)
	}
	var examples []bookExample
	if err := json.Unmarshal(data, &examples); err != nil {
		t.Fatal(err)
	}
	var results []bookResult
	for _, ex := range examples {
		dir := t.TempDir()
		for name, content := range ex.Files {
			path := filepath.Join(dir, filepath.FromSlash(name))
			_ = os.MkdirAll(filepath.Dir(path), 0o755)
			if err := os.WriteFile(path, content, 0o644); err != nil {
				t.Fatal(err)
			}
		}
		computer, step := bootClementinaToPrompt(t)
		computer.SetMiaSDFolder(dir)
		for _, code := range ex.Hold {
			computer.chips.mia.(hidHolder).DebugSetHidUsage(0x07, code, true)
		}
		for _, line := range ex.Lines {
			typeLine(computer, step, line)
			editorTickN(computer, step, 1_500_000)
		}
		if ex.Keys != "" {
			injectKeys(computer, []byte(ex.Keys)...)
		}
		cycles := ex.Cycles
		if cycles == 0 {
			cycles = 3_000_000
		}
		editorTickN(computer, step, cycles)
		for _, line := range ex.After {
			typeLine(computer, step, line)
			editorTickN(computer, step, 1_500_000)
		}
		files := map[string][]byte{}
		_ = filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
			if err == nil && !info.IsDir() {
				rel, _ := filepath.Rel(dir, path)
				files[filepath.ToSlash(rel)], _ = os.ReadFile(path)
			}
			return nil
		})
		results = append(results, bookResult{ID: ex.ID, Screen: screenRows(computer.chips.mia.(videoReader)), Attrs: attrRows(computer.chips.mia.(videoReader)), Files: files})
		computer.Close()
	}
	out, _ := json.MarshalIndent(results, "", " ")
	if err := os.WriteFile(os.Getenv("BOOK_RESULTS"), out, 0o644); err != nil {
		t.Fatal(err)
	}
}
