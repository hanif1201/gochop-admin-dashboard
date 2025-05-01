import React from "react";
import PropTypes from "prop-types";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

/**
 * Reusable data table component with sorting and pagination
 */
const Table = ({
  columns,
  data,
  loading = false,
  onRowClick = null,
  emptyMessage = "No data available",
  className = "",
  pageSize = 10,
  sortable = true,
}) => {
  // Set up react-table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
    enableSorting: sortable,
  });

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white overflow-hidden ${className}`}>
        <div className='animate-pulse'>
          <div className='h-10 bg-gray-200 mb-4'></div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className='h-16 bg-gray-100 mb-2'></div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!data.length) {
    return (
      <div className={`bg-white rounded-lg overflow-hidden ${className}`}>
        <div className='py-8 text-center text-gray-500'>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg overflow-hidden ${className}`}>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {sortable && header.column.getIsSorted() && (
                      <span className='ml-2'>
                        {header.column.getIsSorted() === "desc" ? "↓" : "↑"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                onClick={() => onRowClick && onRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className='px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
          <div className='flex-1 flex justify-between sm:hidden'>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                !table.getCanPreviousPage()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                !table.getCanNextPage()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
          <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm text-gray-700'>
                Showing{" "}
                <span className='font-medium'>
                  {table.getState().pagination.pageIndex * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className='font-medium'>
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * pageSize,
                    data.length
                  )}
                </span>{" "}
                of <span className='font-medium'>{data.length}</span> results
              </p>
            </div>
            <div>
              <nav
                className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
                aria-label='Pagination'
              >
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                    !table.getCanPreviousPage()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span className='sr-only'>First</span>
                  <span aria-hidden='true'>&laquo;</span>
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                    !table.getCanPreviousPage()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span className='sr-only'>Previous</span>
                  <span aria-hidden='true'>&lsaquo;</span>
                </button>
                {/* Page numbers */}
                {Array.from(
                  { length: table.getPageCount() },
                  (_, index) => index
                ).map((pageIndex) => (
                  <button
                    key={pageIndex}
                    onClick={() => table.setPageIndex(pageIndex)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      pageIndex === table.getState().pagination.pageIndex
                        ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                        : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                    } text-sm font-medium`}
                  >
                    {pageIndex + 1}
                  </button>
                ))}
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                    !table.getCanNextPage()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span className='sr-only'>Next</span>
                  <span aria-hidden='true'>&rsaquo;</span>
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                    !table.getCanNextPage()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span className='sr-only'>Last</span>
                  <span aria-hidden='true'>&raquo;</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onRowClick: PropTypes.func,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
  pageSize: PropTypes.number,
  sortable: PropTypes.bool,
};

export default Table;
