/**
 * MARY RESTAURANTE — Cart Manager
 * - flavors como array (multi-select)
 * - agrupamento de itens duplicados
 * - persistência via localStorage
 */

const STORAGE_KEY = 'mary-cart-v1';

export class CartManager {
  constructor({ onUpdate } = {}) {
    this.onUpdate = onUpdate || (() => {});
    this._nextId  = 1;
    this.items    = [];
    this._loadFromStorage();
  }

  addItem({ product, weight, flavor, quantity = 1 }) {
    const flavors   = Array.isArray(flavor) ? flavor : [flavor];
    const flavorKey = flavors.map(f => f.id).sort().join(',');

    const existing = this.items.find(i =>
      i.product.id === product.id &&
      i.weight.id  === weight.id  &&
      i._flavorKey === flavorKey
    );

    if (existing) {
      existing.quantity += quantity;
      this._notify();
      return existing.id;
    }

    const item = {
      id:         this._nextId++,
      product,
      weight,
      flavors,
      _flavorKey: flavorKey,
      quantity,
      unitPrice:  weight.price,
      get totalPrice() { return this.unitPrice * this.quantity; },
    };

    this.items.push(item);
    this._notify();
    return item.id;
  }

  updateItem(id, changes) {
    const item = this.getItem(id);
    if (!item) return;
    Object.assign(item, changes);
    this._notify();
  }

  removeItem(id) {
    this.items = this.items.filter(i => i.id !== id);
    this._notify();
  }

  clear() {
    this.items = [];
    this._notify();
  }

  getItem(id) {
    return this.items.find(i => i.id === id) || null;
  }

  get totalQuantity() {
    return this.items.reduce((s, i) => s + i.quantity, 0);
  }

  get totalPrice() {
    return this.items.reduce((s, i) => s + i.totalPrice, 0);
  }

  get totalFormatted() {
    return formatCurrency(this.totalPrice);
  }

  buildWhatsappMessage() {
    if (this.items.length === 0) return '';
    const lines = ['🐣 *Pedido — Mary Restaurante*\n'];
    this.items.forEach((item, idx) => {
      const flavorList = item.flavors.map(f => f.label).join(', ');
      lines.push(`*${idx + 1}. ${item.product.name}*`);
      lines.push(`   • Gramatura: ${item.weight.label}`);
      lines.push(`   • Sabor${item.flavors.length > 1 ? 'es' : ''}: ${flavorList}`);
      lines.push(`   • Quantidade: ${item.quantity}x`);
      lines.push(`   • Subtotal: ${formatCurrency(item.totalPrice)}`);
      lines.push('');
    });
    lines.push(`*Total: ${this.totalFormatted}*`);
    lines.push('\n_⚠️ O pedido é confirmado mediante pagamento de 50% do valor._');
    return lines.join('\n');
  }

  // ── Persistência ────────────────────────────────────────────
  _saveToStorage() {
    try {
      const data = {
        nextId: this._nextId,
        items:  this.items.map(i => ({
          id:        i.id,
          product:   i.product,
          weight:    i.weight,
          flavors:   i.flavors,
          _flavorKey: i._flavorKey,
          quantity:  i.quantity,
          unitPrice: i.unitPrice,
        })),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage indisponível (modo privado rígido etc.)
      console.warn('CartManager: não foi possível salvar no localStorage', e);
    }
  }

  _loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      this._nextId = data.nextId || 1;
      this.items   = (data.items || []).map(i => ({
        ...i,
        // Redefine o getter que se perde na serialização JSON
        get totalPrice() { return this.unitPrice * this.quantity; },
      }));
    } catch (e) {
      console.warn('CartManager: não foi possível ler o localStorage', e);
    }
  }

  _notify() {
    this._saveToStorage();
    this.onUpdate(this);
  }
}

export function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
