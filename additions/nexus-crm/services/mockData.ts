import { Lead, LeadSource, LeadStatus, Employee } from '../types';
import { fetchRealMetaLeads } from './metaService';
import { fetchRealGoogleLeads } from './googleAdsService';

export const EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Sarah Connor', role: 'Sales Lead', avatar: 'https://picsum.photos/id/64/200/200', activeLeads: 12 },
  { id: 'e2', name: 'John Smith', role: 'Account Exec', avatar: 'https://picsum.photos/id/91/200/200', activeLeads: 8 },
  { id: 'e3', name: 'Emily Davis', role: 'SDR', avatar: 'https://picsum.photos/id/129/200/200', activeLeads: 15 },
  { id: 'e4', name: 'Mike Ross', role: 'Closer', avatar: 'https://picsum.photos/id/177/200/200', activeLeads: 5 },
];

export const MOCK_LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'Alice Wonderland',
    email: 'alice@example.com',
    phone: '+1 555 0101',
    source: LeadSource.FACEBOOK,
    status: LeadStatus.NEW,
    assignedTo: null,
    dateCreated: new Date().toISOString(),
    message: "I saw your ad about enterprise CRM solutions. Interested in pricing for 50 seats.",
    potentialValue: 5000,
  },
  {
    id: 'l2',
    name: 'Bob Builder',
    email: 'bob@construction.co',
    phone: '+1 555 0202',
    source: LeadSource.GOOGLE_ADS,
    status: LeadStatus.CONTACTED,
    assignedTo: 'e1',
    dateCreated: new Date(Date.now() - 86400000).toISOString(),
    message: "Need a quote for local SEO services.",
    potentialValue: 1200,
  },
  {
    id: 'l3',
    name: 'Charlie Day',
    email: 'charlie@paddys.pub',
    phone: '+1 555 0303',
    source: LeadSource.INSTAGRAM,
    status: LeadStatus.NEW,
    assignedTo: null,
    dateCreated: new Date(Date.now() - 172800000).toISOString(),
    message: "Love the aesthetic of your new product line. Do you do wholesale?",
    potentialValue: 3500,
  },
  {
    id: 'l4',
    name: 'Diana Prince',
    email: 'diana@themyscira.gov',
    phone: '+1 555 0404',
    source: LeadSource.ORGANIC_SEARCH,
    status: LeadStatus.QUALIFIED,
    assignedTo: 'e2',
    dateCreated: new Date(Date.now() - 250000000).toISOString(),
    message: "Looking for a long-term partnership for logistics handling.",
    potentialValue: 15000,
  },
  {
    id: 'l5',
    name: 'Evan Wright',
    email: 'evan@tech.io',
    phone: '+1 555 0505',
    source: LeadSource.GOOGLE_ADS,
    status: LeadStatus.LOST,
    assignedTo: 'e3',
    dateCreated: new Date(Date.now() - 400000000).toISOString(),
    message: "Just browsing features right now.",
    potentialValue: 0,
  }
];

// Unified fetch function that checks user configuration
export const fetchNewLeads = async (): Promise<Lead[]> => {
  let newLeads: Lead[] = [];
  let hasConfig = false;

  // 1. Check Meta Config
  const metaConfigStr = localStorage.getItem('nexus_meta_config');
  if (metaConfigStr) {
    try {
      const { pageId, accessToken } = JSON.parse(metaConfigStr);
      if (pageId && accessToken) {
        console.log("Fetching real leads from Meta...");
        const metaLeads = await fetchRealMetaLeads(pageId, accessToken);
        newLeads = [...newLeads, ...metaLeads];
        hasConfig = true;
      }
    } catch (e) {
      console.error("Failed to parse meta config", e);
    }
  }

  // 2. Check Google Ads Config
  const googleConfigStr = localStorage.getItem('nexus_google_config');
  if (googleConfigStr) {
    try {
        const { customerId, developerToken } = JSON.parse(googleConfigStr);
        if (customerId && developerToken) {
            console.log("Fetching leads from Google Ads...");
            const googleLeads = await fetchRealGoogleLeads(customerId, developerToken);
            newLeads = [...newLeads, ...googleLeads];
            hasConfig = true;
        }
    } catch (e) {
        console.error("Failed to parse google config", e);
    }
  }

  // 3. If NO config is present, simulate a mock lead so the demo doesn't feel broken
  if (!hasConfig) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockLead: Lead = {
        id: `l${Date.now()}`,
        name: 'Frank Reynolds',
        email: 'frank@wolfcola.com',
        phone: '+1 555 9999',
        source: Math.random() > 0.5 ? LeadSource.FACEBOOK : LeadSource.GOOGLE_ADS,
        status: LeadStatus.NEW,
        assignedTo: null,
        dateCreated: new Date().toISOString(),
        message: "I need to scale my operations immediately. Call me ASAP.",
        potentialValue: 8000,
      };
      newLeads.push(mockLead);
  }

  return newLeads;
};