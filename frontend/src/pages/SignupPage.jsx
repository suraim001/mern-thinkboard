import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/GoogleButton';

const SignupPage = () => {
  const { user, loading, signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.email.trim() || !form.password) {
      toast.error("All fields are required");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await signup(form.username, form.email, form.password);
      toast.success("Account created!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error signing up", error);
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && user) return <Navigate to="/" replace />;

  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-8'>
      <div className="card bg-base-100 w-full max-w-md shadow-xl border border-base-content/10">
        <div className="card-body gap-4">
          <div className='text-center'>
            <h1 className='text-4xl font-bold text-primary font-mono tracking-tight'>ThinkBoard</h1>
            <p className='text-base-content/70 mt-2'>Create an account to start taking notes.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className='label'>
                <span className='label-text'>Username</span>
              </label>
              <input type="text" name='username' placeholder='Your name' className='input input-bordered' autoComplete='username' onChange={handleChange} value={form.username} />
            </div>

            <div className="form-control mb-4">
              <label className='label'>
                <span className='label-text'>Email</span>
              </label>
              <input type="email" name='email' placeholder='you@example.com' className='input input-bordered' autoComplete='email' onChange={handleChange} value={form.email} />
            </div>

            <div className="form-control mb-4">
              <label className='label'>
                <span className='label-text'>Password</span>
              </label>
              <input type="password" name='password' placeholder='At least 6 characters' className='input input-bordered' autoComplete='new-password' onChange={handleChange} value={form.password} />
            </div>

            <div className="form-control mb-6">
              <label className='label'>
                <span className='label-text'>Confirm Password</span>
              </label>
              <input type="password" name='confirmPassword' placeholder='Repeat your password' className='input input-bordered' autoComplete='new-password' onChange={handleChange} value={form.confirmPassword} />
            </div>

            <button type='submit' className='btn btn-primary w-full' disabled={submitting}>
              {submitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="divider my-0">OR</div>

          <GoogleButton text="Sign up with Google" />

          <p className='text-center text-sm text-base-content/70'>
            Already have an account? <Link to="/login" className='link link-primary'>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage;
