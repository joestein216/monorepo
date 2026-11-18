"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

export default defineConfig({
  name: "default",
  title: "joestein.dev",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    presentationTool({
      previewUrl: {
        initial: "http://localhost:3006",
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter((template) => template.schemaType !== "about"),
  },
  document: {
    actions: (actions, context) => context.schemaType === "about" || context.documentId === "page-colophon"
      ? actions.filter(({ action }) => action !== "duplicate" && action !== "delete" && action !== "unpublish")
      : actions,
  },
});
