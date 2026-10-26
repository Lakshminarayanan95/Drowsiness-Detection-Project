export interface EyeCoordinates {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface EyeStatus {
  leftEar: number;
  rightEar: number;
  averageEar: number;
  leftClosed: boolean;
  rightClosed: boolean;
  isClosed: boolean;
  leftCoords?: EyeCoordinates;
  rightCoords?: EyeCoordinates;
}

export interface DetectionSettings {
  earThreshold: number;          // EAR value below which eyes are considered closed (e.g., 0.22)
  drowsyFrameThreshold: number;  // Number of consecutive closed frames before triggering alarm (e.g., 20 frames = ~0.7-1.0 sec)
  alarmType: 'siren' | 'beep' | 'chime' | 'chime-continuous';
  alarmVolume: number;           // 0 to 1
  alertSensitivity: 'low' | 'medium' | 'high';
  showFaceMeshOverlay: boolean;
  showEyeBoxes: boolean;
  showLandmarks: boolean;
  audioAlertsEnabled: boolean;
  mirrorWebcam: boolean;
  minEarRange: number;
  maxEarRange: number;
}

export interface DrowsinessEvent {
  id: string;
  timestamp: string;
  durationSeconds: number;
  maxEarDrop: number;
  status: 'DROWSY' | 'YAWNING' | 'EYES_CLOSED';
  severity: 'WARNING' | 'CRITICAL';
}

export interface ChartDataPoint {
  time: string;
  leftEar: number;
  rightEar: number;
  avgEar: number;
  threshold: number;
}

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export type InputSourceMode = 'webcam' | 'demo-video' | 'simulation';
