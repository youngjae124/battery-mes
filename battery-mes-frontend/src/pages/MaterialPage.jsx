import { useState, useEffect } from 'react'
import { usePagination } from '../hooks/usePagination'
import Pagination from '../components/common/Pagination'

function MaterialPage({
  dashboardData,
  MATERIAL_TYPE_OPTIONS,
  materialTypeSummary,
  selectedMaterial,
  formatNumber,
  editingMaterialId,
  handleMaterialSubmit,
  materialForm,
  setMaterialForm,
  materialSaving,
  resetMaterialForm,
  materialSaveSuccess,
  materialSaveError,
  editingBomId,
  handleBomSubmit,
  bomForm,
  setBomForm,
  bomSaving,
  resetBomForm,
  bomSaveSuccess,
  bomSaveError,
  startMaterialEdit,
  startBomEdit,
}) {
  const [openCategory, setOpenCategory] = useState(null)

  const toggle = (name) => setOpenCategory((prev) => (prev === name ? null : name))

  useEffect(() => { if (materialSaveSuccess) setOpenCategory(null) }, [materialSaveSuccess])
  useEffect(() => { if (bomSaveSuccess) setOpenCategory(null) }, [bomSaveSuccess])

  const materialsPage = usePagination(dashboardData.materials)
  const bomsPage = usePagination(dashboardData.boms)

  return (
    <section className="content-grid domain-layout">
      <article className="domain-banner">
        <div className="domain-banner-body">
          <div>
            <p className="domain-kicker">Material / BOM</p>
            <h2>Material / BOM</h2>
          </div>
          <div className="domain-banner-metrics">
            <div className="domain-banner-metric"><span>Materials</span><strong>{dashboardData.materials.length}</strong></div>
            <div className="domain-banner-metric"><span>BOMs</span><strong>{dashboardData.boms.length}</strong></div>
            <div className="domain-banner-metric"><span>Types</span><strong>{MATERIAL_TYPE_OPTIONS.length}</strong></div>
          </div>
        </div>
      </article>

      <section className="domain-overview-grid">
        <article className="domain-overview-card accent">
          <p>자재 수</p><strong>{dashboardData.materials.length}</strong>
          <span>{materialTypeSummary || '자재 유형 데이터 없음'}</span>
        </article>
        <article className="domain-overview-card">
          <p>BOM 수</p><strong>{dashboardData.boms.length}</strong>
          <span>제품 기준 구성 데이터</span>
        </article>
        <article className="domain-overview-card">
          <p>선택 자재</p><strong>{selectedMaterial?.matCode ?? '미선택'}</strong>
          <span>{selectedMaterial ? `${selectedMaterial.matName} / ${selectedMaterial.unit}` : 'BOM 구성을 보려면 자재를 먼저 선택해 주세요.'}</span>
        </article>
        <article className="domain-overview-card good">
          <p>총 재고 수량</p>
          <strong>{formatNumber(dashboardData.materials.reduce((sum, m) => sum + Number(m.stockQty ?? 0), 0))}</strong>
          <span>재고 누적 수량</span>
        </article>
      </section>

      {/* 입력 영역 — 아코디언 카테고리 */}
      <div className="section-cluster section-cluster-form domain-section-stack">
        <div className="section-cluster-head">
          <p className="section-cluster-kicker">입력 영역</p>
        </div>
        <article className="panel">
          <div className="panel-head">
            <div><p className="panel-kicker">등록 / 수정</p><h2>자재 / BOM 입력</h2></div>
          </div>
          <div className="category-menu">
            <button className={`category-menu-item ${openCategory === 'material' ? 'active' : ''}`} type="button" onClick={() => { resetMaterialForm(); toggle('material') }}>
              <span>자재 등록</span>
              <span className="category-arrow">→</span>
            </button>
            {openCategory === 'material' && (
              <div className="category-form-panel">
                <form className="management-form" onSubmit={handleMaterialSubmit}>
                  <label><span>자재 코드</span><input value={materialForm.matCode} onChange={(e) => setMaterialForm((c) => ({ ...c, matCode: e.target.value }))} placeholder="MAT-NCM-001" required /></label>
                  <label><span>자재명</span><input value={materialForm.matName} onChange={(e) => setMaterialForm((c) => ({ ...c, matName: e.target.value }))} placeholder="NCM Cathode Powder" required /></label>
                  <label>
                    <span>자재 유형</span>
                    <select value={materialForm.matType} onChange={(e) => setMaterialForm((c) => ({ ...c, matType: e.target.value }))}>
                      {MATERIAL_TYPE_OPTIONS.map((type) => (<option key={type} value={type}>{type}</option>))}
                    </select>
                  </label>
                  <label><span>재고 수량</span><input type="number" step="0.0001" min="0" value={materialForm.stockQty} onChange={(e) => setMaterialForm((c) => ({ ...c, stockQty: e.target.value }))} required /></label>
                  <label><span>단위</span><input value={materialForm.unit} onChange={(e) => setMaterialForm((c) => ({ ...c, unit: e.target.value }))} placeholder="kg / ea / m" required /></label>
                  <div className="form-actions">
                    <button className="submit-button" type="submit" disabled={materialSaving}>{materialSaving ? '저장 중...' : editingMaterialId ? '자재 수정' : '자재 등록'}</button>
                    <button className="secondary-light-button" type="button" onClick={resetMaterialForm}>초기화</button>
                  </div>
                </form>
                {materialSaveSuccess ? <p className="success-text">{materialSaveSuccess}</p> : null}
                {materialSaveError ? <p className="error-text">{materialSaveError}</p> : null}
              </div>
            )}

            <button className={`category-menu-item ${openCategory === 'bom' ? 'active' : ''}`} type="button" onClick={() => { resetBomForm(); toggle('bom') }}>
              <span>BOM 등록</span>
              <span className="category-arrow">→</span>
            </button>
            {openCategory === 'bom' && (
              <div className="category-form-panel">
                <form className="management-form" onSubmit={handleBomSubmit}>
                  <label><span>제품 코드</span><input value={bomForm.productCode} onChange={(e) => setBomForm((c) => ({ ...c, productCode: e.target.value }))} placeholder="CELL-21700-NCM" required /></label>
                  <label>
                    <span>자재 선택</span>
                    <select
                      value={bomForm.materialId}
                      onChange={(e) => {
                        const nextMaterial = dashboardData.materials.find((m) => m.id === e.target.value)
                        setBomForm((c) => ({ ...c, materialId: e.target.value, unit: nextMaterial?.unit ?? c.unit }))
                      }}
                      required
                    >
                      {dashboardData.materials.length > 0 ? <option value="">자재 선택</option> : <option value="">자재 데이터 없음</option>}
                      {dashboardData.materials.map((m) => (<option key={m.id} value={m.id}>{m.matCode} / {m.matName}</option>))}
                    </select>
                  </label>
                  <label><span>단위당 소요량</span><input type="number" step="0.0001" min="0.0001" value={bomForm.qtyPerUnit} onChange={(e) => setBomForm((c) => ({ ...c, qtyPerUnit: e.target.value }))} required /></label>
                  <label><span>단위</span><input value={bomForm.unit} onChange={(e) => setBomForm((c) => ({ ...c, unit: e.target.value }))} placeholder="kg / ea / m" required /></label>
                  <div className="form-actions">
                    <button className="submit-button" type="submit" disabled={bomSaving || dashboardData.materials.length === 0}>
                      {dashboardData.materials.length === 0 ? '자재 데이터 필요' : bomSaving ? '저장 중...' : editingBomId ? 'BOM 수정' : 'BOM 등록'}
                    </button>
                    <button className="secondary-light-button" type="button" onClick={resetBomForm}>초기화</button>
                  </div>
                </form>
                {bomSaveSuccess ? <p className="success-text">{bomSaveSuccess}</p> : null}
                {bomSaveError ? <p className="error-text">{bomSaveError}</p> : null}
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
        <div className="domain-panel-grid">
          <article className="panel panel-accent">
            <div className="panel-head">
              <div><p className="panel-kicker">Material list</p><h2>자재 현황</h2></div>
            </div>
            <div className="stack-list compact">
              {dashboardData.materials.length === 0 ? (
                <div className="empty-state">등록된 자재 데이터가 없습니다.</div>
              ) : (
                materialsPage.paged.map((material) => (
                  <div className="stack-item" key={material.id}>
                    <div>
                      <strong>{material.matCode}</strong>
                      <p>{material.matName} / {material.matType}</p>
                      <p>재고 {formatNumber(material.stockQty)} {material.unit}</p>
                    </div>
                    <div className="item-actions">
                      <button className="table-action-button" type="button" onClick={() => { startMaterialEdit(material); setOpenCategory('material') }}>수정</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Pagination page={materialsPage.page} totalPages={materialsPage.totalPages} onPageChange={materialsPage.setPage} />
          </article>

          <article className="panel">
            <div className="panel-head">
              <div><p className="panel-kicker">BOM list</p><h2>BOM 현황</h2></div>
            </div>
            <div className="stack-list compact">
              {dashboardData.boms.length === 0 ? (
                <div className="empty-state">등록된 BOM 데이터가 없습니다.</div>
              ) : (
                bomsPage.paged.map((bom) => (
                  <div className="stack-item" key={bom.id}>
                    <div>
                      <strong>{bom.productCode}</strong>
                      <p>{bom.matCode} / {bom.matName}</p>
                      <p>{formatNumber(bom.qtyPerUnit)} {bom.unit} / unit</p>
                    </div>
                    <div className="item-actions">
                      <span className="mini-badge IDLE">{bom.matType}</span>
                      <button className="table-action-button" type="button" onClick={() => { startBomEdit(bom); setOpenCategory('bom') }}>수정</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Pagination page={bomsPage.page} totalPages={bomsPage.totalPages} onPageChange={bomsPage.setPage} />
          </article>
        </div>
      </div>
    </section>
  )
}

export default MaterialPage
