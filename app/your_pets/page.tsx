import { Metadata } from "next";
import { YourPetsClient } from "./page.client";

export const metadata: Metadata = {
  title: "Your Pets | Petster",
  description:
    "Browse and manage the list of pets you handle as a volunteer on Petster. Navigate easily with pagination.",
  openGraph: {
    title: "Your Pets | Petster",
    description:
      "Browse and manage the list of pets you handle as a volunteer on Petster. Navigate easily with pagination.",
    url: "https://petster.com/your_pets",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Pets | Petster",
    description:
      "Browse and manage the list of pets you handle as a volunteer on Petster. Navigate easily with pagination.",
  },
};

export default function Page() {
  return <YourPetsClient />;
}
