import CommunityClient from "./page.client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community | Petster",
  description:
    "Join the Petster community to share stories, updates, and connect with fellow animal lovers around rescued pets and adoption journeys.",
  keywords: [
    "Petster",
    "Community",
    "Rescue",
    "Adoption",
    "Animals",
    "Stories",
  ],
  openGraph: {
    title: "Community | Petster",
    description:
      "Discover and engage with the Petster community—share rescue stories, adoption updates, and support animal welfare.",
    type: "website",
  },
  twitter: {
    title: "Community | Petster",
    description:
      "Discover and engage with the Petster community—share rescue stories, adoption updates, and support animal welfare.",
  },
};

export default function Page() {
  return <CommunityClient />;
}
