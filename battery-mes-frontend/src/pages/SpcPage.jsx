import { useState, useEffect } from 'react'
import { usePagination } from '../hooks/usePagination'
import Pagination from '../components/common/Pagination'

function SpcPage({
  filteredSpcRows,
  filteredSpcOutOfControlCount,
  parsedSpcSampleValues,
  formatNumber,
  spcPreview,
  handleSpcSubmit,
  spcForm,
  setSpcForm,
  hasSpcLotOptions,
  spcSaving,
  dashboardData,
  filteredSpcWorkOrders,
  getProcessStepLabel,
  resetSpcForm,
  spcSaveSuccess,
  spcSaveError,
  spcFilters,
  setSpcFilters,
  filteredSpcSearchWorkOrders,
  filteredSpcParameterSummary,
  resetSpcFilters,
  formatDateTimeDisplay,
  isSpcOutOfControl,
  safeNumber,
  capabilityPreview,
  handleCalculateCapability,
  getCapabilityRatingLabel,
  spcChartData,
  spcChartLoading,
  spcChartError,
  handleFetchSpcChart,
}) {
  const [openCategory, setOpenCategory] = useState(null)

  const toggle = (name) => setOpenCategory((prev) => (prev === name ? null : name))

  useEffect(() => { if (spcSaveSuccess) setOpenCategory(null) }, [spcSaveSuccess])

  const spcRowsPage = usePagination(filteredSpcRows)
  const chartDataPage = usePagination(spcChartData)

  return (
    <section className="content-grid domain-layout">
      <article className="domain-banner">
        <div className="domain-banner-body">
          <div>
            <p className="domain-kicker">SPC</p>
            <h2>SPC</h2>
          </div>
          <div className="domain-banner-metrics">
            <div className="domain-banner-metric">
              <span>SPC 건수</span>
              <strong>{filteredSpcRows.length}</strong>
            </div>
            <div className="domain-banner-metric">
              <span>관리 한계 이탈</span>
              <strong>{filteredSpcOutOfControlCount}</strong>
            </div>
            <div className="domain-banner-metric">
              <span>입력 샘플값 개수</span>
              <strong>{parsedSpcSampleValues.length}</strong>
            </div>
          </div>
        </div>
      </article>

      <section className="domain-overview-grid">
        <article className="domain-overview-card accent">
          <p>등록된 SPC</p>
          <strong>{filteredSpcRows.length}</strong>
          <span>현재 조회된 공정 통계 데이터 수</span>
        </article>
        <article className="domain-overview-card">
          <p>최근 공정 평균 X-bar</p>
          <strong>{spcPreview.xBar === null ? '-' : formatNumber(spcPreview.xBar)}</strong>
          <span>입력한 샘플값 평균</span>
        </article>
        <article className="domain-overview-card">
          <p>최근 공정 범위 Range</p>
          <strong>{spcPreview.rangeValue === null ? '-' : formatNumber(spcPreview.rangeValue)}</strong>
          <span>입력한 샘플값 최대-최소</span>
        </article>
        <article className="domain-overview-card alert">
          <p>관리 한계 이탈 건수</p>
          <strong>{filteredSpcOutOfControlCount}</strong>
          <span>UCL/LCL 기준 이탈 건수</span>
        </article>
      </section>

      {/* 입력 영역 — 아코디언 카테고리 */}
      <div className="section-cluster section-cluster-form domain-section-stack">
        <div className="section-cluster-head">
          <p className="section-cluster-kicker">입력 영역</p>
        </div>
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">등록 / 수정</p>
              <h2>SPC 입력</h2>
            </div>
          </div>
          <div className="category-menu">
            <button className={`category-menu-item ${openCategory === 'spc' ? 'active' : ''}`} type="button" onClick={() => { resetSpcForm(); toggle('spc') }}>
              <span>SPC 데이터 등록</span>
              <span className="category-arrow">→</span>
            </button>
            {openCategory === 'spc' && (
              <div className="category-form-panel">
                <form className="management-form" onSubmit={handleSpcSubmit}>
                  <label>
                    <span>LOT</span>
                    <select
                      value={spcForm.lotId}
                      onChange={(e) => {
                        const nextLotId = e.target.value
                        setSpcForm((c) => ({ ...c, lotId: nextLotId, workOrderId: c.lotId === nextLotId ? c.workOrderId : '' }))
                      }}
                      disabled={!hasSpcLotOptions || spcSaving}
                    >
                      <option value="">{hasSpcLotOptions ? 'LOT 선택' : 'LOT 데이터 없음'}</option>
                      {dashboardData.lots.map((lot) => (
                        <option key={lot.id} value={lot.id}>{lot.lotNumber} / {lot.productName}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>작업지시</span>
                    <select value={spcForm.workOrderId} onChange={(e) => setSpcForm((c) => ({ ...c, workOrderId: e.target.value }))} disabled={spcSaving}>
                      <option value="">{filteredSpcWorkOrders.length > 0 ? '선택 안 함' : '연결된 작업지시 없음'}</option>
                      {filteredSpcWorkOrders.map((order) => (
                        <option key={order.id} value={order.id}>{order.woNumber} / {getProcessStepLabel(order.processType)}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>파라미터명</span>
                    <input value={spcForm.parameterName} onChange={(e) => setSpcForm((c) => ({ ...c, parameterName: e.target.value }))} placeholder="예: OCV, Thickness, Temperature" disabled={spcSaving} />
                  </label>

                  <label>
                    <span>서브그룹 번호</span>
                    <input type="number" min="1" value={spcForm.subgroupNo} onChange={(e) => setSpcForm((c) => ({ ...c, subgroupNo: e.target.value }))} disabled={spcSaving} />
                  </label>

                  <label>
                    <span>샘플값 목록</span>
                    <textarea rows="4" value={spcForm.sampleValues} onChange={(e) => setSpcForm((c) => ({ ...c, sampleValues: e.target.value }))} placeholder="쉼표 또는 줄바꿈으로 구분하세요. 예: 3.71, 3.74, 3.69, 3.72" disabled={spcSaving} />
                  </label>

                  <label>
                    <span>UCL</span>
                    <input value={spcForm.ucl} onChange={(e) => setSpcForm((c) => ({ ...c, ucl: e.target.value }))} placeholder="선택 입력" disabled={spcSaving} />
                  </label>

                  <label>
                    <span>CL</span>
                    <input value={spcForm.cl} onChange={(e) => setSpcForm((c) => ({ ...c, cl: e.target.value }))} placeholder="선택 입력" disabled={spcSaving} />
                  </label>

                  <label>
                    <span>LCL</span>
                    <input value={spcForm.lcl} onChange={(e) => setSpcForm((c) => ({ ...c, lcl: e.target.value }))} placeholder="선택 입력" disabled={spcSaving} />
                  </label>

                  <label>
                    <span>USL (규격 상한)</span>
                    <input value={spcForm.usl} onChange={(e) => setSpcForm((c) => ({ ...c, usl: e.target.value }))} placeholder="Cp/Cpk 계산 시 입력" disabled={spcSaving} />
                  </label>

                  <label>
                    <span>LSL (규격 하한)</span>
                    <input value={spcForm.lsl} onChange={(e) => setSpcForm((c) => ({ ...c, lsl: e.target.value }))} placeholder="Cp/Cpk 계산 시 입력" disabled={spcSaving} />
                  </label>

                  <div className="auth-summary">
                    <div>
                      <span>샘플 개수</span>
                      <strong>{parsedSpcSampleValues.length}</strong>
                    </div>
                    <div>
                      <span>X-bar</span>
                      <strong>{spcPreview.xBar === null ? '-' : formatNumber(spcPreview.xBar)}</strong>
                    </div>
                    <div>
                      <span>Range</span>
                      <strong>{spcPreview.rangeValue === null ? '-' : formatNumber(spcPreview.rangeValue)}</strong>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="secondary-button" type="button" onClick={handleCalculateCapability} disabled={spcSaving || capabilityPreview.loading}>
                      {capabilityPreview.loading ? 'Cp/Cpk 계산 중...' : 'Cp/Cpk 미리보기'}
                    </button>
                  </div>

                  {capabilityPreview.error ? <p className="error-text">{capabilityPreview.error}</p> : null}
                  {!capabilityPreview.error && (capabilityPreview.cp !== null || capabilityPreview.cpk !== null) ? (
                    <div className="auth-summary">
                      <div>
                        <span>Cp</span>
                        <strong>{capabilityPreview.cp === null ? '-' : formatNumber(capabilityPreview.cp)}</strong>
                      </div>
                      <div>
                        <span>Cpk</span>
                        <strong>{capabilityPreview.cpk === null ? '-' : formatNumber(capabilityPreview.cpk)}</strong>
                      </div>
                      <div>
                        <span>공정능력 등급</span>
                        <strong>{getCapabilityRatingLabel(capabilityPreview.cpk)}</strong>
                      </div>
                    </div>
                  ) : null}

                  <div className="form-actions">
                    <button className="submit-button" type="submit" disabled={spcSaving}>
                      {spcSaving ? '저장 중...' : 'SPC 등록'}
                    </button>
                    <button className="secondary-button" type="button" onClick={resetSpcForm} disabled={spcSaving}>초기화</button>
                  </div>
                </form>
                {spcSaveSuccess ? <p className="success-text">{spcSaveSuccess}</p> : null}
                {spcSaveError ? <p className="error-text">{spcSaveError}</p> : null}
              </div>
            )}
          </div>
        </article>
      </div>

      {/* 조회 영역 */}
      <div className="section-cluster section-cluster-list domain-section-stack">
        <div className="section-cluster-head">
          <p className="section-cluster-kicker">조회 영역</p>
        </div>

        {/* 필터 — 풀너비 */}
        <article className="panel">
          <div className="panel-head">
            <div><p className="panel-kicker">필터</p><h2>SPC 조회 조건</h2></div>
            <div className="panel-head-actions">
              <button className="secondary-light-button" type="button" onClick={resetSpcFilters}>필터 초기화</button>
            </div>
          </div>
          <form className="login-form">
            <label>
              <span>LOT 필터</span>
              <select
                value={spcFilters.lotId}
                onChange={(event) => {
                  const nextLotId = event.target.value
                  setSpcFilters((current) => ({
                    ...current,
                    lotId: nextLotId,
                    workOrderId: current.lotId === nextLotId ? current.workOrderId : '',
                  }))
                }}
              >
                <option value="">전체 LOT</option>
                {dashboardData.lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>{lot.lotNumber} / {lot.productName}</option>
                ))}
              </select>
            </label>
            <label>
              <span>작업지시 필터</span>
              <select
                value={spcFilters.workOrderId}
                onChange={(event) => setSpcFilters((current) => ({ ...current, workOrderId: event.target.value }))}
              >
                <option value="">전체 작업지시</option>
                {filteredSpcSearchWorkOrders.map((order) => (
                  <option key={order.id} value={order.id}>{order.woNumber} / {getProcessStepLabel(order.processType)}</option>
                ))}
              </select>
            </label>
            <label>
              <span>파라미터명 필터</span>
              <input
                value={spcFilters.parameterName}
                onChange={(event) => setSpcFilters((current) => ({ ...current, parameterName: event.target.value }))}
                placeholder="OCV, Thickness, Temperature"
              />
            </label>
            <label>
              <span>상태 필터</span>
              <select
                value={spcFilters.status}
                onChange={(event) => setSpcFilters((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="ALL">전체</option>
                <option value="NORMAL">정상</option>
                <option value="OUT_OF_CONTROL">이탈</option>
              </select>
            </label>
            <div className="auth-summary">
              <div><span>조회 건수</span><strong>{filteredSpcRows.length}</strong></div>
              <div><span>이탈 건수</span><strong>{filteredSpcOutOfControlCount}</strong></div>
              <div><span>파라미터 요약</span><strong>{filteredSpcParameterSummary || '-'}</strong></div>
            </div>
          </form>
        </article>

        {/* SPC 목록 + 관리도 — 풀너비 세로 */}
        <div>
          <article className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">SPC 목록</p>
                <h2>최근 SPC 데이터</h2>
              </div>
            </div>

            <div className="stack-list compact">
              {filteredSpcRows.length === 0 ? (
                <div className="empty-state">등록된 SPC 데이터가 없습니다.</div>
              ) : (
                spcRowsPage.paged.map((row) => (
                  <div className="stack-item" key={row.id}>
                    <div>
                      <strong>{row.parameterName}</strong>
                      <p>{row.lotNumber ?? '-'} / {row.woNumber ?? '작업지시 없음'}</p>
                      <p>Subgroup {row.subgroupNo} / X-bar {row.xBar ?? '-'} / Range {row.rangeValue ?? '-'}</p>
                      <p>Cp {row.cp ?? '-'} / Cpk {row.cpk ?? '-'} ({getCapabilityRatingLabel(row.cpk)})</p>
                      <p>{formatDateTimeDisplay(row.measuredAt)}</p>
                    </div>
                    <div className="item-actions">
                      <span className={`mini-badge ${isSpcOutOfControl(row) ? 'DOWN' : 'IDLE'}`}>
                        {row.ucl !== null && row.xBar !== null && safeNumber(row.xBar) > safeNumber(row.ucl)
                          ? '상한 이탈'
                          : row.lcl !== null && row.xBar !== null && safeNumber(row.xBar) < safeNumber(row.lcl)
                            ? '하한 이탈'
                            : '정상'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Pagination page={spcRowsPage.page} totalPages={spcRowsPage.totalPages} onPageChange={spcRowsPage.setPage} />
          </article>

          <article className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">X-bar / R 관리도</p>
                <h2>관리도 데이터 조회</h2>
              </div>
              <div className="panel-head-actions">
                <button className="secondary-light-button" type="button" disabled={spcChartLoading} onClick={handleFetchSpcChart}>
                  {spcChartLoading ? '조회 중...' : '관리도 조회'}
                </button>
              </div>
            </div>

            {spcChartError ? <p className="error-text">{spcChartError}</p> : null}

            {spcChartData.length === 0 ? (
              <div className="empty-state">조회된 관리도 데이터가 없습니다.</div>
            ) : (
              <div className="stack-list compact">
                {chartDataPage.paged.map((point) => {
                  const xBarNum = safeNumber(point.xBar)
                  const uclNum = point.ucl !== null && point.ucl !== undefined ? safeNumber(point.ucl) : null
                  const lclNum = point.lcl !== null && point.lcl !== undefined ? safeNumber(point.lcl) : null
                  const outOfControl = (uclNum !== null && xBarNum > uclNum) || (lclNum !== null && xBarNum < lclNum)
                  return (
                    <div className="stack-item" key={point.id}>
                      <div>
                        <strong>Subgroup {point.subgroupNo} — {point.parameterName}</strong>
                        <p>{point.lotNumber ?? '-'} / {point.woNumber ?? '작업지시 없음'}</p>
                        <p>
                          X-bar {point.xBar ?? '-'} / Range {point.rangeValue ?? '-'}
                          {point.ucl != null ? ` | UCL ${point.ucl}` : ''}
                          {point.cl != null ? ` / CL ${point.cl}` : ''}
                          {point.lcl != null ? ` / LCL ${point.lcl}` : ''}
                        </p>
                        <p>{point.measuredAt ?? '-'}</p>
                      </div>
                      <div className="item-actions">
                        <span className={`mini-badge ${outOfControl ? 'DOWN' : 'IDLE'}`}>
                          {outOfControl
                            ? (uclNum !== null && xBarNum > uclNum ? '상한 이탈' : '하한 이탈')
                            : '정상'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <Pagination page={chartDataPage.page} totalPages={chartDataPage.totalPages} onPageChange={chartDataPage.setPage} />
          </article>
        </div>
      </div>
    </section>
  )
}

export default SpcPage
