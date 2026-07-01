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
  hasLotOptions,
  setInspectionForm,
  hasFilteredWorkOrders,
  filteredInspectionWorkOrders,
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
}) {
  return (
    <section className="content-grid domain-layout quality-layout">
      <article className="domain-banner domain-banner-quality">
        <div className="domain-banner-body">
          <div>
            <p className="domain-kicker">품질관리</p>
            <h2>검사 결과 입력과 불량 등록을 단계별로 나눠 관리하는 품질 운영 화면입니다.</h2>
          </div>
          <div className="domain-banner-metrics">
            <div className="domain-banner-metric">
                <span>검사</span>
              <strong>{dashboardData.inspections.length}</strong>
            </div>
            <div className="domain-banner-metric">
                <span>불량</span>
              <strong>{dashboardData.defects.length}</strong>
            </div>
            <div className="domain-banner-metric">
                <span>FAIL 기반 후보</span>
              <strong>{availableDefectInspections.length}</strong>
            </div>
          </div>
        </div>
      </article>

      <section className="domain-overview-grid">
        <article className="domain-overview-card accent">
          <p>검사 운영</p>
          <strong>{dashboardData.inspections.length}</strong>
          <span>PASS {inspectionPassCount} / FAIL {inspectionFailCount}</span>
        </article>
        <article className="domain-overview-card good">
          <p>검사 합격률</p>
          <strong>{formatPercent(inspectionPassRate)}</strong>
          <span>등급 A {gradeACount}건 / 전체 검사 대비 합격 비율</span>
        </article>
        <article className="domain-overview-card alert">
          <p>품질 이슈</p>
          <strong>{qualityIssueCount}</strong>
          <span>FAIL 검사 {inspectionFailCount} + 불량 등록 {dashboardData.defects.length}</span>
        </article>
        <article className="domain-overview-card">
          <p>불량 등록 준비</p>
          <strong>{availableDefectInspections.length}</strong>
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
            <p className="quality-mode-text">
              검사 결과를 먼저 등록한 뒤, FAIL 건은 불량 관리 탭에서 바로 이어서 등록할 수 있도록 흐름을 정리했습니다.
            </p>
          </div>

          <div className="quality-tab-row">
            <button
              className={`quality-tab-button ${qualityView === 'inspection' ? 'active' : ''}`}
              type="button"
              onClick={() => setQualityView('inspection')}
            >
              <span className="quality-tab-label">검사 관리</span>
              <span className="quality-tab-count">{dashboardData.inspections.length}건</span>
            </button>
            <button
              className={`quality-tab-button ${qualityView === 'defect' ? 'active' : ''}`}
              type="button"
              onClick={() => setQualityView('defect')}
            >
              <span className="quality-tab-label">불량 관리</span>
              <span className="quality-tab-count">{dashboardData.defects.length}건</span>
            </button>
          </div>
        </div>
      </article>

      {qualityView === 'inspection' ? (
        <>
          <div className="section-cluster section-cluster-form domain-section-stack">
          <div className="section-cluster-head">
              <p className="section-cluster-kicker">검사 입력</p>
              <h3>검사 결과를 입력하고 예상 판정과 등급을 먼저 확인한 뒤 저장할 수 있습니다.</h3>
            </div>

            <div className="domain-panel-grid quality-editor-grid">
              <article className="panel">
                <div className="panel-head">
                  <div>
                    <p className="panel-kicker">검사 관리</p>
                    <h2>{editingInspectionId ? '검사 수정' : '검사 등록'}</h2>
                  </div>
                </div>
                <form className="management-form" onSubmit={handleInspectionSubmit} noValidate>
                  <label>
                    <span>LOT</span>
                    <select value={inspectionForm.lotId} onChange={(event) => handleInspectionLotChange(event.target.value)} required>
                      {hasLotOptions ? <option value="">LOT 선택</option> : <option value="">LOT 데이터 없음</option>}
                      {dashboardData.lots.map((lot) => (
                        <option key={lot.id} value={lot.id}>{lot.lotNumber} / {lot.productName}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>작업지시</span>
                    <select value={inspectionForm.workOrderId} onChange={(event) => setInspectionForm((current) => ({ ...current, workOrderId: event.target.value }))}>
                      {inspectionForm.lotId && !hasFilteredWorkOrders ? <option value="">연결된 작업지시 없음</option> : <option value="">선택 안 함</option>}
                      {filteredInspectionWorkOrders.map((order) => (
                        <option key={order.id} value={order.id}>{order.woNumber} / {order.processType}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>검사 유형</span>
                    <select value={inspectionForm.processType} onChange={(event) => setInspectionForm((current) => ({ ...current, processType: event.target.value }))}>
                      <option value="IQC">{getInspectionTypeLabel('IQC')}</option>
                      <option value="IPQC">{getInspectionTypeLabel('IPQC')}</option>
                      <option value="OQC">{getInspectionTypeLabel('OQC')}</option>
                    </select>
                  </label>
                  <label>
                    <span>검사항목</span>
                    <input value={inspectionForm.inspectionItem} onChange={(event) => setInspectionForm((current) => ({ ...current, inspectionItem: event.target.value }))} placeholder="예: Open circuit voltage" required />
                  </label>
                  <label>
                    <span>최소 기준값</span>
                    <input type="number" step="0.0001" value={inspectionForm.specMin} onChange={(event) => setInspectionForm((current) => ({ ...current, specMin: event.target.value }))} placeholder="3.6000" />
                  </label>
                  <label>
                    <span>최대 기준값</span>
                    <input type="number" step="0.0001" value={inspectionForm.specMax} onChange={(event) => setInspectionForm((current) => ({ ...current, specMax: event.target.value }))} placeholder="4.2000" />
                  </label>
                  <label>
                    <span>측정값</span>
                    <input type="number" step="0.0001" value={inspectionForm.measuredValue} onChange={(event) => setInspectionForm((current) => ({ ...current, measuredValue: event.target.value }))} placeholder="3.9800" required />
                  </label>
                  <label>
                    <span>에이징 상태</span>
                    <select value={inspectionForm.agingStatus} onChange={(event) => setInspectionForm((current) => ({ ...current, agingStatus: event.target.value }))}>
                      <option value="PENDING">{getInspectionResultLabel('PENDING')}</option>
                      <option value="PASS">{getInspectionResultLabel('PASS')}</option>
                      <option value="FAIL">{getInspectionResultLabel('FAIL')}</option>
                    </select>
                  </label>
                  <label>
                    <span>비고</span>
                    <textarea value={inspectionForm.remarks} onChange={(event) => setInspectionForm((current) => ({ ...current, remarks: event.target.value }))} placeholder="선택 입력" />
                  </label>
                  {inspectionPreview?.invalid ? <p className="error-text">{inspectionPreview.message}</p> : null}
                  {inspectionPreview && !inspectionPreview.invalid ? (
                    <div className="status-summary-row inspection-preview-row">
                      <div className="status-summary-box">
                        <p>예상 판정</p>
                        <strong>{getInspectionResultLabel(inspectionPreview.result)}</strong>
                      </div>
                      <div className="status-summary-box">
                        <p>예상 등급</p>
                        <strong>{inspectionPreview.grade}</strong>
                      </div>
                    </div>
                  ) : null}
                  <p className="hint-text">프론트에서는 예상 PASS/FAIL과 등급을 먼저 보여주고, 최종 판정은 백엔드 저장 결과를 따릅니다.</p>
                  <div className="form-actions">
                    <button className="submit-button" type="submit" disabled={inspectionSaving || !hasLotOptions}>
                      {!hasLotOptions ? 'LOT 데이터 없음' : inspectionSaving ? '저장 중...' : editingInspectionId ? '검사 수정 저장' : '검사 등록'}
                    </button>
                    <button className="secondary-light-button" type="button" onClick={resetInspectionForm}>
                      초기화
                    </button>
                  </div>
                </form>
                {inspectionSaveSuccess ? <p className="success-text">{inspectionSaveSuccess}</p> : null}
                {inspectionSaveError ? <p className="error-text">{inspectionSaveError}</p> : null}
              </article>

              <article className="panel domain-note-panel">
                <div className="panel-head">
                  <div>
                    <p className="panel-kicker">검사 요약</p>
                    <h2>운영 포인트</h2>
                  </div>
                </div>
                <div className="domain-note-stack">
                  <div className="domain-note-card">
                    <strong>검사 요약</strong>
                    <p>{inspectionSnapshot || '검사 요약 데이터가 없습니다.'}</p>
                  </div>
                  <div className="domain-note-card">
                    <strong>불량 연계</strong>
                    <p>FAIL 판정이 나온 검사만 불량 등록 화면에서 선택할 수 있습니다.</p>
                  </div>
                  <div className="domain-note-card">
                    <strong>등급 관리</strong>
                    <p>A등급 {gradeACount}건이 누적되어 있습니다.</p>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div className="section-cluster section-cluster-list domain-section-stack">
            <div className="section-cluster-head">
              <p className="section-cluster-kicker">검사 이력</p>
              <h3>등록된 검사 목록을 보고 바로 수정 대상으로 연결할 수 있도록 테이블 중심으로 정리했습니다.</h3>
            </div>

            <article className="panel">
              <div className="panel-head">
                <div>
                  <p className="panel-kicker">검사 이력</p>
                  <h2>검사 목록</h2>
                </div>
                <div className="panel-head-actions">
                  <button
                    className="secondary-light-button"
                    type="button"
                    disabled={csvExporting}
                    onClick={handleExportCsv}
                  >
                    {csvExporting ? '내보내는 중...' : 'CSV 내보내기'}
                  </button>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>LOT</th>
                      <th>유형</th>
                      <th>항목</th>
                      <th>측정값</th>
                      <th>판정</th>
                      <th>등급</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.inspections.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-cell">등록된 검사 데이터가 없습니다.</td>
                      </tr>
                    ) : (
                      dashboardData.inspections.map((inspection) => (
                        <tr key={inspection.id}>
                          <td>{inspection.lotNumber ?? '-'}</td>
                          <td>{getInspectionTypeLabel(inspection.processType)}</td>
                          <td>{inspection.inspectionItem}</td>
                          <td>{formatInspectionMeasurement(inspection)}</td>
                          <td><span className={`mini-badge ${inspection.result}`}>{getInspectionResultLabel(inspection.result)}</span></td>
                          <td>{inspection.grade ?? '-'}</td>
                          <td>
                            <button className="table-action-button" type="button" onClick={() => startInspectionEdit(inspection)}>
                              수정
                            </button>
                            {auth?.role === 'ADMIN' ? (
                              <button
                                className="table-action-button danger"
                                type="button"
                                disabled={inspectionDeleting}
                                onClick={() => {
                                  if (window.confirm('이 검사 결과를 삭제하시겠습니까?')) {
                                    handleDeleteInspection(inspection.id)
                                  }
                                }}
                              >
                                삭제
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </>
      ) : null}

      {qualityView === 'defect' ? (
        <>
          <div className="section-cluster section-cluster-form domain-section-stack">
            <div className="section-cluster-head">
              <p className="section-cluster-kicker">불량 입력</p>
              <h3>FAIL 검사 기준으로 불량을 등록하고, 심각도와 유형을 함께 관리할 수 있게 구성했습니다.</h3>
            </div>

            <div className="domain-panel-grid quality-editor-grid">
              <article className="panel">
                <div className="panel-head">
                  <div>
                    <p className="panel-kicker">불량 관리</p>
                    <h2>{editingDefectId ? '불량 수정' : '불량 등록'}</h2>
                  </div>
                </div>
                <form className="management-form" onSubmit={handleDefectSubmit} noValidate>
                  <label>
                    <span>검사 이력</span>
                    <select value={defectForm.inspectionId} onChange={(event) => setDefectForm((current) => ({ ...current, inspectionId: event.target.value }))} required>
                      <option value="">검사 이력 선택</option>
                      {availableDefectInspections.map((inspection) => (
                        <option key={inspection.id} value={inspection.id}>{inspection.lotNumber ?? '-'} / {inspection.inspectionItem} / {getInspectionResultLabel(inspection.result)}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>불량 유형</span>
                    <select value={defectForm.defectCode} onChange={(event) => setDefectForm((current) => ({ ...current, defectCode: event.target.value }))} required>
                      <option value="">불량 유형 선택</option>
                      {dashboardData.defectTypes.map((defectType) => (
                        <option key={defectType.id} value={defectType.code}>{defectType.code} / {defectType.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>심각도</span>
                    <select value={defectForm.severity} onChange={(event) => setDefectForm((current) => ({ ...current, severity: event.target.value }))}>
                      <option value="CRITICAL">{getDefectSeverityLabel('CRITICAL')}</option>
                      <option value="MAJOR">{getDefectSeverityLabel('MAJOR')}</option>
                      <option value="MINOR">{getDefectSeverityLabel('MINOR')}</option>
                    </select>
                  </label>
                  <label>
                    <span>설명</span>
                    <textarea value={defectForm.description} onChange={(event) => setDefectForm((current) => ({ ...current, description: event.target.value }))} placeholder="불량 상세 내용을 입력해 주세요." />
                  </label>
                  {selectedDefectType ? <p className="hint-text">선택 유형: {selectedDefectType.name} / {selectedDefectType.category}</p> : null}
                  {selectedDefectInspection ? <p className="hint-text">선택 검사: {getInspectionResultLabel(selectedDefectInspection.result)} / {selectedDefectInspection.inspectionItem}</p> : null}
                  {availableDefectInspections.length === 0 ? <p className="hint-text">현재 등록 가능한 FAIL 검사가 없습니다.</p> : null}
                  {dashboardData.defectTypes.length === 0 ? <p className="hint-text">불량 유형 데이터가 없습니다. API 또는 DB 데이터를 확인해 주세요.</p> : null}
                  <div className="form-actions">
                    <button className="submit-button" type="submit" disabled={defectSaving}>
                      {defectSaving ? '저장 중...' : editingDefectId ? '불량 수정 저장' : '불량 등록'}
                    </button>
                    <button className="secondary-light-button" type="button" onClick={resetDefectForm}>
                      초기화
                    </button>
                  </div>
                </form>
                {defectSaveSuccess ? <p className="success-text">{defectSaveSuccess}</p> : null}
                {defectSaveError ? <p className="error-text">{defectSaveError}</p> : null}
              </article>

              <article className="panel domain-note-panel">
                <div className="panel-head">
                  <div>
                    <p className="panel-kicker">불량 요약</p>
                    <h2>등록 기준과 상태</h2>
                  </div>
                </div>
                <div className="domain-note-stack">
                  <div className="domain-note-card">
                    <strong>불량 요약</strong>
                    <p>{defectSnapshot || '불량 요약 데이터가 없습니다.'}</p>
                  </div>
                  <div className="domain-note-card">
                    <strong>등록 가능 검사</strong>
                    <p>현재 {availableDefectInspections.length}건의 FAIL 검사가 불량 등록 대상입니다.</p>
                  </div>
                  <div className="domain-note-card">
                    <strong>치명 불량</strong>
                    <p>치명 불량은 현재 {criticalDefectCount}건입니다.</p>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div className="section-cluster section-cluster-list domain-section-stack">
            <div className="section-cluster-head">
              <p className="section-cluster-kicker">불량 이력</p>
              <h3>등록된 불량 목록을 카드형으로 보고, 심각도 기준으로 빠르게 수정 대상을 선택할 수 있습니다.</h3>
            </div>

            <article className="panel">
              <div className="panel-head">
                <div>
                    <p className="panel-kicker">불량 이력</p>
                  <h2>불량 목록</h2>
                </div>
              </div>
              <div className="stack-list">
                {dashboardData.defects.length === 0 ? (
                  <div className="empty-state">등록된 불량 데이터가 없습니다.</div>
                ) : (
                  dashboardData.defects.map((defect) => (
                    <div className="stack-item" key={defect.id}>
                      <div>
                        <strong>{defect.defectCode}</strong>
                        <p>{defect.defectTypeName ?? defect.defectCategory ?? '유형 정보 없음'} / {defect.lotNumber ?? '-'}</p>
                      </div>
                      <div className="item-actions">
                        <span className={`mini-badge ${defect.severity}`}>{getDefectSeverityLabel(defect.severity)}</span>
                        <button className="table-action-button" type="button" onClick={() => startDefectEdit(defect)}>
                          수정
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>
        </>
      ) : null}

      {defectTrend.length > 0 ? (
        <div className="domain-panel-grid" style={{ gridColumn: 'span 12' }}>
          <article className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">불량 추이</p>
                <h2>최근 7일 불량 발생 현황</h2>
              </div>
            </div>
            <div className="stack-list compact">
              {defectTrend.map((day) => (
                <div className="stack-item" key={day.statDate}>
                  <div>
                    <strong>{day.statDate}</strong>
                    <p>
                      전체 {day.totalCount}건 — CRITICAL {day.criticalCount} / MAJOR {day.majorCount} / MINOR {day.minorCount}
                    </p>
                  </div>
                  <div className="item-actions">
                    <span className={`mini-badge ${day.criticalCount > 0 ? 'DOWN' : day.majorCount > 0 ? 'HOLD' : 'IDLE'}`}>
                      {day.totalCount === 0 ? '정상' : day.criticalCount > 0 ? 'CRITICAL' : day.majorCount > 0 ? 'MAJOR' : 'MINOR'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  )
}

export default QualityPage
