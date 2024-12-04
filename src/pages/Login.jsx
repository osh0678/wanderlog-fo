import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/apiService';
import useStore from '../stores/useStore';

function Login() {
  const navigate = useNavigate();
  const setUserId = useStore((state) => state.setUserId);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 이메일 유효성 검사
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return '이메일을 입력해주세요.';
    }
    if (!emailRegex.test(email)) {
      return '올바른 이메일 형식이 아닙니다.';
    }
    return '';
  };

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    if (!password) {
      return '비밀번호를 입력해주세요.';
    }
    return '';
  };

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 실시간 유효성 검사
    if (name === 'email') {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(value)
      }));
    } else if (name === 'password') {
      setErrors(prev => ({
        ...prev,
        password: validatePassword(value)
      }));
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // 모든 필드 유효성 검사
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setErrors({
      email: emailError,
      password: passwordError
    });

    // 에러가 있으면 제출하지 않음
    if (emailError || passwordError) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await authAPI.login(formData);
      
      // 로그인 성공 메시지 설정
      setMessage({
        type: 'success',
        text: response.data.message || '로그인에 성공했습니다!'
      });
      
      // Zustand 스토어에 userId 저장
      setUserId(response.data.userId);
      
      // 3초 후 리다이렉트
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response.data.message || '로그인에 실패했습니다. 다시 시도해주세요.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">로그인</h1>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="이메일"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded-lg transition-colors ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-blue-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            계정이 없으신가요?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:underline"
              disabled={isLoading}
            >
              회원가입
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login; 