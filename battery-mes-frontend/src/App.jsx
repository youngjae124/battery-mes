import { useCallback, useEffect, useState } from 'react'
import './App.css'
import Layout from './components/common/Layout'
import Sidebar from './components/common/Sidebar'
import MainPage from './pages/MainPage'
import {
  AUTH_SESSION_EVENT,
  AUTH_STORAGE_KEY,
  DEFECT_SEVERITY_LABELS,
  EQUIPMENT_LOG_TYPE_LABELS,
  EQUIPMENT_STATUS_LABELS,
  getDisplayLabel,
  INSPECTION_RESULT_LABELS,
  INSPECTION_TYPE_LABELS,
  LOT_STATUS_LABELS,
  PROCESS_STEPS,
  USER_ROLES,
  USER_ROLE_LABELS,
  WORK_ORDER_STATUS_LABELS,
} from './constants/mesConfig'
import { SECTION_MENU } from './constants/sectionMenu'
import {
  clearAuthSession,
  createBomApi,
  createDefectApi,
  createEquipmentLogApi,
  createInspectionApi,
  createLotApi,
  createMaterialApi,
  createProcessParamApi,
  createSpcDataApi,
  createWorkAssignmentApi,
  createWorkOrderApi,
  fetchDashboardBundle,
  fetchOperationalBundle,
  loginApi,
  registerApi,
  updateBomApi,
  updateDefectApi,
  updateEquipmentApi,
  updateInspectionApi,
  updateLotApi,
  updateMaterialApi,
  updateProcessParamApi,
  updateWorkAssignmentApi,
  updateWorkOrderApi,
} from './lib/mesApi'

const EMPTY_DASHBOARD = {
  users: [],
  lots: [],
  workOrders: [],
  assignments: [],
  equipment: [],
  equipmentLogs: [],
  processParams: [],
  materials: [],
  boms: [],
  spcData: [],
  inspections: [],
  defects: [],
  defectTypes: [],
  inspectionSummary: null,
  defectSummary: null,
}

const EMPTY_DASHBOARD_INSIGHTS = {
  kpis: null,
  equipmentStatus: [],
  processStatus: [],
  qualityTrend: [],
  defectCategories: [],
}

const EMPTY_LOT_FORM = {
  lotNumber: '',
  productName: '',
  quantity: 1,
  status: 'IN_PROGRESS',
}

