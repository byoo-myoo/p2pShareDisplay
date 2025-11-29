import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Peer from 'peerjs';
import { Share, Copy, Check, Play, Terminal } from 'lucide-react';

const peerCache = new Map();

function Room() {
    const { roomId } = useParams();
    const [isHost, setIsHost] = useState(null);
    const [status, setStatus] = useState('Initializing...');
    const [stream, setStream] = useState(null);
    const [remoteCursor, setRemoteCursor] = useState({ x: 0, y: 0, visible: false });
    const [copied, setCopied] = useState(false);
    const [logs, setLogs] = useState([]);
    const [showLogs, setShowLogs] = useState(false);

    const videoRef = useRef(null);
    const connRef = useRef(null);
    const peerRef = useRef(null);
    const streamRef = useRef(null);

    const addLog = (msg, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${msg}`;
        console.log(logEntry); // Keep console log
        setLogs(prev => [...prev.slice(-19), { msg: logEntry, type }]); // Keep last 20 logs
    };

    // Effect to handle video stream assignment
    useEffect(() => {
        if (videoRef.current && stream) {
            addLog('Assigning stream to video element via effect');
            videoRef.current.srcObject = stream;
            videoRef.current.play()
                .then(() => addLog('Video playing successfully'))
                .catch(e => addLog(`Error playing video: ${e.message}`, 'error'));
        }
    }, [stream]);

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
            // Try to be Host first
            peer = new Peer(roomId, { debug: 2 });
            peerCache.set(roomId, peer);
        }

        peerRef.current = peer;

        // Define handlers
        const handleOpen = (id) => {
            addLog(`Peer Opened: ${id}`);
            if (id === roomId) {
                setIsHost(true);
                setStatus('Waiting for guest...');
            } else {
                // If ID is not roomId, we are guest (this path might not be hit if we force roomId, but for safety)
                setIsHost(false);
            }
        };

        const handleConnection = (conn) => {
            addLog(`Received connection from: ${conn.peer}`);
            connRef.current = conn;
            setStatus('Guest connected');
            setupDataConnection(conn);
            if (streamRef.current) {
                addLog('Stream already active, calling guest...');
                callGuest(peer, conn.peer, streamRef.current);
            }
        };

        const handleError = (err) => {
            addLog(`Peer error: ${err.type}`, 'error');
            if (err.type === 'unavailable-id') {
                addLog('ID taken. Checking if we should be Guest...');
                // If we tried to be host (roomId) and failed, it means someone else is host.
                // BUT, if we are reusing a cached peer, we shouldn't get this error for the same peer.
                // This error comes from a NEW peer.

                // If we are here, it means we failed to claim roomId.
                // We should destroy this failed peer and try to join as guest.
                peer.destroy();
                peerCache.delete(roomId);
                initializeGuest();
            } else {
                setStatus('Error: ' + err.type);
            }
        };

        // Attach listeners
        peer.off('open');
        peer.off('connection');
        peer.off('error');
        peer.off('call');

        peer.on('open', handleOpen);
        peer.on('connection', handleConnection);
        peer.on('error', handleError);

        // If peer is already open (from cache), trigger handler manually
        if (peer.open) {
            handleOpen(peer.id);
        }

        return () => {
            addLog('Cleaning up Peer effect');
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            // Schedule cleanup
            if (peerRef.current) {
                const p = peerRef.current;
                p._cleanupTimer = setTimeout(() => {
                    addLog('Destroying peer after timeout');
                    p.destroy();
                    peerCache.delete(roomId);
                }, 1000); // 1 second grace period for Strict Mode
            }
        };
    }, [roomId]);

    const initializeGuest = () => {
        const guest = new Peer();
        peerRef.current = guest;

        guest.on('open', () => {
            addLog('Opened as Guest');
            setIsHost(false);
            setStatus('Connecting to host...');

            const conn = guest.connect(roomId);
            connRef.current = conn;

            conn.on('open', () => {
                addLog('Connected to Host');
                setStatus('Connected to Host');
                setupDataConnection(conn);
            });

            conn.on('error', (err) => {
                addLog(`Connection error: ${err}`, 'error');
                setStatus('Connection Error');
            });
        });

        guest.on('call', (call) => {
            addLog(`Guest received call from: ${call.peer}`);
            call.answer();
            call.on('stream', (remoteStream) => {
                addLog(`Guest received stream: ${remoteStream.id}`);
                addLog(`Tracks: ${remoteStream.getTracks().length}`);
                setStream(remoteStream);
            });
            call.on('error', (err) => addLog(`Call error: ${err}`, 'error'));
        });

        guest.on('error', (err) => {
            addLog(`Guest error: ${err}`, 'error');
            setStatus('Error: ' + err.type);
        });
    };

    const setupDataConnection = (conn) => {
        conn.on('data', (data) => {
            if (data.type === 'cursor') {
                setRemoteCursor({ x: data.x, y: data.y, visible: true });
            }
        });

        conn.on('close', () => {
            setStatus('Connection closed');
            setRemoteCursor(prev => ({ ...prev, visible: false }));
            connRef.current = null;
        });
    };

    const callGuest = (peer, guestId, stream) => {
        addLog(`Calling guest: ${guestId} with stream: ${stream.id}`);
        const call = peer.call(guestId, stream);
        call.on('error', (err) => addLog(`Call error (Host side): ${err}`, 'error'));
    };

    const startShare = async () => {
        try {
            addLog('Requesting display media...');
            const s = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" },
                audio: false
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

            s.getVideoTracks()[0].onended = () => {
                addLog('Screen share stopped by user');
                stopShare();
            };
        } catch (err) {
            addLog(`Error sharing screen: ${err}`, 'error');
        }
    };

    const stopShare = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
    };

    const handleMouseMove = (e) => {
        if (isHost) return;
        if (!connRef.current) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        connRef.current.send({ type: 'cursor', x, y });
    };

    const handleMouseLeave = () => {
        if (isHost) return;
        // Optional: send cursor hidden
    };

    const copyUrl = () => {
        const url = `${window.location.origin}${window.location.pathname}#/room/${roomId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const manualPlay = () => {
        if (videoRef.current) {
            videoRef.current.play()
                .then(() => addLog('Manual play successful'))
                .catch(e => addLog(`Manual play failed: ${e.message}`, 'error'));
        }
    };

    return (
        <div className="room">
            <div className="header" style={{ justifyContent: 'center', gap: '1rem', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>Room ID: <strong>{roomId}</strong></span>
                    <button className="icon-btn" onClick={copyUrl} title="Copy Link">
                        {copied ? <Check size={20} color="green" /> : <Copy size={20} />}
                    </button>
                    <button className="icon-btn" onClick={() => setShowLogs(!showLogs)} title="Toggle Logs">
                        <Terminal size={20} />
                    </button>
                </div>
                <div className="status-badge" style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    backgroundColor: 'var(--secondary-bg)',
                    fontSize: '0.875rem'
                }}>
                    {status}
                </div>
            </div>

            {isHost === true && (
                <div className="controls">
                    {!stream ? (
                        <button onClick={startShare} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Share size={20} /> Start Screen Share
                        </button>
                    ) : (
                        <button onClick={stopShare} style={{ backgroundColor: '#ef4444' }}>
                            Stop Sharing
                        </button>
                    )}
                </div>
            )}

            <div
                className="video-container"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {stream ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted={isHost} // Host mutes their own preview
                            style={{ width: '100%', cursor: 'default' }}
                        />
                        {!isHost && (
                            <button
                                onClick={manualPlay}
                                style={{
                                    position: 'absolute',
                                    bottom: '1rem',
                                    right: '1rem',
                                    zIndex: 10,
                                    padding: '0.5rem',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                                title="Force Play Video"
                            >
                                <Play size={16} color="white" />
                            </button>
                        )}
                    </>
                ) : (
                    <div style={{ padding: '4rem', color: '#666' }}>
                        {isHost ? 'Click Start to share your screen' : 'Waiting for host to share screen...'}
                    </div>
                )}

                {isHost && remoteCursor.visible && (
                    <div
                        className="remote-cursor"
                        style={{
                            left: `${remoteCursor.x * 100}%`,
                            top: `${remoteCursor.y * 100}%`
                        }}
                    />
                )}
            </div>

            {showLogs && (
                <div className="debug-logs" style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '200px',
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    color: '#0f0',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    overflowY: 'auto',
                    padding: '1rem',
                    zIndex: 1000,
                    borderTop: '1px solid #333'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong>Debug Logs</strong>
                        <button onClick={() => setLogs([])} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>Clear</button>
                    </div>
                    {logs.map((log, i) => (
                        <div key={i} style={{ color: log.type === 'error' ? '#ff4444' : '#0f0' }}>
                            {log.msg}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Room;
