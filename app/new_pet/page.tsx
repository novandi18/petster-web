import { Metadata } from "next";
import NewPetClient from "./page.client";

export const metadata: Metadata = {
  title: "Create New Pet | Petster",
  description:
    "Create a new pet listing as a volunteer on Petster. Provide all necessary details like name, age, breed, photos, and more.",
  openGraph: {
    title: "Create New Pet | Petster",
    description:
      "Create a new pet listing as a volunteer on Petster. Provide all necessary details like name, age, breed, photos, and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create New Pet | Petster",
    description:
      "Create a new pet listing as a volunteer on Petster. Provide all necessary details like name, age, breed, photos, and more.",
  },
};

export default function Page() {
  return <NewPetClient />;
}
