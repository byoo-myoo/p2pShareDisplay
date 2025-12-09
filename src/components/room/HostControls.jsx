import React from 'react';
import { Share } from 'lucide-react';

function HostControls({ stream, onStart, onStop }) {
  return (
    <div className="controls">
      {!stream ? (
        <button onClick={onStart} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Share size={20} /> Start Screen Share
        </button>
      ) : (
        <button onClick={onStop} style={{ backgroundColor: '#ef4444' }}>
          Stop Sharing
        </button>
      )}
    </div>
  );
}

export default HostControls;
