import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STEP_UP_ERROR_MESSAGES = {
  mfa_not_satisfied: 'Microsoft Entra could not confirm MFA. Please try again or contact your administrator.',
  account_not_found: 'Your Microsoft account is not registered in this application.',
};

const REVERT_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/revert-to-admin`;

const StepUpCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const stepUpToken = searchParams.get('stepUpToken');
    const returnUrl   = searchParams.get('returnUrl') || '/';
    const error       = searchParams.get('error');

    if (error) {
      const message = STEP_UP_ERROR_MESSAGES[error] || 'Step-up authentication failed. Please try again.';
      navigate(returnUrl, { replace: true, state: { stepUpError: message } });
      return;
    }

    if (!stepUpToken) {
      navigate('/', { replace: true });
      return;
    }

    const pendingRevert = sessionStorage.getItem('pendingRevertToAdmin');

    if (pendingRevert) {
      // Self-revert flow: call the dedicated endpoint that has no role restriction,
      // get a fresh JWT reflecting the administrator role, and update the session.
      sessionStorage.removeItem('pendingRevertToAdmin');

      fetch(REVERT_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-StepUp-Token': stepUpToken,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            localStorage.setItem('token', data.token);
            sessionStorage.setItem('stepUpToken', stepUpToken);
            setUser(data.user);
            navigate('/administrator/dashboard', { replace: true });
          } else {
            navigate('/', { replace: true, state: { stepUpError: data.message || 'Failed to revert role.' } });
          }
        })
        .catch(() => {
          navigate('/', { replace: true, state: { stepUpError: 'Network error. Failed to revert role. Please try again.' } });
        });

      return;
    }

    // Normal step-up flow — store the token and return the user to where they were.
    sessionStorage.setItem('stepUpToken', stepUpToken);
    navigate(returnUrl, { replace: true });
  }, [searchParams, navigate, setUser]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-white text-2xl">Verifying Entra authentication…</div>
    </div>
  );
};

export default StepUpCallback;
