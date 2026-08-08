import { defineMigration, at, set, patch } from 'sanity/migrate'

export default defineMigration({
  title: "data-fix-to-restore-overwritten-coverart",
  documentTypes: ["vinylRecord"],
  
  // can add your GROQ condition here to only fetch specific records
  filter: 'defined(coverArt) && defined(musicbrainzId) && !defined(coverArtMusicBrainz)',

  async *migrate(documents) {
    for await (const document of documents()) {
      yield patch(document._id, [
        at('coverArtMusicBrainz', set(document.coverArt)),
      ]);
    }
  }
})
