import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, TMDB_IMAGE_BASE } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TrackedShowGroups from '../shows/TrackedShowGroups';
import FollowButton from './FollowButton';
import ReviewCard from './ReviewCard';
import ListCard from '../lists/ListCard';

function Profile() {
    const { username } = useParams();
    const { user } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [tracking, setTracking] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [lists, setLists] = useState([]);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        api.getUserByUsername(username)
            .then((u) => {
                setProfileUser(u);
                return Promise.all([
                    api.getPublicTracking(u._id),
                    api.getPublicReviews(u._id),
                    api.getFollowers(u._id),
                    api.getFollowing(u._id),
                    api.getUserLists(u._id),
                ]);
            })
            .then(([trackingData, reviewsData, followers, following, listsData]) => {
                setTracking(trackingData);
                setReviews(reviewsData);
                setFollowerCount(followers.length);
                setFollowingCount(following.length);
                setLists(listsData);
            })
            .catch(() => setError('Could not find that user.'))
            .finally(() => setLoading(false));
    }, [username]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!profileUser) return null;

    return (
        <div className="profile-page">
            <div className="profile-header">
                {profileUser.avatar && <img src={profileUser.avatar} alt="" className="profile-avatar" />}
                <div>
                    <h1>{profileUser.name || profileUser.username}</h1>
                    <p className="profile-username">@{profileUser.username}</p>
                    <p className="profile-counts">{followerCount} followers · {followingCount} following</p>
                </div>
                {user && user._id === profileUser._id ? (
                    <Link to="/settings/profile" className="edit-profile-link">Edit Profile</Link>
                ) : (
                    <FollowButton userId={profileUser._id} />
                )}
            </div>

            {profileUser.bio && (
                <section className="profile-bio">
                    <p>{profileUser.bio}</p>
                </section>
            )}

            {profileUser.topShows && profileUser.topShows.length > 0 && (
                <section>
                    <h2>Top Shows</h2>
                    <div className="show-grid">
                        {profileUser.topShows.map((show) => (
                            <Link key={show.tmdbId} to={`/show/${show.tmdbId}`} className="show-card">
                                {show.posterPath ? (
                                    <img src={`${TMDB_IMAGE_BASE}${show.posterPath}`} alt={show.title} />
                                ) : (
                                    <div className="show-card-placeholder">{show.title}</div>
                                )}
                                <p>{show.title}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {lists.length > 0 && (
                <section>
                    <h2>Lists</h2>
                    <div className="list-grid">
                        {lists.map((list) => (
                            <ListCard key={list._id} list={list} hideAuthor />
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2>Shows</h2>
                <TrackedShowGroups entries={tracking} emptyMessage="No tracked shows yet." />
            </section>

            <section>
                <h2>Reviews</h2>
                {reviews.length === 0 ? (
                    <p>No reviews yet.</p>
                ) : (
                    <div className="review-list">
                        {reviews.map((review) => (
                            <ReviewCard key={review._id} review={review} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Profile;
