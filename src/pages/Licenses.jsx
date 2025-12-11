import React, { useEffect, useState } from 'react';

function Licenses() {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}third-party-licenses.md`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load licenses (${res.status})`);
        return res.text();
      })
      .then(text => setContent(text))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card license-card">
      <h2 style={{ marginTop: 0 }}>Third-party licenses</h2>
      {loading && <div>Loading licenses...</div>}
      {error && (
        <div style={{ color: '#ef4444', marginTop: '0.5rem' }}>
          Failed to load license file: {error}
        </div>
      )}
      {!loading && !error && (
        <pre className="license-content" aria-label="Third-party license text">
          {content}
        </pre>
      )}
    </div>
  );
}

export default Licenses;
