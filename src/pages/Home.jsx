import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Users } from 'lucide-react';

function Home() {
    const navigate = useNavigate();
    const [joinId, setJoinId] = useState('');

    const startSharing = () => {
        // Generate a random 6-character ID
        const roomId = Math.random().toString(36).substring(2, 8);
        navigate(`/room/${roomId}`);
    };

    const joinRoom = (e) => {
        e.preventDefault();
        if (joinId.trim()) {
            navigate(`/room/${joinId.trim()}`);
        }
    };

    return (
        <div className="home" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', marginTop: '2rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ marginTop: 0 }}>Start Sharing</h2>
                <p style={{ color: 'var(--text-color)', opacity: 0.8 }}>Create a new room and share your screen.</p>
                <button onClick={startSharing} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', width: '100%' }}>
                    <Monitor size={20} /> Create Room
                </button>
            </div>

            <div style={{ fontWeight: 'bold', opacity: 0.5 }}>OR</div>

            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ marginTop: 0 }}>Join Room</h2>
                <p style={{ color: 'var(--text-color)', opacity: 0.8 }}>Enter a Room ID to watch a stream.</p>
                <form onSubmit={joinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Room ID"
                        value={joinId}
                        onChange={(e) => setJoinId(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                    <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <Users size={20} /> Join Room
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Home;
