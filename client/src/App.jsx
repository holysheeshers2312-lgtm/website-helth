import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useThemeStore } from './features/theme/themeStore';
import Layout from './components/Layout';
import Home from './pages/Home';
import Menu from './pages/Menu';
import ProductDetail from './pages/ProductDetail';
import Featured from './pages/Featured';
import TrackOrder from './pages/TrackOrder';
import Locations from './pages/Locations';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Checkout from './pages/Checkout';
import Support from './pages/Support';
import Login from './pages/Login';
import Account from './pages/Account';
import { useAuthStore } from './features/auth/authStore';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, verifyToken, token } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        const isValid = await verifyToken();
        setIsChecking(false);
      } else {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [token, verifyToken]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const { init, isInitialized } = useAuthStore();
  const isDark = useThemeStore((s) => s.isDark);

  useEffect(() => {
    if (!isInitialized) init();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/product/:id" element={<ProductDetail />} />
          <Route path="/featured" element={<Featured />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/locations" element={<Locations />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Support Routes */}
          <Route path="/support" element={<Support />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
