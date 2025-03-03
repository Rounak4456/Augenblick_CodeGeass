import { useState, useEffect } from 'react';
import { db } from '../firebase/FirebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../firebase/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function UserDocs() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDocs = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'documents'),
          where('userId', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setDocuments(docs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setLoading(false);
      }
    };

    fetchUserDocs();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please sign in to view your documents</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Documents</h1>
          <button
            onClick={() => navigate('/services')}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-all duration-300 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Document</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : documents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <h3 className="text-xl font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-500 mb-6">Start creating your first document</p>
            <button
              onClick={() => navigate('/services')}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-all duration-300"
            >
              Create Document
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full border border-gray-200"
                      />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{doc.createdBy}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div 
                    className="prose prose-sm max-w-none mb-4 text-gray-600 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: doc.content }}
                  />
                  <button
                    onClick={() => navigate(`/services?doc=${doc.id}`)}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300"
                  >
                    Open Document →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}