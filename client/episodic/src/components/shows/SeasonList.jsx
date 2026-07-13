import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import SeasonReview from './SeasonReview';

function SeasonList({ show, tracking, onChange, user, reviews, onReviewChange }) {
    const [episodesBySeason, setEpisodesBySeason] = useState({});
    const [loadingSeason, setLoadingSeason] = useState(null);

    const watchedSet = new Set(
        (tracking?.watchedEpisodes || []).map((w) => `${w.season}-${w.episode}`)
    );

    async function toggleExpand(seasonNumber) {
        if (episodesBySeason[seasonNumber]) {
            setEpisodesBySeason((prev) => {
                const next = { ...prev };
                delete next[seasonNumber];
                return next;
            });
            return;
        }
        setLoadingSeason(seasonNumber);
        try {
            const data = await api.getSeason(show.id, seasonNumber);
            setEpisodesBySeason((prev) => ({ ...prev, [seasonNumber]: data.episodes || [] }));
        } finally {
            setLoadingSeason(null);
        }
    }

    async function toggleEpisode(seasonNumber, episodeNumber, watched) {
        const updated = await api.setEpisodesWatched(show.id, {
            episodes: [{ season: seasonNumber, episode: episodeNumber }],
            watched,
            title: show.name,
            posterPath: show.poster_path,
            totalEpisodes: show.number_of_episodes,
        });
        onChange(updated);
    }

    async function toggleSeason(season, watched) {
        const episodes = episodesBySeason[season.season_number]
            ? episodesBySeason[season.season_number].map((e) => ({
                season: season.season_number,
                episode: e.episode_number,
            }))
            : Array.from({ length: season.episode_count }, (_, i) => ({
                season: season.season_number,
                episode: i + 1,
            }));

        const updated = await api.setEpisodesWatched(show.id, {
            episodes,
            watched,
            title: show.name,
            posterPath: show.poster_path,
            totalEpisodes: show.number_of_episodes,
        });
        onChange(updated);
    }

    const seasons = (show.seasons || []).filter((s) => s.episode_count > 0);
    const watchedCount = tracking?.watchedEpisodes?.length || 0;

    return (
        <div className="season-list">
            {show.number_of_episodes ? (
                <p className="episode-progress">
                    {watchedCount} / {show.number_of_episodes} episodes watched
                </p>
            ) : null}

            {seasons.map((season) => {
                const seasonWatchedCount = (tracking?.watchedEpisodes || []).filter(
                    (w) => w.season === season.season_number
                ).length;
                const isFullyWatched = seasonWatchedCount >= season.episode_count;
                const episodes = episodesBySeason[season.season_number];

                return (
                    <div key={season.id} className="season-item">
                        <div className="season-header">
                            <button className="season-toggle" onClick={() => toggleExpand(season.season_number)}>
                                {episodes ? '▾' : '▸'} {season.name}
                            </button>
                            <span className="season-progress">
                                {seasonWatchedCount}/{season.episode_count}
                            </span>
                            {user && (
                                <button onClick={() => toggleSeason(season, !isFullyWatched)}>
                                    {isFullyWatched ? 'Mark unwatched' : 'Mark watched'}
                                </button>
                            )}
                        </div>

                        {loadingSeason === season.season_number && <p>Loading episodes...</p>}

                        {episodes && (
                            <ul className="episode-list">
                                {episodes.map((ep) => {
                                    const isWatched = watchedSet.has(`${season.season_number}-${ep.episode_number}`);
                                    return (
                                        <li key={ep.id}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={isWatched}
                                                    disabled={!user}
                                                    onChange={() =>
                                                        toggleEpisode(season.season_number, ep.episode_number, !isWatched)
                                                    }
                                                />
                                                {ep.episode_number}. {ep.name}
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {episodes && (
                            <div className="season-review-section">
                                {user ? (
                                    <SeasonReview
                                        show={show}
                                        season={season}
                                        review={reviews.find((r) => r.season === season.season_number)}
                                        onChange={(updated) => onReviewChange(season.season_number, updated)}
                                    />
                                ) : (
                                    <p><Link to="/login">Sign in</Link> to review this season.</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default SeasonList;
