import { Navigate, Route, Routes } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';
import AuthPage from './pages/AuthPage';
import GraduationPage from './pages/GraduationPage';
import HomePage from './pages/HomePage';
import InfoPage from './pages/InfoPages';
import NotFoundPage from './pages/NotFoundPage';
import OrganizeEventPage from './pages/OrganizeEventPage';
import ProfilePage from './pages/ProfilePage';
import ProviderProfilePage from './pages/ProviderProfilePage';
import ProvidersPage from './pages/ProvidersPage';
import RequestBoardPage from './pages/RequestBoardPage';
import AdminPage from './pages/AdminPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';
import AIEventPlanResultPage from './pages/AIEventPlanResultPage';

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="ponudniki" element={<ProvidersPage />} />
        <Route path="ponudnik/:id" element={<ProviderProfilePage />} />
        <Route path="profil" element={<ProfilePage />} />
        <Route path="povprasevanja" element={<RequestBoardPage />} />
        <Route path="ai-event-plan" element={<AIEventPlanResultPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="ponudnik-nadzorna-plosca" element={<ProviderDashboardPage />} />
        <Route path="organiziraj-dogodek" element={<OrganizeEventPage />} />
        <Route path="kategorije/maturantski-plesi" element={<GraduationPage />} />
        <Route path="prijava" element={<AuthPage mode="login" />} />
        <Route path="registracija" element={<AuthPage mode="register" />} />
        <Route path="postani-ponudnik" element={<InfoPage page="become-provider" />} />
        <Route path="o-nas" element={<InfoPage page="about" />} />
        <Route path="kontakt" element={<InfoPage page="contact" />} />
        <Route path="pogoji" element={<InfoPage page="terms" />} />
        <Route path="pogoji-za-ponudnike" element={<InfoPage page="provider-terms" />} />
        <Route path="zasebnost" element={<InfoPage page="privacy" />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/index.html" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
