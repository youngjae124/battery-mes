import { useRef, useState } from 'react'
import { fetchDefectImageApi } from '../../lib/mesApi'

export default function AiImageModal({ auth, onClose }) {
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다.')
      return
    }
    setError('')
    setResult('')
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const fakeEvent = { target: { files: [file] } }
      handleFileChange(fakeEvent)
    }
  }

  async function handleAnalyze() {
    if (!imagePreview) return
    setLoading(true)
    setError('')
    setResult('')
    try {
      const payload = {
        image_base64: imagePreview,
        context: { severity: 'MINOR', defectCode: 'GENERAL' },
      }
      const data = await fetchDefectImageApi(payload, auth?.accessToken)
      setResult(data.analysis ?? '')
    } catch (err) {
      setError(err.message || 'AI 분석 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setImageFile(null)
    setImagePreview(null)
    setResult('')
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="ai-modal-overlay">
      <div className="ai-modal-card">
        <div className="ai-modal-header">
          <div>
            <p className="ai-modal-kicker">VLM · VISION ANALYSIS</p>
            <h3 className="ai-modal-title">AI 이미지 분석</h3>
          </div>
          <button className="ai-modal-close" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <div className="ai-modal-body">
          <div
            className={`ai-drop-zone${imagePreview ? ' ai-drop-zone--has-image' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="분석 대상" className="ai-preview-img" />
            ) : (
              <div className="ai-drop-prompt">
                <svg className="ai-drop-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.6"/>
                </svg>
                <p>이미지를 드래그하거나 클릭하여 업로드</p>
                <p className="ai-drop-sub">PNG · JPG · WEBP · 최대 10MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {imagePreview && (
            <div className="ai-modal-actions">
              <button className="ai-btn-secondary" onClick={handleClear} disabled={loading}>
                이미지 변경
              </button>
              <button className="ai-btn-primary" onClick={handleAnalyze} disabled={loading || !imagePreview}>
                {loading ? '분석 중...' : 'AI 분석 시작'}
              </button>
            </div>
          )}

          {!imagePreview && (
            <button className="ai-btn-upload" onClick={() => fileInputRef.current?.click()}>
              파일 선택
            </button>
          )}

          {error && <p className="ai-modal-error">{error}</p>}

          {result && (
            <div className="ai-result-box">
              <p className="ai-result-label">분석 결과</p>
              <p className="ai-result-text">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
