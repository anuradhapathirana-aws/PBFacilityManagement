// Pagination bar used under every data table.
// Works for server-side (pass total from API) and client-side (see hooks/usePagination.js) paging.

export const PAGE_SIZES = [10, 25, 50, 100];

/** Page numbers with gaps: 1 … 4 5 [6] 7 8 … 20 */
function pageList(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => set.add(p));
  if (page >= pages - 2) [pages - 3, pages - 2, pages - 1].forEach((p) => set.add(p));
  const sorted = [...set].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push('gap-' + p);
    out.push(p);
  });
  return out;
}

export default function Pagination({ page, pageSize, total, onPage, onPageSize, pageSizes = PAGE_SIZES, label = 'rows' }) {
  if (!total) return null;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <nav className="pager no-print" aria-label="Pagination">
      <span className="pager-info">
        Showing {from}–{to} of {total} {label}
      </span>

      {pages > 1 && (
        <div className="pager-pages">
          <button type="button" className="pager-btn" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
            ‹
          </button>
          {pageList(page, pages).map((p) =>
            typeof p === 'string' ? (
              <span key={p} className="pager-gap">
                …
              </span>
            ) : (
              <button
                type="button"
                key={p}
                className={`pager-btn ${p === page ? 'active' : ''}`}
                aria-current={p === page ? 'page' : undefined}
                onClick={() => onPage(p)}
              >
                {p}
              </button>
            )
          )}
          <button type="button" className="pager-btn" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
            ›
          </button>
        </div>
      )}

      {onPageSize && (
        <label className="pager-size">
          Rows per page
          <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
            {pageSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      )}
    </nav>
  );
}
