import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

function FollowButton({ userId }) {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user || user._id === userId) {
            setLoading(false);
            return;
        }
        api.getFollowStatus(userId)
            .then((data) => setIsFollowing(data.isFollowing))
            .finally(() => setLoading(false));
    }, [userId, user]);

    if (!user || user._id === userId || loading) {
        return null;
    }

    async function toggle() {
        setSaving(true);
        try {
            if (isFollowing) {
                await api.unfollowUser(userId);
                setIsFollowing(false);
            } else {
                await api.followUser(userId);
                setIsFollowing(true);
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <button onClick={toggle} disabled={saving} className={isFollowing ? 'following-btn' : 'follow-btn'}>
            {isFollowing ? 'Following' : 'Follow'}
        </button>
    );
}

export default FollowButton;
