import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VolunteerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      {user?.role === 'administrator' && (
        <div className="mb-6 bg-purple-100 border-l-4 border-purple-500 p-4 rounded-r-lg shadow-md flex justify-between items-center">
          <div>
            <p className="text-purple-800 font-bold">Admin Preview Mode</p>
            <p className="text-purple-600 text-sm">You are currently viewing this page as a preview.</p>
          </div>
          <Link 
            to="/administrator/dashboard" 
            className="inline-flex items-center text-white bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            ⬅️ Return to Administrator Dashboard
          </Link>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome, {user?.name}! 🤝</h1>
        <p className="text-gray-600"><strong>Email:</strong> {user?.email}</p>
        <p className="text-gray-600"><strong>Role:</strong> Volunteer</p>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-primary-600 mb-4">Class Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="text-4xl font-bold text-primary-600">3</h3>
              <p className="text-gray-700">Classes Assigned</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="text-4xl font-bold text-secondary-600">45</h3>
              <p className="text-gray-700">Students Mentored</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="text-4xl font-bold text-orange-600">92%</h3>
              <p className="text-gray-700">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;