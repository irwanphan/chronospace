interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  className = ""
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 0) return null;

  return (
    <div className={`flex justify-center gap-2 mt-4 ${className}`}>
      {getPageNumbers().map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`px-3 py-1 rounded ${
            currentPage === pageNum 
              ? 'bg-blue-50 text-medium text-blue-600 border border-blue-600' 
              : 'hover:bg-gray-50'
          }`}
        >
          {pageNum}
        </button>
      ))}
    </div>
  );
} 