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
  return (
    <section className="content-grid domain-layout">
      <article className="domain-banner">
        <div className="domain-banner-body">
          <div>
            <p className="domain-kicker">Material / BOM</p>
            <h2>자재 목록과 BOM 구성을 같이 보면서 기준 데이터를 관리하는 화면입니다.</h2>
          </div>
          <div className="domain-banner-metrics">
            <div className="domain-banner-metric">
              <span>Materials</span>
              <strong>{dashboardData.materials.length}</strong>
            </div>
            <div className="domain-banner-metric">
              <span>BOMs</span>
              <strong>{dashboardData.boms.length}</strong>
            </div>
            <div className="domain-banner-metric">
              <span>Types</span>
              <strong>{MATERIAL_TYPE_OPTIONS.length}</strong>
            </div>
          </div>
        </div>
      </article>

      <section className="domain-overview-grid">
        <article className="domain-overview-card accent">
          <p>자재 수</p>
          <strong>{dashboardData.materials.length}</strong>
          <span>{materialTypeSummary || '자재 유형 데이터 없음'}</span>
        </article>
        <article className="domain-overview-card">
          <p>BOM 수</p>
          <strong>{dashboardData.boms.length}</strong>
          <span>제품 기준 구성 데이터</span>
        </article>
        <article className="domain-overview-card">
          <p>선택 자재</p>
          <strong>{selectedMaterial?.matCode ?? '미선택'}</strong>
          <span>{selectedMaterial ? `${selectedMaterial.matName} / ${selectedMaterial.unit}` : 'BOM 구성을 보려면 자재를 먼저 선택해 주세요.'}</span>
        </article>
        <article className="domain-overview-card good">
          <p>총 재고 수량</p>
          <strong>{formatNumber(dashboardData.materials.reduce((sum, material) => sum + Number(material.stockQty ?? 0), 0))}</strong>
          <span>등록된 자재 재고의 누적 수량입니다.</span>
        </article>
      </section>

      <div className="section-cluster section-cluster-form domain-section-stack">
        <div className="section-cluster-head">
          <p className="section-cluster-kicker">입력 영역</p>
          <h3>자재 등록과 BOM 등록을 함께 두어 기준 데이터를 관리할 수 있게 구성했습니다.</h3>
        </div>

        <div className="domain-panel-grid">
          <article className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Material</p>
                <h2>{editingMaterialId ? '자재 수정' : '자재 등록'}</h2>
              </div>
            </div>
            <form className="management-form" onSubmit={handleMaterialSubmit}>
              <label>
                <span>자재 코드</span>
                <input
                  value={materialForm.matCode}
                  onChange={(event) => setMaterialForm((current) => ({ ...current, matCode: event.target.value }))}
                  placeholder="MAT-NCM-001"
                  required
                />
              </label>
              <label>
                <span>자재명</span>
                <input
                  value={materialForm.matName}
                  onChange={(event) => setMaterialForm((current) => ({ ...current, matName: event.target.value }))}
                  placeholder="NCM Cathode Powder"
                  required
                />
              </label>
              <label>
                <span>자재 유형</span>
                <select
                  value={materialForm.matType}
                  onChange={(event) => setMaterialForm((current) => ({ ...current, matType: event.target.value }))}
                >
                  {MATERIAL_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>재고 수량</span>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={materialForm.stockQty}
                  onChange={(event) => setMaterialForm((current) => ({ ...current, stockQty: event.target.value }))}
                  required
                />
              </label>
              <label>
                <span>단위</span>
                <input
                  value={materialForm.unit}
                  onChange={(event) => setMaterialForm((current) => ({ ...current, unit: event.target.value }))}
                  placeholder="kg / ea / m"
                  required
                />
              </label>
              <div className="form-actions">
                <button className="submit-button" type="submit" disabled={materialSaving}>
                  {materialSaving ? '저장 중...' : editingMaterialId ? '자재 수정' : '자재 등록'}
                </button>
                <button className="secondary-light-button" type="button" onClick={resetMaterialForm}>
                  초기화
                </button>
              </div>
            </form>
            {materialSaveSuccess ? <p className="success-text">{materialSaveSuccess}</p> : null}
            {materialSaveError ? <p className="error-text">{materialSaveError}</p> : null}
          </article>

          <article className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">BOM</p>
                <h2>{editingBomId ? 'BOM 수정' : 'BOM 등록'}</h2>
              </div>
            </div>
            <form className="management-form" onSubmit={handleBomSubmit}>
              <label>
                <span>제품 코드</span>
                <input
                  value={bomForm.productCode}
                  onChange={(event) => setBomForm((current) => ({ ...current, productCode: event.target.value }))}
                  placeholder="CELL-21700-NCM"
                  required
                />
              </label>
              <label>
                <span>자재 선택</span>
                <select
                  value={bomForm.materialId}
                  onChange={(event) => {
                    const nextMaterial = dashboardData.materials.find((material) => material.id === event.target.value)
                    setBomForm((current) => ({
                      ...current,
                      materialId: event.target.value,
                      unit: nextMaterial?.unit ?? current.unit,
                    }))
                  }}
                  required
                >
                  {dashboardData.materials.length > 0 ? <option value="">자재 선택</option> : <option value="">자재 데이터 없음</option>}
                  {dashboardData.materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.matCode} / {material.matName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>단위당 소요량</span>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={bomForm.qtyPerUnit}
                  onChange={(event) => setBomForm((current) => ({ ...current, qtyPerUnit: event.target.value }))}
                  required
                />
              </label>
              <label>
                <span>단위</span>
                <input
                  value={bomForm.unit}
                  onChange={(event) => setBomForm((current) => ({ ...current, unit: event.target.value }))}
                  placeholder="kg / ea / m"
                  required
                />
              </label>
              <p className="hint-text">자재를 먼저 등록해 두면 BOM 구성 시 단위를 자동으로 채워 넣을 수 있습니다.</p>
              <div className="form-actions">
                <button className="submit-button" type="submit" disabled={bomSaving || dashboardData.materials.length === 0}>
                  {dashboardData.materials.length === 0 ? '자재 데이터 필요' : bomSaving ? '저장 중...' : editingBomId ? 'BOM 수정' : 'BOM 등록'}
                </button>
                <button className="secondary-light-button" type="button" onClick={resetBomForm}>
                  초기화
                </button>
              </div>
            </form>
            {bomSaveSuccess ? <p className="success-text">{bomSaveSuccess}</p> : null}
            {bomSaveError ? <p className="error-text">{bomSaveError}</p> : null}
          </article>

          <article className="panel domain-note-panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">운영 안내</p>
                <h2>자재 관리 흐름</h2>
              </div>
            </div>
            <div className="domain-note-stack">
              <div className="domain-note-card">
                <strong>1. 자재 등록</strong>
                <p>자재 코드, 유형, 재고 수량을 먼저 등록한 뒤 BOM 구성을 이어갈 수 있습니다.</p>
              </div>
              <div className="domain-note-card">
                <strong>2. BOM 구성</strong>
                <p>제품 코드 기준으로 필요한 자재 구성 정보를 연결합니다.</p>
              </div>
              <div className="domain-note-card">
                <strong>3. 단위 확인</strong>
                <p>자재와 BOM 단위를 함께 맞추면 운영 중 기준 데이터 정합성을 유지하기 쉽습니다.</p>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div className="section-cluster section-cluster-list domain-section-stack">
        <div className="section-cluster-head">
          <p className="section-cluster-kicker">조회 영역</p>
          <h3>등록된 자재와 BOM을 나란히 보고 수정 대상과 기준 데이터를 빠르게 확인할 수 있습니다.</h3>
        </div>

        <div className="domain-panel-grid">
          <article className="panel panel-accent">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Material list</p>
                <h2>자재 현황</h2>
              </div>
            </div>
            <div className="stack-list compact">
              {dashboardData.materials.length === 0 ? (
                <div className="empty-state">등록된 자재 데이터가 없습니다.</div>
              ) : (
                dashboardData.materials.map((material) => (
                  <div className="stack-item" key={material.id}>
                    <div>
                      <strong>{material.matCode}</strong>
                      <p>{material.matName} / {material.matType}</p>
                      <p>재고 {formatNumber(material.stockQty)} {material.unit}</p>
                    </div>
                    <div className="item-actions">
                      <button className="table-action-button" type="button" onClick={() => startMaterialEdit(material)}>
                        수정
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">BOM list</p>
                <h2>BOM 현황</h2>
              </div>
            </div>
            <div className="stack-list compact">
              {dashboardData.boms.length === 0 ? (
                <div className="empty-state">등록된 BOM 데이터가 없습니다.</div>
              ) : (
                dashboardData.boms.map((bom) => (
                  <div className="stack-item" key={bom.id}>
                    <div>
                      <strong>{bom.productCode}</strong>
                      <p>{bom.matCode} / {bom.matName}</p>
                      <p>{formatNumber(bom.qtyPerUnit)} {bom.unit} / unit</p>
                    </div>
                    <div className="item-actions">
                      <span className="mini-badge IDLE">{bom.matType}</span>
                      <button className="table-action-button" type="button" onClick={() => startBomEdit(bom)}>
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
    </section>
  )
}

export default MaterialPage
