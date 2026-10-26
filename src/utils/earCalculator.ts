import { EyeStatus, EyeCoordinates } from '../types';

export interface NormalizedLandmark {
  x: number;
  y: number;
  z?: number;
}

// MediaPipe FaceMesh indices
const LEFT_EYE_INDICES = {
  p1: 33,   // outer corner
  p4: 133,  // inner corner
  p2: 160,  // top left
  p6: 144,  // bottom left
  p3: 158,  // top right
  p5: 153,  // bottom right
};

const RIGHT_EYE_INDICES = {
  p1: 362,  // inner corner
  p4: 263,  // outer corner
  p2: 385,  // top left
  p6: 380,  // bottom left
  p3: 387,  // top right
  p5: 373,  // bottom right
};

const ALL_LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144];
const ALL_RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380];

function euclideanDistance(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function calculateEyeAspectRatio(
  landmarks: NormalizedLandmark[],
  indices: typeof LEFT_EYE_INDICES
): number {
  const p1 = landmarks[indices.p1];
  const p2 = landmarks[indices.p2];
  const p3 = landmarks[indices.p3];
  const p4 = landmarks[indices.p4];
  const p5 = landmarks[indices.p5];
  const p6 = landmarks[indices.p6];

  if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) return 0.3;

  // Vertical distances
  const v1 = euclideanDistance(p2, p6);
  const v2 = euclideanDistance(p3, p5);

  // Horizontal distance
  const h = euclideanDistance(p1, p4);

  if (h === 0) return 0.3;

  const ear = (v1 + v2) / (2.0 * h);
  return Math.max(0, Math.min(1, ear));
}

export function getEyeBoundingBox(
  landmarks: NormalizedLandmark[],
  indicesList: number[],
  width: number,
  height: number,
  margin = 8
): EyeCoordinates {
  const xs = indicesList.map((idx) => (landmarks[idx]?.x ?? 0) * width);
  const ys = indicesList.map((idx) => (landmarks[idx]?.y ?? 0) * height);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x1: Math.max(0, Math.floor(minX - margin)),
    y1: Math.max(0, Math.floor(minY - margin)),
    x2: Math.min(width, Math.ceil(maxX + margin)),
    y2: Math.min(height, Math.ceil(maxY + margin)),
  };
}

export function processFaceLandmarks(
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  earThreshold = 0.22
): EyeStatus {
  const leftEar = calculateEyeAspectRatio(landmarks, LEFT_EYE_INDICES);
  const rightEar = calculateEyeAspectRatio(landmarks, RIGHT_EYE_INDICES);
  const averageEar = (leftEar + rightEar) / 2.0;

  const leftClosed = leftEar < earThreshold;
  const rightClosed = rightEar < earThreshold;
  const isClosed = averageEar < earThreshold;

  const leftCoords = getEyeBoundingBox(landmarks, ALL_LEFT_EYE_INDICES, width, height);
  const rightCoords = getEyeBoundingBox(landmarks, ALL_RIGHT_EYE_INDICES, width, height);

  return {
    leftEar,
    rightEar,
    averageEar,
    leftClosed,
    rightClosed,
    isClosed,
    leftCoords,
    rightCoords,
  };
}
