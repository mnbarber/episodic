import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import TrackedShowGroups from './shows/TrackedShowGroups';

function MyShows() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getMyTracking()
            .then(setEntries)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="my-shows-page">
            <h1>My Shows</h1>
            <TrackedShowGroups
                entries={entries}
                emptyMessage={<>You haven't tracked any shows yet. Go <Link to="/">discover</Link> something to watch.</>}
            />
        </div>
    );
}

export default MyShows;
