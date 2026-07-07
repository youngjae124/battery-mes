import ExcelJS from 'exceljs'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const PROCESS_EN = {
  전극: 'Electrode',
  조립: 'Assembly',
  화성: 'Formation',
  검사: 'Inspection',
}

function pct(value) {
  if (value == null) return '-'
  return `${Number(value).toFixed(2)}%`
}

// ───────────────────────────────── 스타일 헬퍼 ─────────────────────────────────

const COLOR = {
  headerBg: '1E2A3A',    // 짙은 네이비
  headerFont: 'FFFFFF',
  sectionBg: '2D6A9F',   // 중간 블루
  sectionFont: 'FFFFFF',
  subHeaderBg: 'EBF3FB', // 연한 파랑
  goodBg: 'E8F5E9',      // 연한 초록
  alertBg: 'FFEBEE',     // 연한 빨강
  totalBg: 'FFF3E0',     // 연한 주황
  border: 'BDBDBD',
  text: '212121',
  muted: '757575',
}

function border(style = 'thin') {
  const b = { style, color: { argb: 'FF' + COLOR.border } }
  return { top: b, left: b, bottom: b, right: b }
}

function applyHeaderStyle(cell, bgColor = COLOR.headerBg) {
  cell.font = { bold: true, color: { argb: 'FF' + COLOR.headerFont }, size: 13 }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgColor } }
  cell.border = border()
  cell.alignment = { horizontal: 'center', vertical: 'middle' }
}

function applyDataCell(cell, options = {}) {
  const { align = 'right', bg = null, bold = false } = options
  cell.font = { size: 12, color: { argb: 'FF' + COLOR.text }, bold }
  cell.alignment = { horizontal: align, vertical: 'middle' }
  cell.border = border()
  if (bg) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bg } }
  }
}

function applySectionTitle(cell, text, bgColor = COLOR.sectionBg) {
  cell.value = text
  cell.font = { bold: true, size: 13, color: { argb: 'FF' + COLOR.sectionFont } }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgColor } }
  cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
}

// ───────────────────────────────── Excel 내보내기 ─────────────────────────────

