import React from 'react';
import { EyeStatus, DetectionSettings, ChartDataPoint } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { Activity, Gauge, Clock, AlertTriangle, Eye, ShieldCheck } from 'lucide-react';

interface MetricsPanelProps {
  eyeStatus: EyeStatus;
  settings: DetectionSettings;
  chartData: ChartDataPoint[];
  activeFramesClosed: number;
  totalAlertsCount: number;
  isDrowsy: boolean;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  eyeStatus,
  settings,
  chartData,
  activeFramesClosed,
  totalAlertsCount,
  isDrowsy,
}) => {
  const earPercentage = Math.min(100, Math.max(0, Math.round((eyeStatus.averageEar / 0.45) * 100)));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Real-time EAR Gauge & State Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Eye Aspect Ratio (EAR)
            </span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
            Target &gt; {settings.earThreshold}
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div>
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {eyeStatus.averageEar.toFixed(3)}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Left: <span className="font-mono text-slate-200">{eyeStatus.leftEar.toFixed(3)}</span> | Right:{' '}
              <span className="font-mono text-slate-200">{eyeStatus.rightEar.toFixed(3)}</span>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                eyeStatus.isClosed
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {eyeStatus.isClosed ? 'CLOSED' : 'OPEN'}
            </span>
          </div>
        </div>

        {/* EAR Progress Bar */}
        <div className="space-y-1 mt-2">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>0.00 (Closed)</span>
            <span>0.45 (Wide Open)</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700 relative">
            {/* Threshold Line marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: `${(settings.earThreshold / 0.45) * 100}%` }}
              title={`Threshold: ${settings.earThreshold}`}
            />
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                eyeStatus.isClosed ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${earPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Closed Frame Counter & Sensitivity Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Drowsiness Counter
            </span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
            Threshold: {settings.drowsyFrameThreshold} Frames
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 my-1">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">Closed Frames</span>
            <span className={`text-2xl font-bold font-mono ${activeFramesClosed > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {activeFramesClosed}
            </span>
            <span className="text-[10px] text-slate-500 block">/ {settings.drowsyFrameThreshold} max</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">Alert Triggers</span>
            <span className={`text-2xl font-bold font-mono ${totalAlertsCount > 0 ? 'text-red-400' : 'text-slate-300'}`}>
              {totalAlertsCount}
            </span>
            <span className="text-[10px] text-slate-500 block">Total Session</span>
          </div>
        </div>

        {/* Status notice */}
        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
          {isDrowsy ? (
            <span className="text-red-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> High Risk Alert Active!
            </span>
          ) : activeFramesClosed > 0 ? (
            <span className="text-amber-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> Eyes closing... countdown active
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Normal alertness level
            </span>
          )}
        </div>
      </div>

      {/* 3. Live EAR Trend Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              EAR Real-time Graph
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Live Trend</span>
        </div>

        <div className="w-full h-28">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 0.5]} ticks={[0, 0.2, 0.4]} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                  color: '#f8fafc',
                }}
              />
              <ReferenceLine y={settings.earThreshold} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Thresh', fill: '#ef4444', fontSize: 9 }} />
              <Line type="monotone" dataKey="avgEar" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
