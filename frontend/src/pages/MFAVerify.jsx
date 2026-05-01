import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const MFAVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'administrator';
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/mfa/verify', { token });
      if (response.data.success) {
        navigate(`/${role}/dashboard`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid code');
      setToken('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Two-Factor Authentication</h1>
        <p className="text-gray-600 mb-6">
          Enter the 6-digit code from your authenticator app
        </p>

        <form onSubmit={handleVerify}>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">
              Authentication Code
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-3xl tracking-widest font-mono"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || token.length !== 6}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Lost your device?{' '}
              <span className="text-primary-600 cursor-pointer hover:underline">
                Use backup code
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MFAVerify;
