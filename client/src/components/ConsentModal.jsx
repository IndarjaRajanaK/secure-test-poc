import { useState } from 'react';

export default function ConsentModal({ onAllow }) {
  const [error, setError] = useState('');

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      onAllow(stream);      // pass the active stream up
    } catch (err) {
      setError(`${err.name}: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
      <h2 className="text-xl mb-4">We need access to your camera</h2>
      {error && <p className="text-red-400 mb-2">{error}</p>}
      <button
        className="px-4 py-2 bg-green-600 rounded"
        onClick={requestCamera}
      >
        Allow Camera
      </button>
    </div>
  );
}
