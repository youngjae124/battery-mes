import { useState } from 'react'
import { calculateSpcStats, isSpcOutOfControl, parseOptionalNumber, parseSampleValueList, summarizeUniqueValues } from '../lib/mesFormatters'
import { createSpcDataApi } from '../lib/mesApi'

const EMPTY_SPC_FORM = {
  lotId: '',
  workOrderId: '',
  parameterName: '',
  subgroupNo: 1,
  sampleValues: '',
  ucl: '',
  cl: '',
  lcl: '',
}

const EMPTY_SPC_FILTER_FORM = {
  lotId: '',
  workOrderId: '',
  parameterName: '',
  status: 'ALL',
}

export function useSpcLogic(auth, dashboardData, loadOperationalData) {
  const [spcForm, setSpcForm] = useState(EMPTY_SPC_FORM)
  const [spcFilters, setSpcFilters] = useState(EMPTY_SPC_FILTER_FORM)
  const [spcSaving, setSpcSaving] = useState(false)
  const [spcSaveError, setSpcSaveError] = useState('')
  const [spcSaveSuccess, setSpcSaveSuccess] = useState('')

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

      if ([ucl, cl, lcl].some((value) => value !== null && Number.isNaN(value))) {
        setSpcSaveError('Control limit values must be valid numbers.')
        setSpcSaving(false)
        return
      }

      const payload = {
        lotId: spcForm.lotId,
        workOrderId: spcForm.workOrderId || null,
        parameterName: spcForm.parameterName.trim(),
        subgroupNo,
        sampleValues: JSON.stringify(sampleNumbers),
        xBar: calculatedStats.xBar,
        rangeValue: calculatedStats.rangeValue,
        ucl,
        cl,
        lcl,
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
  }

  function resetSpcFilters() {
    setSpcFilters(EMPTY_SPC_FILTER_FORM)
  }

  const hasSpcLotOptions = dashboardData.lots.length > 0
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
  }
}
