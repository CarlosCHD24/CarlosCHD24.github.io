import type { Metadata } from "next";

export const socialImage = {
  url: "/opengraph-image.png",
  width: 1536,
  height: 1024,
  alt: "DDCF research network connecting computational friction, interface mechanics, and data-driven modeling.",
} as const;

type SocialMetadataOptions = {
  title: string;
  description: string;
  url: string;
  locale?: string;
  image?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
};

export function createSocialMetadata({
  title,
  description,
  url,
  locale = "en_US",
  image = socialImage,
}: SocialMetadataOptions): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "Joaquin Garcia-Suarez",
      locale,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
