import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const STEPUP_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/azure/stepup`;

const RoleAssignment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState({});

  const roles = ['student', 'donor', 'volunteer', 'administrator'];

  const fetchUsers = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
      const roleMap = {};
      response.data.forEach(u => { roleMap[u._id] = u.role; });
      setSelectedRole(roleMap);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    // Surface any step-up error that StepUpCallback forwarded via router state.
    if (location.state?.stepUpError) {
      setError(location.state.stepUpError);
      // Clear it from history so a refresh doesn't re-show the error.
      navigate(location.pathname, { replace: true, state: {} });
    }

    const init = async () => {
      await fetchUsers();

      const pendingRaw  = sessionStorage.getItem('pendingRoleChange');
      const stepUpToken = sessionStorage.getItem('stepUpToken');

      if (!pendingRaw || !stepUpToken) return;

      sessionStorage.removeItem('pendingRoleChange');

      try {
        const { userId, newRole } = JSON.parse(pendingRaw);
        await api.put(
          `/admin/users/${userId}/role`,
          { role: newRole },
          { headers: { 'X-StepUp-Token': stepUpToken } }
        );
        await fetchUsers(true);
      } catch (err) {
        if (err.response?.data?.requireStepUp) {
          setError('Your Entra session expired before the change could be applied. Please try again.');
        } else {
          setError(err.response?.data?.message || 'Failed to apply the pending role change.');
        }
      } finally {
        // Always discard the token after the pending action — every role
        // assignment must trigger a fresh Entra authentication challenge.
        sessionStorage.removeItem('stepUpToken');
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initiateStepUp = (userId, newRole) => {
    sessionStorage.setItem('pendingRoleChange', JSON.stringify({ userId, newRole }));
    const returnUrl = encodeURIComponent('/admin/roles');
    window.location.href = `${STEPUP_URL}?returnUrl=${returnUrl}`;
  };

  const handleRoleChange = (userId, newRole) => {
    if (newRole === selectedRole[userId]) return;
    // Every role assignment requires a fresh Entra authentication challenge —
    // no cached token is ever reused.
    initiateStepUp(userId, newRole);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Role Assignment 🔐</h1>
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
                  <th className="px-4 py-2 text-left">Current Role</th>
                  <th className="px-4 py-2 text-left">Assign New Role</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{u.name}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">
                        <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={selectedRole[u._id] || u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-600"
                        >
                          {roles.map(role => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
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

export default RoleAssignment;
