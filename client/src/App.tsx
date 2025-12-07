import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { IdentityHome } from './pages/identity/IdentityHome';
import { EmailsList } from './pages/identity/EmailsList';
import { ServicesList } from './pages/identity/ServicesList';
import { ProjectsList } from './pages/identity/ProjectsList';
import { AIQuery } from './pages/identity/AIQuery';
import './App.css'

function App() {
    return (
        <Router>
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
        </Router>
    )
}

export default App
