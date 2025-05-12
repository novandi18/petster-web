export function generateWhatsAppMessage(
  petName: string,
  shelterName: string,
  volunteerName: string,
  petCategory: string,
  petBreed: string,
): string {
  const name = petName || "Hewan ini";
  const shelter = shelterName || "Shelter";
  const volunteer = volunteerName || "";
  const category = petCategory || "N/A";

  const validPetBreed = petBreed?.trim();
  const typeBreedLine = validPetBreed
    ? `* Jenis/Ras: ${category} / ${validPetBreed}`
    : `* Jenis: ${category}`;

  const message = `
Halo Kak ${volunteer},
Perkenalkan, saya ${shelter}. Saya menemukan profil hewan adopsi ini melalui aplikasi Petster dan sangat tertarik.

Detail Hewan:
* Nama: ${name}
${typeBreedLine}

Apakah ${name} saat ini masih tersedia untuk diadopsi?
Mohon informasinya ya. Terima kasih banyak!

Salam hangat,
${shelter}
`.trim();

  return message;
}
