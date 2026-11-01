/**
 * CivicLens AI - Main React Application & Router
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { AboutPage } from './pages/public/AboutPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { TransparencyPage } from './pages/public/TransparencyPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';
import { TermsPage } from './pages/public/TermsPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { PolicyExplainerPage } from './pages/citizen/PolicyExplainerPage';
import { SchemeExplorerPage } from './pages/citizen/SchemeExplorerPage';
import { CivicReportPage } from './pages/citizen/CivicReportPage';
import { CivicTrackingPage } from './pages/citizen/CivicTrackingPage';
import { CivicMapPage } from './pages/citizen/CivicMapPage';
import { FactVerificationPage } from './pages/citizen/FactVerificationPage';
import { MyApplicationsPage } from './pages/citizen/MyApplicationsPage';
import { NotificationsPage } from './pages/citizen/NotificationsPage';
import { ProfilePage } from './pages/citizen/ProfilePage';
import { SettingsPage } from './pages/citizen/SettingsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ComplaintManagementPage } from './pages/admin/ComplaintManagementPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { PolicyManagementPage } from './pages/admin/PolicyManagementPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { PageBackground, usePageEffect } from './components/backgrounds/PageBackground';

// Public Layout Wrapper
function PublicLayout({ children }: { children: React.ReactNode }) {
  const effect = usePageEffect();
  return (
    <div className={`min-h-screen flex flex-col app-text transition-colors duration-200 relative ${effect ? 'live-bg-on' : 'app-bg'}`}>
      <PageBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-transparent">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1020]">
        <div className="w-10 h-10 border-2 border-[#477BFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
              <Route path="/features" element={<PublicLayout><FeaturesPage /></PublicLayout>} />
              <Route path="/how-it-works" element={<PublicLayout><HowItWorksPage /></PublicLayout>} />
              <Route path="/transparency" element={<PublicLayout><TransparencyPage /></PublicLayout>} />
              <Route path="/privacy" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
              <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />

              {/* Authentication Routes */}
              <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
              <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />

              {/* Authenticated Citizen & General Workspace */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<CitizenDashboard />} />
                <Route path="/policies" element={<PolicyExplainerPage />} />
                <Route path="/policies/:id" element={<PolicyExplainerPage />} />
                <Route path="/schemes" element={<SchemeExplorerPage />} />
                <Route path="/schemes/:id" element={<SchemeExplorerPage />} />
                <Route path="/reports/new" element={<CivicReportPage />} />
                <Route path="/tracking" element={<CivicTrackingPage />} />
                <Route path="/reports/:id" element={<CivicTrackingPage />} />
                <Route path="/map" element={<CivicMapPage />} />
                <Route path="/fact-check" element={<FactVerificationPage />} />
                <Route path="/applications" element={<MyApplicationsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Protected Administrative Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'officer']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'officer']}>
                      <ComplaintManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UserManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/policies"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'officer']}>
                      <PolicyManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'officer']}>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'officer']}>
                      <AuditLogsPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
