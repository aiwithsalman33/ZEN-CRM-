import React, { useMemo, useState } from 'react';
import { Package, Plus, LayoutGrid, Table2, Edit3, Trash2 } from 'lucide-react';
import { useStore } from '@/store/store';
import {
  PageHeader, Button, DataTable, StatusBadge, ViewToggle, Select, Modal, Field, Input, Textarea,
  ConfirmDialog, EmptyState, type Column,
} from '@/components/ui';
import { GST_RATES, PRODUCT_UNITS } from '@/lib/constants';
import { formatCurrencyFull, uid } from '@/lib/utils';
import type { Product } from '@/types';

const blank = (): Product => ({ id: '', name: '', sku: '', category: 'Software', price: 0, tax: 18, unit: 'Piece', stock: 0, lowStockAlert: 10, status: 'Active', description: '' });

const ProductsPage: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [cat, setCat] = useState('all');
  const [status, setStatus] = useState('all');
  const [edit, setEdit] = useState<Product | null>(null);
  const [del, setDel] = useState<Product | null>(null);

  const categories = [...new Set(state.products.map((p) => p.category))];
  const products = useMemo(() => state.products.filter((p) => (cat === 'all' || p.category === cat) && (status === 'all' || p.status === status)), [state.products, cat, status]);

  const save = () => {
    if (!edit || !edit.name.trim()) { toast('Name required', 'error'); return; }
    const exists = state.products.some((p) => p.id === edit.id);
    dispatch(exists ? { type: 'UPDATE', key: 'products', id: edit.id, patch: edit } : { type: 'ADD', key: 'products', item: { ...edit, id: uid('pr') }, prepend: true });
    toast('Product saved'); setEdit(null);
  };

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Product', sortable: true, sortValue: (p) => p.name, render: (p) => <div><p className="font-medium text-ink">{p.name}</p><p className="text-xs text-muted">{p.description}</p></div> },
    { key: 'sku', header: 'SKU', render: (p) => <span className="text-muted text-xs">{p.sku}</span> },
    { key: 'category', header: 'Category', render: (p) => <StatusBadge value={p.category} tone="indigo" /> },
    { key: 'unit', header: 'Unit', render: (p) => <span className="text-muted">{p.unit}</span> },
    { key: 'price', header: 'Price', align: 'right', sortable: true, sortValue: (p) => p.price, render: (p) => <span className="font-semibold text-ink">{formatCurrencyFull(p.price)}</span> },
    { key: 'tax', header: 'GST', align: 'right', render: (p) => <span className="text-muted">{p.tax}%</span> },
    { key: 'stock', header: 'Stock', align: 'right', render: (p) => <span className={p.stock <= p.lowStockAlert ? 'text-danger font-medium' : 'text-muted'}>{p.stock}</span> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge value={p.status} /> },
    { key: 'actions', header: '', render: (p) => (
      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setEdit(p)} className="w-8 h-8 rounded-lg bg-bg hover:bg-line flex items-center justify-center text-muted"><Edit3 size={14} /></button>
        <button onClick={() => setDel(p)} className="w-8 h-8 rounded-lg bg-bg hover:bg-danger/10 hover:text-danger flex items-center justify-center text-muted"><Trash2 size={14} /></button>
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Products" icon={<Package size={20} />} actions={<Button onClick={() => setEdit(blank())}><Plus size={16} /> Add Product</Button>} />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Select className="!h-9 !w-40" value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All Categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</Select>
          <Select className="!h-9 !w-36" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All Status</option><option>Active</option><option>Inactive</option></Select>
        </div>
        <ViewToggle active={view} onChange={(v) => setView(v as typeof view)} options={[{ key: 'table', icon: <Table2 size={15} />, label: 'Table' }, { key: 'grid', icon: <LayoutGrid size={15} />, label: 'Grid' }]} />
      </div>

      {products.length === 0 ? (
        <div className="card"><EmptyState icon={Package} title="No products" description="Add your first product." actionLabel="Add Product" onAction={() => setEdit(blank())} /></div>
      ) : view === 'table' ? (
        <DataTable columns={columns} rows={products} rowKey={(p) => p.id} pageSize={10} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="w-full h-24 rounded-lg bg-primary-light flex items-center justify-center mb-3"><Package size={32} className="text-primary" /></div>
              <div className="flex items-start justify-between"><h4 className="text-sm font-semibold text-ink">{p.name}</h4><StatusBadge value={p.status} /></div>
              <p className="text-xs text-muted">{p.sku}</p>
              <div className="flex items-center justify-between mt-2"><span className="text-lg font-bold text-primary">{formatCurrencyFull(p.price)}</span><span className={`text-xs ${p.stock <= p.lowStockAlert ? 'text-danger' : 'text-muted'}`}>Stock: {p.stock}</span></div>
              <div className="flex gap-2 mt-3"><Button variant="outline" size="sm" className="flex-1" onClick={() => setEdit(p)}>Edit</Button><button onClick={() => setDel(p)} className="w-8 h-8 rounded-lg bg-bg hover:bg-danger/10 hover:text-danger flex items-center justify-center text-muted"><Trash2 size={14} /></button></div>
            </div>
          ))}
        </div>
      )}

      {edit && (
        <Modal open onClose={() => setEdit(null)} title={state.products.some((p) => p.id === edit.id) ? 'Edit Product' : 'Add Product'} size="lg" footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Product Name" required className="col-span-2"><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label="SKU"><Input value={edit.sku} onChange={(e) => setEdit({ ...edit, sku: e.target.value })} /></Field>
            <Field label="Category"><Input value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} /></Field>
            <Field label="Unit"><Select value={edit.unit} onChange={(e) => setEdit({ ...edit, unit: e.target.value })}>{PRODUCT_UNITS.map((u) => <option key={u}>{u}</option>)}</Select></Field>
            <Field label="Unit Price" required><Input type="number" value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} /></Field>
            <Field label="GST %"><Select value={edit.tax} onChange={(e) => setEdit({ ...edit, tax: Number(e.target.value) })}>{GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}</Select></Field>
            <Field label="Stock"><Input type="number" value={edit.stock} onChange={(e) => setEdit({ ...edit, stock: Number(e.target.value) })} /></Field>
            <Field label="Low Stock Alert"><Input type="number" value={edit.lowStockAlert} onChange={(e) => setEdit({ ...edit, lowStockAlert: Number(e.target.value) })} /></Field>
            <Field label="Status"><Select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as Product['status'] })}><option>Active</option><option>Inactive</option></Select></Field>
            <Field label="Description" className="col-span-2"><Textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
          </div>
        </Modal>
      )}

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete product?" message={`Remove "${del?.name}"?`} confirmLabel="Delete" onConfirm={() => { if (del) { dispatch({ type: 'DELETE', key: 'products', id: del.id }); toast('Product deleted', 'warning'); } }} />
    </div>
  );
};

export default ProductsPage;
