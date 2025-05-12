import { Metadata } from "next";
import HomeClient from "./page.client";

export const metadata: Metadata = {
  title: "Home | Petster",
  description:
    "Welcome to Petster. Discover community experiences, volunteer opportunities, and shelter resources. Join our community to find out more about pet adoption, care tips, and volunteer programs for animal shelters.",
  keywords: [
    "Petster",
    "pets",
    "pet adoption",
    "animal shelter",
    "volunteer",
    "community",
    "pet care",
    "volunteer opportunities",
    "shelter resources",
  ].join(", "),
  openGraph: {
    title: "Home | Petster",
    description:
      "Welcome to Petster. Discover community experiences, volunteer opportunities, and shelter resources. Join our community to find out more about pet adoption, care tips, and volunteer programs for animal shelters.",
    siteName: "Petster",
    locale: "id_ID",
    type: "website",
  },
};

export default function Page() {
  return <HomeClient />;
}
