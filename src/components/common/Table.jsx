import React from "react";
import PropTypes from "prop-types";
import { useTable, useSortBy, usePagination } from "react-table";

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
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize },
      disableSortBy: !sortable,
    },
    useSortBy,
    usePagination
  );

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
        <table
          {...getTableProps()}
          className='min-w-full divide-y divide-gray-200'
        >
          <thead className='bg-gray-50'>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(
                      sortable && column.getSortByToggleProps()
                    )}
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    {column.render("Header")}
                    {sortable && column.isSorted && (
                      <span className='ml-2'>
                        {column.isSortedDesc ? "↓" : "↑"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            {...getTableBodyProps()}
            className='bg-white divide-y divide-gray-200'
          >
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  className={
                    onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
                  }
                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className='px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
          <div className='flex-1 flex justify-between sm:hidden'>
            <button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                !canPreviousPage
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                !canNextPage
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
                  {page.length > 0 ? pageIndex * pageSize + 1 : 0}
                </span>{" "}
                to{" "}
                <span className='font-medium'>
                  {Math.min((pageIndex + 1) * pageSize, data.length)}
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
                  onClick={() => gotoPage(0)}
                  disabled={!canPreviousPage}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                    !canPreviousPage
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span className='sr-only'>First</span>
                  <span aria-hidden='true'>&laquo;</span>
                </button>
                <button
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                    !canPreviousPage
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span className='sr-only'>Previous</span>
                  <span aria-hidden='true'>&lsaquo;</span>
                </button>
                {pageOptions.length <= 5 ? (
                  // Show all page numbers if we have 5 or fewer
                  pageOptions.map((page) => (
                    <button
                      key={page}
                      onClick={() => gotoPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        page === pageIndex
                          ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                          : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                      } text-sm font-medium`}
                    >
                      {page + 1}
                    </button>
                  ))
                ) : (
                  // Show limited page numbers with ellipsis
                  <>
                    {/* Always show first page */}
                    <button
                      onClick={() => gotoPage(0)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        pageIndex === 0
                          ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                          : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                      } text-sm font-medium`}
                    >
                      1
                    </button>

                    {/* Show ellipsis if not on pages 0-2 */}
                    {pageIndex >= 3 && (
                      <span className='relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700'>
                        ...
                      </span>
                    )}

                    {/* Current page and adjacent */}
                    {pageIndex > 0 && pageIndex < pageCount - 1 && (
                      <button
                        onClick={() => gotoPage(pageIndex)}
                        className='relative inline-flex items-center px-4 py-2 border z-10 bg-primary-50 border-primary-500 text-primary-600 text-sm font-medium'
                      >
                        {pageIndex + 1}
                      </button>
                    )}

                    {/* Show ellipsis if not on last 3 pages */}
                    {pageIndex <= pageCount - 4 && (
                      <span className='relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700'>
                        ...
                      </span>
                    )}

                    {/* Always show last page */}
                    <button
                      onClick={() => gotoPage(pageCount - 1)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        pageIndex === pageCount - 1
                          ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                          : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                      } text-sm font-medium`}
                    >
                      {pageCount}
                    </button>
                  </>
                )}
                <button
                  onClick={() => nextPage()}
                  disabled={!canNextPage}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                    !canNextPage
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span className='sr-only'>Next</span>
                  <span aria-hidden='true'>&rsaquo;</span>
                </button>
                <button
                  onClick={() => gotoPage(pageCount - 1)}
                  disabled={!canNextPage}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                    !canNextPage
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
