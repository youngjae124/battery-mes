import { useEffect, useState } from 'react'
import { calculateSpcStats, isSpcOutOfControl, parseOptionalNumber, parseSampleValueList, summarizeUniqueValues } from '../lib/mesFormatters'
import { analyzeSpcApi, createSpcDataApi, fetchSpcChartApi } from '../lib/mesApi'

const SPC_PARAMETER_TEMPLATES = {
  '전극': [
    { name: '코팅 두께',     ucl: '70',   cl: '60',   lcl: '50',  usl: '70',  lsl: '50' },
    { name: '활물질 도포량', ucl: '220',  cl: '200',  lcl: '180', usl: '220', lsl: '180' },
    { name: '전극 밀도',     ucl: '1.80', cl: '1.65', lcl: '1.50',usl: '1.80',lsl: '1.50' },
  ],
  '조립': [
    { name: '셀 두께',     ucl: '6.2',  cl: '6.0',  lcl: '5.8', usl: '6.2', lsl: '5.8' },
    { name: '권취 정렬도', ucl: '0.30', cl: '0.15', lcl: '0',   usl: '0.30',lsl: '0' },
  ],
  '화성': [
    { name: 'OCV',      ucl: '4.2',  cl: '3.9',  lcl: '3.6', usl: '4.2',  lsl: '3.6' },
    { name: '용량',     ucl: '3200', cl: '3000', lcl: '2800',usl: '3200', lsl: '2800' },
    { name: '내부저항', ucl: '50',   cl: '25',   lcl: '0',   usl: '50',   lsl: '0' },
  ],
  '검사': [
    { name: 'OCV',      ucl: '4.2', cl: '3.9', lcl: '3.6', usl: '4.2', lsl: '3.6' },
    { name: '내부저항', ucl: '50',  cl: '25',  lcl: '0',   usl: '50',  lsl: '0' },
    { name: '절연저항', ucl: '',    cl: '150', lcl: '100', usl: '',    lsl: '100' },
  ],
}

const EMPTY_SPC_FORM = {
  lotId: '',
  workOrderId: '',
  parameterName: '',
  subgroupNo: 1,
  sampleValues: '',
  ucl: '',
  cl: '',
  lcl: '',
  usl: '',
  lsl: '',
}

const EMPTY_SPC_FILTER_FORM = {
  lotId: '',
  workOrderId: '',
  parameterName: '',
  status: 'ALL',
}

const EMPTY_CAPABILITY_PREVIEW = {
  loading: false,
  error: '',
  cp: null,
  cpk: null,
}

