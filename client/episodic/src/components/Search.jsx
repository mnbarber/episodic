import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import ShowGrid from './shows/ShowGrid';

function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!query) {
            setShows([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        api.searchShows(query)
            .then((data) => setShows(data.results || []))
            .catch(() => setError('Search failed.'))
            .finally(() => setLoading(false));
    }, [query]);

    return (
        <div className="search-page">
            <h1>Results for "{query}"</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && <ShowGrid shows={shows} />}
        </div>
    );
}

export default Search;
