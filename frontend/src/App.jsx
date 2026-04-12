import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import MFASetup from './pages/MFASetup';
import MFAChallenge from './pages/MFAChallenge';
import StudentDashboard from './pages/student/Dashboard';
import AdministratorDashboard from './pages/administrator/Dashboard';
import DonorDashboard from './pages/donor/Dashboard';
import VolunteerDashboard from './pages/volunteer/Dashboard';
import CommunityHome from './pages/community/CommunityHome';
import Forum from './pages/community/Forum';
import Resources from './pages/community/Resources';
import Impact from './pages/community/Impact';

// Components
import Navbar from './components/common/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gradient-to-br from-primary-500 to-purple-600">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/mfa-setup" element={<MFASetup />} />
              <Route path="/mfa-challenge" element={<MFAChallenge />} />
              
              {/* Community Routes (Public) */}
              <Route path="/community" element={<CommunityHome />} />
              <Route path="/community/forum" element={<Forum />} />
              <Route path="/community/resources" element={<Resources />} />
              <Route path="/community/impact" element={<Impact />} />
              
              {/* Protected Routes */}
              <Route path="/student/dashboard" element={
                <PrivateRoute role="student">
                  <StudentDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/administrator/dashboard" element={
                <PrivateRoute role="administrator">
                  <AdministratorDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/donor/dashboard" element={
                <PrivateRoute role="donor">
                  <DonorDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/volunteer/dashboard" element={
                <PrivateRoute role="volunteer">
                  <VolunteerDashboard />
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
