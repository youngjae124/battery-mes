import { AUTH_SESSION_EVENT, AUTH_STORAGE_KEY } from '../constants/mesConfig'

async function readResponseBody(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch (error) {
    return { message: text }
  }
}

async function parseResponse(response) {
  const result = await readResponseBody(response)

  if (!response.ok || !result?.success) {
    throw new Error(result?.message ?? 'Request failed.')
  }

  return result.data
}

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    return null
  }
}

function saveStoredAuth(auth, reason = 'updated') {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EVENT, { detail: { auth, reason } }))
}

export function clearAuthSession(reason = 'logout') {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EVENT, { detail: { auth: null, reason } }))
}

export async function registerApi(payload) {
  const response = await fetch('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function loginApi(payload) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function refreshAccessTokenApi(refreshToken) {
  const response = await fetch('/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  })

  return parseResponse(response)
}

async function refreshStoredSession() {
  const storedAuth = loadStoredAuth()

  if (!storedAuth?.refreshToken) {
    throw new Error('Refresh token is not available.')
  }

  const refreshedToken = await refreshAccessTokenApi(storedAuth.refreshToken)
  const nextAuth = {
    ...storedAuth,
    ...refreshedToken,
  }

  saveStoredAuth(nextAuth, 'refresh')
  return nextAuth
}

async function authorizedFetch(path, options = {}, accessToken) {
  const originalHeaders = options.headers ?? {}
  const requestWithToken = (token) => ({
    ...options,
    headers: {
      ...originalHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  let response = await fetch(path, requestWithToken(accessToken))

  if (response.status !== 401) {
    return response
  }

  try {
    const refreshedAuth = await refreshStoredSession()
    response = await fetch(path, requestWithToken(refreshedAuth.accessToken))
    return response
  } catch (error) {
    clearAuthSession('expired')
    throw new Error('Authentication is required. Please log in again.')
  }
}

export async function getApi(path, accessToken) {
  const response = await authorizedFetch(path, {}, accessToken)

  return parseResponse(response)
}

export async function deleteApi(path, accessToken) {
  const response = await authorizedFetch(path, { method: 'DELETE' }, accessToken)

  return parseResponse(response)
}

export async function saveApi(path, method, payload, accessToken) {
  const response = await authorizedFetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }, accessToken)

  return parseResponse(response)
}

export async function createLotApi(payload, accessToken) {
  return saveApi('/api/lots', 'POST', payload, accessToken)
}

export async function updateLotApi(lotId, payload, accessToken) {
  return saveApi(`/api/lots/${lotId}`, 'PUT', payload, accessToken)
}

export async function createWorkOrderApi(payload, accessToken) {
  return saveApi('/api/work-orders', 'POST', payload, accessToken)
}

export async function updateWorkOrderApi(workOrderId, payload, accessToken) {
  return saveApi(`/api/work-orders/${workOrderId}`, 'PUT', payload, accessToken)
}

export async function fetchUsersApi(accessToken) {
  return getApi('/api/users', accessToken)
}

export async function fetchWorkAssignmentsApi(workOrderId, accessToken) {
  const query = workOrderId ? `?workOrderId=${encodeURIComponent(workOrderId)}` : ''
  return getApi(`/api/work-orders/assignments${query}`, accessToken)
}

export async function createWorkAssignmentApi(payload, accessToken) {
  return saveApi('/api/work-orders/assignments', 'POST', payload, accessToken)
}

export async function updateWorkAssignmentApi(assignmentId, payload, accessToken) {
  return saveApi(`/api/work-orders/assignments/${assignmentId}`, 'PUT', payload, accessToken)
}

export async function updateEquipmentApi(equipmentId, payload, accessToken) {
  return saveApi(`/api/equipment/${equipmentId}`, 'PUT', payload, accessToken)
}

export async function createEquipmentLogApi(payload, accessToken) {
  return saveApi('/api/equipment/logs', 'POST', payload, accessToken)
}

export async function fetchEquipmentLogsApi(equipmentId, accessToken) {
  const query = equipmentId ? `?equipmentId=${encodeURIComponent(equipmentId)}` : ''
  return getApi(`/api/equipment/logs${query}`, accessToken)
}

export async function fetchProcessParamsApi(workOrderId, accessToken) {
  const query = workOrderId ? `?workOrderId=${encodeURIComponent(workOrderId)}` : ''
  return getApi(`/api/equipment/process-params${query}`, accessToken)
}

export async function createProcessParamApi(payload, accessToken) {
  return saveApi('/api/equipment/process-params', 'POST', payload, accessToken)
}

export async function updateProcessParamApi(processParamId, payload, accessToken) {
  return saveApi(`/api/equipment/process-params/${processParamId}`, 'PUT', payload, accessToken)
}

export async function fetchNextMatCodeApi(matType, accessToken) {
  return getApi(`/api/materials/next-code?matType=${encodeURIComponent(matType)}`, accessToken)
}

export async function createMaterialApi(payload, accessToken) {
  return saveApi('/api/materials', 'POST', payload, accessToken)
}

export async function updateMaterialApi(materialId, payload, accessToken) {
  return saveApi(`/api/materials/${materialId}`, 'PUT', payload, accessToken)
}

export async function createBomApi(payload, accessToken) {
  return saveApi('/api/boms', 'POST', payload, accessToken)
}

export async function updateBomApi(bomId, payload, accessToken) {
  return saveApi(`/api/boms/${bomId}`, 'PUT', payload, accessToken)
}

export async function createSpcDataApi(payload, accessToken) {
  return saveApi('/api/spc-data', 'POST', payload, accessToken)
}

export async function analyzeSpcApi(payload, accessToken) {
  return saveApi('/api/analysis/spc', 'POST', payload, accessToken)
}

export async function fetchDefectTrendApi(days, accessToken) {
  return getApi(`/api/defects/trend?days=${days}`, accessToken)
}

export async function fetchSpcChartApi(params, accessToken) {
  const query = new URLSearchParams()
  if (params.parameterName) query.set('parameterName', params.parameterName)
  if (params.lotId) query.set('lotId', params.lotId)
  if (params.workOrderId) query.set('workOrderId', params.workOrderId)
  return getApi(`/api/spc-data/chart?${query.toString()}`, accessToken)
}

export async function fetchDailyQualityReportApi(date, accessToken) {
  return getApi(`/api/reports/daily?date=${date}`, accessToken)
}

export async function fetchProductionReportApi(date, accessToken) {
  return getApi(`/api/reports/production?date=${date}`, accessToken)
}

export async function createInspectionApi(payload, accessToken) {
  return saveApi('/api/inspections', 'POST', payload, accessToken)
}

export async function deleteInspectionApi(inspectionId, accessToken) {
  return deleteApi(`/api/inspections/${inspectionId}`, accessToken)
}

export async function exportInspectionsCsvApi(accessToken) {
  const response = await fetch('/api/inspections/export', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('CSV 내보내기에 실패했습니다.')
  }

  return response.blob()
}

export async function updateInspectionApi(inspectionId, payload, accessToken) {
  return saveApi(`/api/inspections/${inspectionId}`, 'PUT', payload, accessToken)
}

export async function createDefectApi(payload, accessToken) {
  return saveApi('/api/defects', 'POST', payload, accessToken)
}

export async function updateDefectApi(defectId, payload, accessToken) {
  return saveApi(`/api/defects/${defectId}`, 'PUT', payload, accessToken)
}

export async function fetchDashboardBundle(accessToken, role = 'ADMIN') {
  const dashboardResourcesByRole = {
    ADMIN: [
      { key: 'kpis', label: 'Dashboard KPIs', path: '/api/dashboard/kpis', type: 'single' },
      { key: 'equipmentStatus', label: 'Dashboard equipment status', path: '/api/dashboard/equipment-status', type: 'items' },
      { key: 'processStatus', label: 'Dashboard process status', path: '/api/dashboard/process-status', type: 'items' },
      { key: 'qualityTrend', label: 'Dashboard quality trend', path: '/api/dashboard/quality-trend?days=7', type: 'items' },
      { key: 'defectCategories', label: 'Dashboard defect categories', path: '/api/dashboard/defect-categories', type: 'items' },
    ],
    OPERATOR: [
      { key: 'kpis', label: 'Dashboard KPIs', path: '/api/dashboard/kpis', type: 'single' },
      { key: 'equipmentStatus', label: 'Dashboard equipment status', path: '/api/dashboard/equipment-status', type: 'items' },
      { key: 'processStatus', label: 'Dashboard process status', path: '/api/dashboard/process-status', type: 'items' },
    ],
    INSPECTOR: [
      { key: 'kpis', label: 'Dashboard KPIs', path: '/api/dashboard/kpis', type: 'single' },
      { key: 'qualityTrend', label: 'Dashboard quality trend', path: '/api/dashboard/quality-trend?days=7', type: 'items' },
      { key: 'defectCategories', label: 'Dashboard defect categories', path: '/api/dashboard/defect-categories', type: 'items' },
    ],
  }

  const resources = dashboardResourcesByRole[role] ?? dashboardResourcesByRole.ADMIN

  const bundle = {
    kpis: null,
    equipmentStatus: [],
    processStatus: [],
    qualityTrend: [],
    defectCategories: [],
    errors: [],
  }

  const results = await Promise.all(
    resources.map(async (resource) => {
      try {
        const data = await getApi(resource.path, accessToken)
        return { resource, data }
      } catch (error) {
        return { resource, error }
      }
    }),
  )

  results.forEach(({ resource, data, error }) => {
    if (error) {
      bundle.errors.push(`${resource.label}: ${error.message}`)
      bundle[resource.key] = resource.type === 'items' ? [] : null
      return
    }

    bundle[resource.key] = resource.type === 'items' ? data ?? [] : data
  })

  if (bundle.errors.length === resources.length) {
    throw new Error('All dashboard API requests failed.')
  }

  return bundle
}

export async function fetchOperationalBundle(accessToken, role = 'ADMIN') {
  const operationalResourcesByRole = {
    ADMIN: [
      { key: 'users', label: 'Users', path: '/api/users', type: 'items' },
      { key: 'lots', label: 'LOT', path: '/api/lots?page=1&limit=20', type: 'items' },
      { key: 'workOrders', label: 'Work orders', path: '/api/work-orders?page=1&limit=20', type: 'items' },
      { key: 'assignments', label: 'Assignments', path: '/api/work-orders/assignments', type: 'items' },
      { key: 'equipment', label: 'Equipment', path: '/api/equipment?page=1&limit=20', type: 'items' },
      { key: 'equipmentLogs', label: 'Equipment logs', path: '/api/equipment/logs', type: 'items' },
      { key: 'processParams', label: 'Process params', path: '/api/equipment/process-params', type: 'items' },
      { key: 'materials', label: 'Materials', path: '/api/materials?page=1&limit=50', type: 'items' },
      { key: 'boms', label: 'BOM', path: '/api/boms?page=1&limit=50', type: 'items' },
      { key: 'spcData', label: 'SPC data', path: '/api/spc-data?page=1&limit=50', type: 'items' },
      { key: 'inspections', label: 'Inspections', path: '/api/inspections?page=1&limit=20', type: 'items' },
      { key: 'defects', label: 'Defects', path: '/api/defects?page=1&limit=20', type: 'items' },
      { key: 'defectTypes', label: 'Defect types', path: '/api/defect-types?page=1&limit=50', type: 'items' },
      { key: 'inspectionSummary', label: 'Inspection summary', path: '/api/inspections/summary', type: 'single' },
      { key: 'defectSummary', label: 'Defect summary', path: '/api/defects/summary', type: 'single' },
    ],
    OPERATOR: [
      { key: 'lots', label: 'LOT', path: '/api/lots?page=1&limit=20', type: 'items' },
      { key: 'workOrders', label: 'Work orders', path: '/api/work-orders?page=1&limit=20', type: 'items' },
      { key: 'assignments', label: 'Assignments', path: '/api/work-orders/assignments', type: 'items' },
      { key: 'equipment', label: 'Equipment', path: '/api/equipment?page=1&limit=20', type: 'items' },
      { key: 'equipmentLogs', label: 'Equipment logs', path: '/api/equipment/logs', type: 'items' },
      { key: 'processParams', label: 'Process params', path: '/api/equipment/process-params', type: 'items' },
      { key: 'materials', label: 'Materials', path: '/api/materials?page=1&limit=50', type: 'items' },
      { key: 'boms', label: 'BOM', path: '/api/boms?page=1&limit=50', type: 'items' },
    ],
    INSPECTOR: [
      { key: 'lots', label: 'LOT', path: '/api/lots?page=1&limit=20', type: 'items' },
      { key: 'workOrders', label: 'Work orders', path: '/api/work-orders?page=1&limit=20', type: 'items' },
      { key: 'equipment', label: 'Equipment', path: '/api/equipment?page=1&limit=20', type: 'items' },
      { key: 'spcData', label: 'SPC data', path: '/api/spc-data?page=1&limit=50', type: 'items' },
      { key: 'inspections', label: 'Inspections', path: '/api/inspections?page=1&limit=20', type: 'items' },
      { key: 'defects', label: 'Defects', path: '/api/defects?page=1&limit=20', type: 'items' },
      { key: 'defectTypes', label: 'Defect types', path: '/api/defect-types?page=1&limit=50', type: 'items' },
      { key: 'inspectionSummary', label: 'Inspection summary', path: '/api/inspections/summary', type: 'single' },
      { key: 'defectSummary', label: 'Defect summary', path: '/api/defects/summary', type: 'single' },
    ],
  }

  const resources = operationalResourcesByRole[role] ?? operationalResourcesByRole.ADMIN

  const bundle = {
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
    errors: [],
  }

  const results = await Promise.all(
    resources.map(async (resource) => {
      try {
        const data = await getApi(resource.path, accessToken)
        return { resource, data }
      } catch (error) {
        return { resource, error }
      }
    }),
  )

  results.forEach(({ resource, data, error }) => {
    if (error) {
      bundle.errors.push(`${resource.label}: ${error.message}`)
      bundle[resource.key] = resource.type === 'items' ? [] : null
      return
    }

    bundle[resource.key] = resource.type === 'items' ? data.items ?? data ?? [] : data
  })

  if (bundle.errors.length === resources.length) {
    throw new Error('All operational API requests failed.')
  }

  return bundle
}
