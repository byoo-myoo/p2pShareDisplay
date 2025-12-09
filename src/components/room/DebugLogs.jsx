import React from 'react';

function DebugLogs({ open, logs, onClear }) {
  if (!open) return null;

  return (
    <div
      className="debug-logs"
      style={{
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
        borderTop: '1px solid #333',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <strong>Debug Logs</strong>
        <button
          onClick={onClear}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0 }}
        >
          Clear
        </button>
      </div>
      {logs.map((log, i) => (
        <div key={i} style={{ color: log.type === 'error' ? '#ff4444' : '#0f0' }}>
          {log.msg}
        </div>
      ))}
    </div>
  );
}

export default DebugLogs;
