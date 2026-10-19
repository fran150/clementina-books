# Appendix B: Project and asset file fields

Every field of `clementina.yaml`, of each kind of asset file, and of the
load plan, generated from the JSON Schemas in the SDK's `specs/schema`
folder. A path like `build.assets.slots[].mia` is the field `mia` of each
entry of the list `slots`; `steps[kind=mia]` is an entry of `steps` whose
`kind` is `mia`. The SDK checks more than these tables show: references
between assets, and rules that span several fields, are in [The project
folder](../projects/project-folder.md) and [The asset
model](../projects/asset-model.md).

{{#include ../../../tables/sdk-schemas.md}}
