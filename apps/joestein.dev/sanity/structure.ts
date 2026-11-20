import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) => S.list().title("Portfolio").items([
  S.listItem().title("Site Settings").child(S.document().schemaType("siteSettings").documentId("site-settings")),
  S.listItem().title("About Joe").child(S.document().schemaType("about").documentId("about")),
  S.listItem().title("Making of joestein.dev").child(S.document().schemaType("page").documentId("page-colophon")),
  S.listItem().title("Other pages").child(S.documentTypeList("page").title("Other pages")
    .filter('_type == "page" && _id != "page-colophon" && slug.current != "colophon"')),
  S.divider(),
  ...S.documentTypeListItems().filter((item) => !["about", "page", "siteSettings"].includes(item.getId() ?? "")),
]);
