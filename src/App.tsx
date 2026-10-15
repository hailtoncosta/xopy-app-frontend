import AnalyticsTracker from './components/AnalyticsTracker';
import ProfileCompletion from './components/profile/ProfileCompletion';
import RentalRequests from './pages/RentalRequests';
import ConfirmationDialog from "@/components/feedback/ConfirmationDialog";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { usePushNotifications } from './hooks';

// import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
// import { PWAStatus } from "./components/PWAStatus";
import NewHome from "./pages/NewHome";
import ProductCategory from "./pages/ProductCategory";
import ProductDetail from "./pages/ProductDetail";
import RentalCategory from "./pages/RentalCategory";
import RentalDetail from "./pages/RentalDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutNew from "./pages/CheckoutNew";
import CheckoutPayment from "./pages/CheckoutPayment";
import SellerPaymentAccount from "./pages/SellerPaymentAccount";
import Favorites from "./pages/Favorites";
import Clips from "./pages/Clips";
import CheckoutDireto from "./pages/CheckoutDireto";
import MigrationPending from "./pages/MigrationPending";
import ChangePassword from "./pages/ChangePassword";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import PaymentMethods from "./pages/PaymentMethods";
import Addresses from "./pages/Addresses";
import Notifications from "./pages/Notifications";
import Help from "./pages/Help";
import Settings from "./pages/Settings";
import ServiceProviders from "./pages/ServiceProviders";
import ServiceProviderStatus from "./pages/ServiceProviderStatus";
import Conversations from "./pages/Conversations";
import SearchResults from "./pages/SearchResults";
import Offers from "./pages/Offers";
import Auth from "./pages/Auth";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import PrivacySettings from "./pages/PrivacySettings";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import MyListings from "./pages/MyListings";
import LoginDebug from "./pages/LoginDebug";
import LoginDebugTest from "./pages/LoginDebugTest";
import NetworkTest from "./pages/NetworkTest";
import AuthTest from "./pages/AuthTest";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductsList from "./pages/admin/ProductsList";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import Categories from "./pages/admin/Categories";
import Pages from "./pages/admin/content/Pages";
import TextsLabels from "./pages/admin/content/TextsLabels";
import SEO from "./pages/admin/content/SEO";
import ContentManagement from "./pages/admin/ContentManagement";
import ServiceProvidersAdmin from "./pages/admin/ServiceProviders";
import Media from "./pages/admin/Media";
import SectionManager from "./pages/admin/SectionManager";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import Users from "./pages/admin/Users";
import UserProducts from "./pages/admin/UserProducts";
import RentalEquipment from "./pages/admin/RentalEquipment";
import AdminProfile from "./pages/admin/AdminProfile";
import Analytics from "./pages/admin/Analytics";
import SettingsAdmin from "./pages/admin/SettingsAdmin";
import PaymentSettings from "./pages/admin/PaymentSettings";
import AdminRoute from "./components/admin/AdminRoute";
import { ProtectedRoute } from "./components/auth";
import MyAds from "./pages/MyAds";
import ResetPassword from "./pages/ResetPassword";
import RentalInquiry from "./pages/RentalInquiry";
import RentalInquiries from "./pages/admin/RentalInquiries";
import SellerProfile from "./pages/SellerProfile";
import SellerProfiles from "./pages/admin/SellerProfiles";
import RentalCompanyProfile from "./pages/RentalCompanyProfile";
import RentalCompanies from "./pages/admin/RentalCompanies";
import OAuthCallback from "./pages/OAuthCallback";
import PlatformSettings from "./pages/admin/PlatformSettings";
import NotificationDebug from "./pages/NotificationDebug";
// Mercado Pago Settings component (keeping for reference)

const queryClient = new QueryClient();

