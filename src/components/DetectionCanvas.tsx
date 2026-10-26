import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DetectionSettings, EyeStatus, InputSourceMode, DrowsinessEvent } from '../types';
import { processFaceLandmarks, NormalizedLandmark } from '../utils/earCalculator';
import { soundManager } from '../utils/audio';
import { AlertOctagon, Camera, RefreshCw, Eye, EyeOff, Play, Pause, RotateCcw } from 'lucide-react';

interface DetectionCanvasProps {
  settings: DetectionSettings;
  inputMode: InputSourceMode;
  selectedCamera: string;
  onUpdateEyeStatus: (status: EyeStatus) => void;
  onDrowsyEventTriggered: (event: DrowsinessEvent) => void;
  onFramesClosedUpdate: (count: number) => void;
  setIsDrowsyState: (drowsy: boolean) => void;
}

declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
  }
}

export const DetectionCanvas: React.FC<DetectionCanvasProps> = ({
  settings,
  inputMode,
  selectedCamera,
  onUpdateEyeStatus,
  onDrowsyEventTriggered,
  onFramesClosedUpdate,
  setIsDrowsyState,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasCameraError, setHasCameraError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [closedFrames, setClosedFrames] = useState(0);
  const [isDrowsy, setIsDrowsy] = useState(false);
  const [currentEar, setCurrentEar] = useState(0.32);
  const [fps, setFps] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Simulation mode states
  const [simulatedEyeClosed, setSimulatedEyeClosed] = useState(false);

  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const drowsyStartTimeRef = useRef<number | null>(null);
  const closedFramesRef = useRef<number>(0);
  const isStartingRef = useRef<boolean>(false);

  // Synchronize state to ref
  closedFramesRef.current = closedFrames;

  // Handle Drowsiness Alert Trigger
  const triggerDrowsyAlert = useCallback(() => {
    if (!drowsyStartTimeRef.current) {
      drowsyStartTimeRef.current = Date.now();
      const event: DrowsinessEvent = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        durationSeconds: 0,
        maxEarDrop: currentEar,
        status: 'DROWSY',
        severity: 'CRITICAL',
      };
      onDrowsyEventTriggered(event);
    }

    setIsDrowsy(true);
    setIsDrowsyState(true);

    if (settings.audioAlertsEnabled) {
      soundManager.startAlarm(settings.alarmType, settings.alarmVolume);
    }
  }, [currentEar, onDrowsyEventTriggered, setIsDrowsyState, settings.alarmType, settings.alarmVolume, settings.audioAlertsEnabled]);

  const clearDrowsyAlert = useCallback(() => {
    if (isDrowsy) {
      setIsDrowsy(false);
      setIsDrowsyState(false);
      soundManager.stopAlarm();
      drowsyStartTimeRef.current = null;
    }
  }, [isDrowsy, setIsDrowsyState]);

  // Main Landmark Processing
  const onResults = useCallback(
    (results: any) => {
      if (isPaused) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      canvas.width = width;
      canvas.height = height;

      // Calculate FPS
      const now = performance.now();
      const delta = (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;
      if (delta > 0) {
        setFps(Math.round(1 / delta));
      }

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Draw Video Feed onto canvas
      if (settings.mirrorWebcam && inputMode === 'webcam') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();

      let eyeStatus: EyeStatus = {
        leftEar: 0.32,
        rightEar: 0.32,
        averageEar: 0.32,
        leftClosed: false,
        rightClosed: false,
        isClosed: false,
      };

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks: NormalizedLandmark[] = results.multiFaceLandmarks[0];

        eyeStatus = processFaceLandmarks(landmarks, width, height, settings.earThreshold);

        // Draw Face Mesh Overlay
        if (settings.showFaceMeshOverlay && results.multiFaceLandmarks[0]) {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
          for (let i = 0; i < landmarks.length; i += 4) {
            const pt = landmarks[i];
            const px = settings.mirrorWebcam && inputMode === 'webcam' ? (1 - pt.x) * width : pt.x * width;
            const py = pt.y * height;
            ctx.beginPath();
            ctx.arc(px, py, 1, 0, 2 * Math.PI);
            ctx.fill();
          }
        }

        // Draw Eye ROIs and status text (matches original detect.py logic)
        if (settings.showEyeBoxes && eyeStatus.leftCoords && eyeStatus.rightCoords) {
          const eyes = [
            { coords: eyeStatus.leftCoords, closed: eyeStatus.leftClosed, ear: eyeStatus.leftEar, label: 'L' },
            { coords: eyeStatus.rightCoords, closed: eyeStatus.rightClosed, ear: eyeStatus.rightEar, label: 'R' },
          ];

          eyes.forEach(({ coords, closed, ear, label }) => {
            let x1 = coords.x1;
            let x2 = coords.x2;
            if (settings.mirrorWebcam && inputMode === 'webcam') {
              const origX1 = x1;
              x1 = width - x2;
              x2 = width - origX1;
            }

            const y1 = coords.y1;
            const y2 = coords.y2;
            const boxColor = closed ? '#ef4444' : '#22c55e';

            // Draw Box
            ctx.strokeStyle = boxColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

            // Eye Label & EAR text
            ctx.fillStyle = boxColor;
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(`${label}: ${closed ? 'CLOSED' : 'OPEN'} (${ear.toFixed(2)})`, x1, Math.max(15, y1 - 6));
          });
        }
      } else if (inputMode === 'demo-video' || inputMode === 'simulation') {
        // Fallback simulation processing if face mesh yields no face
        const simEar = simulatedEyeClosed ? 0.12 : 0.35;
        eyeStatus = {
          leftEar: simEar,
          rightEar: simEar,
          averageEar: simEar,
          leftClosed: simulatedEyeClosed,
          rightClosed: simulatedEyeClosed,
          isClosed: simulatedEyeClosed,
        };
      }

      setCurrentEar(eyeStatus.averageEar);
      onUpdateEyeStatus(eyeStatus);

      // Drowsiness closed frames tracking
      if (eyeStatus.isClosed) {
        setClosedFrames((prev) => {
          const updated = prev + 1;
          onFramesClosedUpdate(updated);

          if (updated >= settings.drowsyFrameThreshold) {
            triggerDrowsyAlert();
          }
          return updated;
        });
      } else {
        setClosedFrames(0);
        onFramesClosedUpdate(0);
        clearDrowsyAlert();
      }

      // Draw Big Warning Banner on Canvas if Drowsy (matching detect.py line 101)
      if (closedFramesRef.current >= settings.drowsyFrameThreshold) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.fillRect(0, 0, width, 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🚨 DROWSINESS DETECTED! WAKE UP!', width / 2, 35);
        ctx.textAlign = 'left';
      }
    },
    [
      isPaused,
      settings.mirrorWebcam,
      settings.earThreshold,
      settings.showFaceMeshOverlay,
      settings.showEyeBoxes,
      settings.drowsyFrameThreshold,
      inputMode,
      simulatedEyeClosed,
      onUpdateEyeStatus,
      onFramesClosedUpdate,
      triggerDrowsyAlert,
      clearDrowsyAlert,
    ]
  );

  // Keep a stable ref to onResults so MediaPipe always invokes the latest callback
  // without re-running the stream initialization effect
  const onResultsRef = useRef(onResults);
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  // Clean up any existing media stream tracks
  const stopExistingStream = useCallback(() => {
    if (cameraRef.current) {
      try {
        cameraRef.current.stop();
      } catch (e) {
        // ignore
      }
      cameraRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      const oldStream = videoRef.current.srcObject as MediaStream;
      oldStream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  // Webcam stream launcher
  const startWebcamStream = useCallback(async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;

    try {
      stopExistingStream();

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints: MediaStreamConstraints = {
          video: selectedCamera ? { deviceId: { exact: selectedCamera } } : { width: 640, height: 480, facingMode: 'user' },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr: any) {
            if (playErr.name !== 'AbortError') {
              console.warn('video.play() failed:', playErr);
            }
          }

          if (faceMeshRef.current && window.Camera) {
            const camera = new window.Camera(videoRef.current, {
              onFrame: async () => {
                if (videoRef.current && faceMeshRef.current) {
                  try {
                    await faceMeshRef.current.send({ image: videoRef.current });
                  } catch (e) {
                    // ignore frame send errors during tearing down
                  }
                }
              },
              width: 640,
              height: 480,
            });
            camera.start();
            cameraRef.current = camera;
          } else {
            // Manual loop fallback
            const renderLoop = async () => {
              if (videoRef.current && faceMeshRef.current) {
                try {
                  await faceMeshRef.current.send({ image: videoRef.current });
                } catch (e) {
                  // ignore
                }
              }
              animFrameRef.current = requestAnimationFrame(renderLoop);
            };
            renderLoop();
          }
        }
        setIsLoading(false);
      } else {
        throw new Error('Camera access API not supported in this browser environment.');
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setHasCameraError(true);
      setErrorMessage(err.message || 'Could not access webcam. Please verify camera permissions.');
      setIsLoading(false);
    } finally {
      isStartingRef.current = false;
    }
  }, [selectedCamera, stopExistingStream]);

  // Demo Video launcher
  const startDemoVideo = useCallback(() => {
    stopExistingStream();
    setIsLoading(false);
    if (videoRef.current) {
      const processDemoFrame = async () => {
        if (videoRef.current && faceMeshRef.current && !videoRef.current.paused) {
          try {
            await faceMeshRef.current.send({ image: videoRef.current });
          } catch (e) {
            // ignore
          }
        }
        animFrameRef.current = requestAnimationFrame(processDemoFrame);
      };
      processDemoFrame();
    }
  }, [stopExistingStream]);

  // Initialize MediaPipe FaceMesh & Camera Stream
  useEffect(() => {
    let isCancelled = false;

    const initMediaPipe = async () => {
      setIsLoading(true);
      setHasCameraError(false);

      if (!window.FaceMesh) {
        // Wait briefly for CDN script
        await new Promise((r) => setTimeout(r, 500));
      }

      if (!window.FaceMesh) {
        console.warn('FaceMesh JS library not loaded from CDN yet, fallback simulation active.');
      } else if (!faceMeshRef.current) {
        try {
          const faceMesh = new window.FaceMesh({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
          });

          faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          faceMesh.onResults((results: any) => {
            if (onResultsRef.current) {
              onResultsRef.current(results);
            }
          });
          faceMeshRef.current = faceMesh;
        } catch (err) {
          console.error('Failed to instantiate MediaPipe FaceMesh:', err);
        }
      }

      if (isCancelled) return;

      // Start webcam or video input
      if (inputMode === 'webcam') {
        await startWebcamStream();
      } else {
        startDemoVideo();
      }
    };

    initMediaPipe();

    return () => {
      isCancelled = true;
      stopExistingStream();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      soundManager.stopAlarm();
    };
  }, [inputMode, selectedCamera, startWebcamStream, startDemoVideo, stopExistingStream]);

  return (
    <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center justify-center">
      {/* Hidden Video element holding feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        loop={inputMode === 'demo-video'}
        className="hidden"
        onPlay={() => setIsLoading(false)}
      />

      {/* Render Canvas */}
      <div className="relative w-full aspect-video max-h-[520px] bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-contain ${isDrowsy ? 'ring-4 ring-red-600 animate-pulse-fast' : ''}`}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-slate-300">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-sm font-medium">Initializing AI Face Mesh Model...</p>
            <p className="text-xs text-slate-500">Loading neural network & camera stream</p>
          </div>
        )}

        {/* Camera Access Error Fallback */}
        {hasCameraError && inputMode === 'webcam' && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
              <Camera className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-200">Camera Unavailable</h3>
              <p className="text-xs text-slate-400 max-w-md mt-1">{errorMessage}</p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => startWebcamStream()}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
              </button>
            </div>
          </div>
        )}

        {/* Live Top Corner Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 text-xs text-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{fps} FPS</span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 text-xs text-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <span className="text-slate-400">EAR:</span>
            <span className={`font-mono font-bold ${currentEar < settings.earThreshold ? 'text-red-400' : 'text-emerald-400'}`}>
              {currentEar.toFixed(3)}
            </span>
            <span className="text-slate-500 text-[10px]">(Thresh: {settings.earThreshold})</span>
          </div>
        </div>

        {/* Live Bottom Controls Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Pause / Play */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 bg-slate-900/80 backdrop-blur border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-lg"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          </div>

          {/* Simulated Eye Closure Toggle button for easy testing */}
          <div className="pointer-events-auto">
            <button
              onClick={() => setSimulatedEyeClosed(!simulatedEyeClosed)}
              onMouseDown={() => setSimulatedEyeClosed(true)}
              onMouseUp={() => setSimulatedEyeClosed(false)}
              className={`px-3 py-1.5 backdrop-blur border rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg transition-all ${
                simulatedEyeClosed
                  ? 'bg-red-600 text-white border-red-500'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {simulatedEyeClosed ? <EyeOff className="w-4 h-4 text-white animate-pulse" /> : <Eye className="w-4 h-4 text-amber-400" />}
              <span>{simulatedEyeClosed ? 'Release Eyes (Simulated Closed)' : 'Hold to Test Close Eyes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
