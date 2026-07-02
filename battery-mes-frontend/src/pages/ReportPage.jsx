function ReportPage({
  reportDate,
  setReportDate,
  handleReportSearch,
  reportLoading,
  reportError,
  dailyReport,
  productionReport,
  formatNumber,
  formatPercentValue,
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
              <h2>날짜 선택</h2>
            </div>
          </div>

          <form className="login-form" onSubmit={handleReportSearch}>
            <label>
              <span>조회 날짜</span>
              <input
                type="date"
                value={reportDate}
                onChange={(event) => setReportDate(event.target.value)}
                disabled={reportLoading}
              />
            </label>

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
