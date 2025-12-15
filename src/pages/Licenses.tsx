import React, { useState } from 'react';

const LICENSE_PAGE_URL = `${import.meta.env.BASE_URL}licenses/index.html`;

function Licenses() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="card license-card">
        <h2 style={{ marginTop: 0 }}>Licenses</h2>
        <p role="alert">Failed to load license page.</p>
        <p>
          You can also view the raw files under <code>docs/licenses/</code> in the repository or
          access{' '}
          <a href={LICENSE_PAGE_URL} target="_blank" rel="noreferrer">
            the standalone license page
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="card license-card">
      <h2 style={{ marginTop: 0 }}>Licenses</h2>
      <iframe
        title="Full license information"
        className="license-frame"
        src={LICENSE_PAGE_URL}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default Licenses;
