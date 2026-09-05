import OwnerLayout from '../components/OwnerLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function MyStations() {
  const { user } = useAuth();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/stations/owner`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStations(res.data);
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast.error('Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OwnerLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🏪 My Stations</h1>
        
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading stations...</div>
        ) : stations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">You haven't added any stations yet.</p>
            <Link to="/add-station" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-lg">
              Add Your First Station
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map(station => (
              <div key={station.id} className="bg-white rounded-xl shadow-md p-5">
                <h3 className="text-lg font-bold text-primary">{station.name}</h3>
                <p className="text-gray-500 text-sm">{station.location}</p>
                <div className="mt-3 flex gap-2">
                  <Link 
                    to={`/update-status/${station.id}`}
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded"
                  >
                    Update Status
                  </Link>
                  <button className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}