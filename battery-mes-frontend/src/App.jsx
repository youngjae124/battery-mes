import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import Layout from './components/common/Layout'
import Toast from './components/common/Toast'
import Sidebar from './components/common/Sidebar'
import AiImageModal from './components/common/AiImageModal'
import MainPage from './pages/MainPage'
import ProductionPage from './pages/ProductionPage'
import EquipmentPage from './pages/EquipmentPage'
import MaterialPage from './pages/MaterialPage'
import SpcPage from './pages/SpcPage'
import QualityPage from './pages/QualityPage'
import ReportPage from './pages/ReportPage'
import {
  AUTH_SESSION_EVENT,
  AUTH_STORAGE_KEY,
  EQUIPMENT_STATUS_LABELS,
  LOT_STATUS_LABELS,
  PROCESS_STEPS,
  USER_ROLES,
} from './constants/mesConfig'
import { SECTION_MENU } from './constants/sectionMenu'
import { loadStoredAuth, buildAuthSession } from './lib/authSession'
import {
  canAccessSection,
  formatDateTimeDisplay,
  formatInspectionMeasurement,
  formatNumber,
  formatPercent,
  formatPercentValue,
  getAssignmentRoleLabel,
  getCapabilityRatingLabel,
  getDefectSeverityLabel,
  getDefectSeverityPriority,
  getEquipmentLogTypeLabel,
  getEquipmentStatusLabel,
  getEquipmentStatusPriority,
  getInspectionResultLabel,
  getInspectionTypeLabel,
  getLotStatusLabel,
  getProcessSnapshotState,
  getProcessStepLabel,
  getProgressBarWidth,
  getUserRoleLabel,
  getWorkOrderStatusLabel,
  isSpcOutOfControl,
  normalizeProcessCode,
  safeNumber,
  summarizeByStatus,
  summarizeCountItems,
  summarizeDefect,
  summarizeInspection,
} from './lib/mesFormatters'
import {
  clearAuthSession,
  fetchDashboardBundle,
  fetchOperationalBundle,
  loginApi,
  registerApi,
} from './lib/mesApi'
import { ASSIGNMENT_ROLE_OPTIONS, useProductionLogic } from './hooks/useProductionLogic'
import { useEquipmentLogic } from './hooks/useEquipmentLogic'
import { MATERIAL_TYPE_OPTIONS, useMaterialLogic } from './hooks/useMaterialLogic'
import { useSpcLogic } from './hooks/useSpcLogic'
import { useQualityLogic } from './hooks/useQualityLogic'
import { useReportLogic } from './hooks/useReportLogic'
import { useToast } from './hooks/useToast'

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
  const [loginError, setLoginError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState('')
  const [dashboardError, setDashboardError] = useState('')
  const [dashboardNotice, setDashboardNotice] = useState('')

  const [dashboardData, setDashboardData] = useState(EMPTY_DASHBOARD)
  const [dashboardInsights, setDashboardInsights] = useState(EMPTY_DASHBOARD_INSIGHTS)

  const [activeSection, setActiveSection] = useState('main')

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
      setDashboardError(error.message || '대시보드 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const {
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
  } = useProductionLogic(auth, loadOperationalData)

  const {
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
  } = useEquipmentLogic(auth, dashboardData, loadOperationalData)

  const {
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
  } = useMaterialLogic(auth, dashboardData, loadOperationalData)

  const {
    spcForm,
    setSpcForm,
    spcSaving,
    spcSaveError,
    spcSaveSuccess,
    handleSpcSubmit,
    resetSpcForm,
    capabilityPreview,
    handleCalculateCapability,
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
  } = useSpcLogic(auth, dashboardData, loadOperationalData)

  const {
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
    defectCauseResult,
    defectCauseLoading,
    defectCauseError,
    handleDefectCauseAnalysis,
    defectImageFile,
    defectImagePreview,
    defectImageResult,
    defectImageLoading,
    defectImageError,
    handleDefectImageChange,
    handleDefectImageAnalysis,
    clearDefectImage,
  } = useQualityLogic(auth, dashboardData, setDashboardData, loadOperationalData)

  const {
    startDate: reportStartDate,
    setStartDate: setReportStartDate,
    endDate: reportEndDate,
    setEndDate: setReportEndDate,
    dailyReport,
    productionReport,
    reportLoading,
    reportError,
    handleReportSearch,
    handleExportExcel,
    handleExportPdf,
    aiSummary,
    aiSummaryLoading,
    aiSummaryError,
    handleAiSummary,
  } = useReportLogic(auth)

  const { toasts, show, dismiss } = useToast()

  useEffect(() => { if (lotSaveSuccess) show(lotSaveSuccess, 'success') }, [lotSaveSuccess])
  useEffect(() => { if (lotSaveError) show(lotSaveError, 'error') }, [lotSaveError])
  useEffect(() => { if (workOrderSaveSuccess) show(workOrderSaveSuccess, 'success') }, [workOrderSaveSuccess])
  useEffect(() => { if (workOrderSaveError) show(workOrderSaveError, 'error') }, [workOrderSaveError])
  useEffect(() => { if (assignmentSaveSuccess) show(assignmentSaveSuccess, 'success') }, [assignmentSaveSuccess])
  useEffect(() => { if (assignmentSaveError) show(assignmentSaveError, 'error') }, [assignmentSaveError])
  useEffect(() => { if (equipmentSaveSuccess) show(equipmentSaveSuccess, 'success') }, [equipmentSaveSuccess])
  useEffect(() => { if (equipmentSaveError) show(equipmentSaveError, 'error') }, [equipmentSaveError])
  useEffect(() => { if (processParamSaveSuccess) show(processParamSaveSuccess, 'success') }, [processParamSaveSuccess])
  useEffect(() => { if (processParamSaveError) show(processParamSaveError, 'error') }, [processParamSaveError])
  useEffect(() => { if (materialSaveSuccess) show(materialSaveSuccess, 'success') }, [materialSaveSuccess])
  useEffect(() => { if (materialSaveError) show(materialSaveError, 'error') }, [materialSaveError])
  useEffect(() => { if (bomSaveSuccess) show(bomSaveSuccess, 'success') }, [bomSaveSuccess])
  useEffect(() => { if (bomSaveError) show(bomSaveError, 'error') }, [bomSaveError])
  useEffect(() => { if (spcSaveSuccess) show(spcSaveSuccess, 'success') }, [spcSaveSuccess])
  useEffect(() => { if (spcSaveError) show(spcSaveError, 'error') }, [spcSaveError])
  useEffect(() => { if (inspectionSaveSuccess) show(inspectionSaveSuccess, 'success') }, [inspectionSaveSuccess])
  useEffect(() => { if (inspectionSaveError) show(inspectionSaveError, 'error') }, [inspectionSaveError])
  useEffect(() => { if (defectSaveSuccess) show(defectSaveSuccess, 'success') }, [defectSaveSuccess])
  useEffect(() => { if (defectSaveError) show(defectSaveError, 'error') }, [defectSaveError])

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
        setDashboardNotice('세션이 만료되어 자동으로 로그아웃되었습니다. 다시 로그인해 주세요.')
        setLoginError('세션이 만료되어 자동으로 로그아웃되었습니다. 다시 로그인해 주세요.')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 인증 상태가 바뀌면(로그인/로그아웃) 대시보드 운영 데이터를 다시 불러옵니다.
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
        message: '백엔드 서버와 정상적으로 연결되었습니다. 로그인 후 대시보드 데이터를 확인할 수 있습니다.',
      })
    } catch {
      setBackendState({
        status: 'disconnected',
        message: '백엔드 서버에 연결할 수 없습니다. Spring Boot 서버가 실행 중인지 확인해 주세요.',
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
      setLoginSuccess('로그인에 성공했습니다. 대시보드 데이터를 불러오는 중입니다.')
    } catch (error) {
      setLoginError(error.message || '로그인에 실패했습니다.')
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
      setRegisterError('이름, 이메일, 비밀번호는 필수 입력 항목입니다.')
      setLoading(false)
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError('비밀번호와 비밀번호 확인이 일치하지 않습니다.')
      setLoading(false)
      return
    }

    try {
      await registerApi(payload)
      setRegisterSuccess('회원가입이 완료되었습니다. 입력하신 정보로 로그인해 주세요.')
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
      setRegisterError(error.message || '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    clearAuthSession('logout')
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
  const availableAssignmentUsers = dashboardData.users.filter((user) => user.role !== 'ADMIN')
  const hasLotOptions = dashboardData.lots.length > 0
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
  const sectionMenuOrder = ['main', 'production', 'equipment', 'materials', 'spc', 'quality', 'reports']
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
        badge: `설비 ${dashboardData.equipment.length}`,
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
        badge: `검사 ${dashboardData.inspections.length} / 불량 ${dashboardData.defects.length}`,
      }
    }

    if (section.key === 'reports') {
      return section
    }

    return section
  })
    .filter((section) => canAccessSection(auth?.role, section.key, Boolean(auth?.accessToken)))
    .sort((left, right) => sectionMenuOrder.indexOf(left.key) - sectionMenuOrder.indexOf(right.key))
  const runningWorkOrderCount = dashboardData.workOrders.filter((order) => order.status === 'RUNNING').length
  const plannedWorkOrderCount = dashboardData.workOrders.filter((order) => order.status === 'PLANNED').length
  const processReadyCount = activeProcessStepSnapshots.filter((step) => step.ready).length
  const qualityIssueCount = inspectionFailCount + dashboardData.defects.length
  const currentSection = sectionMenuItems.find((section) => section.key === activeSection) ?? sectionMenuItems[0]

  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [fabPos, setFabPos] = useState(() => ({
    x: window.innerWidth - 88,
    y: Math.floor(window.innerHeight / 2) - 36,
  }))
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const dragMoved = useRef(false)

  useEffect(() => {
    function onMouseMove(e) {
      if (!dragging.current) return
      dragMoved.current = true
      const nextX = Math.min(Math.max(0, e.clientX - dragOffset.current.x), window.innerWidth - 72)
      const nextY = Math.min(Math.max(0, e.clientY - dragOffset.current.y), window.innerHeight - 72)
      setFabPos({ x: nextX, y: nextY })
    }
    function onMouseUp() {
      dragging.current = false
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  function handleFabMouseDown(e) {
    dragging.current = true
    dragMoved.current = false
    dragOffset.current = { x: e.clientX - fabPos.x, y: e.clientY - fabPos.y }
    document.body.style.userSelect = 'none'
  }

  function handleFabClick() {
    if (!dragMoved.current) setAiModalOpen(true)
  }

  const isLoggedIn = Boolean(auth?.accessToken)
  const authDisplayName = auth?.name ?? auth?.email ?? '\uBBF8\uC9C0\uC815 \uC0AC\uC6A9\uC790'
  const authRoleLabel = auth?.role ? getUserRoleLabel(auth.role) : '\uAD8C\uD55C \uBBF8\uC124\uC815'
  const authRoleClassName = auth?.role ? auth.role.toLowerCase() : 'unknown'
  return (
    <>
    <Toast toasts={toasts} onDismiss={dismiss} />
    {isLoggedIn && (
      <button
        className="ai-fab"
        style={{ left: fabPos.x, top: fabPos.y }}
        onMouseDown={handleFabMouseDown}
        onClick={handleFabClick}
        title="AI \uC774\uBBF8\uC9C0 \uBD84\uC11D (\uB4DC\uB798\uADF8\uB85C \uC774\uB3D9 \uAC00\uB2A5)"
        aria-label="AI \uC774\uBBF8\uC9C0 \uBD84\uC11D \uC5F4\uAE30"
      >
        <svg className="ai-fab-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="8" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="1.8"/>
          <circle cx="8.5" cy="13" r="1.5" fill="currentColor"/>
          <circle cx="15.5" cy="13" r="1.5" fill="currentColor"/>
          <path d="M9 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M12 8V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="12" cy="4" r="1.2" fill="currentColor"/>
          <path d="M3 13H1M23 13h-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        <span className="ai-fab-text">AI</span>
      </button>
    )}
    {isLoggedIn && aiModalOpen && (
      <AiImageModal auth={auth} onClose={() => setAiModalOpen(false)} />
    )}
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
          qualityTrend={dashboardInsights.qualityTrend}
          defectCategories={dashboardInsights.defectCategories}
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
            <ProductionPage
              dashboardData={dashboardData}
              processReadyCount={processReadyCount}
              PROCESS_STEPS={PROCESS_STEPS}
              inProgressLotCount={inProgressLotCount}
              completedLotCount={completedLotCount}
              holdLotCount={holdLotCount}
              formatNumber={formatNumber}
              totalLotQuantity={totalLotQuantity}
              runningWorkOrderCount={runningWorkOrderCount}
              completedWorkOrderCount={completedWorkOrderCount}
              plannedWorkOrderCount={plannedWorkOrderCount}
              formatPercent={formatPercent}
              productionAchievementRate={productionAchievementRate}
              totalActualQuantity={totalActualQuantity}
              totalTargetQuantity={totalTargetQuantity}
              completedProcessCodes={completedProcessCodes}
              getWorkOrderStatusLabel={getWorkOrderStatusLabel}
              editingLotId={editingLotId}
              handleLotSubmit={handleLotSubmit}
              lotForm={lotForm}
              setLotForm={setLotForm}
              getLotStatusLabel={getLotStatusLabel}
              lotSaving={lotSaving}
              resetLotForm={resetLotForm}
              lotSaveSuccess={lotSaveSuccess}
              lotSaveError={lotSaveError}
              editingWorkOrderId={editingWorkOrderId}
              handleWorkOrderSubmit={handleWorkOrderSubmit}
              workOrderForm={workOrderForm}
              setWorkOrderForm={setWorkOrderForm}
              hasLotOptions={hasLotOptions}
              ASSIGNMENT_ROLE_OPTIONS={ASSIGNMENT_ROLE_OPTIONS}
              workOrderSaving={workOrderSaving}
              resetWorkOrderForm={resetWorkOrderForm}
              workOrderSaveSuccess={workOrderSaveSuccess}
              workOrderSaveError={workOrderSaveError}
              editingAssignmentId={editingAssignmentId}
              handleAssignmentSubmit={handleAssignmentSubmit}
              assignmentForm={assignmentForm}
              setAssignmentForm={setAssignmentForm}
              availableAssignmentUsers={availableAssignmentUsers}
              getUserRoleLabel={getUserRoleLabel}
              getAssignmentRoleLabel={getAssignmentRoleLabel}
              assignmentSaving={assignmentSaving}
              resetAssignmentForm={resetAssignmentForm}
              assignmentSaveSuccess={assignmentSaveSuccess}
              assignmentSaveError={assignmentSaveError}
              startLotEdit={startLotEdit}
              startWorkOrderEdit={startWorkOrderEdit}
              formatDateTimeDisplay={formatDateTimeDisplay}
              startAssignmentEdit={startAssignmentEdit}
            />
          ) : null}

          {activeSection === 'equipment' && auth?.accessToken ? (
            <EquipmentPage
              dashboardData={dashboardData}
              runningEquipmentCount={runningEquipmentCount}
              downEquipmentCount={downEquipmentCount}
              idleEquipmentCount={idleEquipmentCount}
              editingEquipmentId={editingEquipmentId}
              selectedEquipmentSummary={selectedEquipmentSummary}
              equipmentStatusSummary={equipmentStatusSummary}
              backendState={backendState}
              handleEquipmentSubmit={handleEquipmentSubmit}
              equipmentForm={equipmentForm}
              setEquipmentForm={setEquipmentForm}
              getEquipmentStatusLabel={getEquipmentStatusLabel}
              getEquipmentLogTypeLabel={getEquipmentLogTypeLabel}
              equipmentSaving={equipmentSaving}
              resetEquipmentForm={resetEquipmentForm}
              equipmentSaveSuccess={equipmentSaveSuccess}
              equipmentSaveError={equipmentSaveError}
              editingProcessParamId={editingProcessParamId}
              handleProcessParamSubmit={handleProcessParamSubmit}
              processParamForm={processParamForm}
              setProcessParamForm={setProcessParamForm}
              processParamSaving={processParamSaving}
              resetProcessParamForm={resetProcessParamForm}
              processParamSaveSuccess={processParamSaveSuccess}
              processParamSaveError={processParamSaveError}
              selectedEquipmentLogs={selectedEquipmentLogs}
              formatDateTimeDisplay={formatDateTimeDisplay}
              selectedProcessParams={selectedProcessParams}
              startProcessParamEdit={startProcessParamEdit}
              startEquipmentEdit={startEquipmentEdit}
              handleProcessParamWorkOrderChange={handleProcessParamWorkOrderChange}
            />
          ) : null}

          {activeSection === 'materials' && auth?.accessToken ? (
            <MaterialPage
              dashboardData={dashboardData}
              MATERIAL_TYPE_OPTIONS={MATERIAL_TYPE_OPTIONS}
              materialTypeSummary={materialTypeSummary}
              selectedMaterial={selectedMaterial}
              formatNumber={formatNumber}
              editingMaterialId={editingMaterialId}
              handleMaterialSubmit={handleMaterialSubmit}
              materialForm={materialForm}
              setMaterialForm={setMaterialForm}
              materialSaving={materialSaving}
              resetMaterialForm={resetMaterialForm}
              materialSaveSuccess={materialSaveSuccess}
              materialSaveError={materialSaveError}
              editingBomId={editingBomId}
              handleBomSubmit={handleBomSubmit}
              bomForm={bomForm}
              setBomForm={setBomForm}
              bomSaving={bomSaving}
              resetBomForm={resetBomForm}
              bomSaveSuccess={bomSaveSuccess}
              bomSaveError={bomSaveError}
              startMaterialEdit={startMaterialEdit}
              startBomEdit={startBomEdit}
            />
          ) : null}

          {activeSection === 'spc' && auth?.accessToken ? (
            <SpcPage
              filteredSpcRows={filteredSpcRows}
              filteredSpcOutOfControlCount={filteredSpcOutOfControlCount}
              parsedSpcSampleValues={parsedSpcSampleValues}
              formatNumber={formatNumber}
              spcPreview={spcPreview}
              handleSpcSubmit={handleSpcSubmit}
              spcForm={spcForm}
              setSpcForm={setSpcForm}
              hasSpcLotOptions={hasSpcLotOptions}
              spcSaving={spcSaving}
              dashboardData={dashboardData}
              filteredSpcWorkOrders={filteredSpcWorkOrders}
              getProcessStepLabel={getProcessStepLabel}
              resetSpcForm={resetSpcForm}
              spcSaveSuccess={spcSaveSuccess}
              spcSaveError={spcSaveError}
              spcFilters={spcFilters}
              setSpcFilters={setSpcFilters}
              filteredSpcSearchWorkOrders={filteredSpcSearchWorkOrders}
              filteredSpcParameterSummary={filteredSpcParameterSummary}
              resetSpcFilters={resetSpcFilters}
              formatDateTimeDisplay={formatDateTimeDisplay}
              isSpcOutOfControl={isSpcOutOfControl}
              safeNumber={safeNumber}
              capabilityPreview={capabilityPreview}
              handleCalculateCapability={handleCalculateCapability}
              getCapabilityRatingLabel={getCapabilityRatingLabel}
              spcChartData={spcChartData}
              spcChartLoading={spcChartLoading}
              spcChartError={spcChartError}
              handleFetchSpcChart={handleFetchSpcChart}
            />
          ) : null}

          {activeSection === 'quality' && auth?.accessToken ? (
            <QualityPage
              auth={auth}
              dashboardData={dashboardData}
              availableDefectInspections={availableDefectInspections}
              inspectionPassCount={inspectionPassCount}
              inspectionFailCount={inspectionFailCount}
              formatPercent={formatPercent}
              inspectionPassRate={inspectionPassRate}
              gradeACount={gradeACount}
              qualityIssueCount={qualityIssueCount}
              qualityView={qualityView}
              setQualityView={setQualityView}
              editingInspectionId={editingInspectionId}
              handleInspectionSubmit={handleInspectionSubmit}
              inspectionForm={inspectionForm}
              handleInspectionLotChange={handleInspectionLotChange}
              handleInspectionWorkOrderChange={handleInspectionWorkOrderChange}
              handleInspectionItemChange={handleInspectionItemChange}
              hasLotOptions={hasLotOptions}
              setInspectionForm={setInspectionForm}
              hasFilteredWorkOrders={hasFilteredWorkOrders}
              filteredInspectionWorkOrders={filteredInspectionWorkOrders}
              inspectionItemOptions={inspectionItemOptions}
              getInspectionTypeLabel={getInspectionTypeLabel}
              getInspectionResultLabel={getInspectionResultLabel}
              inspectionPreview={inspectionPreview}
              inspectionSaving={inspectionSaving}
              resetInspectionForm={resetInspectionForm}
              inspectionSaveSuccess={inspectionSaveSuccess}
              inspectionSaveError={inspectionSaveError}
              inspectionSnapshot={inspectionSnapshot}
              formatInspectionMeasurement={formatInspectionMeasurement}
              startInspectionEdit={startInspectionEdit}
              handleDeleteInspection={handleDeleteInspection}
              inspectionDeleting={inspectionDeleting}
              handleExportCsv={handleExportCsv}
              csvExporting={csvExporting}
              editingDefectId={editingDefectId}
              handleDefectSubmit={handleDefectSubmit}
              defectForm={defectForm}
              setDefectForm={setDefectForm}
              getDefectSeverityLabel={getDefectSeverityLabel}
              selectedDefectType={selectedDefectType}
              selectedDefectInspection={selectedDefectInspection}
              defectSaving={defectSaving}
              resetDefectForm={resetDefectForm}
              defectSaveSuccess={defectSaveSuccess}
              defectSaveError={defectSaveError}
              defectSnapshot={defectSnapshot}
              criticalDefectCount={criticalDefectCount}
              startDefectEdit={startDefectEdit}
              defectTrend={defectTrend}
              defectCauseResult={defectCauseResult}
              defectCauseLoading={defectCauseLoading}
              defectCauseError={defectCauseError}
              handleDefectCauseAnalysis={handleDefectCauseAnalysis}
              defectImageFile={defectImageFile}
              defectImagePreview={defectImagePreview}
              defectImageResult={defectImageResult}
              defectImageLoading={defectImageLoading}
              defectImageError={defectImageError}
              handleDefectImageChange={handleDefectImageChange}
              handleDefectImageAnalysis={handleDefectImageAnalysis}
              clearDefectImage={clearDefectImage}
            />
          ) : null}

          {activeSection === 'reports' && auth?.accessToken ? (
            <ReportPage
              startDate={reportStartDate}
              setStartDate={setReportStartDate}
              endDate={reportEndDate}
              setEndDate={setReportEndDate}
              handleReportSearch={handleReportSearch}
              reportLoading={reportLoading}
              reportError={reportError}
              dailyReport={dailyReport}
              productionReport={productionReport}
              formatNumber={formatNumber}
              formatPercentValue={formatPercentValue}
              handleExportExcel={handleExportExcel}
              handleExportPdf={handleExportPdf}
              aiSummary={aiSummary}
              aiSummaryLoading={aiSummaryLoading}
              aiSummaryError={aiSummaryError}
              handleAiSummary={handleAiSummary}
            />
          ) : null}

    </Layout>
    </>
  )
}

export default App

