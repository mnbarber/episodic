import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';

function Register() {
    const { registerWithEmail } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await registerWithEmail(username, email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="auth-page">
            <h1>Create your episodic account</h1>

            <GoogleAuthButton onError={setError} />

            <div className="auth-divider">or</div>

            <form onSubmit={handleSubmit} className="auth-form">
                <label>
                    Username
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <label>
                    Email
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                    />
                </label>
                <button type="submit" disabled={submitting}>Create account</button>
            </form>

            {error && <p className="error">{error}</p>}

            <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
    );
}

export default Register;
