import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className="px-4 py-2 rounded-xl border border-borderline bg-white text-navy font-semibold hover:bg-softblue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {getPageNumbers().map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          disabled={loading}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            pageNum === currentPage
              ? "bg-royal text-white"
              : "bg-white text-navy border border-borderline hover:bg-softblue"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {pageNum}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className="px-4 py-2 rounded-xl border border-borderline bg-white text-navy font-semibold hover:bg-softblue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
