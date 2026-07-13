import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import FollowButton from './FollowButton';

function People() {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.searchUsers(query)
            .then(setUsers)
            .finally(() => setLoading(false));
    }, [query]);

    return (
        <div className="people-page">
            <h1>People</h1>
            <input
                type="text"
                placeholder="Search by username..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="people-search"
            />

            {loading && <p>Loading...</p>}

            {!loading && (
                <ul className="people-list">
                    {users.map((u) => (
                        <li key={u._id} className="person-row">
                            {u.avatar && <img src={u.avatar} alt="" className="person-avatar" />}
                            <Link to={`/u/${u.username}`}>{u.name || u.username}</Link>
                            <FollowButton userId={u._id} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default People;
