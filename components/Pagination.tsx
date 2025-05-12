"use client";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav className="flex justify-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="cursor-pointer rounded-md bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300 disabled:cursor-default disabled:opacity-50"
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`cursor-pointer rounded-md px-3 py-1 ${
            p === currentPage
              ? "bg-lime-green text-black"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="cursor-pointer rounded-md bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300 disabled:cursor-default disabled:opacity-50"
      >
        Next
      </button>
    </nav>
  );
}
