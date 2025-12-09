import React, { useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Terminal } from 'lucide-react';
import RoomHeader from '../components/room/RoomHeader';
import AuthModal from '../components/room/AuthModal';
import QRModal from '../components/room/QRModal';
import HostControls from '../components/room/HostControls';
import GuestControls from '../components/room/GuestControls';
import VideoPlayer from '../components/room/VideoPlayer';
import DebugLogs from '../components/room/DebugLogs';
import useRoomConnection from '../hooks/useRoomConnection';

function Room() {
  const { roomId } = useParams();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const {
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
  } = useRoomConnection({ roomId, initialPassword: location.state?.password });

  const roomUrl = useMemo(() => {
    let hostname = window.location.hostname;
    if ((hostname === 'localhost' || hostname === '127.0.1.1') && typeof __LOCAL_IP__ !== 'undefined') {
      hostname = __LOCAL_IP__;
    }
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//${hostname}${port}${window.location.pathname}#/room/${roomId}`;
  }, [roomId]);

  const copyUrl = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="room">
      <RoomHeader
        roomId={roomId}
        status={status}
        onCopy={copyUrl}
        copied={copied}
        onShowQRCode={() => setShowQRCode(true)}
      />

      <AuthModal open={showAuthModal} authInput={authInput} onChange={setAuthInput} onSubmit={handleAuthSubmit} />

      <QRModal open={showQRCode} roomUrl={roomUrl} onClose={() => setShowQRCode(false)} />

      {isHost === true && <HostControls stream={stream} onStart={startShare} onStop={stopShare} />}

      {!isHost && isHost !== null && (
        <GuestControls
          cursorMode={cursorMode}
          setCursorMode={setCursorMode}
          cursorColor={cursorColor}
          setCursorColor={setCursorColor}
        />
      )}

      <VideoPlayer
        stream={stream}
        isHost={Boolean(isHost)}
        remoteCursor={remoteCursor}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onLog={addLog}
      />

      <button
        className="icon-btn"
        onClick={() => setShowLogs(!showLogs)}
        title="Toggle Logs"
        style={{
          position: 'fixed',
          bottom: '1rem',
          left: '1rem',
          zIndex: 1001,
          backgroundColor: 'var(--card-bg)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        }}
      >
        <Terminal size={20} />
      </button>

      <DebugLogs open={showLogs} logs={logs} onClear={clearLogs} />
    </div>
  );
}

export default Room;
