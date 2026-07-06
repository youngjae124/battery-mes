import { useState } from 'react'
import { parseOptionalNumber, toApiLocalDateTime, toDateTimeInputValue, toInputNumberValue, nowAsDateTimeInputValue } from '../lib/mesFormatters'
import { createEquipmentLogApi, createProcessParamApi, updateEquipmentApi, updateProcessParamApi } from '../lib/mesApi'

const EMPTY_EQUIPMENT_FORM = {
  eqCode: '',
  eqName: '',
  eqType: '',
  status: 'IDLE',
  lastPmAt: '',
  logType: 'ALERT',
  logDescription: '',
}

const PROCESS_PARAM_TEMPLATES = {
  '전극':  { paramName: 'Temperature', unit: 'degC', upperLimit: '35',  lowerLimit: '15' },
  '조립':  { paramName: 'Pressure',    unit: 'kPa',  upperLimit: '500', lowerLimit: '100' },
  '화성': { paramName: 'Voltage',     unit: 'V',    upperLimit: '4.3', lowerLimit: '2.5' },
  '검사':  { paramName: 'Resistance',  unit: 'mΩ',   upperLimit: '50',  lowerLimit: '0' },
}

function createEmptyProcessParamForm() {
  return {
    workOrderId: '',
    paramName: '',
    targetValue: '',
    actualValue: '',
    unit: '',
    upperLimit: '',
    lowerLimit: '',
    measuredAt: nowAsDateTimeInputValue(),
  }
}