const EMPTY_EQUIPMENT_FORM = {
  eqCode: '',
  eqName: '',
  eqType: '',
  status: 'IDLE',
  lastPmAt: '',
  logType: 'ALERT',
  logDescription: '',
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

const ASSIGNMENT_ROLE_OPTIONS = ['OPERATOR', 'LEADER', 'INSPECTOR']
const ASSIGNMENT_ROLE_LABELS = {
  OPERATOR: '\uC791\uC5C5\uC790',
  LEADER: '\uB9AC\uB354',
  INSPECTOR: '\uAC80\uC0AC\uC790',
}

const EMPTY_ASSIGNMENT_FORM = {
  workOrderId: '',
  userId: '',
  role: 'OPERATOR',
  startAt: toDateTimeInputValue(new Date().toISOString()),
  endAt: '',
}

const EMPTY_PROCESS_PARAM_FORM = {
  workOrderId: '',
  paramName: '',
  targetValue: '',
  actualValue: '',
  unit: '',
  upperLimit: '',
  lowerLimit: '',
  measuredAt: toDateTimeInputValue(new Date().toISOString()),
}

const MATERIAL_TYPE_OPTIONS = ['RAW', 'SEMI', 'CONSUMABLE']

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

function createEmptyWorkOrderForm() {
  return {
    woNumber: '',
    lotId: '',
    equipmentId: '',
    processType: PROCESS_STEPS[0].sourceValue,
    status: 'PLANNED',
    targetQty: 1,
    actualQty: 0,
    plannedStart: toDateTimeInputValue(new Date().toISOString()),
    actualStart: '',
    actualEnd: '',
  }
}

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ADMIN',
  })
  const [auth, setAuth] = useState(() => loadStoredAuth())
  const [backendState, setBackendState] = useState({
    status: 'loading',
    message: '\uBC31\uC5D4\uB4DC \uC5F0\uACB0 \uC0C1\uD0DC\uB97C \uD655\uC778\uD558\uB294 \uC911\uC785\uB2C8\uB2E4.',
  })
  const [loading, setLoading] = useState(false)
  const [lotSaving, setLotSaving] = useState(false)
  const [workOrderSaving, setWorkOrderSaving] = useState(false)
  const [assignmentSaving, setAssignmentSaving] = useState(false)
  const [equipmentSaving, setEquipmentSaving] = useState(false)
  const [processParamSaving, setProcessParamSaving] = useState(false)
  const [materialSaving, setMaterialSaving] = useState(false)
  const [bomSaving, setBomSaving] = useState(false)
  const [spcSaving, setSpcSaving] = useState(false)
  const [inspectionSaving, setInspectionSaving] = useState(false)
  const [defectSaving, setDefectSaving] = useState(false)

  const [loginError, setLoginError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState('')
  const [dashboardError, setDashboardError] = useState('')
  const [dashboardNotice, setDashboardNotice] = useState('')
  const [lotSaveError, setLotSaveError] = useState('')
  const [lotSaveSuccess, setLotSaveSuccess] = useState('')
  const [workOrderSaveError, setWorkOrderSaveError] = useState('')
  const [workOrderSaveSuccess, setWorkOrderSaveSuccess] = useState('')
  const [assignmentSaveError, setAssignmentSaveError] = useState('')
  const [assignmentSaveSuccess, setAssignmentSaveSuccess] = useState('')
  const [equipmentSaveError, setEquipmentSaveError] = useState('')
  const [equipmentSaveSuccess, setEquipmentSaveSuccess] = useState('')
  const [processParamSaveError, setProcessParamSaveError] = useState('')
  const [processParamSaveSuccess, setProcessParamSaveSuccess] = useState('')
  const [materialSaveError, setMaterialSaveError] = useState('')
  const [materialSaveSuccess, setMaterialSaveSuccess] = useState('')
  const [bomSaveError, setBomSaveError] = useState('')
  const [bomSaveSuccess, setBomSaveSuccess] = useState('')
  const [spcSaveError, setSpcSaveError] = useState('')
  const [spcSaveSuccess, setSpcSaveSuccess] = useState('')
  const [inspectionSaveError, setInspectionSaveError] = useState('')
  const [inspectionSaveSuccess, setInspectionSaveSuccess] = useState('')
  const [defectSaveError, setDefectSaveError] = useState('')
  const [defectSaveSuccess, setDefectSaveSuccess] = useState('')

  const [dashboardData, setDashboardData] = useState(EMPTY_DASHBOARD)
  const [dashboardInsights, setDashboardInsights] = useState(EMPTY_DASHBOARD_INSIGHTS)
  const [lotForm, setLotForm] = useState(EMPTY_LOT_FORM)
  const [workOrderForm, setWorkOrderForm] = useState(() => createEmptyWorkOrderForm())
  const [assignmentForm, setAssignmentForm] = useState(EMPTY_ASSIGNMENT_FORM)
  const [equipmentForm, setEquipmentForm] = useState(EMPTY_EQUIPMENT_FORM)
  const [processParamForm, setProcessParamForm] = useState(EMPTY_PROCESS_PARAM_FORM)
  const [materialForm, setMaterialForm] = useState(EMPTY_MATERIAL_FORM)
  const [bomForm, setBomForm] = useState(EMPTY_BOM_FORM)
  const [spcForm, setSpcForm] = useState(EMPTY_SPC_FORM)
  const [spcFilters, setSpcFilters] = useState(EMPTY_SPC_FILTER_FORM)
  const [inspectionForm, setInspectionForm] = useState(EMPTY_INSPECTION_FORM)
  const [defectForm, setDefectForm] = useState(EMPTY_DEFECT_FORM)

  const [editingLotId, setEditingLotId] = useState('')
  const [editingWorkOrderId, setEditingWorkOrderId] = useState('')
  const [editingAssignmentId, setEditingAssignmentId] = useState('')
  const [editingEquipmentId, setEditingEquipmentId] = useState('')
  const [editingProcessParamId, setEditingProcessParamId] = useState('')
  const [editingMaterialId, setEditingMaterialId] = useState('')
  const [editingBomId, setEditingBomId] = useState('')
  const [editingInspectionId, setEditingInspectionId] = useState('')
  const [editingDefectId, setEditingDefectId] = useState('')
  const [activeSection, setActiveSection] = useState('main')
  const [qualityView, setQualityView] = useState('inspection')

  const loadOperationalData = useCallback(async (accessToken, role = 'ADMIN') => {
    setLoading(true)
    setDashboardError('')
    setDashboardNotice('')

    try {
      const [bundle, insightBundle] = await Promise.all([
        fetchOperationalBundle(accessToken, role),
        fetchDashboardBundle(accessToken, role).catch((error) => ({
          ...EMPTY_DASHBOARD_INSIGHTS,
          errors: [`Dashboard: ${error.message}`],
        })),
      ])

      setDashboardData({
        users: bundle.users,
        lots: bundle.lots,
        workOrders: bundle.workOrders,
        assignments: bundle.assignments,
        equipment: bundle.equipment,
        equipmentLogs: bundle.equipmentLogs,
        processParams: bundle.processParams,
        materials: bundle.materials,
        boms: bundle.boms,
        spcData: bundle.spcData,
        inspections: bundle.inspections,
        defects: bundle.defects,
        defectTypes: bundle.defectTypes,
        inspectionSummary: bundle.inspectionSummary,
        defectSummary: bundle.defectSummary,
      })

      setDashboardInsights({
        kpis: insightBundle.kpis,
        equipmentStatus: insightBundle.equipmentStatus,
        processStatus: insightBundle.processStatus,
        qualityTrend: insightBundle.qualityTrend,
        defectCategories: insightBundle.defectCategories,
      })

      const notices = [...bundle.errors, ...(insightBundle.errors ?? [])]
      if (notices.length > 0) {
        setDashboardNotice(notices.join(' / '))
      }

      return bundle
    } catch (error) {
      setDashboardError(error.message || '???⑤㈇猿 ???Β????? ??됰씭??????몄툗 濚?????곸씔??좊읈? ?袁⑸즵獒뺣뎾????怨?????덊렡.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkBackend()
  }, [])

  useEffect(() => {
    function syncAuthFromStorage(reason = 'updated') {
      const nextAuth = loadStoredAuth()
      setAuth(nextAuth)

      if (!nextAuth && reason === 'expired') {
        setDashboardData(EMPTY_DASHBOARD)
        setDashboardInsights(EMPTY_DASHBOARD_INSIGHTS)
        setDashboardError('')
        setDashboardNotice('?嶺뚮ㅎ????癲ル슢???彛??筌??????? ???怨뺣빰 ?棺??짆??嶺뚮ㅏ援????낆뒩??뗫빝??')
        setLoginError('?嶺뚮ㅎ????癲ル슢???彛??筌??????? ???怨뺣빰 ?棺??짆??嶺뚮ㅏ援????낆뒩??뗫빝??')
        setLoginSuccess('')
        setRegisterError('')
        setRegisterSuccess('')
        setAuthMode('login')
        setActiveSection('main')
        setQualityView('inspection')
        setLoginForm({
          email: '',
          password: '',
        })
        setRegisterForm({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'ADMIN',
        })
        resetLotForm()
        resetWorkOrderForm()
        resetAssignmentForm()
        resetEquipmentForm()
        resetProcessParamForm()
        resetMaterialForm()
        resetBomForm()
        resetSpcFilters()
        resetSpcForm()
        resetInspectionForm()
        resetDefectForm()
      }
    }

    function handleStorage(event) {
      if (event.key && event.key !== AUTH_STORAGE_KEY) {
        return
      }

      syncAuthFromStorage('logout')
    }

    function handleAuthSessionEvent(event) {
      syncAuthFromStorage(event.detail?.reason ?? 'updated')
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(AUTH_SESSION_EVENT, handleAuthSessionEvent)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(AUTH_SESSION_EVENT, handleAuthSessionEvent)
    }
  }, [])

  // ?棺??짆????嶺뚮ㅎ?????袁⑸즴??????????⑤㈇猿 ???Β????? ???怨뺣빰 ???ㅼ굣???筌먲퐢??
  useEffect(() => {
    if (!auth?.accessToken) {
      setDashboardData(EMPTY_DASHBOARD)
      setDashboardInsights(EMPTY_DASHBOARD_INSIGHTS)
      return
    }

    loadOperationalData(auth.accessToken, auth.role)
  }, [auth?.accessToken, auth?.role, loadOperationalData])

  useEffect(() => {
    if (!canAccessSection(auth?.role, activeSection, Boolean(auth?.accessToken))) {
      setActiveSection('main')
    }
  }, [activeSection, auth?.accessToken, auth?.role])

  async function checkBackend() {
    try {
      const response = await fetch('/v3/api-docs')

      if (!response.ok) {
        throw new Error('Backend check failed')
      }

      setBackendState({
        status: 'connected',
        message: '?袁⑸즲??援????筌먦끉裕??좊읈? ?嶺뚮Ĳ?놅쭕?????덈틖 濚욌꼬?댄꺍?????덊렡. ?棺??짆????????⑤㈇猿 ???Β????? ?釉뚰?????寃뗏????쒓낯????????怨?????덊렡.',
      })
    } catch {
      setBackendState({
        status: 'disconnected',
        message: '?袁⑸즲??援????筌먦끉裕?????ㅼ뒦????????⑤８?????덊렡. Spring Boot ???ャ뀖??域????⑤젰??????덈틖 ???ㅺ컼????嶺뚮Ĳ?됮????낆뒩??뗫빝??',
      })
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setLoading(true)
    setLoginError('')
    setLoginSuccess('')
    setRegisterError('')
    setRegisterSuccess('')

    try {
      const result = await loginApi(loginForm)
      const nextAuth = buildAuthSession({
        email: loginForm.email,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenType: result.tokenType,
      })
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth))
      setAuth(nextAuth)
      setLoginSuccess('?棺??짆??嶺뚮ㅎ????濚밸Þ?볠쾮???怨?????덊렡. ???⑤㈇猿 ???Β????? ??됰씭??????몄툗 濚욌꼬?댄꺍?????덊렡.')
    } catch (error) {
      setLoginError(error.message || '?棺??짆??嶺뚮ㅎ???????됰꽡???怨?????덊렡.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(event) {
    event.preventDefault()
    setLoading(true)
    setRegisterError('')
    setRegisterSuccess('')
    setLoginError('')
    setLoginSuccess('')

    const payload = {
      name: registerForm.name.trim(),
      email: registerForm.email.trim().toLowerCase(),
      password: registerForm.password,
      role: registerForm.role,
    }

    if (!payload.name || !payload.email || !payload.password) {
      setRegisterError('????? ???嶺?? ?????類???? ??援????? ??ш끽維??????곸죷????낇돲??')
      setLoading(false)
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError('?????類????? ?????類?????嶺뚮Ĳ?됮???좊즴?????繹먮봾萸???⑤；????筌뤾퍓???')
      setLoading(false)
      return
    }

    try {
      await registerApi(payload)
      setRegisterSuccess('?????⑤쨬??쎛???怨룻꼧 ??ш끽維???筌??????? ??獄쏅똻?????節뚮쳮????⑥???棺??짆??嶺뚮ㅏ援????낆뒩??뗫빝??')
      setLoginForm({
        email: payload.email,
        password: payload.password,
      })
      setRegisterForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: registerForm.role,
      })
      setAuthMode('login')
    } catch (error) {
      setRegisterError(error.message || '?????⑤쨬??쎛????깅군 ????됰꽡???怨?????덊렡.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLotSubmit(event) {
    event.preventDefault()
    setLotSaving(true)
    setLotSaveError('')
    setLotSaveSuccess('')

    if (!auth?.accessToken) {
      setLotSaving(false)
      setLotSaveError('LOT ??????ш끽維???棺??짆??嶺뚮ㅎ?닻???ш끽維???筌뤾퍓???')
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
        setLotSaveError('LOT ?類???? ????癲? ??嚥???? ??ш끽維??????곸죷????낇돲??')
        setLotSaving(false)
        return
      }

      if (editingLotId) {
        await updateLotApi(editingLotId, payload, auth.accessToken)
        setLotSaveSuccess('LOT??좊읈? ???쒓낯???筌???????')
      } else {
        await createLotApi(payload, auth.accessToken)
        setLotSaveSuccess('LOT??좊읈? ?濚밸Ŧ援욃ㅇ??筌???????')
      }

      resetLotForm()
      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setLotSaveError(error.message || 'LOT ?????묎덩?????됰꽡???怨?????덊렡.')
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
      setWorkOrderSaveError('??????먯땡?堉온????????ш끽維???棺??짆??嶺뚮ㅎ?닻???ш끽維???筌뤾퍓???')
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
        setWorkOrderSaveError('??????먯땡?堉온???類???? LOT, ????щ４, 癲ル슢?꾤땟?룹춻???嚥??? ??節뚮쳯????筌믨퀣援??? ??ш끽維?????낇돲??')
        setWorkOrderSaving(false)
        return
      }

      if (editingWorkOrderId) {
        await updateWorkOrderApi(editingWorkOrderId, payload, auth.accessToken)
        setWorkOrderSaveSuccess('??????먯땡?堉온??? ???쒓낯???筌???????')
      } else {
        await createWorkOrderApi(payload, auth.accessToken)
        setWorkOrderSaveSuccess('??????먯땡?堉온??? ?濚밸Ŧ援욃ㅇ??筌???????')
      }

      resetWorkOrderForm()
      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setWorkOrderSaveError(error.message || '??????먯땡?堉온???????묎덩?????됰꽡???怨?????덊렡.')
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
      setAssignmentSaveError('??????먮쎗?袁ぢ??????濚왿몾????醫딅뱠 ?棺??짆??嶺뚮ㅎ?닻???ш끽維???筌뤾퍓???')
      return
    }

    try {
      if (!assignmentForm.workOrderId || !assignmentForm.userId || !assignmentForm.startAt) {
        setAssignmentSaveError('??????먯땡?堉온?? ??????? ??筌믨퀣援??繹먮굝六????ш끽維?????낇돲??')
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
        setAssignmentSaveSuccess('??????먮쎗?袁ぢ??????쒓낯???筌???????')
      } else {
        await createWorkAssignmentApi(payload, auth.accessToken)
        setAssignmentSaveSuccess('??????먮쎗?袁ぢ????濚밸Ŧ援욃ㅇ??筌???????')
      }

      resetAssignmentForm()
      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setAssignmentSaveError(error.message || '??????먮쎗?袁ぢ???????묎덩?????됰꽡???怨?????덊렡.')
    } finally {
      setAssignmentSaving(false)
    }
  }

  async function handleEquipmentSubmit(event) {
    event.preventDefault()
    setEquipmentSaving(true)
    setEquipmentSaveError('')
    setEquipmentSaveSuccess('')

    if (!auth?.accessToken) {
      setEquipmentSaving(false)
      setEquipmentSaveError('????щ４ ??????ш끽維???棺??짆??嶺뚮ㅎ?닻???ш끽維???筌뤾퍓???')
      return
    }

    if (!editingEquipmentId) {
      setEquipmentSaving(false)
      setEquipmentSaveError('???쒓낯???????щ４???沃섅굥?? ???ャ뀕?????낆뒩??뗫빝??')
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
        setEquipmentSaveError('????щ４ ?熬곣뫀??? ????щ４癲? ????щ４ ???レ챺??? ??ш끽維?????낇돲??')
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
            occurredAt: toApiLocalDateTime(new Date().toISOString().slice(0, 16)),
          },
          auth.accessToken,
        )
      }

      setEquipmentSaveSuccess('????щ４ ???ㅺ컼?얜쑜琉??쎛 ???쒓낯???筌???????')
      resetEquipmentForm()
      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setEquipmentSaveError(error.message || '????щ４ ?????묎덩?????됰꽡???怨?????덊렡.')
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
      setProcessParamSaveError('???살쓴??????앗꾩쒀?濡?뎄?臾뺥맄筌????濚왿몾????醫딅뱠 ?棺??짆??嶺뚮ㅎ?닻???ш끽維???筌뤾퍓???')
      return
    }

    try {
      const targetValue = parseOptionalNumber(processParamForm.targetValue)
      const actualValue = parseOptionalNumber(processParamForm.actualValue)
      const upperLimit = parseOptionalNumber(processParamForm.upperLimit)
      const lowerLimit = parseOptionalNumber(processParamForm.lowerLimit)

      if ([targetValue, actualValue, upperLimit, lowerLimit].some((value) => value !== null && Number.isNaN(value))) {
        setProcessParamSaveError('????앗꾩쒀?濡?뎄????좊즴?????????뱀땡?????곸죷???⑤；????筌뤾퍓???')
        setProcessParamSaving(false)
        return
      }

      if (!processParamForm.workOrderId || !processParamForm.paramName.trim() || actualValue === null || !processParamForm.unit.trim()) {
        setProcessParamSaveError('??????먯땡?堉온?? ????앗꾩쒀?濡?뎄?臾뺥맔壤? ?????? ???쒙쭕????ш끽維?????낇돲??')
        setProcessParamSaving(false)
        return
      }

      if (lowerLimit !== null && upperLimit !== null && lowerLimit > upperLimit) {
        setProcessParamSaveError('???얜Ŧ???좊즴?? ???ㅺ강?깆뜽琉????????????⑤８?????덊렡.')
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
        setProcessParamSaveSuccess('???살쓴??????앗꾩쒀?濡?뎄?臾뺥맀筌? ???쒓낯???筌???????')
      } else {
        await createProcessParamApi(payload, auth.accessToken)
        setProcessParamSaveSuccess('???살쓴??????앗꾩쒀?濡?뎄?臾뺥맀筌? ?濚밸Ŧ援욃ㅇ??筌???????')
      }

      resetProcessParamForm()
      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setProcessParamSaveError(error.message || '???살쓴??????앗꾩쒀?濡?뎄???????묎덩?????됰꽡???怨?????덊렡.')
    } finally {
      setProcessParamSaving(false)
    }
  }

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

  async function handleInspectionSubmit(event) {
    event.preventDefault()
    setInspectionSaving(true)
    setInspectionSaveError('')
    setInspectionSaveSuccess('')

    if (!auth?.accessToken) {
      setInspectionSaving(false)
      setInspectionSaveError('?濡ろ떟?????????ш끽維???棺??짆??嶺뚮ㅎ?닻???ш끽維???筌뤾퍓???')
      return
    }

    try {
      const specMin = parseOptionalNumber(inspectionForm.specMin)
      const specMax = parseOptionalNumber(inspectionForm.specMax)
      const measuredValue = parseOptionalNumber(inspectionForm.measuredValue)

      if ([specMin, specMax, measuredValue].some((value) => value !== null && Number.isNaN(value))) {
        setInspectionSaveError('??れ삀????좊즴???癲ル쉵?猷???곗씀亦껋꼨援????????뱀땡?????곸죷???⑤；????筌뤾퍓???')
        setInspectionSaving(false)
        return
      }

      if (!inspectionForm.lotId || !inspectionForm.inspectionItem.trim() || measuredValue === null) {
        setInspectionSaveError('LOT, ?濡ろ떟??????드퐲? 癲ル쉵?猷???곗씀亦? ??ш끽維?????낇돲??')
        setInspectionSaving(false)
        return
      }

      if (specMin !== null && specMax !== null && specMin > specMax) {
        setInspectionSaveError('癲ル슔?됭짆????れ삀????좊즴?? 癲ル슔?됭짆? ??れ삀????좊즴???????????⑤８?????덊렡.')
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
            ? '?濡ろ떟????嶺뚮㉡?€쾮戮る쨬??쎛 ???쒓낯???筌??????? FAIL ?????????瑜곸떵??袁⑸즴??繞???됰씭????濚밸Ŧ援욃ㅇ???⑥?????⑤９苑??癲ル슪?ｇ몭????????怨?????덊렡.'
            : '?濡ろ떟????嶺뚮㉡?€쾮戮る쨬??쎛 ???쒓낯???筌???????',
        )
      } else {
        savedInspection = await createInspectionApi(payload, auth.accessToken)
        setInspectionSaveSuccess(
          savedInspection.result === 'FAIL'
            ? '?濡ろ떟????嶺뚮㉡?€쾮戮る쨬??쎛 ?濚밸Ŧ援욃ㅇ??筌??????? FAIL ?????????瑜곸떵??袁⑸즴??繞???됰씭????濚밸Ŧ援욃ㅇ???⑥?????⑤９苑??癲ル슪?ｇ몭????????怨?????덊렡.'
            : '?濡ろ떟????嶺뚮㉡?€쾮戮る쨬??쎛 ?濚밸Ŧ援욃ㅇ??筌???????',
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
      setInspectionSaveError(error.message || '?濡ろ떟????????묎덩?????됰꽡???怨?????덊렡.')
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
      setDefectSaveError('??됰씭?????????ш끽維???棺??짆??嶺뚮ㅎ?닻???ш끽維???筌뤾퍓???')
      return
    }

    try {
      if (!defectForm.inspectionId || !defectForm.defectCode) {
        setDefectSaveError('?濡ろ떟???????野껋듅????됰씭??????レ챺??? ??ш끽維?????낇돲??')
        setDefectSaving(false)
        return
      }

      const selectedInspection = dashboardData.inspections.find(
        (inspection) => inspection.id === defectForm.inspectionId,
      )

      if (!selectedInspection) {
        setDefectSaveError('???ャ뀕????濡ろ떟??????Β????? 癲ル슓??젆???????⑤８?????덊렡.')
        setDefectSaving(false)
        return
      }

      if (selectedInspection.result !== 'FAIL') {
        setDefectSaveError('??됰씭???? FAIL ??????濡ろ떟?????곕㎜壤??濚밸Ŧ援욃ㅇ???????怨?????덊렡.')
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
        setDefectSaveSuccess('??됰씭????嶺뚮㉡?€쾮戮る쨬??쎛 ???쒓낯???筌???????')
      } else {
        await createDefectApi(payload, auth.accessToken)
        setDefectSaveSuccess('??됰씭????嶺뚮㉡?€쾮戮る쨬??쎛 ?濚밸Ŧ援욃ㅇ??筌???????')
      }

      resetDefectForm()
      await loadOperationalData(auth.accessToken, auth.role)
    } catch (error) {
      setDefectSaveError(error.message || '??됰씭????????묎덩?????됰꽡???怨?????덊렡.')
    } finally {
      setDefectSaving(false)
    }
  }

  function handleLogout() {
    clearAuthSession('logout')
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
    setLotForm(EMPTY_LOT_FORM)
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
      startAt: toDateTimeInputValue(new Date().toISOString()),
    })
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
    setProcessParamForm({
      ...EMPTY_PROCESS_PARAM_FORM,
      measuredAt: toDateTimeInputValue(new Date().toISOString()),
    })
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

  function resetSpcForm() {
    setSpcForm(EMPTY_SPC_FORM)
    setSpcSaveError('')
    setSpcSaveSuccess('')
  }

  function resetSpcFilters() {
    setSpcFilters(EMPTY_SPC_FILTER_FORM)
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

  function handleInspectionLotChange(lotId) {
    setInspectionForm((current) => {
      const keepsWorkOrder =
        !current.workOrderId ||
        dashboardData.workOrders.some((order) => order.id === current.workOrderId && order.lotId === lotId)

      return {
        ...current,
        lotId,
        workOrderId: keepsWorkOrder ? current.workOrderId : '',
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

  const completedProcessCodes = new Set(
    dashboardData.workOrders
      .filter((order) => order.status === 'DONE')
      .map((order) => normalizeProcessCode(order.processType)),
  )

  const dashboardKpis = dashboardInsights.kpis
  const lotStatusSummary = summarizeByStatus(dashboardData.lots, LOT_STATUS_LABELS)
  const equipmentStatusSummary = summarizeByStatus(dashboardData.equipment, EQUIPMENT_STATUS_LABELS)
  const inspectionSnapshot = summarizeInspection(dashboardData.inspectionSummary)
  const defectSnapshot = summarizeDefect(dashboardData.defectSummary)
  const totalLotQuantity = dashboardData.lots.reduce((sum, lot) => sum + safeNumber(lot.quantity), 0)
  const totalTargetQuantity = dashboardData.workOrders.reduce((sum, order) => sum + safeNumber(order.targetQty), 0)
  const totalActualQuantity = dashboardData.workOrders.reduce((sum, order) => sum + safeNumber(order.actualQty), 0)
  const completedWorkOrderCount = dashboardData.workOrders.filter((order) => order.status === 'DONE').length
  const runningEquipmentCount = dashboardKpis?.runningEquipmentCount ?? dashboardData.equipment.filter((equipment) => equipment.status === 'RUNNING').length
  const holdLotCount = dashboardKpis?.holdLots ?? dashboardData.lots.filter((lot) => lot.status === 'HOLD').length
  const inspectionPassCount = dashboardKpis?.passLots ?? safeNumber(dashboardData.inspectionSummary?.passCount)
  const inspectionFailCount = dashboardKpis?.failLots ?? safeNumber(dashboardData.inspectionSummary?.failCount)
  const totalInspectionCount = inspectionPassCount + inspectionFailCount
  const inspectionPassRate = dashboardKpis ? safeNumber(dashboardKpis.passRate) / 100 : totalInspectionCount > 0 ? inspectionPassCount / totalInspectionCount : null
  const gradeACount = dashboardKpis?.gradeALots ?? safeNumber(dashboardData.inspectionSummary?.gradeACount)
  const criticalDefectCount = safeNumber(dashboardData.defectSummary?.criticalCount)
  const defectRegistrationRate = dashboardKpis ? safeNumber(dashboardKpis.defectRate) / 100 : totalInspectionCount > 0 ? dashboardData.defects.length / totalInspectionCount : null
  const completedLotCount = dashboardKpis?.completedLots ?? dashboardData.lots.filter((lot) => lot.status === 'COMPLETED').length
  const inProgressLotCount = dashboardKpis
    ? Math.max(0, safeNumber(dashboardKpis.totalLots) - safeNumber(dashboardKpis.completedLots) - safeNumber(dashboardKpis.holdLots))
    : dashboardData.lots.filter((lot) => lot.status === 'IN_PROGRESS').length
  const idleEquipmentCount = dashboardData.equipment.filter((equipment) => equipment.status === 'IDLE').length
  const downEquipmentCount = dashboardData.equipment.filter((equipment) => equipment.status === 'DOWN' || equipment.status === 'PM').length
  const workOrderCompletionRate = dashboardData.workOrders.length > 0 ? completedWorkOrderCount / dashboardData.workOrders.length : null
  const productionAchievementRate = totalTargetQuantity > 0 ? totalActualQuantity / totalTargetQuantity : null
  const processStepSnapshots = PROCESS_STEPS.map((step) => {
    const stepOrders = dashboardData.workOrders.filter((order) => normalizeProcessCode(order.processType) === step.code)
    const doneCount = stepOrders.filter((order) => order.status === 'DONE').length
    const runningCount = stepOrders.filter((order) => order.status === 'RUNNING').length
    return {
      ...step,
      orderCount: stepOrders.length,
      doneCount,
      runningCount,
      ready: completedProcessCodes.has(step.code),
    }
  })
  const dashboardProcessStepSnapshots = PROCESS_STEPS.map((step) => {
    const matchedStatus = dashboardInsights.processStatus.find(
      (status) => normalizeProcessCode(status.processType) === step.code,
    )

    return {
      ...step,
      orderCount: safeNumber(matchedStatus?.totalCount),
      doneCount: safeNumber(matchedStatus?.doneCount),
      runningCount: safeNumber(matchedStatus?.runningCount),
      ready: safeNumber(matchedStatus?.doneCount) > 0,
    }
  })
  const activeProcessStepSnapshots =
    dashboardInsights.processStatus.length > 0 ? dashboardProcessStepSnapshots : processStepSnapshots
  const watchLots = dashboardData.lots.filter((lot) => lot.status === 'HOLD' || lot.status === 'IN_PROGRESS').slice(0, 4)
  const focusEquipment = [...dashboardData.equipment]
    .sort((left, right) => getEquipmentStatusPriority(left.status) - getEquipmentStatusPriority(right.status))
    .slice(0, 4)
  const focusDefects = [...dashboardData.defects]
    .sort((left, right) => getDefectSeverityPriority(left.severity) - getDefectSeverityPriority(right.severity))
    .slice(0, 4)
  const hasOperationalData =
    dashboardData.lots.length > 0 ||
    dashboardData.workOrders.length > 0 ||
    dashboardData.equipment.length > 0 ||
    dashboardData.materials.length > 0 ||
    dashboardData.boms.length > 0 ||
    dashboardData.spcData.length > 0 ||
    dashboardData.inspections.length > 0 ||
    dashboardData.defects.length > 0
  const selectedDefectType = dashboardData.defectTypes.find((type) => type.code === defectForm.defectCode)
  const selectedDefectInspection = dashboardData.inspections.find(
    (inspection) => inspection.id === defectForm.inspectionId,
  )
  const availableDefectInspections = dashboardData.inspections.filter(
    (inspection) => inspection.result === 'FAIL' || inspection.id === defectForm.inspectionId,
  )
  const availableAssignmentUsers = dashboardData.users.filter((user) => user.role !== 'ADMIN')
  const selectedEquipmentLogs = editingEquipmentId
    ? dashboardData.equipmentLogs.filter((log) => log.equipmentId === editingEquipmentId)
    : dashboardData.equipmentLogs
  const selectedProcessParams = processParamForm.workOrderId
    ? dashboardData.processParams.filter((processParam) => processParam.workOrderId === processParamForm.workOrderId)
    : dashboardData.processParams
  const selectedMaterial = dashboardData.materials.find((material) => material.id === bomForm.materialId)
  const materialTypeSummary = MATERIAL_TYPE_OPTIONS.map((type) => {
    const count = dashboardData.materials.filter((material) => material.matType === type).length
    return `${type} ${count}`
  }).join(' / ')
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
  const filteredInspectionWorkOrders = dashboardData.workOrders.filter(
    (order) => !inspectionForm.lotId || order.lotId === inspectionForm.lotId,
  )
  const hasLotOptions = dashboardData.lots.length > 0
  const hasSpcLotOptions = dashboardData.lots.length > 0
  const hasFilteredWorkOrders = filteredInspectionWorkOrders.length > 0
  const inspectionPreview = buildInspectionPreview(inspectionForm)
  const dashboardLotCount = dashboardKpis?.totalLots ?? dashboardData.lots.length
  const dashboardCompletedLots = dashboardKpis?.completedLots ?? completedLotCount
  const dashboardHoldLots = dashboardKpis?.holdLots ?? holdLotCount
  const dashboardInProgressLots = Math.max(0, dashboardLotCount - dashboardCompletedLots - dashboardHoldLots)
  const dashboardRunningEquipmentCount = dashboardKpis?.runningEquipmentCount ?? runningEquipmentCount
  const dashboardTotalEquipmentCount = dashboardKpis?.totalEquipmentCount ?? dashboardData.equipment.length
  const dashboardPassRateDisplay = dashboardKpis ? formatPercentValue(dashboardKpis.passRate) : formatPercent(inspectionPassRate)
  const dashboardPassCount = dashboardKpis?.passLots ?? inspectionPassCount
  const dashboardFailCount = dashboardKpis?.failLots ?? inspectionFailCount
  const dashboardDefectCount = dashboardKpis?.defectCount ?? dashboardData.defects.length
  const dashboardGradeACount = dashboardKpis?.gradeALots ?? gradeACount
  const dashboardDefectRateDisplay = dashboardKpis ? formatPercentValue(dashboardKpis.defectRate) : formatPercent(defectRegistrationRate)
  const dashboardEquipmentAvailabilityDisplay = dashboardKpis
    ? formatPercentValue(dashboardKpis.equipmentAvailability)
    : formatPercent(dashboardTotalEquipmentCount > 0 ? dashboardRunningEquipmentCount / dashboardTotalEquipmentCount : null)
  const dashboardEquipmentStatusSummary = summarizeCountItems(dashboardInsights.equipmentStatus, EQUIPMENT_STATUS_LABELS, 'status')
  const dashboardDefectCategorySummary = summarizeCountItems(dashboardInsights.defectCategories, null, 'category')
  const latestQualityTrend = dashboardInsights.qualityTrend[dashboardInsights.qualityTrend.length - 1] ?? null
  const dashboardQualityTrendSummary = latestQualityTrend
    ? `PASS ${latestQualityTrend.passCount ?? 0} / FAIL ${latestQualityTrend.failCount ?? 0} / DEFECT ${latestQualityTrend.defectCount ?? 0}`
    : ''
  const shouldShowEmptyDataNotice = !hasOperationalData && auth?.accessToken
  const sectionMenuOrder = ['main', 'production', 'equipment', 'materials', 'spc', 'quality']
  const sectionMenuItems = SECTION_MENU.map((section) => {
    if (section.key === 'main') {
      return {
        ...section,
        badge: auth?.accessToken ? 'READY' : 'LOGIN',
      }
    }

    if (section.key === 'production') {
      return {
        ...section,
        badge: `LOT ${dashboardData.lots.length} / WO ${dashboardData.workOrders.length}`,
      }
    }

    if (section.key === 'equipment') {
      return {
        ...section,
        badge: `??삵돩 ${dashboardData.equipment.length}`,
      }
    }

    if (section.key === 'materials') {
      return {
        ...section,
        badge: `MAT ${dashboardData.materials.length} / BOM ${dashboardData.boms.length}`,
      }
    }

    if (section.key === 'spc') {
      return {
        ...section,
        badge: `SPC ${dashboardData.spcData.length}`,
      }
    }

    if (section.key === 'quality') {
      return {
        ...section,
        badge: `野꺜??${dashboardData.inspections.length} / ?븍뜄??${dashboardData.defects.length}`,
      }
    }

    return section
  })
    .filter((section) => canAccessSection(auth?.role, section.key, Boolean(auth?.accessToken)))
    .sort((left, right) => sectionMenuOrder.indexOf(left.key) - sectionMenuOrder.indexOf(right.key))
  const runningWorkOrderCount = dashboardData.workOrders.filter((order) => order.status === 'RUNNING').length
  const plannedWorkOrderCount = dashboardData.workOrders.filter((order) => order.status === 'PLANNED').length
  const processReadyCount = activeProcessStepSnapshots.filter((step) => step.ready).length
  const selectedEquipmentSummary = editingEquipmentId
    ? `${equipmentForm.eqCode} / ${equipmentForm.eqName}`
    : '\uC124\uBE44\uB97C \uBA3C\uC800 \uC120\uD0DD\uD558\uBA74 \uD604\uC7AC \uC0C1\uD0DC\uC640 \uB85C\uADF8 \uB300\uC0C1\uC744 \uD568\uAED8 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.'
  const qualityIssueCount = inspectionFailCount + dashboardData.defects.length
  const currentSection = sectionMenuItems.find((section) => section.key === activeSection) ?? sectionMenuItems[0]

  const isLoggedIn = Boolean(auth?.accessToken)
  const authDisplayName = auth?.name ?? auth?.email ?? '\uBBF8\uC9C0\uC815 \uC0AC\uC6A9\uC790'
  const authRoleLabel = auth?.role ? getUserRoleLabel(auth.role) : '\uAD8C\uD55C \uBBF8\uC124\uC815'
  const authRoleClassName = auth?.role ? auth.role.toLowerCase() : 'unknown'
  return (
    <Layout
      sidebar={(
        <Sidebar
          sectionMenuItems={sectionMenuItems}
          activeSection={activeSection}
          onChangeSection={setActiveSection}
          currentSection={currentSection}
          auth={auth}
          authRoleLabel={authRoleLabel}
          authRoleClassName={authRoleClassName}
          handleLogout={handleLogout}
        />
      )}
    >
      {activeSection === 'main' ? (
        <MainPage
          isLoggedIn={isLoggedIn}
          backendState={backendState}
          authDisplayName={authDisplayName}
          auth={auth}
          authRoleClassName={authRoleClassName}
          authRoleLabel={authRoleLabel}
          handleLogout={handleLogout}
          loginSuccess={loginSuccess}
          loginError={loginError}
          dashboardError={dashboardError}
          dashboardNotice={dashboardNotice}
          dashboardLotCount={dashboardLotCount}
          dashboardInProgressLots={dashboardInProgressLots}
          dashboardCompletedLots={dashboardCompletedLots}
          dashboardHoldLots={dashboardHoldLots}
          formatPercent={formatPercent}
          workOrderCompletionRate={workOrderCompletionRate}
          completedWorkOrderCount={completedWorkOrderCount}
          dashboardData={dashboardData}
          getProgressBarWidth={getProgressBarWidth}
          productionAchievementRate={productionAchievementRate}
          totalActualQuantity={totalActualQuantity}
          formatNumber={formatNumber}
          totalTargetQuantity={totalTargetQuantity}
          dashboardRunningEquipmentCount={dashboardRunningEquipmentCount}
          dashboardTotalEquipmentCount={dashboardTotalEquipmentCount}
          idleEquipmentCount={idleEquipmentCount}
          downEquipmentCount={downEquipmentCount}
          dashboardPassRateDisplay={dashboardPassRateDisplay}
          dashboardPassCount={dashboardPassCount}
          dashboardFailCount={dashboardFailCount}
          dashboardDefectCount={dashboardDefectCount}
          criticalDefectCount={criticalDefectCount}
          dashboardDefectRateDisplay={dashboardDefectRateDisplay}
          activeProcessStepSnapshots={activeProcessStepSnapshots}
          getProcessSnapshotState={getProcessSnapshotState}
          lotStatusSummary={lotStatusSummary}
          dashboardEquipmentStatusSummary={dashboardEquipmentStatusSummary}
          equipmentStatusSummary={equipmentStatusSummary}
          dashboardQualityTrendSummary={dashboardQualityTrendSummary}
          inspectionSnapshot={inspectionSnapshot}
          dashboardDefectCategorySummary={dashboardDefectCategorySummary}
          defectSnapshot={defectSnapshot}
          watchLots={watchLots}
          getLotStatusLabel={getLotStatusLabel}
          focusEquipment={focusEquipment}
          getEquipmentStatusLabel={getEquipmentStatusLabel}
          focusDefects={focusDefects}
          getDefectSeverityLabel={getDefectSeverityLabel}
          shouldShowEmptyDataNotice={shouldShowEmptyDataNotice}
          authMode={authMode}
          setAuthMode={setAuthMode}
          handleLogin={handleLogin}
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          loading={loading}
          handleRegister={handleRegister}
          registerForm={registerForm}
          setRegisterForm={setRegisterForm}
          USER_ROLES={USER_ROLES}
          getUserRoleLabel={getUserRoleLabel}
          registerSuccess={registerSuccess}
          registerError={registerError}
          checkBackend={checkBackend}
          dashboardGradeACount={dashboardGradeACount}
          dashboardEquipmentAvailabilityDisplay={dashboardEquipmentAvailabilityDisplay}
        />
      ) : null}

          {activeSection !== 'main' && !auth?.accessToken ? (
            <section className="panel warning-panel section-gate-panel">
              <div className="panel-head compact-head">
                <div>
                  <p className="panel-kicker">ACCESS REQUIRED</p>
                  <h2>{currentSection.label} 화면으로 이동하려면 먼저 로그인해 주세요.</h2>
                </div>
              </div>
              <p className="warning-text">로그인이 필요한 기능입니다. 메인 화면에서 로그인하거나 회원가입을 완료한 뒤 다시 접근해 주세요.</p>
              <div className="section-guard-actions">
                <button className="submit-button guard-button" type="button" onClick={() => setActiveSection('main')}>
                  메인 화면으로 이동
                </button>
              </div>
            </section>
          ) : null}

          {activeSection !== 'main' && shouldShowEmptyDataNotice ? (
            <section className="panel warning-panel">
              <div className="panel-head compact-head">
                <div>
                  <p className="panel-kicker">EMPTY DATA</p>
                  <h2>{currentSection.label} 화면에 표시할 운영 데이터가 아직 없습니다.</h2>
                </div>
              </div>
              <p className="warning-text">샘플 운영 데이터를 먼저 넣은 뒤 다시 확인해 주세요.</p>
              <p className="warning-text">실행 SQL: <code>D:\home-study\battery-mes-backend\src\main\resources\db\data-oracle.sql</code></p>
            </section>
          ) : null}

          {activeSection === 'production' && auth?.accessToken ? (
            <section className="content-grid domain-layout">
              <article className="domain-banner domain-banner-production">
                <div className="domain-banner-body">
                  <div>
                    <p className="domain-kicker">생산관리</p>
                    <h2>LOT 등록과 작업지시 등록을 같은 흐름 안에서 관리하도록 묶었습니다.</h2>
                  </div>
                  <div className="domain-banner-metrics">
                    <div className="domain-banner-metric">
                      <span>LOT</span>
                      <strong>{dashboardData.lots.length}</strong>
                    </div>
                    <div className="domain-banner-metric">
                      <span>작업지시</span>
                      <strong>{dashboardData.workOrders.length}</strong>
                    </div>
                    <div className="domain-banner-metric">
                      <span>공정 준비</span>
                      <strong>{processReadyCount} / {PROCESS_STEPS.length}</strong>
                    </div>
                  </div>
                </div>
              </article>

              <section className="domain-overview-grid">
                <article className="domain-overview-card accent">
                  <p>LOT 수</p>
                  <strong>{dashboardData.lots.length}</strong>
                  <span>진행중 {inProgressLotCount} / 완료 {completedLotCount} / 보류 {holdLotCount}</span>
                </article>
                <article className="domain-overview-card">
                  <p>총 수량</p>
                  <strong>{formatNumber(totalLotQuantity)}</strong>
                  <span>현재 운영 중인 LOT 기준 누적 생산 수량입니다.</span>
                </article>
                <article className="domain-overview-card">
                  <p>작업지시 진행</p>
                  <strong>{runningWorkOrderCount} / {dashboardData.workOrders.length}</strong>
                  <span>진행중 {runningWorkOrderCount} / 완료 {completedWorkOrderCount} / 계획 {plannedWorkOrderCount}</span>
                </article>
                <article className="domain-overview-card good">
                  <p>생산 달성률</p>
                  <strong>{formatPercent(productionAchievementRate)}</strong>
                  <span>실적 {formatNumber(totalActualQuantity)} / 목표 {formatNumber(totalTargetQuantity)}</span>
                </article>
              </section>

              <article className="panel panel-wide domain-process-panel">
                <div className="panel-head">
                  <div>
                    <p className="panel-kicker">공정 흐름</p>
                    <h2>생산관리에서 작업지시 진행 순서를 한 번에 확인할 수 있습니다.</h2>
                  </div>
                  <span className="chip">운영 흐름</span>
                </div>
                <div className="process-flow">
                  {PROCESS_STEPS.map((step) => {
                    const done = completedProcessCodes.has(step.code)
                    return (
                      <div className="process-step" key={step.code}>
                        <div className="step-header">
                          <strong>{step.label}</strong>
                          <span className={`mini-badge ${done ? 'DONE' : 'PLANNED'}`}>{done ? getWorkOrderStatusLabel('DONE') : getWorkOrderStatusLabel('PLANNED')}</span>
                        </div>
                        <p>{done ? '이 공정은 DONE 작업지시가 존재합니다.' : '이 공정은 아직 DONE 작업지시가 없습니다.'}</p>
                      </div>
                    )
                  })}
                </div>
              </article>

              <div className="section-cluster section-cluster-form domain-section-stack">
                <div className="section-cluster-head">
                  <p className="section-cluster-kicker">입력 영역</p>
                  <h3>LOT 등록과 작업지시 등록을 같은 흐름 안에서 관리하도록 묶었습니다.</h3>
                </div>

                <div className="domain-panel-grid">
                  <article className="panel lot-editor-panel">
                    <div className="panel-head">
                      <div>
                        <p className="panel-kicker">생산 LOT 관리</p>
                        <h2>{editingLotId ? 'LOT 수정' : 'LOT 등록'}</h2>
                      </div>
                    </div>
                    <form className="management-form" onSubmit={handleLotSubmit}>
                      <label>
                        <span>LOT 번호</span>
                        <input value={lotForm.lotNumber} onChange={(event) => setLotForm((current) => ({ ...current, lotNumber: event.target.value }))} placeholder="LOT-20260422-001" required />
                      </label>
                      <label>
                        <span>제품명</span>
                        <input value={lotForm.productName} onChange={(event) => setLotForm((current) => ({ ...current, productName: event.target.value }))} placeholder="21700 CELL - NCM" required />
                      </label>
                      <label>
                        <span>수량</span>
                        <input type="number" min="1" value={lotForm.quantity} onChange={(event) => setLotForm((current) => ({ ...current, quantity: event.target.value }))} required />
                      </label>
                      <label>
                        <span>상태</span>
                        <select value={lotForm.status} onChange={(event) => setLotForm((current) => ({ ...current, status: event.target.value }))}>
                          <option value="IN_PROGRESS">{getLotStatusLabel('IN_PROGRESS')}</option>
                          <option value="COMPLETED">{getLotStatusLabel('COMPLETED')}</option>
                          <option value="HOLD">{getLotStatusLabel('HOLD')}</option>
                        </select>
                      </label>
                      <div className="form-actions">
                        <button className="submit-button" type="submit" disabled={lotSaving}>
                          {lotSaving ? '저장 중...' : editingLotId ? 'LOT 수정' : 'LOT 등록'}
                        </button>
                        <button className="secondary-light-button" type="button" onClick={resetLotForm}>
                          초기화
                        </button>
                      </div>
                    </form>
                    {lotSaveSuccess ? <p className="success-text">{lotSaveSuccess}</p> : null}
                    {lotSaveError ? <p className="error-text">{lotSaveError}</p> : null}
                  </article>

                  <article className="panel">
                    <div className="panel-head">
                      <div>
                        <p className="panel-kicker">작업지시 관리</p>
                        <h2>{editingWorkOrderId ? '작업지시 수정' : '작업지시 등록'}</h2>
                      </div>
                    </div>
                    <form className="management-form" onSubmit={handleWorkOrderSubmit}>
                      <label>
                        <span>작업지시 번호</span>
                        <input value={workOrderForm.woNumber} onChange={(event) => setWorkOrderForm((current) => ({ ...current, woNumber: event.target.value }))} placeholder="WO-ACT-001" required />
                      </label>
                      <label>
                        <span>LOT</span>
                        <select value={workOrderForm.lotId} onChange={(event) => setWorkOrderForm((current) => ({ ...current, lotId: event.target.value }))} required>
                          {hasLotOptions ? <option value="">LOT 선택</option> : <option value="">LOT 데이터 없음</option>}
                          {dashboardData.lots.map((lot) => (
                            <option key={lot.id} value={lot.id}>{lot.lotNumber} / {lot.productName}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>설비</span>
                        <select value={workOrderForm.equipmentId} onChange={(event) => setWorkOrderForm((current) => ({ ...current, equipmentId: event.target.value }))} required>
                          <option value="">설비 선택</option>
                          {dashboardData.equipment.map((equipment) => (
                            <option key={equipment.id} value={equipment.id}>{equipment.eqCode} / {equipment.eqName}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>공정</span>
                        <select value={workOrderForm.processType} onChange={(event) => setWorkOrderForm((current) => ({ ...current, processType: event.target.value }))}>
                          {PROCESS_STEPS.map((step) => (
                            <option key={step.code} value={step.sourceValue}>{step.label}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>상태</span>
                        <select value={workOrderForm.status} onChange={(event) => setWorkOrderForm((current) => ({ ...current, status: event.target.value }))}>
                          <option value="PLANNED">{getWorkOrderStatusLabel('PLANNED')}</option>
                          <option value="RUNNING">{getWorkOrderStatusLabel('RUNNING')}</option>
                          <option value="DONE">{getWorkOrderStatusLabel('DONE')}</option>
                          <option value="HOLD">{getWorkOrderStatusLabel('HOLD')}</option>
                        </select>
                      </label>
                      <label>
                        <span>목표 수량</span>
                        <input type="number" min="1" value={workOrderForm.targetQty} onChange={(event) => setWorkOrderForm((current) => ({ ...current, targetQty: event.target.value }))} required />
                      </label>
                      <label>
                        <span>실적 수량</span>
                        <input type="number" min="0" value={workOrderForm.actualQty} onChange={(event) => setWorkOrderForm((current) => ({ ...current, actualQty: event.target.value }))} />
                      </label>
                      <label>
                        <span>계획 시작일</span>
                        <input type="datetime-local" value={workOrderForm.plannedStart} onChange={(event) => setWorkOrderForm((current) => ({ ...current, plannedStart: event.target.value }))} required />
                      </label>
                      <p className="hint-text">계획 시작일과 공정 상태를 함께 관리하면 생산 흐름과 작업 진행률을 한 번에 파악하기 좋습니다.</p>
                      <div className="form-actions">
                        <button className="submit-button" type="submit" disabled={workOrderSaving}>
                          {workOrderSaving ? '저장 중...' : editingWorkOrderId ? '작업지시 수정' : '작업지시 등록'}
                        </button>
                        <button className="secondary-light-button" type="button" onClick={resetWorkOrderForm}>
                          초기화
                        </button>
                      </div>
                    </form>
                    {workOrderSaveSuccess ? <p className="success-text">{workOrderSaveSuccess}</p> : null}
                    {workOrderSaveError ? <p className="error-text">{workOrderSaveError}</p> : null}
                  </article>

                  <article className="panel">
                    <div className="panel-head">
                      <div>
                        <p className="panel-kicker">작업 배정</p>
                        <h2>{editingAssignmentId ? '작업 배정 수정' : '작업 배정 등록'}</h2>
                      </div>
                    </div>
                    <form className="management-form" onSubmit={handleAssignmentSubmit}>
                      <label>
                        <span>작업지시</span>
                        <select
                          value={assignmentForm.workOrderId}
                          onChange={(event) => setAssignmentForm((current) => ({ ...current, workOrderId: event.target.value }))}
                          required
                        >
                          <option value="">작업지시 선택</option>
                          {dashboardData.workOrders.map((order) => (
                            <option key={order.id} value={order.id}>
                              {order.woNumber} / {order.processType} / {order.lotNumber}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>작업자</span>
                        <select
                          value={assignmentForm.userId}
                          onChange={(event) => setAssignmentForm((current) => ({ ...current, userId: event.target.value }))}
                          required
                        >
                          {availableAssignmentUsers.length > 0 ? <option value="">작업자 선택</option> : <option value="">작업자 데이터 없음</option>}
                          {availableAssignmentUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} / {getUserRoleLabel(user.role)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>배정 역할</span>
                        <select
                          value={assignmentForm.role}
                          onChange={(event) => setAssignmentForm((current) => ({ ...current, role: event.target.value }))}
                        >
                          {ASSIGNMENT_ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {getAssignmentRoleLabel(role)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>시작 일시</span>
                        <input
                          type="datetime-local"
                          value={assignmentForm.startAt}
                          onChange={(event) => setAssignmentForm((current) => ({ ...current, startAt: event.target.value }))}
                          required
                        />
                      </label>
                      <label>
                        <span>종료 일시</span>
                        <input
                          type="datetime-local"
                          value={assignmentForm.endAt}
                          onChange={(event) => setAssignmentForm((current) => ({ ...current, endAt: event.target.value }))}
                        />
                      </label>
                      <div className="form-actions">
                        <button className="submit-button" type="submit" disabled={assignmentSaving}>
                          {assignmentSaving ? '저장 중...' : editingAssignmentId ? '작업 배정 수정' : '작업 배정 등록'}
                        </button>
                        <button className="secondary-light-button" type="button" onClick={resetAssignmentForm}>
                          초기화
                        </button>
                      </div>
                    </form>
                    {assignmentSaveSuccess ? <p className="success-text">{assignmentSaveSuccess}</p> : null}
                    {assignmentSaveError ? <p className="error-text">{assignmentSaveError}</p> : null}
                  </article>
                </div>
              </div>

              <div className="section-cluster section-cluster-list domain-section-stack">
                <div className="section-cluster-head">
                  <p className="section-cluster-kicker">조회 영역</p>
                  <h3>등록된 LOT과 작업지시를 각각 분리해서 보고 수정 대상을 고를 수 있게 정리했습니다.</h3>
                </div>

                <div className="domain-panel-grid">
                  <article className="panel">
                    <div className="panel-head">
                      <div>
                        <p className="panel-kicker">LOT 목록</p>
                        <h2>LOT 현황</h2>
                      </div>
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>LOT 번호</th>
                            <th>제품명</th>
                            <th>수량</th>
                            <th>상태</th>
                            <th>작업</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.lots.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="empty-cell">등록된 LOT 데이터가 없습니다.</td>
                            </tr>
                          ) : (
                            dashboardData.lots.map((lot) => (
                              <tr key={lot.id}>
                                <td>{lot.lotNumber}</td>
                                <td>{lot.productName}</td>
                                <td>{lot.quantity}</td>
                                <td><span className={`mini-badge ${lot.status}`}>{getLotStatusLabel(lot.status)}</span></td>
                                <td>
                                  <button className="table-action-button" type="button" onClick={() => startLotEdit(lot)}>
                                    수정
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </article>

                  <article className="panel">
                    <div className="panel-head">
                      <div>
                        <p className="panel-kicker">작업지시 목록</p>
                        <h2>작업지시 현황</h2>
                      </div>
                    </div>
                    <div className="stack-list">
                      {dashboardData.workOrders.length === 0 ? (
                        <div className="empty-state">등록된 작업지시 데이터가 없습니다.</div>
                      ) : (
                        dashboardData.workOrders.map((order) => (
                          <div className="stack-item" key={order.id}>
                            <div>
                              <strong>{order.woNumber}</strong>
                              <p>{order.processType} / {order.eqCode} / {order.lotNumber}</p>
                            </div>
                            <div className="item-actions">
                              <span className={`mini-badge ${order.status}`}>{getWorkOrderStatusLabel(order.status)}</span>
                              <button className="table-action-button" type="button" onClick={() => startWorkOrderEdit(order)}>
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
                        <p className="panel-kicker">작업배정 목록</p>
                        <h2>배정 현황</h2>
                      </div>
                    </div>
                    <div className="stack-list">
                      {dashboardData.assignments.length === 0 ? (
                        <div className="empty-state">등록된 작업배정 데이터가 없습니다.</div>
                      ) : (
                        dashboardData.assignments.map((assignment) => (
                          <div className="stack-item" key={assignment.id}>
                            <div>
                              <strong>{assignment.woNumber}</strong>
                              <p>{assignment.userName} / {getAssignmentRoleLabel(assignment.role)}</p>
                              <p>{formatDateTimeDisplay(assignment.startAt)}</p>
                            </div>
                            <div className="item-actions">
                              <span className="mini-badge RUNNING">{getAssignmentRoleLabel(assignment.role)}</span>
                              <button className="table-action-button" type="button" onClick={() => startAssignmentEdit(assignment)}>
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
          ) : null}

          {activeSection === 'equipment' && auth?.accessToken ? (
            <section className="content-grid domain-layout">
              <article className="domain-banner domain-banner-equipment">
                <div className="domain-banner-body">
                  <div>
                    <p className="domain-kicker">설비관리</p>
                    <h2>설비 상태 변경과 로그 기록을 운영 흐름에 맞춰 관리하는 화면입니다.</h2>
                  </div>
                  <div className="domain-banner-metrics">
                    <div className="domain-banner-metric">
                      <span>전체 설비</span>
                      <strong>{dashboardData.equipment.length}</strong>
                    </div>
                    <div className="domain-banner-metric">
                      <span>가동 설비</span>
                      <strong>{runningEquipmentCount}</strong>
                    </div>
                    <div className="domain-banner-metric">
                      <span>다운 설비</span>
                      <strong>{downEquipmentCount}</strong>
                    </div>
                  </div>
                </div>
              </article>

              <section className="domain-overview-grid">
                <article className="domain-overview-card accent">
                  <p>설비 운영</p>
                  <strong>{dashboardData.equipment.length}</strong>
                  <span>가동 {runningEquipmentCount} / 대기 {idleEquipmentCount} / 다운 {downEquipmentCount}</span>
                </article>
                <article className="domain-overview-card">
                  <p>선택 설비</p>
                  <strong>{editingEquipmentId ? '선택됨' : '미선택'}</strong>
                  <span>{selectedEquipmentSummary}</span>
                </article>
                <article className="domain-overview-card">
                  <p>설비 상태 요약</p>
                  <strong>{equipmentStatusSummary || '데이터 없음'}</strong>
                  <span>설비별 운영 상태를 한 줄로 요약했습니다.</span>
                </article>
                <article className="domain-overview-card good">
                  <p>백엔드 연동</p>
                  <strong>{backendState.status === 'connected' ? '정상' : '연동 확인 필요'}</strong>
                  <span>상태 변경과 설비 로그 저장은 API 연동 상태에 따라 반영됩니다.</span>
                </article>
              </section>

              <div className="section-cluster section-cluster-form domain-section-stack">
                <div className="section-cluster-head">
                  <p className="section-cluster-kicker">입력 영역</p>
                  <h3>목록에서 설비를 선택한 뒤 상태를 바꾸고, 필요한 경우 로그까지 함께 남길 수 있습니다.</h3>
                </div>

                <div className="domain-panel-grid">
                  <article className="panel panel-accent">
                    <div className="panel-head">
                      <div>
                        <p className="panel-kicker">설비 관리</p>
                        <h2>{editingEquipmentId ? '설비 수정' : '설비 선택'}</h2>
                      </div>
                    </div>
                    <form className="management-form" onSubmit={handleEquipmentSubmit}>
                      <label>
                        <span>설비 코드</span>
                        <input value={equipmentForm.eqCode} readOnly placeholder="목록에서 설비를 먼저 선택해 주세요." />
                      </label>
                      <label>
                        <span>설비명</span>
                        <input value={equipmentForm.eqName} onChange={(event) => setEquipmentForm((current) => ({ ...current, eqName: event.target.value }))} required />
                      </label>
                      <label>
                        <span>설비 유형</span>
                        <input value={equipmentForm.eqType} onChange={(event) => setEquipmentForm((current) => ({ ...current, eqType: event.target.value }))} required />
                      </label>
                      <label>
                        <span>상태</span>
                        <select value={equipmentForm.status} onChange={(event) => setEquipmentForm((current) => ({ ...current, status: event.target.value }))}>
                          <option value="RUNNING">{getEquipmentStatusLabel('RUNNING')}</option>
                          <option value="IDLE">{getEquipmentStatusLabel('IDLE')}</option>
                          <option value="DOWN">{getEquipmentStatusLabel('DOWN')}</option>
                          <option value="PM">{getEquipmentStatusLabel('PM')}</option>
                        </select>
                      </label>
                      <label>
                        <span>최종 PM 일시</span>
                        <input type="datetime-local" value={equipmentForm.lastPmAt} onChange={(event) => setEquipmentForm((current) => ({ ...current, lastPmAt: event.target.value }))} />
                      </label>
                      <label>
                        <span>로그 유형</span>
                        <select value={equipmentForm.logType} onChange={(event) => setEquipmentForm((current) => ({ ...current, logType: event.target.value }))}>
                          <option value="ALERT">{getEquipmentLogTypeLabel('ALERT')}</option>
                          <option value="BREAKDOWN">{getEquipmentLogTypeLabel('BREAKDOWN')}</option>
                          <option value="PM">{getEquipmentLogTypeLabel('PM')}</option>
                        </select>
                      </label>
                      <label>
                        <span>로그 설명</span>
                        <textarea value={equipmentForm.logDescription} onChange={(event) => setEquipmentForm((current) => ({ ...current, logDescription: event.target.value }))} placeholder="현재 설비 상태 변경에 대한 로그 설명을 입력해 주세요." />
                      </label>
                      <div className="form-actions">
                        <button className="submit-button" type="submit" disabled={equipmentSaving || !editingEquipmentId}>
                          {equipmentSaving ? '저장 중...' : '설비 수정'}
                        </button>
                        <button className="secondary-light-button" type="button" onClick={resetEquipmentForm}>
                          초기화
                        </button>
                      </div>
                    </form>
                    {equipmentSaveSuccess ? <p className="success-text">{equipmentSaveSuccess}</p> : null}
                    {equipmentSaveError ? <p className="error-text">{equipmentSaveError}</p> : null}
                  </article>

                  <article className="panel">
                    <div className="panel-head">
                      <div>
                        <p className="panel-kicker">공정 파라미터 기록</p>
                        <h2>{editingProcessParamId ? '파라미터 수정' : '파라미터 등록'}</h2>
                      </div>
                    </div>
                    <form className="management-form" onSubmit={handleProcessParamSubmit}>
                      <label>
                        <span>작업지시</span>
                        <select
                          value={processParamForm.workOrderId}
                          onChange={(event) => setProcessParamForm((current) => ({ ...current, workOrderId: event.target.value }))}
                          required
                        >
                          <option value="">작업지시 선택</option>
                          {dashboardData.workOrders.map((order) => (
                            <option key={order.id} value={order.id}>
                              {order.woNumber} / {order.processType}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>파라미터명</span>
                        <input
                          value={processParamForm.paramName}
                          onChange={(event) => setProcessParamForm((current) => ({ ...current, paramName: event.target.value }))}
                          placeholder="Temperature"
                          required
                        />
                      </label>
                      <label>
                        <span>목표값</span>
                        <input
                          type="number"
                          step="0.0001"
                          value={processParamForm.targetValue}
                          onChange={(event) => setProcessParamForm((current) => ({ ...current, targetValue: event.target.value }))}
                        />
                      </label>
                      <label>
                        <span>실측값</span>
                        <input
                          type="number"
                          step="0.0001"
                          value={processParamForm.actualValue}
                          onChange={(event) => setProcessParamForm((current) => ({ ...current, actualValue: event.target.value }))}
                          required
                        />
                      </label>
                      <label>
                        <span>단위</span>
                        <input
                          value={processParamForm.unit}
                          onChange={(event) => setProcessParamForm((current) => ({ ...current, unit: event.target.value }))}
                          placeholder="V / A / degC"
                          required
                        />
                      </label>
                      <label>
                        <span>상한값</span>
                        <input
                          type="number"
                          step="0.0001"
                          value={processParamForm.upperLimit}
                          onChange={(event) => setProcessParamForm((current) => ({ ...current, upperLimit: event.target.value }))}
                        />
                      </label>
                      <label>
                        <span>하한값</span>
                        <input
                          type="number"
                          step="0.0001"
                          value={processParamForm.lowerLimit}
                          onChange={(event) => setProcessParamForm((current) => ({ ...current, lowerLimit: event.target.value }))}
                        />
                      </label>
                      <label>
                        <span>측정 일시</span>
                        <input
                          type="datetime-local"
                          value={processParamForm.measuredAt}
                          onChange={(event) => setProcessParamForm((current) => ({ ...current, measuredAt: event.target.value }))}
                        />
                      </label>
                      <div className="form-actions">
                        <button className="submit-button" type="submit" disabled={processParamSaving}>
                          {processParamSaving ? '저장 중...' : editingProcessParamId ? '파라미터 수정' : '파라미터 등록'}
                        </button>
                        <button className="secondary-light-button" type="button" onClick={resetProcessParamForm}>
                          초기화
                        </button>
                      </div>
                    </form>
                    {processParamSaveSuccess ? <p className="success-text">{processParamSaveSuccess}</p> : null}
                    {processParamSaveError ? <p className="error-text">{processParamSaveError}</p> : null}
                  </article>

                  <article className="panel">
                    <div className="panel-head">
                      <div>
                        <p className="panel-kicker">설비 로그 목록</p>
                        <h2>설비 로그 요약</h2>
                      </div>
                    </div>
                    <div className="stack-list compact">
                      {selectedEquipmentLogs.length === 0 ? (
                        <div className="empty-state">선택한 설비의 로그가 아직 없습니다.</div>
                      ) : (
                        selectedEquipmentLogs.slice(0, 6).map((log) => (
                          <div className="stack-item" key={log.id}>
                            <div>
                              <strong>{getEquipmentLogTypeLabel(log.logType)}</strong>
                              <p>{log.description}</p>
                              <p>{formatDateTimeDisplay(log.occurredAt)}</p>
                            </div>
                            <div className="item-actions">
                              <span className="mini-badge IDLE">{log.reportedByName ?? '-'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </article>

                  <article className="panel">
                    <div className="panel-head">
                      <div>
                        <p className="panel-kicker">공정 파라미터 이력</p>
                        <h2>최근 측정 파라미터</h2>
                      </div>
                    </div>
                    <div className="stack-list compact">
                      {selectedProcessParams.length === 0 ? (
                        <div className="empty-state">선택한 파라미터 이력이 아직 없습니다.</div>
                      ) : (
                        selectedProcessParams.slice(0, 6).map((processParam) => (
                          <div className="stack-item" key={processParam.id}>
                            <div>
                              <strong>{processParam.paramName}</strong>
                              <p>
                                실측 {processParam.actualValue} {processParam.unit}
                                {processParam.targetValue !== null && processParam.targetValue !== undefined
                                  ? ` / 목표 ${processParam.targetValue}`
                                  : ''}
                              </p>
                              <p>{formatDateTimeDisplay(processParam.measuredAt)}</p>
                            </div>
                            <div className="item-actions">
                              <button className="table-action-button" type="button" onClick={() => startProcessParamEdit(processParam)}>
                                수정
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </article>

                  <article className="panel domain-note-panel">
                    <div className="panel-head">
                      <div>
                        <p className="panel-kicker">운영 안내</p>
                        <h2>설비 관리 흐름</h2>
                      </div>
                    </div>
                    <div className="domain-note-stack">
                      <div className="domain-note-card">
                        <strong>1. 설비 선택</strong>
                        <p>오른쪽 설비 목록에서 수정할 설비를 먼저 선택합니다.</p>
                      </div>
                      <div className="domain-note-card">
                        <strong>2. 상태 변경</strong>
                        <p>RUNNING, IDLE, DOWN, PM 상태를 선택해 운영 상태를 반영합니다.</p>
                      </div>
                      <div className="domain-note-card">
                        <strong>3. 로그 기록</strong>
                        <p>현재 설비 상태와 함께 BREAKDOWN, ALERT, PM 로그를 남겨 이력 관리를 이어갈 수 있습니다.</p>
                      </div>
                    </div>
                  </article>
                </div>
              </div>

              <div className="section-cluster section-cluster-list domain-section-stack">
                <div className="section-cluster-head">
                  <p className="section-cluster-kicker">조회 영역</p>
                  <h3>설비 목록을 먼저 훑어보고, 바로 수정 대상을 고를 수 있게 현황과 액션을 붙였습니다.</h3>
                </div>

                <div className="domain-panel-grid">
                  <article className="panel panel-accent">
                    <div className="panel-head">
                      <div>
                        <p className="panel-kicker">설비 목록</p>
                        <h2>설비 현황</h2>
                      </div>
                    </div>
                    <div className="stack-list compact">
                      {dashboardData.equipment.length === 0 ? (
                        <div className="empty-state">등록된 설비 데이터가 없습니다.</div>
                      ) : (
                        dashboardData.equipment.map((equipment) => (
                          <div className="stack-item" key={equipment.id}>
                            <div>
                              <strong>{equipment.eqCode}</strong>
                              <p>{equipment.eqName} / {equipment.eqType}</p>
                            </div>
                            <div className="item-actions">
                              <span className={`mini-badge ${equipment.status}`}>{getEquipmentStatusLabel(equipment.status)}</span>
                              <button className="table-action-button" type="button" onClick={() => startEquipmentEdit(equipment)}>
                                수정
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </article>

                  <article className="panel domain-note-panel">
                    <div className="panel-head">
                      <div>
                        <p className="panel-kicker">설비 상태 요약</p>
                        <h2>운영 포인트</h2>
                      </div>
                    </div>
                    <div className="domain-note-stack">
                      <div className="domain-note-card">
                        <strong>가동 설비</strong>
                        <p>{runningEquipmentCount}대가 RUNNING 상태입니다.</p>
                      </div>
                      <div className="domain-note-card">
                        <strong>대기 설비</strong>
                        <p>{idleEquipmentCount}대가 IDLE 상태로 대기 중입니다.</p>
                      </div>
                      <div className="domain-note-card">
                        <strong>정비/다운 설비</strong>
                        <p>{downEquipmentCount}대가 PM 또는 DOWN 상태로 관리 중입니다.</p>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </section>
          ) : null}

          {activeSection === 'materials' && auth?.accessToken ? (
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
          ) : null}

          {activeSection === 'spc' && auth?.accessToken ? (
            <section className="content-grid domain-layout">
              <article className="domain-banner">
                <div className="domain-banner-body">
                  <div>
                    <p className="domain-kicker">SPC</p>
                    <h2>공정 데이터 기반으로 SPC 관리 데이터를 등록하고 조회하는 화면입니다.</h2>
                  </div>
                    <div className="domain-banner-metrics">
                      <div className="domain-banner-metric">
                        <span>SPC 건수</span>
                        <strong>{filteredSpcRows.length}</strong>
                      </div>
                      <div className="domain-banner-metric">
                        <span>관리 한계 이탈</span>
                        <strong>{filteredSpcOutOfControlCount}</strong>
                      </div>
                      <div className="domain-banner-metric">
                        <span>입력 샘플값 개수</span>
                        <strong>{parsedSpcSampleValues.length}</strong>
                      </div>
                    </div>
                </div>
              </article>

              <section className="domain-overview-grid">
                <article className="domain-overview-card accent">
                  <p>등록된 SPC</p>
                  <strong>{filteredSpcRows.length}</strong>
                  <span>현재 조회된 공정 통계 데이터 수</span>
                </article>
                <article className="domain-overview-card">
                  <p>최근 공정 평균 X-bar</p>
                  <strong>{spcPreview.xBar === null ? '-' : formatNumber(spcPreview.xBar)}</strong>
                  <span>입력한 샘플값 평균</span>
                </article>
                <article className="domain-overview-card">
                  <p>최근 공정 범위 Range</p>
                  <strong>{spcPreview.rangeValue === null ? '-' : formatNumber(spcPreview.rangeValue)}</strong>
                  <span>입력한 샘플값 최대-최소</span>
                </article>
                <article className="domain-overview-card alert">
                  <p>관리 한계 이탈 건수</p>
                  <strong>{filteredSpcOutOfControlCount}</strong>
                  <span>UCL/LCL 기준 이탈 건수</span>
                </article>
              </section>

              <div className="domain-panel-grid" style={{ gridColumn: 'span 12' }}>
                <article className="panel">
                  <div className="panel-head">
                    <div>
                        <p className="panel-kicker">SPC 입력</p>
                        <h2>SPC 데이터 등록</h2>
                    </div>
                  </div>

                  <form className="login-form" onSubmit={handleSpcSubmit}>
                    <label>
                      <span>LOT</span>
                      <select
                        value={spcForm.lotId}
                        onChange={(event) => {
                          const nextLotId = event.target.value
                          setSpcForm((current) => ({
                            ...current,
                            lotId: nextLotId,
                            workOrderId: current.lotId === nextLotId ? current.workOrderId : '',
                          }))
                        }}
                        disabled={!hasSpcLotOptions || spcSaving}
                      >
                        <option value="">{hasSpcLotOptions ? 'LOT 선택' : 'LOT 데이터 없음'}</option>
                        {dashboardData.lots.map((lot) => (
                          <option key={lot.id} value={lot.id}>
                            {lot.lotNumber} / {lot.productName}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>작업지시</span>
                      <select
                        value={spcForm.workOrderId}
                        onChange={(event) => setSpcForm((current) => ({ ...current, workOrderId: event.target.value }))}
                        disabled={spcSaving}
                      >
                        <option value="">{filteredSpcWorkOrders.length > 0 ? '선택 안 함' : '연결된 작업지시 없음'}</option>
                        {filteredSpcWorkOrders.map((order) => (
                          <option key={order.id} value={order.id}>
                            {order.woNumber} / {getProcessStepLabel(order.processType)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>파라미터명</span>
                      <input
                        value={spcForm.parameterName}
                        onChange={(event) => setSpcForm((current) => ({ ...current, parameterName: event.target.value }))}
                        placeholder="예: OCV, Thickness, Temperature"
                        disabled={spcSaving}
                      />
                    </label>

                    <label>
                      <span>서브그룹 번호</span>
                      <input
                        type="number"
                        min="1"
                        value={spcForm.subgroupNo}
                        onChange={(event) => setSpcForm((current) => ({ ...current, subgroupNo: event.target.value }))}
                        disabled={spcSaving}
                      />
                    </label>

                    <label>
                      <span>샘플값 목록</span>
                      <textarea
                        rows="4"
                        value={spcForm.sampleValues}
                        onChange={(event) => setSpcForm((current) => ({ ...current, sampleValues: event.target.value }))}
                        placeholder="쉼표 또는 줄바꿈으로 구분하세요. 예: 3.71, 3.74, 3.69, 3.72"
                        disabled={spcSaving}
                      />
                    </label>

                    <label>
                      <span>UCL</span>
                      <input
                        value={spcForm.ucl}
                        onChange={(event) => setSpcForm((current) => ({ ...current, ucl: event.target.value }))}
                        placeholder="선택 입력"
                        disabled={spcSaving}
                      />
                    </label>

                    <label>
                      <span>CL</span>
                      <input
                        value={spcForm.cl}
                        onChange={(event) => setSpcForm((current) => ({ ...current, cl: event.target.value }))}
                        placeholder="선택 입력"
                        disabled={spcSaving}
                      />
                    </label>

                    <label>
                      <span>LCL</span>
                      <input
                        value={spcForm.lcl}
                        onChange={(event) => setSpcForm((current) => ({ ...current, lcl: event.target.value }))}
                        placeholder="선택 입력"
                        disabled={spcSaving}
                      />
                    </label>

                    <div className="auth-summary">
                      <div>
                        <span>샘플 개수</span>
                        <strong>{parsedSpcSampleValues.length}</strong>
                      </div>
                      <div>
                        <span>X-bar</span>
                        <strong>{spcPreview.xBar === null ? '-' : formatNumber(spcPreview.xBar)}</strong>
                      </div>
                      <div>
                        <span>Range</span>
                        <strong>{spcPreview.rangeValue === null ? '-' : formatNumber(spcPreview.rangeValue)}</strong>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button className="submit-button" type="submit" disabled={spcSaving}>
                        {spcSaving ? '저장 중...' : 'SPC 등록'}
                      </button>
                      <button className="secondary-button" type="button" onClick={resetSpcForm} disabled={spcSaving}>
                        초기화
                      </button>
                    </div>
                  </form>

                  {spcSaveSuccess ? <p className="success-text">{spcSaveSuccess}</p> : null}
                  {spcSaveError ? <p className="error-text">{spcSaveError}</p> : null}
                </article>

                <article className="panel">
                  <div className="panel-head">
                    <div>
                      <p className="panel-kicker">SPC 목록</p>
                      <h2>최근 SPC 데이터</h2>
                    </div>
                  </div>

                  <form className="login-form">
                    <label>
                      <span>LOT 필터</span>
                      <select
                        value={spcFilters.lotId}
                        onChange={(event) => {
                          const nextLotId = event.target.value
                          setSpcFilters((current) => ({
                            ...current,
                            lotId: nextLotId,
                            workOrderId: current.lotId === nextLotId ? current.workOrderId : '',
                          }))
                        }}
                      >
                        <option value="">전체 LOT</option>
                        {dashboardData.lots.map((lot) => (
                          <option key={lot.id} value={lot.id}>
                            {lot.lotNumber} / {lot.productName}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>작업지시 필터</span>
                      <select
                        value={spcFilters.workOrderId}
                        onChange={(event) => setSpcFilters((current) => ({ ...current, workOrderId: event.target.value }))}
                      >
                        <option value="">전체 작업지시</option>
                        {filteredSpcSearchWorkOrders.map((order) => (
                          <option key={order.id} value={order.id}>
                            {order.woNumber} / {getProcessStepLabel(order.processType)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>파라미터명 필터</span>
                      <input
                        value={spcFilters.parameterName}
                        onChange={(event) => setSpcFilters((current) => ({ ...current, parameterName: event.target.value }))}
                        placeholder="OCV, Thickness, Temperature"
                      />
                    </label>

                    <label>
                      <span>상태 필터</span>
                      <select
                        value={spcFilters.status}
                        onChange={(event) => setSpcFilters((current) => ({ ...current, status: event.target.value }))}
                      >
                        <option value="ALL">전체</option>
                        <option value="NORMAL">정상</option>
                        <option value="OUT_OF_CONTROL">이탈</option>
                      </select>
                    </label>

                    <div className="auth-summary">
                      <div>
                        <span>조회 건수</span>
                        <strong>{filteredSpcRows.length}</strong>
                      </div>
                      <div>
                        <span>이탈 건수</span>
                        <strong>{filteredSpcOutOfControlCount}</strong>
                      </div>
                      <div>
                        <span>파라미터 요약</span>
                        <strong>{filteredSpcParameterSummary || '-'}</strong>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button className="secondary-button" type="button" onClick={resetSpcFilters}>
                        필터 초기화
                      </button>
                    </div>
                  </form>

                  <div className="stack-list compact">
                    {filteredSpcRows.length === 0 ? (
                      <div className="empty-state">등록된 SPC 데이터가 없습니다.</div>
                    ) : (
                      filteredSpcRows.map((row) => (
                        <div className="stack-item" key={row.id}>
                          <div>
                            <strong>{row.parameterName}</strong>
                            <p>{row.lotNumber ?? '-'} / {row.woNumber ?? '작업지시 없음'}</p>
                            <p>Subgroup {row.subgroupNo} / X-bar {row.xBar ?? '-'} / Range {row.rangeValue ?? '-'}</p>
                            <p>{formatDateTimeDisplay(row.measuredAt)}</p>
                          </div>
                          <div className="item-actions">
                            <span className={`mini-badge ${isSpcOutOfControl(row) ? 'DOWN' : 'IDLE'}`}>
                              {row.ucl !== null && row.xBar !== null && safeNumber(row.xBar) > safeNumber(row.ucl)
                                ? '상한 이탈'
                                : row.lcl !== null && row.xBar !== null && safeNumber(row.xBar) < safeNumber(row.lcl)
                                  ? '하한 이탈'
                                  : '정상'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              </div>
            </section>
          ) : null}

          {activeSection === 'quality' && auth?.accessToken ? (
            <section className="content-grid domain-layout quality-layout">
              <article className="domain-banner domain-banner-quality">
                <div className="domain-banner-body">
                  <div>
                    <p className="domain-kicker">품질관리</p>
                    <h2>검사 결과 입력과 불량 등록을 단계별로 나눠 관리하는 품질 운영 화면입니다.</h2>
                  </div>
                  <div className="domain-banner-metrics">
                    <div className="domain-banner-metric">
                        <span>검사</span>
                      <strong>{dashboardData.inspections.length}</strong>
                    </div>
                    <div className="domain-banner-metric">
                        <span>불량</span>
                      <strong>{dashboardData.defects.length}</strong>
                    </div>
                    <div className="domain-banner-metric">
                        <span>FAIL 기반 후보</span>
                      <strong>{availableDefectInspections.length}</strong>
                    </div>
                  </div>
                </div>
              </article>

              <section className="domain-overview-grid">
                <article className="domain-overview-card accent">
                  <p>검사 운영</p>
                  <strong>{dashboardData.inspections.length}</strong>
                  <span>PASS {inspectionPassCount} / FAIL {inspectionFailCount}</span>
                </article>
                <article className="domain-overview-card good">
                  <p>검사 합격률</p>
                  <strong>{formatPercent(inspectionPassRate)}</strong>
                  <span>등급 A {gradeACount}건 / 전체 검사 대비 합격 비율</span>
                </article>
                <article className="domain-overview-card alert">
                  <p>???源녿뼥 ???⑤８?</p>
                  <strong>{qualityIssueCount}</strong>
                  <span>FAIL 검사 {inspectionFailCount} + 불량 등록 {dashboardData.defects.length}</span>
                </article>
                <article className="domain-overview-card">
                  <p>불량 등록 준비</p>
                  <strong>{availableDefectInspections.length}</strong>
                  <span>현재 불량 등록 가능한 FAIL 검사 건수</span>
                </article>
              </section>

              <article className="panel domain-mode-panel quality-mode-panel">
                <div className="quality-mode-layout">
                  <div className="quality-mode-copy">
                    <div className="panel-head compact-head">
                      <div>
                        <p className="panel-kicker">품질 작업 모드</p>
                        <h2>{qualityView === 'inspection' ? '검사 관리 화면' : '불량 관리 화면'}</h2>
                      </div>
                    </div>
                    <p className="quality-mode-text">
                      검사 결과를 먼저 등록한 뒤, FAIL 건은 불량 관리 탭에서 바로 이어서 등록할 수 있도록 흐름을 정리했습니다.
                    </p>
                  </div>

                  <div className="quality-tab-row">
                    <button
                      className={`quality-tab-button ${qualityView === 'inspection' ? 'active' : ''}`}
                      type="button"
                      onClick={() => setQualityView('inspection')}
                    >
                      <span className="quality-tab-label">검사 관리</span>
                      <span className="quality-tab-count">{dashboardData.inspections.length}건</span>
                    </button>
                    <button
                      className={`quality-tab-button ${qualityView === 'defect' ? 'active' : ''}`}
                      type="button"
                      onClick={() => setQualityView('defect')}
                    >
                      <span className="quality-tab-label">불량 관리</span>
                      <span className="quality-tab-count">{dashboardData.defects.length}건</span>
                    </button>
                  </div>
                </div>
              </article>

              {qualityView === 'inspection' ? (
                <>
                  <div className="section-cluster section-cluster-form domain-section-stack">
                  <div className="section-cluster-head">
                      <p className="section-cluster-kicker">검사 입력</p>
                      <h3>검사 결과를 입력하고 예상 판정과 등급을 먼저 확인한 뒤 저장할 수 있습니다.</h3>
                    </div>

                    <div className="domain-panel-grid quality-editor-grid">
                      <article className="panel">
                        <div className="panel-head">
                          <div>
                            <p className="panel-kicker">검사 관리</p>
                            <h2>{editingInspectionId ? '검사 수정' : '검사 등록'}</h2>
                          </div>
                        </div>
                        <form className="management-form" onSubmit={handleInspectionSubmit} noValidate>
                          <label>
                            <span>LOT</span>
                            <select value={inspectionForm.lotId} onChange={(event) => handleInspectionLotChange(event.target.value)} required>
                              {hasLotOptions ? <option value="">LOT 선택</option> : <option value="">LOT 데이터 없음</option>}
                              {dashboardData.lots.map((lot) => (
                                <option key={lot.id} value={lot.id}>{lot.lotNumber} / {lot.productName}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            <span>작업지시</span>
                            <select value={inspectionForm.workOrderId} onChange={(event) => setInspectionForm((current) => ({ ...current, workOrderId: event.target.value }))}>
                              {inspectionForm.lotId && !hasFilteredWorkOrders ? <option value="">연결된 작업지시 없음</option> : <option value="">선택 안 함</option>}
                              {filteredInspectionWorkOrders.map((order) => (
                                <option key={order.id} value={order.id}>{order.woNumber} / {order.processType}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            <span>검사 유형</span>
                            <select value={inspectionForm.processType} onChange={(event) => setInspectionForm((current) => ({ ...current, processType: event.target.value }))}>
                              <option value="IQC">{getInspectionTypeLabel('IQC')}</option>
                              <option value="IPQC">{getInspectionTypeLabel('IPQC')}</option>
                              <option value="OQC">{getInspectionTypeLabel('OQC')}</option>
                            </select>
                          </label>
                          <label>
                            <span>검사항목</span>
                            <input value={inspectionForm.inspectionItem} onChange={(event) => setInspectionForm((current) => ({ ...current, inspectionItem: event.target.value }))} placeholder="예: Open circuit voltage" required />
                          </label>
                          <label>
                            <span>최소 기준값</span>
                            <input type="number" step="0.0001" value={inspectionForm.specMin} onChange={(event) => setInspectionForm((current) => ({ ...current, specMin: event.target.value }))} placeholder="3.6000" />
                          </label>
                          <label>
                            <span>최대 기준값</span>
                            <input type="number" step="0.0001" value={inspectionForm.specMax} onChange={(event) => setInspectionForm((current) => ({ ...current, specMax: event.target.value }))} placeholder="4.2000" />
                          </label>
                          <label>
                            <span>측정값</span>
                            <input type="number" step="0.0001" value={inspectionForm.measuredValue} onChange={(event) => setInspectionForm((current) => ({ ...current, measuredValue: event.target.value }))} placeholder="3.9800" required />
                          </label>
                          <label>
                            <span>에이징 상태</span>
                            <select value={inspectionForm.agingStatus} onChange={(event) => setInspectionForm((current) => ({ ...current, agingStatus: event.target.value }))}>
                              <option value="PENDING">{getInspectionResultLabel('PENDING')}</option>
                              <option value="PASS">{getInspectionResultLabel('PASS')}</option>
                              <option value="FAIL">{getInspectionResultLabel('FAIL')}</option>
                            </select>
                          </label>
                          <label>
                            <span>비고</span>
                            <textarea value={inspectionForm.remarks} onChange={(event) => setInspectionForm((current) => ({ ...current, remarks: event.target.value }))} placeholder="선택 입력" />
                          </label>
                          {inspectionPreview?.invalid ? <p className="error-text">{inspectionPreview.message}</p> : null}
                          {inspectionPreview && !inspectionPreview.invalid ? (
                            <div className="status-summary-row inspection-preview-row">
                              <div className="status-summary-box">
                                <p>예상 판정</p>
                                <strong>{getInspectionResultLabel(inspectionPreview.result)}</strong>
                              </div>
                              <div className="status-summary-box">
                                <p>예상 등급</p>
                                <strong>{inspectionPreview.grade}</strong>
                              </div>
                            </div>
                          ) : null}
                          <p className="hint-text">프론트에서는 예상 PASS/FAIL과 등급을 먼저 보여주고, 최종 판정은 백엔드 저장 결과를 따릅니다.</p>
                          <div className="form-actions">
                            <button className="submit-button" type="submit" disabled={inspectionSaving || !hasLotOptions}>
                              {!hasLotOptions ? 'LOT 데이터 없음' : inspectionSaving ? '저장 중...' : editingInspectionId ? '검사 수정 저장' : '검사 등록'}
                            </button>
                            <button className="secondary-light-button" type="button" onClick={resetInspectionForm}>
                              초기화
                            </button>
                          </div>
                        </form>
                        {inspectionSaveSuccess ? <p className="success-text">{inspectionSaveSuccess}</p> : null}
                        {inspectionSaveError ? <p className="error-text">{inspectionSaveError}</p> : null}
                      </article>

                      <article className="panel domain-note-panel">
                        <div className="panel-head">
                          <div>
                            <p className="panel-kicker">검사 요약</p>
                            <h2>운영 포인트</h2>
                          </div>
                        </div>
                        <div className="domain-note-stack">
                          <div className="domain-note-card">
                            <strong>검사 요약</strong>
                            <p>{inspectionSnapshot || '검사 요약 데이터가 없습니다.'}</p>
                          </div>
                          <div className="domain-note-card">
                            <strong>불량 연계</strong>
                            <p>FAIL 판정이 나온 검사만 불량 등록 화면에서 선택할 수 있습니다.</p>
                          </div>
                          <div className="domain-note-card">
                            <strong>등급 관리</strong>
                            <p>A등급 {gradeACount}건이 누적되어 있습니다.</p>
                          </div>
                        </div>
                      </article>
                    </div>
                  </div>

                  <div className="section-cluster section-cluster-list domain-section-stack">
                    <div className="section-cluster-head">
                      <p className="section-cluster-kicker">검사 이력</p>
                      <h3>등록된 검사 목록을 보고 바로 수정 대상으로 연결할 수 있도록 테이블 중심으로 정리했습니다.</h3>
                    </div>

                    <article className="panel">
                      <div className="panel-head">
                        <div>
                          <p className="panel-kicker">검사 이력</p>
                          <h2>검사 목록</h2>
                        </div>
                      </div>
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>LOT</th>
                              <th>유형</th>
                              <th>항목</th>
                              <th>측정값</th>
                              <th>판정</th>
                              <th>등급</th>
                              <th>작업</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.inspections.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="empty-cell">등록된 검사 데이터가 없습니다.</td>
                              </tr>
                            ) : (
                              dashboardData.inspections.map((inspection) => (
                                <tr key={inspection.id}>
                                  <td>{inspection.lotNumber ?? '-'}</td>
                                  <td>{getInspectionTypeLabel(inspection.processType)}</td>
                                  <td>{inspection.inspectionItem}</td>
                                  <td>{formatInspectionMeasurement(inspection)}</td>
                                  <td><span className={`mini-badge ${inspection.result}`}>{getInspectionResultLabel(inspection.result)}</span></td>
                                  <td>{inspection.grade ?? '-'}</td>
                                  <td>
                                    <button className="table-action-button" type="button" onClick={() => startInspectionEdit(inspection)}>
                                      수정
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </article>
                  </div>
                </>
              ) : null}

              {qualityView === 'defect' ? (
                <>
                  <div className="section-cluster section-cluster-form domain-section-stack">
                    <div className="section-cluster-head">
                      <p className="section-cluster-kicker">불량 입력</p>
                      <h3>FAIL 검사 기준으로 불량을 등록하고, 심각도와 유형을 함께 관리할 수 있게 구성했습니다.</h3>
                    </div>

                    <div className="domain-panel-grid quality-editor-grid">
                      <article className="panel">
                        <div className="panel-head">
                          <div>
                            <p className="panel-kicker">불량 관리</p>
                            <h2>{editingDefectId ? '불량 수정' : '불량 등록'}</h2>
                          </div>
                        </div>
                        <form className="management-form" onSubmit={handleDefectSubmit} noValidate>
                          <label>
                            <span>검사 이력</span>
                            <select value={defectForm.inspectionId} onChange={(event) => setDefectForm((current) => ({ ...current, inspectionId: event.target.value }))} required>
                              <option value="">검사 이력 선택</option>
                              {availableDefectInspections.map((inspection) => (
                                <option key={inspection.id} value={inspection.id}>{inspection.lotNumber ?? '-'} / {inspection.inspectionItem} / {getInspectionResultLabel(inspection.result)}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            <span>불량 유형</span>
                            <select value={defectForm.defectCode} onChange={(event) => setDefectForm((current) => ({ ...current, defectCode: event.target.value }))} required>
                              <option value="">불량 유형 선택</option>
                              {dashboardData.defectTypes.map((defectType) => (
                                <option key={defectType.id} value={defectType.code}>{defectType.code} / {defectType.name}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            <span>심각도</span>
                            <select value={defectForm.severity} onChange={(event) => setDefectForm((current) => ({ ...current, severity: event.target.value }))}>
                              <option value="CRITICAL">{getDefectSeverityLabel('CRITICAL')}</option>
                              <option value="MAJOR">{getDefectSeverityLabel('MAJOR')}</option>
                              <option value="MINOR">{getDefectSeverityLabel('MINOR')}</option>
                            </select>
                          </label>
                          <label>
                            <span>설명</span>
                            <textarea value={defectForm.description} onChange={(event) => setDefectForm((current) => ({ ...current, description: event.target.value }))} placeholder="불량 상세 내용을 입력해 주세요." />
                          </label>
                          {selectedDefectType ? <p className="hint-text">선택 유형: {selectedDefectType.name} / {selectedDefectType.category}</p> : null}
                          {selectedDefectInspection ? <p className="hint-text">선택 검사: {getInspectionResultLabel(selectedDefectInspection.result)} / {selectedDefectInspection.inspectionItem}</p> : null}
                          {availableDefectInspections.length === 0 ? <p className="hint-text">현재 등록 가능한 FAIL 검사가 없습니다.</p> : null}
                          {dashboardData.defectTypes.length === 0 ? <p className="hint-text">불량 유형 데이터가 없습니다. API 또는 DB 데이터를 확인해 주세요.</p> : null}
                          <div className="form-actions">
                            <button className="submit-button" type="submit" disabled={defectSaving}>
                              {defectSaving ? '저장 중...' : editingDefectId ? '불량 수정 저장' : '불량 등록'}
                            </button>
                            <button className="secondary-light-button" type="button" onClick={resetDefectForm}>
                              초기화
                            </button>
                          </div>
                        </form>
                        {defectSaveSuccess ? <p className="success-text">{defectSaveSuccess}</p> : null}
                        {defectSaveError ? <p className="error-text">{defectSaveError}</p> : null}
                      </article>

                      <article className="panel domain-note-panel">
                        <div className="panel-head">
                          <div>
                            <p className="panel-kicker">불량 요약</p>
                            <h2>등록 기준과 상태</h2>
                          </div>
                        </div>
                        <div className="domain-note-stack">
                          <div className="domain-note-card">
                            <strong>불량 요약</strong>
                            <p>{defectSnapshot || '불량 요약 데이터가 없습니다.'}</p>
                          </div>
                          <div className="domain-note-card">
                            <strong>등록 가능 검사</strong>
                            <p>현재 {availableDefectInspections.length}건의 FAIL 검사가 불량 등록 대상입니다.</p>
                          </div>
                          <div className="domain-note-card">
                            <strong>치명 불량</strong>
                            <p>치명 불량은 현재 {criticalDefectCount}건입니다.</p>
                          </div>
                        </div>
                      </article>
                    </div>
                  </div>

                  <div className="section-cluster section-cluster-list domain-section-stack">
                    <div className="section-cluster-head">
                      <p className="section-cluster-kicker">불량 이력</p>
                      <h3>등록된 불량 목록을 카드형으로 보고, 심각도 기준으로 빠르게 수정 대상을 선택할 수 있습니다.</h3>
                    </div>

                    <article className="panel">
                      <div className="panel-head">
                        <div>
                            <p className="panel-kicker">불량 이력</p>
                          <h2>불량 목록</h2>
                        </div>
                      </div>
                      <div className="stack-list">
                        {dashboardData.defects.length === 0 ? (
                          <div className="empty-state">등록된 불량 데이터가 없습니다.</div>
                        ) : (
                          dashboardData.defects.map((defect) => (
                            <div className="stack-item" key={defect.id}>
                              <div>
                                <strong>{defect.defectCode}</strong>
                                <p>{defect.defectTypeName ?? defect.defectCategory ?? '유형 정보 없음'} / {defect.lotNumber ?? '-'}</p>
                              </div>
                              <div className="item-actions">
                                <span className={`mini-badge ${defect.severity}`}>{getDefectSeverityLabel(defect.severity)}</span>
                                <button className="table-action-button" type="button" onClick={() => startDefectEdit(defect)}>
                                  수정
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </article>
                  </div>
                </>
              ) : null}
            </section>
          ) : null}

    </Layout>

  )
}

function loadStoredAuth() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    return stored ? buildAuthSession(JSON.parse(stored)) : null
  } catch {
    return null
  }
}

function buildAuthSession(source) {
  if (!source?.accessToken) {
    return source ?? null
  }

  const profile = extractAuthProfile(source.accessToken)
  const fallbackEmail = source.email?.trim().toLowerCase() ?? profile.email ?? ''

  return {
    ...source,
    email: fallbackEmail,
    name: source.name ?? profile.name ?? fallbackEmail,
    role: source.role ?? profile.role ?? '',
  }
}

function extractAuthProfile(accessToken) {
  if (!accessToken) {
    return {}
  }

  try {
    const [, payloadSegment] = accessToken.split('.')
    if (!payloadSegment) {
      return {}
    }

    const decoded = decodeBase64Url(payloadSegment)
    const payload = JSON.parse(decoded)

    return {
      email: payload.sub ?? '',
      name: payload.name ?? '',
      role: payload.role ?? '',
    }
  } catch {
    return {}
  }
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)

  return decodeURIComponent(
    binary
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  )
}

function summarizeByStatus(items, labelMap) {
  if (!items.length) {
    return ''
  }

  const grouped = items.reduce((accumulator, item) => {
    accumulator[item.status] = (accumulator[item.status] ?? 0) + 1
    return accumulator
  }, {})

  return Object.entries(grouped)
    .map(([status, count]) => `${getDisplayLabel(labelMap, status)} ${count}`)
    .join(' / ')
}

function summarizeInspection(summary) {
  if (!summary) {
    return ''
  }

  return `${getInspectionResultLabel('PASS')} ${summary.passCount ?? 0} / ${getInspectionResultLabel('FAIL')} ${summary.failCount ?? 0} / A?濚밸Þ???${summary.gradeACount ?? 0}`
}

function summarizeDefect(summary) {
  if (!summary) {
    return ''
  }

  return `${getDefectSeverityLabel('CRITICAL')} ${summary.criticalCount ?? 0} / ${getDefectSeverityLabel('MAJOR')} ${summary.majorCount ?? 0} / ${getDefectSeverityLabel('MINOR')} ${summary.minorCount ?? 0}`
}

function getUserRoleLabel(role) {
  return getDisplayLabel(USER_ROLE_LABELS, role)
}

function getAssignmentRoleLabel(role) {
  return getDisplayLabel(ASSIGNMENT_ROLE_LABELS, role)
}

function canAccessSection(role, sectionKey, isLoggedIn) {
  if (!isLoggedIn) {
    return sectionKey === 'main'
  }

  if (role === 'ADMIN') {
    return true
  }

  if (role === 'OPERATOR') {
    return ['main', 'production', 'equipment', 'materials'].includes(sectionKey)
  }

  if (role === 'INSPECTOR') {
    return ['main', 'quality', 'spc'].includes(sectionKey)
  }

  return sectionKey === 'main'
}

function getLotStatusLabel(status) {
  return getDisplayLabel(LOT_STATUS_LABELS, status)
}

function getWorkOrderStatusLabel(status) {
  return getDisplayLabel(WORK_ORDER_STATUS_LABELS, status)
}

function getEquipmentStatusLabel(status) {
  return getDisplayLabel(EQUIPMENT_STATUS_LABELS, status)
}

function getEquipmentLogTypeLabel(logType) {
  return getDisplayLabel(EQUIPMENT_LOG_TYPE_LABELS, logType)
}

function getInspectionTypeLabel(type) {
  return getDisplayLabel(INSPECTION_TYPE_LABELS, type)
}

function getInspectionResultLabel(result) {
  return getDisplayLabel(INSPECTION_RESULT_LABELS, result)
}

function getDefectSeverityLabel(severity) {
  return getDisplayLabel(DEFECT_SEVERITY_LABELS, severity)
}


function getEquipmentStatusPriority(status) {
  if (status === 'DOWN') {
    return 0
  }
  if (status === 'PM') {
    return 1
  }
  if (status === 'RUNNING') {
    return 2
  }
  if (status === 'IDLE') {
    return 3
  }

  return 4
}

function getDefectSeverityPriority(severity) {
  if (severity === 'CRITICAL') {
    return 0
  }
  if (severity === 'MAJOR') {
    return 1
  }
  if (severity === 'MINOR') {
    return 2
  }

  return 3
}

function getProcessSnapshotState(snapshot) {
  if (snapshot.doneCount > 0) {
    return 'done'
  }
  if (snapshot.runningCount > 0) {
    return 'running'
  }
  if (snapshot.orderCount > 0) {
    return 'planned'
  }

  return 'idle'
}

function getProgressBarWidth(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0%'
  }

  const width = Math.max(0, Math.min(100, value * 100))
  return `${width.toFixed(1)}%`
}

function safeNumber(value) {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : 0
}
function formatNumber(value) {
  return safeNumber(value).toLocaleString()
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-'
  }

  return `${(value * 100).toFixed(1)}%`
}

function formatInspectionMeasurement(inspection) {
  const measured = inspection.measuredValue ?? '-'
  const hasSpec = inspection.specMin !== null || inspection.specMax !== null

  if (!hasSpec) {
    return `${measured}`
  }

  return `${measured} (${inspection.specMin ?? '-'} ~ ${inspection.specMax ?? '-'})`
}

function formatDateTimeDisplay(value) {
  if (!value) {
    return '-'
  }

  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function buildInspectionPreview(form) {
  const specMin = parseOptionalNumber(form.specMin)
  const specMax = parseOptionalNumber(form.specMax)
  const measuredValue = parseOptionalNumber(form.measuredValue)

  if ([specMin, specMax, measuredValue].some((value) => value !== null && Number.isNaN(value))) {
    return {
      invalid: true,
      message: '??れ삀????좊즴???癲ル쉵?猷???곗씀亦껋꼨援????????뱀땡?????곸죷???⑤；????筌뤾퍓???',
    }
  }

  if (measuredValue === null) {
    return null
  }

  if (specMin !== null && specMax !== null && specMin > specMax) {
    return {
      invalid: true,
      message: '癲ル슔?됭짆????れ삀????좊즴?? 癲ル슔?됭짆? ??れ삀????좊즴???????????⑤８?????덊렡.',
    }
  }

  const result = (specMin === null || measuredValue >= specMin) && (specMax === null || measuredValue <= specMax) ? 'PASS' : 'FAIL'

  return {
    invalid: false,
    result,
    grade: calculateInspectionPreviewGrade(specMin, specMax, measuredValue, result),
  }
}

function calculateInspectionPreviewGrade(specMin, specMax, measuredValue, result) {
  if (result !== 'PASS') {
    return 'C'
  }

  if (specMin === null || specMax === null) {
    return 'A'
  }

  const width = specMax - specMin
  if (width === 0) {
    return measuredValue === specMin ? 'A' : 'C'
  }

  const center = (specMin + specMax) / 2
  const halfWidth = width / 2
  const deviationRatio = Math.abs(measuredValue - center) / halfWidth

  if (deviationRatio <= 0.33) {
    return 'A'
  }
  if (deviationRatio <= 0.66) {
    return 'B'
  }
  return 'C'
}

function parseSampleValueList(value) {
  if (!value) {
    return []
  }

  return String(value)
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item))
}

function calculateSpcStats(sampleValues) {
  if (!sampleValues || sampleValues.length === 0) {
    return {
      xBar: null,
      rangeValue: null,
    }
  }

  const min = Math.min(...sampleValues)
  const max = Math.max(...sampleValues)
  const sum = sampleValues.reduce((accumulator, value) => accumulator + value, 0)

  return {
    xBar: Number((sum / sampleValues.length).toFixed(4)),
    rangeValue: Number((max - min).toFixed(4)),
  }
}

function isSpcOutOfControl(row) {
  const xBar = safeNumber(row.xBar)
  const hasUpper = row.ucl !== null && row.ucl !== undefined
  const hasLower = row.lcl !== null && row.lcl !== undefined

  return (hasUpper && xBar > safeNumber(row.ucl)) || (hasLower && xBar < safeNumber(row.lcl))
}

function summarizeUniqueValues(items, key) {
  const uniqueValues = Array.from(
    new Set(
      items
        .map((item) => item[key])
        .filter(Boolean),
    ),
  )

  if (uniqueValues.length === 0) {
    return ''
  }

  return uniqueValues.join(', ')
}

function summarizeCountItems(items, labelMap, key) {
  if (!items.length) {
    return ''
  }

  return items
    .map((item) => {
      const rawLabel = item[key]
      const label = labelMap ? getDisplayLabel(labelMap, rawLabel) : rawLabel
      return `${label} ${item.count ?? 0}`
    })
    .join(' / ')
}

function formatPercentValue(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '-'
  }

  return `${safeNumber(value).toFixed(1)}%`
}

function parseOptionalNumber(value) {
  if (value === null || value === undefined) {
    return null
  }

  const normalized = String(value).trim()
  if (!normalized) {
    return null
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function toInputNumberValue(value) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

function normalizeProcessCode(value) {
  const matchedStep = PROCESS_STEPS.find(
    (step) => step.code === value || step.label === value || step.sourceValue === value,
  )

  return matchedStep?.code ?? value
}

function getProcessStepLabel(value) {
  const matchedStep = PROCESS_STEPS.find(
    (step) => step.code === value || step.label === value || step.sourceValue === value,
  )

  return matchedStep?.label ?? value
}

function toApiLocalDateTime(value) {
  if (!value) {
    return null
  }

  return value.length === 16 ? `${value}:00` : value
}

function toDateTimeInputValue(value) {
  if (!value) {
    return ''
  }

  return value.slice(0, 16)
}

export default App

