import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, LoaderIcon, Trash2Icon, UserIcon } from 'lucide-react';
import api from '../lib/axios';
import { formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, setUser, logout, clearSession } = useAuth();
  const navigate = useNavigate();

  const [notesCount, setNotesCount] = useState(null);
  const [username, setUsername] = useState(user?.username || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        setNotesCount(res.data.notesCount);
        setUser(res.data.user);
        setUsername(res.data.user.username || "");
      } catch (error) {
        console.error("Error fetching profile", error);
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, [setUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.put("/users/profile", { username });
      setUser(res.data.user);
      toast.success("Profile updated");
    } catch (error) {
      console.error("Error updating profile", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.put("/users/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setUser(res.data.user);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated");
    } catch (error) {
      console.error("Error changing password", error);
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Delete your account and ALL of your notes? This cannot be undone.")) return;

    try {
      await api.delete("/users/profile");
      clearSession();
      toast.success("Account deleted");
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account", error);
      toast.error("Failed to delete account");
    }
  };

  if (!user) {
    return (
      <div className='min-h-screen bg-base-200 flex items-center justify-center'>
        <LoaderIcon className='animate-spin size-10' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-base-200'>
      <div className='container mx-auto px-4 py-8'>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to={'/'} className="btn btn-ghost border-gray-600">
              <ArrowLeftIcon className="size-5" />
              Back to Notes
            </Link>
            <button onClick={handleLogout} className='btn btn-outline'>Log Out</button>
          </div>

          {/* overview */}
          <div className="card bg-base-100 mb-6">
            <div className="card-body flex-row items-center gap-5">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} referrerPolicy='no-referrer' className='size-20 rounded-full' />
              ) : (
                <div className='size-20 rounded-full bg-base-300 flex items-center justify-center'>
                  <UserIcon className='size-10 text-base-content/60' />
                </div>
              )}
              <div className='min-w-0'>
                <h2 className='text-2xl font-bold truncate'>{user.username || "Unnamed user"}</h2>
                <p className='text-base-content/70 truncate'>{user.email}</p>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {user.hasGoogle && <span className='badge badge-outline'>Google</span>}
                  {user.hasPassword && <span className='badge badge-outline'>Email & password</span>}
                  <span className='badge badge-primary badge-outline'>{notesCount ?? "…"} notes</span>
                </div>
                {user.createdAt && (
                  <p className='text-sm text-base-content/60 mt-2'>Joined {formatDate(new Date(user.createdAt))}</p>
                )}
              </div>
            </div>
          </div>

          {/* edit profile */}
          <div className="card bg-base-100 mb-6">
            <div className="card-body">
              <h3 className='card-title'>Profile</h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-control mb-4">
                  <label className='label'>
                    <span className='label-text'>Username</span>
                  </label>
                  <input type="text" className='input input-bordered' onChange={(e) => setUsername(e.target.value)} value={username} />
                </div>
                <div className="card-actions justify-end">
                  <button type='submit' className='btn btn-primary' disabled={savingProfile || username === user.username}>
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* password */}
          <div className="card bg-base-100 mb-6">
            <div className="card-body">
              <h3 className='card-title'>{user.hasPassword ? "Change Password" : "Set a Password"}</h3>
              {!user.hasPassword && (
                <p className='text-sm text-base-content/70'>You signed up with Google. Set a password to also log in with your email.</p>
              )}
              <form onSubmit={handleChangePassword}>
                {user.hasPassword && (
                  <div className="form-control mb-4">
                    <label className='label'>
                      <span className='label-text'>Current Password</span>
                    </label>
                    <input type="password" className='input input-bordered' autoComplete='current-password' onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} value={passwords.currentPassword} />
                  </div>
                )}
                <div className="form-control mb-4">
                  <label className='label'>
                    <span className='label-text'>New Password</span>
                  </label>
                  <input type="password" className='input input-bordered' autoComplete='new-password' onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} value={passwords.newPassword} />
                </div>
                <div className="form-control mb-4">
                  <label className='label'>
                    <span className='label-text'>Confirm New Password</span>
                  </label>
                  <input type="password" className='input input-bordered' autoComplete='new-password' onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} value={passwords.confirmPassword} />
                </div>
                <div className="card-actions justify-end">
                  <button type='submit' className='btn btn-primary' disabled={savingPassword || !passwords.newPassword}>
                    {savingPassword ? "Saving..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* danger zone */}
          <div className="card bg-base-100 border border-error/40">
            <div className="card-body">
              <h3 className='card-title text-error'>Danger Zone</h3>
              <p className='text-sm text-base-content/70'>Deleting your account permanently removes all of your notes.</p>
              <div className="card-actions justify-end">
                <button onClick={handleDeleteAccount} className='btn btn-error btn-outline'>
                  <Trash2Icon className='size-5' />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage;
