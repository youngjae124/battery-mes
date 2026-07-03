import { useState, useEffect } from 'react'
import { usePagination } from '../hooks/usePagination'
import Pagination from '../components/common/Pagination'

function ProductionPage({
  dashboardData,
  processReadyCount,
  PROCESS_STEPS,
  inProgressLotCount,
  completedLotCount,
  holdLotCount,
  formatNumber,
  totalLotQuantity,
  runningWorkOrderCount,
  completedWorkOrderCount,
  plannedWorkOrderCount,
  formatPercent,
  productionAchievementRate,
  totalActualQuantity,
  totalTargetQuantity,
  completedProcessCodes,
  getWorkOrderStatusLabel,
  editingLotId,
  handleLotSubmit,
  lotForm,
  setLotForm,
  getLotStatusLabel,
  lotSaving,
  resetLotForm,
  lotSaveSuccess,
  lotSaveError,
  editingWorkOrderId,
  handleWorkOrderSubmit,
  workOrderForm,
  setWorkOrderForm,
  hasLotOptions,
  ASSIGNMENT_ROLE_OPTIONS,
  workOrderSaving,
  resetWorkOrderForm,
  workOrderSaveSuccess,
  workOrderSaveError,
  editingAssignmentId,
  handleAssignmentSubmit,
  assignmentForm,
  setAssignmentForm,
  availableAssignmentUsers,
  getUserRoleLabel,
  getAssignmentRoleLabel,
  assignmentSaving,
  resetAssignmentForm,
  assignmentSaveSuccess,
  assignmentSaveError,
  startLotEdit,
  startWorkOrderEdit,
  formatDateTimeDisplay,
  startAssignmentEdit,
}) {
  const [openCategory, setOpenCategory] = useState(null)

  const toggle = (name) => setOpenCategory((prev) => (prev === name ? null : name))

  useEffect(() => { if (lotSaveSuccess) setOpenCategory(null) }, [lotSaveSuccess])
  useEffect(() => { if (workOrderSaveSuccess) setOpenCategory(null) }, [workOrderSaveSuccess])
  useEffect(() => { if (assignmentSaveSuccess) setOpenCategory(null) }, [assignmentSaveSuccess])

  const lotsPage = usePagination(dashboardData.lots)
  const workOrdersPage = usePagination(dashboardData.workOrders)
  const assignmentsPage = usePagination(dashboardData.assignments)

  return (
    <section className="content-grid domain-layout">
      <article className="domain-banner domain-banner-production">
        <div className="domain-banner-body">
          <div>
            <h2>생산관리</h2>
          </div>
          <div className="domain-banner-metrics">
            <div className="domain-banner-metric">
              <span>LOT</span>
              <strong>{dashboardData.lots.length}</strong>
            </div>
            <div className="domain-banner-metric">
              <span>작업지시</span>
              <strong>{dashboardData.workOrders.length}</strong>
            </div>
            <div className="domain-banner-metric">
              <span>공정 준비</span>
              <strong>{processReadyCount} / {PROCESS_STEPS.length}</strong>
            </div>
          </div>
        </div>
      </article>

      <section className="domain-overview-grid">
        <article className="domain-overview-card accent">
          <p>LOT 수</p>
          <strong>{dashboardData.lots.length}</strong>
          <span>진행중 {inProgressLotCount} / 완료 {completedLotCount} / 보류 {holdLotCount}</span>
        </article>
        <article className="domain-overview-card">
          <p>총 수량</p>
          <strong>{formatNumber(totalLotQuantity)}</strong>
          <span>LOT 기준 누적 수량</span>
        </article>
        <article className="domain-overview-card">
          <p>작업지시 진행</p>
          <strong>{runningWorkOrderCount} / {dashboardData.workOrders.length}</strong>
          <span>진행중 {runningWorkOrderCount} / 완료 {completedWorkOrderCount} / 계획 {plannedWorkOrderCount}</span>
        </article>
        <article className="domain-overview-card good">
          <p>생산 달성률</p>
          <strong>{formatPercent(productionAchievementRate)}</strong>
          <span>실적 {formatNumber(totalActualQuantity)} / 목표 {formatNumber(totalTargetQuantity)}</span>
        </article>
      </section>

      <article className="panel panel-wide domain-process-panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">공정 흐름</p>
            <h2>공정 흐름</h2>
          </div>
          <span className="chip">운영 흐름</span>
        </div>
        <div className="process-flow">
          {PROCESS_STEPS.map((step) => {
            const done = completedProcessCodes.has(step.code)
            return (
              <div className="process-step" key={step.code}>
                <div className="step-header">
                  <strong>{step.label}</strong>
                  <span className={`mini-badge ${done ? 'DONE' : 'PLANNED'}`}>{done ? getWorkOrderStatusLabel('DONE') : getWorkOrderStatusLabel('PLANNED')}</span>
                </div>
              </div>
            )
          })}
        </div>
      </article>

      {/* 입력 영역 — 아코디언 카테고리 */}
      <div className="section-cluster section-cluster-form domain-section-stack">
        <div className="section-cluster-head">
          <p className="section-cluster-kicker">입력 영역</p>
        </div>
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">등록 / 수정</p>
              <h2>생산관리 입력</h2>
            </div>
          </div>
          <div className="category-menu">
            <button className={`category-menu-item ${openCategory === 'lot' ? 'active' : ''}`} type="button" onClick={() => { resetLotForm(); toggle('lot') }}>
              <span>LOT 등록</span>
              <span className="category-arrow">→</span>
            </button>
            {openCategory === 'lot' && (
              <div className="category-form-panel">
                <form className="management-form" onSubmit={handleLotSubmit}>
                  <label><span>LOT 번호</span><input value={lotForm.lotNumber} onChange={(e) => setLotForm((c) => ({ ...c, lotNumber: e.target.value }))} placeholder="LOT-20260422-001" required /></label>
                  <label><span>제품명</span><input value={lotForm.productName} onChange={(e) => setLotForm((c) => ({ ...c, productName: e.target.value }))} placeholder="21700 CELL - NCM" required /></label>
                  <label><span>수량</span><input type="number" min="1" value={lotForm.quantity} onChange={(e) => setLotForm((c) => ({ ...c, quantity: e.target.value }))} required /></label>
                  <label>
                    <span>상태</span>
                    <select value={lotForm.status} onChange={(e) => setLotForm((c) => ({ ...c, status: e.target.value }))}>
                      <option value="IN_PROGRESS">{getLotStatusLabel('IN_PROGRESS')}</option>
                      <option value="COMPLETED">{getLotStatusLabel('COMPLETED')}</option>
                      <option value="HOLD">{getLotStatusLabel('HOLD')}</option>
                    </select>
                  </label>
                  <div className="form-actions">
                    <button className="submit-button" type="submit" disabled={lotSaving}>{lotSaving ? '저장 중...' : editingLotId ? 'LOT 수정' : 'LOT 등록'}</button>
                    <button className="secondary-light-button" type="button" onClick={resetLotForm}>초기화</button>
                  </div>
                </form>
                {lotSaveSuccess ? <p className="success-text">{lotSaveSuccess}</p> : null}
                {lotSaveError ? <p className="error-text">{lotSaveError}</p> : null}
              </div>
            )}

            <button className={`category-menu-item ${openCategory === 'workOrder' ? 'active' : ''}`} type="button" onClick={() => { resetWorkOrderForm(); toggle('workOrder') }}>
              <span>작업지시 등록</span>
              <span className="category-arrow">→</span>
            </button>
            {openCategory === 'workOrder' && (
              <div className="category-form-panel">
                <form className="management-form" onSubmit={handleWorkOrderSubmit}>
                  <label><span>작업지시 번호</span><input value={workOrderForm.woNumber} onChange={(e) => setWorkOrderForm((c) => ({ ...c, woNumber: e.target.value }))} placeholder="WO-ACT-001" required /></label>
                  <label>
                    <span>LOT</span>
                    <select value={workOrderForm.lotId} onChange={(e) => setWorkOrderForm((c) => ({ ...c, lotId: e.target.value }))} required>
                      {hasLotOptions ? <option value="">LOT 선택</option> : <option value="">LOT 데이터 없음</option>}
                      {dashboardData.lots.map((lot) => (<option key={lot.id} value={lot.id}>{lot.lotNumber} / {lot.productName}</option>))}
                    </select>
                  </label>
                  <label>
                    <span>설비</span>
                    <select value={workOrderForm.equipmentId} onChange={(e) => setWorkOrderForm((c) => ({ ...c, equipmentId: e.target.value }))} required>
                      <option value="">설비 선택</option>
                      {dashboardData.equipment.map((eq) => (<option key={eq.id} value={eq.id}>{eq.eqCode} / {eq.eqName}</option>))}
                    </select>
                  </label>
                  <label>
                    <span>공정</span>
                    <select value={workOrderForm.processType} onChange={(e) => setWorkOrderForm((c) => ({ ...c, processType: e.target.value }))}>
                      {PROCESS_STEPS.map((step) => (<option key={step.code} value={step.sourceValue}>{step.label}</option>))}
                    </select>
                  </label>
                  <label>
                    <span>상태</span>
                    <select value={workOrderForm.status} onChange={(e) => setWorkOrderForm((c) => ({ ...c, status: e.target.value }))}>
                      <option value="PLANNED">{getWorkOrderStatusLabel('PLANNED')}</option>
                      <option value="RUNNING">{getWorkOrderStatusLabel('RUNNING')}</option>
                      <option value="DONE">{getWorkOrderStatusLabel('DONE')}</option>
                      <option value="HOLD">{getWorkOrderStatusLabel('HOLD')}</option>
                    </select>
                  </label>
                  <label><span>목표 수량</span><input type="number" min="1" value={workOrderForm.targetQty} onChange={(e) => setWorkOrderForm((c) => ({ ...c, targetQty: e.target.value }))} required /></label>
                  <label><span>실적 수량</span><input type="number" min="0" value={workOrderForm.actualQty} onChange={(e) => setWorkOrderForm((c) => ({ ...c, actualQty: e.target.value }))} /></label>
                  <label><span>계획 시작일</span><input type="datetime-local" value={workOrderForm.plannedStart} onChange={(e) => setWorkOrderForm((c) => ({ ...c, plannedStart: e.target.value }))} required /></label>
                  <div className="form-actions">
                    <button className="submit-button" type="submit" disabled={workOrderSaving}>{workOrderSaving ? '저장 중...' : editingWorkOrderId ? '작업지시 수정' : '작업지시 등록'}</button>
                    <button className="secondary-light-button" type="button" onClick={resetWorkOrderForm}>초기화</button>
                  </div>
                </form>
                {workOrderSaveSuccess ? <p className="success-text">{workOrderSaveSuccess}</p> : null}
                {workOrderSaveError ? <p className="error-text">{workOrderSaveError}</p> : null}
              </div>
            )}

            <button className={`category-menu-item ${openCategory === 'assignment' ? 'active' : ''}`} type="button" onClick={() => { resetAssignmentForm(); toggle('assignment') }}>
              <span>작업배정 등록</span>
              <span className="category-arrow">→</span>
            </button>
            {openCategory === 'assignment' && (
              <div className="category-form-panel">
                <form className="management-form" onSubmit={handleAssignmentSubmit}>
                  <label>
                    <span>작업지시</span>
                    <select value={assignmentForm.workOrderId} onChange={(e) => setAssignmentForm((c) => ({ ...c, workOrderId: e.target.value }))} required>
                      <option value="">작업지시 선택</option>
                      {dashboardData.workOrders.map((order) => (<option key={order.id} value={order.id}>{order.woNumber} / {order.processType} / {order.lotNumber}</option>))}
                    </select>
                  </label>
                  <label>
                    <span>작업자</span>
                    <select value={assignmentForm.userId} onChange={(e) => setAssignmentForm((c) => ({ ...c, userId: e.target.value }))} required>
                      {availableAssignmentUsers.length > 0 ? <option value="">작업자 선택</option> : <option value="">작업자 데이터 없음</option>}
                      {availableAssignmentUsers.map((user) => (<option key={user.id} value={user.id}>{user.name} / {getUserRoleLabel(user.role)}</option>))}
                    </select>
                  </label>
                  <label>
                    <span>배정 역할</span>
                    <select value={assignmentForm.role} onChange={(e) => setAssignmentForm((c) => ({ ...c, role: e.target.value }))}>
                      {ASSIGNMENT_ROLE_OPTIONS.map((role) => (<option key={role} value={role}>{getAssignmentRoleLabel(role)}</option>))}
                    </select>
                  </label>
                  <label><span>시작 일시</span><input type="datetime-local" value={assignmentForm.startAt} onChange={(e) => setAssignmentForm((c) => ({ ...c, startAt: e.target.value }))} required /></label>
                  <label><span>종료 일시</span><input type="datetime-local" value={assignmentForm.endAt} onChange={(e) => setAssignmentForm((c) => ({ ...c, endAt: e.target.value }))} /></label>
                  <div className="form-actions">
                    <button className="submit-button" type="submit" disabled={assignmentSaving}>{assignmentSaving ? '저장 중...' : editingAssignmentId ? '작업배정 수정' : '작업배정 등록'}</button>
                    <button className="secondary-light-button" type="button" onClick={resetAssignmentForm}>초기화</button>
                  </div>
                </form>
                {assignmentSaveSuccess ? <p className="success-text">{assignmentSaveSuccess}</p> : null}
                {assignmentSaveError ? <p className="error-text">{assignmentSaveError}</p> : null}
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
        <div className="domain-panel-grid-3">
          <article className="panel">
            <div className="panel-head">
              <div><p className="panel-kicker">LOT 목록</p><h2>LOT 현황</h2></div>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>LOT 번호</th><th>제품명</th><th>수량</th><th>상태</th><th>작업</th></tr></thead>
                <tbody>
                  {dashboardData.lots.length === 0 ? (
                    <tr><td colSpan="5" className="empty-cell">등록된 LOT 데이터가 없습니다.</td></tr>
                  ) : (
                    lotsPage.paged.map((lot) => (
                      <tr key={lot.id}>
                        <td>{lot.lotNumber}</td>
                        <td>{lot.productName}</td>
                        <td>{lot.quantity}</td>
                        <td><span className={`mini-badge ${lot.status}`}>{getLotStatusLabel(lot.status)}</span></td>
                        <td><button className="table-action-button" type="button" onClick={() => { startLotEdit(lot); setOpenCategory('lot') }}>수정</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={lotsPage.page} totalPages={lotsPage.totalPages} onPageChange={lotsPage.setPage} />
          </article>

          <article className="panel">
            <div className="panel-head">
              <div><p className="panel-kicker">작업지시 목록</p><h2>작업지시 현황</h2></div>
            </div>
            <div className="stack-list">
              {dashboardData.workOrders.length === 0 ? (
                <div className="empty-state">등록된 작업지시 데이터가 없습니다.</div>
              ) : (
                workOrdersPage.paged.map((order) => (
                  <div className="stack-item" key={order.id}>
                    <div>
                      <strong>{order.woNumber}</strong>
                      <p>{order.processType} / {order.eqCode} / {order.lotNumber}</p>
                    </div>
                    <div className="item-actions">
                      <span className={`mini-badge ${order.status}`}>{getWorkOrderStatusLabel(order.status)}</span>
                      <button className="table-action-button" type="button" onClick={() => { startWorkOrderEdit(order); setOpenCategory('workOrder') }}>수정</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Pagination page={workOrdersPage.page} totalPages={workOrdersPage.totalPages} onPageChange={workOrdersPage.setPage} />
          </article>

          <article className="panel">
            <div className="panel-head">
              <div><p className="panel-kicker">작업배정 목록</p><h2>배정 현황</h2></div>
            </div>
            <div className="stack-list">
              {dashboardData.assignments.length === 0 ? (
                <div className="empty-state">등록된 작업배정 데이터가 없습니다.</div>
              ) : (
                assignmentsPage.paged.map((assignment) => (
                  <div className="stack-item" key={assignment.id}>
                    <div>
                      <strong>{assignment.woNumber}</strong>
                      <p>{assignment.userName} / {getAssignmentRoleLabel(assignment.role)}</p>
                      <p>{formatDateTimeDisplay(assignment.startAt)}</p>
                    </div>
                    <div className="item-actions">
                      <span className="mini-badge RUNNING">{getAssignmentRoleLabel(assignment.role)}</span>
                      <button className="table-action-button" type="button" onClick={() => { startAssignmentEdit(assignment); setOpenCategory('assignment') }}>수정</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Pagination page={assignmentsPage.page} totalPages={assignmentsPage.totalPages} onPageChange={assignmentsPage.setPage} />
          </article>
        </div>
      </div>
    </section>
  )
}

export default ProductionPage
