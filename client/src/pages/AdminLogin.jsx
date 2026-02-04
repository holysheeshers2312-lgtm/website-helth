import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="bg-surface p-8 rounded-2xl border border-white/5 w-full max-w-md text-center">
                <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary">
                    <Lock size={32} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-white mb-6">Admin Access</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="password"
                        placeholder="Enter Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
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
