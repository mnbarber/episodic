import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ShowPicker from '../shows/ShowPicker';

function EditProfile() {
    const { user, updateProfile, uploadAvatar } = useAuth();
    const navigate = useNavigate();
    const [bio, setBio] = useState(user.bio || '');
    const [topShows, setTopShows] = useState(user.topShows || []);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user.avatar || '');
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [error, setError] = useState('');

    function handleAvatarChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    async function handleAvatarUpload() {
        if (!avatarFile) return;
        setUploadingAvatar(true);
        setError('');
        try {
            await uploadAvatar(avatarFile);
            setAvatarFile(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploadingAvatar(false);
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await updateProfile({ bio, topShows });
            navigate(`/u/${user.username}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="edit-profile-page">
            <h1>Edit Profile</h1>

            <section>
                <h2>Avatar</h2>
                {avatarPreview && <img src={avatarPreview} alt="" className="profile-avatar" />}
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
                {avatarFile && (
                    <button type="button" onClick={handleAvatarUpload} disabled={uploadingAvatar}>
                        {uploadingAvatar ? 'Uploading...' : 'Upload avatar'}
                    </button>
                )}
            </section>

            <form onSubmit={handleSave}>
                <section>
                    <h2>Bio</h2>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={500}
                        rows={4}
                        placeholder="Tell people about yourself..."
                    />
                    <p className="char-count">{bio.length}/500</p>
                </section>

                <section>
                    <h2>Top 5 Shows</h2>
                    <ShowPicker value={topShows} onChange={setTopShows} max={5} emptyMessage="No top shows picked yet." />
                </section>

                {error && <p className="error">{error}</p>}

                <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
            </form>
        </div>
    );
}

export default EditProfile;
