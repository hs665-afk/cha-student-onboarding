import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const STEPUP_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/azure/stepup`;

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    // Surface any step-up error forwarded by StepUpCallback via router state.
    if (location.state?.stepUpError) {
      setError(location.state.stepUpError);
      navigate(location.pathname, { replace: true, state: {} });
    }

    const init = async () => {
      await fetchUsers();

      const pendingRaw  = sessionStorage.getItem('pendingDeleteUser');
      const stepUpToken = sessionStorage.getItem('stepUpToken');

      if (!pendingRaw || !stepUpToken) return;

      sessionStorage.removeItem('pendingDeleteUser');

      try {
        const { userId } = JSON.parse(pendingRaw);
        await api.delete(`/admin/users/${userId}`, {
          headers: { 'X-StepUp-Token': stepUpToken }
        });
        await fetchUsers(true);
      } catch (err) {
        if (err.response?.data?.requireStepUp) {
          sessionStorage.removeItem('stepUpToken');
          setError('Your Entra session expired before the deletion could be applied. Please try again.');
        } else {
          setError(err.response?.data?.message || 'Failed to complete the pending user deletion.');
        }
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initiateStepUp = (userId) => {
    sessionStorage.setItem('pendingDeleteUser', JSON.stringify({ userId }));
    const returnUrl = encodeURIComponent('/admin/users');
    window.location.href = `${STEPUP_URL}?returnUrl=${returnUrl}`;
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;

    const stepUpToken = sessionStorage.getItem('stepUpToken');

    if (!stepUpToken) {
      initiateStepUp(userId);
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`, {
        headers: { 'X-StepUp-Token': stepUpToken }
      });
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      if (err.response?.data?.requireStepUp) {
        sessionStorage.removeItem('stepUpToken');
        initiateStepUp(userId);
      } else {
        setError(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">User Management 👥</h1>
          <button
            onClick={() => navigate('/administrator/dashboard')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading users…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Provider</th>
                  <th className="px-4 py-2 text-left">Verified</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{u.name}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">
                        <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">{u.provider}</td>
                      <td className="px-4 py-2">
                        {u.isVerified ? (
                          <span className="text-green-600">✅</span>
                        ) : (
                          <span className="text-red-600">❌</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
