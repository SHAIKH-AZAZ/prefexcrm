import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Globe, CheckCircle, RefreshCw, AlertCircle, Save, X, Key } from 'lucide-react';
import { validateMetaConnection } from '../services/metaService';
import { validateGoogleAdsConnection } from '../services/googleAdsService';

export const Settings: React.FC = () => {
  // Meta State
  const [metaPageId, setMetaPageId] = useState('');
  const [metaToken, setMetaToken] = useState('');
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaStatus, setMetaStatus] = useState<'idle' | 'validating' | 'connected' | 'error'>('idle');
  const [metaMessage, setMetaMessage] = useState('');

  // Google State
  const [googleId, setGoogleId] = useState('');
  const [googleToken, setGoogleToken] = useState('');
  const [isEditingGoogle, setIsEditingGoogle] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<'idle' | 'validating' | 'connected' | 'error'>('idle');
  const [googleMessage, setGoogleMessage] = useState('');

  useEffect(() => {
    // Load Meta Config
    const storedMeta = localStorage.getItem('nexus_meta_config');
    if (storedMeta) {
      const { pageId, accessToken } = JSON.parse(storedMeta);
      setMetaPageId(pageId);
      setMetaToken(accessToken);
      setMetaStatus('connected');
    }

    // Load Google Config
    const storedGoogle = localStorage.getItem('nexus_google_config');
    if (storedGoogle) {
        const { customerId, developerToken } = JSON.parse(storedGoogle);
        setGoogleId(customerId);
        setGoogleToken(developerToken);
        setGoogleStatus('connected');
    }
  }, []);

  // Meta Handlers
  const handleSaveMeta = async () => {
    if (!metaPageId || !metaToken) {
      setMetaMessage("Page ID and Token are required.");
      setMetaStatus('error');
      return;
    }
    setMetaStatus('validating');
    const isValid = await validateMetaConnection(metaPageId, metaToken);

    if (isValid) {
      setMetaStatus('connected');
      setMetaMessage('');
      localStorage.setItem('nexus_meta_config', JSON.stringify({ pageId: metaPageId, accessToken: metaToken }));
      setIsEditingMeta(false);
    } else {
      setMetaStatus('error');
      setMetaMessage("Invalid credentials. Please check Page ID and Access Token.");
    }
  };

  const handleDisconnectMeta = () => {
    localStorage.removeItem('nexus_meta_config');
    setMetaPageId('');
    setMetaToken('');
    setMetaStatus('idle');
    setIsEditingMeta(true);
  };

  // Google Handlers
  const handleSaveGoogle = async () => {
      if (!googleId || !googleToken) {
          setGoogleMessage("Customer ID and Developer Token are required.");
          setGoogleStatus('error');
          return;
      }
      setGoogleStatus('validating');
      const isValid = await validateGoogleAdsConnection(googleId, googleToken);

      if (isValid) {
          setGoogleStatus('connected');
          setGoogleMessage('');
          localStorage.setItem('nexus_google_config', JSON.stringify({ customerId: googleId, developerToken: googleToken }));
          setIsEditingGoogle(false);
      } else {
          setGoogleStatus('error');
          setGoogleMessage("Invalid Google Ads credentials.");
      }
  };

  const handleDisconnectGoogle = () => {
      localStorage.removeItem('nexus_google_config');
      setGoogleId('');
      setGoogleToken('');
      setGoogleStatus('idle');
      setIsEditingGoogle(true);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-20">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Integrations Marketplace</h1>
            <p className="text-slate-500">Connect your third-party lead sources to automatically sync data into Nexus CRM.</p>
        </div>

        <div className="space-y-8">
            
            {/* Meta Section */}
            <div className={`bg-white rounded-2xl border transition-all ${isEditingMeta ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-lg' : 'border-slate-200 shadow-sm'} overflow-hidden`}>
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#1877F2] rounded-xl flex items-center justify-center text-white shadow-sm">
                            <Facebook size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Meta for Business</h3>
                            <p className="text-sm text-slate-500">Connect Facebook & Instagram Lead Ads</p>
                        </div>
                    </div>
                    {metaStatus === 'connected' && !isEditingMeta ? (
                        <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                            <CheckCircle size={16} /> Connected
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-sm font-bold">
                            Not Connected
                        </span>
                    )}
                </div>

                <div className="p-6">
                    {!isEditingMeta && metaStatus === 'connected' ? (
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-900">Active Configuration</p>
                                <p className="text-sm text-slate-500">Page ID: <span className="font-mono text-slate-700">{metaPageId}</span></p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleDisconnectMeta} className="text-sm font-medium text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">Disconnect</button>
                                <button onClick={() => setIsEditingMeta(true)} className="text-sm font-medium text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">Edit Settings</button>
                            </div>
                        </div>
                    ) : isEditingMeta ? (
                        <div className="space-y-5 max-w-2xl">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Facebook Page ID</label>
                                <input 
                                    type="text" 
                                    value={metaPageId}
                                    onChange={(e) => setMetaPageId(e.target.value)}
                                    placeholder="e.g., 1042342..."
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                <p className="text-xs text-slate-400 mt-1">Found in your Page Settings &gt; About</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Graph API Access Token</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="password" 
                                        value={metaToken}
                                        onChange={(e) => setMetaToken(e.target.value)}
                                        placeholder="EAAG..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Requires <code>pages_read_engagement</code> and <code>leads_retrieval</code> scopes.</p>
                            </div>

                            {metaMessage && (
                                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${metaStatus === 'error' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                                    <AlertCircle size={16} />
                                    {metaMessage}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={handleSaveMeta}
                                    disabled={metaStatus === 'validating'}
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-blue-200"
                                >
                                    {metaStatus === 'validating' ? (
                                        <><RefreshCw className="animate-spin" size={16} /> Verifying...</>
                                    ) : (
                                        <><Save size={16} /> Save Connection</>
                                    )}
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsEditingMeta(false); 
                                        if(metaStatus !== 'connected') { setMetaPageId(''); setMetaToken(''); }
                                    }}
                                    className="text-slate-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                             <p className="text-slate-600 mb-4">Sync leads directly from your Facebook and Instagram forms. Requires a Business Manager account.</p>
                             <button onClick={() => setIsEditingMeta(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                                Configure Meta Integration
                             </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Google Section */}
            <div className={`bg-white rounded-2xl border transition-all ${isEditingGoogle ? 'border-green-500 ring-4 ring-green-500/10 shadow-lg' : 'border-slate-200 shadow-sm'} overflow-hidden`}>
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-900 shadow-sm">
                            <svg viewBox="0 0 24 24" width="28" height="28" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Google Ads</h3>
                            <p className="text-sm text-slate-500">Sync Lead Form Extensions & Call Ads</p>
                        </div>
                    </div>
                    {googleStatus === 'connected' && !isEditingGoogle ? (
                        <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                            <CheckCircle size={16} /> Connected
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-sm font-bold">
                            Not Connected
                        </span>
                    )}
                </div>

                <div className="p-6">
                    {!isEditingGoogle && googleStatus === 'connected' ? (
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-900">Active Configuration</p>
                                <p className="text-sm text-slate-500">Customer ID: <span className="font-mono text-slate-700">{googleId}</span></p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleDisconnectGoogle} className="text-sm font-medium text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">Disconnect</button>
                                <button onClick={() => setIsEditingGoogle(true)} className="text-sm font-medium text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">Edit Settings</button>
                            </div>
                        </div>
                    ) : isEditingGoogle ? (
                        <div className="space-y-5 max-w-2xl">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Client Customer ID</label>
                                <input 
                                    type="text" 
                                    value={googleId}
                                    onChange={(e) => setGoogleId(e.target.value)}
                                    placeholder="e.g., 123-456-7890"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Developer Token</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="password" 
                                        value={googleToken}
                                        onChange={(e) => setGoogleToken(e.target.value)}
                                        placeholder="Paste your developer token"
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {googleMessage && (
                                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${googleStatus === 'error' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                                    <AlertCircle size={16} />
                                    {googleMessage}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={handleSaveGoogle}
                                    disabled={googleStatus === 'validating'}
                                    className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-green-200"
                                >
                                    {googleStatus === 'validating' ? (
                                        <><RefreshCw className="animate-spin" size={16} /> Verifying...</>
                                    ) : (
                                        <><Save size={16} /> Save Connection</>
                                    )}
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsEditingGoogle(false);
                                        if(googleStatus !== 'connected') { setGoogleId(''); setGoogleToken(''); }
                                    }}
                                    className="text-slate-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                             <p className="text-slate-600 mb-4">Automatically import leads from Google Search, Display, and YouTube campaigns.</p>
                             <button onClick={() => setIsEditingGoogle(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                                Configure Google Ads
                             </button>
                        </div>
                    )}
                </div>
            </div>

             {/* Gemini Section - Static for now as per requirements */}
             <div className="bg-white rounded-2xl border border-slate-200 p-6 opacity-90">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold shadow-sm">
                           AI
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Gemini Intelligence</h3>
                            <p className="text-sm text-slate-500">Automated Lead Scoring & Email Drafts</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-bold">
                        <CheckCircle size={16} /> Active
                    </div>
                </div>
                <p className="text-sm text-slate-500">AI features are enabled globally for this workspace.</p>
            </div>

        </div>
    </div>
  );
};