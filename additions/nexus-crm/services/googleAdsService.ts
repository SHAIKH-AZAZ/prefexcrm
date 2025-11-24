import { Lead, LeadSource, LeadStatus } from '../types';

// Simulates Google Ads API interaction
// Note: Real Google Ads API implementation requires server-side OAuth2 flow.
// This service simulates the client-side configuration experience.

export const validateGoogleAdsConnection = async (customerId: string, developerToken: string): Promise<boolean> => {
  // Simulate network validation delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Basic validation simulation
  // In a real app, this would ping an endpoint like /customers:listAccessibleCustomers
  if (customerId.length > 3 && developerToken.length > 5) {
    return true;
  }
  return false;
};

export const fetchRealGoogleLeads = async (customerId: string, token: string): Promise<Lead[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return simulated "Real" data from Google
    // In a real production build, this would fetch from your backend proxy
    return [
        {
            id: `gads_${Date.now()}_1`,
            name: "Sarah Jenkins",
            email: "sarah.j@enterprise-search.com",
            phone: "+1 555 0199",
            source: LeadSource.GOOGLE_ADS,
            status: LeadStatus.NEW,
            assignedTo: null,
            dateCreated: new Date().toISOString(),
            message: "Found you via search. We are looking for a new CRM for our sales team of 20.",
            potentialValue: 4500
        },
         {
            id: `gads_${Date.now()}_2`,
            name: "TechFlow Systems",
            email: "procurement@techflow.io",
            phone: "+1 555 0188",
            source: LeadSource.GOOGLE_ADS,
            status: LeadStatus.NEW,
            assignedTo: null,
            dateCreated: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            message: "Requesting a demo for the enterprise tier.",
            potentialValue: 12000
        }
    ];
}