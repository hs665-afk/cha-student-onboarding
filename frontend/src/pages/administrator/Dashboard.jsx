import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdministratorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Administrator Dashboard</h1>
        <p className="text-gray-600"><strong>Name:</strong> {user?.name}</p>
        <p className="text-gray-600"><strong>Email:</strong> {user?.email}</p>
        <p className="text-gray-600"><strong>Role:</strong> <span className="font-bold text-primary-600">{user?.role}</span></p>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-primary-600 mb-4">Platform Management</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
            >
              User Management
            </button>
            <button
              onClick={() => navigate('/admin/roles')}
              className="bg-secondary-600 text-white px-6 py-3 rounded-lg hover:bg-secondary-700 transition-colors cursor-pointer"
            >
              Role Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministratorDashboard;
