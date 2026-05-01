import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdministratorDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ students: 0, volunteers: 0, donors: 0, admins: 0 });
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.users);
        calculateStats(response.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userList) => {
    const stats = {
      students: userList.filter(u => u.role === 'student').length,
      volunteers: userList.filter(u => u.role === 'volunteer').length,
      donors: userList.filter(u => u.role === 'donor').length,
      admins: userList.filter(u => u.role === 'administrator').length
    };
    setStats(stats);
  };

  const handleRoleChange = () => {
    if (!selectedUser || !newRole || newRole === selectedUser.role) return;

    // Save the pending role change so AuthCallback can auto-resume it after step-up
    localStorage.setItem('pendingRequest', JSON.stringify({
      url: `/admin/users/${selectedUser._id}/role`,
      method: 'put',
      data: JSON.stringify({ role: newRole }),
      timestamp: Date.now()
    }));
    localStorage.setItem('redirectAfterMfa', window.location.pathname);

    // Every role change requires a fresh Azure elevated security re-authentication
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/azure?prompt=login`;
  };

  const openRoleAssignment = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleAssignment(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Administrator Dashboard 👨💼</h1>
        <p className="text-gray-600"><strong>Name:</strong> {user?.name}</p>
        <p className="text-gray-600"><strong>Email:</strong> {user?.email}</p>
        <p className="text-gray-600"><strong>Role:</strong> <span className="font-bold text-primary-600">{user?.role}</span></p>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-primary-600 mb-4">Platform Management</h2>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => {
                setShowUserManagement(!showUserManagement);
                if (!showUserManagement) {
                  fetchUsers();
                }
              }}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              {showUserManagement ? 'Hide' : 'Show'} User Management
            </button>
            <button 
              onClick={() => {
                setShowUserManagement(true);
                fetchUsers();
              }}
              className="bg-secondary-600 text-white px-6 py-3 rounded-lg hover:bg-secondary-700 transition"
            >
              Role Assignment
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-primary-600 mb-4">Preview Role Dashboards</h2>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/student/dashboard" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center"
            >
              🎓 Student View
            </Link>
            <Link 
              to="/donor/dashboard" 
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition flex items-center"
            >
              💝 Donor View
            </Link>
            <Link 
              to="/volunteer/dashboard" 
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center"
            >
              🤝 Volunteer View
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-primary-600 mb-4">System Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <h3 className="text-4xl font-bold text-blue-600">{stats.students}</h3>
              <p className="text-gray-700">Total Students</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <h3 className="text-4xl font-bold text-green-600">{stats.volunteers}</h3>
              <p className="text-gray-700">Active Volunteers</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg text-center">
              <h3 className="text-4xl font-bold text-orange-600">{stats.donors}</h3>
              <p className="text-gray-700">Donors</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg text-center">
              <h3 className="text-4xl font-bold text-purple-600">{stats.admins}</h3>
              <p className="text-gray-700">Administrators</p>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        {showUserManagement && (
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">All Users</h2>
            {loading ? (
              <p className="text-center py-4">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Role</th>
                      <th className="px-4 py-2 text-left">Provider</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{u.name}</td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            u.role === 'administrator' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'volunteer' ? 'bg-green-100 text-green-800' :
                            u.role === 'donor' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-2">{u.provider}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => openRoleAssignment(u)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                          >
                            Change Role
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Role Assignment Modal */}
        {showRoleAssignment && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Change User Role</h2>
              <div className="mb-4">
                <p className="text-gray-600"><strong>User:</strong> {selectedUser.name}</p>
                <p className="text-gray-600"><strong>Email:</strong> {selectedUser.email}</p>
                <p className="text-gray-600"><strong>Current Role:</strong> {selectedUser.role}</p>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">New Role:</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="student">Student</option>
                  <option value="donor">Donor</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="administrator">Administrator</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleRoleChange}
                  disabled={newRole === selectedUser.role}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Verify with Microsoft & Update
                </button>
                <button
                  onClick={() => {
                    setShowRoleAssignment(false);
                    setSelectedUser(null);
                    setNewRole('');
                  }}
                  className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdministratorDashboard;
