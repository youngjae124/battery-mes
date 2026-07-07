import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function ControlDot({ cx, cy, payload, ucl, lcl }) {
  if (cx === undefined || cy === undefined || payload?.xBar == null) return null
  const xBarNum = Number(payload.xBar)
  const outOfControl =
    (ucl != null && xBarNum > ucl) || (lcl != null && xBarNum < lcl)

  return (
    <circle
      cx={cx}
      cy={cy}
      r={outOfControl ? 6 : 4}
      fill={outOfControl ? '#EF5350' : '#2196F3'}
      stroke={outOfControl ? '#B71C1C' : '#1565C0'}
      strokeWidth={2}
    />
  )
}

function RangeDot({ cx, cy }) {
  if (cx === undefined || cy === undefined) return null
  return <circle cx={cx} cy={cy} r={4} fill="#FF9800" stroke="#E65100" strokeWidth={2} />
}

function fmt4(val) {
  return val != null ? Number(val).toFixed(4) : '-'
}

export function XBarChart({ data }) {
  if (!data || data.length === 0) return null

  const refPoint = data.find((p) => p.ucl != null) ?? data[0]
  const ucl = refPoint?.ucl != null ? Number(refPoint.ucl) : null
  const cl = refPoint?.cl != null ? Number(refPoint.cl) : null
  const lcl = refPoint?.lcl != null ? Number(refPoint.lcl) : null

  const sorted = [...data].sort((a, b) => Number(a.subgroupNo) - Number(b.subgroupNo))
  const chartData = sorted.map((p) => ({
    label: `SG${p.subgroupNo}`,
    xBar: p.xBar != null ? Number(p.xBar) : null,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 10, right: 32, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
        <Tooltip
          formatter={(value, name) => [fmt4(value), name === 'xBar' ? 'X-bar' : name]}
        />
        <Legend formatter={(value) => (value === 'xBar' ? 'X-bar' : value)} />
        {ucl != null && (
          <ReferenceLine
            y={ucl}
            stroke="#EF5350"
            strokeDasharray="6 3"
            label={{ value: `UCL ${fmt4(ucl)}`, position: 'insideTopRight', fontSize: 10, fill: '#EF5350' }}
          />
        )}
        {cl != null && (
          <ReferenceLine
            y={cl}
            stroke="#4CAF50"
            strokeDasharray="6 3"
            label={{ value: `CL ${fmt4(cl)}`, position: 'insideTopRight', fontSize: 10, fill: '#4CAF50' }}
          />
        )}
        {lcl != null && (
          <ReferenceLine
            y={lcl}
            stroke="#EF5350"
            strokeDasharray="6 3"
            label={{ value: `LCL ${fmt4(lcl)}`, position: 'insideBottomRight', fontSize: 10, fill: '#EF5350' }}
          />
        )}
        <Line
          type="monotone"
          dataKey="xBar"
          stroke="#2196F3"
          strokeWidth={2}
          dot={(props) => <ControlDot {...props} ucl={ucl} lcl={lcl} />}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function RangeChart({ data }) {
  if (!data || data.length === 0) return null

  const sorted = [...data].sort((a, b) => Number(a.subgroupNo) - Number(b.subgroupNo))
  const chartData = sorted.map((p) => ({
    label: `SG${p.subgroupNo}`,
    range: p.rangeValue != null ? Number(p.rangeValue) : null,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 10, right: 32, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} />
        <Tooltip formatter={(value) => [fmt4(value), 'Range']} />
        <Legend formatter={() => 'Range'} />
        <Line
          type="monotone"
          dataKey="range"
          stroke="#FF9800"
          strokeWidth={2}
          dot={(props) => <RangeDot {...props} />}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
