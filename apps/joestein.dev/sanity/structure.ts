import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) => S.list().title("Portfolio").items([
  S.listItem().title("About Joe").child(S.document().schemaType("about").documentId("about")),
  S.divider(),
  ...S.documentTypeListItems().filter((item) => item.getId() !== "about"),
]);
