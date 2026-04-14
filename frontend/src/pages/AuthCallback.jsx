import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');

    console.log('AuthCallback - Token:', token ? 'Present' : 'Missing');
    console.log('AuthCallback - Role:', role);

    if (token && role) {
      localStorage.setItem('token', token);
      
      // Fetch user data
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log('User data:', data);
          if (data.success) {
            setUser(data.user);
            
            // Check MFA status for admins and volunteers
            if (['administrator', 'volunteer'].includes(role)) {
              console.log('Checking MFA status for', role);
              fetch(`${import.meta.env.VITE_API_URL}/api/mfa/status`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
                .then(res => res.json())
                .then(mfaData => {
                  console.log('MFA Status:', mfaData);
                  if (mfaData.success && !mfaData.mfaEnabled) {
                    console.log('Redirecting to MFA setup');
                    navigate('/mfa-setup');
                  } else if (mfaData.success && mfaData.mfaEnabled) {
                    console.log('MFA enabled - redirecting to verification');
                    navigate('/mfa-verify', { state: { role } });
                  } else {
                    console.log('Going to dashboard');
                    navigate(`/${role}/dashboard`);
                  }
                })
                .catch(err => {
                  console.error('MFA check error:', err);
                  navigate(`/${role}/dashboard`);
                });
            } else {
              console.log('Student/Donor - going to dashboard');
              navigate(`/${role}/dashboard`);
            }
          }
        })
        .catch(err => {
          console.error('Auth callback error:', err);
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-white text-2xl">Authenticating...</div>
    </div>
  );
};

export default AuthCallback;