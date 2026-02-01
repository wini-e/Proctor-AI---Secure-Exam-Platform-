import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

let faceDetector = null;
let isRunning = false;
let noFaceTimeout = null;
const noFaceDelay = 7000; // 7 seconds
let animationFrameId = null;

// Function to initialize the MediaPipe Face Detector
export const loadModel = async () => {
  if (faceDetector) return;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
    );
    faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      minDetectionConfidence: 0.6
    });
    console.log("MediaPipe Face Detector loaded successfully.");
  } catch (error) {
      console.error("Error loading MediaPipe Face Detector:", error);
  }
};

const isWebcamObscured = (video) => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, 10, 10).data;
    let sum = 0;
    for (let i = 0; i < imageData.length; i += 4) {
        sum += imageData[i] + imageData[i+1] + imageData[i+2];
    }
    const avg = sum / (imageData.length * 0.75);
    return avg < 18;
};

// Main proctoring loop using MediaPipe
const runProctoring = (video, onViolation) => {
  if (!isRunning || !faceDetector || !video || video.readyState < 3) {
    if (isRunning) animationFrameId = requestAnimationFrame(() => runProctoring(video, onViolation));
    return;
  }

  if (isWebcamObscured(video)) {
    onViolation('Webcam Obscured');
    animationFrameId = requestAnimationFrame(() => runProctoring(video, onViolation));
    return;
  }

  const detections = faceDetector.detectForVideo(video, performance.now());

  if (detections.detections.length > 1) {
    onViolation('Multiple Faces Detected');
    if (noFaceTimeout) clearTimeout(noFaceTimeout);
  } else if (detections.detections.length === 0) {
    if (!noFaceTimeout) {
      noFaceTimeout = setTimeout(() => {
        onViolation('No Face Detected');
      }, noFaceDelay);
    }
  } else {
    if (noFaceTimeout) {
      clearTimeout(noFaceTimeout);
      noFaceTimeout = null;
    }
  }

  animationFrameId = requestAnimationFrame(() => runProctoring(video, onViolation));
};

export const startProctoring = (video, onViolation) => {
  if (isRunning) return;
  isRunning = true;
  if (faceDetector) {
    runProctoring(video, onViolation);
  } else {
      console.error("Proctoring cannot start: face detector is not initialized.");
  }
};

export const stopProctoring = () => {
  isRunning = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (noFaceTimeout) {
    clearTimeout(noFaceTimeout);
    noFaceTimeout = null;
  }
  console.log("Proctoring stopped.");
};