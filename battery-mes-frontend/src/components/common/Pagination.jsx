function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="pagination">
      <button className="pagination-btn" type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1}>이전</button>
      <span className="pagination-info">{page} / {totalPages}</span>
      <button className="pagination-btn" type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>다음</button>
    </div>
  )
}

export default Pagination
