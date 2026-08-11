import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TMDB_IMAGE_BASE } from '../../services/api';

const STATUS_LABELS = {
    watching: 'Watching',
    want_to_watch: 'Want to watch',
    completed: 'Completed',
    dropped: 'Dropped',
};

// furthest episode the user has marked watched, e.g. { season: 2, episode: 5 }
function furthestEpisode(entry) {
    return (entry.watchedEpisodes || []).reduce((furthest, ep) => {
        if (!furthest) return ep;
        if (ep.season !== furthest.season) return ep.season > furthest.season ? ep : furthest;
        return ep.episode > furthest.episode ? ep : furthest;
    }, null);
}

function TrackedShowCard({ entry, showProgress }) {
    const progress = showProgress ? furthestEpisode(entry) : null;

    return (
        <Link to={`/show/${entry.tmdbId}`} className="show-card">
            {entry.posterPath ? (
                <img src={`${TMDB_IMAGE_BASE}${entry.posterPath}`} alt={entry.title} />
            ) : (
                <div className="show-card-placeholder">{entry.title}</div>
            )}
            {progress && (
                <p className="show-card-progress">
                    S{progress.season} E{progress.episode}
                </p>
            )}
            <p>{entry.title}</p>
            {entry.rating && <p className="rating">{'★'.repeat(entry.rating)}</p>}
        </Link>
    );
}

// single horizontal row instead of a wrapping grid: the arrows page through the
// extra shows rather than pushing them onto another row
function WatchingRow({ label, entries }) {
    const rowRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    function updateArrows() {
        const el = rowRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }

    useEffect(updateArrows, [entries]);

    useEffect(() => {
        window.addEventListener('resize', updateArrows);
        return () => window.removeEventListener('resize', updateArrows);
    }, []);

    function scrollRow(direction) {
        const el = rowRef.current;
        if (!el) return;
        el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
    }

    return (
        <section>
            <div className="show-row-header">
                <h2>{label}</h2>
                <div className="show-row-arrows">
                    <button
                        type="button"
                        onClick={() => scrollRow(-1)}
                        disabled={!canScrollLeft}
                        aria-label="Show previous shows"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollRow(1)}
                        disabled={!canScrollRight}
                        aria-label="Show more shows"
                    >
                        ›
                    </button>
                </div>
            </div>
            <div className="show-row" ref={rowRef} onScroll={updateArrows}>
                {entries.map((entry) => (
                    <TrackedShowCard key={entry.tmdbId} entry={entry} showProgress />
                ))}
            </div>
        </section>
    );
}

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
            {Object.entries(STATUS_LABELS).map(([status, label]) => {
                const group = grouped[status];
                if (!group) return null;

                if (status === 'watching') {
                    return <WatchingRow key={status} label={label} entries={group} />;
                }

                return (
                    <section key={status}>
                        <h2>{label}</h2>
                        <div className="show-grid">
                            {group.map((entry) => (
                                <TrackedShowCard key={entry.tmdbId} entry={entry} />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

export default TrackedShowGroups;
