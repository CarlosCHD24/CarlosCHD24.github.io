import type { Metadata } from "next";

export const socialImage = {
  url: "/empleo-publico-og.png",
  width: 1536,
  height: 1024,
  alt: "Visor de oportunidades de empleo público en Sevilla con tabla, filtros y métricas.",
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
  locale = "es_ES",
  image = socialImage,
}: SocialMetadataOptions): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "Empleo público · Sevilla",
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
