import React, { useState } from 'react';
import useVideoControls from '../../hooks/useVideoControls';
import VideoControls from './VideoControls';
import PiPBanner from './PiPBanner';

type RemoteCursor = { x: number; y: number; visible: boolean; color: string };

type VideoPlayerProps = {
  stream: MediaStream | null;
  isHost: boolean;
  remoteCursor: RemoteCursor;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => void;
  onLog?: (message: string) => void;
};

function VideoPlayer({
  stream,
  isHost,
  remoteCursor,
  onMouseMove,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onLog,
}: VideoPlayerProps) {
  const { videoRef, containerRef, isPiP, isFullscreen, toggleFullscreen, togglePiP, manualPlay } = useVideoControls(
    stream,
    onLog
  );
  const [scaleMode, setScaleMode] = useState<'contain' | 'cover'>('contain');

  const toggleScaleMode = () => {
    setScaleMode(prev => (prev === 'contain' ? 'cover' : 'contain'));
  };

  return (
    <div
      className="video-container"
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isHost}
            style={{
              width: '100%',
              height: '100%',
              objectFit: scaleMode,
              cursor: 'default',
            }}
          />
          <VideoControls
            isHost={isHost}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            togglePiP={togglePiP}
            manualPlay={manualPlay}
            scaleMode={scaleMode}
            toggleScaleMode={toggleScaleMode}
          />
          {isPiP && <PiPBanner />}
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
            top: `${remoteCursor.y * 100}%`,
            backgroundColor: remoteCursor.color,
            boxShadow: `0 0 10px ${remoteCursor.color}`,
          }}
        />
      )}
    </div>
  );
}

export default VideoPlayer;
