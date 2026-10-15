import { MaskedInput } from '@/components/ui/masked-input';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks';
import { UserType } from '@/contexts/AuthContext';
import { toast } from 'sonner';
const Auth: React.FC = () => {
  const navigate = useNavigate();
  const {
    login,
    register,
    resetPassword,
    isAuthenticated,
    isLoading
  } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    userType: 'customer' as UserType
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    const searchParams = new URLSearchParams(window.location.search);
    const isRecoveryFlow =
      hashParams.get('type') === 'recovery' ||
      hashParams.get('flow') === 'recovery' ||
      searchParams.get('type') === 'recovery' ||
      searchParams.get('flow') === 'recovery' ||
      searchParams.has('code') ||
      hashParams.has('token_hash') ||
      sessionStorage.getItem('xopy_recovery_flow') === 'true';

    // Só redirecionar se realmente estiver autenticado e não estiver carregando
    // Adicionar um pequeno delay para evitar loops de redirecionamento
    if (isAuthenticated && !isLoading && !isRecoveryFlow) {
      const timer = setTimeout(() => {
        navigate('/', {
          replace: true
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, navigate]);
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (isForgotPassword) {
        // Recuperação de senha
        const result = await resetPassword(formData.email);
        if (result.success) {
          setSuccess(result.message || 'Email de recuperação enviado!');
          toast.success(result.message || 'Se o e-mail estiver cadastrado, você receberá o link.');

          // Voltar para o login após 3 segundos
          setTimeout(() => {
            setIsForgotPassword(false);
            setSuccess('');
          }, 3000);
        } else {
          setError(result.error || 'Erro ao enviar email de recuperação');
          toast.error(result.error || 'Erro ao enviar email de recuperação');
        }
      } else if (mode === 'login') {
        const result = await login(formData.email, formData.password, 'customer');
        if (result.success) {
          toast.success('Login realizado com sucesso!');
          navigate('/');
        } else {
          setError(result.error || 'Erro no login');
          toast.error(result.error || 'Erro no login');
        }
      } else {
        if (!formData.fullName.trim()) {
          toast.error('Nome completo é obrigatório');
          return;
        }
        const result = await register({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          type: formData.userType
        });
        if (result.success) {
          if (result.message) {
            toast.success(result.message);
            // Aguardar um pouco antes de navegar para dar tempo do toast aparecer
            setTimeout(() => {
              navigate('/');
            }, 2000);
          } else {
            toast.success('Conta criada com sucesso!');
            navigate('/');
          }
        } else {
          toast.error(result.message || 'Erro no registro');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Erro inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setMode('login');
    setError('');
    setSuccess('');
    setFormData({
      email: formData.email,
      password: '',
      fullName: '',
      phone: '',
      userType: 'customer'
    });
  };
  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setError('');
    setSuccess('');
  };
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setIsForgotPassword(false);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      fullName: '',
      phone: '',
      userType: 'customer'
    });
  };
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 light">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>;
  }
  return <div className="min-h-screen bg-white flex items-center justify-center p-4 light">
      <Card className="w-full max-w-md bg-gray-50 border-gray-200 shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-2 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          {/* Logo/Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg tracking-wider">XOPY</span>
            </div>
          </div>
          
         <CardTitle className="text-2xl font-bold text-center text-gray-800">
            {isForgotPassword ? 'Recuperar Senha' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            {isForgotPassword ? 'Digite seu email para receber as instruções de recuperação' : mode === 'login' ? 'Entre com suas credenciais para acessar sua conta' : 'Preencha os dados abaixo para criar sua conta'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Mensagens de erro e sucesso */}
          {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>}
          
          {success && <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && !isForgotPassword && <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="fullName" placeholder="Seu nome completo" value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className="pl-10 bg-zinc-200 text-gray-800" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (opcional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <MaskedInput mask="phone" id="phone" placeholder="(11) 99999-9999" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="pl-10 bg-zinc-200 text-gray-800" />
                  </div>
                </div>
              </>}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required className="pl-10 bg-zinc-200 text-gray-800" />
              </div>
            </div>

            {!isForgotPassword && <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Sua senha" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} required minLength={6} className="pl-10 pr-10 bg-zinc-200 text-gray-800" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1 h-8 w-8 p-0">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>}

            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isForgotPassword ? 'Enviando...' : mode === 'login' ? 'Entrando...' : 'Criando conta...'}
                </div> : isForgotPassword ? 'Enviar email de recuperação' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          {/* Links de navegação */}
          {isForgotPassword ? <div className="mt-4 text-center">
              <Button variant="link" onClick={handleBackToLogin} className="text-sm" disabled={isSubmitting}>
                Voltar ao login
              </Button>
            </div> : <>
              {/* Link Esqueceu sua senha - disponível apenas no modo login */}
              {mode === 'login' && <div className="mt-4 text-center">
                  <Button variant="link" onClick={handleForgotPassword} className="text-sm text-gray-600 hover:text-gray-800" disabled={isSubmitting}>
                    Esqueceu sua senha?
                  </Button>
                </div>}
              
              {/* Toggle entre Login e Registro */}
              <div className="mt-4 text-center">
                <Button variant="link" onClick={toggleMode} className="text-sm text-gray-600 hover:text-gray-800" disabled={isSubmitting}>
                  {mode === 'login' ? <span>Não tem uma conta? <span className="text-orange-600 hover:text-orange-700 font-medium">Criar conta</span></span> : 'Já tem uma conta? Entrar'}
                </Button>
              </div>
            </>}
        </CardContent>
      </Card>
    </div>;
};
export default Auth;