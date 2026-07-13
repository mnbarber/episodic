import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import ShowGrid from '../shows/ShowGrid';

function ListDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        api.getList(id)
            .then(setList)
            .catch(() => setError('Could not find that list.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!list) return null;

    const isOwner = user && user._id === list.user._id;
    const shows = list.shows.map((s) => ({ id: s.tmdbId, name: s.title, poster_path: s.posterPath }));

    return (
        <div className="list-detail-page">
            <div className="list-detail-header">
                <div>
                    <h1>{list.title}</h1>
                    <p className="list-detail-meta">
                        by <Link to={`/u/${list.user.username}`}>{list.user.name || list.user.username}</Link>
                        {!list.isPublic && ' · Private'}
                    </p>
                    {list.description && <p className="list-detail-description">{list.description}</p>}
                </div>
                {isOwner && <Link to={`/lists/${list._id}/edit`} className="edit-profile-link">Edit</Link>}
            </div>

            <ShowGrid shows={shows} />
        </div>
    );
}

export default ListDetail;
