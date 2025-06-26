// hooks/useExamSecurity.js
import { useEffect } from 'react';

export const useExamSecurity = (logHandler, onFullscreenExit) => {
  useEffect(() => {
    // Fullscreen monitor
    const checkFullScreen = () => {
      if (!document.fullscreenElement) {
        alert('Exited full screen!');
        logHandler?.({ eventType: 'fullscreen-exit', details: 'User exited full screen', timestamp: Date.now() });
        onFullscreenExit?.();
      }
    };

    document.addEventListener('fullscreenchange', checkFullScreen);

    return () => {
      document.removeEventListener('fullscreenchange', checkFullScreen);
    };
  }, [logHandler]);

  useEffect(() => {
    const blockKeys = (e) => {
      const keysToBlock = [
        'F12', 'F11', 'F5', 'Tab', 'U', 'I', 'C', 'J', 'W', 'T'
      ];

      const combo =
        (e.ctrlKey ? 'Control+' : '') +
        (e.shiftKey ? 'Shift+' : '') +
        (e.altKey ? 'Alt+' : '') +
        e.key;

      if (
        keysToBlock.includes(e.key) ||
        ['Control+Shift+I', 'Control+Shift+C', 'Control+Shift+J'].includes(combo)
      ) {
        e.preventDefault();
        alert('Shortcut disabled during exam!');
      }
    };

    const blockContext = (e) => e.preventDefault();

    window.addEventListener('keydown', blockKeys);
    window.addEventListener('contextmenu', blockContext);

    return () => {
      window.removeEventListener('keydown', blockKeys);
      window.removeEventListener('contextmenu', blockContext);
    };
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel('exam-tab-detection');
    channel.postMessage('ping');

    const onMessage = (e) => {
      if (e.data === 'ping') {
        alert('Another tab is open. Please close other tabs!');
        logHandler?.({ eventType: 'multi-tab-detected', details: 'Another tab opened', timestamp: Date.now() });
      }
    };

    channel.addEventListener('message', onMessage);

    return () => channel.close();
  }, []);
};
