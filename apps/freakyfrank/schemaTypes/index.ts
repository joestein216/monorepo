import { type SchemaTypeDefinition } from 'sanity'
import { link } from "./link"
import { navigationItem } from "./navigationItem"
import { portableText } from "./portableText"
import { seo } from "./seo"
import { siteSettings } from "./siteSettings"
import { artistPage } from "./artistPage"
import { event } from "./event"
import { homePage } from "./homePage"
import { photo } from "./photo"
import { photoAlbum } from "./photoAlbum"

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [link, navigationItem, portableText, seo, siteSettings, artistPage, event, photo, photoAlbum, homePage],
}
