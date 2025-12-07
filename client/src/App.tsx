import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { IdentityHome } from './pages/identity/IdentityHome';
import { EmailsList } from './pages/identity/EmailsList';
import { ServicesList } from './pages/identity/ServicesList';
import { ProjectsList } from './pages/identity/ProjectsList';
import { AIQuery } from './pages/identity/AIQuery';
import './App.css'

const PrivateRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/*" element={
                        <PrivateRoute>
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<HomePage />} />
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
        </AuthProvider>
    );
}

export default App
