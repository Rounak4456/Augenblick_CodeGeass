import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/FirebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth } from '../firebase/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/services');
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-black via-gray-900 to-black shadow-xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 -ml-2 flex items-center space-x-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-white text-2xl font-extrabold tracking-wider">
              Augenblick
            </span>
            <span className="text-gray-500 text-sm font-light border-l border-gray-700 pl-2">Content Studio</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-10">
              <a href="/portfolio" className="text-gray-400 hover:text-white px-3 py-2 text-base font-medium transition-all duration-300 hover:scale-105 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
                Works
              </a>
              <a href="/services" className="text-gray-400 hover:text-white px-3 py-2 text-base font-medium transition-all duration-300 hover:scale-105 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"/>
                </svg>
                Services
              </a>
              <a href="/blog" className="text-gray-400 hover:text-white px-3 py-2 text-base font-medium transition-all duration-300 hover:scale-105 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd"/>
                </svg>
                Blog
              </a>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border border-gray-400"
                    />
                    <span className="text-gray-300">{user.displayName}</span>
                  </div>
                  <button 
                    onClick={() => auth.signOut()}
                    className="text-gray-400 hover:text-white px-3 py-2 text-base font-medium transition-all duration-300 hover:scale-105"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleGoogleSignIn}
                  className="relative bg-gradient-to-r from-white to-gray-300 text-black px-8 py-2.5 rounded-full font-semibold text-base border-2 border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-105 hover:from-gray-100 hover:to-white group"
                >
                  <span className="relative z-10">Start Writing</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-10 rounded-full transition-opacity duration-300"></div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}