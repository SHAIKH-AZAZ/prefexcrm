import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Team } from './pages/Team';
import { Settings } from './pages/Settings';
import { MOCK_LEADS, EMPLOYEES, fetchNewLeads } from './services/mockData';
import { Lead, Employee } from './types';

const App: React.FC = () => {
  // Lifted state for global access
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);
  const [isFetching, setIsFetching] = useState(false);

  const handleAssign = (leadId: string, employeeId: string) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, assignedTo: employeeId } : lead
    ));
    
    // Update employee count visually (mock logic)
    setEmployees(prev => prev.map(emp => 
       emp.id === employeeId ? { ...emp, activeLeads: emp.activeLeads + 1 } : emp
    ));
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
  };

  const handleFetchNewLeads = async () => {
    setIsFetching(true);
    try {
      const newLeads = await fetchNewLeads();
      setLeads(prev => [...newLeads, ...prev]);
    } catch (err) {
      console.error("Failed to sync", err);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Navigation />
        
        <main className="flex-1 ml-64 transition-all duration-300">
          <Routes>
            <Route path="/" element={<Dashboard leads={leads} employees={employees} />} />
            <Route 
                path="/leads" 
                element={
                    <Leads 
                        leads={leads} 
                        employees={employees} 
                        onAssign={handleAssign} 
                        onUpdateLead={handleUpdateLead}
                        onFetchLeads={handleFetchNewLeads}
                        isFetching={isFetching}
                    />
                } 
            />
            <Route path="/team" element={<Team employees={employees} />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;