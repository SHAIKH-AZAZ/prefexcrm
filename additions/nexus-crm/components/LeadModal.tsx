import React, { useState } from 'react';
import { Lead, Employee, LeadStatus } from '../types';
import { analyzeLead, generateColdEmail } from '../services/geminiService';
import { X, BrainCircuit, Mail, CheckCircle, UserPlus, ChevronRight, Bot } from 'lucide-react';

interface LeadModalProps {
  lead: Lead;
  employees: Employee[];
  onClose: () => void;
  onAssign: (leadId: string, employeeId: string) => void;
  onUpdateLead: (updatedLead: Lead) => void;
}

export const LeadModal: React.FC<LeadModalProps> = ({ lead, employees, onClose, onAssign, onUpdateLead }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeLead(lead);
    onUpdateLead({
      ...lead,
      aiAnalysis: result.analysis,
      aiScore: result.score
    });
    setIsAnalyzing(false);
  };

  const handleGenerateEmail = async () => {
    setIsGeneratingEmail(true);
    const draft = await generateColdEmail(lead);
    setEmailDraft(draft);
    setIsGeneratingEmail(false);
  };

  const assignedEmployee = employees.find(e => e.id === lead.assignedTo);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-slate-900">{lead.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                lead.status === LeadStatus.NEW ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {lead.status}
              </span>
            </div>
            <p className="text-slate-500 flex items-center gap-2 text-sm">
              via {lead.source} &bull; {new Date(lead.dateCreated).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Message */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Original Message</h3>
              <p className="text-slate-800 italic">"{lead.message}"</p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Email</label>
                <p className="font-medium text-slate-900">{lead.email}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Phone</label>
                <p className="font-medium text-slate-900">{lead.phone}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Potential Value</label>
                <p className="font-medium text-emerald-600 text-lg">${lead.potentialValue.toLocaleString()}</p>
              </div>
            </div>

            {/* AI Section */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <BrainCircuit className="text-indigo-500" size={20} />
                  Gemini AI Insights
                </h3>
                {!lead.aiAnalysis && (
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2 font-medium"
                    >
                        {isAnalyzing ? <div className="animate-spin w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full"></div> : <Bot size={14}/>}
                        Run Analysis
                    </button>
                )}
              </div>

              {lead.aiAnalysis ? (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5">
                   <div className="flex items-center gap-4 mb-3">
                      <div className="flex-1">
                          <div className="flex justify-between text-sm font-medium mb-1">
                              <span className="text-indigo-900">Conversion Probability</span>
                              <span className="text-indigo-700">{lead.aiScore}%</span>
                          </div>
                          <div className="w-full bg-indigo-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${lead.aiScore}%` }}
                              ></div>
                          </div>
                      </div>
                   </div>
                   <p className="text-sm text-indigo-900 leading-relaxed">
                     {lead.aiAnalysis}
                   </p>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-400 text-sm">Click "Run Analysis" to get AI-powered insights.</p>
                </div>
              )}
            </div>

            {/* Email Generator */}
            <div className="border-t border-slate-100 pt-6">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Mail className="text-pink-500" size={20} />
                        Quick Actions
                    </h3>
                 </div>
                 
                 {!emailDraft ? (
                     <button 
                        onClick={handleGenerateEmail}
                        disabled={isGeneratingEmail}
                        className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                     >
                        {isGeneratingEmail ? 'Drafting...' : 'Draft Cold Email Response'}
                     </button>
                 ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Draft Response</h4>
                        <p className="text-sm text-slate-600 mb-4 whitespace-pre-line">{emailDraft}</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEmailDraft(null)} className="text-xs text-slate-400 hover:text-slate-600 px-3 py-2">Discard</button>
                            <button className="text-xs bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800">Copy to Clipboard</button>
                        </div>
                    </div>
                 )}
            </div>

          </div>

          {/* Sidebar: Assignment */}
          <div className="border-l border-slate-100 pl-8 flex flex-col gap-6">
             <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Assigned Employee</h3>
                {assignedEmployee ? (
                    <div className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                        <img src={assignedEmployee.avatar} alt={assignedEmployee.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <p className="text-sm font-bold text-slate-900">{assignedEmployee.name}</p>
                            <p className="text-xs text-slate-500">{assignedEmployee.role}</p>
                        </div>
                        <CheckCircle size={16} className="text-emerald-500 ml-auto" />
                    </div>
                ) : (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
                        <p className="text-sm text-amber-800 font-medium mb-1">Unassigned</p>
                        <p className="text-xs text-amber-600">This lead needs attention.</p>
                    </div>
                )}
             </div>

             <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Assign To Team</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {employees.map(emp => (
                        <button 
                            key={emp.id}
                            onClick={() => onAssign(lead.id, emp.id)}
                            disabled={lead.assignedTo === emp.id}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                                lead.assignedTo === emp.id 
                                ? 'bg-slate-100 opacity-50 cursor-not-allowed' 
                                : 'hover:bg-slate-50 hover:ring-1 hover:ring-slate-200'
                            }`}
                        >
                             <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover grayscale" />
                             <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{emp.name}</p>
                                <p className="text-xs text-slate-400">{emp.activeLeads} active leads</p>
                             </div>
                             {lead.assignedTo !== emp.id && <UserPlus size={14} className="text-slate-300" />}
                        </button>
                    ))}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};