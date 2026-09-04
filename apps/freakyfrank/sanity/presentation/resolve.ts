import {defineLocations, type PresentationPluginOptions} from 'sanity/presentation'
export const resolve: PresentationPluginOptions['resolve'] = {
  // 1. Tell Presentation which document types belong to which URLs
  mainDocuments: [
    { route: '/', filter: `_type == "homePage"` },
  ],
  // 2. Add perspective locations to the top bar of the Studio inspector
  locations: {
    homePage: defineLocations({
      message: 'This document renders the main website homepage.',
      tone: 'positive',
      locations: [{ title: 'Home', href: '/' }],
    }),
  },  
}
