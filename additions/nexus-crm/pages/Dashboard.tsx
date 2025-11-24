import React, { useMemo } from 'react';
import { Lead, Employee, LeadSource } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Share2 } from 'lucide-react';

interface DashboardProps {
  leads: Lead[];
  employees: Employee[];
}

export const Dashboard: React.FC<DashboardProps> = ({ leads, employees }) => {
  
  // Calculate Stats
  const stats = useMemo(() => {
    const totalValue = leads.reduce((acc, lead) => acc + lead.potentialValue, 0);
    const conversionRate = (leads.filter(l => l.status === 'Closed').length / leads.length) * 100 || 0;
    
    return {
      totalLeads: leads.length,
      totalValue,
      conversionRate,
      activeTeam: employees.length
    };
  }, [leads, employees]);

  // Data for Source Chart
  const sourceData = useMemo(() => {
    const counts = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(counts).map(source => ({
      name: source,
      value: counts[source]
    }));
  }, [leads]);

  // Data for Value by Source
  const valueData = useMemo(() => {
     const values = leads.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + lead.potentialValue;
        return acc;
     }, {} as Record<string, number>);

     return Object.keys(values).map(source => ({
         name: source,
         value: values[source]
     }));
  }, [leads]);

  const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b'];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here's what's happening with your leads today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
              <Share2 size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Leads</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Pipeline Value</p>
              <p className="text-2xl font-bold text-slate-900">${stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-pink-100 p-3 rounded-xl text-pink-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Conversion Rate</p>
              <p className="text-2xl font-bold text-slate-900">{stats.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Active Agents</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activeTeam}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Leads by Source */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Leads by Source</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
                {sourceData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length]}}></div>
                        <span className="text-slate-600">{entry.name} ({entry.value})</span>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Revenue Potential */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Potential by Source</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={valueData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};