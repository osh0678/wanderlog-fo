import { Link } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard';
import useStore from '../stores/useStore';

function Home() {
  const userId = useStore((state) => state.userId);
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <header className="text-center mb-16 px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6 tracking-tight">
            WanderLog
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
            소중한 순간들을 영원히 간직하세요!
            <br/>
            당신만의 특별한 이야기를 시작하세요.
          </p>
        </header>

        {/* 메인 섹션 */}
        <main className="max-w-5xl mx-auto">
          {/* 기능 소개 카드 */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <FeatureCard
              title="사진 보관"
              description="추억이 담긴 사진들을 안전하게 보관하세요"
              path="/albums/create"
              bgColor="bg-blue-500"
              icon={
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />

            <FeatureCard
              title="앨범 정리"
              description="테마별로 앨범을 만들어 체계적으로 정리하세요"
              path="/albums"
              bgColor="bg-green-500"
              icon={
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            />

            <FeatureCard
              title="타임라인"
              description="시간순으로 추억을 돌아보세요"
              path="/timeline"
              bgColor="bg-purple-500"
              icon={
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home; 