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

    if (token && role) {
      localStorage.setItem('token', token);

      fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
            const returnUrl = sessionStorage.getItem('returnUrl');
            sessionStorage.removeItem('returnUrl');
            navigate(returnUrl || `/${role}/dashboard`);
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
