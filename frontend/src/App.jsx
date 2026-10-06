import { Route, Routes } from 'react-router';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import NoteDetailPage from './pages/NoteDetailPage';

const App = () => {
  return (
    <div data-theme="forest">
      
      <Routes>
        <Route path='/' element={<HomePage />}></Route>
        <Route path='/create' element= {<CreatePage />}></Route>
        <Route path='/:id' element={<NoteDetailPage />}></Route>
      </Routes>
    </div>
  )
}

export default App