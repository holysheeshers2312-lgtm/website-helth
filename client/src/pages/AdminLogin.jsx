import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Simple hardcoded check for v1
        if (password === 'admin123') {
            localStorage.setItem('isAdmin', 'true');
            navigate('/admin/dashboard');
        } else {
            setError('Invalid Password');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative">
            <div className="absolute top-6 right-6">
                <ThemeToggle />
            </div>
            <div className="bg-surface p-8 rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg w-full max-w-md text-center">
                <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary">
                    <Lock size={32} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Admin Access</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="password"
                        placeholder="Enter Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary focus:outline-none transition-colors"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button type="submit" className="w-full bg-primary text-background font-bold py-3 rounded-lg hover:bg-accent transition-colors">
                        Unlock Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
}
