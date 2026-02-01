import React, { createContext, useContext, useRef, useCallback } from 'react';

const WebcamContext = createContext(null);

export const useWebcam = () => useContext(WebcamContext);

export const WebcamProvider = ({ children }) => {
  const streamRef = useRef(null);

  const startWebcam = useCallback(async () => {
    if (streamRef.current) {
      console.warn("Webcam stream is already active.");
      return streamRef.current;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      console.log("Webcam stream started successfully.");
      return stream;
    } catch (err) {
      console.error("Error starting webcam:", err);
      throw err;
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      console.log("Webcam stream stopped successfully.");
    }
  }, []);

  const value = { startWebcam, stopWebcam };

  return (
    <WebcamContext.Provider value={value}>
      {children}
    </WebcamContext.Provider>
  );
};
