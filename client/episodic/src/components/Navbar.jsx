import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    function handleSearch(e) {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    }

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">episodic</Link>

            <form onSubmit={handleSearch} className="navbar-search">
                <input
                    type="text"
                    placeholder="Search TV shows..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </form>

            <div className="navbar-links">
                <Link to="/lists">Lists</Link>
                <Link to="/people">People</Link>
                {user ? (
                    <>
                        <Link to="/feed">Feed</Link>
                        <Link to="/my-shows">My Shows</Link>
                        <Link to={`/u/${user.username}`}>{user.name || user.username}</Link>
                        <button onClick={logout}>Log out</button>
                    </>
                ) : (
                    <Link to="/login">Sign in</Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
