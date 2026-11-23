import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem().title('Backstage focus').child(S.document().schemaType('backstageBoard').documentId('backstageBoard')),
      ...S.documentTypeListItems().filter((item) => item.getId() !== 'backstageBoard'),
    ])
