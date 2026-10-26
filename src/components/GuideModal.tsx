import React from 'react';
import { X, BookOpen, Cpu, Eye, CheckCircle2, ShieldAlert } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Algorithm & How It Works</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs text-slate-300 leading-relaxed">
          {/* Eye Aspect Ratio explanation */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4 text-emerald-400" /> Eye Aspect Ratio (EAR) Formula
            </h3>
            <p>
              Eye Aspect Ratio (EAR) measures eye openness by computing distances between vertical and horizontal eye landmarks:
            </p>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300">
              EAR = (||P2 - P6|| + ||P3 - P5||) / (2.0 * ||P1 - P4||)
            </div>
            <p className="text-slate-400">
              When eyes are open, EAR remains high (~0.28 - 0.38). When eyes close, EAR rapidly drops toward ~0.05 - 0.15.
            </p>
          </div>

          {/* Drowsiness Decision Logic */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Drowsiness Alert Logic
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              <li>
                <strong className="text-slate-100">Normal Blinks:</strong> Eyes close briefly for 2–5 frames (~0.1–0.2s) and reopen.
              </li>
              <li>
                <strong className="text-amber-300">Fatigue/Drowsiness:</strong> Eyes remain closed for ≥20 consecutive frames (~0.7s - 1.0s).
              </li>
              <li>
                <strong className="text-red-400">Alarm Trigger:</strong> Once the closed frame threshold is breached, the loud audio siren/beep plays immediately and logs a drowsiness incident.
              </li>
            </ul>
          </div>

          {/* Tips */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <Cpu className="w-4 h-4 text-indigo-400" /> Calibration & Tips
            </h3>
            <div className="space-y-1.5">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Ensure adequate lighting on your face so MediaPipe can detect facial landmarks clearly.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>If you wear thick glasses, adjust the EAR Threshold slightly higher (e.g. 0.24) in Settings.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Use the "Hold to Test Close Eyes" button at the bottom of the video player to test alarms instantly!</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
