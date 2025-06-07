
import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';
import VotingPage from './VotingPage';
import Leaderboard from './Leaderboard';
import AdminPanel from '../components/AdminPanel';
import AdminLogin from '../components/AdminLogin';

interface Employee {
  employee_id: string;
  name: string;
  name2: string;
  email: string;
  selected_idea: string;
  idea1_title: string;
  idea2_title: string;
  idea3_title: string;
  problem1: string;
  problem2: string;
  problem3: string;
  solution1: string;
  solution2: string;
  solution3: string;
  roi1: string;
  roi2: string;
  roi3: string;
  architectural_diagram: string;
  group_name: string;
  hackathon_participation: string;
}

interface AdminUser {
  id: string;
  email: string;
}

type PageType = 'dashboard' | 'voting' | 'leaderboard' | 'admin';

const Index = () => {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    // Check for authentication status on app load
    checkAuthStatus();
    
    // Check for admin access
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setCurrentPage('admin');
    }
  }, []);

  const checkAuthStatus = () => {
    // Check if there's a stored auth flag (minimal storage)
    const isUserAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    const isAdminAuth = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    
    if (isUserAuthenticated) {
      // User was authenticated but we need to re-fetch data
      // In a real scenario, you might want to validate the session with your backend
      console.log('User session found but data not persisted for security');
      // Clear the flag since we don't have the actual user data
      sessionStorage.removeItem('isAuthenticated');
    }
    
    if (isAdminAuth) {
      setIsAdminAuthenticated(true);
      // You might want to re-validate admin session here
    }
    
    setAuthCheckComplete(true);
  };

  const handleUserLogin = (userData: Employee) => {
    setCurrentEmployee(userData);
    // Only store a minimal auth flag, not the actual user data
    sessionStorage.setItem('isAuthenticated', 'true');
    console.log('User authenticated and data stored in memory');
  };

  const handleAdminLogin = (adminData: AdminUser) => {
    setCurrentAdmin(adminData);
    setIsAdminAuthenticated(true);
    // Only store a minimal auth flag, not the actual admin data
    sessionStorage.setItem('isAdminAuthenticated', 'true');
    console.log('Admin authenticated and data stored in memory');
  };

  const handleSignOut = () => {
    setCurrentEmployee(null);
    setCurrentAdmin(null);
    setIsAdminAuthenticated(false);
    // Clear all storage
    sessionStorage.clear();
    localStorage.clear();
    console.log('User signed out and all data cleared');
  };

  // Admin flow
  if (currentPage === 'admin') {
    if (!isAdminAuthenticated) {
      return <AdminLogin onAdminLogin={handleAdminLogin} />;
    }
    return <AdminPanel currentAdmin={currentAdmin} onSignOut={handleSignOut} />;
  }

  // Show loading while checking auth status
  if (!authCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Regular user flow
  if (!currentEmployee) {
    return <Auth onUserLogin={handleUserLogin} />;
  }

  const handleStartVoting = () => {
    setCurrentPage('voting');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const handleShowLeaderboard = () => {
    setCurrentPage('leaderboard');
  };

  switch (currentPage) {
    case 'voting':
      return (
        <VotingPage 
          currentEmployee={currentEmployee} 
          onBack={handleBackToDashboard}
        />
      );
    case 'leaderboard':
      return (
        <Leaderboard 
          onBack={handleBackToDashboard}
        />
      );
    default:
      return (
        <Dashboard 
          currentEmployee={currentEmployee} 
          onStartVoting={handleStartVoting}
          onShowLeaderboard={handleShowLeaderboard}
          onSignOut={handleSignOut}
        />
      );
  }
};

export default Index;
