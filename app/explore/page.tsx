import ExploreClient from "./page.client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Pets | Petster",
  description:
    "Browse and discover pets available for adoption. Filter by category, breed, age, and location to find your perfect companion.",
  keywords: [
    "Petster",
    "explore",
    "pets",
    "adoption",
    "animal shelter",
    "browse pets",
    "find pets",
    "pet categories",
    "pet breeds",
  ].join(", "),
  openGraph: {
    title: "Explore Pets | Petster",
    description:
      "Browse and discover pets available for adoption. Filter by category, breed, age, and location to find your perfect companion.",
    siteName: "Petster",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Pets | Petster",
    description:
      "Browse and discover pets available for adoption. Filter by category, breed, age, and location to find your perfect companion.",
  },
  alternates: {
    canonical: "/explore",
  },
};

export default function Page() {
  return <ExploreClient />;
}
