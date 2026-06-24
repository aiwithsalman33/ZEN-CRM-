import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Eye, Download, Send, Save, Zap } from 'lucide-react';
import { useStore } from '@/store/store';
import { PageHeader, Button, Input, Textarea, Select, Field, StatusBadge, Modal } from '@/components/ui';
import { GST_RATES } from '@/lib/constants';
import { formatCurrencyFull, lineAmount, amountInWords, uid } from '@/lib/utils';
import type { Quote, QuoteLineItem } from '@/types';

const blankItem = (): QuoteLineItem => ({ id: uid('li'), name: '', description: '', qty: 1, unitPrice: 0, discount: 0, tax: 18 });

const QuoteBuilder: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, toast } = useStore();
  const existing = state.quotes.find((q) => q.id === id);

  const [quote, setQuote] = useState<Quote>(() => existing ?? {
    id: uid('q'), number: `Q-${String(1000 + state.quotes.length + 29).slice(1)}`, title: '', contactName: '', company: '', billToAddress: '',
    items: [blankItem()], currency: 'INR', status: 'Draft', notes: 'Thank you for your business!',
    terms: '1. Prices valid until expiry date.\n2. Payment due within 15 days.\n3. Taxes as applicable (GST).',
    createdAt: new Date().toISOString(), expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
  });
  const [preview, setPreview] = useState(false);

  const setItem = (iid: string, patch: Partial<QuoteLineItem>) => setQuote((q) => ({ ...q, items: q.items.map((it) => it.id === iid ? { ...it, ...patch } : it) }));
  const addItem = () => setQuote((q) => ({ ...q, items: [...q.items, blankItem()] }));
  const removeItem = (iid: string) => setQuote((q) => ({ ...q, items: q.items.filter((it) => it.id !== iid) }));

  const subtotal = quote.items.reduce((a, it) => a + it.qty * it.unitPrice, 0);
  const discountAmt = quote.items.reduce((a, it) => a + it.qty * it.unitPrice * (it.discount / 100), 0);
  const taxable = subtotal - discountAmt;
  const taxAmt = quote.items.reduce((a, it) => a + lineAmount(it).tax, 0);
  const total = taxable + taxAmt;

  const save = (status?: Quote['status']) => {
    const final = status ? { ...quote, status } : quote;
    dispatch(existing ? { type: 'UPDATE', key: 'quotes', id: quote.id, patch: final } : { type: 'ADD', key: 'quotes', item: final, prepend: true });
    toast(status === 'Sent' ? 'Quote sent to client' : 'Quote saved');
    navigate('/quotes');
  };

  return (
    <div>
      <PageHeader
        title={existing ? `Edit ${quote.number}` : 'New Quote'}
        icon={<button onClick={() => navigate('/quotes')} className="text-muted hover:text-ink"><ArrowLeft size={20} /></button>}
        actions={
          <>
            <StatusBadge value={quote.status} />
            <Button variant="outline" onClick={() => setPreview(true)}><Eye size={16} /> Preview</Button>
            <Button variant="outline" onClick={() => toast('PDF downloaded (mock)')}><Download size={16} /> PDF</Button>
            <Button variant="outline" onClick={() => save()}><Save size={16} /> Save Draft</Button>
            <Button onClick={() => save('Sent')}><Send size={16} /> Send</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink mb-3">Bill To</h3>
          <div className="flex flex-col gap-3">
            <Field label="Title"><Input value={quote.title} onChange={(e) => setQuote({ ...quote, title: e.target.value })} placeholder="Quote title" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contact"><Input value={quote.contactName} onChange={(e) => setQuote({ ...quote, contactName: e.target.value })} /></Field>
              <Field label="Company"><Input value={quote.company} onChange={(e) => setQuote({ ...quote, company: e.target.value })} /></Field>
            </div>
            <Field label="Address"><Textarea value={quote.billToAddress} onChange={(e) => setQuote({ ...quote, billToAddress: e.target.value })} className="min-h-[60px]" /></Field>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink mb-3">Quote Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quote #"><Input value={quote.number} onChange={(e) => setQuote({ ...quote, number: e.target.value })} /></Field>
            <Field label="Currency"><Select value={quote.currency} onChange={(e) => setQuote({ ...quote, currency: e.target.value })}>{['INR', 'USD', 'EUR', 'GBP', 'AED'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Quote Date"><Input type="date" value={quote.createdAt.slice(0, 10)} onChange={(e) => setQuote({ ...quote, createdAt: new Date(e.target.value).toISOString() })} /></Field>
            <Field label="Expiry Date"><Input type="date" value={quote.expiryDate.slice(0, 10)} onChange={(e) => setQuote({ ...quote, expiryDate: new Date(e.target.value).toISOString() })} /></Field>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="card p-5 mb-4">
        <h3 className="text-sm font-semibold text-ink mb-3">Line Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs uppercase tracking-wide text-muted border-b border-line">
              <th className="text-left font-semibold py-2 pr-2">Product</th><th className="text-left font-semibold py-2 px-2">Description</th>
              <th className="text-right font-semibold py-2 px-2 w-16">Qty</th><th className="text-right font-semibold py-2 px-2 w-24">Unit Price</th>
              <th className="text-right font-semibold py-2 px-2 w-20">Disc %</th><th className="text-right font-semibold py-2 px-2 w-20">Tax %</th>
              <th className="text-right font-semibold py-2 px-2 w-28">Amount</th><th className="w-8"></th>
            </tr></thead>
            <tbody className="divide-y divide-line">
              {quote.items.map((it) => (
                <tr key={it.id}>
                  <td className="py-2 pr-2">
                    <input list={`prod-${it.id}`} value={it.name} onChange={(e) => { const p = state.products.find((x) => x.name === e.target.value); setItem(it.id, p ? { name: p.name, productId: p.id, unitPrice: p.price, tax: p.tax, description: p.description } : { name: e.target.value }); }} placeholder="Product" className="w-full h-9 px-2 rounded-md border border-line text-sm outline-none focus:border-primary" />
                    <datalist id={`prod-${it.id}`}>{state.products.map((p) => <option key={p.id} value={p.name} />)}</datalist>
                  </td>
                  <td className="py-2 px-2"><input value={it.description} onChange={(e) => setItem(it.id, { description: e.target.value })} className="w-full h-9 px-2 rounded-md border border-line text-sm outline-none focus:border-primary" /></td>
                  <td className="py-2 px-2"><input type="number" value={it.qty} onChange={(e) => setItem(it.id, { qty: Number(e.target.value) })} className="w-full h-9 px-2 rounded-md border border-line text-sm text-right outline-none focus:border-primary" /></td>
                  <td className="py-2 px-2"><input type="number" value={it.unitPrice} onChange={(e) => setItem(it.id, { unitPrice: Number(e.target.value) })} className="w-full h-9 px-2 rounded-md border border-line text-sm text-right outline-none focus:border-primary" /></td>
                  <td className="py-2 px-2"><input type="number" value={it.discount} onChange={(e) => setItem(it.id, { discount: Number(e.target.value) })} className="w-full h-9 px-2 rounded-md border border-line text-sm text-right outline-none focus:border-primary" /></td>
                  <td className="py-2 px-2"><select value={it.tax} onChange={(e) => setItem(it.id, { tax: Number(e.target.value) })} className="w-full h-9 px-1 rounded-md border border-line text-sm outline-none focus:border-primary">{GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}</select></td>
                  <td className="py-2 px-2 text-right font-medium text-ink">{formatCurrencyFull(lineAmount(it).total, quote.currency)}</td>
                  <td className="py-2"><button onClick={() => removeItem(it.id)} className="text-muted hover:text-danger"><Trash2 size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addItem} className="w-full mt-3 h-10 rounded-lg border border-dashed border-line text-sm font-medium text-muted hover:border-primary hover:text-primary flex items-center justify-center gap-1.5"><Plus size={15} /> Add Line Item</button>

        <div className="flex justify-end mt-5">
          <div className="w-full sm:w-72 flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="text-ink">{formatCurrencyFull(subtotal, quote.currency)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Discount</span><span className="text-danger">- {formatCurrencyFull(discountAmt, quote.currency)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Taxable Amount</span><span className="text-ink">{formatCurrencyFull(taxable, quote.currency)}</span></div>
            <div className="flex justify-between"><span className="text-muted">GST</span><span className="text-ink">{formatCurrencyFull(taxAmt, quote.currency)}</span></div>
            <div className="flex justify-between pt-2 border-t border-line text-base font-bold"><span className="text-ink">Total</span><span className="text-primary">{formatCurrencyFull(total, quote.currency)}</span></div>
            <p className="text-xs text-muted italic mt-1">{amountInWords(total)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5"><Field label="Notes to client"><Textarea value={quote.notes} onChange={(e) => setQuote({ ...quote, notes: e.target.value })} /></Field></div>
        <div className="card p-5"><Field label="Terms & Conditions"><Textarea value={quote.terms} onChange={(e) => setQuote({ ...quote, terms: e.target.value })} className="min-h-[100px]" /></Field></div>
      </div>

      {/* Preview */}
      <Modal open={preview} onClose={() => setPreview(false)} size="xl" title="Quote Preview">
        <div className="bg-white p-8 text-sm">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-2"><div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center"><Zap size={20} className="text-white" fill="white" /></div><div><p className="font-bold text-lg text-ink">{state.settings.name}</p><p className="text-xs text-muted">{state.settings.address}, {state.settings.city}</p></div></div>
            <div className="text-right"><p className="font-bold text-xl text-ink">QUOTE</p><p className="text-muted">{quote.number}</p><p className="text-xs text-muted">Date: {quote.createdAt.slice(0, 10)}</p><p className="text-xs text-muted">Expiry: {quote.expiryDate.slice(0, 10)}</p></div>
          </div>
          <div className="mb-6"><p className="text-xs font-semibold text-muted uppercase mb-1">Bill To</p><p className="font-semibold text-ink">{quote.contactName}</p><p className="text-muted">{quote.company}</p><p className="text-muted text-xs whitespace-pre-line">{quote.billToAddress}</p></div>
          <table className="w-full mb-4 border border-line">
            <thead><tr className="bg-bg text-xs uppercase text-muted">{['Item', 'Qty', 'Rate', 'Disc', 'Tax', 'Amount'].map((h) => <th key={h} className="text-left p-2 border-b border-line">{h}</th>)}</tr></thead>
            <tbody>{quote.items.map((it) => <tr key={it.id} className="border-b border-line"><td className="p-2"><p className="font-medium text-ink">{it.name}</p><p className="text-xs text-muted">{it.description}</p></td><td className="p-2">{it.qty}</td><td className="p-2">{formatCurrencyFull(it.unitPrice, quote.currency)}</td><td className="p-2">{it.discount}%</td><td className="p-2">{it.tax}%</td><td className="p-2 font-medium">{formatCurrencyFull(lineAmount(it).total, quote.currency)}</td></tr>)}</tbody>
          </table>
          <div className="flex justify-end"><div className="w-64 flex flex-col gap-1"><div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatCurrencyFull(subtotal, quote.currency)}</span></div><div className="flex justify-between"><span className="text-muted">Discount</span><span>- {formatCurrencyFull(discountAmt, quote.currency)}</span></div><div className="flex justify-between"><span className="text-muted">GST</span><span>{formatCurrencyFull(taxAmt, quote.currency)}</span></div><div className="flex justify-between font-bold text-base border-t border-line pt-1"><span>Total</span><span className="text-primary">{formatCurrencyFull(total, quote.currency)}</span></div></div></div>
          <p className="text-xs text-muted italic mt-2 text-right">{amountInWords(total)}</p>
          <div className="mt-6 pt-4 border-t border-line"><p className="text-xs text-muted">{quote.notes}</p><p className="text-xs text-muted whitespace-pre-line mt-2">{quote.terms}</p></div>
        </div>
      </Modal>
    </div>
  );
};

export default QuoteBuilder;
