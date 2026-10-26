import React from 'react';
import { DetectionSettings } from '../types';
import { X, Sliders, Volume2, Eye, RotateCcw, Bell } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DetectionSettings;
  onSaveSettings: (newSettings: DetectionSettings) => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  const testAudio = () => {
    soundManager.startAlarm(settings.alarmType, settings.alarmVolume);
    setTimeout(() => soundManager.stopAlarm(), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Detection & Alarm Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* EAR Threshold */}
          <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-200">
                Eye Aspect Ratio (EAR) Threshold
              </label>
              <span className="font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {settings.earThreshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.32"
              step="0.01"
              value={settings.earThreshold}
              onChange={(e) => onSaveSettings({ ...settings, earThreshold: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Values below this threshold indicate closed eyes. Default is 0.22. Increase for higher sensitivity.
            </p>
          </div>

          {/* Frame Count Trigger */}
          <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-200">
                Drowsiness Closed Frame Threshold
              </label>
              <span className="font-mono text-amber-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {settings.drowsyFrameThreshold} frames
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={settings.drowsyFrameThreshold}
              onChange={(e) => onSaveSettings({ ...settings, drowsyFrameThreshold: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Consecutive closed-eye frames required to trigger alarm. 20 frames ≈ 0.7 seconds.
            </p>
          </div>

          {/* Alarm Type & Volume */}
          <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-red-400" />
                Alarm Sound Alert
              </label>

              <button
                type="button"
                onClick={testAudio}
                className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" /> Test Sound
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['siren', 'beep', 'chime'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onSaveSettings({ ...settings, alarmType: type })}
                  className={`py-2 px-3 rounded-lg text-xs font-medium capitalize border transition-all ${
                    settings.alarmType === type
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Volume */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Alarm Volume</span>
                <span className="font-mono">{Math.round(settings.alarmVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.alarmVolume}
                onChange={(e) => onSaveSettings({ ...settings, alarmVolume: parseFloat(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Display Overlays */}
          <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-400" /> Canvas Visual Overlays
            </div>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-slate-300">Show Face Mesh Landmark Points</span>
              <input
                type="checkbox"
                checked={settings.showFaceMeshOverlay}
                onChange={(e) => onSaveSettings({ ...settings, showFaceMeshOverlay: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-slate-300">Show Eye Bounding Boxes & Status</span>
              <input
                type="checkbox"
                checked={settings.showEyeBoxes}
                onChange={(e) => onSaveSettings({ ...settings, showEyeBoxes: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-slate-300">Mirror Webcam View</span>
              <input
                type="checkbox"
                checked={settings.mirrorWebcam}
                onChange={(e) => onSaveSettings({ ...settings, mirrorWebcam: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onResetDefaults}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
