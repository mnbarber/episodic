import { Link } from 'react-router-dom';
import { TMDB_IMAGE_BASE } from '../../services/api';

function ReviewCard({ review, showAuthor }) {
    return (
        <div className="review-card">
            {showAuthor && review.user && (
                <Link to={`/u/${review.user.username}`} className="review-author">
                    {review.user.name || review.user.username}
                </Link>
            )}
            <div className="review-card-body">
                <Link to={`/show/${review.tmdbId}`}>
                    {review.posterPath ? (
                        <img src={`${TMDB_IMAGE_BASE}${review.posterPath}`} alt={review.showTitle} />
                    ) : (
                        <div className="show-card-placeholder">{review.showTitle}</div>
                    )}
                </Link>
                <div>
                    <Link to={`/show/${review.tmdbId}`} className="review-show-title">
                        {review.showTitle} — {review.seasonName || `Season ${review.season}`}
                    </Link>
                    {review.rating > 0 && <p className="rating">{'★'.repeat(review.rating)}</p>}
                    <p className="review-text">{review.text}</p>
                    <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}

export default ReviewCard;
