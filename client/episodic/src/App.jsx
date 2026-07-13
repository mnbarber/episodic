import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Login from './components/auth/Login.jsx'
import Register from './components/auth/Register.jsx'
import Discover from './components/Discover.jsx'
import Search from './components/Search.jsx'
import ShowDetail from './components/shows/ShowDetail.jsx'
import MyShows from './components/MyShows.jsx'
import ProtectedRoute from './components/routing/ProtectedRoute.jsx'
import Profile from './components/social/Profile.jsx'
import Feed from './components/social/Feed.jsx'
import People from './components/social/People.jsx'
import EditProfile from './components/social/EditProfile.jsx'
import Lists from './components/lists/Lists.jsx'
import ListDetail from './components/lists/ListDetail.jsx'
import ListEditor from './components/lists/ListEditor.jsx'

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          <Route path="/show/:id" element={<ShowDetail />} />
          <Route path="/u/:username" element={<Profile />} />
          <Route path="/people" element={<People />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/lists/:id" element={<ListDetail />} />
          <Route
            path="/lists/new"
            element={
              <ProtectedRoute>
                <ListEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lists/:id/edit"
            element={
              <ProtectedRoute>
                <ListEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-shows"
            element={
              <ProtectedRoute>
                <MyShows />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
