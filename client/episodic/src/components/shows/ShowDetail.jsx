import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, TMDB_IMAGE_BASE } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TrackingControls from './TrackingControls';
import SeasonList from './SeasonList';

function ShowDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [show, setShow] = useState(null);
    const [tracking, setTracking] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        api.getShow(id)
            .then(setShow)
            .catch(() => setError('Could not load this show.'))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!user) {
            setTracking(null);
            setReviews([]);
            return;
        }
        api.getTrackingForShow(id).then(setTracking);
        api.getReviewsForShow(id).then(setReviews);
    }, [id, user]);

    function handleReviewChange(seasonNumber, updated) {
        setReviews((prev) => {
            const rest = prev.filter((r) => r.season !== seasonNumber);
            return updated ? [...rest, updated] : rest;
        });
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!show) return null;

    return (
        <div className="show-detail">
            <div className="show-detail-header">
                {show.poster_path && (
                    <img src={`${TMDB_IMAGE_BASE}${show.poster_path}`} alt={show.name} />
                )}
                <div>
                    <h1>{show.name}</h1>
                    <p className="show-meta">
                        {show.first_air_date?.slice(0, 4)}
                        {show.number_of_seasons ? ` · ${show.number_of_seasons} season${show.number_of_seasons > 1 ? 's' : ''}` : ''}
                    </p>
                    <p>{show.overview}</p>
                    <TrackingControls show={show} tracking={tracking} onChange={setTracking} />
                </div>
            </div>

            <SeasonList
                show={show}
                tracking={tracking}
                onChange={setTracking}
                user={user}
                reviews={reviews}
                onReviewChange={handleReviewChange}
            />
        </div>
    );
}

export default ShowDetail;