export async function exportExcel(startDate, endDate, dailyReport, productionReport) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Battery MES'
  wb.created = new Date()

  // ── Sheet 1: 품질 보고서 ──────────────────────────────────────────────────
  const wsQ = wb.addWorksheet('품질 보고서')
  wsQ.properties.defaultRowHeight = 28

  // 제목
  wsQ.mergeCells('A1:D1')
  const titleCell = wsQ.getCell('A1')
  titleCell.value = '배터리 MES — 품질 보고서'
  titleCell.font = { bold: true, size: 18, color: { argb: 'FF' + COLOR.headerBg } }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  wsQ.getRow(1).height = 44

  wsQ.mergeCells('A2:D2')
  const periodCell = wsQ.getCell('A2')
  periodCell.value = `조회 기간: ${startDate} ~ ${endDate}`
  periodCell.font = { size: 12, color: { argb: 'FF' + COLOR.muted } }
  periodCell.alignment = { horizontal: 'center', vertical: 'middle' }
  wsQ.getRow(2).height = 26

  wsQ.getRow(3).height = 10

  // ── 검사 현황 섹션 ────────────────────────────────────────────────────────
  wsQ.mergeCells('A4:D4')
  applySectionTitle(wsQ.getCell('A4'), '📋  검사 현황')
  wsQ.getRow(4).height = 32

  const qHeaders = ['항목', '건수', '비율', '비고']
  const qHeaderRow = wsQ.getRow(5)
  qHeaders.forEach((h, i) => {
    const cell = qHeaderRow.getCell(i + 1)
    cell.value = h
    applyHeaderStyle(cell, COLOR.subHeaderBg)
    cell.font = { bold: true, size: 13, color: { argb: 'FF' + COLOR.headerBg } }
  })
  qHeaderRow.height = 30

  const totalInsp = Number(dailyReport.totalInspections)
  const passCount = Number(dailyReport.passCount)
  const failCount = Number(dailyReport.failCount)
  const passRate = Number(dailyReport.passRate ?? 0)
  const gradeA = Number(dailyReport.gradeACount)
  const gradeB = Number(dailyReport.gradeBCount)
  const gradeC = Number(dailyReport.gradeCCount)

  const inspRows = [
    ['총 검사 건수', totalInsp, '-', '전체 검사 이력'],
    ['합격 (PASS)', passCount, pct(passRate), '합격 기준 통과'],
    ['불합격 (FAIL)', failCount, pct(100 - passRate), '재검사 또는 불량 등록 대상'],
    ['A 등급', gradeA, totalInsp > 0 ? pct((gradeA / totalInsp) * 100) : '-', '우수'],
    ['B 등급', gradeB, totalInsp > 0 ? pct((gradeB / totalInsp) * 100) : '-', '양호'],
    ['C 등급', gradeC, totalInsp > 0 ? pct((gradeC / totalInsp) * 100) : '-', '주의'],
  ]

  inspRows.forEach((rowData, ri) => {
    const row = wsQ.getRow(6 + ri)
    rowData.forEach((val, ci) => {
      const cell = row.getCell(ci + 1)
      cell.value = val
      const isPass = rowData[0] === '합격 (PASS)'
      const isFail = rowData[0] === '불합격 (FAIL)'
      applyDataCell(cell, {
        align: ci === 0 ? 'left' : ci === 3 ? 'left' : 'center',
        bg: isPass ? COLOR.goodBg : isFail ? COLOR.alertBg : null,
        bold: ci === 0,
      })
    })
    row.height = 26
  })

  wsQ.getRow(12).height = 12

  // ── 불량 현황 섹션 ────────────────────────────────────────────────────────
  wsQ.mergeCells('A13:D13')
  applySectionTitle(wsQ.getCell('A13'), '⚠️  불량 현황')
  wsQ.getRow(13).height = 32

  const dHeaders = ['심각도', '건수', '비율', '기준']
  const dHeaderRow = wsQ.getRow(14)
  dHeaders.forEach((h, i) => {
    const cell = dHeaderRow.getCell(i + 1)
    cell.value = h
    applyHeaderStyle(cell, COLOR.subHeaderBg)
    cell.font = { bold: true, size: 13, color: { argb: 'FF' + COLOR.headerBg } }
  })
  dHeaderRow.height = 30

  const totalDef = Number(dailyReport.totalDefects)
  const critical = Number(dailyReport.criticalDefectCount)
  const major = Number(dailyReport.majorDefectCount)
  const minor = Number(dailyReport.minorDefectCount)

  const defRows = [
    ['합계', totalDef, '-', '-'],
    ['CRITICAL', critical, totalDef > 0 ? pct((critical / totalDef) * 100) : '-', '즉시 생산 중단'],
    ['MAJOR', major, totalDef > 0 ? pct((major / totalDef) * 100) : '-', '당일 처리 필요'],
    ['MINOR', minor, totalDef > 0 ? pct((minor / totalDef) * 100) : '-', '다음 점검 시 처리'],
  ]

  defRows.forEach((rowData, ri) => {
    const row = wsQ.getRow(15 + ri)
    rowData.forEach((val, ci) => {
      const cell = row.getCell(ci + 1)
      cell.value = val
      const isCritical = rowData[0] === 'CRITICAL'
      const isTotal = rowData[0] === '합계'
      applyDataCell(cell, {
        align: ci === 0 ? 'left' : ci === 3 ? 'left' : 'center',
        bg: isCritical ? COLOR.alertBg : isTotal ? COLOR.totalBg : null,
        bold: isTotal || ci === 0,
      })
    })
    row.height = 26
  })

  wsQ.columns = [
    { width: 30 },
    { width: 16 },
    { width: 16 },
    { width: 38 },
  ]

  // ── Sheet 2: 생산 실적 ──────────────────────────────────────────────────
  const wsP = wb.addWorksheet('생산 실적')
  wsP.properties.defaultRowHeight = 28

  wsP.mergeCells('A1:F1')
  const pTitleCell = wsP.getCell('A1')
  pTitleCell.value = '배터리 MES — 생산 실적 보고서'
  pTitleCell.font = { bold: true, size: 18, color: { argb: 'FF' + COLOR.headerBg } }
  pTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  wsP.getRow(1).height = 44

  wsP.mergeCells('A2:F2')
  const pPeriodCell = wsP.getCell('A2')
  pPeriodCell.value = `조회 기간: ${startDate} ~ ${endDate}`
  pPeriodCell.font = { size: 12, color: { argb: 'FF' + COLOR.muted } }
  pPeriodCell.alignment = { horizontal: 'center', vertical: 'middle' }
  wsP.getRow(2).height = 26

  wsP.getRow(3).height = 10

  // 작업지시 요약
  wsP.mergeCells('A4:F4')
  applySectionTitle(wsP.getCell('A4'), '📊  작업지시 현황')
  wsP.getRow(4).height = 32

  const woHeaders = ['전체', '계획', '진행중', '완료', '보류', '달성률']
  const woHeaderRow = wsP.getRow(5)
  woHeaders.forEach((h, i) => {
    const cell = woHeaderRow.getCell(i + 1)
    cell.value = h
    applyHeaderStyle(cell, COLOR.subHeaderBg)
    cell.font = { bold: true, size: 13, color: { argb: 'FF' + COLOR.headerBg } }
  })
  wsP.getRow(5).height = 30

  const woRow = wsP.getRow(6)
  const woVals = [
    productionReport.totalWorkOrders,
    productionReport.plannedCount,
    productionReport.runningCount,
    productionReport.doneCount,
    productionReport.holdCount,
    pct(productionReport.achievementRate),
  ]
  woVals.forEach((val, ci) => {
    const cell = woRow.getCell(ci + 1)
    cell.value = val
    applyDataCell(cell, { align: 'center', bold: true, bg: COLOR.totalBg })
  })
  wsP.getRow(6).height = 30

  wsP.getRow(7).height = 12

  // 공정별 실적
  wsP.mergeCells('A8:F8')
  applySectionTitle(wsP.getCell('A8'), '🏭  공정별 생산 실적')
  wsP.getRow(8).height = 32

  const procHeaders = ['공정', '작업지시', '완료', '목표 수량', '실적 수량', '달성률']
  const procHeaderRow = wsP.getRow(9)
  procHeaders.forEach((h, i) => {
    const cell = procHeaderRow.getCell(i + 1)
    cell.value = h
    applyHeaderStyle(cell)
  })
  wsP.getRow(9).height = 30

  productionReport.processBreakdown.forEach((p, ri) => {
    const row = wsP.getRow(10 + ri)
    const rate = Number(p.achievementRate ?? 0)
    const isGood = rate >= 90
    const isBad = rate > 0 && rate < 70
    const vals = [
      p.processType,
      Number(p.orderCount),
      Number(p.doneCount),
      Number(p.targetQty),
      Number(p.actualQty),
      pct(p.achievementRate),
    ]
    vals.forEach((val, ci) => {
      const cell = row.getCell(ci + 1)
      cell.value = val
      applyDataCell(cell, {
        align: ci === 0 ? 'center' : ci === 5 ? 'center' : 'right',
        bg: ci === 5 ? (isGood ? COLOR.goodBg : isBad ? COLOR.alertBg : null) : null,
        bold: ci === 0 || ci === 5,
      })
    })
    row.height = 28
  })

  // 합계 행
  const totalRow = wsP.getRow(10 + productionReport.processBreakdown.length)
  const totalVals = [
    '합 계',
    productionReport.totalWorkOrders,
    productionReport.doneCount,
    productionReport.totalTargetQty,
    productionReport.totalActualQty,
    pct(productionReport.achievementRate),
  ]
  totalVals.forEach((val, ci) => {
    const cell = totalRow.getCell(ci + 1)
    cell.value = val
    applyDataCell(cell, {
      align: ci === 0 ? 'center' : ci === 5 ? 'center' : 'right',
      bg: COLOR.totalBg,
      bold: true,
    })
  })
  totalRow.height = 30

  wsP.columns = [
    { width: 16 },
    { width: 16 },
    { width: 14 },
    { width: 18 },
    { width: 18 },
    { width: 16 },
  ]

  // 파일 저장
  const buf = await wb.xlsx.writeBuffer()
  downloadBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `MES_Report_${startDate}_${endDate}.xlsx`)
}

