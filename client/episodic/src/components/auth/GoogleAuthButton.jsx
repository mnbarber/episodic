import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function GoogleAuthButton({ onError }) {
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    async function handleSuccess(credentialResponse) {
        try {
            await loginWithGoogle(credentialResponse.credential);
            navigate('/');
        } catch {
            onError('Something went wrong signing you in. Please try again.');
        }
    }

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => onError('Google sign-in was cancelled or failed.')}
        />
    );
}

export default GoogleAuthButton;
