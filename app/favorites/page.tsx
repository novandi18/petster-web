import FavoriteClient from "./page.client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favorites | Petster",
  description:
    "View and manage your favorite pets on Petster. Keep track of pets you love and save them for later adoption.",
  keywords: [
    "Petster",
    "favorites",
    "saved pets",
    "pet adoption",
    "pet list",
    "favorite animals",
    "adoption planning",
  ].join(", "),
  openGraph: {
    title: "Favorites | Petster",
    description:
      "View and manage your favorite pets on Petster. Keep track of pets you love and save them for later adoption.",
    siteName: "Petster",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Favorites | Petster",
    description:
      "View and manage your favorite pets on Petster. Keep track of pets you love and save them for later adoption.",
  },
  alternates: {
    canonical: "/favorites",
  },
};

export default function Page() {
  return <FavoriteClient />;
}
