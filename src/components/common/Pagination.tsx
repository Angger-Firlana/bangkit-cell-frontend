import React from 'react';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, lastPage, onPageChange }) => {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl px-6 py-4">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
        Page {currentPage} of {lastPage}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
        >
          Prev
        </button>
        <button
          onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
          disabled={currentPage === lastPage}
          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
