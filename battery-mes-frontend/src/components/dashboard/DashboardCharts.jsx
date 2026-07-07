import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
} from 'recharts'

const PASS_COLOR = '#22c55e'
const FAIL_COLOR = '#ef4444'
const DEFECT_COLOR = '#f59e0b'

const CATEGORY_LABELS = {
  ELECTRODE: '전극',
  ASSEMBLY: '조립',
  ACTIVATION: '화성',
  OQC: '최종검사',
}

const CATEGORY_COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ef4444']

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface-1, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: 6, padding: '6px 10px', fontSize: 12 }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color ?? p.fill, margin: '2px 0' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export function QualityTrendChart({ qualityTrend }) {
  const hasData = qualityTrend.some((d) => d.passCount > 0 || d.failCount > 0 || d.defectCount > 0)

  if (!hasData) {
    return (
      <div className="empty-state" style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        품질 추이 데이터 없음
      </div>
    )
  }

  const data = qualityTrend.map((d) => ({
    date: d.statDate?.slice(5) ?? '',
    PASS: d.passCount,
    FAIL: d.failCount,
    불량: d.defectCount,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e2e8f0)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
        <Tooltip content={<ChartTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="PASS" stroke={PASS_COLOR} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="FAIL" stroke={FAIL_COLOR} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="불량" stroke={DEFECT_COLOR} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function DefectCategoryChart({ defectCategories }) {
  const hasData = defectCategories.some((d) => d.count > 0)

  if (!hasData) {
    return (
      <div className="empty-state" style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        불량 카테고리 데이터 없음
      </div>
    )
  }

  const data = defectCategories.map((d) => ({
    name: CATEGORY_LABELS[d.category] ?? d.category,
    건수: d.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e2e8f0)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="건수" radius={[4, 4, 0, 0]} maxBarSize={50}>
          {data.map((_, i) => (
            <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
