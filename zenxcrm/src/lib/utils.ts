// ===== ZENX CRM — shared utilities =====

/** Merge class names, dropping falsy values. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

let _idc = 0;
/** Reasonably-unique id for client-created records. */
export function uid(prefix = 'id'): string {
  _idc += 1;
  return `${prefix}_${Date.now().toString(36)}${_idc}${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = ['#5B4FE8', '#00C897', '#FF4757', '#FFA502', '#3B82F6', '#8B5CF6', '#EC4899', '#0EA5E9', '#14B8A6', '#F59E0B'];
/** Deterministic color based on a name hash. */
export function colorFromName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function formatCurrency(value: number, currency = 'INR'): string {
  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };
  const sym = symbols[currency] ?? '';
  if (Math.abs(value) >= 10000000) return `${sym}${(value / 10000000).toFixed(2)}Cr`;
  if (Math.abs(value) >= 100000) return `${sym}${(value / 100000).toFixed(2)}L`;
  if (Math.abs(value) >= 1000) return `${sym}${(value / 1000).toFixed(1)}K`;
  return `${sym}${value.toLocaleString('en-IN')}`;
}

export function formatCurrencyFull(value: number, currency = 'INR'): string {
  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };
  return `${symbols[currency] ?? ''}${value.toLocaleString('en-IN')}`;
}

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

/** Human "x ago" relative time. */
export function timeAgo(iso?: string): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const fut = diff < 0;
  const mins = Math.round(abs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return fut ? `in ${mins}m` : `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return fut ? `in ${hrs}h` : `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return fut ? `in ${days}d` : `${days}d ago`;
  const months = Math.round(days / 30);
  return fut ? `in ${months}mo` : `${months}mo ago`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Compute line-item / quote totals. */
export function lineAmount(item: { qty: number; unitPrice: number; discount: number; tax: number }) {
  const gross = item.qty * item.unitPrice;
  const afterDiscount = gross * (1 - item.discount / 100);
  const tax = afterDiscount * (item.tax / 100);
  return { gross, afterDiscount, tax, total: afterDiscount + tax };
}

/** Indian-style number to words (rupees). */
export function amountInWords(num: number): string {
  num = Math.round(num);
  if (num === 0) return 'Zero Rupees Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = (n: number): string => (n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ' ' + ones[n % 10] : ''}`);
  const three = (n: number): string => `${n >= 100 ? ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' : '') : ''}${n % 100 ? two(n % 100) : ''}`;
  let result = '';
  const crore = Math.floor(num / 10000000); num %= 10000000;
  const lakh = Math.floor(num / 100000); num %= 100000;
  const thousand = Math.floor(num / 1000); num %= 1000;
  if (crore) result += three(crore) + ' Crore ';
  if (lakh) result += three(lakh) + ' Lakh ';
  if (thousand) result += three(thousand) + ' Thousand ';
  if (num) result += three(num);
  return `${result.trim()} Rupees Only`;
}

export function download(filename: string, content: string, mime = 'text/csv') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function toCSV(rows: Record<string, unknown>[], columns?: string[]): string {
  if (rows.length === 0) return '';
  const cols = columns ?? Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}
