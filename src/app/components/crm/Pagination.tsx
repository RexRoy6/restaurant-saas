"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const delta = 2; // páginas alrededor de la actual
    const range = [];
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  const pages = getPages();

  return (
    <div className="flex justify-center w-full mt-2 mb-8">
      <div className="flex items-center gap-1.5 p-1.5 bg-white border border-gray-200 rounded-xl shadow-sm">
        
        {/* Botón Anterior */}
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`flex items-center justify-center p-2 rounded-lg border border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 ${
            page === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
          aria-label="Página anterior"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Primera Página */}
        {pages[0] > 1 && (
          <>
            <PageButton page={1} current={page} onClick={onPageChange} />
            {pages[0] > 2 && <span className="px-2 text-gray-400">...</span>}
          </>
        )}

        {/* Páginas Centrales */}
        {pages.map((p) => (
          <PageButton key={p} page={p} current={page} onClick={onPageChange} />
        ))}

        {/* Última Página */}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="px-2 text-gray-400">...</span>
            )}
            <PageButton
              page={totalPages}
              current={page}
              onClick={onPageChange}
            />
          </>
        )}

        {/* Botón Siguiente */}
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className={`flex items-center justify-center p-2 rounded-lg border border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 ${
            page === totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
          aria-label="Página siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// Subcomponente de botón de número de página
function PageButton({
  page,
  current,
  onClick,
}: {
  page: number;
  current: number;
  onClick: (page: number) => void;
}) {
  const isActive = page === current;

  return (
    <button
      onClick={() => onClick(page)}
      className={`min-w-[36px] h-9 px-2 flex items-center justify-center text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
        isActive
          ? "bg-gray-900 text-white shadow-sm focus:ring-gray-900"
          : "text-gray-600 bg-transparent hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200"
      }`}
    >
      {page}
    </button>
  );
}