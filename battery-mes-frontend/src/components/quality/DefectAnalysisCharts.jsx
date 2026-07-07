import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const SEVERITY_COLORS = {
  CRITICAL: '#EF5350',
  MAJOR: '#FF9800',
  MINOR: '#66BB6A',
}

const CATEGORY_COLOR = '#2196F3'

const CATEGORY_LABEL = {
  ELECTRODE: '전극',
  ASSEMBLY: '조립',
  ACTIVATION: '화성',
  OQC: '최종검사',
}

// ── 심각도 도넛 차트 ──────────────────────────────────────────────────────────
export function DefectSeverityDonut({ defects }) {
  const counts = { CRITICAL: 0, MAJOR: 0, MINOR: 0 }
  defects.forEach((d) => {
    if (counts[d.severity] !== undefined) counts[d.severity] += 1
  })
  const total = defects.length

  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  if (data.length === 0) {
    return <div className="empty-state">불량 데이터가 없습니다.</div>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] ?? '#90A4AE'} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value}건 (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`, name]} />
        <Legend
          formatter={(value, entry) =>
            `${value}  ${entry.payload.value}건 (${total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0}%)`
          }
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── 카테고리별 불량 바 차트 ────────────────────────────────────────────────────
export function DefectCategoryChart({ defects }) {
  const counts = {}
  defects.forEach((d) => {
    const cat = d.defectCategory ?? '기타'
    counts[cat] = (counts[cat] ?? 0) + 1
  })

  const data = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, count]) => ({ name: CATEGORY_LABEL[cat] ?? cat, count }))

  if (data.length === 0) {
    return <div className="empty-state">불량 데이터가 없습니다.</div>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value) => [`${value}건`, '불량 수']} />
        <Bar dataKey="count" name="불량 수" fill={CATEGORY_COLOR} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── 불량 추이 그룹 바 차트 ─────────────────────────────────────────────────────
export function DefectTrendChart({ defectTrend }) {
  if (!defectTrend || defectTrend.length === 0) {
    return <div className="empty-state">불량 추이 데이터가 없습니다.</div>
  }

  const data = [...defectTrend]
    .sort((a, b) => (a.statDate > b.statDate ? 1 : -1))
    .map((d) => ({
      date: d.statDate?.slice(5) ?? d.statDate,
      CRITICAL: Number(d.criticalCount ?? 0),
      MAJOR: Number(d.majorCount ?? 0),
      MINOR: Number(d.minorCount ?? 0),
    }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="CRITICAL" name="CRITICAL" stackId="a" fill={SEVERITY_COLORS.CRITICAL} />
        <Bar dataKey="MAJOR" name="MAJOR" stackId="a" fill={SEVERITY_COLORS.MAJOR} />
        <Bar dataKey="MINOR" name="MINOR" stackId="a" fill={SEVERITY_COLORS.MINOR} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
