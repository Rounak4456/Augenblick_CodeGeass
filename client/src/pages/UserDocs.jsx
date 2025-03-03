import { useState, useEffect } from 'react';
import { db } from '../firebase/FirebaseConfig';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../firebase/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function UserDocs() {
  const [ownedDocuments, setOwnedDocuments] = useState([]);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Set up real-time listeners
    const unsubscribeOwned = setupOwnedDocsListener();
    const unsubscribeShared = setupSharedDocsListener();

    // Cleanup listeners on unmount
    return () => {
      if (unsubscribeOwned) unsubscribeOwned();
      if (unsubscribeShared) unsubscribeShared();
    };
  }, [user]);

  const setupOwnedDocsListener = () => {
    if (!user) return null;

    // Query for documents owned by the user
    const q = query(
      collection(db, 'documents'),
      where('userId', '==', user.uid)
    );

    // Set up real-time listener
    return onSnapshot(q, (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isOwner: true
      }));
      
      setOwnedDocuments(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching owned documents:", error);
      setLoading(false);
    });
  };

  const setupSharedDocsListener = () => {
    if (!user) return null;

    // Query for documents where user is a collaborator
    const q = query(
      collection(db, 'documents'),
      where('collaborators', 'array-contains', user.email)
    );

    // Set up real-time listener
    return onSnapshot(q, (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isOwner: false
      }));
      
      setSharedDocuments(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching shared documents:", error);
      setLoading(false);
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please sign in to view your documents</h2>
        </div>
      </div>
    );
  }

  // Combine owned and shared documents
  const allDocuments = [...ownedDocuments, ...sharedDocuments];

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
        ) : allDocuments.length === 0 ? (
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
          <>
            {/* Owned Documents Section */}
            {ownedDocuments.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">My Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownedDocuments.map((doc) => (
                    <DocumentCard 
                      key={doc.id} 
                      doc={doc} 
                      user={user} 
                      navigate={navigate} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Shared Documents Section */}
            {sharedDocuments.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Shared with me</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sharedDocuments.map((doc) => (
                    <DocumentCard 
                      key={doc.id} 
                      doc={doc} 
                      user={user} 
                      navigate={navigate} 
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Document Card Component
function DocumentCard({ doc, user, navigate }) {
  // Calculate time difference for "last edited" display
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const now = new Date();
    const updatedDate = new Date(timestamp);
    const diffMs = now - updatedDate;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return updatedDate.toLocaleDateString();
  };

  // Extract document title or use a fallback
  const title = doc.title || 'Untitled Document';
  
  // Get collaborator count
  const collaboratorCount = doc.collaborators?.length || 0;

  // Get document preview - strip HTML tags for plain text preview
  const getPreview = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.substring(0, 150) + (text.length > 150 ? '...' : '');
  };

  const preview = getPreview(doc.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={doc.isOwner ? user.photoURL : 'https://via.placeholder.com/40'}
              alt={doc.createdBy || user.displayName}
              className="w-8 h-8 rounded-full border border-gray-200"
            />
            <div>
              <h3 className="text-sm font-medium text-gray-900">{doc.createdBy || user.displayName}</h3>
              <p className="text-xs text-gray-500">
                {doc.updatedAt ? getTimeAgo(doc.updatedAt) : 'Unknown time'}
              </p>
            </div>
          </div>
          
          {/* Document access badge */}
          <div className="flex items-center">
            {doc.isOwner ? (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Owner</span>
            ) : (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Shared</span>
            )}
          </div>
        </div>
        
        {/* Document title */}
        <h2 className="text-lg font-medium text-gray-900 mb-2 truncate">{title}</h2>
        
        {/* Document preview */}
        <div className="prose prose-sm max-w-none mb-4 text-gray-600 line-clamp-3 h-16 overflow-hidden">
          {preview}
        </div>
        
        {/* Footer with collaborator info and open button */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            {collaboratorCount > 0 ? (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {collaboratorCount} collaborator{collaboratorCount !== 1 ? 's' : ''}
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V9m0 0V7m0 2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Private
              </div>
            )}
          </div>
          
          <button
            onClick={() => navigate(`/services?doc=${doc.id}`)}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300 flex items-center"
          >
            <span>Open</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}