// ───────────────────────────────── PDF 내보내기 ───────────────────────────────

export function exportPdf(startDate, endDate, dailyReport, productionReport) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const margin = 14
  let y = 20

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Battery MES - Report', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text(`Period: ${startDate}  ~  ${endDate}`, margin, y)
  doc.setTextColor(0)
  y += 10

  const headerStyles = { fillColor: [30, 42, 58], textColor: 255, fontStyle: 'bold', fontSize: 10 }
  const altRowStyles = { fillColor: [245, 248, 252] }
  const footStyles = { fillColor: [255, 243, 224], textColor: [33, 33, 33], fontStyle: 'bold' }

  // Quality Report
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Quality Report', margin, y)
  y += 4

  const totalInsp = Number(dailyReport.totalInspections)
  const passCount = Number(dailyReport.passCount)
  const failCount = Number(dailyReport.failCount)
  const passRate = Number(dailyReport.passRate ?? 0)
  const gradeA = Number(dailyReport.gradeACount)
  const gradeB = Number(dailyReport.gradeBCount)
  const gradeC = Number(dailyReport.gradeCCount)
  const totalDef = Number(dailyReport.totalDefects)
  const critical = Number(dailyReport.criticalDefectCount)
  const major = Number(dailyReport.majorDefectCount)
  const minor = Number(dailyReport.minorDefectCount)

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Item', 'Count', 'Rate', 'Note']],
    body: [
      ['Total Inspections', totalInsp, '-', 'All records'],
      ['PASS', passCount, pct(passRate), 'Passed inspection'],
      ['FAIL', failCount, pct(100 - passRate), 'Requires defect registration'],
      ['Grade A', gradeA, totalInsp > 0 ? pct((gradeA / totalInsp) * 100) : '-', 'Excellent'],
      ['Grade B', gradeB, totalInsp > 0 ? pct((gradeB / totalInsp) * 100) : '-', 'Good'],
      ['Grade C', gradeC, totalInsp > 0 ? pct((gradeC / totalInsp) * 100) : '-', 'Caution'],
    ],
    foot: [['Total Defects', totalDef, '-', `CRITICAL ${critical} / MAJOR ${major} / MINOR ${minor}`]],
    styles: { fontSize: 9.5, cellPadding: 3 },
    headStyles: headerStyles,
    alternateRowStyles: altRowStyles,
    footStyles,
    columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' } },
  })

  y = doc.lastAutoTable.finalY + 12

  // Production Report
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Production Report', margin, y)
  y += 4

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Process', 'Orders', 'Done', 'Target', 'Actual', 'Achievement']],
    body: productionReport.processBreakdown.map((p) => [
      PROCESS_EN[p.processType] ?? p.processType,
      Number(p.orderCount),
      Number(p.doneCount),
      Number(p.targetQty).toLocaleString(),
      Number(p.actualQty).toLocaleString(),
      pct(p.achievementRate),
    ]),
    foot: [[
      'Total',
      Number(productionReport.totalWorkOrders),
      Number(productionReport.doneCount),
      Number(productionReport.totalTargetQty).toLocaleString(),
      Number(productionReport.totalActualQty).toLocaleString(),
      pct(productionReport.achievementRate),
    ]],
    styles: { fontSize: 9.5, cellPadding: 3 },
    headStyles: headerStyles,
    alternateRowStyles: altRowStyles,
    footStyles,
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'center' },
    },
  })

  doc.save(`MES_Report_${startDate}_${endDate}.pdf`)
}
