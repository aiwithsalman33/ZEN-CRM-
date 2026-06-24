import type { Product } from '@/types';

export const products: Product[] = [
  { id: 'pr1', name: 'PipelineX Starter', sku: 'PX-ST-001', category: 'Software', price: 4999, tax: 18, unit: 'Piece', stock: 999, lowStockAlert: 10, status: 'Active', description: 'Entry plan for small teams, up to 3 users.' },
  { id: 'pr2', name: 'PipelineX Pro', sku: 'PX-PRO-002', category: 'Software', price: 9999, tax: 18, unit: 'Piece', stock: 999, lowStockAlert: 10, status: 'Active', description: 'Advanced plan with automation & reports.' },
  { id: 'pr3', name: 'Onboarding & Setup', sku: 'SVC-ONB-003', category: 'Service', price: 15000, tax: 18, unit: 'Hr', stock: 50, lowStockAlert: 5, status: 'Active', description: 'Guided onboarding and data migration.' },
  { id: 'pr4', name: 'Priority Support Pack', sku: 'SVC-SUP-004', category: 'Service', price: 7500, tax: 18, unit: 'Set', stock: 100, lowStockAlert: 10, status: 'Active', description: '24x7 priority support with dedicated rep.' },
  { id: 'pr5', name: 'WhatsApp API Add-on', sku: 'ADD-WA-005', category: 'Add-on', price: 2500, tax: 18, unit: 'Piece', stock: 500, lowStockAlert: 20, status: 'Active', description: 'Official WhatsApp Business API integration.' },
  { id: 'pr6', name: 'Custom Reporting Module', sku: 'ADD-RPT-006', category: 'Add-on', price: 12000, tax: 18, unit: 'Piece', stock: 3, lowStockAlert: 5, status: 'Active', description: 'Bespoke analytics dashboards.' },
  { id: 'pr7', name: 'Lead Scoring AI', sku: 'ADD-AI-007', category: 'Add-on', price: 5000, tax: 18, unit: 'Piece', stock: 0, lowStockAlert: 5, status: 'Inactive', description: 'AI-powered lead scoring engine.' },
  { id: 'pr8', name: 'Telephony Minutes (1000)', sku: 'TEL-1K-008', category: 'Usage', price: 1200, tax: 18, unit: 'Set', stock: 250, lowStockAlert: 25, status: 'Active', description: 'Bundle of 1000 outbound call minutes.' },
  { id: 'pr9', name: 'Email Credits (10k)', sku: 'EML-10K-009', category: 'Usage', price: 900, tax: 18, unit: 'Set', stock: 400, lowStockAlert: 40, status: 'Active', description: '10,000 transactional email credits.' },
  { id: 'pr10', name: 'Dedicated Account Manager', sku: 'SVC-DAM-010', category: 'Service', price: 25000, tax: 18, unit: 'Set', stock: 8, lowStockAlert: 2, status: 'Active', description: 'Monthly retainer for a dedicated CSM.' },
];