export function useSpcLogic(auth, dashboardData, loadOperationalData) {
  const [spcForm, setSpcForm] = useState(EMPTY_SPC_FORM)
  const [spcFilters, setSpcFilters] = useState(EMPTY_SPC_FILTER_FORM)
  const [spcSaving, setSpcSaving] = useState(false)
  const [spcSaveError, setSpcSaveError] = useState('')
  const [spcSaveSuccess, setSpcSaveSuccess] = useState('')
  const [capabilityPreview, setCapabilityPreview] = useState(EMPTY_CAPABILITY_PREVIEW)
  const [spcChartData, setSpcChartData] = useState([])
  const [spcChartLoading, setSpcChartLoading] = useState(false)
  const [spcChartError, setSpcChartError] = useState('')

  async function calculateCapability(sampleNumbers, usl, lsl) {
    const result = await analyzeSpcApi({ values: sampleNumbers, usl, lsl }, auth.accessToken)
    return { cp: result.cp ?? null, cpk: result.cpk ?? null }
  }

  function handleSpcWorkOrderChange(workOrderId) {
    setSpcForm((c) => ({
      ...c,
      workOrderId,
      parameterName: '',
      ucl: '', cl: '', lcl: '', usl: '', lsl: '',
    }))
  }

  function handleSpcParameterChange(parameterName) {
    setSpcForm((c) => {
      const order = dashboardData.workOrders.find((o) => o.id === c.workOrderId)
      const params = order ? (SPC_PARAMETER_TEMPLATES[order.processType] ?? []) : []
      const found = params.find((p) => p.name === parameterName)
      return {
        ...c,
        parameterName,
        ucl: found?.ucl ?? '',
        cl: found?.cl ?? '',
        lcl: found?.lcl ?? '',
        usl: found?.usl ?? '',
        lsl: found?.lsl ?? '',
      }
    })
  }

  useEffect(() => {
    if (!spcForm.parameterName || !spcForm.lotId) {
      setSpcForm((c) => ({ ...c, subgroupNo: 1 }))
      return
    }
    const existing = dashboardData.spcData.filter(
      (row) => row.parameterName === spcForm.parameterName && row.lotId === spcForm.lotId,
    )
    const maxSubgroup = existing.length > 0 ? Math.max(...existing.map((r) => r.subgroupNo ?? 0)) : 0
    setSpcForm((c) => ({ ...c, subgroupNo: maxSubgroup + 1 }))
  }, [spcForm.parameterName, spcForm.lotId, dashboardData.spcData])

  async function handleCalculateCapability() {
    const sampleNumbers = parseSampleValueList(spcForm.sampleValues)
    const usl = parseOptionalNumber(spcForm.usl)
    const lsl = parseOptionalNumber(spcForm.lsl)

    if (!auth?.accessToken) {
      setCapabilityPreview({ ...EMPTY_CAPABILITY_PREVIEW, error: 'Cp/Cpk 계산을 하려면 먼저 로그인해야 합니다.' })
      return
    }

    if (sampleNumbers.length === 0 || usl === null || lsl === null || Number.isNaN(usl) || Number.isNaN(lsl)) {
      setCapabilityPreview({ ...EMPTY_CAPABILITY_PREVIEW, error: '샘플값과 USL, LSL을 모두 입력해 주세요.' })
      return
    }

    if (usl <= lsl) {
      setCapabilityPreview({ ...EMPTY_CAPABILITY_PREVIEW, error: 'USL은 LSL보다 커야 합니다.' })
      return
    }

    setCapabilityPreview({ ...EMPTY_CAPABILITY_PREVIEW, loading: true })

    try {
      const { cp, cpk } = await calculateCapability(sampleNumbers, usl, lsl)
      setCapabilityPreview({ loading: false, error: '', cp, cpk })
    } catch (error) {
      setCapabilityPreview({ ...EMPTY_CAPABILITY_PREVIEW, error: error.message || 'Cp/Cpk 계산에 실패했습니다.' })
    }
  }

  async function handleSpcSubmit(event) {
    event.preventDefault()
    setSpcSaving(true)
    setSpcSaveError('')
    setSpcSaveSuccess('')

    if (!auth?.accessToken) {
      setSpcSaving(false)
      setSpcSaveError('SPC save requires login.')
      return
    }

    try {
      const subgroupNo = Number(spcForm.subgroupNo)
      const sampleNumbers = parseSampleValueList(spcForm.sampleValues)
      const calculatedStats = calculateSpcStats(sampleNumbers)
      const ucl = parseOptionalNumber(spcForm.ucl)
      const cl = parseOptionalNumber(spcForm.cl)
      const lcl = parseOptionalNumber(spcForm.lcl)
      const usl = parseOptionalNumber(spcForm.usl)
      const lsl = parseOptionalNumber(spcForm.lsl)

      if (!spcForm.lotId || !spcForm.parameterName.trim() || !Number.isInteger(subgroupNo) || subgroupNo < 1) {
        setSpcSaveError('LOT, parameter name, and subgroup number are required.')
        setSpcSaving(false)
        return
      }

      if (sampleNumbers.length === 0) {
        setSpcSaveError('Enter at least one sample value.')
        setSpcSaving(false)
        return
      }

      if ([ucl, cl, lcl, usl, lsl].some((value) => value !== null && Number.isNaN(value))) {
        setSpcSaveError('Control limit and specification limit values must be valid numbers.')
        setSpcSaving(false)
        return
      }

      if (usl !== null && lsl !== null && usl <= lsl) {
        setSpcSaveError('USL must be greater than LSL.')
        setSpcSaving(false)
        return
      }

      let cp = null
      let cpk = null

      if (usl !== null && lsl !== null) {
        const capability = await calculateCapability(sampleNumbers, usl, lsl)
        cp = capability.cp
        cpk = capability.cpk
        setCapabilityPreview({ loading: false, error: '', cp, cpk })
      }

      const payload = {
        lotId: spcForm.lotId,
        workOrderId: spcForm.workOrderId || null,
        parameterName: spcForm.parameterName.trim(),
        subgroupNo,
        sampleValues: sampleNumbers.join(','),
        xBar: calculatedStats.xBar,
        rangeValue: calculatedStats.rangeValue,
        ucl,
        cl,
        lcl,
        usl,
        lsl,
        cp,
        cpk,
      }

      await createSpcDataApi(payload, auth.accessToken)
      setSpcSaveSuccess('SPC data created.')
      resetSpcForm()
      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setSpcSaveError(error.message || 'Failed to save SPC data.')
    } finally {
      setSpcSaving(false)
    }
  }

  function resetSpcForm() {
    setSpcForm(EMPTY_SPC_FORM)
    setSpcSaveError('')
    setSpcSaveSuccess('')
    setCapabilityPreview(EMPTY_CAPABILITY_PREVIEW)
  }

  function resetSpcFilters() {
    setSpcFilters(EMPTY_SPC_FILTER_FORM)
  }

  async function handleFetchSpcChart() {
    if (!auth?.accessToken) {
      return
    }

    setSpcChartLoading(true)
    setSpcChartError('')

    try {
      const data = await fetchSpcChartApi(
        {
          parameterName: spcFilters.parameterName || undefined,
          lotId: spcFilters.lotId || undefined,
          workOrderId: spcFilters.workOrderId || undefined,
        },
        auth.accessToken,
      )
      setSpcChartData(data ?? [])
    } catch (error) {
      setSpcChartError(error.message || '관리도 데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setSpcChartLoading(false)
    }
  }

  useEffect(() => {
    if (!auth?.accessToken) return
    setSpcChartLoading(true)
    setSpcChartError('')
    fetchSpcChartApi({}, auth.accessToken)
      .then((data) => setSpcChartData(data ?? []))
      .catch((error) => setSpcChartError(error.message || '관리도 데이터를 불러오는 중 오류가 발생했습니다.'))
      .finally(() => setSpcChartLoading(false))
  }, [auth?.accessToken])

  const hasSpcLotOptions = dashboardData.lots.length > 0
  const selectedSpcWorkOrder = dashboardData.workOrders.find((o) => o.id === spcForm.workOrderId)
  const spcParameterOptions = selectedSpcWorkOrder
    ? (SPC_PARAMETER_TEMPLATES[selectedSpcWorkOrder.processType] ?? [])
    : []
  const filteredSpcWorkOrders = dashboardData.workOrders.filter(
    (order) => !spcForm.lotId || order.lotId === spcForm.lotId,
  )
  const filteredSpcSearchWorkOrders = dashboardData.workOrders.filter(
    (order) => !spcFilters.lotId || order.lotId === spcFilters.lotId,
  )
  const parsedSpcSampleValues = parseSampleValueList(spcForm.sampleValues)
  const spcPreview = calculateSpcStats(parsedSpcSampleValues)
  const filteredSpcRows = dashboardData.spcData.filter((row) => {
    const matchesLot = !spcFilters.lotId || row.lotId === spcFilters.lotId
    const matchesWorkOrder = !spcFilters.workOrderId || row.workOrderId === spcFilters.workOrderId
    const matchesParameter = !spcFilters.parameterName
      || row.parameterName?.toLowerCase().includes(spcFilters.parameterName.trim().toLowerCase())

    if (!matchesLot || !matchesWorkOrder || !matchesParameter) {
      return false
    }

    if (spcFilters.status === 'OUT_OF_CONTROL') {
      return isSpcOutOfControl(row)
    }

    if (spcFilters.status === 'NORMAL') {
      return !isSpcOutOfControl(row)
    }

    return true
  })
  const filteredSpcOutOfControlCount = filteredSpcRows.filter((row) => isSpcOutOfControl(row)).length
  const filteredSpcParameterSummary = summarizeUniqueValues(filteredSpcRows, 'parameterName')

  return {
    spcForm,
    setSpcForm,
    spcSaving,
    spcSaveError,
    spcSaveSuccess,
    handleSpcSubmit,
    resetSpcForm,
    capabilityPreview,
    handleCalculateCapability,
    handleSpcWorkOrderChange,
    handleSpcParameterChange,
    spcParameterOptions,

    spcFilters,
    setSpcFilters,
    resetSpcFilters,

    hasSpcLotOptions,
    filteredSpcWorkOrders,
    filteredSpcSearchWorkOrders,
    parsedSpcSampleValues,
    spcPreview,
    filteredSpcRows,
    filteredSpcOutOfControlCount,
    filteredSpcParameterSummary,
    spcChartData,
    spcChartLoading,
    spcChartError,
    handleFetchSpcChart,
  }
}
