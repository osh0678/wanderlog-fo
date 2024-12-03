import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { albumAPI } from '../utils/apiService';
import useStore from '../stores/useStore';

function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = useStore((state) => state.userId);
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const data = await albumAPI.getAlbums(userId);
        setAlbums(data.data);
      } catch (err) {
        setError('앨범을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [userId]);

  if (loading) {
    return <div className="text-center py-10">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">나의 앨범</h1>
          <Link
            to="/albums/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            새 앨범 만들기
          </Link>
        </div>

        {albums.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-400">앨범이 없습니다. 새 앨범을 만들어보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <Link
                key={album.id}
                to={`/albums/${album.id}`}
                state={{ title: album.title, description: album.description }}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {album.coverImage ? (
                  <div className="relative h-48">
                    <img
                      src={`${process.env.REACT_APP_IMAGE_URL}${album.filePath}`}
                      alt={album.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{album.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{album.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    사진 {album.photoCount || 0}장 • 앨범 생성일 : {new Date(album.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Albums; 