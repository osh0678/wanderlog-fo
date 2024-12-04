import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { albumAPI } from '../utils/apiService';
import useStore from '../stores/useStore';
import { useNavigate } from 'react-router-dom';

function Albums() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = useStore((state) => state.userId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState(null);

  useEffect(() => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [userId, navigate]);

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

  const handleDeleteClick = (e, album) => {
    e.preventDefault(); // Link 이벤트 방지
    e.stopPropagation(); // 이벤트 전파 방지
    setAlbumToDelete(album);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await albumAPI.deleteAlbum(userId, albumToDelete.id);
      const data = await albumAPI.getAlbums(userId);
      setAlbums(data.data);
      setShowDeleteModal(false);
      setAlbumToDelete(null);
      alert('앨범 삭제가 완료되었습니다.');
    } catch (err) {
      setError('앨범 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <div className="text-center py-10">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              앨범 삭제
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              정말 "{albumToDelete?.title}" 앨범을 삭제하시겠습니까?<br />
              삭제된 앨범은 복구할 수 없습니다.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAlbumToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div key={album.id} className="relative group">
                <Link
                  to={`/albums/${album.id}`}
                  state={{ title: album.title, description: album.description }}
                  className="block bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative">
                    {album.coverPhotoUrl ? (
                      <div className="h-48">
                        <img
                          src={`${process.env.REACT_APP_IMAGE_URL}${album.coverPhotoUrl}`}
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
                    <button
                      onClick={(e) => handleDeleteClick(e, album)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 
                        transition-colors duration-200 z-10 shadow-md"
                      aria-label="앨범 삭제"
                    >
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M6 18L18 6M6 6l12 12" 
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{album.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{album.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      사진 {album.photoCount || 0}장 • 앨범 생성일 : {new Date(album.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Albums; 