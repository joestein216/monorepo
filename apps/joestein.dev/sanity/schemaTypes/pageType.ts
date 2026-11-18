import { defineArrayMember, defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";

export const pageType = defineType({
  name: "page",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (rule) => rule.required() }),
    defineField({ name: "subtitle", type: "string" }),
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "body", type: "array", of: [
      defineArrayMember({ type: "block", styles: [
        { title: "Paragraph", value: "normal" }, { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" }, { title: "Heading 4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ], lists: [{ title: "Bullet", value: "bullet" }, { title: "Numbered", value: "number" }], marks: {
        decorators: [{ title: "Bold", value: "strong" }, { title: "Italic", value: "em" }, { title: "Code", value: "code" }],
        annotations: [defineArrayMember({ name: "link", type: "object", fields: [
          defineField({ name: "href", type: "url", validation: (rule) => rule.required().uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }) }),
        ] })],
      } }),
      defineArrayMember({ name: "mermaidDiagram", type: "object", icon: DocumentTextIcon,
        fields: [
          defineField({ name: "caption", type: "string" }),
          defineField({ name: "code", type: "text", rows: 14, validation: (rule) => rule.required() }),
        ], preview: { select: { caption: "caption" }, prepare: ({ caption }) => ({ title: caption || "Mermaid diagram" }) },
      }),
      defineArrayMember({ name: "codeBlock", type: "object", icon: DocumentTextIcon,
        fields: [
          defineField({ name: "language", type: "string" }),
          defineField({ name: "code", type: "text", rows: 10, validation: (rule) => rule.required() }),
        ], preview: { select: { language: "language" }, prepare: ({ language }) => ({ title: language ? `${language} code` : "Code block" }) },
      }),
    ] }),
  ],
});
