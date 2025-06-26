import { useEffect } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { logEvent } from '../utils/logEvent';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';

export const useAntiCheat = ({ videoRef,examStarted, token, userId, sessionId, logHandler, setYawValue  }) => {
  useEffect(() => {
    if (!examStarted || !videoRef?.current) return;

    const log = (eventType, details = '') => {
      logHandler?.({
        eventType,
        details,
        timestamp: Date.now()
      });
    };
    // console.log('[AntiCheat] Hook triggered', { examStarted, video: !!videoRef?.current });

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 2,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      const faceCount = results.multiFaceLandmarks?.length || 0;
// console.log("Results:", results);
  // const faceCount = results.multiFaceLandmarks?.length || 0;
  // console.log("Detected faces:", faceCount);
      if (faceCount === 0) {
        log(token, { userId, sessionId, eventType: 'no-face' });
      } else if (faceCount > 1) {
        log(token, { userId, sessionId, eventType: 'multi-face' });
      } else {
        const landmarks = results.multiFaceLandmarks[0];
        const noseTip = landmarks[1];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];

        const horizontalDistance = Math.abs(leftEye.x - rightEye.x);
        const noseToLeft = Math.abs(noseTip.x - leftEye.x);
        const noseToRight = Math.abs(noseTip.x - rightEye.x);

        const yaw = (noseToRight - noseToLeft) / horizontalDistance;
        if (Math.abs(yaw) > 0.25) {
          log(token, {
            userId,
            sessionId,
            eventType: 'look-away',
            details: `yaw ${yaw.toFixed(2)}`,
          });
        }
      }
    });

      let model;
        // (async () => {
        //   model = await handpose.load();
        // })();
    
         let lastHandLogTime = 0;
            const HAND_DETECTION_COOLDOWN = 3000;
        
            const loadHandModel = async () => {
              model = await handpose.load();
            };

            const detectHands = async () => {
      if (!model) return;
      const predictions = await model.estimateHands(videoRef.current, true);
      const now = Date.now();
      if (predictions.length > 0 && now - lastHandLogTime > HAND_DETECTION_COOLDOWN) {
        lastHandLogTime = now;
        log(token, {
          userId,
          sessionId,
          eventType: 'hand-detected',
          details: `hands: ${predictions.length}`,
        });
      }
    };

    loadHandModel();


        // const detectHands = async () => {
        //   if (!model) return;
        //   const predictions = await model.estimateHands(videoRef.current, true);
        //   if (predictions.length > 0) {
        //     logEvent(token, { userId, sessionId, eventType: 'hand-detected', details: `hands: ${predictions.length}` });
        //   }
        // };
    
        // const shoulderThresh = 0.3; // optional: use Y positions to ensure proximity
    

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await faceMesh.send({ image: videoRef.current });
        await detectHands();
      },
      width: 640,
      height: 480,
    });

    camera.start();

    const onBlur = () => log(token, { userId, sessionId, eventType: 'tab-switch' });
    const block = (e) => {
      e.preventDefault();
      log(token, { userId, sessionId, eventType: 'copy-attempt' });
    };

    window.addEventListener('blur', onBlur);
    document.addEventListener('copy', block);
    document.addEventListener('paste', block);

    return () => {
      camera.stop();
      faceMesh.close();
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('copy', block);
      document.removeEventListener('paste', block);
      // if (model && model.dispose) model.dispose();
    };
  }, [videoRef, examStarted, logHandler]);
};