# Appendix E: Emulator automation methods

The headless emulator's endpoint, from the SDK's
`specs/emulator-automation.json`. Every request is an HTTP POST to `/v1` with
a JSON object; every answer is `{"version":1,"ok":true,"result":...}` or
`{"version":1,"ok":false,"error":"..."}`. [Automation and AI
agents](../running/automation.md) shows it in use.

{{#include ../../../tables/sdk-automation.md}}
