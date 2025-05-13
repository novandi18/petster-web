import { getAllPetIds } from "@/lib/firestore/petFirestore";
import EditPetClient from "./page.client";

export async function generateStaticParams() {
  const ids = await getAllPetIds();
  return ids.map((id) => ({ id }));
}

export const metadata = {
  title: "Edit Pet",
  description: "Form to update pet details",
};

export default function Page() {
  return <EditPetClient />;
}
