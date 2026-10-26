import React from 'react';
import { Shield, Settings, HelpCircle, Volume2, VolumeX, Eye, AlertTriangle, Video, Camera } from 'lucide-react';
import { DetectionSettings, InputSourceMode, CameraDevice } from '../types';

interface HeaderProps {
  settings: DetectionSettings;
  onUpdateSettings: (newSettings: Partial<DetectionSettings>) => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  isDrowsy: boolean;
  inputMode: InputSourceMode;
  onChangeInputMode: (mode: InputSourceMode) => void;
  cameras: CameraDevice[];
  selectedCamera: string;
  onSelectCamera: (deviceId: string) => void;
  activeFramesClosed: number;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onOpenSettings,
  onOpenGuide,
  isDrowsy,
  inputMode,
  onChangeInputMode,
  cameras,
  selectedCamera,
  onSelectCamera,
  activeFramesClosed,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-30 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Title & Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl transition-colors ${
              isDrowsy ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Drowsiness Detection
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  AI Driver Safety
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                MediaPipe FaceMesh & Eye Aspect Ratio (EAR) Real-time Monitor
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isDrowsy ? (
              <div id="drowsy-alert-badge" className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-semibold text-xs animate-bounce shadow-lg shadow-red-600/30">
                <AlertTriangle className="w-4 h-4" />
                <span>DROWSY ALERT!</span>
              </div>
            ) : activeFramesClosed > 0 ? (
              <div id="eyes-closed-badge" className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Eyes Closed ({activeFramesClosed}f)</span>
              </div>
            ) : (
              <div id="monitoring-active-badge" className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Monitoring Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls & Mode Selection */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto pb-1 md:pb-0">
          {/* Source selector */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/80 text-xs font-medium">
            <button
              id="mode-webcam-btn"
              onClick={() => onChangeInputMode('webcam')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all ${
                inputMode === 'webcam' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Webcam</span>
            </button>

            <button
              id="mode-demo-btn"
              onClick={() => onChangeInputMode('demo-video')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all ${
                inputMode === 'demo-video' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Demo Video</span>
            </button>
          </div>

          {/* Camera dropdown if multiple available */}
          {inputMode === 'webcam' && cameras.length > 0 && (
            <select
              id="camera-select-dropdown"
              value={selectedCamera}
              onChange={(e) => onSelectCamera(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[140px] truncate"
            >
              {cameras.map((cam, idx) => (
                <option key={cam.deviceId || idx} value={cam.deviceId}>
                  {cam.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          )}

          {/* Audio toggle */}
          <button
            id="toggle-audio-btn"
            onClick={() => onUpdateSettings({ audioAlertsEnabled: !settings.audioAlertsEnabled })}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
              settings.audioAlertsEnabled
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
            title={settings.audioAlertsEnabled ? 'Audio Alerts Enabled' : 'Audio Alerts Muted'}
          >
            {settings.audioAlertsEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings button */}
          <button
            id="open-settings-btn"
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Sensitivity & Threshold Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Guide / How it works */}
          <button
            id="open-guide-btn"
            onClick={onOpenGuide}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Algorithm & EAR Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
