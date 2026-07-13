import { Link } from 'react-router-dom';
import { TMDB_IMAGE_BASE } from '../../services/api';

function ListCard({ list, hideAuthor }) {
    return (
        <Link to={`/lists/${list._id}`} className="list-card">
            <div className="list-card-posters">
                {list.shows.slice(0, 5).map((show) =>
                    show.posterPath ? (
                        <img key={show.tmdbId} src={`${TMDB_IMAGE_BASE}${show.posterPath}`} alt="" />
                    ) : (
                        <div key={show.tmdbId} className="show-card-placeholder" />
                    )
                )}
                {list.shows.length === 0 && <p className="list-card-empty">No shows yet</p>}
            </div>
            <h3>{list.title}</h3>
            <p className="list-card-meta">
                {list.shows.length} show{list.shows.length !== 1 ? 's' : ''}
                {!hideAuthor && list.user && <> · by {list.user.name || list.user.username}</>}
            </p>
        </Link>
    );
}

export default ListCard;
