import { useEffect, useState } from 'react'
import { fetchDailyQualityReportApi, fetchProductionReportApi } from '../lib/mesApi'
import { exportExcel, exportPdf } from '../lib/reportExport'

function getDateString(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  return d.toISOString().slice(0, 10)
}

export function useReportLogic(auth) {
  const [startDate, setStartDate] = useState(getDateString(6))
  const [endDate, setEndDate] = useState(getDateString(0))
  const [dailyReport, setDailyReport] = useState(null)
  const [productionReport, setProductionReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')

  async function loadReports(start, end) {
    if (!auth?.accessToken) {
      return
    }

    setReportLoading(true)
    setReportError('')

    try {
      const [daily, production] = await Promise.all([
        fetchDailyQualityReportApi(start, end, auth.accessToken),
        fetchProductionReportApi(start, end, auth.accessToken),
      ])
      setDailyReport(daily)
      setProductionReport(production)
    } catch (error) {
      setReportError(error.message || '보고서를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setReportLoading(false)
    }
  }

  useEffect(() => {
    loadReports(startDate, endDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.accessToken])

  function handleReportSearch(event) {
    event.preventDefault()
    loadReports(startDate, endDate)
  }

  function handleExportExcel() {
    if (!dailyReport || !productionReport) return
    exportExcel(startDate, endDate, dailyReport, productionReport)
  }

  function handleExportPdf() {
    if (!dailyReport || !productionReport) return
    exportPdf(startDate, endDate, dailyReport, productionReport)
  }

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    dailyReport,
    productionReport,
    reportLoading,
    reportError,
    handleReportSearch,
    handleExportExcel,
    handleExportPdf,
  }
}
