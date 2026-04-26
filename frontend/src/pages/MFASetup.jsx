import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MFASetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const response = await api.get('/mfa/status');
      if (response.data.mfaEnabled) {
        navigate(`/${response.data.role}/dashboard`);
      }
    } catch (error) {
      console.error('Failed to check MFA status:', error);
    }
  };

  const initiateMFASetup = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Initiating MFA setup...');
      const response = await api.post('/mfa/setup');
      console.log('MFA setup response:', response.data);
      if (response.data.success) {
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
        setStep(2);
      }
    } catch (error) {
      console.error('MFA setup error:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || error.message || 'Failed to setup MFA');
    } finally {
      setLoading(false);
    }
  };

  const verifyMFASetup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/mfa/verify-setup', { token });
      if (response.data.success) {
        setBackupCodes(response.data.backupCodes);
        setStep(3);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid token');
    } finally {
      setLoading(false);
    }
  };

  const completeMFASetup = () => {
    navigate(`/${user?.role}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Multi-Factor Authentication Setup</h1>
        <p className="text-gray-600 mb-6">
          As a {user?.role}, MFA is required for enhanced security.
        </p>

        {/* Step 1: Introduction */}
        {step === 1 && (
          <div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-blue-700">
                <strong>Why MFA?</strong> Multi-Factor Authentication adds an extra layer of security to your account.
              </p>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">What you'll need:</h2>
            <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
              <li>A smartphone or tablet</li>
              <li>One of these authenticator apps:
                <ul className="list-circle list-inside ml-6 mt-2">
                  <li>Google Authenticator</li>
                  <li>Microsoft Authenticator</li>
                  <li>Authy</li>
                </ul>
              </li>
            </ul>

            <button
              onClick={initiateMFASetup}
              disabled={loading}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 cursor-pointer"
            >
              {loading ? 'Setting up...' : 'Begin Setup'}
            </button>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Scan QR Code */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Step 1: Scan QR Code</h2>
            
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6 text-center">
              {qrCode && <img src={qrCode} alt="MFA QR Code" className="mx-auto mb-4" />}
              
              <p className="text-sm text-gray-600 mb-2">Can't scan? Enter this code manually:</p>
              <code className="bg-gray-100 px-4 py-2 rounded text-sm font-mono break-all">{secret}</code>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">Step 2: Enter Verification Code</h2>
            <form onSubmit={verifyMFASetup}>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  6-Digit Code from Authenticator App
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest"
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
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
              >
                {loading ? 'Verifying...' : 'Verify and Enable MFA'}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Backup Codes */}
        {step === 3 && (
          <div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <p className="text-green-700">
                <strong>Success!</strong> MFA has been enabled on your account.
              </p>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">Save Your Backup Codes</h2>
            <p className="text-gray-600 mb-4">
              Store these codes in a safe place. You can use them to access your account if you lose your device.
            </p>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-white px-4 py-2 rounded border border-gray-300 text-center font-mono">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
              <p className="text-yellow-700">
                <strong>Important:</strong> Each backup code can only be used once. Save them now - you won't see them again!
              </p>
            </div>

            <button
              onClick={completeMFASetup}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MFASetup;
