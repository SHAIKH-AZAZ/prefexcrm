import React from 'react';
import { Employee } from '../types';
import { Mail, Phone, MoreHorizontal } from 'lucide-react';

interface TeamProps {
  employees: Employee[];
}

export const Team: React.FC<TeamProps> = ({ employees }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Team</h1>
        <p className="text-slate-500 mt-1">View employee performance and availability.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((emp) => (
          <div key={emp.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-6">
                 <img src={emp.avatar} alt={emp.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-50" />
                 <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal size={20} />
                 </button>
             </div>
             <h3 className="text-xl font-bold text-slate-900">{emp.name}</h3>
             <p className="text-slate-500 text-sm mb-4">{emp.role}</p>
             
             <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                    {emp.activeLeads} Active Leads
                </span>
                <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold">
                    Online
                </span>
             </div>

             <div className="flex gap-2 mt-auto">
                <button className="flex-1 py-2 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
                    <Mail size={16} />
                </button>
                <button className="flex-1 py-2 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
                    <Phone size={16} />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};