import { useCallback } from 'react';
import Peer from 'peerjs';

export default function useGuestPeer({
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
}) {
  return useCallback(() => {
    const guest = new Peer();
    peerRef.current = guest;

    guest.on('open', () => {
      addLog('Opened as Guest');
      setIsHost(false);
      setStatus('Connecting to host...');

      const conn = guest.connect(roomId);
      connRef.current = conn;

      conn.on('open', () => {
        addLog('Connected to Host. Sending handshake...');
        conn.send({ type: 'auth', password: password || '' });
      });

      conn.on('data', data => {
        if (data.type === 'auth-success') {
          addLog('Authentication successful');
          setIsAuthenticated(true);
          setStatus('Connected to Host');
          setShowAuthModal(false);
        } else if (data.type === 'auth-fail') {
          addLog('Authentication failed', 'error');
          setStatus('Authentication Failed');
          setIsAuthenticated(false);
          setShowAuthModal(true);
          conn.close();
        }
      });

      conn.on('close', () => {
        if (authRef.current) {
          setStatus('Connection closed');
        }
        connRef.current = null;
      });

      conn.on('error', err => {
        addLog(`Connection error: ${err}`, 'error');
        setStatus('Connection Error');
      });
    });

    guest.on('call', call => {
      addLog(`Guest received call from: ${call.peer}`);
      call.answer();
      call.on('stream', remoteStream => {
        addLog(`Guest received stream: ${remoteStream.id}`);
        setStream(remoteStream);
        streamRef.current = remoteStream;
      });
      call.on('error', err => addLog(`Call error: ${err}`, 'error'));
    });

    guest.on('error', err => {
      addLog(`Guest error: ${err}`, 'error');
      setStatus('Error: ' + err.type);
    });
  }, [
    addLog,
    password,
    roomId,
    setIsHost,
    setStatus,
    setIsAuthenticated,
    setShowAuthModal,
    setStream,
    streamRef,
    connRef,
    peerRef,
    authRef,
  ]);
}
