import { Link, useLocation } from 'react-router-dom';

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 w-full h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="h-full">
        <div className="flex justify-around items-center h-full px-4">
          <Link 
            to="/" 
            className={`flex flex-col items-center space-y-1 min-w-[4rem] ${
              location.pathname === '/' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">홈</span>
          </Link>

          <Link 
            to="/timeline" 
            className={`flex flex-col items-center space-y-1 min-w-[4rem] ${
              location.pathname === '/timeline' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">타임라인</span>
          </Link>

          <Link 
            to="/albums" 
            className={`flex flex-col items-center space-y-1 min-w-[4rem] ${
              location.pathname.includes('/albums') ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">앨범</span>
          </Link>

          <Link 
            to="/profile" 
            className={`flex flex-col items-center space-y-1 min-w-[4rem] ${
              location.pathname === '/profile' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">프로필</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default BottomNav; 