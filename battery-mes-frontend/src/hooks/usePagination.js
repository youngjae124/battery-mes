import { useState, useMemo, useEffect } from 'react'

const PAGE_SIZE = 5

export function usePagination(data) {
  const [page, setPage] = useState(1)
  const len = data?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(len / PAGE_SIZE))

  useEffect(() => { setPage(1) }, [len])

  const safePage = Math.min(page, totalPages)
  const paged = useMemo(
    () => (data ?? []).slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [data, safePage]
  )

  return { page: safePage, setPage, totalPages, paged }
}
