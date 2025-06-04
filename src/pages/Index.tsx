
import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';
import VotingPage from './VotingPage';
import Leaderboard from './Leaderboard';
import AdminPanel from '../components/AdminPanel';
import AdminLogin from '../components/AdminLogin';

interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  ideas: string;
  selected_idea: string;
  email: string;
}

type PageType = 'dashboard' | 'voting' | 'leaderboard' | 'admin';

const Index = () => {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const stored = localStorage.getItem('currentEmployee');
    if (stored) {
      setCurrentEmployee(JSON.parse(stored));
    }

    // Check for admin access
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setCurrentPage('admin');
      
      // Check if admin is already authenticated
      const adminStored = localStorage.getItem('adminUser');
      if (adminStored) {
        setIsAdminAuthenticated(true);
      }
    }
  }, []);

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  // Admin flow
  if (currentPage === 'admin') {
    if (!isAdminAuthenticated) {
      return <AdminLogin onAdminLogin={handleAdminLogin} />;
    }
    return <AdminPanel />;
  }

  // Regular user flow
  if (!currentEmployee) {
    return <Auth />;
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
        />
      );
  }
};

export default Index;
