function Layout({ sidebar, children }) {
  return (
    <main className="app-shell">
      <div className="layout-shell">
        {sidebar}
        <div className="app-content">{children}</div>
      </div>
    </main>
  )
}

export default Layout
