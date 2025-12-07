import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IdentityProvider } from './context/IdentityContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import IdentityHome from './pages/identity/IdentityHome';
import { EmailsList } from './pages/identity/EmailsList';
import { ServicesList } from './pages/identity/ServicesList';
import { ProjectsList } from './pages/identity/ProjectsList';
import { AIQuery } from './pages/identity/AIQuery';
import CreateIdentity from './pages/identity/CreateIdentity';
import IdentityDashboard from './pages/identity/IdentityDashboard';
import './App.css'

const PrivateRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <IdentityProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route path="/*" element={
                            <PrivateRoute>
                                <Layout>
                                    <Routes>
                                        <Route path="/" element={<HomePage />} />

                                        {/* Identity System Routes */}
                                        <Route path="/identities" element={<IdentityHome />} />
                                        <Route path="/identities/create" element={<CreateIdentity />} />
                                        <Route path="/identities/:id" element={<IdentityDashboard />} />

                                        {/* Legacy/Existing Routes - Keeping /apps/identity as alias to IdentityHome if needed, or removing if replaced */}
                                        <Route path="/apps/identity" element={<IdentityHome />} />
                                        <Route path="/apps/identity/emails" element={<EmailsList />} />
                                        <Route path="/apps/identity/services" element={<ServicesList />} />
                                        <Route path="/apps/identity/projects" element={<ProjectsList />} />
                                        <Route path="/apps/identity/ai" element={<AIQuery />} />
                                    </Routes>
                                </Layout>
                            </PrivateRoute>
                        } />
                    </Routes>
                </Router>
            </IdentityProvider>
        </AuthProvider>
    );
}

export default App
