import { useState, useEffect } from 'react';
import { albumAPI } from '../utils/apiService';

function AlbumList() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const data = await albumAPI.getAlbums();
        setAlbums(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {albums.map((album) => (
        <div key={album.id} className="p-4 border rounded-lg">
          <h3 className="font-bold">{album.title}</h3>
          <p>{album.description}</p>
        </div>
      ))}
    </div>
  );
}

export default AlbumList; 