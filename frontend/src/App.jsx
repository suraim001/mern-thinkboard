import { Route, Routes } from 'react-router';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import NoteDetailPage from './pages/NoteDetailPage';
import LoginPage from './pages/LoginPage';
import AuthSuccessPage from './pages/AuthSuccessPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <div className='relative h-full w-full'>
      <div className='absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#00FF9D40_100%)]' />
      
      <Routes>
        <Route path='/login' element={<LoginPage />}></Route>
        <Route path='/signup' element={<SignupPage />}></Route>
        <Route path='/auth-success' element={<AuthSuccessPage />}></Route>
        <Route path='/' element={<ProtectedRoute><HomePage /></ProtectedRoute>}></Route>
        <Route path='/create' element= {<ProtectedRoute><CreatePage /></ProtectedRoute>}></Route>
        <Route path='/note/:_id' element={<ProtectedRoute><NoteDetailPage /></ProtectedRoute>}></Route>
        <Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}></Route>
      </Routes>
    </div>
  )
}

export default App
