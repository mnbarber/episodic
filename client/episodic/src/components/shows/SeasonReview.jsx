import { useEffect, useState } from 'react';
import { api } from '../../services/api';

function SeasonReview({ show, season, review, onChange }) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(review?.text || '');
    const [rating, setRating] = useState(review?.rating || 0);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setText(review?.text || '');
        setRating(review?.rating || 0);
    }, [review]);

    async function save() {
        if (!text.trim()) return;
        setSaving(true);
        try {
            const updated = await api.setReview(show.id, season.season_number, {
                text: text.trim(),
                rating: rating || undefined,
                seasonName: season.name,
                showTitle: show.name,
                posterPath: show.poster_path,
            });
            onChange(updated);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    }

    async function remove() {
        setSaving(true);
        try {
            await api.removeReview(show.id, season.season_number);
            onChange(null);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    }

    if (!editing && review) {
        return (
            <div className="season-review">
                {review.rating > 0 && <p className="rating">{'★'.repeat(review.rating)}</p>}
                <p className="review-text">{review.text}</p>
                <div className="season-review-actions">
                    <button onClick={() => setEditing(true)}>Edit review</button>
                    <button onClick={remove} disabled={saving}>Delete</button>
                </div>
            </div>
        );
    }

    if (!editing) {
        return (
            <button className="write-review" onClick={() => setEditing(true)}>
                Write a review
            </button>
        );
    }

    return (
        <div className="season-review-form">
            <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        className={rating >= n ? 'star filled' : 'star'}
                        onClick={() => setRating(n)}
                        aria-label={`Rate ${n} stars`}
                    >
                        ★
                    </button>
                ))}
            </div>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Review ${season.name}...`}
                rows={4}
            />
            <div className="season-review-actions">
                <button onClick={save} disabled={saving || !text.trim()}>Save</button>
                <button
                    onClick={() => {
                        setEditing(false);
                        setText(review?.text || '');
                        setRating(review?.rating || 0);
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default SeasonReview;
