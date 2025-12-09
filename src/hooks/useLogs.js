import { useCallback, useState } from 'react';

export default function useLogs() {
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((msg, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${msg}`;
    console.log(entry);
    setLogs(prev => [...prev.slice(-19), { msg: entry, type }]);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  return { logs, addLog, clearLogs };
}
