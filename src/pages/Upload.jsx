function Upload() {
  const handleFileUpload = (e) => {
    // 파일 업로드 로직 구현
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">사진 업로드</h1>
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handleFileUpload}
            className="hidden" 
            id="fileInput" 
          />
          <label 
            htmlFor="fileInput"
            className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            클릭하여 사진 선택하기
          </label>
        </div>
      </div>
    </div>
  );
}

export default Upload; 