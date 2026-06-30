export const AUTH_STORAGE_KEY = 'battery-mes-auth'
export const AUTH_SESSION_EVENT = 'battery-mes-auth-updated'

export const USER_ROLES = ['ADMIN', 'OPERATOR', 'INSPECTOR']

export const USER_ROLE_LABELS = {
  ADMIN: '관리자',
  OPERATOR: '작업자',
  INSPECTOR: '검사자',
}

export const LOT_STATUS_LABELS = {
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  HOLD: '보류',
}

export const WORK_ORDER_STATUS_LABELS = {
  PLANNED: '계획',
  RUNNING: '진행중',
  DONE: '완료',
  HOLD: '보류',
}

export const EQUIPMENT_STATUS_LABELS = {
  RUNNING: '가동중',
  IDLE: '대기',
  DOWN: '고장',
  PM: '예방보전',
}

export const EQUIPMENT_LOG_TYPE_LABELS = {
  ALERT: '알림',
  BREAKDOWN: '고장',
  PM: '예방보전',
}

export const INSPECTION_TYPE_LABELS = {
  IQC: '수입검사',
  IPQC: '공정검사',
  OQC: '출하검사',
}

export const INSPECTION_RESULT_LABELS = {
  PASS: '합격',
  FAIL: '불합격',
  PENDING: '대기',
}

export const DEFECT_SEVERITY_LABELS = {
  CRITICAL: '치명',
  MAJOR: '중대',
  MINOR: '경미',
}

export const PROCESS_STEPS = [
  { code: 'ELECTRODE', label: '전극', sourceValue: '전극' },
  { code: 'ASSEMBLY', label: '조립', sourceValue: '조립' },
  { code: 'ACTIVATION', label: '활성화', sourceValue: '활성화' },
  { code: 'INSPECTION', label: '검사', sourceValue: '검사' },
]

export function getDisplayLabel(labelMap, value) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return labelMap[value] ?? value
}
