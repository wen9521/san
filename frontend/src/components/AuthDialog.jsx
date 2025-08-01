import React from 'react';

// Placeholder component to avoid build errors
export default function AuthDialog({ open, onClose }) {
  if (!open) {
    return null;
  }
  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', background: 'white', zIndex: 1000 }}>
      <h2>Authentication</h2>
      <p>Auth dialog placeholder</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
