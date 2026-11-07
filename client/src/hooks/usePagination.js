import { useEffect, useMemo, useState } from 'react';

/**
 * Client-side pagination for lists already loaded in full (staff, report tables).
 * Resets to page 1 when `resetKey` changes (e.g. a filter or the report date).
 * Returns props for <Pagination> plus `pageItems` and `isVisible(index)`.
 */
export function usePagination(items, { pageSize: initialSize = 10, resetKey } = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialSize);
  const total = items?.length || 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => setPage(1), [resetKey, pageSize]);
  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  const start = (Math.min(page, pages) - 1) * pageSize;
  const pageItems = useMemo(() => (items || []).slice(start, start + pageSize), [items, start, pageSize]);

  return {
    pageItems,
    /** For tables that render every row (so print shows all) and hide off-page rows with .pg-hidden */
    isVisible: (i) => i >= start && i < start + pageSize,
    pagerProps: { page: Math.min(page, pages), pageSize, total, onPage: setPage, onPageSize: setPageSize },
  };
}
