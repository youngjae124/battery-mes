import { useState } from 'react'
import { PROCESS_STEPS } from '../constants/mesConfig'
import { toApiLocalDateTime, toDateTimeInputValue, nowAsDateTimeInputValue } from '../lib/mesFormatters'
import {
  createLotApi,
  createWorkAssignmentApi,
  createWorkOrderApi,
  updateLotApi,
  updateWorkAssignmentApi,
  updateWorkOrderApi,
} from '../lib/mesApi'

export const ASSIGNMENT_ROLE_OPTIONS = ['OPERATOR', 'LEADER', 'INSPECTOR']

function generateSerial(prefix) {
  const d = new Date()
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const seq = String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0') + String(d.getSeconds()).padStart(2, '0')
  return `${prefix}-${date}-${seq}`
}

function createEmptyLotForm() {
  return {
    lotNumber: generateSerial('LOT'),
    productName: '',
    quantity: 1,
    status: 'IN_PROGRESS',
  }
}

const EMPTY_ASSIGNMENT_FORM = {
  workOrderId: '',
  userId: '',
  role: 'OPERATOR',
  startAt: nowAsDateTimeInputValue(),
  endAt: '',
}

function createEmptyWorkOrderForm() {
  return {
    woNumber: generateSerial('WO'),
    lotId: '',
    equipmentId: '',
    processType: PROCESS_STEPS[0].sourceValue,
    status: 'PLANNED',
    targetQty: 1,
    actualQty: 0,
    plannedStart: nowAsDateTimeInputValue(),
    actualStart: '',
    actualEnd: '',
  }
}

