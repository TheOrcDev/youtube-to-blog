import type { Metadata } from "next";

export const OG_IMAGE_ALT =
  "YouTube to Blog - Turn videos into SEO-ready blog posts with AI";

export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_WIDTH = 1200;

/** Static PNG. LinkedIn and daily.dev cache /og.png and often skip extensionless /opengraph-image. */
export const SITE_OG_IMAGE_PATH = "/opengraph.png";

export const siteOgImages: NonNullable<
  NonNullable<Metadata["openGraph"]>["images"]
> = [
  {
    alt: OG_IMAGE_ALT,
    height: OG_IMAGE_HEIGHT,
    type: "image/png",
    url: SITE_OG_IMAGE_PATH,
    width: OG_IMAGE_WIDTH,
  },
];

export function postOgImages(slug: string, alt: string) {
  return [
    {
      alt,
      height: OG_IMAGE_HEIGHT,
      type: "image/png",
      url: `/blog/${slug}/opengraph.png`,
      width: OG_IMAGE_WIDTH,
    },
  ] satisfies NonNullable<NonNullable<Metadata["openGraph"]>["images"]>;
}
