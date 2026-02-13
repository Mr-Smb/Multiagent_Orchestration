
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar, Line,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

interface FinanceChartsProps {
  data: {
    history?: { date: string; value: number; benchmark?: number }[];
    allocation?: { name: string; value: number; color?: string }[];
    projection?: { year: string; conservative: number; aggressive: number; expected: number }[];
    metrics?: { label: string; value: string; trend: 'up' | 'down' | 'neutral' }[];
    riskAnalysis?: {
        metrics: { label: string; value: string; description: string }[];
        factors: { subject: string; value: number; fullMark: number }[];
    };
  };
}

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
        <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-slate-500 dark:text-slate-400 capitalize">{entry.name}:</span>
            <span className="font-mono font-medium dark:text-white">
              {typeof entry.value === 'number' 
                ? `${entry.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` 
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const FinanceCharts: React.FC<FinanceChartsProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 mt-4 w-full">
      
      {/* Metrics Grid */}
      {data.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.metrics.map((m, i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="text-[10px] uppercase text-slate-500 font-bold">{m.label}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-mono font-bold text-slate-800 dark:text-slate-100">{m.value}</span>
                {m.trend === 'up' && <span className="text-xs text-emerald-500">▲</span>}
                {m.trend === 'down' && <span className="text-xs text-red-500">▼</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Risk Analysis Section */}
      {data.riskAnalysis && (
        <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-full">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Advanced Risk Assessment</h4>
            <div className="flex flex-col md:flex-row gap-6">
                {/* Detailed Risk Metrics */}
                <div className="flex-1 space-y-3">
                    {data.riskAnalysis.metrics.map((m, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg flex justify-between items-center border border-slate-100 dark:border-slate-800">
                            <div>
                                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{m.label}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{m.description}</div>
                            </div>
                            <div className="text-lg font-mono font-bold text-slate-800 dark:text-white tracking-tight">{m.value}</div>
                        </div>
                    ))}
                </div>
                {/* Risk Radar Chart */}
                <div className="flex-1 h-64 min-h-[200px] relative">
                    <div className="absolute top-0 right-0 text-[10px] text-slate-400 italic">Risk Profile</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.riskAnalysis.factors}>
                            <PolarGrid stroke="#334155" opacity={0.2} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Risk Score" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                            <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Historical Performance */}
        {data.history && (
          <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Portfolio Performance</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.history}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 10, fill: '#94a3b8'}} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{fontSize: 10, fill: '#94a3b8'}} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3'}} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0ea5e9" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    name="Portfolio"
                  />
                  {data.history[0].benchmark && (
                    <Area 
                        type="monotone" 
                        dataKey="benchmark" 
                        stroke="#94a3b8" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                        fill="none"
                        name="Market Benchmark"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Asset Allocation */}
        {data.allocation && (
          <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Asset Allocation</h4>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.allocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Projection */}
      {data.projection && (
        <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Growth Projection (5-Year Scenario)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.projection} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="year" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                <Bar dataKey="conservative" name="Conservative" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expected" name="Expected" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aggressive" name="Aggressive" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceCharts;
