import {defineMigration, at, setIfMissing, patch} from 'sanity/migrate'

export default defineMigration({
  title: "schema-updates-for-musicbrainz-coverart",
  documentTypes: ["vinylRecord"],

  async *migrate(documents) {
    for await (const document of documents()) {
      // Check if the document has a coverArt field and does not have a coverArtSource field
      if (document.coverArt && !document.coverArtSource) {
        // Update the document to set coverArtSource to 'musicbrainz-coverart'
        yield patch(document._id, [
          at('coverArtSource', setIfMissing('discogs-release-id')),
        ]);
      }
    }
  }
})
