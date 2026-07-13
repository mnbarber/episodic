import { useState } from 'react';
import { api, TMDB_IMAGE_BASE } from '../../services/api';

function ShowPicker({ value, onChange, max = Infinity, emptyMessage = 'No shows picked yet.' }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const atLimit = value.length >= max;

    async function handleSearch() {
        if (!query.trim()) return;
        setSearching(true);
        try {
            const data = await api.searchShows(query.trim());
            setResults(data.results || []);
        } finally {
            setSearching(false);
        }
    }

    function handleSearchKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    }

    function addShow(show) {
        if (atLimit || value.some((s) => s.tmdbId === show.id)) return;
        onChange([...value, { tmdbId: show.id, title: show.name, posterPath: show.poster_path }]);
    }

    function removeShow(tmdbId) {
        onChange(value.filter((s) => s.tmdbId !== tmdbId));
    }

    function move(index, direction) {
        const next = [...value];
        const target = index + direction;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    }

    return (
        <div className="top-shows-picker">
            <div className="top-shows-selected">
                {value.length === 0 && <p>{emptyMessage}</p>}
                {value.map((show, i) => (
                    <div key={show.tmdbId} className="top-show-item">
                        {show.posterPath ? (
                            <img src={`${TMDB_IMAGE_BASE}${show.posterPath}`} alt={show.title} />
                        ) : (
                            <div className="show-card-placeholder">{show.title}</div>
                        )}
                        <p>{show.title}</p>
                        <div className="top-show-actions">
                            <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                            <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1}>↓</button>
                            <button type="button" onClick={() => removeShow(show.tmdbId)}>Remove</button>
                        </div>
                    </div>
                ))}
            </div>

            {!atLimit && (
                <div className="top-shows-search">
                    <input
                        type="text"
                        placeholder="Search shows to add..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
                    <button type="button" onClick={handleSearch} disabled={searching}>Search</button>
                </div>
            )}

            {results.length > 0 && !atLimit && (
                <div className="top-shows-results">
                    {results.map((show) => (
                        <button
                            type="button"
                            key={show.id}
                            className="top-shows-result"
                            onClick={() => addShow(show)}
                            disabled={value.some((s) => s.tmdbId === show.id)}
                        >
                            {show.poster_path ? (
                                <img src={`${TMDB_IMAGE_BASE}${show.poster_path}`} alt={show.name} />
                            ) : (
                                <div className="show-card-placeholder">{show.name}</div>
                            )}
                            <p>{show.name}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ShowPicker;
