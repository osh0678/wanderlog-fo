import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/apiService';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    username: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 유효성 검사 함수들
  const validateForm = () => {
    const newErrors = {};
    
    // 이메일 검사
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 이름 검사
    if (!formData.username) {
      newErrors.username = '이름을 입력해주세요.';
    } else if (formData.username.length < 2) {
      newErrors.username = '이름은 2자 이상이어야 합니다.';
    }

    // 비밀번호 검사
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    // 비밀번호 확인 검사
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 실시간 유효성 검사
    const newErrors = { ...errors };
    
    switch(name) {
      case 'email':
        if (!value) {
          newErrors.email = '이메일을 입력해주세요.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = '올바른 이메일 형식이 아닙니다.';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'username':
        if (!value) {
          newErrors.username = '이름을 입력해주세요.';
        } else if (value.length < 2) {
          newErrors.username = '이름은 2자 이상이어야 합니다.';
        } else {
          delete newErrors.username;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = '비밀번호를 입력해주세요.';
        } else if (value.length < 6) {
          newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
        } else {
          delete newErrors.password;
        }
        
        // 비밀번호 확인 필드도 체크
        if (formData.passwordConfirm && value !== formData.passwordConfirm) {
          newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
        } else if (formData.passwordConfirm) {
          delete newErrors.passwordConfirm;
        }
        break;
        
      case 'passwordConfirm':
        if (!value) {
          newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
        } else if (value !== formData.password) {
          newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
        } else {
          delete newErrors.passwordConfirm;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        username: formData.username
      });

      setMessage({
        type: 'success',
        text: '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.'
      });

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response.data.message || '회원가입 중 오류가 발생했습니다.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col justify-center px-4 py-8 md:py-12">
      <div className="w-full max-w-md mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white">
          WanderLog 회원가입
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            로그인하기
          </Link>
        </p>
      </div>

      <div className="mt-6 w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 shadow rounded-lg">
          {message.text && (
            <div className={`mb-4 border px-3 py-2 rounded ${
              message.type === 'success' 
                ? 'bg-green-100 border-green-400 text-green-700' 
                : 'bg-red-100 border-red-400 text-red-700'
            }`} role="alert">
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                이메일
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                이름
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                비밀번호 확인
              </label>
              <div className="mt-1">
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  required
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.passwordConfirm ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
                {errors.passwordConfirm && (
                  <p className="mt-1 text-xs text-red-600">{errors.passwordConfirm}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || Object.keys(errors).length > 0}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '가입 중...' : '회원가입'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;