import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const STATUS_OPTIONS = [
    { value: 'want_to_watch', label: 'Want to watch' },
    { value: 'watching', label: 'Watching' },
    { value: 'completed', label: 'Completed' },
    { value: 'dropped', label: 'Dropped' },
];

function TrackingControls({ show, tracking, onChange }) {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);

    async function updateStatus(status) {
        setSaving(true);
        try {
            const updated = await api.setTracking(show.id, {
                status,
                rating: tracking?.rating,
                title: show.name,
                posterPath: show.poster_path,
            });
            onChange(updated);
        } finally {
            setSaving(false);
        }
    }

    async function updateRating(rating) {
        if (!tracking) return;
        setSaving(true);
        try {
            const updated = await api.setTracking(show.id, {
                status: tracking.status,
                rating,
                title: show.name,
                posterPath: show.poster_path,
            });
            onChange(updated);
        } finally {
            setSaving(false);
        }
    }

    async function removeTracking() {
        setSaving(true);
        try {
            await api.removeTracking(show.id);
            onChange(null);
        } finally {
            setSaving(false);
        }
    }

    if (!user) {
        return <p><Link to="/login">Sign in</Link> to track this show.</p>;
    }

    return (
        <div className="tracking-controls">
            <div className="status-buttons">
                {STATUS_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        disabled={saving}
                        className={tracking?.status === opt.value ? 'active' : ''}
                        onClick={() => updateStatus(opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {tracking && (
                <>
                    <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                disabled={saving}
                                className={tracking.rating >= n ? 'star filled' : 'star'}
                                onClick={() => updateRating(n)}
                                aria-label={`Rate ${n} stars`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <button disabled={saving} onClick={removeTracking} className="remove-tracking">
                        Remove from my shows
                    </button>
                </>
            )}
        </div>
    );
}

export default TrackingControls;
