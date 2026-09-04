import {defineLocations, type PresentationPluginOptions} from 'sanity/presentation'
export const resolve: PresentationPluginOptions['resolve'] = {
  // 1. Tell Presentation which document types belong to which URLs
  mainDocuments: [
    { route: '/', filter: `_type == "homePage"` },
    { route: '/artists/:slug', filter: `_type == "artistPage" && slug.current == $slug` },
    { route: '/events/:slug', filter: `_type == "event" && slug.current == $slug` },
    { route: '/albums/:slug', filter: `_type == "photoAlbum" && slug.current == $slug` },
  ],
  // 2. Add perspective locations to the top bar of the Studio inspector
  locations: {
    homePage: defineLocations({
      message: 'This document renders the main website homepage.',
      tone: 'positive',
      locations: [{ title: 'Home', href: '/' }],
    }),
    artistPage: defineLocations({
      select: { 
        title: 'title', 
        slug: 'slug.current' 
      },
      resolve: (doc) => ({
        locations: [{
          title: doc?.title,
          href: `/artists/${doc?.slug}`,
        },
        {
          title: 'All Artists', 
          href: '/artists'
        }],
      }),
    }),
    event: defineLocations({
      select: { 
        title: 'title', 
        slug: 'slug.current' 
      },
      resolve: (doc) => ({
        locations: [{
          title: doc?.title, 
          href: `/events/${doc?.slug}` 
        },
        {
          title: 'All Events', 
          href: '/events'
        }],
      }),
    }),
    photoAlbum: defineLocations({
      select: { 
        title: 'title', 
        slug: 'slug.current' 
      },
      resolve: (doc) => ({
        locations: [{ 
          title: doc?.title,
          href: `/albums/${doc?.slug}` 
        },
        {
          title: 'All Albums', 
          href: '/albums'
        }],
      })
    }),
  },  
}
