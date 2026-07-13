import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import ListCard from './ListCard';

function Lists() {
    const { user } = useAuth();
    const [myLists, setMyLists] = useState([]);
    const [publicLists, setPublicLists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const requests = [api.getPublicLists()];
        if (user) requests.push(api.getMyLists());

        Promise.all(requests)
            .then(([publicData, mineData]) => {
                setPublicLists(publicData);
                if (mineData) setMyLists(mineData);
            })
            .finally(() => setLoading(false));
    }, [user]);

    return (
        <div className="lists-page">
            <div className="lists-page-header">
                <h1>Lists</h1>
                {user && <Link to="/lists/new" className="new-list-btn">+ New List</Link>}
            </div>

            {loading && <p>Loading...</p>}

            {!loading && user && (
                <section>
                    <h2>My Lists</h2>
                    {myLists.length === 0 ? (
                        <p>You haven't made a list yet.</p>
                    ) : (
                        <div className="list-grid">
                            {myLists.map((list) => (
                                <ListCard key={list._id} list={list} />
                            ))}
                        </div>
                    )}
                </section>
            )}

            {!loading && (
                <section>
                    <h2>Public Lists</h2>
                    {publicLists.length === 0 ? (
                        <p>No public lists yet.</p>
                    ) : (
                        <div className="list-grid">
                            {publicLists.map((list) => (
                                <ListCard key={list._id} list={list} />
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

export default Lists;
