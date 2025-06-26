import { Children, useEffect, useRef, useState } from 'react';
import CameraCheck from '../components/CameraCheck';
import ConsentModal from '../components/ConsentModal';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { useExamSecurity } from '../hooks/useExamSecurity';
import { submitExam } from '../utils/services/services';

export default function ExamPage({ token = 1, userId = 1, sessionId = 1 }) {
  const [stream, setStream] = useState(null);      // active MediaStream
  const [examStarted, setExamStarted] = useState(false);
  // const [videoRef, setVideoRef] = useState(null);
  const videoRef = useRef(null);
  const [eventLogs, setEventLogs] = useState([]);
  const [yawValue, setYawValue] = useState(0);

  const handleLogEvent = (event) => {
    setEventLogs(prev => [...prev, { ...event, timestamp: Date.now() }]);
  };

  useExamSecurity(handleLogEvent); // Fullscreen, shortcut, multitabs

  const handleSubmitExam = async () => {
    // try {
    //   await fetch('/api/submit-exam', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       userId,
    //       sessionId,
    //       logs: eventLogs,
    //       // include answers too, if needed
    //     }),
    //   });
    //   alert('Exam submitted!');
    // } catch (err) {
    //   console.error('Error submitting exam:', err);
    //   alert('Submission failed');
    // }
    console.log(eventLogs, "eventLogs")
    console.log("called submit exam");
    // try{
    submitExam(1, { userId, sessionId, eventLogs })
      .then((response) => {
        console.log('Exam submitted successfully:', response);
        alert('Exam submitted successfully!');
      })
      .catch((error) => {
        console.error('Error submitting exam:', error);
        alert('Failed to submit exam');
      });
  }
  // } catch (error) {
  //   console.error('Error submitting exam:', error)
  // }


  // useAntiCheat({ videoRef, examStarted, token, userId, sessionId });
  useAntiCheat({
    videoRef,
    examStarted,
    logHandler: handleLogEvent,
    setYawValue,
  });

  useEffect(() => {
    if (examStarted && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [examStarted, stream]);

  const goFullScreen = () => {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
};

const checkFullScreen = () => {
  if (!document.fullscreenElement) {
    alert('You exited full screen mode.');
    // logHandler?.({ eventType: 'fullscreen-exit' });
  }
};

useEffect(() => {
  document.addEventListener('fullscreenchange', checkFullScreen);
  return () => {
    document.removeEventListener('fullscreenchange', checkFullScreen);
  };
}, []);

// onClick={() => {
//   setExamStarted(true);
//   goFullScreen();
// }}

  useEffect(() => {
    const blockKeys = (e) => {
      const blocked = [
        'F12',
        'Control+Shift+I',
        'Control+Shift+C',
        'Control+Shift+J',
        'Control+U',
        'Control+Tab',
        'Alt+Tab',
        'Control+W',
        'Control+T',
      ];

      const keyCombo =
        (e.ctrlKey ? 'Control+' : '') +
        (e.shiftKey ? 'Shift+' : '') +
        (e.altKey ? 'Alt+' : '') +
        e.key;

      if (blocked.includes(keyCombo)) {
        e.preventDefault();
        alert('This shortcut is disabled during the exam.');
      }
    };

    const blockContextMenu = (e) => e.preventDefault();

    window.addEventListener('keydown', blockKeys);
    window.addEventListener('contextmenu', blockContextMenu);

    return () => {
      window.removeEventListener('keydown', blockKeys);
      window.removeEventListener('contextmenu', blockContextMenu);
    };
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel('exam-tab-detection');

    channel.postMessage('ping');

    const onMessage = (e) => {
      if (e.data === 'ping') {
        alert('Another exam window is open. Please close other tabs.');
      }
    };

    channel.addEventListener('message', onMessage);

    return () => {
      channel.close();
    };
  }, []);


  useEffect(() => {
    if (!examStarted || !videoRef?.current) {
      // console.log('[AntiCheat] Skipping — not ready');
      return;
    }
  }, [videoRef?.current, examStarted, token, userId, sessionId]);

  if (!stream)
    return <ConsentModal onAllow={setStream} />;

  if (!examStarted)
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <CameraCheck stream={stream} size="large" />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            setExamStarted(true)
            goFullScreen()
          }}
        >
          Start Exam
        </button>
      </div>
    );

  return (

    < div className="p-4" >
      {/* <CameraCheck stream={stream} onReady={setVideoRef} hidden /> */}

      <video
        ref={videoRef}
        width={200}
        height="auto"
        autoPlay
        muted
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          border: '2px solid #0a0',
          borderRadius: '8px',
        }}
      />

      <h1>Exam in progress</h1>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded mt-4"
        onClick={handleSubmitExam}
      >
        Submit Exam
      </button>
    </div >
  );
}