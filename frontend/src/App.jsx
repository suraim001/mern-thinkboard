import { Route, Routes } from 'react-router';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import NoteDetailPage from './pages/NoteDetailPage';

const App = () => {
  return (
    <div data-theme="forest">
      <button className='btn btn-light'>Click Me</button>
      <Routes>
        <Route path='/notes' element={<HomePage />}></Route>
        <Route path='/notes/create' element= {<CreatePage />}></Route>
        <Route path='/notes/:id' element={<NoteDetailPage />}></Route>
      </Routes>
    </div>
  )
}

export default App