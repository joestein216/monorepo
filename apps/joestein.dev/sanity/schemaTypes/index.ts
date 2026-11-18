import type { SchemaTypeDefinition } from "sanity";
import { about } from "./about";
import { project } from "./project";
import { role } from "./role";
import { technology } from "./technology";
import { pageType } from "./pageType";

export const schemaTypes: SchemaTypeDefinition[] = [technology, project, role, about, pageType];
