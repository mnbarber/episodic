import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import ShowPicker from '../shows/ShowPicker';

function ListEditor() {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const { user } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [shows, setShows] = useState([]);
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isEditing) return;
        api.getList(id)
            .then((list) => {
                if (list.user._id !== user._id) {
                    setError("You can't edit someone else's list.");
                    return;
                }
                setTitle(list.title);
                setDescription(list.description || '');
                setShows(list.shows);
                setIsPublic(list.isPublic);
            })
            .catch(() => setError('Could not load that list.'))
            .finally(() => setLoading(false));
    }, [id, isEditing, user]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const data = { title, description, shows, isPublic };
            const list = isEditing ? await api.updateList(id, data) : await api.createList(data);
            navigate(`/lists/${list._id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm('Delete this list? This cannot be undone.')) return;
        setSaving(true);
        try {
            await api.deleteList(id);
            navigate('/lists');
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    }

    if (loading) return <p>Loading...</p>;

    return (
        <div className="list-editor-page">
            <h1>{isEditing ? 'Edit List' : 'New List'}</h1>

            <form onSubmit={handleSubmit} className="list-editor-form">
                <label>
                    Title
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
                </label>
                <label>
                    Description
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={1000}
                        rows={3}
                        placeholder="What's this list about?"
                    />
                </label>
                <label className="list-editor-checkbox">
                    <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                    Public (visible to everyone on the Lists tab)
                </label>

                <h2>Shows</h2>
                <ShowPicker value={shows} onChange={setShows} emptyMessage="No shows added yet." />

                {error && <p className="error">{error}</p>}

                <div className="list-editor-actions">
                    <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save list'}</button>
                    {isEditing && (
                        <button type="button" onClick={handleDelete} disabled={saving} className="delete-list-btn">
                            Delete list
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default ListEditor;
