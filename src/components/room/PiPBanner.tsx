import React from 'react';

function PiPBanner() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '8px',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <p style={{ margin: 0, fontWeight: 'bold' }}>Playing in Picture-in-Picture</p>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#fbbf24' }}>
        ⚠ Remote cursor is not visible in PiP mode.
      </p>
    </div>
  );
}

export default PiPBanner;