const RecoveryRedirect = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
  const hashParams = new URLSearchParams(hash);

  const isRecoveryFlow =
    searchParams.get('reset_password') === '1' ||
    searchParams.get('type') === 'recovery' ||
    searchParams.get('flow') === 'recovery' ||
    hashParams.get('type') === 'recovery' ||
    hashParams.get('flow') === 'recovery' ||
    searchParams.has('code') ||
    hashParams.has('access_token') ||
    hashParams.has('token_hash') ||
    sessionStorage.getItem('xopy_recovery_flow') === 'true';

  if (!isRecoveryFlow || window.location.pathname === '/reset-password') {
    return <NewHome />;
  }

  sessionStorage.setItem('xopy_recovery_flow', 'true');
  return <Navigate to={`/reset-password${window.location.search}${window.location.hash}`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <PushInitializer />
          <AdminAuthProvider>
            <FavoritesProvider>
              <BrowserRouter>
                <AnalyticsTracker />
                <ConfirmationDialog />
                <ProfileCompletion />
                <Sonner />
                {/* <PWAInstallPrompt />
                <PWAStatus /> */}
                <Routes>
                  <Route path="/" element={<RecoveryRedirect />} />
                  <Route path="/categoria/:category" element={<ProductCategory />} />
                  <Route path="/categoria/locacoes" element={<RentalCategory />} />
                  <Route path="/solicitacoes-aluguel" element={<RentalRequests />} />
                  <Route path="/locacao/:id" element={<RentalDetail />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/seller/:sellerId" element={<SellerProfile />} />
                  <Route path="/rental-company/:companyId" element={<RentalCompanyProfile />} />
                  <Route path="/carrinho" element={
                    <ProtectedRoute>
                      <Cart onBack={() => window.history.back()} onHomeClick={() => window.location.href = '/'} onCategoriesClick={() => console.log('Categories')} onProfileClick={() => console.log('Profile')} />
                    </ProtectedRoute>
                  } />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <CheckoutNew onBack={() => window.history.back()} />
                    </ProtectedRoute>
                  } />
                  <Route path="/pagamento/:checkoutId" element={<ProtectedRoute><CheckoutPayment /></ProtectedRoute>} />
                  <Route path="/login-debug" element={<LoginDebug />} />
                  <Route path="/login-debug-test" element={<LoginDebugTest />} />
                  <Route path="/network-test" element={<NetworkTest />} />
                  <Route path="/favoritos" element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  } />
                  <Route path="/clips" element={<Clips />} />
                  <Route path="/checkout-direto/:productName" element={<MigrationPending />} />
                  <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/pedidos" element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-listings" element={
                    <ProtectedRoute>
                      <MyListings />
                    </ProtectedRoute>
                  } />
                  <Route path="/pagamentos" element={
                    <ProtectedRoute>
                      <SellerPaymentAccount />
                    </ProtectedRoute>
                  } />
                  <Route path="/enderecos" element={
                    <ProtectedRoute>
                      <Addresses />
                    </ProtectedRoute>
                  } />
                  <Route path="/notificacoes" element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  } />
                  <Route path="/ajuda" element={<Help />} />
                  <Route path="/oauth/callback" element={<MigrationPending />} />
                  <Route path="/configuracoes" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/configuracoes/privacidade" element={
                    <ProtectedRoute>
                      <MigrationPending />
                    </ProtectedRoute>
                  } />
                  <Route path="/conversas" element={<MigrationPending />} />
                  <Route path="/service-provider-status" element={<ServiceProviderStatus />} />
                  <Route path="/service-providers" element={<ServiceProviders />} />
                  <Route path="/servicos/:serviceId" element={<ServiceProviders />} />
                  <Route path="/busca" element={<SearchResults />} />
                  <Route path="/ofertas" element={<Offers />} />
                  <Route path="/consulta-locacao" element={<MigrationPending />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/termos" element={<Terms />} />
                  <Route path="/politica-de-privacidade" element={<Privacy />} />
                  <Route path="/saiba-mais" element={<About />} />

                  {/* Admin Routes */}
                  <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/admin/products" element={
                    <AdminRoute>
                      <ProductsList />
                    </AdminRoute>
                  } />
                  <Route path="/admin/products/add" element={
                    <AdminRoute>
                      <AddProduct />
                    </AdminRoute>
                  } />
                  <Route path="/admin/categories" element={
                    <AdminRoute>
                      <Categories />
                    </AdminRoute>
                  } />
                  <Route path="/admin/content/management" element={
                    <AdminRoute>
                      <ContentManagement />
                    </AdminRoute>
                  } />
                  <Route path="/admin/content/pages" element={
                    <AdminRoute>
                      <Pages />
                    </AdminRoute>
                  } />
                  <Route path="/admin/content/texts" element={
                    <AdminRoute>
                      <TextsLabels />
                    </AdminRoute>
                  } />
                  <Route path="/admin/content/seo" element={
                    <AdminRoute>
                      <SEO />
                    </AdminRoute>
                  } />
                  <Route path="/admin/media" element={
                    <AdminRoute>
                      <Media />
                    </AdminRoute>
                  } />
                  <Route path="/admin/section-manager" element={
                    <AdminRoute>
                      <SectionManager />
                    </AdminRoute>
                  } />
                  <Route path="/admin/orders" element={
                    <AdminRoute>
                      <OrdersAdmin />
                    </AdminRoute>
                  } />
                  <Route path="/admin/users" element={
                    <AdminRoute>
                      <Users />
                    </AdminRoute>
                  } />
                  <Route path="/admin/user-products" element={
                    <AdminRoute>
                      <UserProducts />
                    </AdminRoute>
                  } />
                  <Route path="/admin/service-providers" element={
                    <AdminRoute>
                      <ServiceProvidersAdmin />
                    </AdminRoute>
                  } />
                  <Route path="/admin/rental-equipment" element={<AdminRoute><RentalEquipment /></AdminRoute>} />
                  <Route path="/admin/rental-inquiries" element={
                    <AdminRoute>
                      <RentalInquiries />
                    </AdminRoute>
                  } />
                  <Route path="/admin/seller-profiles" element={
                    <AdminRoute>
                      <SellerProfiles />
                    </AdminRoute>
                  } />
                  <Route path="/admin/rental-companies" element={
                    <AdminRoute>
                      <RentalCompanies />
                    </AdminRoute>
                  } />
                  <Route path="/admin/analytics" element={
                    <AdminRoute>
                      <Analytics />
                    </AdminRoute>
                  } />
                  <Route path="/admin/settings" element={
                    <AdminRoute>
                      <SettingsAdmin />
                    </AdminRoute>
                  } />
                  <Route path="/admin/platform-settings" element={
                    <AdminRoute>
                      <PlatformSettings />
                    </AdminRoute>
                  } />
                  <Route path="/admin/settings/payment" element={
                    <AdminRoute>
                      <PaymentSettings />
                    </AdminRoute>
                  } />
                  <Route path="/admin/products/edit/:id" element={
                    <AdminRoute>
                      <EditProduct />
                    </AdminRoute>
                  } />

                  {/* Página de teste de autenticação */}
                  <Route path="/auth-test" element={<AuthTest />} />

                  {/* Página de Meus Anúncios */}
                  <Route path="/meus-anuncios" element={
                    <ProtectedRoute>
                      <MyAds />
                    </ProtectedRoute>
                  } />

                  {/* DEBUG: Página de Diagnóstico de Notificações */}
                  <Route path="/debug-notificacoes" element={
                    <ProtectedRoute>
                      <NotificationDebug />
                    </ProtectedRoute>
                  } />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </FavoritesProvider>
          </AdminAuthProvider>
        </AuthProvider>

      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

const PushInitializer = () => {
  usePushNotifications();
  return null;
};
