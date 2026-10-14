import { Link, useNavigate } from 'react-router';
import { LogOutIcon, PlusIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className='bg-base-300 border-b border-base-content/10'>
        <div className='mx-auto max-w-6xl p-4'>
            <div className='flex items-center justify-between'>
                <h1 className='text-3xl font-bold text-primary font-mono tracking-tight'>
                    ThinkBoard
                </h1>
                <div className='flex items-center gap-4'>
                    <Link to={"/create"} title='Create Note' className="btn btn-primary">
                    <PlusIcon className="size-5" />
                    <span>New Note</span>
                    </Link>
                    {user && (
                      <div className='flex items-center gap-3'>
                        <Link to={"/profile"} title='Profile' className='btn btn-ghost btn-circle'>
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} referrerPolicy='no-referrer' className='size-9 rounded-full' />
                          ) : (
                            <UserIcon className='size-5' />
                          )}
                        </Link>
                        <button onClick={handleLogout} className='btn btn-ghost btn-sm' title='Logout'>
                          <LogOutIcon className='size-5' />
                        </button>
                      </div>
                    )}
                </div>

            </div>
        </div>
    </header>
  )
}

export default Navbar