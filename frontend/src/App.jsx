
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/Navbar';
import HomePage from '@/pages/HomePage';
import AnalyzePage from '@/pages/AnalyzePage';
import DashboardPage from '@/pages/DashboardPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
