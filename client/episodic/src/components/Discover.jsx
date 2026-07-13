import { useEffect, useState } from 'react';
import { api } from '../services/api';
import ShowShelf from './shows/ShowShelf';

const EXCLUDED_GENRES = ['News', 'Talk', 'Soap', 'Reality'];

const SPECIAL_SHELVES = [
    { id: 'horror', name: 'Horror', params: { keyword: '315058', without_genres: '16', minVotes: '100' } },
    { id: 'kdrama', name: 'K-Dramas', params: { origin_country: 'KR' } },
];

function Discover() {
    const [trending, setTrending] = useState([]);
    const [trendingLoading, setTrendingLoading] = useState(true);
    const [specialShelves, setSpecialShelves] = useState(
        SPECIAL_SHELVES.map((s) => ({ ...s, shows: null }))
    );
    const [genreShelves, setGenreShelves] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        api.getTrending()
            .then((data) => setTrending(data.results || []))
            .catch(() => setError('Could not load trending shows.'))
            .finally(() => setTrendingLoading(false));

        SPECIAL_SHELVES.forEach((shelf) => {
            api.discover(shelf.params).then((result) => {
                setSpecialShelves((prev) =>
                    prev.map((s) => (s.id === shelf.id ? { ...s, shows: result.results || [] } : s))
                );
            });
        });

        api.getTvGenres()
            .then((data) => {
                const genres = (data.genres || []).filter((g) => !EXCLUDED_GENRES.includes(g.name));
                setGenreShelves(genres.map((g) => ({ id: g.id, name: g.name, shows: null })));
                genres.forEach((genre) => {
                    api.discoverByGenre(genre.id).then((result) => {
                        setGenreShelves((prev) =>
                            prev.map((shelf) =>
                                shelf.id === genre.id ? { ...shelf, shows: result.results || [] } : shelf
                            )
                        );
                    });
                });
            })
            .catch(() => {});
    }, []);

    return (
        <div className="discover-page">
            <ShowShelf title="Trending this week" shows={trending} loading={trendingLoading} />
            {error && <p className="error">{error}</p>}

            {specialShelves.map((shelf) => (
                <ShowShelf
                    key={shelf.id}
                    title={shelf.name}
                    shows={shelf.shows}
                    loading={shelf.shows === null}
                />
            ))}

            {genreShelves.map((shelf) => (
                <ShowShelf
                    key={shelf.id}
                    title={shelf.name}
                    shows={shelf.shows}
                    loading={shelf.shows === null}
                />
            ))}
        </div>
    );
}

export default Discover;
