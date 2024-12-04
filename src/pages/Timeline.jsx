import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../stores/useStore';
import { photoAPI } from '../utils/apiService';

function Timeline() {
  const navigate = useNavigate();
  const { userId } = useStore();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    location: '',
    tags: []
  });
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [userId, navigate]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await photoAPI.getTimelinePhotos(userId);
        
        // 모든 태그 수집
        const tags = new Set();
        response.data.forEach(photo => {
          photo.tags?.forEach(tag => tags.add(tag));
        });
        setAllTags(Array.from(tags));

        // 태그로 필터링
        const filteredPhotos = selectedTag
          ? response.data.filter(photo => photo.tags?.includes(selectedTag))
          : response.data;

        // 날짜별로 사진 그룹화
        const groupedPhotos = filteredPhotos.reduce((groups, photo) => {
          const date = new Date(photo.takenAt).toLocaleDateString();
          if (!groups[date]) {
            groups[date] = [];
          }
          groups[date].push(photo);
          return groups;
        }, {});
        setPhotos(groupedPhotos);
      } catch (err) {
        console.error('Failed to fetch photos:', err);
        setError('사진을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPhotos();
    }
  }, [userId, selectedTag]);

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setEditData({
      title: photo.title,
      location: photo.location || '',
      tags: photo.tags || []
    });
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
    setEditMode(false);
    setEditData({
      title: '',
      location: '',
      tags: []
    });
  };

  const handleEditSubmit = async () => {
    try {
      await photoAPI.updatePhoto(userId, selectedPhoto.id, editData);
      // 성공적으로 수정되면 사진 목록 새로고침
      const response = await photoAPI.getTimelinePhotos(userId);
      const groupedPhotos = response.data.reduce((groups, photo) => {
        const date = new Date(photo.takenAt).toLocaleDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(photo);
        return groups;
      }, {});
      setPhotos(groupedPhotos);
      handleCloseModal();
    } catch (err) {
      console.error('Failed to update photo:', err);
      setError('사진 정보 수정에 실패했습니다.');
    }
  };

  const handleAddTag = (tagValue) => {
    const newTag = tagValue.trim().toLowerCase(); // 태그를 소문자로 통일
    if (newTag && !editData.tags.includes(newTag)) { // 중복 체크
      setEditData({
        ...editData,
        tags: [...editData.tags, newTag]
      });
      return true; // 태그가 추가되었음을 알림
    }
    return false; // 태그가 추가되지 않았음을 알림
  };

  const handleTagSelect = (tag) => {
    setSelectedTag(tag === selectedTag ? '' : tag);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">타임라인</h1>
          <p className="text-gray-600 dark:text-gray-400">시간순으로 추억을 돌아보세요</p>
        </div>

        {/* 타그 필터 추가 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">태그로 필터링</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagSelect(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTag === tag
                    ? 'bg-purple-500 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                #{tag}
              </button>
            ))}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag('')}
                className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                필터 초기화
              </button>
            )}
          </div>
        </div>

        {/* 타임라인 */}
        <div className="space-y-8">
          {Object.entries(photos).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([date, datePhotos]) => (
            <div key={date} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* 날짜 헤더 */}
              <div className="bg-purple-500 text-white px-6 py-3">
                <h2 className="text-lg font-semibold">{date}</h2>
              </div>

              {/* 사진 그리드 */}
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {datePhotos.map((photo) => (
                    <div 
                      key={photo.id} 
                      className="aspect-square relative group cursor-pointer"
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <img
                        src={`${process.env.REACT_APP_IMAGE_URL}${photo.filePath}?w=300&h=300&fit=crop`}
                        alt={photo.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center p-2">
                          <p className="text-sm font-semibold">{photo.title}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {Object.keys(photos).length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">사진이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                아직 업로드된 사진이 없습니다.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/albums')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-600"
                >
                  앨범으로 이동
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 사진 상세 모달 */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editMode ? '사진 정보 수정' : '사진 상세정보'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 사진 */}
              <div className="aspect-square max-w-[300px] mx-auto">
                <img
                  src={`${process.env.REACT_APP_IMAGE_URL}${selectedPhoto.filePath}?w=100&h=100&fit=crop`}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* 정보 */}
              <div className="space-y-4">
                {editMode ? (
                  // 수정 폼
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        제목
                      </label>
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        내용
                      </label>
                      <textarea
                        value={editData.description}
                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        태그
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editData.tags.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm flex items-center"
                          >
                            {tag}
                            <button
                              onClick={() => {
                                const newTags = editData.tags.filter((_, i) => i !== tagIndex);
                                setEditData({...editData, tags: newTags});
                              }}
                              className="ml-1 text-purple-600 hover:text-purple-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="새 태그 입력"
                          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const added = handleAddTag(e.target.value);
                              if (added) {
                                e.target.value = ''; // 성공적으로 추가된 경우에만 입력창 초기화
                              } else {
                                // 중복된 태그인 경우 알림
                                alert('이미 존재하는 태그입니다.');
                              }
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.target.previousSibling;
                            const added = handleAddTag(input.value);
                            if (added) {
                              input.value = ''; // 성공적으로 추가된 경우에만 입력창 초기화
                            } else {
                              // 중복된 태그인 경우 알림
                              alert('이미 존재하는 태그입니다.');
                            }
                          }}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                          추가
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 정보 표시
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">제목</h4>
                      <p className="text-gray-900 dark:text-white">{selectedPhoto.title}</p>
                    </div>
                    {selectedPhoto.description && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">내용</h4>
                        <p className="text-gray-900 dark:text-white">{selectedPhoto.description}</p>
                      </div>
                    )}
                    {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">태그</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedPhoto.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">앨범</h4>
                      <p className="text-gray-900 dark:text-white">{selectedPhoto.albumTitle}</p>
                    </div>
                  </div>
                )}

                {/* 버튼 그룹 */}
                <div className="flex gap-2 mt-4">
                  {editMode ? (
                    <>
                      <button
                        onClick={handleEditSubmit}
                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                      >
                        수정
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        onClick={() => navigate(`/albums/${selectedPhoto.albumId}`, {
                            state: {
                                title: selectedPhoto.albumTitle,
                                description: selectedPhoto.albumDescription
                            }
                        })}
                      >
                        앨범으로 이동
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timeline; 