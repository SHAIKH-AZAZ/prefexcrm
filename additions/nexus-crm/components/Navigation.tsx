import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, Settings, Activity } from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const [metaActive, setMetaActive] = useState(false);
  const [googleActive, setGoogleActive] = useState(false);

  // Simple polling to check connection status for the sidebar
  useEffect(() => {
    const checkStatus = () => {
        setMetaActive(!!localStorage.getItem('nexus_meta_config'));
        setGoogleActive(!!localStorage.getItem('nexus_google_config'));
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 2000); // Poll every 2s to detect changes from Settings page
    return () => clearInterval(interval);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/leads', label: 'Leads Center', icon: Users },
    { path: '/team', label: 'My Team', icon: UserCheck },
    { path: '/settings', label: 'Integrations', icon: Settings },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 shadow-xl z-20">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-indigo-500 p-2 rounded-lg">
          <Activity size={24} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">Nexus CRM</span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isActive(item.path)
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} className={`${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
          <p className="text-xs text-slate-400 uppercase font-bold">Integrations</p>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Meta API</span>
            {metaActive ? (
                <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="text-xs font-medium">On</span>
                </div>
            ) : (
                <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    <span className="text-xs font-medium">Off</span>
                </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Google Ads</span>
            {googleActive ? (
                <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="text-xs font-medium">On</span>
                </div>
            ) : (
                <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    <span className="text-xs font-medium">Off</span>
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};