import type { Quote } from '@/types';
import { daysAgo, daysAhead } from './_gen';

const TERMS = '1. Prices are valid until the quote expiry date.\n2. Payment due within 15 days of invoice.\n3. Taxes as applicable (GST).\n4. Delivery/onboarding begins after advance payment.';

export const quotes: Quote[] = [
  {
    id: 'q1', number: 'Q-0021', title: 'Brightwave Tech — Pro Rollout', contactName: 'Aarav Verma', company: 'Brightwave Tech',
    billToAddress: '14 MG Road, Bengaluru, Karnataka 560001', dealId: 'd1',
    items: [
      { id: 'li1', productId: 'pr2', name: 'PipelineX Pro', description: '25 users annual', qty: 25, unitPrice: 9999, discount: 10, tax: 18 },
      { id: 'li2', productId: 'pr3', name: 'Onboarding & Setup', description: 'One-time', qty: 8, unitPrice: 15000, discount: 0, tax: 18 },
    ],
    currency: 'INR', status: 'Accepted', notes: 'Thank you for your business!', terms: TERMS, createdAt: daysAgo(20), expiryDate: daysAhead(10),
  },
  {
    id: 'q2', number: 'Q-0022', title: 'Nimbus Labs — Starter Pack', contactName: 'Diya Patel', company: 'Nimbus Labs',
    billToAddress: '7 Linking Road, Mumbai, Maharashtra 400050',
    items: [
      { id: 'li3', productId: 'pr1', name: 'PipelineX Starter', description: '3 users', qty: 3, unitPrice: 4999, discount: 0, tax: 18 },
      { id: 'li4', productId: 'pr5', name: 'WhatsApp API Add-on', description: 'Monthly', qty: 1, unitPrice: 2500, discount: 0, tax: 18 },
    ],
    currency: 'INR', status: 'Accepted', notes: 'Looking forward to working together.', terms: TERMS, createdAt: daysAgo(14), expiryDate: daysAhead(16),
  },
  {
    id: 'q3', number: 'Q-0023', title: 'TechCorp Inc — Support Renewal', contactName: 'Karan Singh', company: 'TechCorp Inc',
    billToAddress: '22 Cyber Towers, Hyderabad, Telangana 500081', dealId: 'd5',
    items: [{ id: 'li5', productId: 'pr4', name: 'Priority Support Pack', description: '12 months', qty: 12, unitPrice: 7500, discount: 5, tax: 18 }],
    currency: 'INR', status: 'Viewed', notes: '', terms: TERMS, createdAt: daysAgo(6), expiryDate: daysAhead(9),
  },
  {
    id: 'q4', number: 'Q-0024', title: 'Vertex Retail — Renewal', contactName: 'Neha Joshi', company: 'Vertex Retail',
    billToAddress: '5 Anna Salai, Chennai, Tamil Nadu 600002',
    items: [{ id: 'li6', productId: 'pr2', name: 'PipelineX Pro', description: '10 users', qty: 10, unitPrice: 9999, discount: 8, tax: 18 }],
    currency: 'INR', status: 'Declined', notes: 'Budget not approved this quarter.', terms: TERMS, createdAt: daysAgo(30), expiryDate: daysAgo(2),
  },
  {
    id: 'q5', number: 'Q-0025', title: 'Quanta Foods — Pilot', contactName: 'Pooja Rao', company: 'Quanta Foods',
    billToAddress: '88 SG Highway, Ahmedabad, Gujarat 380015',
    items: [{ id: 'li7', productId: 'pr1', name: 'PipelineX Starter', description: 'Pilot 3 users', qty: 3, unitPrice: 4999, discount: 15, tax: 18 }],
    currency: 'INR', status: 'Sent', notes: '', terms: TERMS, createdAt: daysAgo(3), expiryDate: daysAhead(27),
  },
  {
    id: 'q6', number: 'Q-0026', title: 'Orbit Media — Pro + Add-ons', contactName: 'Vikram Rao', company: 'Orbit Media',
    billToAddress: '12 FC Road, Pune, Maharashtra 411004',
    items: [
      { id: 'li8', productId: 'pr2', name: 'PipelineX Pro', description: '10 users', qty: 10, unitPrice: 9999, discount: 8, tax: 18 },
      { id: 'li9', productId: 'pr6', name: 'Custom Reporting Module', description: 'One-time build', qty: 1, unitPrice: 12000, discount: 0, tax: 18 },
    ],
    currency: 'INR', status: 'Draft', notes: 'Awaiting final scope confirmation.', terms: TERMS, createdAt: daysAgo(1), expiryDate: daysAhead(29),
  },
  {
    id: 'q7', number: 'Q-0027', title: 'StartupXYZ — Growth Bundle', contactName: 'Rahul Mehta', company: 'StartupXYZ',
    billToAddress: '3 Koramangala, Bengaluru, Karnataka 560034',
    items: [
      { id: 'li10', productId: 'pr2', name: 'PipelineX Pro', description: '5 users', qty: 5, unitPrice: 9999, discount: 0, tax: 18 },
      { id: 'li11', productId: 'pr8', name: 'Telephony Minutes (1000)', description: '5 bundles', qty: 5, unitPrice: 1200, discount: 0, tax: 18 },
    ],
    currency: 'INR', status: 'Sent', notes: '', terms: TERMS, createdAt: daysAgo(5), expiryDate: daysAhead(25),
  },
  {
    id: 'q8', number: 'Q-0028', title: 'Pinnacle Health — Enterprise', contactName: 'Sneha Iyer', company: 'Pinnacle Health',
    billToAddress: '45 Salt Lake, Kolkata, West Bengal 700091',
    items: [{ id: 'li12', productId: 'pr10', name: 'Dedicated Account Manager', description: 'Annual', qty: 12, unitPrice: 25000, discount: 12, tax: 18 }],
    currency: 'INR', status: 'Expired', notes: '', terms: TERMS, createdAt: daysAgo(50), expiryDate: daysAgo(10),
  },
];
