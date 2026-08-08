// Define this locally to avoid naming clashes with next/image
export interface SanityImage {
  _key: string;
  _type: 'image';
  alt?: string;
  caption?: string;
  asset: {
    _id: string;
    _ref: string;
    _type: 'reference';
    metadata?: {
      dimensions?: {
        aspectRatio: number;
        width: number;
        height: number;
      };
    };
    url: string;
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}
