export enum LeadSource {
  FACEBOOK = 'Facebook',
  INSTAGRAM = 'Instagram',
  GOOGLE_ADS = 'Google Ads',
  ORGANIC_SEARCH = 'Organic Search'
}

export enum LeadStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  QUALIFIED = 'Qualified',
  PROPOSAL = 'Proposal',
  CLOSED = 'Closed',
  LOST = 'Lost'
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  activeLeads: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  assignedTo: string | null; // Employee ID
  dateCreated: string;
  message: string; // Initial inquiry
  potentialValue: number;
  aiAnalysis?: string; // Stored AI insight
  aiScore?: number; // 0-100 probability
}

export interface DashboardStats {
  totalLeads: number;
  conversionRate: number;
  revenue: number;
  activeEmployees: number;
}