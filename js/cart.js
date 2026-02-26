/**
 * MARY RESTAURANTE — Cart Manager
 * Módulo responsável por toda a lógica do carrinho.
 *
 * Suporte a:
 *  - flavors como array (multi-select, ex: Trio de Ovos)
 *  - agrupamento automático de itens duplicados
 */

export class CartManager {
  constructor({ onUpdate } = {}) {
    this.items = [];
    this.onUpdate = onUpdate || (() => {});
    this._nextId = 1;
  }

  /**
   * Adiciona item ao carrinho.
   * Se já existir item com mesmo produto + gramatura + sabor(es), apenas incrementa a quantidade.
   */
  addItem({ product, weight, flavor, quantity = 1 }) {
    // Normaliza sempre para array de sabores
    const flavors = Array.isArray(flavor) ? flavor : [flavor];
    const flavorKey = flavors.map(f => f.id).sort().join(',');

    // Procura item duplicado (mesmo produto + gramatura + sabores)
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
      id: this._nextId++,
      product,
      weight,
      flavors,
      _flavorKey: flavorKey,
      quantity,
      unitPrice: weight.price,
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

  _notify() {
    this.onUpdate(this);
  }
}

export function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
