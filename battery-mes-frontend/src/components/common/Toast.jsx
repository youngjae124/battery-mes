function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.message}</span>
          <button className="toast-close" type="button" onClick={() => onDismiss(t.id)} aria-label="닫기">×</button>
        </div>
      ))}
    </div>
  )
}

export default Toast
