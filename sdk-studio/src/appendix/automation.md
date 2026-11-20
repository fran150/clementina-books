# Appendix E: Emulator automation methods

These methods come from the SDK's emulator automation specification. Send
each request as an HTTP POST to `/v1` with a JSON object. A successful
response has `"ok":true` and a `result`; a failure has `"ok":false` and an
`error`. [Automation and AI agents](../running/automation.md) shows the
endpoint in use.

{{#include ../../../tables/sdk-automation.md}}
