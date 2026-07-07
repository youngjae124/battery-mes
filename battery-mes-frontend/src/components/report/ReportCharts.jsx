import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const PASS_COLOR = '#22c55e'
const FAIL_COLOR = '#ef4444'
const TARGET_COLOR = '#94a3b8'
const ACTUAL_COLOR = '#f59e0b'
const CRITICAL_COLOR = '#ef4444'
const MAJOR_COLOR = '#f97316'
const MINOR_COLOR = '#94a3b8'

function CustomTooltipPercent({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div style={{ background: 'var(--surface-1, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: 6, padding: '6px 10px', fontSize: 13 }}>
      <span style={{ color: payload[0].fill, fontWeight: 600 }}>{name}</span>: {value}건
    </div>
  )
}

function CustomTooltipBar({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface-1, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: 6, padding: '6px 10px', fontSize: 13 }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill, margin: '2px 0' }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export function QualityDonutChart({ dailyReport }) {
  const data = [
    { name: 'PASS', value: Number(dailyReport.passCount) },
    { name: 'FAIL', value: Number(dailyReport.failCount) },
  ]
  const total = data.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return <div className="empty-state" style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>검사 데이터 없음</div>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          <Cell fill={PASS_COLOR} />
          <Cell fill={FAIL_COLOR} />
        </Pie>
        <Tooltip content={<CustomTooltipPercent />} />
        <Legend
          formatter={(value, entry) =>
            `${value}  ${entry.payload.value}건 (${total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0}%)`
          }
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function DefectSeverityChart({ dailyReport }) {
  const data = [
    { name: 'CRITICAL', value: Number(dailyReport.criticalDefectCount), fill: CRITICAL_COLOR },
    { name: 'MAJOR', value: Number(dailyReport.majorDefectCount), fill: MAJOR_COLOR },
    { name: 'MINOR', value: Number(dailyReport.minorDefectCount), fill: MINOR_COLOR },
  ]

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e2e8f0)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltipPercent />} />
        <Bar dataKey="value" name="불량 건수" radius={[4, 4, 0, 0]} maxBarSize={60}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ProcessAchievementChart({ productionReport }) {
  const data = productionReport.processBreakdown.map((p) => ({
    name: p.processType,
    목표: Number(p.targetQty),
    실적: Number(p.actualQty),
  }))

  const hasData = data.some((d) => d['목표'] > 0 || d['실적'] > 0)

  if (!hasData) {
    return <div className="empty-state" style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>생산 실적 없음</div>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e2e8f0)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltipBar />} />
        <Legend />
        <Bar dataKey="목표" fill={TARGET_COLOR} radius={[4, 4, 0, 0]} maxBarSize={30} />
        <Bar dataKey="실적" fill={ACTUAL_COLOR} radius={[4, 4, 0, 0]} maxBarSize={30} />
      </BarChart>
    </ResponsiveContainer>
  )
}
