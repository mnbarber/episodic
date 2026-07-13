import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';

function Login() {
    const { loginWithEmail } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await loginWithEmail(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="auth-page">
            <h1>Sign in to episodic</h1>

            <GoogleAuthButton onError={setError} />

            <div className="auth-divider">or</div>

            <form onSubmit={handleSubmit} className="auth-form">
                <label>
                    Email
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                    Password
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <button type="submit" disabled={submitting}>Sign in</button>
            </form>

            {error && <p className="error">{error}</p>}

            <p className="auth-switch">Don't have an account? <Link to="/register">Create one</Link></p>
        </div>
    );
}

export default Login;
