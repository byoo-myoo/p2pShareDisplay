import { useCallback } from 'react';

export default function useScreenShare({ addLog, callGuest, connRef, peerRef, setStream, streamRef }) {
  const stopShare = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    streamRef.current = null;
  }, [setStream, streamRef]);

  const startShare = useCallback(async () => {
    try {
      addLog('Requesting display media...');
      const s = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });
      addLog(`Got display media: ${s.id}`);
      setStream(s);
      streamRef.current = s;

      if (connRef.current) {
        addLog('Guest already connected, calling them now...');
        callGuest(peerRef.current, connRef.current.peer, s);
      } else {
        addLog('No guest connected yet. Waiting for connection...');
      }

      const [track] = s.getVideoTracks();
      if (track) {
        track.onended = () => {
          addLog('Screen share stopped by user');
          stopShare();
        };
      }
    } catch (err) {
      addLog(`Error sharing screen: ${err}`, 'error');
    }
  }, [addLog, callGuest, connRef, peerRef, setStream, streamRef, stopShare]);

  return { startShare, stopShare };
}
