import React from 'react';
import { Share, Volume2, VolumeX } from 'lucide-react';

function HostControls({ stream, onStart, onStop, onToggleAudio, isAudioMuted, hasAudioTrack }) {
  return (
    <div className="controls" style={{ flexWrap: 'wrap' }}>
      {!stream ? (
        <button onClick={onStart} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Share size={20} /> Start Screen Share
        </button>
      ) : (
        <>
          <button onClick={onStop} style={{ backgroundColor: '#ef4444' }}>
            Stop Sharing
          </button>
          <button
            onClick={onToggleAudio}
            disabled={!hasAudioTrack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: isAudioMuted ? '#f97316' : undefined,
              opacity: hasAudioTrack ? 1 : 0.6,
              cursor: hasAudioTrack ? 'pointer' : 'not-allowed',
            }}
            title={hasAudioTrack ? 'Toggle sending audio to the guest' : 'Audio track not available for this capture'}
          >
            {isAudioMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            {isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          </button>
        </>
      )}
    </div>
  );
}

export default HostControls;
