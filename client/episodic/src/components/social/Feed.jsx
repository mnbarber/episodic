import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import ReviewCard from './ReviewCard';

function Feed() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getFeed()
            .then(setReviews)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>;

    if (reviews.length === 0) {
        return <p>No activity yet. Follow some <Link to="/people">people</Link> to see their reviews here.</p>;
    }

    return (
        <div className="feed-page">
            <h1>Feed</h1>
            <div className="review-list">
                {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} showAuthor />
                ))}
            </div>
        </div>
    );
}

export default Feed;
