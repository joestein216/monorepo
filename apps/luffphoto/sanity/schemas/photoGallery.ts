// photoGallery.ts
export const photoGallery = {
  name: 'photoGallery',
  title: 'Photo Gallery',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Gallery Title',
      type: 'string',
    },
    {
      name: 'images',
      title: 'Gallery Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true }, // Enables crop and focal point UI
          fields: [
            {
              name: 'alt',
              title: 'Alternative Text',
              type: 'string',
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
}
