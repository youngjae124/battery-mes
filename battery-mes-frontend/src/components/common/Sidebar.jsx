function Sidebar({
  sectionMenuItems,
  activeSection,
  onChangeSection,
  currentSection,
  auth,
  authRoleLabel,
  authRoleClassName,
  handleLogout,
}) {
  return (
    <aside className="sidebar-shell">
      <div className="sidebar-brand">
        <p className="sidebar-kicker">MES NAVIGATION</p>
        <h2>운영 화면 메뉴</h2>
        <span>메인 화면과 도메인별 관리 화면을 왼쪽 메뉴로 구분했습니다.</span>
      </div>

      <nav className="sidebar-nav" aria-label="운영 화면 메뉴">
        {sectionMenuItems.map((section) => (
          <button
            key={section.key}
            className={`sidebar-nav-button ${activeSection === section.key ? 'active' : ''}`}
            type="button"
            onClick={() => onChangeSection(section.key)}
          >
            <span className="sidebar-nav-top">
              <span className="sidebar-nav-label">{section.label}</span>
              <span className="sidebar-nav-badge">{section.badge}</span>
            </span>
            <span className="sidebar-nav-desc">{section.description}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-meta">
        <div className="sidebar-meta-card">
          <span>현재 화면</span>
          <strong>{currentSection.label}</strong>
        </div>
        <div className="sidebar-meta-card">
          <span>로그인 상태</span>
          <strong>{auth?.accessToken ? '인증 완료' : '로그인 필요'}</strong>
        </div>
        <div className="sidebar-meta-card">
          <span>현재 계정</span>
          <strong>{auth?.email ?? '계정 정보 없음'}</strong>
        </div>
        {auth?.accessToken ? (
          <div className="sidebar-meta-card sidebar-session-card">
            <span>권한</span>
            <strong>{authRoleLabel}</strong>
            <button className="sidebar-logout-button" type="button" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        ) : null}
        {auth?.accessToken ? (
          <div className="sidebar-meta-card sidebar-account-shortcut">
            <span className={`role-pill ${authRoleClassName}`}>{authRoleLabel}</span>
            <button className="sidebar-logout-button" type="button" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  )
}

export default Sidebar
