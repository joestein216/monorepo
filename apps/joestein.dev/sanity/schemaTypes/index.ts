import type { SchemaTypeDefinition } from "sanity";
import { about } from "./about";
import { project } from "./project";
import { role } from "./role";
import { technology } from "./technology";
import { pageType } from "./pageType";
import { siteSettings } from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [technology, project, role, about, pageType, siteSettings];
