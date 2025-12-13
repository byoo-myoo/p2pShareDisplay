import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import type Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import useLogs from './useLogs';
import useGuestPeer from './useGuestPeer';
import usePeerLifecycle from './usePeerLifecycle';
import useCursorSync, { type CursorMode } from './useCursorSync';
import useScreenShare from './useScreenShare';

type UseRoomConnectionParams = {
  roomId: string;
  initialPassword?: string;
};

type CursorState = { x: number; y: number; visible: boolean; color: string };

export default function useRoomConnection({ roomId, initialPassword }: UseRoomConnectionParams) {
  const [isHost, setIsHost] = useState<boolean | null>(null);
  const [status, setStatus] = useState('Initializing...');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteCursor, setRemoteCursor] = useState<CursorState>({
    x: 0,
    y: 0,
    visible: false,
    color: '#ef4444',
  });
  const [password, setPassword] = useState(initialPassword || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInput, setAuthInput] = useState(initialPassword || '');
  const [cursorMode, setCursorMode] = useState<CursorMode>('always');
  const [cursorColor, setCursorColor] = useState('#ef4444');

  const connRef = useRef<DataConnection | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const authRef: MutableRefObject<boolean> = useRef(false);

  useEffect(() => {
    authRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const { logs, addLog, clearLogs } = useLogs();

  const callGuest = useCallback(
    (peer: Peer | null, guestId: string, mediaStream: MediaStream) => {
      if (!peer || !guestId || !mediaStream) return;
      addLog(`Calling guest: ${guestId} with stream: ${mediaStream.id}`);
      const call = peer.call(guestId, mediaStream);
      call.on('error', err => addLog(`Call error (Host side): ${err}`, 'error'));
    },
    [addLog]
  );

  const initializeGuest = useGuestPeer({
    roomId,
    password,
    addLog,
    setIsHost,
    setStatus,
    setIsAuthenticated,
    setShowAuthModal,
    setStream,
    streamRef,
    connRef,
    peerRef,
    authRef,
  });

  usePeerLifecycle({
    roomId,
    password,
    addLog,
    setIsHost,
    setStatus,
    setRemoteCursor,
    streamRef,
    connRef,
    peerRef,
    callGuest,
    initializeGuest,
  });

  const { startShare, stopShare, toggleAudioMute, isAudioMuted, hasAudioTrack } = useScreenShare({
    addLog,
    callGuest,
    connRef,
    peerRef,
    setStream,
    streamRef,
  });

  const { handleMouseMove, handleMouseDown, handleMouseUp, handleMouseLeave } = useCursorSync({
    isHost,
    cursorMode,
    cursorColor,
    connRef,
  });

  const handleAuthSubmit = useCallback(() => {
    setPassword(authInput);
    setShowAuthModal(false);
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    setTimeout(initializeGuest, 500);
  }, [authInput, initializeGuest]);

  return {
    isHost,
    status,
    stream,
    remoteCursor,
    cursorMode,
    setCursorMode,
    cursorColor,
    setCursorColor,
    startShare,
    stopShare,
    toggleAudioMute,
    isAudioMuted,
    hasAudioTrack,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    showAuthModal,
    authInput,
    setAuthInput,
    handleAuthSubmit,
    logs,
    clearLogs,
    addLog,
  };
}
