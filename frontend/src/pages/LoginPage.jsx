import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/GoogleButton';

const LoginPage = () => {
  const { user, loading, login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("error")) {
      toast.error("Google login failed. Please try again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Email and password are required");
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error logging in", error);
      toast.error(error.response?.data?.message || "Failed to log in");
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && user) return <Navigate to="/" replace />;

  return (
    <div className='min-h-screen flex items-center justify-center px-4'>
      <div className="card bg-base-100 w-full max-w-md shadow-xl border border-base-content/10">
        <div className="card-body gap-4">
          <div className='text-center'>
            <h1 className='text-4xl font-bold text-primary font-mono tracking-tight'>ThinkBoard</h1>
            <p className='text-base-content/70 mt-2'>Welcome back! Sign in to your notes.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className='label'>
                <span className='label-text'>Email</span>
              </label>
              <input type="email" placeholder='you@example.com' className='input input-bordered' autoComplete='email' onChange={(e) => setEmail(e.target.value)} value={email} />
            </div>

            <div className="form-control mb-6">
              <label className='label'>
                <span className='label-text'>Password</span>
              </label>
              <input type="password" placeholder='Your password' className='input input-bordered' autoComplete='current-password' onChange={(e) => setPassword(e.target.value)} value={password} />
            </div>

            <button type='submit' className='btn btn-primary w-full' disabled={submitting}>
              {submitting ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="divider my-0">OR</div>

          <GoogleButton />

          <p className='text-center text-sm text-base-content/70'>
            Don't have an account? <Link to="/signup" className='link link-primary'>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage;
