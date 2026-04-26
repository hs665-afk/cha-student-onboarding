import { useAuth } from '../../context/AuthContext';

const STEPUP_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/azure/stepup`;

const StudentDashboard = () => {
  const { user } = useAuth();

  const handleRevertToAdmin = () => {
    sessionStorage.setItem('pendingRevertToAdmin', 'true');
    const returnUrl = encodeURIComponent('/administrator/dashboard');
    window.location.href = `${STEPUP_URL}?returnUrl=${returnUrl}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user?.name}! 🎓</h1>
            <p className="text-gray-600"><strong>Email:</strong> {user?.email}</p>
            <p className="text-gray-600"><strong>Role:</strong> Student</p>
          </div>
          <button
            onClick={handleRevertToAdmin}
            style={{ backgroundColor: '#b45309' }}
            className="text-white px-5 py-2 rounded-lg cursor-pointer"
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#92400e'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#b45309'}
          >
            Revert to Administrator Dashboard
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-primary-600 mb-4">Your Learning Journey</h2>
          <p className="text-gray-700 mb-4">Access your courses, resources, and community forums.</p>
          <div className="flex space-x-4">
            <a href="/community/forum" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700">
              Community Forum
            </a>
            <a href="/community/resources" className="bg-secondary-600 text-white px-6 py-3 rounded-lg hover:bg-secondary-700">
              Learning Resources
            </a>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-primary-600 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="text-4xl font-bold text-primary-600">5</h3>
              <p className="text-gray-700">Courses Enrolled</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="text-4xl font-bold text-secondary-600">3</h3>
              <p className="text-gray-700">Certifications</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="text-4xl font-bold text-orange-600">85%</h3>
              <p className="text-gray-700">Progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
