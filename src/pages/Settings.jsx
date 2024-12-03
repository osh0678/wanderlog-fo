import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';
import { authAPI } from '../utils/apiService';

function Settings() {
  const navigate = useNavigate();
  const { userId } = useStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [dirty, setDirty] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [successMessage, setSuccessMessage] = useState('');

  // 비밀번호 유효성 검사 규칙
  const passwordRules = {
    minLength: 8,
    hasUpperCase: true,
    hasLowerCase: true,
    hasNumber: true,
    hasSpecialChar: true,
  };

  // 비밀번호 유효성 검사 함수
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < passwordRules.minLength) {
      errors.push(`비밀번호는 최소 ${passwordRules.minLength}자 이상이어야 합니다.`);
    }
    if (passwordRules.hasUpperCase && !/[A-Z]/.test(password)) {
      errors.push('대문자를 포함해야 합니다.');
    }
    if (passwordRules.hasLowerCase && !/[a-z]/.test(password)) {
      errors.push('소문자를 포함해야 합니다.');
    }
    if (passwordRules.hasNumber && !/[0-9]/.test(password)) {
      errors.push('숫자를 포함해야 합니다.');
    }
    if (passwordRules.hasSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('특수문자를 포함해야 합니다.');
    }
    return errors;
  };

  // 폼 유효성 검사
  const getFormErrors = () => {
    const errors = [];
    
    if (dirty.newPassword) {
      const passwordErrors = validatePassword(formData.newPassword);
      errors.push(...passwordErrors);
    }

    if (dirty.confirmPassword && formData.newPassword !== formData.confirmPassword) {
      errors.push('새 비밀번호가 일치하지 않습니다.');
    }

    if (dirty.newPassword && formData.currentPassword === formData.newPassword) {
      errors.push('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
    }

    return errors;
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await authAPI.getUserProfile(userId);
        setFormData(prev => ({
          ...prev,
          email: response.data.email
        }));
      } catch (err) {
        console.error('Failed to fetch user info:', err);
        setError('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setDirty(prev => ({
      ...prev,
      [name]: true
    }));
    setError(null);
    setSuccessMessage('');
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setDirty(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // 모든 필드를 더티로 표시
    setDirty({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    const errors = getFormErrors();
    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    setSaving(true);
    try {
      await authAPI.updatePassword(userId, {
          password: formData.newPassword
      });
      setSuccessMessage('비밀번호가 성공적으로 변경되었습니다.');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      // 더티 상태 초기화
      setDirty({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
      // 비밀번호 변경 성공 후 프로필 페이지로 이동
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* 헤더 */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">설정</h1>
          </div>

          {/* 알림 메시지 */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 text-green-600 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* 설정 폼 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  계정 정보
                </h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  />
                </div>
              </div>

              <form onSubmit={handlePasswordChange}>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  비밀번호 변경
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      현재 비밀번호
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                        dirty.currentPassword && !formData.currentPassword ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {dirty.currentPassword && !formData.currentPassword && (
                      <p className="mt-1 text-sm text-red-500">현재 비밀번호를 입력해주세요.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      새 비밀번호
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                        dirty.newPassword && validatePassword(formData.newPassword).length > 0 ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {dirty.newPassword && validatePassword(formData.newPassword).length > 0 && (
                      <ul className="mt-1 text-sm text-red-500 list-disc list-inside">
                        {validatePassword(formData.newPassword).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      새 비밀번호 확인
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                        dirty.confirmPassword && formData.newPassword !== formData.confirmPassword ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {dirty.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">새 비밀번호가 일치하지 않습니다.</p>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving || getFormErrors().length > 0}
                  className={`mt-6 w-full py-2 px-4 rounded-lg text-white ${
                    saving || getFormErrors().length > 0
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {saving ? '변경 중...' : '비밀번호 변경'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings; 