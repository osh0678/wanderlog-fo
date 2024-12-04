import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { photoAPI } from '../utils/apiService';
import useStore from '../stores/useStore';

function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { title, description } = location.state || { title: '', description: '' };
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const userId = useStore((state) => state.userId);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [photoUploads, setPhotoUploads] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        const photosData = await photoAPI.getPhotos(userId, id);
        setPhotos(photosData.data);
      } catch (err) {
        setError('앨범 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumData();
  }, [id, userId]);

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setError(null);
  };

  const openUploadModal = () => {
    setShowUploadModal(true);
    setPhotoUploads([]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newUploads = files.map(file => ({
      file,
      title: file.name.split('.')[0],
      description: '',
      takenAt: new Date().toISOString().split('T')[0],
      tags: []
    }));
    setPhotoUploads(prev => [...prev, ...newUploads]);
  };

  const handlePhotoInfoChange = (index, field, value) => {
    setPhotoUploads(prev => prev.map((upload, i) => 
      i === index ? { ...upload, [field]: value } : upload
    ));
  };

  const handleAddTag = (index, tag) => {
    if (!tag.trim()) return;
    setPhotoUploads(prev => prev.map((upload, i) => 
      i === index ? { ...upload, tags: [...upload.tags, tag.trim()] } : upload
    ));
  };

  const handleRemoveTag = (photoIndex, tagIndex) => {
    setPhotoUploads(prev => prev.map((upload, i) => 
      i === photoIndex ? {
        ...upload,
        tags: upload.tags.filter((_, tIndex) => tIndex !== tagIndex)
      } : upload
    ));
  };

  const handleUploadSubmit = async () => {
    if (photoUploads.length === 0) {
      setError('업로드할 사진을 선택해주세요.');
      return;
    }

    setUploadingPhotos(true);
    try {
      // 각 파일별로 개별 업로드
      const uploadPromises = photoUploads.map(async upload => {
        // 이미지 리사이징
        const resizedFile = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // 가로/세로 800px 제한
            if (width > 800 || height > 800) {
              if (width > height) {
                height = height * (800 / width);
                width = 800;
              } else {
                width = width * (800 / height); 
                height = 800;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
              // 500MB 제한
              if (blob.size > 500 * 1024 * 1024) {
                const quality = (500 * 1024 * 1024) / blob.size;
                canvas.toBlob((resizedBlob) => {
                  resolve(new File([resizedBlob], upload.file.name, {
                    type: 'image/jpeg',
                  }));
                }, 'image/jpeg', quality);
              } else {
                resolve(new File([blob], upload.file.name, {
                  type: 'image/jpeg', 
                }));
              }
            }, 'image/jpeg', 0.9);
          };
          img.src = URL.createObjectURL(upload.file);
        });

        const formData = new FormData();
        formData.append('file', resizedFile);
        formData.append('title', upload.title);
        formData.append('description', upload.description);
        formData.append('takenAt', upload.takenAt);
        formData.append('tags', JSON.stringify(upload.tags));
        
        return photoAPI.uploadPhoto(userId, id, formData);
      });

      // 모든 업로드가 완료될 때까지 대기
      const responses = await Promise.all(uploadPromises);
      
      // 마지막 응답의 데이터로 상태 업데이트
      const lastResponse = responses[responses.length - 1];
      setPhotos(lastResponse.data);
      
      setShowUploadModal(false);
      setPhotoUploads([]);
      alert('사진 업로드가 완료되었습니다.');
    } catch (err) {
      console.error('Upload error:', err);
      setError('사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleRemoveUpload = (index) => {
    setPhotoUploads(prev => prev.filter((_, i) => i !== index));
  };

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
    setPhotoToDelete(photo)
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
  };

  const handleDeleteClick = (e, photo) => {
    e.stopPropagation(); // 상세보기 모달이 열리는 것을 방지
    setPhotoToDelete(photo);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await photoAPI.deletePhoto(userId, photoToDelete.id);
      setPhotos(photos.filter(photo => photo.id !== photoToDelete.id));
      setShowPhotoModal(false);
      setShowDeleteModal(false);
      setPhotoToDelete(null);
      alert('사진 삭제가 완료되었습니다.');
    } catch (err) {
      setError('사진 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEditClick = () => {
    setEditData({
      title: selectedPhoto.title,
      description: selectedPhoto.description,
      takenAt: selectedPhoto.takenAt,
      tags: [...selectedPhoto.tags]
    });
    setIsEditMode(true);
  };

  const handleEditSubmit = async () => {
    try {
      await photoAPI.updatePhoto(selectedPhoto.id, editData);
      // 사진 목록 업데이트
      setPhotos(photos.map(photo => 
        photo.id === selectedPhoto.id ? { ...photo, ...editData } : photo
      ));
      setIsEditMode(false);
      setSelectedPhoto({ ...selectedPhoto, ...editData });
    } catch (err) {
      setError('사진 수정 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    // 모달이 하나라도 열려있는지 확인
    const isAnyModalOpen = showErrorModal || showPhotoModal || showUploadModal || showDeleteModal;
    
    if (isAnyModalOpen) {
      // 모달이 열릴 때 body에 overflow: hidden 적용
      document.body.style.overflow = 'hidden';
    } else {
      // 모달이 닫힐 때 원래대로 복구
      document.body.style.overflow = 'unset';
    }

    // 컴포넌트가 언마운트될 때 cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showErrorModal, showPhotoModal, showUploadModal, showDeleteModal]);

  if (loading) {
    return <div className="text-center py-10">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {showErrorModal && error && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center"
          onClick={closeErrorModal}
        >
          <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm mx-4 w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
                알림
              </h3>
            </div>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            <button
              onClick={closeErrorModal}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {showPhotoModal && selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={closePhotoModal}
        >
          <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-3xl mx-4 w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditMode ? '사진 수정' : '사진 상세'}
              </h3>
              <button
                onClick={closePhotoModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <img
              src={`${process.env.REACT_APP_IMAGE_URL}${selectedPhoto.filePath}`}
              alt={selectedPhoto.title || '앨범 사진'}
              className="w-full h-64 object-contain mb-4"
            />

            {isEditMode ? (
              // 수정 모드 폼
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    제목
                  </label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    설명
                  </label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    촬영일
                  </label>
                  <input
                    type="date"
                    value={editData.takenAt}
                    onChange={(e) => setEditData({ ...editData, takenAt: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    태그
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editData.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                      >
                        {tag}
                        <button
                          onClick={() => {
                            const newTags = editData.tags.filter((_, i) => i !== index);
                            setEditData({ ...editData, tags: newTags });
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="태그 입력 후 Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const newTag = e.target.value.trim();
                        if (newTag && !editData.tags.includes(newTag)) {
                          setEditData({
                            ...editData,
                            tags: [...editData.tags, newTag]
                          });
                          e.target.value = '';
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setShowPhotoModal(false);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              // 상세 보기 모드
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedPhoto.title || '제목 없음'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {selectedPhoto.description || '설명 없음'}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  촬영일: {selectedPhoto.takenAt || '날짜 정보 없음'}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPhoto.tags && selectedPhoto.tags.length > 0 ? (
                    selectedPhoto.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">태그 없음</span>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto py-8 px-2">
          <div 
            className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-4xl max-h-[75vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                사진 업로드
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl p-2"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="cursor-pointer inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-base">
                사진 선택
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 mb-4">
              {photoUploads.map((upload, index) => (
                <div key={index} className="border dark:border-gray-700 rounded-lg p-3">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-40 h-40 flex-shrink-0 relative group">
                      <img
                        src={URL.createObjectURL(upload.file)}
                        alt="미리보기"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveUpload(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex-grow space-y-3">
                      <div>
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                          제목
                        </label>
                        <input
                          type="text"
                          value={upload.title}
                          onChange={(e) => handlePhotoInfoChange(index, 'title', e.target.value)}
                          className="w-full px-4 py-2 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                          설명
                        </label>
                        <textarea
                          value={upload.description}
                          onChange={(e) => handlePhotoInfoChange(index, 'description', e.target.value)}
                          className="w-full px-4 py-2 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                          rows="2"
                        />
                      </div>

                      <div>
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                          촬영일
                        </label>
                        <input
                          type="date"
                          value={upload.takenAt}
                          onChange={(e) => handlePhotoInfoChange(index, 'takenAt', e.target.value)}
                          className="w-full px-4 py-2 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                          태그
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {upload.tags.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-base flex items-center"
                            >
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(index, tagIndex)}
                                className="ml-2 text-blue-600 hover:text-blue-800 text-xl"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="태그 입력 후 Enter"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const newTag = e.target.value.trim();
                              if (newTag && !upload.tags.includes(newTag)) {
                                handleAddTag(index, newTag);
                                e.target.value = '';
                              } else if (upload.tags.includes(newTag)) {
                                setError('이미 존재하는 태그입니다.');
                              }
                            }
                          }}
                          className="w-full px-4 py-2 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 border-t dark:border-gray-700 pt-4 bg-white dark:bg-gray-800 p-4 sticky bottom-0">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-2 text-base bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                취소
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={uploadingPhotos || photoUploads.length === 0}
                className="px-6 py-2 text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploadingPhotos ? '업로드 중...' : '업로드'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm mx-4 w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              사진 삭제
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              정말 이 사진을 삭제하시겠습니까?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPhotoToDelete(null);
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
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <button
            onClick={() => navigate('/albums')}
            className="absolute left-0 top-0 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="ml-8 flex-grow">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {title || '제목 없음'}
            </h1>
            <div className="flex items-center">
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                {description || '설명 없음'}
              </p>
            </div>
          </div>

          <button
            onClick={openUploadModal}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
            disabled={uploadingPhotos}
          >
            사진 추가
          </button>
        </div>

        {uploadingPhotos && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
            사진을 업로드하는 중입니다...
          </div>
        )}

        {photos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-400">
              아직 사진이 없습니다. 새로운 사진을 추가해보세요!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8 gap-4 auto-rows-fr">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group rounded-lg overflow-hidden bg-gray-200 aspect-square w-full h-full"
                onClick={() => openPhotoModal(photo)}
              >
                <img
                  src={`${process.env.REACT_APP_IMAGE_URL}${photo.filePath}?w=300&h=300&fit=crop`}
                  alt={photo.caption || '앨범 사진'} 
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
                <button
                  onClick={(e) => handleDeleteClick(e, photo)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      className="bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100"
                    >
                      상세보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AlbumDetail; 