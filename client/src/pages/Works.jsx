import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase/FirebaseConfig';
import { useAuth } from '../firebase/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);
export default function Works() {
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [collaborativeDocs, setCollaborativeDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCollaborators, setShowCollaborators] = useState({});
  const [statistics, setStatistics] = useState({
    totalDocs: 0,
    totalCollaborators: 0,
    activeDocuments: 0,
    recentEdits: 0
  });
  const [showChart, setShowChart] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;

      try {
        // Query documents where user is a collaborator
        const collaboratorQuery = query(
          collection(db, 'documents'),
          where('collaborators', 'array-contains', user.email)
        );

        // Query documents where user is the owner
        const ownerQuery = query(
          collection(db, 'documents'),
          where('userEmail', '==', user.email)
        );

        const [collaboratorDocs, ownerDocs] = await Promise.all([
          getDocs(collaboratorQuery),
          getDocs(ownerQuery)
        ]);

        const owned = ownerDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastEdited: new Date(doc.data().updatedAt).toLocaleDateString()
        }));

        const collaborated = collaboratorDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastEdited: new Date(doc.data().updatedAt).toLocaleDateString()
        }));

        setOwnedDocs(owned);
        setCollaborativeDocs(collaborated);

        // Calculate statistics
        const now = new Date();
        const recentEdits = [...owned, ...collaborated].filter(doc => {
          const editDate = new Date(doc.updatedAt);
          const diffDays = (now - editDate) / (1000 * 60 * 60 * 24);
          return diffDays <= 7; // edited in last 7 days
        }).length;

        const activeDocsCount = [...owned, ...collaborated].filter(doc =>
          doc.activeUsers?.length > 0
        ).length;

        const uniqueCollaborators = new Set(
          [...owned, ...collaborated].flatMap(doc => doc.collaborators || [])
        );

        setStatistics({
          totalDocs: owned.length + collaborated.length,
          totalCollaborators: uniqueCollaborators.size,
          activeDocuments: activeDocsCount,
          recentEdits
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user]);

  const toggleCollaborators = (docId) => {
    setShowCollaborators(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const DocumentCard = ({ doc, isOwned }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
    >
      <Link to={`/services?doc=${doc.id}`} className="block p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {doc.title || 'Untitled Document'}
            </h3>
            <p className="text-sm text-gray-500">
              Last edited: {doc.lastEdited}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${isOwned ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
            }`}>
            {isOwned ? 'Owner' : 'Collaborator'}
          </span>
        </div>

        <div className="space-y-3">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              toggleCollaborators(doc.id);
            }}
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">
                {doc.collaborators?.length || 0} collaborators
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${showCollaborators[doc.id] ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <AnimatePresence>
            {showCollaborators[doc.id] && doc.collaborators?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-6 space-y-2"
              >
                {doc.collaborators.map((email, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                      {email[0].toUpperCase()}
                    </div>
                    {email}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {doc.activeUsers?.length > 0 && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              <span className="text-sm text-green-600">
                {doc.activeUsers.length} active now
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );

  const handleShowChart = () => {
    setShowChart(!showChart);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view your works</h2>
          <p className="text-gray-600">Connect with your collaborators and manage your documents.</p>
        </div>
      </div>
    );
  }

  const [expandedStats, setExpandedStats] = useState({});
  const getChartId = (statKey) => `chart-${statKey}`;
  const toggleStatExpand = (statKey) => {
    setExpandedStats(prev => ({
      ...prev,
      [statKey]: !prev[statKey]
    }));
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            {
              key: 'totalDocs',
              label: 'Total Documents',
              value: statistics.totalDocs,
              icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
              chartData: {
                labels: ['Owned Documents', 'Collaborative Documents'],
                datasets: [{
                  data: [ownedDocs.length, collaborativeDocs.length],
                  backgroundColor: ['#4CAF50', '#2196F3'],
                  hoverBackgroundColor: ['#45a049', '#1e88e5']
                }]
              }
            },
            {
              key: 'totalCollaborators',
              label: 'Total Collaborators',
              value: statistics.totalCollaborators,
              icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
              chartData: {
                labels: [...new Set([...ownedDocs, ...collaborativeDocs].flatMap(doc => doc.collaborators || []))].slice(0, 5),
                datasets: [{
                  data: [...new Set([...ownedDocs, ...collaborativeDocs].flatMap(doc => doc.collaborators || []))].slice(0, 5).map(() => 1),
                  backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#F44336'],
                  hoverBackgroundColor: ['#45a049', '#1e88e5', '#ffb300', '#8e24aa', '#e53935']
                }]
              }
            },
            {
              key: 'activeDocuments',
              label: 'Active Documents',
              value: statistics.activeDocuments,
              icon: 'M13 10V3L4 14h7v7l9-11h-7z',
              chartData: {
                labels: ['Active', 'Inactive'],
                datasets: [{
                  data: [statistics.activeDocuments, statistics.totalDocs - statistics.activeDocuments],
                  backgroundColor: ['#4CAF50', '#E0E0E0'],
                  hoverBackgroundColor: ['#45a049', '#BDBDBD']
                }]
              }
            },
            {
              key: 'recentEdits',
              label: 'Recent Edits',
              value: statistics.recentEdits,
              icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
              chartData: {
                labels: ['Recent Edits', 'Older Documents'],
                datasets: [{
                  data: [statistics.recentEdits, statistics.totalDocs - statistics.recentEdits],
                  backgroundColor: ['#4CAF50', '#E0E0E0'],
                  hoverBackgroundColor: ['#45a049', '#BDBDBD']
                }]
              }
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => toggleStatExpand(stat.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-black rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedStats[stat.key] ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <AnimatePresence>
                {expandedStats[stat.key] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                  >
                    <div className="h-[200px] pt-4 border-t border-gray-100">
                      <Pie
                        data={stat.chartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                boxWidth: 12,
                                padding: 15,
                                font: {
                                  size: 11
                                }
                              }
                            },
                            tooltip: {
                              callbacks: {
                                label: (context) => {
                                  let label = context.label || '';
                                  if (label) {
                                    label += ': ';
                                  }
                                  if (stat.key === 'totalCollaborators') {
                                    return label + 'Collaborator';
                                  }
                                  return label + context.raw;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Remove the old chart section since we now have individual charts */}
        {/* Show Pie Chart */}
        {/* {showChart && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Document Statistics</h2>
            <Pie
              data={{
                labels: ['Owned Documents', 'Collaborative Documents'],
                datasets: [{
                  data: [ownedDocs.length, collaborativeDocs.length],
                  backgroundColor: ['#4CAF50', '#2196F3'],
                  hoverBackgroundColor: ['#45a049', '#1e88e5']
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        let label = context.label || '';
                        if (label) {
                          label += ': ';
                        }
                        label += context.raw;
                        return label;
                      }
                    }
                  }
                }
              }}
              height={300}
            />
          </div>
        )} */}

        {/* Documents Sections */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Owned Documents */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Documents You Own</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedDocs.length > 0 ? (
                  ownedDocs.map(doc => (
                    <DocumentCard key={doc.id} doc={doc} isOwned={true} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 bg-gray-50 rounded-xl">
                    <p className="text-gray-600">No documents owned yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Collaborative Documents */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shared With You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collaborativeDocs.length > 0 ? (
                  collaborativeDocs.map(doc => (
                    <DocumentCard key={doc.id} doc={doc} isOwned={false} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 bg-gray-50 rounded-xl">
                    <p className="text-gray-600">No shared documents yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
