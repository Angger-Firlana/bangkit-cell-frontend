import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import authService from '../services/auth.service';
import { useAuthStore, type AuthState } from '../stores/useAuthStore';
import LogoMark from '../components/brand/LogoMark';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const setAuth = useAuthStore((state: AuthState) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({ identifier, password });
      if (response.success) {
        setAuth(response.data.user, response.data.token);
        navigate('/');
      } else {
        setError(response.message || 'Login gagal. Silakan cek kembali email dan password Anda.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan sistem. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200 mb-4">
            <LogoMark className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">BangkitCell</h1>
          <p className="text-slate-500 font-medium">Sistem Manajemen Toko & Service HP</p>
        </div>

        <Card className="p-8 border-none shadow-xl shadow-slate-200/60 rounded-[2.5rem]">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-600 text-sm font-semibold animate-shake">
                <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="admin@bangkitcell.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                icon={<Mail className="h-4 w-4 text-slate-400" />}
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock className="h-4 w-4 text-slate-400" />}
              />
            </div>

            <Button
              type="submit"
              className="w-full py-4 text-base shadow-lg shadow-blue-200"
              isLoading={isLoading}
            >
              Masuk ke Sistem
            </Button>

            <div className="text-center">
              <p className="text-xs text-slate-400 font-medium italic">
                Lupa password? Hubungi Administrator Toko.
              </p>
            </div>
          </form>
        </Card>
        
        <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          &copy; 2026 BangkitCell v1.0
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
