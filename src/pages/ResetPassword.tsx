import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { request } from '@/integrations/api/client';
import { Eye, EyeOff, Lock } from 'lucide-react';

const translateAuthError = (msg?: string): string => {
  if (!msg) return '';
  const m = msg.toLowerCase();
  if (m.includes('different from the old password')) {
    return 'A nova senha deve ser diferente da senha atual.';
  }
  if (m.includes('password should be at least')) {
    return 'A senha deve ter entre 8 e 72 caracteres.';
  }
  if (m.includes('same as the old password')) {
    return 'A nova senha deve ser diferente da senha atual.';
  }
  if (m.includes('weak password') || m.includes('password is too weak')) {
    return 'Senha muito fraca. Use uma combinação mais forte.';
  }
  if (m.includes('invalid') && m.includes('token')) {
    return 'Link de redefinição inválido ou expirado. Solicite um novo.';
  }
  if (m.includes('expired')) {
    return 'O link de redefinição expirou. Solicite um novo.';
  }
  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  }
  if (m.includes('network') || m.includes('failed to fetch')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }
  return msg;
};

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') || searchParams.get('token') || '');
  useEffect(() => {
    window.history.replaceState(null, '', window.location.pathname);
    setIsReady(!!token);
    if (!token) setError('Link de recuperação inválido. Solicite um novo link.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações
    if (!password || !confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setError('A senha deve ter entre 8 e 72 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);

    try {
      await request('/auth/reset-password', 'POST', {token, newPassword: password});
      const result = {success: true, error: undefined};
      
      if (result.success) {
        localStorage.removeItem('xopy-jwt-session');
        sessionStorage.removeItem('xopy_recovery_flow');
        setSuccess('Senha atualizada com sucesso! Redirecionando para o login...');
        setTimeout(() => {
          window.location.replace('/login');
        }, 3000);
      } else {
        setError(translateAuthError(result.error) || 'Erro ao atualizar senha. Tente novamente.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-orange-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-orange-600">
            Xopy
          </h2>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-orange-600">
              Redefinir Senha
            </CardTitle>
            <CardDescription className="text-center">
              Digite sua nova senha abaixo
            </CardDescription>
            <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
              <p className="text-orange-800 text-sm text-center">
                ⚠️ Este link expira em 1 hora após o envio do email
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4" style={{ display: isReady ? undefined : 'none' }}>
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    required
                    minLength={8}
                    maxLength={72}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    required
                    minLength={8}
                    maxLength={72}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Atualizando...' : 'Atualizar Senha'}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => navigate('/login')}
                className="text-sm text-orange-600 hover:text-orange-500"
              >
                Voltar ao login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;