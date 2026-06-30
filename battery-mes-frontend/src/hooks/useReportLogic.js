import { useEffect, useState } from 'react'
import { fetchDailyQualityReportApi, fetchProductionReportApi } from '../lib/mesApi'

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export function useReportLogic(auth) {
  const [reportDate, setReportDate] = useState(getTodayDateString())
  const [dailyReport, setDailyReport] = useState(null)
  const [productionReport, setProductionReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')

  async function loadReports(date) {
    if (!auth?.accessToken) {
      return
    }

    setReportLoading(true)
    setReportError('')

    try {
      const [daily, production] = await Promise.all([
        fetchDailyQualityReportApi(date, auth.accessToken),
        fetchProductionReportApi(date, auth.accessToken),
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
    loadReports(reportDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.accessToken])

  function handleReportSearch(event) {
    event.preventDefault()
    loadReports(reportDate)
  }

  return {
    reportDate,
    setReportDate,
    dailyReport,
    productionReport,
    reportLoading,
    reportError,
    handleReportSearch,
  }
}
