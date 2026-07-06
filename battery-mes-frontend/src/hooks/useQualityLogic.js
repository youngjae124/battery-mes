import { useEffect, useState } from 'react'
import { buildInspectionPreview, parseOptionalNumber, toInputNumberValue } from '../lib/mesFormatters'
import { createDefectApi, createInspectionApi, deleteInspectionApi, exportInspectionsCsvApi, fetchDefectTrendApi, updateDefectApi, updateInspectionApi } from '../lib/mesApi'

const INSPECTION_TEMPLATES = {
  '전극': [
    { item: '코팅 두께',     specMin: '50',   specMax: '70' },
    { item: '활물질 도포량', specMin: '180',  specMax: '220' },
    { item: '전극 밀도',     specMin: '1.5',  specMax: '1.8' },
  ],
  '조립': [
    { item: '셀 두께',     specMin: '5.8', specMax: '6.2' },
    { item: '권취 정렬도', specMin: '0',   specMax: '0.3' },
    { item: '탭 위치',     specMin: '0',   specMax: '0.5' },
  ],
  '화성': [
    { item: 'OCV',    specMin: '3.6',  specMax: '4.2' },
    { item: '용량',   specMin: '2800', specMax: '3200' },
    { item: '내부저항', specMin: '0',  specMax: '50' },
    { item: '화성 효율', specMin: '90', specMax: '' },
  ],
  '검사': [
    { item: 'OCV',    specMin: '3.6', specMax: '4.2' },
    { item: '내부저항', specMin: '0', specMax: '50' },
    { item: '절연저항', specMin: '100', specMax: '' },
    { item: '외관',   specMin: '',    specMax: '' },
  ],
}

const EMPTY_INSPECTION_FORM = {
  lotId: '',
  workOrderId: '',
  processType: 'IPQC',
  inspectionItem: '',
  specMin: '',
  specMax: '',
  measuredValue: '',
  agingStatus: 'PENDING',
  remarks: '',
}

const EMPTY_DEFECT_FORM = {
  inspectionId: '',
  defectCode: '',
  severity: 'MINOR',
  description: '',
}