export function useProductionLogic(auth, loadOperationalData) {
  const [lotForm, setLotForm] = useState(createEmptyLotForm)
  const [workOrderForm, setWorkOrderForm] = useState(() => createEmptyWorkOrderForm())
  const [assignmentForm, setAssignmentForm] = useState(EMPTY_ASSIGNMENT_FORM)

  const [editingLotId, setEditingLotId] = useState('')
  const [editingWorkOrderId, setEditingWorkOrderId] = useState('')
  const [editingAssignmentId, setEditingAssignmentId] = useState('')

  const [lotSaving, setLotSaving] = useState(false)
  const [workOrderSaving, setWorkOrderSaving] = useState(false)
  const [assignmentSaving, setAssignmentSaving] = useState(false)

  const [lotSaveError, setLotSaveError] = useState('')
  const [lotSaveSuccess, setLotSaveSuccess] = useState('')
  const [workOrderSaveError, setWorkOrderSaveError] = useState('')
  const [workOrderSaveSuccess, setWorkOrderSaveSuccess] = useState('')
  const [assignmentSaveError, setAssignmentSaveError] = useState('')
  const [assignmentSaveSuccess, setAssignmentSaveSuccess] = useState('')

  async function handleLotSubmit(event) {
    event.preventDefault()
    setLotSaving(true)
    setLotSaveError('')
    setLotSaveSuccess('')

    if (!auth?.accessToken) {
      setLotSaving(false)
      setLotSaveError('LOT 저장을 하려면 먼저 로그인해야 합니다.')
      return
    }

    try {
      const payload = {
        lotNumber: lotForm.lotNumber.trim(),
        productName: lotForm.productName.trim(),
        quantity: Number(lotForm.quantity),
        status: lotForm.status,
      }

      if (!payload.lotNumber || !payload.productName || !payload.quantity || payload.quantity < 1) {
        setLotSaveError('LOT 번호, 제품명, 수량은 필수 입력 항목입니다.')
        setLotSaving(false)
        return
      }

      if (editingLotId) {
        await updateLotApi(editingLotId, payload, auth.accessToken)
        setLotSaveSuccess('LOT이 수정되었습니다.')
      } else {
        await createLotApi(payload, auth.accessToken)
        setLotSaveSuccess('LOT이 생성되었습니다.')
      }

      resetLotForm()
      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setLotSaveError(error.message || 'LOT 저장에 실패했습니다.')
    } finally {
      setLotSaving(false)
    }
  }

  async function handleWorkOrderSubmit(event) {
    event.preventDefault()
    setWorkOrderSaving(true)
    setWorkOrderSaveError('')
    setWorkOrderSaveSuccess('')

    if (!auth?.accessToken) {
      setWorkOrderSaving(false)
      setWorkOrderSaveError('작업지시 저장을 하려면 먼저 로그인해야 합니다.')
      return
    }

    try {
      const payload = {
        woNumber: workOrderForm.woNumber.trim(),
        lotId: workOrderForm.lotId,
        equipmentId: workOrderForm.equipmentId,
        processType: workOrderForm.processType,
        status: workOrderForm.status,
        targetQty: Number(workOrderForm.targetQty),
        actualQty: Number(workOrderForm.actualQty),
        plannedStart: toApiLocalDateTime(workOrderForm.plannedStart),
        actualStart: toApiLocalDateTime(workOrderForm.actualStart),
        actualEnd: toApiLocalDateTime(workOrderForm.actualEnd),
      }

      if (!payload.woNumber || !payload.lotId || !payload.equipmentId || !payload.plannedStart || payload.targetQty < 1) {
        setWorkOrderSaveError('작업지시 번호, LOT, 설비, 계획 시작 시간은 필수 입력 항목입니다.')
        setWorkOrderSaving(false)
        return
      }

      if (editingWorkOrderId) {
        await updateWorkOrderApi(editingWorkOrderId, payload, auth.accessToken)
        setWorkOrderSaveSuccess('작업지시가 수정되었습니다.')
      } else {
        await createWorkOrderApi(payload, auth.accessToken)
        setWorkOrderSaveSuccess('작업지시가 생성되었습니다.')
      }

      resetWorkOrderForm()
      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setWorkOrderSaveError(error.message || '작업지시 저장에 실패했습니다.')
    } finally {
      setWorkOrderSaving(false)
    }
  }

  async function handleAssignmentSubmit(event) {
    event.preventDefault()
    setAssignmentSaving(true)
    setAssignmentSaveError('')
    setAssignmentSaveSuccess('')

    if (!auth?.accessToken) {
      setAssignmentSaving(false)
      setAssignmentSaveError('작업 배정을 하려면 먼저 로그인해야 합니다.')
      return
    }

    try {
      if (!assignmentForm.workOrderId || !assignmentForm.userId || !assignmentForm.startAt) {
        setAssignmentSaveError('작업지시, 작업자, 시작 시간은 필수 입력 항목입니다.')
        setAssignmentSaving(false)
        return
      }

      const payload = {
        workOrderId: assignmentForm.workOrderId,
        userId: assignmentForm.userId,
        role: assignmentForm.role,
        startAt: toApiLocalDateTime(assignmentForm.startAt),
        endAt: toApiLocalDateTime(assignmentForm.endAt),
      }

      if (editingAssignmentId) {
        await updateWorkAssignmentApi(editingAssignmentId, payload, auth.accessToken)
        setAssignmentSaveSuccess('작업 배정이 수정되었습니다.')
      } else {
        await createWorkAssignmentApi(payload, auth.accessToken)
        setAssignmentSaveSuccess('작업 배정이 생성되었습니다.')
      }

      resetAssignmentForm()
      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setAssignmentSaveError(error.message || '작업 배정 저장에 실패했습니다.')
    } finally {
      setAssignmentSaving(false)
    }
  }

  function startLotEdit(lot) {
    setEditingLotId(lot.id)
    setLotSaveError('')
    setLotSaveSuccess('')
    setLotForm({
      lotNumber: lot.lotNumber,
      productName: lot.productName,
      quantity: lot.quantity,
      status: lot.status,
    })
  }

  function resetLotForm() {
    setEditingLotId('')
    setLotForm(createEmptyLotForm())
  }

  function startWorkOrderEdit(order) {
    setEditingWorkOrderId(order.id)
    setWorkOrderSaveError('')
    setWorkOrderSaveSuccess('')
    setWorkOrderForm({
      woNumber: order.woNumber,
      lotId: order.lotId,
      equipmentId: order.equipmentId,
      processType: order.processType,
      status: order.status,
      targetQty: order.targetQty,
      actualQty: order.actualQty,
      plannedStart: toDateTimeInputValue(order.plannedStart),
      actualStart: toDateTimeInputValue(order.actualStart),
      actualEnd: toDateTimeInputValue(order.actualEnd),
    })
  }

  function resetWorkOrderForm() {
    setEditingWorkOrderId('')
    setWorkOrderForm(createEmptyWorkOrderForm())
  }

  function startAssignmentEdit(assignment) {
    setEditingAssignmentId(assignment.id)
    setAssignmentSaveError('')
    setAssignmentSaveSuccess('')
    setAssignmentForm({
      workOrderId: assignment.workOrderId,
      userId: assignment.userId,
      role: assignment.role,
      startAt: toDateTimeInputValue(assignment.startAt),
      endAt: toDateTimeInputValue(assignment.endAt),
    })
  }

  function resetAssignmentForm() {
    setEditingAssignmentId('')
    setAssignmentForm({
      ...EMPTY_ASSIGNMENT_FORM,
      startAt: nowAsDateTimeInputValue(),
    })
  }

  return {
    lotForm,
    setLotForm,
    editingLotId,
    lotSaving,
    lotSaveError,
    lotSaveSuccess,
    handleLotSubmit,
    startLotEdit,
    resetLotForm,

    workOrderForm,
    setWorkOrderForm,
    editingWorkOrderId,
    workOrderSaving,
    workOrderSaveError,
    workOrderSaveSuccess,
    handleWorkOrderSubmit,
    startWorkOrderEdit,
    resetWorkOrderForm,

    assignmentForm,
    setAssignmentForm,
    editingAssignmentId,
    assignmentSaving,
    assignmentSaveError,
    assignmentSaveSuccess,
    handleAssignmentSubmit,
    startAssignmentEdit,
    resetAssignmentForm,
  }
}
