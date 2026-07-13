import { Link } from 'react-router-dom';
import { TMDB_IMAGE_BASE } from '../../services/api';

const STATUS_LABELS = {
    want_to_watch: 'Want to watch',
    watching: 'Watching',
    completed: 'Completed',
    dropped: 'Dropped',
};

function TrackedShowGroups({ entries, emptyMessage }) {
    if (entries.length === 0) {
        return <p>{emptyMessage}</p>;
    }

    const grouped = entries.reduce((acc, entry) => {
        (acc[entry.status] ||= []).push(entry);
        return acc;
    }, {});

    return (
        <div className="tracked-show-groups">
            {Object.entries(STATUS_LABELS).map(([status, label]) =>
                grouped[status] ? (
                    <section key={status}>
                        <h2>{label}</h2>
                        <div className="show-grid">
                            {grouped[status].map((entry) => (
                                <Link key={entry.tmdbId} to={`/show/${entry.tmdbId}`} className="show-card">
                                    {entry.posterPath ? (
                                        <img src={`${TMDB_IMAGE_BASE}${entry.posterPath}`} alt={entry.title} />
                                    ) : (
                                        <div className="show-card-placeholder">{entry.title}</div>
                                    )}
                                    <p>{entry.title}</p>
                                    {entry.rating && <p className="rating">{'★'.repeat(entry.rating)}</p>}
                                </Link>
                            ))}
                        </div>
                    </section>
                ) : null
            )}
        </div>
    );
}

export default TrackedShowGroups;
