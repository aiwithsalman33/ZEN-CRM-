import type { WhatsAppConversation, WhatsAppTemplate, Broadcast } from '@/types';
import { makeRng, pick, int, chance, daysAgo, firstNames, lastNames, phone } from './_gen';

const rng = makeRng(606);
const incoming = ['Hi, is this still available?', 'What are your prices?', 'Can you send a brochure?', 'Thanks!', 'Okay sounds good', 'Please call me', 'Interested 👍', 'When can we meet?', 'Yes please proceed'];
const outgoing = ['Hello! Thanks for reaching out 😊', 'Sure, sharing the details now.', 'Our Pro plan starts at ₹9,999/mo.', 'Let me schedule a quick call.', 'Sent! Let me know if you have questions.', 'Great, talk soon!', 'Happy to help!'];

export const whatsappConversations: WhatsAppConversation[] = Array.from({ length: 10 }).map((_, i) => {
  const name = `${pick(rng, firstNames)} ${pick(rng, lastNames)}`;
  const count = int(rng, 4, 9);
  const messages = Array.from({ length: count }).map((__, j) => {
    const fromMe = j % 2 === 1;
    return {
      id: `wm${i}-${j}`,
      fromMe,
      text: fromMe ? pick(rng, outgoing) : pick(rng, incoming),
      timestamp: daysAgo(int(rng, 0, 2), j),
      type: 'text' as const,
      status: fromMe ? (pick(rng, ['sent', 'delivered', 'read']) as 'sent' | 'delivered' | 'read') : undefined,
    };
  });
  return {
    id: `wa${i + 1}`,
    contactName: name,
    phone: phone(rng),
    kind: chance(rng, 0.6) ? 'Lead' : 'Contact',
    unread: i < 4 ? int(rng, 1, 4) : 0,
    messages,
  } satisfies WhatsAppConversation;
});

export const whatsappTemplates: WhatsAppTemplate[] = [
  { id: 'wt1', name: 'Welcome Message', category: 'Welcome', status: 'Approved', body: 'Hi {{name}}, welcome to PipelineX! How can we help you today?' },
  { id: 'wt2', name: 'Follow-up Reminder', category: 'Follow-up', status: 'Approved', body: 'Hi {{name}}, just following up on our conversation. Are you ready to proceed?' },
  { id: 'wt3', name: 'Payment Reminder', category: 'Invoice', status: 'Pending', body: 'Hi {{name}}, your invoice of {{amount}} is due. Please complete the payment.' },
  { id: 'wt4', name: 'Diwali Offer', category: 'Promotion', status: 'Approved', body: 'Hi {{name}}, celebrate Diwali with 20% off all plans! Offer valid till stocks last. 🎉' },
  { id: 'wt5', name: 'Demo Reminder', category: 'Reminder', status: 'Rejected', body: 'Hi {{name}}, your demo is scheduled for {{time}}. See you soon!' },
];

export const broadcasts: Broadcast[] = [
  { id: 'b1', name: 'Diwali Campaign', template: 'Diwali Offer', recipients: 240, sent: 240, delivered: 232, read: 188, replied: 41, date: daysAgo(8) },
  { id: 'b2', name: 'Q2 Re-engagement', template: 'Follow-up Reminder', recipients: 120, sent: 120, delivered: 118, read: 90, replied: 22, date: daysAgo(15) },
  { id: 'b3', name: 'New Feature Launch', template: 'Welcome Message', recipients: 360, sent: 355, delivered: 350, read: 270, replied: 58, date: daysAgo(2) },
];
