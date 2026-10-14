import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// google redirects here with ?token=... after a successful login
const AuthSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const handled = useRef(false); // StrictMode runs effects twice in dev

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get("token");
    if (!token) {
      navigate("/login?error=missing_token", { replace: true });
      return;
    }

    loginWithToken(token).then(() => {
      toast.success("Logged in successfully!");
      navigate("/", { replace: true });
    });
  }, [searchParams, loginWithToken, navigate]);

  return <div className='min-h-screen flex items-center justify-center text-primary'>Signing you in...</div>;
}

export default AuthSuccessPage;
