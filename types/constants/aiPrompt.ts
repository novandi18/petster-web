export const aiOptions = [
  "Improve Writing",
  "Make More Engaging",
  "Add Discussion Question",
  "Reformat as List",
  "Simplify Language",
];

const aiPromptTemplates = [
  `Periksa teks berikut untuk kesalahan tata bahasa, ejaan, kejelasan, dan alur. Sajikan kembali teks yang sudah diperbaiki agar lebih mudah dibaca dan menarik untuk komunitas adopsi hewan peliharaan. Jangan tambahkan komentar atau penjelasan lain, cukup berikan teks finalnya. Berikan hanya teks hasilnya saja dalam format teks biasa (plain text), tanpa markdown atau format khusus, dan pastikan panjangnya tidak melebihi 1000 karakter:\n%s`,
  `Tulis ulang teks berikut agar lebih menarik dan mendorong interaksi (komentar/pertanyaan) dari anggota komunitas adopsi hewan peliharaan. Fokus pada penggunaan kata-kata yang hangat dan ramah. Berikan hanya teks yang sudah ditulis ulang sebagai output. Berikan hanya teks hasilnya saja dalam format teks biasa (plain text), tanpa markdown atau format khusus, dan pastikan panjangnya tidak melebihi 1000 karakter:\n%s`,
  `Tambahkan satu pertanyaan relevan di akhir teks berikut untuk mendorong diskusi dan balasan dari anggota komunitas adopsi hewan peliharaan. Sajikan kembali seluruh teks postingan termasuk pertanyaan di akhir. Berikan hanya teks finalnya. Berikan hanya teks hasilnya saja dalam format teks biasa (plain text), tanpa markdown atau format khusus, dan pastikan panjangnya tidak melebihi 1000 karakter:\n%s`,
  `Ubah teks berikut menjadi daftar poin-poin (menggunakan bullet points atau nomor) agar lebih mudah dibaca, terutama jika berisi langkah-langkah, tips, atau karakteristik. Ekstrak poin-poin penting dari teks. Berikan hanya daftar yang sudah diformat sebagai output. Berikan hanya teks hasilnya saja dalam format teks biasa (plain text), tanpa markdown atau format khusus, dan pastikan panjangnya tidak melebihi 1000 karakter:\n%s`,
  `Tulis ulang teks berikut menggunakan bahasa yang lebih sederhana dan mudah dipahami oleh audiens umum di komunitas adopsi hewan peliharaan, hindari jargon teknis jika memungkinkan. Berikan hanya teks yang sudah disederhanakan sebagai output. Berikan hanya teks hasilnya saja dalam format teks biasa (plain text), tanpa markdown atau format khusus, dan pastikan panjangnya tidak melebihi 1000 karakter:\n%s`,
];

export function getPromptForOption(
  selectedOption: string,
  postText: string,
): string {
  const index = aiOptions.indexOf(selectedOption);
  const template =
    index !== -1
      ? aiPromptTemplates[index]
      : `Tolong tinjau dan tingkatkan kualitas teks berikut: %s`;
  return template.replace("%s", postText);
}

export const assistantDefaultPrompt = `Anda adalah asisten chat dari aplikasi Petster. Anda bertugas membantu pengguna terkait hewan peliharaan. Selalu jawab sapaan atau salam dari pengguna dengan ramah. Jika pertanyaannya mengenai hewan peliharaan, jawablah dengan jelas dan ringkas. Jika pertanyaannya di luar topik hewan peliharaan, jelaskan dengan sopan bahwa Anda hanya bisa membantu dengan pertanyaan seputar hewan peliharaan:\n%s`;
