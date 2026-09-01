import { defineType } from 'sanity'

export default defineType({
  name: 'vinylRecord',
  title: 'VinylRecord',
  type: 'document',
  fields: [
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug'
    },
    {
      name: 'listing_id',
      title: 'listing_id',
      type: 'number'
    },
    {
      name: 'artist',
      title: 'artist',
      type: 'string'
    },
    {
      name: 'title',
      title: 'title',
      type: 'string'
    },
    {
      name: 'label',
      title: 'label',
      type: 'string'
    },
    {
      name: 'catno',
      title: 'catno',
      type: 'string'
    },
    {
      name: 'format',
      title: 'format',
      type: 'string'
    },
    {
      name: 'release_id',
      title: 'release_id',
      type: 'number'
    },
    {
      name: 'status',
      title: 'status',
      type: 'string'
    },
    {
      name: 'price',
      title: 'price',
      type: 'number'
    },
    {
      name: 'listed',
      title: 'listed',
      type: 'string'
    },
    {
      name: 'comments',
      title: 'comments',
      type: 'string'
    },
    {
      name: 'media_condition',
      title: 'media_condition',
      type: 'string'
    },
    {
      name: 'sleeve_condition',
      title: 'sleeve_condition',
      type: 'string'
    },
    {
      name: 'accept_offer',
      title: 'accept_offer',
      type: 'string'
    },
    {
      name: 'external_id',
      title: 'external_id',
      type: 'string'
    },
    {
      name: 'coverArt',
      title: 'Cover Art',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'coverArtSource',
      title: 'Cover Art Source',
      type: 'string',
    },
    {
      name: 'musicbrainzId',
      title: 'MusicBrainz ID',
      type: 'string',
    },
    {
      name: 'coverArtMusicBrainz',
      title: 'Cover Art MusicBrainz',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'weight',
      title: 'weight',
      type: 'number'
    },
    {
      name: 'format_quantity',
      title: 'format_quantity',
      type: 'number'
    },
    {
      name: 'location',
      title: 'location',
      type: 'string'
    }
  ]
})
