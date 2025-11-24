import { Lead, LeadSource, LeadStatus } from '../types';

const GRAPH_API_VERSION = 'v19.0';

export const validateMetaConnection = async (pageId: string, accessToken: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}?access_token=${accessToken}&fields=id,name`);
    const data = await response.json();
    return !data.error && data.id === pageId;
  } catch (e) {
    console.error("Meta Validation Error", e);
    return false;
  }
};

export const fetchRealMetaLeads = async (pageId: string, accessToken: string): Promise<Lead[]> => {
  try {
    // Fetch leads from the page
    // Note: The token must have 'leads_retrieval' and 'pages_read_engagement' permissions
    // and the Page must have the Lead Access configured in Business Manager.
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/leads?access_token=${accessToken}&fields=created_time,id,field_data`
    );
    
    const data = await response.json();

    if (data.error) {
      console.warn("Meta API Error:", data.error.message);
      return [];
    }

    return (data.data || []).map((item: any) => {
      const getField = (name: string) => {
         return item.field_data?.find((f: any) => f.name === name)?.values?.[0];
      };

      // Try to map common field names from Lead Gen forms
      const name = getField('full_name') || getField('name') || getField('first_name') + ' ' + getField('last_name') || 'Meta Lead';
      const email = getField('email') || getField('email_address') || '';
      const phone = getField('phone_number') || getField('phone') || '';

      return {
        id: `meta_${item.id}`,
        name: name,
        email: email,
        phone: phone,
        source: LeadSource.FACEBOOK, // API doesn't always distinguish Organic vs Paid easily without ad_id, defaulting to Facebook
        status: LeadStatus.NEW,
        assignedTo: null,
        dateCreated: item.created_time || new Date().toISOString(),
        message: "Lead imported from Meta Lead Ads.",
        potentialValue: 0, // Meta leads don't have intrinsic value usually, defaults to 0
      } as Lead;
    });

  } catch (e) {
    console.error("Error fetching Meta leads", e);
    return [];
  }
};