import {
  DEFECT_SEVERITY_LABELS,
  EQUIPMENT_LOG_TYPE_LABELS,
  EQUIPMENT_STATUS_LABELS,
  getDisplayLabel,
  INSPECTION_RESULT_LABELS,
  INSPECTION_TYPE_LABELS,
  LOT_STATUS_LABELS,
  PROCESS_STEPS,
  USER_ROLE_LABELS,
  WORK_ORDER_STATUS_LABELS,
} from '../constants/mesConfig'

const ASSIGNMENT_ROLE_LABELS = {
  OPERATOR: '작업자',
  LEADER: '리더',
  INSPECTOR: '검사자',
}

export function summarizeByStatus(items, labelMap) {
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

export function summarizeInspection(summary) {
  if (!summary) {
    return ''
  }

  return `${getInspectionResultLabel('PASS')} ${summary.passCount ?? 0} / ${getInspectionResultLabel('FAIL')} ${summary.failCount ?? 0} / A등급 ${summary.gradeACount ?? 0}`
}

export function summarizeDefect(summary) {
  if (!summary) {
    return ''
  }

  return `${getDefectSeverityLabel('CRITICAL')} ${summary.criticalCount ?? 0} / ${getDefectSeverityLabel('MAJOR')} ${summary.majorCount ?? 0} / ${getDefectSeverityLabel('MINOR')} ${summary.minorCount ?? 0}`
}

export function getUserRoleLabel(role) {
  return getDisplayLabel(USER_ROLE_LABELS, role)
}

export function getAssignmentRoleLabel(role) {
  return getDisplayLabel(ASSIGNMENT_ROLE_LABELS, role)
}

export function canAccessSection(role, sectionKey, isLoggedIn) {
  if (!isLoggedIn) {
    return sectionKey === 'main'
  }

  if (role === 'ADMIN') {
    return true
  }

  if (role === 'OPERATOR') {
    return ['main', 'production', 'equipment', 'materials', 'reports'].includes(sectionKey)
  }

  if (role === 'INSPECTOR') {
    return ['main', 'quality', 'spc', 'reports'].includes(sectionKey)
  }

  return sectionKey === 'main'
}

export function getLotStatusLabel(status) {
  return getDisplayLabel(LOT_STATUS_LABELS, status)
}

export function getWorkOrderStatusLabel(status) {
  return getDisplayLabel(WORK_ORDER_STATUS_LABELS, status)
}

export function getEquipmentStatusLabel(status) {
  return getDisplayLabel(EQUIPMENT_STATUS_LABELS, status)
}

export function getEquipmentLogTypeLabel(logType) {
  return getDisplayLabel(EQUIPMENT_LOG_TYPE_LABELS, logType)
}

export function getInspectionTypeLabel(type) {
  return getDisplayLabel(INSPECTION_TYPE_LABELS, type)
}

export function getInspectionResultLabel(result) {
  return getDisplayLabel(INSPECTION_RESULT_LABELS, result)
}

export function getDefectSeverityLabel(severity) {
  return getDisplayLabel(DEFECT_SEVERITY_LABELS, severity)
}

export function getEquipmentStatusPriority(status) {
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

export function getDefectSeverityPriority(severity) {
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

export function getProcessSnapshotState(snapshot) {
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

export function getProgressBarWidth(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0%'
  }

  const width = Math.max(0, Math.min(100, value * 100))
  return `${width.toFixed(1)}%`
}

export function safeNumber(value) {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : 0
}

export function formatNumber(value) {
  return safeNumber(value).toLocaleString()
}

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-'
  }

  return `${(value * 100).toFixed(1)}%`
}

export function formatInspectionMeasurement(inspection) {
  const measured = inspection.measuredValue ?? '-'
  const hasSpec = inspection.specMin !== null || inspection.specMax !== null

  if (!hasSpec) {
    return `${measured}`
  }

  return `${measured} (${inspection.specMin ?? '-'} ~ ${inspection.specMax ?? '-'})`
}

export function formatDateTimeDisplay(value) {
  if (!value) {
    return '-'
  }

  try {
    return new Date(value).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return value
  }
}

export function nowAsDateTimeInputValue() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function buildInspectionPreview(form) {
  const specMin = parseOptionalNumber(form.specMin)
  const specMax = parseOptionalNumber(form.specMax)
  const measuredValue = parseOptionalNumber(form.measuredValue)

  if ([specMin, specMax, measuredValue].some((value) => value !== null && Number.isNaN(value))) {
    return {
      invalid: true,
      message: '규격값과 측정값은 숫자만 입력할 수 있습니다.',
    }
  }

  if (measuredValue === null) {
    return null
  }

  if (specMin !== null && specMax !== null && specMin > specMax) {
    return {
      invalid: true,
      message: '규격 하한은 규격 상한보다 클 수 없습니다.',
    }
  }

  const result = (specMin === null || measuredValue >= specMin) && (specMax === null || measuredValue <= specMax) ? 'PASS' : 'FAIL'

  return {
    invalid: false,
    result,
    grade: calculateInspectionPreviewGrade(specMin, specMax, measuredValue, result),
  }
}

export function calculateInspectionPreviewGrade(specMin, specMax, measuredValue, result) {
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

export function parseSampleValueList(value) {
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

export function calculateSpcStats(sampleValues) {
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

export function isSpcOutOfControl(row) {
  if (row.xBar === null || row.xBar === undefined) return false
  const xBar = safeNumber(row.xBar)
  const hasUpper = row.ucl !== null && row.ucl !== undefined
  const hasLower = row.lcl !== null && row.lcl !== undefined

  return (hasUpper && xBar > safeNumber(row.ucl)) || (hasLower && xBar < safeNumber(row.lcl))
}

export function getCapabilityRatingLabel(cpk) {
  if (cpk === null || cpk === undefined || Number.isNaN(cpk)) {
    return '-'
  }
  if (cpk >= 1.33) {
    return '우수'
  }
  if (cpk >= 1.0) {
    return '양호'
  }
  return '관리 필요'
}

export function summarizeUniqueValues(items, key) {
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

export function summarizeCountItems(items, labelMap, key) {
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

export function formatPercentValue(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '-'
  }

  return `${safeNumber(value).toFixed(1)}%`
}

export function parseOptionalNumber(value) {
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

export function toInputNumberValue(value) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

export function normalizeProcessCode(value) {
  const matchedStep = PROCESS_STEPS.find(
    (step) => step.code === value || step.label === value || step.sourceValue === value,
  )

  return matchedStep?.code ?? value
}

export function getProcessStepLabel(value) {
  const matchedStep = PROCESS_STEPS.find(
    (step) => step.code === value || step.label === value || step.sourceValue === value,
  )

  return matchedStep?.label ?? value
}

export function toApiLocalDateTime(value) {
  if (!value) {
    return null
  }

  return value.length === 16 ? `${value}:00` : value
}

export function toDateTimeInputValue(value) {
  if (!value) {
    return ''
  }

  return value.slice(0, 16)
}
