import { QualityTrendChart, DefectCategoryChart } from '../components/dashboard/DashboardCharts'

function MainPage({
  isLoggedIn,
  backendState,
  authDisplayName,
  auth,
  authRoleClassName,
  authRoleLabel,
  handleLogout,
  loginSuccess,
  loginError,
  dashboardError,
  dashboardNotice,
  dashboardLotCount,
  dashboardInProgressLots,
  dashboardCompletedLots,
  dashboardHoldLots,
  formatPercent,
  workOrderCompletionRate,
  completedWorkOrderCount,
  dashboardData,
  getProgressBarWidth,
  productionAchievementRate,
  totalActualQuantity,
  formatNumber,
  totalTargetQuantity,
  dashboardRunningEquipmentCount,
  dashboardTotalEquipmentCount,
  idleEquipmentCount,
  downEquipmentCount,
  dashboardPassRateDisplay,
  dashboardPassCount,
  dashboardFailCount,
  dashboardDefectCount,
  criticalDefectCount,
  dashboardDefectRateDisplay,
  activeProcessStepSnapshots,
  getProcessSnapshotState,
  lotStatusSummary,
  dashboardEquipmentStatusSummary,
  equipmentStatusSummary,
  dashboardQualityTrendSummary,
  inspectionSnapshot,
  dashboardDefectCategorySummary,
  defectSnapshot,
  watchLots,
  getLotStatusLabel,
  focusEquipment,
  getEquipmentStatusLabel,
  focusDefects,
  getDefectSeverityLabel,
  shouldShowEmptyDataNotice,
  qualityTrend,
  defectCategories,
  authMode,
  setAuthMode,
  handleLogin,
  loginForm,
  setLoginForm,
  loading,
  handleRegister,
  registerForm,
  setRegisterForm,
  USER_ROLES,
  getUserRoleLabel,
  registerSuccess,
  registerError,
  checkBackend,
  dashboardGradeACount,
  dashboardEquipmentAvailabilityDisplay,
}) {
  return (
    <>
      {isLoggedIn ? (
        <>
          <section className="panel ops-topbar">
            <div className="ops-topbar-brand">
              <h2>MES 실시간 운영 요약</h2>
            </div>

            <div className="ops-topbar-side">
              <div className={`ops-live-pill ${backendState.status}`}>
                <span className={`status-dot ${backendState.status}`}></span>
                <div>
                  <strong>
                    {backendState.status === 'connected'
                      ? '실시간 연결됨'
                      : backendState.status === 'loading'
                        ? '연결 확인 중'
                        : '연결 끊김'}
                  </strong>
                  <p>{backendState.message}</p>
                </div>
              </div>

              <div className="ops-account-compact">
                <div>
                  <span className="ops-account-label">현재 계정</span>
                  <strong className="ops-account-name">{authDisplayName}</strong>
                  <p className="ops-account-email">{auth?.email}</p>
                </div>
                <div className="ops-account-actions">
                  <span className={`role-pill ${authRoleClassName}`}>{authRoleLabel}</span>
                  <button className="ghost-button" type="button" onClick={handleLogout}>
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          </section>

          {loginSuccess || dashboardError || dashboardNotice ? (
            <section className="ops-message-stack">
              {loginSuccess ? <p className="success-text">{loginSuccess}</p> : null}
              {dashboardError ? <p className="error-text">{dashboardError}</p> : null}
              {dashboardNotice ? <p className="info-text">{dashboardNotice}</p> : null}
            </section>
          ) : null}

          <section className="ops-kpi-grid">
            <article className="ops-kpi-card highlight">
              <p className="ops-kpi-label">LOT 운영 현황</p>
              <strong className="ops-kpi-value">{dashboardLotCount}</strong>
              <p className="ops-kpi-meta">{`진행중 ${dashboardInProgressLots} / 완료 ${dashboardCompletedLots} / 보류 ${dashboardHoldLots}`}</p>
            </article>

            <article className="ops-kpi-card">
              <p className="ops-kpi-label">작업지시 진행률</p>
              <strong className="ops-kpi-value">{formatPercent(workOrderCompletionRate)}</strong>
              <p className="ops-kpi-meta">{`완료 ${completedWorkOrderCount} / 전체 ${dashboardData.workOrders.length}`}</p>
              <div className="ops-progress">
                <span style={{ width: getProgressBarWidth(workOrderCompletionRate) }}></span>
              </div>
            </article>

            <article className="ops-kpi-card">
              <p className="ops-kpi-label">생산 달성률</p>
              <strong className="ops-kpi-value">{formatPercent(productionAchievementRate)}</strong>
              <p className="ops-kpi-meta">{`실적 ${formatNumber(totalActualQuantity)} / 목표 ${formatNumber(totalTargetQuantity)}`}</p>
              <div className="ops-progress">
                <span style={{ width: getProgressBarWidth(productionAchievementRate) }}></span>
              </div>
            </article>

            <article className="ops-kpi-card">
              <p className="ops-kpi-label">설비 가동 현황</p>
              <strong className="ops-kpi-value">{dashboardRunningEquipmentCount} / {dashboardTotalEquipmentCount}</strong>
              <p className="ops-kpi-meta">{`가동중 ${dashboardRunningEquipmentCount} / 대기 ${idleEquipmentCount} / 고장 ${downEquipmentCount}`}</p>
            </article>

            <article className="ops-kpi-card good">
              <p className="ops-kpi-label">검사 합격률</p>
              <strong className="ops-kpi-value">{dashboardPassRateDisplay}</strong>
              <p className="ops-kpi-meta">PASS {dashboardPassCount} / FAIL {dashboardFailCount}</p>
            </article>

            <article className="ops-kpi-card alert">
              <p className="ops-kpi-label">품질 리스크</p>
              <strong className="ops-kpi-value">{dashboardDefectCount}</strong>
              <p className="ops-kpi-meta">{`치명 불량 ${criticalDefectCount} / 등록률 ${dashboardDefectRateDisplay}`}</p>
            </article>
          </section>

          <section className="ops-analysis-grid">
            <article className="panel ops-analysis-panel">
              <div className="panel-head compact-head">
                <div>
                  <p className="panel-kicker">운영 분석</p>
                  <h2>생산 · 설비 · 품질 요약</h2>
                </div>
                <span className="chip chip-muted">LOT / 설비 / 품질 데이터를 한 번에 확인</span>
              </div>

              <div className="ops-process-grid">
                {activeProcessStepSnapshots.map((step) => {
                  const stepState = getProcessSnapshotState(step)
                  const stepStateLabel =
                    stepState === 'done'
                      ? '완료'
                      : stepState === 'running'
                        ? '진행중'
                        : stepState === 'planned'
                          ? '계획'
                          : '대기'

                  return (
                    <article className="ops-process-card" key={step.code}>
                      <div className="ops-process-top">
                        <div>
                          <p className="ops-process-kicker">PROCESS STEP</p>
                          <strong>{step.label}</strong>
                        </div>
                        <span className={`ops-process-state ${stepState}`}>{stepStateLabel}</span>
                      </div>

                      <p className="ops-process-description">
                        {`작업지시 ${step.orderCount}건 / 완료 ${step.doneCount}건 / 진행중 ${step.runningCount}건`}
                      </p>
                      <div className="ops-process-metrics">
                        <span>{`준비 상태 ${step.ready ? '가능' : '후속 공정 대기'}`}</span>
                        <span>{`공정 코드 ${step.code}`}</span>
                      </div>
                    </article>
                  )
                })}
              </div>
            </article>

            <article className="panel ops-analysis-panel">
              <div className="panel-head compact-head">
                <div>
                  <p className="panel-kicker">운영 분포</p>
                  <h2>설비 / LOT / 품질 요약</h2>
                </div>
              </div>

              <div className="ops-mini-summary-grid">
                <article className="ops-mini-card">
                  <p>LOT 상태 요약</p>
                  <strong>{lotStatusSummary || '데이터 없음'}</strong>
                </article>
                <article className="ops-mini-card">
                  <p>설비 상태 요약</p>
                  <strong>{dashboardEquipmentStatusSummary || equipmentStatusSummary || '데이터 없음'}</strong>
                </article>
                <article className="ops-mini-card">
                  <p>품질 요약</p>
                  <strong>{dashboardQualityTrendSummary || inspectionSnapshot || '데이터 없음'}</strong>
                </article>
                <article className="ops-mini-card">
                  <p>불량 분류 요약</p>
                  <strong>{dashboardDefectCategorySummary || defectSnapshot || '데이터 없음'}</strong>
                </article>
              </div>
            </article>
          </section>

          {qualityTrend?.length > 0 || defectCategories?.length > 0 ? (
            <section className="ops-analysis-grid">
              <article className="panel ops-analysis-panel">
                <div className="panel-head compact-head">
                  <div>
                    <p className="panel-kicker">품질 추이</p>
                    <h2>최근 7일 검사 · 불량 추이</h2>
                  </div>
                </div>
                <QualityTrendChart qualityTrend={qualityTrend ?? []} />
              </article>

              <article className="panel ops-analysis-panel">
                <div className="panel-head compact-head">
                  <div>
                    <p className="panel-kicker">불량 분류</p>
                    <h2>공정별 불량 카테고리</h2>
                  </div>
                </div>
                <DefectCategoryChart defectCategories={defectCategories ?? []} />
              </article>
            </section>
          ) : null}

          <section className="ops-monitor-grid">
            <article className="panel ops-monitor-panel">
              <div className="panel-head compact-head">
                <div>
                  <p className="panel-kicker">WATCH LOT</p>
                  <h2>주의 LOT</h2>
                </div>
              </div>

              {watchLots.length ? (
                <div className="ops-list">
                  {watchLots.map((lot) => (
                    <article className="ops-list-item" key={lot.id}>
                      <div className="ops-list-head">
                        <strong className="ops-list-title">{lot.lotNumber}</strong>
                        <span className={`mini-badge ${lot.status}`}>{getLotStatusLabel(lot.status)}</span>
                      </div>
                      <p className="ops-list-sub">{lot.productName}</p>
                      <p className="ops-list-meta">수량 {formatNumber(lot.quantity)}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="ops-list-empty">주의 LOT 데이터가 아직 없습니다.</p>
              )}
            </article>

            <article className="panel ops-monitor-panel">
              <div className="panel-head compact-head">
                <div>
                  <p className="panel-kicker">EQUIPMENT FOCUS</p>
                  <h2>주요 설비 현황</h2>
                </div>
              </div>

              {focusEquipment.length ? (
                <div className="ops-list">
                  {focusEquipment.map((equipment) => (
                    <article className="ops-list-item" key={equipment.id}>
                      <div className="ops-list-head">
                        <strong className="ops-list-title">{equipment.eqCode}</strong>
                        <span className={`mini-badge ${equipment.status}`}>{getEquipmentStatusLabel(equipment.status)}</span>
                      </div>
                      <p className="ops-list-sub">{equipment.eqName}</p>
                      <p className="ops-list-meta">{equipment.eqType}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="ops-list-empty">표시할 설비 데이터가 아직 없습니다.</p>
              )}
            </article>

            <article className="panel ops-monitor-panel">
              <div className="panel-head compact-head">
                <div>
                  <p className="panel-kicker">DEFECT FOCUS</p>
                  <h2>주요 불량 현황</h2>
                </div>
              </div>

              {focusDefects.length ? (
                <div className="ops-list">
                  {focusDefects.map((defect) => {
                    const defectType =
                      dashboardData.defectTypes.find((type) => type.id === defect.defectTypeId) ??
                      dashboardData.defectTypes.find((type) => type.code === defect.defectCode)

                    return (
                      <article className="ops-list-item" key={defect.id}>
                        <div className="ops-list-head">
                          <strong className="ops-list-title">{defect.defectCode}</strong>
                          <span className={`ops-severity ${String(defect.severity ?? '').toLowerCase()}`}>
                            {getDefectSeverityLabel(defect.severity)}
                          </span>
                        </div>
                        <p className="ops-list-sub">{defectType?.name ?? '불량 유형 정보 없음'}</p>
                        <p className="ops-list-meta">{defect.description || '상세 설명 없음'}</p>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <p className="ops-list-empty">불량 데이터가 아직 없습니다.</p>
              )}
            </article>
          </section>

          {shouldShowEmptyDataNotice ? (
            <section className="panel warning-panel">
              <div className="panel-head compact-head">
                <div>
                  <p className="panel-kicker">SAMPLE DATA NOTICE</p>
                  <h2>표시할 운영 샘플 데이터가 아직 충분하지 않습니다.</h2>
                </div>
              </div>
              <p className="warning-text">샘플 운영 데이터를 먼저 넣은 뒤 다시 확인해 주세요. LOT, 작업지시, 설비, 검사, 불량 같은 운영 데이터가 비어 있으면 일부 화면은 빈 상태로 보일 수 있습니다.</p>
              <p className="warning-text">실행 SQL: <code>D:\home-study\battery-mes\battery-mes-backend\src\main\resources\db\data-oracle.sql</code></p>
              <p className="warning-text">SQL 실행 후에는 백엔드를 다시 확인하거나 화면을 새로고침해 주세요.</p>
            </section>
          ) : null}
        </>
      ) : (
        <>
          <section className="hero-panel">
            <div className="hero-copy">
              <p className="eyebrow">SECONDARY BATTERY MES + QMS</p>
              <h1>이차전지 MES 운영 화면</h1>
              <p className="hero-text">
                JWT 로그인과 백엔드 API를 연결한 운영 화면입니다. 로그인 전에는 기본 상태를 확인하고,
                로그인 후에는 생산, 설비, 품질 데이터를 한 화면에서 빠르게 조회하면서 필요한 작업으로 이어갈 수 있습니다.
              </p>

              <div className="hero-actions">
                <a className="primary-action" href="http://localhost:8081/swagger-ui/index.html" target="_blank" rel="noreferrer">
                  Swagger 열기
                </a>
                <button className="secondary-action" type="button" onClick={checkBackend}>
                  백엔드 재확인
                </button>
              </div>
            </div>

            <aside className="status-card">
              <div className="status-stack">
                <span className={`status-dot ${backendState.status}`}></span>
                <p className="status-label">백엔드 상태</p>
                <strong>
                  {backendState.status === 'connected'
                    ? '연결됨'
                    : backendState.status === 'loading'
                      ? '확인 중'
                      : '중단됨'}
                </strong>
                <p className="status-message">{backendState.message}</p>

                <div className="token-box">
                  <span>로그인 상태</span>
                  <strong>로그인 이후 상태</strong>
                </div>
              </div>
            </aside>
          </section>

          <section className="workspace-grid">
            <section className="panel login-panel">
              <div className="panel-head compact-head">
                <div>
                  <p className="panel-kicker">LOGIN</p>
                  <h2>로그인 / 회원가입</h2>
                </div>
              </div>

              <div className="auth-mode-row">
                <button className={`auth-mode-button ${authMode === 'login' ? 'active' : ''}`} type="button" onClick={() => setAuthMode('login')}>
                  로그인
                </button>
                <button className={`auth-mode-button ${authMode === 'register' ? 'active' : ''}`} type="button" onClick={() => setAuthMode('register')}>
                  회원가입
                </button>
              </div>

              {authMode === 'login' ? (
                <form className="login-form" onSubmit={handleLogin}>
                  <label>
                    <span>이메일</span>
                    <input type="email" value={loginForm.email} onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" required />
                  </label>
                  <label>
                    <span>비밀번호</span>
                    <input type="password" value={loginForm.password} onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))} placeholder="비밀번호" required />
                  </label>
                  <button className="submit-button" type="submit" disabled={loading}>
                    {loading ? '처리 중...' : '로그인'}
                  </button>
                </form>
              ) : (
                <form className="login-form" onSubmit={handleRegister}>
                  <label>
                    <span>이름</span>
                    <input value={registerForm.name} onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))} placeholder="이름" required />
                  </label>
                  <label>
                    <span>이메일</span>
                    <input type="email" value={registerForm.email} onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" required />
                  </label>
                  <label>
                    <span>비밀번호</span>
                    <input type="password" value={registerForm.password} onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))} placeholder="비밀번호를 입력하세요" required />
                  </label>
                  <label>
                    <span>비밀번호 확인</span>
                    <input type="password" value={registerForm.confirmPassword} onChange={(event) => setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))} placeholder="비밀번호를 다시 입력하세요" required />
                  </label>
                  <label>
                    <span>권한</span>
                    <select value={registerForm.role} onChange={(event) => setRegisterForm((current) => ({ ...current, role: event.target.value }))}>
                      {USER_ROLES.map((role) => (
                        <option key={role} value={role}>{getUserRoleLabel(role)}</option>
                      ))}
                    </select>
                  </label>
                  <button className="submit-button" type="submit" disabled={loading}>
                    {loading ? '처리 중...' : '회원가입'}
                  </button>
                </form>
              )}

              <p className="hint-text">실습용으로는 ADMIN 계정을 하나 만들어 두면 가장 빠르게 전체 기능을 점검할 수 있습니다.</p>
              {loginSuccess ? <p className="success-text">{loginSuccess}</p> : null}
              {loginError ? <p className="error-text">{loginError}</p> : null}
              {registerSuccess ? <p className="success-text">{registerSuccess}</p> : null}
              {registerError ? <p className="error-text">{registerError}</p> : null}
              {dashboardError ? <p className="error-text">{dashboardError}</p> : null}
              {dashboardNotice ? <p className="info-text">{dashboardNotice}</p> : null}

              <div className="auth-summary">
                <div>
                  <span>현재 계정</span>
                  <strong>{auth?.email ?? '로그인 전'}</strong>
                </div>
                <div>
                  <span>토큰 저장 상태</span>
                  <strong>{auth?.accessToken ? '브라우저에 저장됨' : '없음'}</strong>
                </div>
              </div>
            </section>

            <section className="panel summary-panel">
              <div className="panel-head compact-head">
                <div>
                  <p className="panel-kicker">OPERATIONS SUMMARY</p>
                  <h2>실시간 생산/품질 현황</h2>
                </div>
              </div>

              <div className="summary-grid">
                <article className="summary-card summary-card-accent"><p>LOT 수</p><strong>{dashboardLotCount}</strong><span>현재 조회된 생산 LOT 수</span></article>
                <article className="summary-card"><p>총 LOT 수량</p><strong>{formatNumber(dashboardData.lots.reduce((sum, lot) => sum + safeNumber(lot.quantity), 0))}</strong><span>LOT 기준 누적 수량</span></article>
                <article className="summary-card"><p>작업지시 완료 수</p><strong>{completedWorkOrderCount} / {dashboardData.workOrders.length}</strong><span>완료된 작업지시 / 전체 작업지시</span></article>
                <article className="summary-card"><p>가동 중 설비</p><strong>{dashboardRunningEquipmentCount} / {dashboardTotalEquipmentCount}</strong><span>설비 가동률 {dashboardEquipmentAvailabilityDisplay}</span></article>
                <article className="summary-card summary-card-good"><p>검사 합격률</p><strong>{dashboardPassRateDisplay}</strong><span>PASS {dashboardPassCount} / FAIL {dashboardFailCount}</span></article>
                <article className="summary-card"><p>A등급 수</p><strong>{formatNumber(dashboardGradeACount)}</strong><span>검사 결과 A등급 건수</span></article>
                <article className="summary-card summary-card-alert"><p>불량 등록 수</p><strong>{dashboardDefectCount}</strong><span>치명 불량 {formatNumber(criticalDefectCount)}건</span></article>
                <article className="summary-card"><p>불량 등록률</p><strong>{dashboardDefectRateDisplay}</strong><span>검사 건수 대비 불량 등록 비율</span></article>
              </div>

              <div className="status-summary-row">
                <div className="status-summary-box"><p>LOT 상태 요약</p><strong>{lotStatusSummary || '데이터 없음'}</strong></div>
                <div className="status-summary-box"><p>설비 상태 요약</p><strong>{dashboardEquipmentStatusSummary || equipmentStatusSummary || '데이터 없음'}</strong></div>
                <div className="status-summary-box"><p>생산 수량 요약</p><strong>실적 {formatNumber(totalActualQuantity)} / 목표 {formatNumber(totalTargetQuantity)}</strong></div>
                <div className="status-summary-box"><p>품질 요약</p><strong>{dashboardQualityTrendSummary || inspectionSnapshot || defectSnapshot || '데이터 없음'}</strong></div>
                <div className="status-summary-box"><p>리스크 요약</p><strong>보류 LOT {formatNumber(dashboardHoldLots)} / 치명 불량 {formatNumber(criticalDefectCount)}</strong></div>
              </div>
            </section>
          </section>
        </>
      )}
    </>
  )
}

function safeNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default MainPage
