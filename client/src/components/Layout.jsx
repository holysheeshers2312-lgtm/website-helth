import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNav from './MobileNav';

export default function Layout({ children }) {
    const { pathname } = useLocation();

    // Check if current route is an admin route
    const isAdminRoute = pathname.startsWith('/admin');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-background text-gray-900 dark:text-white flex flex-col">
            {!isAdminRoute && <Navbar />}
            <main className={`flex-grow ${!isAdminRoute ? 'pt-20' : ''}`}>
                {children}
            </main>
            {!isAdminRoute && <Footer />}
            {!isAdminRoute && <MobileNav />}
        </div>
    );
}
