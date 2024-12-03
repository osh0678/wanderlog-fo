import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Albums from './pages/Albums';
import CreateAlbum from './pages/CreateAlbum';
import AlbumDetail from './pages/AlbumDetail';
import BottomNav from './components/BottomNav';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Timeline from './pages/Timeline';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col pb-16">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/albums/create" element={<CreateAlbum />} />
            <Route path="/albums/:id" element={<AlbumDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/timeline" element={<Timeline />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;