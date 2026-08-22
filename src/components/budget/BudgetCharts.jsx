import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

export function CategoryPieChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="budget-chart">
      <h4 className="chart-title">Spending by Category</h4>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={4}
            dataKey="amount"
            nameKey="category"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DailyBarChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="budget-chart">
      <h4 className="chart-title">Daily Spending</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="day" tick={{ fill: '#6b6b6b', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6b6b6b', fontSize: 12 }} />
          <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }} />
          <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
