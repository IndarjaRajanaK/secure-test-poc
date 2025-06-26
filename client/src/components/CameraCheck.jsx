import { useEffect, useRef } from 'react';

export default function CameraCheck({ stream, size = 'large', onReady }) {
  const videoRef = useRef();

  useEffect(() => {
    if (!stream) return;
    videoRef.current.srcObject = stream;
    videoRef.current.onloadedmetadata = async () => {
      await videoRef.current.play();
      onReady?.(videoRef);   // optional callback
    };
  }, [stream, onReady]);

  const styles =
    size === 'large'
      ? { width: 480, height: 360 }
      : {
          width: 160,
          height: 120,
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          border: '2px solid #0a0',
          borderRadius: 8,
        };

  return <video ref={videoRef} style={styles} autoPlay muted />;
}
