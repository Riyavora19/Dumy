import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';
import './AdminBudgetPlanPresets.css';

const API = import.meta.env.VITE_API_URL || 'https://dumy-2-mli2.onrender.com';

const ROOM_ICONS = ['🏠','🚿','🛁','🚽','🍳','🛏️','🪟','🔧'];

const ROOM_NAME_OPTIONS = [
  'Master Bathroom',
  'Parents Bathroom',
  'Children Bathroom',
  'Powder Bathroom',
  'Powder Toilet',
  'Children Toilet',
  'Kitchen',
];

const AREAS = [
  { id: 'shower', name: 'Shower Area', icon: '🚿' },
  { id: 'basin',  name: 'Basin Area',  icon: '🪣' },
  { id: 'wc',     name: 'WC Area',     icon: '🚽' },
  { id: 'bathtub',name: 'Bathtub Area',icon: '🛁' },
  { id: 'urinal', name: 'Urinal Area', icon: '🚰' },
];

const AREA_COLORS = {
  shower:  { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  basin:   { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
  wc:      { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
  bathtub: { bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff' },
  urinal:  { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
};

export default function AdminBudgetPlanPresets() {
  const { showNotification } = useNotification();

  const [presets, setPresets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);

  const [allProducts, setAllProducts]         = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQ, setSearchQ]                 = useState('');
  const [filterCompany, setFilterCompany]     = useState('');
  const [companies, setCompanies]             = useState([]);

  // Area picker popup state
  const [areaPicker, setAreaPicker] = useState(null); // { product, x, y }
  const pickerRef = useRef(null);

  const emptyForm = { roomName: ROOM_NAME_OPTIONS[0], icon: '🏠', isActive: true, order: 0, products: [] };
  const [form, setForm] = useState(emptyForm);

  // ── Fetch presets ──────────────────────────────────────────────────────────
  const fetchPresets = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/budget-plan-presets`);
      const d = await r.json();
      setPresets(d.data || []);
    } catch { showNotification('Failed to load presets', 'error'); }
    finally { setLoading(false); }
  }, [showNotification]);

  useEffect(() => { fetchPresets(); }, [fetchPresets]);

  // ── Load products when form opens ──────────────────────────────────────────
  useEffect(() => {
    if (!showForm || allProducts.length > 0) return;
    setProductsLoading(true);
    fetch(`${API}/api/products`)
      .then(r => r.json())
      .then(d => {
        const prods = d.data || d.products || (Array.isArray(d) ? d : []);
        setAllProducts(prods);
        const seen = new Set(); const cos = [];
        prods.forEach(p => {
          const name = p.company?.name || p.companyName || '';
          if (name && !seen.has(name)) { seen.add(name); cos.push(name); }
        });
        setCompanies(cos.sort());
      })
      .catch(() => {})
      .finally(() => setProductsLoading(false));
  }, [showForm, allProducts.length]);

  // Close area picker on outside click
  useEffect(() => {
    if (!areaPicker) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setAreaPicker(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [areaPicker]);

  // ── Filtered products ──────────────────────────────────────────────────────
  const filtered = allProducts.filter(p => {
    const q = searchQ.toLowerCase();
    const matchQ = !q ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.company?.name || p.companyName || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q);
    const matchC = !filterCompany || (p.company?.name || p.companyName || '') === filterCompany;
    return matchQ && matchC;
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null);
    const firstAvailable = ROOM_NAME_OPTIONS.find(n => !presets.some(p => p.roomName === n)) || ROOM_NAME_OPTIONS[0];
    setForm({ ...emptyForm, roomName: firstAvailable });
    setSearchQ(''); setFilterCompany(''); setAreaPicker(null);
    setShowForm(true);
  };

  const openEdit = (preset) => {
    setEditing(preset);
    let prods = [];
    if (preset.products?.length > 0) prods = preset.products;
    else if (preset.areas) preset.areas.forEach(a => (a.defaultProducts || []).forEach(p => prods.push(p)));
    setForm({ roomName: preset.roomName, icon: preset.icon || '🏠', isActive: preset.isActive, order: preset.order || 0, products: prods });
    setSearchQ(''); setFilterCompany(''); setAreaPicker(null);
    setShowForm(true);
  };

  const getProductArea = (productId) => form.products.find(p => p.productId === productId)?.areaId || null;
  const isSelected = (productId) => form.products.some(p => p.productId === productId);

  // Click on product card → show area picker popup
  const handleProductClick = (e, product) => {
    if (isSelected(product._id)) {
      // Already selected → remove it
      setForm(f => ({ ...f, products: f.products.filter(p => p.productId !== product._id) }));
      return;
    }
    // Show area picker near the clicked card
    const rect = e.currentTarget.getBoundingClientRect();
    const modalEl = e.currentTarget.closest('.abpp__modal');
    const modalRect = modalEl ? modalEl.getBoundingClientRect() : { left: 0, top: 0 };
    setAreaPicker({
      product,
      x: rect.left - modalRect.left + rect.width / 2,
      y: rect.top  - modalRect.top  + rect.height + 6,
    });
  };

  // User picks an area from the popup
  const handleAreaPick = (area) => {
    const { product } = areaPicker;
    setForm(f => ({
      ...f,
      products: [...f.products, {
        productId:   product._id,
        productName: product.name,
        companyName: product.company?.name || product.companyName || '',
        images:      product.images || [],
        price:       product.price || 0,
        quantity:    1,
        essential:   true,
        areaId:      area.id,
        areaName:    area.name,
        areaIcon:    area.icon,
      }]
    }));
    setAreaPicker(null);
  };

  const removeProduct = (productId) =>
    setForm(f => ({ ...f, products: f.products.filter(p => p.productId !== productId) }));

  const updateQty = (productId, qty) =>
    setForm(f => ({ ...f, products: f.products.map(p => p.productId === productId ? { ...p, quantity: qty } : p) }));

  const updateArea = (productId, areaId) => {
    const area = AREAS.find(a => a.id === areaId);
    setForm(f => ({ ...f, products: f.products.map(p =>
      p.productId === productId ? { ...p, areaId, areaName: area?.name, areaIcon: area?.icon } : p
    )}));
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.roomName.trim()) { showNotification('Room name is required', 'error'); return; }

    // Group products by area for the areas array
    const areaMap = {};
    form.products.forEach(p => {
      const aId = p.areaId || 'all';
      if (!areaMap[aId]) {
        const area = AREAS.find(a => a.id === aId) || { id: 'all', name: 'All Areas', icon: '🏠' };
        areaMap[aId] = { id: area.id, name: area.name, icon: area.icon, defaultProducts: [] };
      }
      areaMap[aId].defaultProducts.push(p);
    });

    const payload = {
      roomName: form.roomName, icon: form.icon, isActive: form.isActive, order: form.order,
      products: form.products,
      areas: Object.values(areaMap),
    };

    const url    = editing ? `${API}/api/budget-plan-presets/${editing._id}` : `${API}/api/budget-plan-presets`;
    const method = editing ? 'PUT' : 'POST';
    try {
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (!d.success) throw new Error(d.message);
      showNotification(`Preset ${editing ? 'updated' : 'created'}!`, 'success');
      setShowForm(false);
      fetchPresets();
    } catch (err) { showNotification(err.message || 'Save failed', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this preset?')) return;
    try {
      await fetch(`${API}/api/budget-plan-presets/${id}`, { method: 'DELETE' });
      showNotification('Deleted', 'success');
      fetchPresets();
    } catch { showNotification('Delete failed', 'error'); }
  };

  // Group selected products by area for display
  const productsByArea = AREAS.map(area => ({
    ...area,
    products: form.products.filter(p => p.areaId === area.id)
  })).filter(a => a.products.length > 0);
  const unassigned = form.products.filter(p => !p.areaId || p.areaId === 'all');

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="abpp">
      <div className="abpp__header">
        <div>
          <h2>🏗️ Budget Plan Presets</h2>
          <p>Select products that auto-add when a room is created in the Budget Planner.</p>
        </div>
        <button className="abpp__btn-primary" onClick={openCreate}>+ New Preset</button>
      </div>

      {loading ? (
        <div className="abpp__loading">Loading presets…</div>
      ) : presets.length === 0 ? (
        <div className="abpp__empty">
          <p>No presets yet.</p>
          <button className="abpp__btn-primary" onClick={openCreate}>Create First Preset</button>
        </div>
      ) : (
        <div className="abpp__grid">
          {presets.map(p => {
            const total = p.products?.length || (p.areas || []).reduce((s, a) => s + (a.defaultProducts?.length || 0), 0);
            return (
              <div key={p._id} className={`abpp__card ${!p.isActive ? 'abpp__card--inactive' : ''}`}>
                <div className="abpp__card-top">
                  <span className="abpp__card-icon">{p.icon}</span>
                  <div>
                    <h3>{p.roomName}</h3>
                    <span className={`abpp__badge ${p.isActive ? 'abpp__badge--active' : 'abpp__badge--off'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                {/* Show area breakdown */}
                <div className="abpp__card-areas">
                  {(p.areas || []).filter(a => a.defaultProducts?.length > 0).map(a => (
                    <div key={a.id} className="abpp__area-pill">
                      {a.icon} {a.name} <span className="abpp__area-count">{a.defaultProducts.length}</span>
                    </div>
                  ))}
                </div>
                <div className="abpp__card-total">{total} products total</div>
                <div className="abpp__card-actions">
                  <button className="abpp__btn-edit" onClick={() => openEdit(p)}>✏️ Edit</button>
                  <button className="abpp__btn-delete" onClick={() => handleDelete(p._id)}>🗑️ Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {showForm && (
        <div className="abpp__overlay" onClick={() => { setShowForm(false); setAreaPicker(null); }}>
          <div className="abpp__modal" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>

            <div className="abpp__modal-header">
              <h3>{editing ? `Edit: ${editing.roomName}` : 'New Budget Plan Preset'}</h3>
              <button className="abpp__close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSave} className="abpp__form">

              {/* Config bar */}
              <div className="abpp__config-bar">
                <div className="abpp__icon-row">
                  {ROOM_ICONS.map(ic => (
                    <button key={ic} type="button"
                      className={`abpp__icon-btn ${form.icon === ic ? 'abpp__icon-btn--active' : ''}`}
                      onClick={() => setForm(f => ({ ...f, icon: ic }))}>{ic}</button>
                  ))}
                </div>
                <select className="abpp__room-name-select" value={form.roomName}
                  onChange={e => setForm(f => ({ ...f, roomName: e.target.value }))}
                  required disabled={!!editing}>
                  {ROOM_NAME_OPTIONS.map(name => {
                    const taken = !editing && presets.some(p => p.roomName === name);
                    return <option key={name} value={name} disabled={taken}>{name}{taken ? ' (exists)' : ''}</option>;
                  })}
                </select>
                <label className="abpp__toggle-label">
                  Active
                  <label className="abpp__toggle">
                    <input type="checkbox" checked={form.isActive}
                      onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                    <span className="abpp__toggle-slider" />
                  </label>
                </label>
              </div>

              <div className="abpp__split">

                {/* LEFT — product browser */}
                <div className="abpp__left">
                  <div className="abpp__browser-top">
                    <span className="abpp__browser-title">All Products</span>
                    <span className="abpp__prod-count">{filtered.length} shown · click to add</span>
                  </div>
                  <div className="abpp__filters">
                    <input className="abpp__search-input" placeholder="🔍 Search…"
                      value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                    <select className="abpp__company-filter" value={filterCompany}
                      onChange={e => setFilterCompany(e.target.value)}>
                      <option value="">All Companies</option>
                      {companies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {productsLoading ? (
                    <div className="abpp__prod-loading">Loading products…</div>
                  ) : (
                    <div className="abpp__prod-grid">
                      {filtered.map(p => {
                        const sel = isSelected(p._id);
                        const areaId = getProductArea(p._id);
                        const areaColor = areaId ? AREA_COLORS[areaId] : null;
                        const imgSrc = p.images?.[0]
                          ? (p.images[0].startsWith('http') ? p.images[0] : `https://dumy-2-mli2.onrender.com${p.images[0]}`)
                          : null;
                        return (
                          <div key={p._id}
                            className={`abpp__prod-card ${sel ? 'abpp__prod-card--selected' : ''}`}
                            onClick={e => handleProductClick(e, p)}>
                            {sel && areaColor && (
                              <div className="abpp__prod-area-badge"
                                style={{ background: areaColor.bg, color: areaColor.text, border: `1px solid ${areaColor.border}` }}>
                                {AREAS.find(a => a.id === areaId)?.icon} {AREAS.find(a => a.id === areaId)?.name.replace(' Area','')}
                              </div>
                            )}
                            {sel && !areaColor && <div className="abpp__prod-check">✓</div>}
                            <div className="abpp__prod-img">
                              {imgSrc ? <img src={imgSrc} alt={p.name} /> : <div className="abpp__prod-no-img">📦</div>}
                            </div>
                            <div className="abpp__prod-name">{p.name}</div>
                            <div className="abpp__prod-co">{p.company?.name || p.companyName}</div>
                            <div className="abpp__prod-price">₹{(p.price || 0).toLocaleString()}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* RIGHT — selected products grouped by area */}
                <div className="abpp__right">
                  <div className="abpp__right-top">
                    <div className="abpp__sel-header">
                      <strong>Auto-add Products</strong>
                      <span className="abpp__sel-count">{form.products.length} selected</span>
                    </div>
                    <p className="abpp__sel-hint">Click a product → pick its area. Products auto-add when this room is created.</p>
                  </div>

                  {form.products.length === 0 ? (
                    <div className="abpp__selected-empty">Click products on the left → choose area</div>
                  ) : (
                    <div className="abpp__selected-items">
                      {/* Grouped by area */}
                      {productsByArea.map(area => {
                        const col = AREA_COLORS[area.id] || {};
                        return (
                          <div key={area.id} className="abpp__area-group">
                            <div className="abpp__area-group-header"
                              style={{ background: col.bg, color: col.text, borderColor: col.border }}>
                              {area.icon} {area.name}
                              <span className="abpp__area-group-count">{area.products.length}</span>
                            </div>
                            {area.products.map((prod, pi) => (
                              <SelItem key={pi} prod={prod} areas={AREAS}
                                onRemove={() => removeProduct(prod.productId)}
                                onQty={qty => updateQty(prod.productId, qty)}
                                onArea={aId => updateArea(prod.productId, aId)} />
                            ))}
                          </div>
                        );
                      })}
                      {/* Unassigned */}
                      {unassigned.length > 0 && (
                        <div className="abpp__area-group">
                          <div className="abpp__area-group-header" style={{ background: '#f3f4f6', color: '#374151' }}>
                            🏠 Unassigned
                            <span className="abpp__area-group-count">{unassigned.length}</span>
                          </div>
                          {unassigned.map((prod, pi) => (
                            <SelItem key={pi} prod={prod} areas={AREAS}
                              onRemove={() => removeProduct(prod.productId)}
                              onQty={qty => updateQty(prod.productId, qty)}
                              onArea={aId => updateArea(prod.productId, aId)} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="abpp__form-footer">
                <button type="button" className="abpp__btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="abpp__btn-save">
                  {editing ? '💾 Update Preset' : '✅ Create Preset'}
                </button>
              </div>
            </form>

            {/* Area picker popup */}
            {areaPicker && (
              <div ref={pickerRef} className="abpp__area-picker"
                style={{ left: areaPicker.x, top: areaPicker.y }}>
                <div className="abpp__area-picker-title">Add to which area?</div>
                {AREAS.map(area => {
                  const col = AREA_COLORS[area.id];
                  return (
                    <button key={area.id} type="button"
                      className="abpp__area-picker-btn"
                      style={{ background: col.bg, color: col.text, borderColor: col.border }}
                      onClick={() => handleAreaPick(area)}>
                      {area.icon} {area.name}
                    </button>
                  );
                })}
                <button type="button" className="abpp__area-picker-btn abpp__area-picker-btn--cancel"
                  onClick={() => setAreaPicker(null)}>✕ Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small selected-item row component ─────────────────────────────────────────
function SelItem({ prod, areas, onRemove, onQty, onArea }) {
  const imgSrc = prod.images?.[0]
    ? (prod.images[0].startsWith('http') ? prod.images[0] : `https://dumy-2-mli2.onrender.com${prod.images[0]}`)
    : null;
  return (
    <div className="abpp__sel-item">
      {imgSrc ? <img src={imgSrc} alt="" className="abpp__sel-thumb" /> : <div className="abpp__sel-no-img">📦</div>}
      <div className="abpp__sel-info">
        <span className="abpp__sel-name">{prod.productName}</span>
        <span className="abpp__sel-co">{prod.companyName}</span>
      </div>
      <select className="abpp__sel-area-select" value={prod.areaId || ''}
        onChange={e => onArea(e.target.value)} onClick={e => e.stopPropagation()}>
        <option value="">— Area —</option>
        {areas.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
      </select>
      <label className="abpp__qty-label">
        Qty
        <input type="number" min={1} value={prod.quantity}
          onChange={e => onQty(+e.target.value)}
          className="abpp__sel-qty" onClick={e => e.stopPropagation()} />
      </label>
      <button type="button" className="abpp__sel-remove" onClick={onRemove}>✕</button>
    </div>
  );
}