export function useEquipmentLogic(auth, dashboardData, loadOperationalData) {
  const [equipmentForm, setEquipmentForm] = useState(EMPTY_EQUIPMENT_FORM)
  const [processParamForm, setProcessParamForm] = useState(createEmptyProcessParamForm)

  const [editingEquipmentId, setEditingEquipmentId] = useState('')
  const [editingProcessParamId, setEditingProcessParamId] = useState('')

  const [equipmentSaving, setEquipmentSaving] = useState(false)
  const [processParamSaving, setProcessParamSaving] = useState(false)

  const [equipmentSaveError, setEquipmentSaveError] = useState('')
  const [equipmentSaveSuccess, setEquipmentSaveSuccess] = useState('')
  const [processParamSaveError, setProcessParamSaveError] = useState('')
  const [processParamSaveSuccess, setProcessParamSaveSuccess] = useState('')

  async function handleEquipmentSubmit(event) {
    event.preventDefault()
    setEquipmentSaving(true)
    setEquipmentSaveError('')
    setEquipmentSaveSuccess('')

    if (!auth?.accessToken) {
      setEquipmentSaving(false)
      setEquipmentSaveError('설비 저장을 하려면 먼저 로그인해야 합니다.')
      return
    }

    if (!editingEquipmentId) {
      setEquipmentSaving(false)
      setEquipmentSaveError('수정할 설비를 먼저 선택해 주세요.')
      return
    }

    try {
      const payload = {
        eqCode: equipmentForm.eqCode.trim(),
        eqName: equipmentForm.eqName.trim(),
        eqType: equipmentForm.eqType.trim(),
        status: equipmentForm.status,
        lastPmAt: toApiLocalDateTime(equipmentForm.lastPmAt),
      }

      if (!payload.eqCode || !payload.eqName || !payload.eqType) {
        setEquipmentSaveError('설비 코드, 설비명, 설비 유형은 필수 입력 항목입니다.')
        setEquipmentSaving(false)
        return
      }

      await updateEquipmentApi(editingEquipmentId, payload, auth.accessToken)

      if (equipmentForm.logDescription.trim()) {
        await createEquipmentLogApi(
          {
            equipmentId: editingEquipmentId,
            logType: equipmentForm.logType,
            description: equipmentForm.logDescription.trim(),
            occurredAt: toApiLocalDateTime(nowAsDateTimeInputValue()),
          },
          auth.accessToken,
        )
      }

      setEquipmentSaveSuccess('설비 정보와 로그가 저장되었습니다.')
      resetEquipmentForm()
      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setEquipmentSaveError(error.message || '설비 저장에 실패했습니다.')
    } finally {
      setEquipmentSaving(false)
    }
  }

  async function handleProcessParamSubmit(event) {
    event.preventDefault()
    setProcessParamSaving(true)
    setProcessParamSaveError('')
    setProcessParamSaveSuccess('')

    if (!auth?.accessToken) {
      setProcessParamSaving(false)
      setProcessParamSaveError('공정 파라미터 저장을 하려면 먼저 로그인해야 합니다.')
      return
    }

    try {
      const targetValue = parseOptionalNumber(processParamForm.targetValue)
      const actualValue = parseOptionalNumber(processParamForm.actualValue)
      const upperLimit = parseOptionalNumber(processParamForm.upperLimit)
      const lowerLimit = parseOptionalNumber(processParamForm.lowerLimit)

      if ([targetValue, actualValue, upperLimit, lowerLimit].some((value) => value !== null && Number.isNaN(value))) {
        setProcessParamSaveError('파라미터 값은 숫자만 입력할 수 있습니다.')
        setProcessParamSaving(false)
        return
      }

      if (!processParamForm.workOrderId || !processParamForm.paramName.trim() || actualValue === null || !processParamForm.unit.trim()) {
        setProcessParamSaveError('작업지시, 파라미터명, 실측값, 단위는 필수 입력 항목입니다.')
        setProcessParamSaving(false)
        return
      }

      if (lowerLimit !== null && upperLimit !== null && lowerLimit > upperLimit) {
        setProcessParamSaveError('하한값은 상한값보다 클 수 없습니다.')
        setProcessParamSaving(false)
        return
      }

      const payload = {
        workOrderId: processParamForm.workOrderId,
        paramName: processParamForm.paramName.trim(),
        targetValue,
        actualValue,
        unit: processParamForm.unit.trim(),
        upperLimit,
        lowerLimit,
        measuredAt: toApiLocalDateTime(processParamForm.measuredAt),
      }

      if (editingProcessParamId) {
        await updateProcessParamApi(editingProcessParamId, payload, auth.accessToken)
        setProcessParamSaveSuccess('공정 파라미터가 수정되었습니다.')
      } else {
        await createProcessParamApi(payload, auth.accessToken)
        setProcessParamSaveSuccess('공정 파라미터가 생성되었습니다.')
      }

      resetProcessParamForm()
      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setProcessParamSaveError(error.message || '공정 파라미터 저장에 실패했습니다.')
    } finally {
      setProcessParamSaving(false)
    }
  }

  function startEquipmentEdit(equipment) {
    setEditingEquipmentId(equipment.id)
    setEquipmentSaveError('')
    setEquipmentSaveSuccess('')
    setEquipmentForm({
      eqCode: equipment.eqCode,
      eqName: equipment.eqName,
      eqType: equipment.eqType,
      status: equipment.status,
      lastPmAt: toDateTimeInputValue(equipment.lastPmAt),
      logType: equipment.status === 'DOWN' ? 'BREAKDOWN' : equipment.status === 'PM' ? 'PM' : 'ALERT',
      logDescription: '',
    })
  }

  function resetEquipmentForm() {
    setEditingEquipmentId('')
    setEquipmentForm(EMPTY_EQUIPMENT_FORM)
  }

  function startProcessParamEdit(processParam) {
    setEditingProcessParamId(processParam.id)
    setProcessParamSaveError('')
    setProcessParamSaveSuccess('')
    setProcessParamForm({
      workOrderId: processParam.workOrderId,
      paramName: processParam.paramName,
      targetValue: toInputNumberValue(processParam.targetValue),
      actualValue: toInputNumberValue(processParam.actualValue),
      unit: processParam.unit,
      upperLimit: toInputNumberValue(processParam.upperLimit),
      lowerLimit: toInputNumberValue(processParam.lowerLimit),
      measuredAt: toDateTimeInputValue(processParam.measuredAt),
    })
  }

  function resetProcessParamForm() {
    setEditingProcessParamId('')
    setProcessParamForm(createEmptyProcessParamForm())
  }

  const selectedEquipmentSummary = editingEquipmentId
    ? `${equipmentForm.eqCode} / ${equipmentForm.eqName}`
    : '설비를 먼저 선택하면 현재 상태와 로그 대상을 함께 확인할 수 있습니다.'
  const selectedEquipmentLogs = editingEquipmentId
    ? dashboardData.equipmentLogs.filter((log) => log.equipmentId === editingEquipmentId)
    : dashboardData.equipmentLogs
  const selectedProcessParams = processParamForm.workOrderId
    ? dashboardData.processParams.filter((processParam) => processParam.workOrderId === processParamForm.workOrderId)
    : dashboardData.processParams

  function handleProcessParamWorkOrderChange(workOrderId) {
    const order = dashboardData.workOrders.find((o) => o.id === workOrderId)
    const template = order ? PROCESS_PARAM_TEMPLATES[order.processType] : null
    setProcessParamForm((c) => ({
      ...c,
      workOrderId,
      ...(template ? {
        paramName: template.paramName,
        unit: template.unit,
        upperLimit: template.upperLimit,
        lowerLimit: template.lowerLimit,
      } : {}),
    }))
  }

  return {
    equipmentForm,
    setEquipmentForm,
    editingEquipmentId,
    equipmentSaving,
    equipmentSaveError,
    equipmentSaveSuccess,
    handleEquipmentSubmit,
    startEquipmentEdit,
    resetEquipmentForm,
    selectedEquipmentSummary,
    selectedEquipmentLogs,

    processParamForm,
    setProcessParamForm,
    editingProcessParamId,
    processParamSaving,
    processParamSaveError,
    processParamSaveSuccess,
    handleProcessParamSubmit,
    handleProcessParamWorkOrderChange,
    startProcessParamEdit,
    resetProcessParamForm,
    selectedProcessParams,
  }
}
