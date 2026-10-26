import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DetectionSettings, EyeStatus, DrowsinessEvent, ChartDataPoint, InputSourceMode, CameraDevice } from './types';
import { Header } from './components/Header';
import { DetectionCanvas } from './components/DetectionCanvas';
import { MetricsPanel } from './components/MetricsPanel';
import { DrowsinessLog } from './components/DrowsinessLog';
import { SettingsModal } from './components/SettingsModal';
import { GuideModal } from './components/GuideModal';

const DEFAULT_SETTINGS: DetectionSettings = {
  earThreshold: 0.22,
  drowsyFrameThreshold: 20,
  alarmType: 'siren',
  alarmVolume: 0.8,
  alertSensitivity: 'medium',
  showFaceMeshOverlay: true,
  showEyeBoxes: true,
  showLandmarks: true,
  audioAlertsEnabled: true,
  mirrorWebcam: true,
  minEarRange: 0.05,
  maxEarRange: 0.4,
};

export function App() {
  const [settings, setSettings] = useState<DetectionSettings>(DEFAULT_SETTINGS);
  const [inputMode, setInputMode] = useState<InputSourceMode>('webcam');
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  const [eyeStatus, setEyeStatus] = useState<EyeStatus>({
    leftEar: 0.32,
    rightEar: 0.32,
    averageEar: 0.32,
    leftClosed: false,
    rightClosed: false,
    isClosed: false,
  });

  const [activeFramesClosed, setActiveFramesClosed] = useState(0);
  const [isDrowsy, setIsDrowsy] = useState(false);
  const [drowsyEvents, setDrowsyEvents] = useState<DrowsinessEvent[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const lastChartUpdateRef = useRef<number>(0);

  // Enumerate cameras
  useEffect(() => {
    async function getCameras() {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevs = devices
            .filter((d) => d.kind === 'videoinput')
            .map((d, i) => ({
              deviceId: d.deviceId,
              label: d.label || `Camera ${i + 1}`,
            }));
          setCameras(videoDevs);
          if (videoDevs.length > 0) {
            setSelectedCamera((prev) => prev || videoDevs[0].deviceId);
          }
        } catch (e) {
          console.warn('Error enumerating camera devices:', e);
        }
      }
    }
    getCameras();
  }, []);

  // Handle live eye status update
  const handleUpdateEyeStatus = useCallback(
    (status: EyeStatus) => {
      setEyeStatus(status);

      // Append chart point (throttled to ~10fps to maintain smooth UI and prevent render lag)
      const now = performance.now();
      if (now - lastChartUpdateRef.current >= 100) {
        lastChartUpdateRef.current = now;
        const timeStr = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
        setChartData((prev) => {
          const next = [
            ...prev,
            {
              time: timeStr,
              leftEar: parseFloat(status.leftEar.toFixed(3)),
              rightEar: parseFloat(status.rightEar.toFixed(3)),
              avgEar: parseFloat(status.averageEar.toFixed(3)),
              threshold: settings.earThreshold,
            },
          ];
          return next.slice(-35); // Keep rolling 35 points
        });
      }
    },
    [settings.earThreshold]
  );

  const handleDrowsyEventTriggered = useCallback((event: DrowsinessEvent) => {
    setDrowsyEvents((prev) => [event, ...prev]);
  }, []);

  const handleUpdateSettings = (partial: Partial<DetectionSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        isDrowsy={isDrowsy}
        inputMode={inputMode}
        onChangeInputMode={setInputMode}
        cameras={cameras}
        selectedCamera={selectedCamera}
        onSelectCamera={setSelectedCamera}
        activeFramesClosed={activeFramesClosed}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Top Video Canvas & Control Stage */}
        <section className="w-full">
          <DetectionCanvas
            settings={settings}
            inputMode={inputMode}
            selectedCamera={selectedCamera}
            onUpdateEyeStatus={handleUpdateEyeStatus}
            onDrowsyEventTriggered={handleDrowsyEventTriggered}
            onFramesClosedUpdate={setActiveFramesClosed}
            setIsDrowsyState={setIsDrowsy}
          />
        </section>

        {/* Live Metrics Grid */}
        <section className="w-full">
          <MetricsPanel
            eyeStatus={eyeStatus}
            settings={settings}
            chartData={chartData}
            activeFramesClosed={activeFramesClosed}
            totalAlertsCount={drowsyEvents.length}
            isDrowsy={isDrowsy}
          />
        </section>

        {/* Drowsiness Event History Log */}
        <section className="w-full">
          <DrowsinessLog
            events={drowsyEvents}
            onClearLogs={() => setDrowsyEvents([])}
          />
        </section>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        onResetDefaults={() => setSettings(DEFAULT_SETTINGS)}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}

export default App;
