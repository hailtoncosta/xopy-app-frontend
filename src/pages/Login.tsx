import { MaskedInput } from '@/components/ui/masked-input';
import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowLeft,
  UserCheck,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks';
import { UserType } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, resetPassword, loginAsGuest } = useAuth();
  const submitRef = useRef<boolean>(false);
  
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  // Pegar a URL de redirecionamento do state
  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir múltiplas submissões
    if (isLoading || submitRef.current) {
      console.log('Login: Submissão já em andamento, ignorando...');
      return;
    }
    
    submitRef.current = true;
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Login: Iniciando submissão do formulário...');
      
      if (isForgotPassword) {
        // Recuperação de senha
        console.log('Login: Tentando recuperação de senha...');
        const result = await resetPassword(formData.email);
        
        if (result.success) {
          console.log('Login: Email de recuperação enviado com sucesso');
          setSuccess(result.message || 'Email de recuperação enviado!');
          
          // Voltar para o login após 3 segundos
          setTimeout(() => {
            setIsForgotPassword(false);
            setSuccess('');
          }, 3000);
        } else {
          console.error('Login: Falha na recuperação de senha:', result.error);
          setError(result.error || 'Erro ao enviar email de recuperação');
        }
      } else if (isLogin) {
        // Login
        console.log('Login: Tentando fazer login...');
        const result = await login(formData.email, formData.password, 'customer');
        
        if (result.success) {
          console.log('Login: Login bem-sucedido, redirecionando...');
          setSuccess('Login realizado com sucesso!');
          
          // Pequeno delay para mostrar a mensagem de sucesso
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1000);
        } else {
          console.error('Login: Falha no login:', result.error);
          setError(result.error || 'Email ou senha incorretos');
        }
      } else {
        // Registro
        if (formData.password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres');
          return;
        }

        if (!formData.name.trim()) {
          setError('Nome é obrigatório');
          return;
        }

        console.log('Login: Tentando fazer registro...');
        const result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          type: 'customer'
        });

        if (result.success) {
          if (result.message) {
            console.log('Login: Registro bem-sucedido com mensagem:', result.message);
            setSuccess(result.message);
          } else {
            console.log('Login: Registro bem-sucedido, redirecionando...');
            setSuccess('Conta criada com sucesso!');
            
            // Pequeno delay para mostrar a mensagem de sucesso
            setTimeout(() => {
              navigate(from, { replace: true });
            }, 1000);
          }
        } else {
          console.error('Login: Falha no registro:', result.message);
          setError(result.message || 'Erro ao criar conta. Tente novamente.');
        }
      }
    } catch (error: any) {
      console.error('Login: Erro inesperado:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsLoading(false);
      submitRef.current = false;
    }
  };

  const handleGuestAccess = () => {
    console.log('Login: Acessando como convidado...');
    loginAsGuest();
    navigate(from, { replace: true });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setError('');
    setSuccess('');
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: ''
    });
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setError('');
    setSuccess('');
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: ''
    });
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setIsLogin(true);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4">
        <button onClick={handleBack} className="text-gray-600 hover:text-gray-800">
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-lg tracking-wider">XOPY</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Xopy</h1>
            <p className="text-gray-600">
              {isForgotPassword ? 'Recuperar senha' : (isLogin ? 'Entre na sua conta' : 'Crie sua conta')}
            </p>
            {isForgotPassword && (
              <p className="text-sm text-gray-500 mt-2">
                Digite seu email para receber as instruções de recuperação
              </p>
            )}
            
            {/* Mensagem de redirecionamento */}
            {location.state?.message && (
              <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                <p className="text-orange-800 text-sm text-center">
                  {location.state.message}
                </p>
              </div>
            )}
          </div>

          {/* Mensagens de erro e sucesso */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                    required={!isLogin && !isForgotPassword}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={isLogin ? 'Sua senha' : 'Mínimo 6 caracteres'}
                    required={!isForgotPassword}
                    disabled={isLoading}
                    minLength={isLogin ? undefined : 6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && !isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone (opcional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <MaskedInput mask="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isForgotPassword ? 'Enviando...' : (isLogin ? 'Entrando...' : 'Criando conta...')}
                </div>
              ) : (
                isForgotPassword ? 'Enviar email de recuperação' : (isLogin ? 'Entrar' : 'Criar conta')
              )}
            </button>
          </form>

          {/* Links de navegação */}
          {isForgotPassword ? (
            <div className="mt-6 text-center">
              <button
                onClick={handleBackToLogin}
                className="text-orange-600 hover:text-orange-700 font-medium"
                disabled={isLoading}
              >
                Voltar ao login
              </button>
            </div>
          ) : (
            <>
              {/* Link Esqueceu sua senha - disponível em ambos os modos */}
              <div className="mt-4 text-center">
                <button
                  onClick={handleForgotPassword}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  disabled={isLoading}
                >
                  Esqueceu sua senha?
                </button>
              </div>
              
              {/* Toggle entre Login e Registro */}
              <div className="mt-6 text-center">
                <button
                  onClick={toggleMode}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                  disabled={isLoading}
                >
                  {isLogin ? 'Não tem conta? Criar conta' : 'Já tem conta? Fazer login'}
                </button>
              </div>
            </>
          )}

          {/* Acesso como convidado - não mostrar no modo recuperação de senha */}
          {!isForgotPassword && (
            <div className="mt-4 text-center">
              <button
                onClick={handleGuestAccess}
                className="flex items-center justify-center w-full text-gray-600 hover:text-gray-800 font-medium py-2"
                disabled={isLoading}
              >
                <UserCheck className="h-5 w-5 mr-2" />
                Continuar como convidado
              </button>
            </div>
          )}

          {/* Credenciais de teste - não mostrar no modo recuperação de senha */}
          {!isForgotPassword && (
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm text-center font-medium mb-1">Conta de teste:</p>
              <p className="text-blue-700 text-xs text-center">Email: teste@xopy.com</p>
              <p className="text-blue-700 text-xs text-center">Senha: 123456</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;