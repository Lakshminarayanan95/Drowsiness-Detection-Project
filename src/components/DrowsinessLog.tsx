import React from 'react';
import { DrowsinessEvent } from '../types';
import { History, Download, Trash2, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface DrowsinessLogProps {
  events: DrowsinessEvent[];
  onClearLogs: () => void;
}

export const DrowsinessLog: React.FC<DrowsinessLogProps> = ({ events, onClearLogs }) => {
  const downloadCSV = () => {
    if (events.length === 0) return;
    const headers = 'ID,Timestamp,Status,Severity,Max_EAR_Drop\n';
    const rows = events
      .map(
        (e) => `${e.id},${e.timestamp},${e.status},${e.severity},${e.maxEarDrop.toFixed(3)}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drowsiness-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Drowsiness Alert History ({events.length})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {events.length > 0 && (
            <>
              <button
                id="export-csv-btn"
                onClick={downloadCSV}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                id="clear-logs-btn"
                onClick={onClearLogs}
                className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
          <p>No drowsiness events recorded in this session.</p>
          <p className="text-[11px] text-slate-600">
            Alerts will automatically be logged here when eye closure frame count exceeds the sensitivity threshold.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-56 overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/50 sticky top-0">
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Event Type</th>
                <th className="py-2 px-3">Severity</th>
                <th className="py-2 px-3">Min EAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 font-mono text-slate-300">{evt.timestamp}</td>
                  <td className="py-2 px-3 font-semibold text-red-400 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>{evt.status}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-amber-300">{evt.maxEarDrop.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
