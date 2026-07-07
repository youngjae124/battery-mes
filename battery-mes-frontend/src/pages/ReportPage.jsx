import { QualityDonutChart, DefectSeverityChart, ProcessAchievementChart } from '../components/report/ReportCharts'

function ReportPage({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleReportSearch,
  reportLoading,
  reportError,
  dailyReport,
  productionReport,
  formatNumber,
  formatPercentValue,
  handleExportExcel,
  handleExportPdf,
}) {
  return (
    <section className="content-grid domain-layout">
      <article className="domain-banner">
        <div className="domain-banner-body">
          <div>
            <p className="domain-kicker">보고서</p>
            <h2>보고서</h2>
          </div>
        </div>
      </article>

      <div className="domain-panel-grid" style={{ gridColumn: 'span 12' }}>
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">조회 조건</p>
              <h2>기간 선택</h2>
            </div>
            {dailyReport && productionReport ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={handleExportExcel}
                  title="Excel 내보내기"
                >
                  Excel
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={handleExportPdf}
                  title="PDF 내보내기"
                >
                  PDF
                </button>
              </div>
            ) : null}
          </div>

          <form className="login-form" onSubmit={handleReportSearch}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <label style={{ flex: 1 }}>
                <span>시작일</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  disabled={reportLoading}
                />
              </label>
              <label style={{ flex: 1 }}>
                <span>종료일</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  disabled={reportLoading}
                />
              </label>
            </div>

            <div className="form-actions">
              <button className="submit-button" type="submit" disabled={reportLoading}>
                {reportLoading ? '조회 중...' : '조회'}
              </button>
            </div>
          </form>

          {reportError ? <p className="error-text">{reportError}</p> : null}
        </article>
      </div>

      <section className="domain-overview-grid">
        <article className="domain-overview-card accent">
          <p>검사 건수</p>
          <strong>{dailyReport ? formatNumber(dailyReport.totalInspections) : '-'}</strong>
          <span>PASS {dailyReport?.passCount ?? 0} / FAIL {dailyReport?.failCount ?? 0}</span>
        </article>
        <article className="domain-overview-card good">
          <p>합격률</p>
          <strong>{dailyReport ? formatPercentValue(dailyReport.passRate) : '-'}</strong>
          <span>등급 A {dailyReport?.gradeACount ?? 0} / B {dailyReport?.gradeBCount ?? 0} / C {dailyReport?.gradeCCount ?? 0}</span>
        </article>
        <article className="domain-overview-card alert">
          <p>불량 건수</p>
          <strong>{dailyReport ? formatNumber(dailyReport.totalDefects) : '-'}</strong>
          <span>CRITICAL {dailyReport?.criticalDefectCount ?? 0} / MAJOR {dailyReport?.majorDefectCount ?? 0} / MINOR {dailyReport?.minorDefectCount ?? 0}</span>
        </article>
        <article className="domain-overview-card">
          <p>생산 달성률</p>
          <strong>{productionReport ? formatPercentValue(productionReport.achievementRate) : '-'}</strong>
          <span>목표 {formatNumber(productionReport?.totalTargetQty ?? 0)} / 실적 {formatNumber(productionReport?.totalActualQty ?? 0)}</span>
        </article>
      </section>

      {dailyReport && productionReport ? (
        <div className="domain-panel-grid" style={{ gridColumn: 'span 12' }}>
          <article className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">품질 분석</p>
                <h2>합격 / 불합격 비율</h2>
              </div>
            </div>
            <QualityDonutChart dailyReport={dailyReport} />
          </article>

          <article className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">불량 분석</p>
                <h2>불량 심각도 분포</h2>
              </div>
            </div>
            <DefectSeverityChart dailyReport={dailyReport} />
          </article>

          <article className="panel" style={{ gridColumn: 'span 2' }}>
            <div className="panel-head">
              <div>
                <p className="panel-kicker">생산 분석</p>
                <h2>공정별 목표 vs 실적</h2>
              </div>
            </div>
            <ProcessAchievementChart productionReport={productionReport} />
          </article>
        </div>
      ) : null}

      <div className="domain-panel-grid" style={{ gridColumn: 'span 12' }}>
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">생산 실적</p>
              <h2>작업지시 현황</h2>
            </div>
          </div>

          <div className="auth-summary">
            <div>
              <span>전체 작업지시</span>
              <strong>{productionReport ? formatNumber(productionReport.totalWorkOrders) : '-'}</strong>
            </div>
            <div>
              <span>계획</span>
              <strong>{productionReport?.plannedCount ?? '-'}</strong>
            </div>
            <div>
              <span>진행중</span>
              <strong>{productionReport?.runningCount ?? '-'}</strong>
            </div>
            <div>
              <span>완료</span>
              <strong>{productionReport?.doneCount ?? '-'}</strong>
            </div>
            <div>
              <span>보류</span>
              <strong>{productionReport?.holdCount ?? '-'}</strong>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">공정별 실적</p>
              <h2>공정별 생산 실적</h2>
            </div>
          </div>

          <div className="stack-list compact">
            {!productionReport || productionReport.processBreakdown.length === 0 ? (
              <div className="empty-state">조회된 생산 실적이 없습니다.</div>
            ) : (
              productionReport.processBreakdown.map((process) => (
                <div className="stack-item" key={process.processType}>
                  <div>
                    <strong>{process.processType}</strong>
                    <p>작업지시 {process.orderCount}건 / 완료 {process.doneCount}건</p>
                    <p>목표 {formatNumber(process.targetQty)} / 실적 {formatNumber(process.actualQty)} / 달성률 {formatPercentValue(process.achievementRate)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  )
}

export default ReportPage
