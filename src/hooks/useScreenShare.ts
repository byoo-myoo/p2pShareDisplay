import { useCallback, useState, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { LogEntry } from './useLogs';

type CursorMediaConstraints = MediaTrackConstraints & { cursor?: 'always' | 'motion' | 'never' };

type UseScreenShareParams = {
  addLog: (msg: string, type?: LogEntry['type']) => void;
  callGuest: (peer: Peer | null, guestId: string, mediaStream: MediaStream) => void;
  connRef: MutableRefObject<DataConnection | null>;
  peerRef: MutableRefObject<Peer | null>;
  setStream: Dispatch<SetStateAction<MediaStream | null>>;
  streamRef: MutableRefObject<MediaStream | null>;
};

export default function useScreenShare({ addLog, callGuest, connRef, peerRef, setStream, streamRef }: UseScreenShareParams) {
  const [hasAudioTrack, setHasAudioTrack] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const stopShare = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    streamRef.current = null;
    setHasAudioTrack(false);
    setIsAudioMuted(false);
  }, [setStream, streamRef]);

  const startShare = useCallback(async () => {
    try {
      addLog('Requesting display media (video + audio)...');
      const s = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as CursorMediaConstraints,
        audio: true,
      });
      addLog(`Got display media: ${s.id}`);
      const audioTracks = s.getAudioTracks();
      const hasAudio = audioTracks.length > 0;
      setHasAudioTrack(hasAudio);
      setIsAudioMuted(false);

      if (hasAudio) {
        addLog(`Captured audio track: ${audioTracks[0].label || 'unnamed'}`);
        audioTracks.forEach(track => {
          track.enabled = true;
          track.onended = () => {
            addLog('Audio track ended');
            setHasAudioTrack(false);
            setIsAudioMuted(false);
          };
        });
      } else {
        addLog('No audio track available from the captured source');
      }

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

  const toggleAudioMute = useCallback(() => {
    const currentStream = streamRef.current;
    if (!currentStream) {
      addLog('No active stream to toggle audio');
      return;
    }

    const audioTracks = currentStream.getAudioTracks();
    if (!audioTracks.length) {
      addLog('No audio track to mute/unmute');
      return;
    }

    setIsAudioMuted(prev => {
      const next = !prev;
      audioTracks.forEach(track => {
        track.enabled = !next;
      });
      addLog(next ? 'Audio muted' : 'Audio unmuted');
      return next;
    });
  }, [addLog, streamRef]);

  return { startShare, stopShare, toggleAudioMute, isAudioMuted, hasAudioTrack };
}
