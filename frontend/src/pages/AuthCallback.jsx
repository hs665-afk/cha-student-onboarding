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

      fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
            // Check for any pending sensitive actions (Step-up MFA)
            const pendingRequest = localStorage.getItem('pendingRequest');
            if (pendingRequest) {
              const request = JSON.parse(pendingRequest);
              
              // Only resume if it's recent (less than 10 mins)
              if (Date.now() - request.timestamp < 600000) {
                localStorage.removeItem('pendingRequest');
                
                // Use fetch with the new token directly to resume the action
                fetch(`${import.meta.env.VITE_API_URL}/api${request.url}`, {
                  method: request.method.toUpperCase(),
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: request.data
                })
                  .then(() => {
                    console.log('Pending action resumed successfully');
                    const savedRedirect = localStorage.getItem('redirectAfterMfa');
                    if (savedRedirect) {
                      localStorage.removeItem('redirectAfterMfa');
                      navigate(savedRedirect);
                    } else {
                      navigate(`/${role}/dashboard`);
                    }
                  })
                  .catch(err => {
                    console.error('Failed to resume pending action:', err);
                    navigate(`/${role}/dashboard`);
                  });
                return; // Wait for the fetch to complete
              } else {
                localStorage.removeItem('pendingRequest');
              }
            }

            // Check if this was a standard Step-up MFA redirect (without pending request)
            const savedRedirect = localStorage.getItem('redirectAfterMfa');
            if (savedRedirect) {
              localStorage.removeItem('redirectAfterMfa');
              navigate(savedRedirect);
            } else {
              // Default role-based navigation
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
