function EquipmentPage({
  dashboardData,
  runningEquipmentCount,
  downEquipmentCount,
  idleEquipmentCount,
  editingEquipmentId,
  selectedEquipmentSummary,
  equipmentStatusSummary,
  backendState,
  handleEquipmentSubmit,
  equipmentForm,
  setEquipmentForm,
  getEquipmentStatusLabel,
  getEquipmentLogTypeLabel,
  equipmentSaving,
  resetEquipmentForm,
  equipmentSaveSuccess,
  equipmentSaveError,
  editingProcessParamId,
  handleProcessParamSubmit,
  processParamForm,
  setProcessParamForm,
  processParamSaving,
  resetProcessParamForm,
  processParamSaveSuccess,
  processParamSaveError,
  selectedEquipmentLogs,
  formatDateTimeDisplay,
  selectedProcessParams,
  startProcessParamEdit,
  startEquipmentEdit,
}) {
  return (
    <section className="content-grid domain-layout">
      <article className="domain-banner domain-banner-equipment">
        <div className="domain-banner-body">
          <div>
            <p className="domain-kicker">설비관리</p>
            <h2>설비관리</h2>
          </div>
          <div className="domain-banner-metrics">
            <div className="domain-banner-metric">
              <span>전체 설비</span>
              <strong>{dashboardData.equipment.length}</strong>
            </div>
            <div className="domain-banner-metric">
              <span>가동 설비</span>
              <strong>{runningEquipmentCount}</strong>
            </div>
            <div className="domain-banner-metric">
              <span>다운 설비</span>
              <strong>{downEquipmentCount}</strong>
            </div>
          </div>
        </div>
      </article>

      <section className="domain-overview-grid">
        <article className="domain-overview-card accent">
          <p>설비 운영</p>
          <strong>{dashboardData.equipment.length}</strong>
          <span>가동 {runningEquipmentCount} / 대기 {idleEquipmentCount} / 다운 {downEquipmentCount}</span>
        </article>
        <article className="domain-overview-card">
          <p>선택 설비</p>
          <strong>{editingEquipmentId ? '선택됨' : '미선택'}</strong>
          <span>{selectedEquipmentSummary}</span>
        </article>
        <article className="domain-overview-card">
          <p>설비 상태 요약</p>
          <strong>{equipmentStatusSummary || '데이터 없음'}</strong>
          <span>설비 운영 상태 요약</span>
        </article>
        <article className="domain-overview-card good">
          <p>백엔드 연동</p>
          <strong>{backendState.status === 'connected' ? '정상' : '연동 확인 필요'}</strong>
          <span>API 연동 상태</span>
        </article>
      </section>

      <div className="section-cluster section-cluster-form domain-section-stack">
        <div className="section-cluster-head">
          <p className="section-cluster-kicker">입력 영역</p>
        </div>

        <div className="domain-panel-grid">
          <article className="panel panel-accent">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">설비 관리</p>
                <h2>{editingEquipmentId ? '설비 수정' : '설비 선택'}</h2>
              </div>
            </div>
            <form className="management-form" onSubmit={handleEquipmentSubmit}>
              <label>
                <span>설비 코드</span>
                <input value={equipmentForm.eqCode} readOnly placeholder="목록에서 설비를 먼저 선택해 주세요." />
              </label>
              <label>
                <span>설비명</span>
                <input value={equipmentForm.eqName} onChange={(event) => setEquipmentForm((current) => ({ ...current, eqName: event.target.value }))} required />
              </label>
              <label>
                <span>설비 유형</span>
                <input value={equipmentForm.eqType} onChange={(event) => setEquipmentForm((current) => ({ ...current, eqType: event.target.value }))} required />
              </label>
              <label>
                <span>상태</span>
                <select value={equipmentForm.status} onChange={(event) => setEquipmentForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="RUNNING">{getEquipmentStatusLabel('RUNNING')}</option>
                  <option value="IDLE">{getEquipmentStatusLabel('IDLE')}</option>
                  <option value="DOWN">{getEquipmentStatusLabel('DOWN')}</option>
                  <option value="PM">{getEquipmentStatusLabel('PM')}</option>
                </select>
              </label>
              <label>
                <span>최종 PM 일시</span>
                <input type="datetime-local" value={equipmentForm.lastPmAt} onChange={(event) => setEquipmentForm((current) => ({ ...current, lastPmAt: event.target.value }))} />
              </label>
              <label>
                <span>로그 유형</span>
                <select value={equipmentForm.logType} onChange={(event) => setEquipmentForm((current) => ({ ...current, logType: event.target.value }))}>
                  <option value="ALERT">{getEquipmentLogTypeLabel('ALERT')}</option>
                  <option value="BREAKDOWN">{getEquipmentLogTypeLabel('BREAKDOWN')}</option>
                  <option value="PM">{getEquipmentLogTypeLabel('PM')}</option>
                </select>
              </label>
              <label>
                <span>로그 설명</span>
                <textarea value={equipmentForm.logDescription} onChange={(event) => setEquipmentForm((current) => ({ ...current, logDescription: event.target.value }))} placeholder="현재 설비 상태 변경에 대한 로그 설명을 입력해 주세요." />
              </label>
              <div className="form-actions">
                <button className="submit-button" type="submit" disabled={equipmentSaving || !editingEquipmentId}>
                  {equipmentSaving ? '저장 중...' : '설비 수정'}
                </button>
                <button className="secondary-light-button" type="button" onClick={resetEquipmentForm}>
                  초기화
                </button>
              </div>
            </form>
            {equipmentSaveSuccess ? <p className="success-text">{equipmentSaveSuccess}</p> : null}
            {equipmentSaveError ? <p className="error-text">{equipmentSaveError}</p> : null}
          </article>

          <article className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">공정 파라미터 기록</p>
                <h2>{editingProcessParamId ? '파라미터 수정' : '파라미터 등록'}</h2>
              </div>
            </div>
            <form className="management-form" onSubmit={handleProcessParamSubmit}>
              <label>
                <span>작업지시</span>
                <select
                  value={processParamForm.workOrderId}
                  onChange={(event) => setProcessParamForm((current) => ({ ...current, workOrderId: event.target.value }))}
                  required
                >
                  <option value="">작업지시 선택</option>
                  {dashboardData.workOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.woNumber} / {order.processType}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>파라미터명</span>
                <input
                  value={processParamForm.paramName}
                  onChange={(event) => setProcessParamForm((current) => ({ ...current, paramName: event.target.value }))}
                  placeholder="Temperature"
                  required
                />
              </label>
              <label>
                <span>목표값</span>
                <input
                  type="number"
                  step="0.0001"
                  value={processParamForm.targetValue}
                  onChange={(event) => setProcessParamForm((current) => ({ ...current, targetValue: event.target.value }))}
                />
              </label>
              <label>
                <span>실측값</span>
                <input
                  type="number"
                  step="0.0001"
                  value={processParamForm.actualValue}
                  onChange={(event) => setProcessParamForm((current) => ({ ...current, actualValue: event.target.value }))}
                  required
                />
              </label>
              <label>
                <span>단위</span>
                <input
                  value={processParamForm.unit}
                  onChange={(event) => setProcessParamForm((current) => ({ ...current, unit: event.target.value }))}
                  placeholder="V / A / degC"
                  required
                />
              </label>
              <label>
                <span>상한값</span>
                <input
                  type="number"
                  step="0.0001"
                  value={processParamForm.upperLimit}
                  onChange={(event) => setProcessParamForm((current) => ({ ...current, upperLimit: event.target.value }))}
                />
              </label>
              <label>
                <span>하한값</span>
                <input
                  type="number"
                  step="0.0001"
                  value={processParamForm.lowerLimit}
                  onChange={(event) => setProcessParamForm((current) => ({ ...current, lowerLimit: event.target.value }))}
                />
              </label>
              <label>
                <span>측정 일시</span>
                <input
                  type="datetime-local"
                  value={processParamForm.measuredAt}
                  onChange={(event) => setProcessParamForm((current) => ({ ...current, measuredAt: event.target.value }))}
                />
              </label>
              <div className="form-actions">
                <button className="submit-button" type="submit" disabled={processParamSaving}>
                  {processParamSaving ? '저장 중...' : editingProcessParamId ? '파라미터 수정' : '파라미터 등록'}
                </button>
                <button className="secondary-light-button" type="button" onClick={resetProcessParamForm}>
                  초기화
                </button>
              </div>
            </form>
            {processParamSaveSuccess ? <p className="success-text">{processParamSaveSuccess}</p> : null}
            {processParamSaveError ? <p className="error-text">{processParamSaveError}</p> : null}
          </article>

          <article className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">설비 로그 목록</p>
                <h2>설비 로그 요약</h2>
              </div>
            </div>
            <div className="stack-list compact">
              {selectedEquipmentLogs.length === 0 ? (
                <div className="empty-state">선택한 설비의 로그가 아직 없습니다.</div>
              ) : (
                selectedEquipmentLogs.slice(0, 6).map((log) => (
                  <div className="stack-item" key={log.id}>
                    <div>
                      <strong>{getEquipmentLogTypeLabel(log.logType)}</strong>
                      <p>{log.description}</p>
                      <p>{formatDateTimeDisplay(log.occurredAt)}</p>
                    </div>
                    <div className="item-actions">
                      <span className="mini-badge IDLE">{log.reportedByName ?? '-'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">공정 파라미터 이력</p>
                <h2>최근 측정 파라미터</h2>
              </div>
            </div>
            <div className="stack-list compact">
              {selectedProcessParams.length === 0 ? (
                <div className="empty-state">선택한 파라미터 이력이 아직 없습니다.</div>
              ) : (
                selectedProcessParams.slice(0, 6).map((processParam) => (
                  <div className="stack-item" key={processParam.id}>
                    <div>
                      <strong>{processParam.paramName}</strong>
                      <p>
                        실측 {processParam.actualValue} {processParam.unit}
                        {processParam.targetValue !== null && processParam.targetValue !== undefined
                          ? ` / 목표 ${processParam.targetValue}`
                          : ''}
                      </p>
                      <p>{formatDateTimeDisplay(processParam.measuredAt)}</p>
                    </div>
                    <div className="item-actions">
                      <button className="table-action-button" type="button" onClick={() => startProcessParamEdit(processParam)}>
                        수정
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

        </div>
      </div>

      <div className="section-cluster section-cluster-list domain-section-stack">
        <div className="section-cluster-head">
          <p className="section-cluster-kicker">조회 영역</p>
        </div>

        <div className="domain-panel-grid">
          <article className="panel panel-accent">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">설비 목록</p>
                <h2>설비 현황</h2>
              </div>
            </div>
            <div className="stack-list compact">
              {dashboardData.equipment.length === 0 ? (
                <div className="empty-state">등록된 설비 데이터가 없습니다.</div>
              ) : (
                dashboardData.equipment.map((equipment) => (
                  <div className="stack-item" key={equipment.id}>
                    <div>
                      <strong>{equipment.eqCode}</strong>
                      <p>{equipment.eqName} / {equipment.eqType}</p>
                    </div>
                    <div className="item-actions">
                      <span className={`mini-badge ${equipment.status}`}>{getEquipmentStatusLabel(equipment.status)}</span>
                      <button className="table-action-button" type="button" onClick={() => startEquipmentEdit(equipment)}>
                        수정
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="panel domain-note-panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">설비 상태 요약</p>
                <h2>운영 포인트</h2>
              </div>
            </div>
            <div className="domain-note-stack">
              <div className="domain-note-card">
                <strong>가동 설비</strong>
                <p>{runningEquipmentCount}대가 RUNNING 상태입니다.</p>
              </div>
              <div className="domain-note-card">
                <strong>대기 설비</strong>
                <p>{idleEquipmentCount}대가 IDLE 상태로 대기 중입니다.</p>
              </div>
              <div className="domain-note-card">
                <strong>정비/다운 설비</strong>
                <p>{downEquipmentCount}대가 PM 또는 DOWN 상태로 관리 중입니다.</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default EquipmentPage
