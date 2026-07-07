import { useState, useEffect } from 'react'
import { parseOptionalNumber, toInputNumberValue } from '../lib/mesFormatters'
import { createBomApi, createMaterialApi, fetchNextMatCodeApi, updateBomApi, updateMaterialApi } from '../lib/mesApi'

export const MATERIAL_TYPE_OPTIONS = ['RAW', 'SEMI', 'CONSUMABLE']

const EMPTY_MATERIAL_FORM = {
  matCode: '',
  matName: '',
  matType: 'RAW',
  stockQty: '0',
  unit: '',
}

const EMPTY_BOM_FORM = {
  productCode: '',
  materialId: '',
  qtyPerUnit: '',
  unit: '',
}

export function useMaterialLogic(auth, dashboardData, loadOperationalData) {
  const [materialForm, setMaterialForm] = useState(EMPTY_MATERIAL_FORM)
  const [bomForm, setBomForm] = useState(EMPTY_BOM_FORM)

  const [editingMaterialId, setEditingMaterialId] = useState('')
  const [editingBomId, setEditingBomId] = useState('')

  const [materialSaving, setMaterialSaving] = useState(false)
  const [bomSaving, setBomSaving] = useState(false)

  // 신규 등록 모드에서 자재 유형 변경 시 자동 채번
  useEffect(() => {
    if (editingMaterialId || !auth?.accessToken) return
    fetchNextMatCodeApi(materialForm.matType, auth.accessToken)
      .then((nextCode) => {
        if (nextCode) setMaterialForm((c) => ({ ...c, matCode: nextCode }))
      })
      .catch(() => {})
  }, [materialForm.matType, editingMaterialId, auth?.accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const [materialSaveError, setMaterialSaveError] = useState('')
  const [materialSaveSuccess, setMaterialSaveSuccess] = useState('')
  const [bomSaveError, setBomSaveError] = useState('')
  const [bomSaveSuccess, setBomSaveSuccess] = useState('')

  async function handleMaterialSubmit(event) {
    event.preventDefault()
    setMaterialSaving(true)
    setMaterialSaveError('')
    setMaterialSaveSuccess('')

    if (!auth?.accessToken) {
      setMaterialSaving(false)
      setMaterialSaveError('Material save requires login.')
      return
    }

    try {
      const stockQty = parseOptionalNumber(materialForm.stockQty)

      if (stockQty === null || Number.isNaN(stockQty)) {
        setMaterialSaveError('Stock quantity must be a valid number.')
        setMaterialSaving(false)
        return
      }

      if (!materialForm.matCode.trim() || !materialForm.matName.trim() || !materialForm.unit.trim()) {
        setMaterialSaveError('Material code, name, and unit are required.')
        setMaterialSaving(false)
        return
      }

      const payload = {
        matCode: materialForm.matCode.trim(),
        matName: materialForm.matName.trim(),
        matType: materialForm.matType,
        stockQty,
        unit: materialForm.unit.trim(),
      }

      if (editingMaterialId) {
        await updateMaterialApi(editingMaterialId, payload, auth.accessToken)
        setMaterialSaveSuccess('Material updated.')
      } else {
        await createMaterialApi(payload, auth.accessToken)
        setMaterialSaveSuccess('Material created.')
      }

      resetMaterialForm()
      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setMaterialSaveError(error.message || 'Failed to save material.')
    } finally {
      setMaterialSaving(false)
    }
  }

  async function handleBomSubmit(event) {
    event.preventDefault()
    setBomSaving(true)
    setBomSaveError('')
    setBomSaveSuccess('')

    if (!auth?.accessToken) {
      setBomSaving(false)
      setBomSaveError('BOM save requires login.')
      return
    }

    try {
      const qtyPerUnit = parseOptionalNumber(bomForm.qtyPerUnit)

      if (qtyPerUnit === null || Number.isNaN(qtyPerUnit) || qtyPerUnit <= 0) {
        setBomSaveError('Quantity per unit must be greater than 0.')
        setBomSaving(false)
        return
      }

      if (!bomForm.productCode.trim() || !bomForm.materialId || !bomForm.unit.trim()) {
        setBomSaveError('Product code, material, and unit are required.')
        setBomSaving(false)
        return
      }

      const payload = {
        productCode: bomForm.productCode.trim(),
        materialId: bomForm.materialId,
        qtyPerUnit,
        unit: bomForm.unit.trim(),
      }

      if (editingBomId) {
        await updateBomApi(editingBomId, payload, auth.accessToken)
        setBomSaveSuccess('BOM updated.')
      } else {
        await createBomApi(payload, auth.accessToken)
        setBomSaveSuccess('BOM created.')
      }

      resetBomForm()
      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setBomSaveError(error.message || 'Failed to save BOM.')
    } finally {
      setBomSaving(false)
    }
  }

  function startMaterialEdit(material) {
    setEditingMaterialId(material.id)
    setMaterialSaveError('')
    setMaterialSaveSuccess('')
    setMaterialForm({
      matCode: material.matCode,
      matName: material.matName,
      matType: material.matType,
      stockQty: toInputNumberValue(material.stockQty),
      unit: material.unit,
    })
  }

  function resetMaterialForm() {
    setEditingMaterialId('')
    setMaterialForm(EMPTY_MATERIAL_FORM)
  }

  function startBomEdit(bom) {
    setEditingBomId(bom.id)
    setBomSaveError('')
    setBomSaveSuccess('')
    setBomForm({
      productCode: bom.productCode,
      materialId: bom.materialId,
      qtyPerUnit: toInputNumberValue(bom.qtyPerUnit),
      unit: bom.unit,
    })
  }

  function resetBomForm() {
    setEditingBomId('')
    setBomForm(EMPTY_BOM_FORM)
  }

  const selectedMaterial = dashboardData.materials.find((material) => material.id === bomForm.materialId)
  const materialTypeSummary = MATERIAL_TYPE_OPTIONS.map((type) => {
    const count = dashboardData.materials.filter((material) => material.matType === type).length
    return `${type} ${count}`
  }).join(' / ')

  return {
    materialForm,
    setMaterialForm,
    editingMaterialId,
    materialSaving,
    materialSaveError,
    materialSaveSuccess,
    handleMaterialSubmit,
    startMaterialEdit,
    resetMaterialForm,

    bomForm,
    setBomForm,
    editingBomId,
    bomSaving,
    bomSaveError,
    bomSaveSuccess,
    handleBomSubmit,
    startBomEdit,
    resetBomForm,

    selectedMaterial,
    materialTypeSummary,
  }
}