export function useQualityLogic(auth, dashboardData, setDashboardData, loadOperationalData) {
  const [qualityView, setQualityView] = useState('inspection')
  const [inspectionForm, setInspectionForm] = useState(EMPTY_INSPECTION_FORM)
  const [defectForm, setDefectForm] = useState(EMPTY_DEFECT_FORM)

  const [editingInspectionId, setEditingInspectionId] = useState('')
  const [editingDefectId, setEditingDefectId] = useState('')

  const [inspectionSaving, setInspectionSaving] = useState(false)
  const [defectSaving, setDefectSaving] = useState(false)
  const [inspectionDeleting, setInspectionDeleting] = useState(false)
  const [csvExporting, setCsvExporting] = useState(false)
  const [defectTrend, setDefectTrend] = useState([])

  useEffect(() => {
    if (!auth?.accessToken) {
      return
    }

    fetchDefectTrendApi(7, auth.accessToken)
      .then((data) => setDefectTrend(data ?? []))
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.accessToken])

  const [inspectionSaveError, setInspectionSaveError] = useState('')
  const [inspectionSaveSuccess, setInspectionSaveSuccess] = useState('')
  const [defectSaveError, setDefectSaveError] = useState('')
  const [defectSaveSuccess, setDefectSaveSuccess] = useState('')

  async function handleInspectionSubmit(event) {
    event.preventDefault()
    setInspectionSaving(true)
    setInspectionSaveError('')
    setInspectionSaveSuccess('')

    if (!auth?.accessToken) {
      setInspectionSaving(false)
      setInspectionSaveError('검사 등록을 하려면 먼저 로그인해야 합니다.')
      return
    }

    try {
      const specMin = parseOptionalNumber(inspectionForm.specMin)
      const specMax = parseOptionalNumber(inspectionForm.specMax)
      const measuredValue = parseOptionalNumber(inspectionForm.measuredValue)

      if ([specMin, specMax, measuredValue].some((value) => value !== null && Number.isNaN(value))) {
        setInspectionSaveError('규격값과 측정값은 숫자만 입력할 수 있습니다.')
        setInspectionSaving(false)
        return
      }

      if (!inspectionForm.lotId || !inspectionForm.inspectionItem.trim() || measuredValue === null) {
        setInspectionSaveError('LOT, 검사 항목, 측정값은 필수 입력 항목입니다.')
        setInspectionSaving(false)
        return
      }

      if (specMin !== null && specMax !== null && specMin > specMax) {
        setInspectionSaveError('규격 하한은 규격 상한보다 클 수 없습니다.')
        setInspectionSaving(false)
        return
      }

      const payload = {
        lotId: inspectionForm.lotId,
        workOrderId: inspectionForm.workOrderId || null,
        processType: inspectionForm.processType,
        inspectionItem: inspectionForm.inspectionItem.trim(),
        specMin,
        specMax,
        measuredValue,
        agingStatus: inspectionForm.agingStatus,
        remarks: inspectionForm.remarks.trim() || null,
      }

      let savedInspection

      if (editingInspectionId) {
        savedInspection = await updateInspectionApi(editingInspectionId, payload, auth.accessToken)
        setInspectionSaveSuccess(
          savedInspection.result === 'FAIL'
            ? '검사 결과가 수정되었습니다. FAIL 판정이라 불량 등록 화면으로 이동합니다.'
            : '검사 결과가 수정되었습니다.',
        )
      } else {
        savedInspection = await createInspectionApi(payload, auth.accessToken)
        setInspectionSaveSuccess(
          savedInspection.result === 'FAIL'
            ? '검사 결과가 등록되었습니다. FAIL 판정이라 불량 등록 화면으로 이동합니다.'
            : '검사 결과가 등록되었습니다.',
        )
      }

      resetInspectionForm()
      const refreshedBundle = await loadOperationalData(auth.accessToken, auth.role)

      if (savedInspection?.result === 'FAIL') {
        const inspectionExistsInBundle = refreshedBundle?.inspections?.some(
          (inspection) => inspection.id === savedInspection.id,
        )

        if (!inspectionExistsInBundle) {
          setDashboardData((current) => ({
            ...current,
            inspections: [savedInspection, ...current.inspections.filter((inspection) => inspection.id !== savedInspection.id)].slice(0, 10),
          }))
        }

        setQualityView('defect')
        setEditingDefectId('')
        setDefectSaveError('')
        setDefectSaveSuccess('')
        setDefectForm({
          ...EMPTY_DEFECT_FORM,
          inspectionId: savedInspection.id,
          severity: 'MINOR',
        })
      }
    } catch (error) {
      setInspectionSaveError(error.message || '검사 결과 저장에 실패했습니다.')
    } finally {
      setInspectionSaving(false)
    }
  }

  async function handleDefectSubmit(event) {
    event.preventDefault()
    setDefectSaving(true)
    setDefectSaveError('')
    setDefectSaveSuccess('')

    if (!auth?.accessToken) {
      setDefectSaving(false)
      setDefectSaveError('불량 등록을 하려면 먼저 로그인해야 합니다.')
      return
    }

    try {
      if (!defectForm.inspectionId || !defectForm.defectCode) {
        setDefectSaveError('검사 결과와 불량 유형은 필수 입력 항목입니다.')
        setDefectSaving(false)
        return
      }

      const selectedInspection = dashboardData.inspections.find(
        (inspection) => inspection.id === defectForm.inspectionId,
      )

      if (!selectedInspection) {
        setDefectSaveError('선택한 검사 결과를 찾을 수 없습니다.')
        setDefectSaving(false)
        return
      }

      if (selectedInspection.result !== 'FAIL') {
        setDefectSaveError('불량은 FAIL 판정 검사에만 등록할 수 있습니다.')
        setDefectSaving(false)
        return
      }

      const payload = {
        inspectionId: defectForm.inspectionId,
        defectCode: defectForm.defectCode.trim(),
        severity: defectForm.severity,
        description: defectForm.description.trim() || null,
      }

      if (editingDefectId) {
        await updateDefectApi(editingDefectId, payload, auth.accessToken)
        setDefectSaveSuccess('불량 정보가 수정되었습니다.')
      } else {
        await createDefectApi(payload, auth.accessToken)
        setDefectSaveSuccess('불량 정보가 등록되었습니다.')
      }

      resetDefectForm()
      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setDefectSaveError(error.message || '불량 저장에 실패했습니다.')
    } finally {
      setDefectSaving(false)
    }
  }

  function startInspectionEdit(inspection) {
    setQualityView('inspection')
    setEditingInspectionId(inspection.id)
    setInspectionSaveError('')
    setInspectionSaveSuccess('')
    setInspectionForm({
      lotId: inspection.lotId,
      workOrderId: inspection.workOrderId ?? '',
      processType: inspection.processType,
      inspectionItem: inspection.inspectionItem,
      specMin: toInputNumberValue(inspection.specMin),
      specMax: toInputNumberValue(inspection.specMax),
      measuredValue: toInputNumberValue(inspection.measuredValue),
      agingStatus: inspection.agingStatus ?? 'PENDING',
      remarks: inspection.remarks ?? '',
    })
  }

  function resetInspectionForm() {
    setEditingInspectionId('')
    setInspectionForm(EMPTY_INSPECTION_FORM)
  }

  async function handleExportCsv() {
    if (!auth?.accessToken) {
      return
    }

    setCsvExporting(true)

    try {
      const blob = await exportInspectionsCsvApi(auth.accessToken)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `inspections-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setInspectionSaveError(error.message || 'CSV 내보내기에 실패했습니다.')
    } finally {
      setCsvExporting(false)
    }
  }

  async function handleDeleteInspection(inspectionId) {
    setInspectionDeleting(true)
    setInspectionSaveError('')
    setInspectionSaveSuccess('')

    if (!auth?.accessToken) {
      setInspectionDeleting(false)
      setInspectionSaveError('검사 삭제를 하려면 먼저 로그인해야 합니다.')
      return
    }

    try {
      await deleteInspectionApi(inspectionId, auth.accessToken)
      setInspectionSaveSuccess('검사 결과가 삭제되었습니다.')

      if (editingInspectionId === inspectionId) {
        resetInspectionForm()
      }

      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setInspectionSaveError(error.message || '검사 결과 삭제에 실패했습니다.')
    } finally {
      setInspectionDeleting(false)
    }
  }

  function handleInspectionLotChange(lotId) {
    setInspectionForm((current) => {
      const keepsWorkOrder =
        !current.workOrderId ||
        dashboardData.workOrders.some((order) => order.id === current.workOrderId && order.lotId === lotId)

      return {
        ...current,
        lotId,
        workOrderId: keepsWorkOrder ? current.workOrderId : '',
        inspectionItem: '',
        specMin: '',
        specMax: '',
      }
    })
  }

  function handleInspectionWorkOrderChange(workOrderId) {
    setInspectionForm((c) => ({
      ...c,
      workOrderId,
      inspectionItem: '',
      specMin: '',
      specMax: '',
    }))
  }

  function handleInspectionItemChange(itemName) {
    setInspectionForm((c) => {
      const order = dashboardData.workOrders.find((o) => o.id === c.workOrderId)
      const processItems = order ? (INSPECTION_TEMPLATES[order.processType] ?? []) : []
      const found = processItems.find((t) => t.item === itemName)
      return {
        ...c,
        inspectionItem: itemName,
        specMin: found?.specMin ?? '',
        specMax: found?.specMax ?? '',
      }
    })
  }

  function startDefectEdit(defect) {
    setQualityView('defect')
    setEditingDefectId(defect.id)
    setDefectSaveError('')
    setDefectSaveSuccess('')
    setDefectForm({
      inspectionId: defect.inspectionId,
      defectCode: defect.defectCode,
      severity: defect.severity,
      description: defect.description ?? '',
    })
  }

  function resetDefectForm() {
    setEditingDefectId('')
    setDefectForm(EMPTY_DEFECT_FORM)
  }

  const filteredInspectionWorkOrders = dashboardData.workOrders.filter(
    (order) => !inspectionForm.lotId || order.lotId === inspectionForm.lotId,
  )
  const hasFilteredWorkOrders = filteredInspectionWorkOrders.length > 0

  const selectedInspectionWorkOrder = dashboardData.workOrders.find((o) => o.id === inspectionForm.workOrderId)
  const inspectionItemOptions = selectedInspectionWorkOrder
    ? (INSPECTION_TEMPLATES[selectedInspectionWorkOrder.processType] ?? [])
    : []
  const inspectionPreview = buildInspectionPreview(inspectionForm)
  const availableDefectInspections = dashboardData.inspections.filter(
    (inspection) => inspection.result === 'FAIL' || inspection.id === defectForm.inspectionId,
  )
  const selectedDefectType = dashboardData.defectTypes.find((type) => type.code === defectForm.defectCode)
  const selectedDefectInspection = dashboardData.inspections.find(
    (inspection) => inspection.id === defectForm.inspectionId,
  )

  return {
    qualityView,
    setQualityView,

    inspectionForm,
    setInspectionForm,
    editingInspectionId,
    inspectionSaving,
    inspectionSaveError,
    inspectionSaveSuccess,
    handleInspectionSubmit,
    startInspectionEdit,
    resetInspectionForm,
    handleDeleteInspection,
    inspectionDeleting,
    handleExportCsv,
    csvExporting,
    handleInspectionLotChange,
    handleInspectionWorkOrderChange,
    handleInspectionItemChange,
    filteredInspectionWorkOrders,
    hasFilteredWorkOrders,
    inspectionItemOptions,
    inspectionPreview,

    defectForm,
    setDefectForm,
    editingDefectId,
    defectSaving,
    defectSaveError,
    defectSaveSuccess,
    handleDefectSubmit,
    startDefectEdit,
    resetDefectForm,
    availableDefectInspections,
    selectedDefectType,
    selectedDefectInspection,
    defectTrend,
  }
}
