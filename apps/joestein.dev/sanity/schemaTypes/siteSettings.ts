import { defineArrayMember, defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons/Cog";

const modeCopy = (name: "prompt" | "overview") => defineField({
  name, type: "object", description: "The mode ID and behavior belong to the application. Only visitor-facing wording is editable.",
  fields: [
    defineField({ name: "label", type: "string", description: "Short name in the mode chooser.", validation: (rule) => rule.required().min(1).max(40) }),
    defineField({ name: "navigationLabel", type: "string", description: "Action wording when offering this mode as an alternative.", validation: (rule) => rule.required().min(1).max(65) }),
  ],
});

export const siteSettings = defineType({
  name: "siteSettings", type: "document", title: "Site Settings", icon: CogIcon,
  fields: [
    defineField({ name: "identity", type: "object", fields: [
      defineField({ name: "brandName", type: "string", validation: (rule) => rule.required().min(1).max(80) }),
    ] }),
    defineField({ name: "modes", type: "object", fields: [modeCopy("prompt"), modeCopy("overview")] }),
    defineField({ name: "navigation", type: "object", fields: [
      defineField({ name: "colophonLabel", type: "string", description: "The link to the Making of page; its destination is application-owned.", validation: (rule) => rule.required().min(1).max(80) }),
    ] }),
    defineField({ name: "promptExperience", type: "object", fields: [
      defineField({ name: "invitation", type: "string", validation: (rule) => rule.required().min(1).max(160) }),
      defineField({ name: "placeholder", type: "text", rows: 2, validation: (rule) => rule.required().min(1).max(300) }),
      defineField({ name: "submitLabel", type: "string", validation: (rule) => rule.required().min(1).max(40) }),
      defineField({ name: "pendingLabel", type: "string", validation: (rule) => rule.required().min(1).max(40) }),
      defineField({ name: "starterQuestions", type: "array",
        description: "Ordered example questions. Each question is both the visible text and submitted prompt. Leave empty to hide starters; freeform chat remains available.",
        validation: (rule) => rule.max(8),
        of: [defineArrayMember({ name: "starterQuestion", type: "object", fields: [
          defineField({ name: "question", type: "string", description: "One short question, usually 5–10 words.", validation: (rule) => rule.required().max(65) }),
        ], preview: { select: { title: "question" } } })],
      }),
    ] }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
