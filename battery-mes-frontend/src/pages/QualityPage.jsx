import { useState, useEffect } from 'react'
import { usePagination } from '../hooks/usePagination'
import Pagination from '../components/common/Pagination'
import { DefectSeverityDonut, DefectCategoryChart, DefectTrendChart } from '../components/quality/DefectAnalysisCharts'

function QualityPage({
  auth,
  dashboardData,
  availableDefectInspections,
  inspectionPassCount,
  inspectionFailCount,
  formatPercent,
  inspectionPassRate,
  gradeACount,
  qualityIssueCount,
  qualityView,
  setQualityView,
  editingInspectionId,
  handleInspectionSubmit,
  inspectionForm,
  handleInspectionLotChange,
  handleInspectionWorkOrderChange,
  handleInspectionItemChange,
  hasLotOptions,
  setInspectionForm,
  hasFilteredWorkOrders,
  filteredInspectionWorkOrders,
  inspectionItemOptions,
  getInspectionTypeLabel,
  getInspectionResultLabel,
  inspectionPreview,
  inspectionSaving,
  resetInspectionForm,
  inspectionSaveSuccess,
  inspectionSaveError,
  inspectionSnapshot,
  formatInspectionMeasurement,
  startInspectionEdit,
  handleDeleteInspection,
  inspectionDeleting,
  handleExportCsv,
  csvExporting,
  editingDefectId,
  handleDefectSubmit,
  defectForm,
  setDefectForm,
  getDefectSeverityLabel,
  selectedDefectType,
  selectedDefectInspection,
  defectSaving,
  resetDefectForm,
  defectSaveSuccess,
  defectSaveError,
  defectSnapshot,
  criticalDefectCount,
  startDefectEdit,
  defectTrend,
  defectCauseResult,
  defectCauseLoading,
  defectCauseError,
  handleDefectCauseAnalysis,
  defectImageFile,
  defectImagePreview,
  defectImageResult,
  defectImageLoading,
  defectImageError,
  handleDefectImageChange,
  handleDefectImageAnalysis,
  clearDefectImage,
}) {
  const [openCategory, setOpenCategory] = useState(null)

  const toggle = (name) => setOpenCategory((prev) => (prev === name ? null : name))

  useEffect(() => { if (inspectionSaveSuccess) setOpenCategory(null) }, [inspectionSaveSuccess])
  useEffect(() => { if (defectSaveSuccess) setOpenCategory(null) }, [defectSaveSuccess])
  useEffect(() => {
    if (qualityView === 'defect' && defectForm.inspectionId) setOpenCategory('defect')
  }, [qualityView, defectForm.inspectionId])

  const inspectionsPage = usePagination(dashboardData.inspections)
  const defectsPage = usePagination(dashboardData.defects)
  const defectTrendPage = usePagination(defectTrend)

  return (
    <section className="content-grid domain-layout quality-layout">
      <article className="domain-banner domain-banner-quality">
        <div className="domain-banner-body">
          <div>
            <p className="domain-kicker">품질관리</p>
            <h2>품질관리</h2>
          </div>
          <div className="domain-banner-metrics">
            <div className="domain-banner-metric"><span>검사</span><strong>{dashboardData.inspections.length}</strong></div>
            <div className="domain-banner-metric"><span>불량</span><strong>{dashboardData.defects.length}</strong></div>
            <div className="domain-banner-metric"><span>FAIL 기반 후보</span><strong>{availableDefectInspections.length}</strong></div>
          </div>
        </div>
      </article>

      <section className="domain-overview-grid">
        <article className="domain-overview-card accent">
          <p>검사 운영</p><strong>{dashboardData.inspections.length}</strong>
          <span>PASS {inspectionPassCount} / FAIL {inspectionFailCount}</span>
        </article>
        <article className="domain-overview-card good">
          <p>검사 합격률</p><strong>{formatPercent(inspectionPassRate)}</strong>
          <span>등급 A {gradeACount}건 / 전체 검사 대비 합격 비율</span>
        </article>
        <article className="domain-overview-card alert">
          <p>품질 이슈</p><strong>{qualityIssueCount}</strong>
          <span>FAIL 검사 {inspectionFailCount} + 불량 등록 {dashboardData.defects.length}</span>
        </article>
        <article className="domain-overview-card">
          <p>불량 등록 준비</p><strong>{availableDefectInspections.length}</strong>
          <span>현재 불량 등록 가능한 FAIL 검사 건수</span>
        </article>
      </section>

      <article className="panel domain-mode-panel quality-mode-panel">
        <div className="quality-mode-layout">
          <div className="quality-mode-copy">
            <div className="panel-head compact-head">
              <div>
                <p className="panel-kicker">품질 작업 모드</p>
                <h2>{qualityView === 'inspection' ? '검사 관리 화면' : '불량 관리 화면'}</h2>
              </div>
            </div>
          </div>
          <div className="quality-tab-row">
            <button className={`quality-tab-button ${qualityView === 'inspection' ? 'active' : ''}`} type="button" onClick={() => setQualityView('inspection')}>
              <span className="quality-tab-label">검사 관리</span>
              <span className="quality-tab-count">{dashboardData.inspections.length}건</span>
            </button>
            <button className={`quality-tab-button ${qualityView === 'defect' ? 'active' : ''}`} type="button" onClick={() => setQualityView('defect')}>
              <span className="quality-tab-label">불량 관리</span>
              <span className="quality-tab-count">{dashboardData.defects.length}건</span>
            </button>
          </div>
        </div>
      </article>

      {qualityView === 'inspection' ? (
        <>
          {/* 입력 영역 — 아코디언 카테고리 */}
          <div className="section-cluster section-cluster-form domain-section-stack">
            <div className="section-cluster-head">
              <p className="section-cluster-kicker">입력 영역</p>
            </div>
            <article className="panel">
              <div className="panel-head">
                <div><p className="panel-kicker">등록 / 수정</p><h2>검사 입력</h2></div>
              </div>
              <div className="category-menu">
                <button className={`category-menu-item ${openCategory === 'inspection' ? 'active' : ''}`} type="button" onClick={() => { resetInspectionForm(); toggle('inspection') }}>
                  <span>검사 등록</span>
                  <span className="category-arrow">→</span>
                </button>
                {openCategory === 'inspection' && (
                  <div className="category-form-panel">
                    <form className="management-form" onSubmit={handleInspectionSubmit} noValidate>
                      <label>
                        <span>LOT</span>
                        <select value={inspectionForm.lotId} onChange={(e) => handleInspectionLotChange(e.target.value)} required>
                          {hasLotOptions ? <option value="">LOT 선택</option> : <option value="">LOT 데이터 없음</option>}
                          {dashboardData.lots.map((lot) => (<option key={lot.id} value={lot.id}>{lot.lotNumber} / {lot.productName}</option>))}
                        </select>
                      </label>
                      <label>
                        <span>작업지시</span>
                        <select value={inspectionForm.workOrderId} onChange={(e) => handleInspectionWorkOrderChange(e.target.value)}>
                          {inspectionForm.lotId && !hasFilteredWorkOrders ? <option value="">연결된 작업지시 없음</option> : <option value="">선택 안 함</option>}
                          {filteredInspectionWorkOrders.map((order) => (<option key={order.id} value={order.id}>{order.woNumber} / {order.processType}</option>))}
                        </select>
                      </label>
                      <label>
                        <span>검사 유형</span>
                        <select value={inspectionForm.processType} onChange={(e) => setInspectionForm((c) => ({ ...c, processType: e.target.value }))}>
                          <option value="IQC">{getInspectionTypeLabel('IQC')}</option>
                          <option value="IPQC">{getInspectionTypeLabel('IPQC')}</option>
                          <option value="OQC">{getInspectionTypeLabel('OQC')}</option>
                        </select>
                      </label>
                      <label>
                        <span>검사항목</span>
                        {inspectionItemOptions.length > 0 ? (
                          <select value={inspectionForm.inspectionItem} onChange={(e) => handleInspectionItemChange(e.target.value)} required>
                            <option value="">검사항목 선택</option>
                            {inspectionItemOptions.map((opt) => (<option key={opt.item} value={opt.item}>{opt.item}</option>))}
                          </select>
                        ) : (
                          <input value={inspectionForm.inspectionItem} onChange={(e) => setInspectionForm((c) => ({ ...c, inspectionItem: e.target.value }))} placeholder="작업지시 선택 시 항목이 자동으로 채워집니다" required />
                        )}
                      </label>
                      <label><span>최소 기준값</span><input type="number" step="0.0001" value={inspectionForm.specMin} onChange={(e) => setInspectionForm((c) => ({ ...c, specMin: e.target.value }))} placeholder="3.6000" /></label>
                      <label><span>최대 기준값</span><input type="number" step="0.0001" value={inspectionForm.specMax} onChange={(e) => setInspectionForm((c) => ({ ...c, specMax: e.target.value }))} placeholder="4.2000" /></label>
                      <label><span>측정값</span><input type="number" step="0.0001" value={inspectionForm.measuredValue} onChange={(e) => setInspectionForm((c) => ({ ...c, measuredValue: e.target.value }))} placeholder="3.9800" required /></label>
                      <label>
                        <span>에이징 상태</span>
                        <select value={inspectionForm.agingStatus} onChange={(e) => setInspectionForm((c) => ({ ...c, agingStatus: e.target.value }))}>
                          <option value="PENDING">{getInspectionResultLabel('PENDING')}</option>
                          <option value="PASS">{getInspectionResultLabel('PASS')}</option>
                          <option value="FAIL">{getInspectionResultLabel('FAIL')}</option>
                        </select>
                      </label>
                      <label><span>비고</span><textarea value={inspectionForm.remarks} onChange={(e) => setInspectionForm((c) => ({ ...c, remarks: e.target.value }))} placeholder="선택 입력" /></label>
                      {inspectionPreview?.invalid ? <p className="error-text">{inspectionPreview.message}</p> : null}
                      {inspectionPreview && !inspectionPreview.invalid ? (
                        <div className="status-summary-row inspection-preview-row">
                          <div className="status-summary-box"><p>예상 판정</p><strong>{getInspectionResultLabel(inspectionPreview.result)}</strong></div>
                          <div className="status-summary-box"><p>예상 등급</p><strong>{inspectionPreview.grade}</strong></div>
                        </div>
                      ) : null}
                      <div className="form-actions">
                        <button className="submit-button" type="submit" disabled={inspectionSaving || !hasLotOptions}>
                          {!hasLotOptions ? 'LOT 데이터 없음' : inspectionSaving ? '저장 중...' : editingInspectionId ? '검사 수정 저장' : '검사 등록'}
                        </button>
                        <button className="secondary-light-button" type="button" onClick={resetInspectionForm}>초기화</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </article>
          </div>

          <div className="section-cluster section-cluster-list domain-section-stack">
            <div className="section-cluster-head">
              <p className="section-cluster-kicker">검사 이력</p>
            </div>
            <article className="panel">
              <div className="panel-head">
                <div><p className="panel-kicker">검사 이력</p><h2>검사 목록</h2></div>
                <div className="panel-head-actions">
                  <button className="secondary-light-button" type="button" disabled={csvExporting} onClick={handleExportCsv}>{csvExporting ? '내보내는 중...' : 'CSV 내보내기'}</button>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>LOT</th><th>유형</th><th>항목</th><th>측정값</th><th>판정</th><th>등급</th><th>작업</th></tr></thead>
                  <tbody>
                    {dashboardData.inspections.length === 0 ? (
                      <tr><td colSpan="7" className="empty-cell">등록된 검사 데이터가 없습니다.</td></tr>
                    ) : (
                      inspectionsPage.paged.map((inspection) => (
                        <tr key={inspection.id}>
                          <td>{inspection.lotNumber ?? '-'}</td>
                          <td>{getInspectionTypeLabel(inspection.processType)}</td>
                          <td>{inspection.inspectionItem}</td>
                          <td>{formatInspectionMeasurement(inspection)}</td>
                          <td><span className={`mini-badge ${inspection.result}`}>{getInspectionResultLabel(inspection.result)}</span></td>
                          <td>{inspection.grade ?? '-'}</td>
                          <td>
                            <button className="table-action-button" type="button" onClick={() => { startInspectionEdit(inspection); setOpenCategory('inspection') }}>수정</button>
                            {auth?.role === 'ADMIN' ? (
                              <button className="table-action-button danger" type="button" disabled={inspectionDeleting} onClick={() => { if (window.confirm('이 검사 결과를 삭제하시겠습니까?')) { handleDeleteInspection(inspection.id) } }}>삭제</button>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination page={inspectionsPage.page} totalPages={inspectionsPage.totalPages} onPageChange={inspectionsPage.setPage} />
            </article>

            {defectTrend.length > 0 ? (
              <article className="panel">
                <div className="panel-head">
                  <div><p className="panel-kicker">불량 추이</p><h2>최근 7일 불량 발생 현황</h2></div>
                </div>
                <div className="stack-list compact">
                  {defectTrendPage.paged.map((day) => (
                    <div className="stack-item" key={day.statDate}>
                      <div>
                        <strong>{day.statDate}</strong>
                        <p>전체 {day.totalCount}건 — CRITICAL {day.criticalCount} / MAJOR {day.majorCount} / MINOR {day.minorCount}</p>
                      </div>
                      <div className="item-actions">
                        <span className={`mini-badge ${day.criticalCount > 0 ? 'DOWN' : day.majorCount > 0 ? 'HOLD' : 'IDLE'}`}>
                          {day.totalCount === 0 ? '정상' : day.criticalCount > 0 ? 'CRITICAL' : day.majorCount > 0 ? 'MAJOR' : 'MINOR'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination page={defectTrendPage.page} totalPages={defectTrendPage.totalPages} onPageChange={defectTrendPage.setPage} />
              </article>
            ) : null}
          </div>
        </>
      ) : null}

      {qualityView === 'defect' ? (
        <>
          {/* 입력 영역 — 아코디언 카테고리 */}
          <div className="section-cluster section-cluster-form domain-section-stack">
            <div className="section-cluster-head">
              <p className="section-cluster-kicker">입력 영역</p>
            </div>
            <article className="panel">
              <div className="panel-head">
                <div><p className="panel-kicker">등록 / 수정</p><h2>불량 입력</h2></div>
              </div>
              <div className="category-menu">
                <button className={`category-menu-item ${openCategory === 'defect' ? 'active' : ''}`} type="button" onClick={() => { if (openCategory === 'defect') resetDefectForm(); toggle('defect') }}>
                  <span>불량 등록</span>
                  <span className="category-arrow">→</span>
                </button>
                {openCategory === 'defect' && (
                  <div className="category-form-panel">
                    <form className="management-form" onSubmit={handleDefectSubmit} noValidate>
                      <label>
                        <span>검사 이력</span>
                        <select value={defectForm.inspectionId} onChange={(e) => setDefectForm((c) => ({ ...c, inspectionId: e.target.value }))} required>
                          <option value="">검사 이력 선택</option>
                          {availableDefectInspections.map((inspection) => (<option key={inspection.id} value={inspection.id}>{inspection.lotNumber ?? '-'} / {inspection.inspectionItem} / {getInspectionResultLabel(inspection.result)}</option>))}
                        </select>
                      </label>
                      <label>
                        <span>불량 유형</span>
                        <select value={defectForm.defectCode} onChange={(e) => setDefectForm((c) => ({ ...c, defectCode: e.target.value }))} required>
                          <option value="">불량 유형 선택</option>
                          {dashboardData.defectTypes.map((dt) => (<option key={dt.id} value={dt.code}>{dt.code} / {dt.name}</option>))}
                        </select>
                      </label>
                      <label>
                        <span>심각도</span>
                        <select value={defectForm.severity} onChange={(e) => setDefectForm((c) => ({ ...c, severity: e.target.value }))}>
                          <option value="CRITICAL">{getDefectSeverityLabel('CRITICAL')}</option>
                          <option value="MAJOR">{getDefectSeverityLabel('MAJOR')}</option>
                          <option value="MINOR">{getDefectSeverityLabel('MINOR')}</option>
                        </select>
                      </label>
                      {/* VLM 이미지 분석 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>이미지 첨부 (선택)</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label style={{ cursor: 'pointer', padding: '8px 14px', border: '1px dashed var(--border)', borderRadius: '6px', fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>
                            {defectImageFile ? defectImageFile.name : '📷 클릭하여 이미지 선택 (jpg/png/webp · 최대 5MB)'}
                            <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleDefectImageChange} />
                          </label>
                          {defectImagePreview ? (
                            <button type="button" onClick={clearDefectImage} style={{ fontSize: '11px', padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕ 제거</button>
                          ) : null}
                          <button
                            type="button"
                            className="table-action-button"
                            onClick={handleDefectImageAnalysis}
                            disabled={!defectImagePreview || defectImageLoading}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {defectImageLoading ? '분석 중...' : 'AI 이미지 분석'}
                          </button>
                        </div>
                        {defectImagePreview ? (
                          <img src={defectImagePreview} alt="미리보기" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} />
                        ) : null}
                        {defectImageError ? <p className="error-text">{defectImageError}</p> : null}
                      </div>
                      <label>
                        <span>설명</span>
                        <textarea value={defectForm.description} onChange={(e) => setDefectForm((c) => ({ ...c, description: e.target.value }))} placeholder="불량 상세 내용을 입력해 주세요. (AI 이미지 분석 시 자동 입력)" />
                      </label>
                      {selectedDefectType ? <p className="hint-text">선택 유형: {selectedDefectType.name} / {selectedDefectType.category}</p> : null}
                      {selectedDefectInspection ? <p className="hint-text">선택 검사: {getInspectionResultLabel(selectedDefectInspection.result)} / {selectedDefectInspection.inspectionItem}</p> : null}
                      {availableDefectInspections.length === 0 ? <p className="hint-text">현재 등록 가능한 FAIL 검사가 없습니다.</p> : null}
                      {dashboardData.defectTypes.length === 0 ? <p className="hint-text">불량 유형 데이터가 없습니다. API 또는 DB 데이터를 확인해 주세요.</p> : null}
                      <div className="form-actions">
                        <button className="submit-button" type="submit" disabled={defectSaving}>{defectSaving ? '저장 중...' : editingDefectId ? '불량 수정 저장' : '불량 등록'}</button>
                        <button className="secondary-light-button" type="button" onClick={resetDefectForm}>초기화</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </article>
          </div>

          {/* 불량 분석 차트 */}
          {dashboardData.defects.length > 0 || defectTrend.length > 0 ? (
            <div className="domain-panel-grid" style={{ gridColumn: 'span 12' }}>
              <article className="panel">
                <div className="panel-head">
                  <div>
                    <p className="panel-kicker">심각도 분포</p>
                    <h2>불량 심각도 비율</h2>
                  </div>
                </div>
                <DefectSeverityDonut defects={dashboardData.defects} />
              </article>

              <article className="panel">
                <div className="panel-head">
                  <div>
                    <p className="panel-kicker">카테고리 분석</p>
                    <h2>공정별 불량 건수</h2>
                  </div>
                </div>
                <DefectCategoryChart defects={dashboardData.defects} />
              </article>

              <article className="panel" style={{ gridColumn: 'span 2' }}>
                <div className="panel-head">
                  <div>
                    <p className="panel-kicker">불량 추이</p>
                    <h2>최근 7일 불량 발생 현황</h2>
                  </div>
                </div>
                <DefectTrendChart defectTrend={defectTrend} />
              </article>
            </div>
          ) : null}

          <div className="section-cluster section-cluster-list domain-section-stack">
            <div className="section-cluster-head">
              <p className="section-cluster-kicker">불량 이력</p>
            </div>
            <article className="panel">
              <div className="panel-head">
                <div><p className="panel-kicker">불량 이력</p><h2>불량 목록</h2></div>
              </div>
              <div className="stack-list">
                {dashboardData.defects.length === 0 ? (
                  <div className="empty-state">등록된 불량 데이터가 없습니다.</div>
                ) : (
                  defectsPage.paged.map((defect) => (
                    <div key={defect.id}>
                      <div className="stack-item">
                        <div>
                          <strong>{defect.defectCode}</strong>
                          <p>{defect.defectTypeName ?? defect.defectCategory ?? '유형 정보 없음'} / {defect.lotNumber ?? '-'}</p>
                        </div>
                        <div className="item-actions">
                          <span className={`mini-badge ${defect.severity}`}>{getDefectSeverityLabel(defect.severity)}</span>
                          <button
                            className="table-action-button"
                            type="button"
                            onClick={() => handleDefectCauseAnalysis(defect)}
                            disabled={defectCauseLoading}
                            title="AI 원인 분석"
                          >
                            {defectCauseLoading && defectCauseResult?.defectId !== defect.id ? 'AI 분석 중...' : 'AI 분석'}
                          </button>
                          <button className="table-action-button" type="button" onClick={() => { startDefectEdit(defect); setOpenCategory('defect') }}>수정</button>
                        </div>
                      </div>
                      {defectCauseResult?.defectId === defect.id ? (
                        <div style={{ padding: '10px 14px 12px', background: 'var(--surface-2, #f8f9fa)', borderTop: '1px solid var(--border)', fontSize: '13px', lineHeight: 1.75, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                          <strong style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>AI 원인 분석</strong>
                          {defectCauseResult.analysis}
                        </div>
                      ) : null}
                      {defectCauseError && defectCauseResult?.defectId === defect.id ? (
                        <p className="error-text" style={{ padding: '6px 14px' }}>{defectCauseError}</p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
              <Pagination page={defectsPage.page} totalPages={defectsPage.totalPages} onPageChange={defectsPage.setPage} />
            </article>
          </div>
        </>
      ) : null}
    </section>
  )
}

export default QualityPage
