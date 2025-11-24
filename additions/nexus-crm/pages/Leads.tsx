import React, { useState } from 'react';
import { Lead, Employee, LeadSource, LeadStatus } from '../types';
import { LeadModal } from '../components/LeadModal';
import { Search, Filter, Facebook, Instagram, Globe, Search as SearchIcon } from 'lucide-react';

interface LeadsProps {
  leads: Lead[];
  employees: Employee[];
  onAssign: (leadId: string, employeeId: string) => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onFetchLeads: () => void;
  isFetching: boolean;
}

export const Leads: React.FC<LeadsProps> = ({ leads, employees, onAssign, onUpdateLead, onFetchLeads, isFetching }) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterSource, setFilterSource] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getSourceIcon = (source: LeadSource) => {
    switch (source) {
      case LeadSource.FACEBOOK: return <Facebook size={16} className="text-blue-600" />;
      case LeadSource.INSTAGRAM: return <Instagram size={16} className="text-pink-600" />;
      case LeadSource.GOOGLE_ADS: return <div className="w-4 h-4 font-bold text-xs bg-green-500 text-white rounded flex items-center justify-center">G</div>;
      default: return <Globe size={16} className="text-slate-400" />;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSource = filterSource === 'all' || lead.source === filterSource;
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSource && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lead Center</h1>
          <p className="text-slate-500 mt-1">Manage and assign your incoming leads.</p>
        </div>
        <button 
          onClick={onFetchLeads}
          disabled={isFetching}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isFetching ? (
             <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Syncing...</>
          ) : (
             <>Sync Meta/Google</>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
         <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search leads..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
            </div>
            <div className="flex items-center gap-2">
                <Filter size={18} className="text-slate-400" />
                <select 
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                >
                    <option value="all">All Sources</option>
                    {Object.values(LeadSource).map(src => (
                        <option key={src} value={src}>{src}</option>
                    ))}
                </select>
            </div>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Value</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => {
              const assignedEmp = employees.find(e => e.id === lead.assignedTo);
              return (
                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                      {getSourceIcon(lead.source)}
                      <span className="hidden sm:inline">{lead.source}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                        <p className="text-sm font-bold text-slate-900">{lead.name}</p>
                        <p className="text-xs text-slate-500">{lead.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        lead.status === LeadStatus.NEW ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        lead.status === LeadStatus.CLOSED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {assignedEmp ? (
                       <div className="flex items-center gap-2">
                          <img src={assignedEmp.avatar} alt="" className="w-6 h-6 rounded-full" />
                          <span className="text-sm text-slate-700">{assignedEmp.name}</span>
                       </div>
                    ) : (
                       <span className="text-xs text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-slate-700">${lead.potentialValue.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <button 
                        onClick={() => setSelectedLead(lead)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline"
                     >
                        View Details
                     </button>
                  </td>
                </tr>
              );
            })}
            {filteredLeads.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        No leads found matching your filters.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedLead && (
        <LeadModal 
            lead={selectedLead} 
            employees={employees}
            onClose={() => setSelectedLead(null)}
            onAssign={onAssign}
            onUpdateLead={onUpdateLead}
        />
      )}
    </div>
  );
};