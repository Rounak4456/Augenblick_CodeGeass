import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Services from './pages/Services'
import { AuthProvider } from './firebase/AuthContext'
import UserDocs from './pages/UserDocs'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <AuthProvider>
      <Router>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/services" element={<Services/>}/>
          <Route path="/user-docs" element={<UserDocs/>}/>
        </Routes>
        <Footer/>
      </Router>
      </AuthProvider>
    </>
  )
}

export default App
