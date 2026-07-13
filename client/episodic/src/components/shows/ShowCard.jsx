import { Link } from 'react-router-dom';
import { TMDB_IMAGE_BASE } from '../../services/api';

function ShowCard({ show }) {
    return (
        <Link to={`/show/${show.id}`} className="show-card">
            {show.poster_path ? (
                <img src={`${TMDB_IMAGE_BASE}${show.poster_path}`} alt={show.name} />
            ) : (
                <div className="show-card-placeholder">{show.name}</div>
            )}
            <p>{show.name}</p>
        </Link>
    );
}

export default ShowCard;
