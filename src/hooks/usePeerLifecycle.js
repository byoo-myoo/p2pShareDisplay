import { useEffect } from 'react';
import Peer from 'peerjs';

const peerCache = new Map();

export default function usePeerLifecycle({
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
}) {
  useEffect(() => {
    let peer = peerCache.get(roomId);

    if (peer && !peer.destroyed) {
      addLog(`Reusing cached peer for: ${roomId}`);
      if (peer._cleanupTimer) {
        clearTimeout(peer._cleanupTimer);
        peer._cleanupTimer = null;
      }
    } else {
      addLog(`Initializing new Peer with ID: ${roomId}`);
      peer = new Peer(roomId, { debug: 2 });
      peerCache.set(roomId, peer);
    }

    peerRef.current = peer;

    const handleOpen = id => {
      addLog(`Peer Opened: ${id}`);
      if (id === roomId) {
        setIsHost(true);
        setStatus('Waiting for guest...');
        if (password) addLog('Room is password protected');
      } else {
        setIsHost(false);
      }
    };

    const handleConnection = conn => {
      addLog(`Received connection from: ${conn.peer}`);
      connRef.current = conn;

      const handleData = data => {
        if (data.type === 'auth') {
          if (data.password === password) {
            addLog('Password verified. Access granted.');
            conn.send({ type: 'auth-success' });
            setStatus('Guest connected');
            if (streamRef.current) {
              callGuest(peer, conn.peer, streamRef.current);
            }
          } else {
            addLog('Invalid password attempt.', 'error');
            conn.send({ type: 'auth-fail' });
            setTimeout(() => conn.close(), 500);
          }
        } else if (data.type === 'cursor') {
          setRemoteCursor({
            x: data.x,
            y: data.y,
            visible: data.visible,
            color: data.color || '#ef4444',
          });
        }
      };

      if (password) {
        setStatus('Guest connecting (verifying password)...');
        conn.on('data', handleData);
      } else {
        conn.on('open', () => {
          setStatus('Guest connected');
          conn.send({ type: 'auth-success' });
          if (streamRef.current) {
            callGuest(peer, conn.peer, streamRef.current);
          }
          conn.on('data', data => {
            if (data.type === 'cursor') {
              setRemoteCursor({
                x: data.x,
                y: data.y,
                visible: data.visible,
                color: data.color || '#ef4444',
              });
            }
          });
        });
      }
    };

    const handleError = err => {
      addLog(`Peer error: ${err.type}`, 'error');
      if (err.type === 'unavailable-id') {
        addLog('ID taken. Checking if we should be Guest...');
        peer.destroy();
        peerCache.delete(roomId);
        initializeGuest();
      } else {
        setStatus('Error: ' + err.type);
      }
    };

    peer.off('open');
    peer.off('connection');
    peer.off('error');

    peer.on('open', handleOpen);
    peer.on('connection', handleConnection);
    peer.on('error', handleError);

    if (peer.open) handleOpen(peer.id);

    return () => {
      addLog('Cleaning up Peer effect');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        const p = peerRef.current;
        p._cleanupTimer = setTimeout(() => {
          addLog('Destroying peer after timeout');
          p.destroy();
          peerCache.delete(roomId);
        }, 1000);
      }
    };
  }, [
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
  ]);
}
