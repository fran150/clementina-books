# Appendix B: Project and asset file fields

These tables list the fields in `clementina.yaml`, asset files and the load
plan. They are generated from the SDK's JSON Schemas.

In a field path, `build.assets.slots[].mia` means `mia` in each `slots`
entry. `steps[kind=mia]` means a `steps` entry whose `kind` is `mia`.

For rules involving several fields or references between assets, see
[The project folder](../projects/project-folder.md) and
[The asset model](../projects/asset-model.md).

{{#include ../../../tables/sdk-schemas.md}}
