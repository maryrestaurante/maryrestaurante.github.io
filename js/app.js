/**
 * MARY RESTAURANTE — App Principal
 */

import { CartManager, formatCurrency } from './cart.js';

const WHATSAPP_NUMBER = '5584991087606';
const DATA_URL = 'data/products.json';

let allProducts   = [];
let allCategories = [];
let activeCategory = null;
let modalProduct   = null;
let modalSelection = { weight: null, flavors: [], quantity: 1 };

// ── Hero refs ──────────────────────────────────────────────────
const heroTag      = document.getElementById('heroTag');
const heroTitle    = document.getElementById('heroTitle');
const heroSubtitle = document.getElementById('heroSubtitle');
const heroCta      = document.getElementById('heroCta');

function updateHero(cat) {
  const h = cat.hero;
  if (!h) return;
  const heroEl = document.querySelector('.site-hero');
  heroEl.classList.add('hero-transitioning');
  setTimeout(() => {
    heroTag.textContent = h.tag;
    heroTitle.innerHTML = h.title
      .split('\n')
      .map((line, i) => i === 0 ? line : '<br>' + line)
      .join('');
    heroSubtitle.textContent = h.subtitle;
    heroCta.innerHTML = h.ctaLabel;
    heroEl.classList.remove('hero-transitioning');
  }, 180);
}

const $ = id => document.getElementById(id);

const productGrid    = $('productGrid');
const categoryNav    = $('categoryNav');
const sectionTitle   = $('sectionTitle');
const sectionDesc    = $('sectionDesc');
const sectionLabel   = $('sectionLabel');

const modalOverlay   = $('modalOverlay');
const modalImg       = $('modalImg');
const modalImgFb     = $('modalImgFallback');
const modalBadge     = $('modalBadge');
const modalName      = $('modalName');
const modalDesc      = $('modalDesc');
const modalNote      = $('modalNote');
const modalWeights   = $('modalWeights');
const modalFlavors   = $('modalFlavors');
const modalQtyValue  = $('modalQtyValue');
const modalTotal     = $('modalTotalPrice');
const btnAddCart     = $('btnAddCart');
const flavorGroupLabel = $('flavorGroupLabel');

const cartOverlay    = $('cartOverlay');
const cartDrawer     = $('cartDrawer');
const cartItems      = $('cartItems');
const cartBadge      = $('cartBadge');
const cartCountBadge = $('cartCountBadge');
const cartTotalVal   = $('cartTotalValue');
const btnWhatsapp    = $('btnWhatsapp');
const btnClearCart   = $('btnClearCart');

// Cart — instanciado após todas as refs do DOM estarem prontas
const cart = new CartManager({ onUpdate: renderCart });
// Renderiza imediatamente com o que foi restaurado do localStorage
renderCart(cart);

// ── Bootstrap ──────────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error('Falha ao carregar produtos');
    const data = await res.json();
    allCategories = data.categories;
    allProducts   = data.products;
    renderCategoryNav();
    selectCategory(allCategories.find(c => c.default) || allCategories.find(c => c.active) || allCategories[0]);
  } catch (err) {
    productGrid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#6b4c2a;">
        <div style="font-size:3rem;margin-bottom:12px">⚠️</div>
        <p>Não foi possível carregar os produtos. Tente novamente.</p>
        <small>${err.message}</small>
      </div>`;
  }
}

// ── Category Nav ───────────────────────────────────────────────
function renderCategoryNav() {
  categoryNav.innerHTML = allCategories.map(cat => `
    <button class="cat-tab${activeCategory?.id === cat.id ? ' active' : ''}" data-cat="${cat.id}">
      <span>${cat.icon}</span>${cat.label}
    </button>
  `).join('');

  categoryNav.querySelectorAll('.cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = allCategories.find(c => c.id === btn.dataset.cat);
      if (cat) selectCategory(cat);
    });
  });
}

function selectCategory(cat) {
  activeCategory = cat;
  updateHero(cat);
  document.querySelectorAll('.cat-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === cat.id);
  });
  sectionLabel.textContent = cat.icon + ' ' + cat.label;
  sectionTitle.textContent = 'Ovos de Páscoa Artesanais';
  sectionDesc.textContent  = cat.description;
  renderProducts(allProducts.filter(p => p.category === cat.id));
}

// ── Products ────────────────────────────────────────────────────
function renderProducts(products) {
  if (!products.length) {
    productGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:#a0826a;">Nenhum produto encontrado nesta categoria.</div>`;
    return;
  }

  productGrid.innerHTML = products.map((p, i) => {
    const minPrice = Math.min(...p.weights.map(w => w.price));
    const hasMultiple = p.weights.length > 1;
    const flavorsPreview = p.flavors.slice(0, 4).map(f => `<span class="flavor-chip">${f.label}</span>`).join('');
    const moreCount = p.flavors.length - 4;

    return `
    <article class="product-card" style="animation-delay:${i * .05}s">
      <div class="card-img-wrap" data-product-id="${p.id}" role="button" tabindex="0" aria-label="Ver detalhes de ${p.name}">
        <img class="card-img" src="${p.image}" alt="${p.name}" loading="${i < 4 ? 'eager' : 'lazy'}"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
        <div class="card-img-fallback" style="display:none">${p.imageFallback}</div>
        <div class="card-img-overlay"><span class="overlay-hint">Ver detalhes ✦</span></div>
        ${p.badge ? `<span class="card-badge" style="background:${p.badgeColor}">${p.badge}</span>` : ''}
      </div>
      <div class="card-body">
        <h2 class="card-name">${p.name}</h2>
        <p class="card-desc">${p.description}</p>
        <div class="card-flavors-hint">
          ${flavorsPreview}
          ${moreCount > 0 ? `<span class="flavor-chip">+${moreCount}</span>` : ''}
        </div>
        <div class="card-price-row">
          <div>
            ${hasMultiple ? `<span class="card-price-from">A partir de</span><br>` : ''}
            <span class="card-price">${formatCurrency(minPrice)}</span>
          </div>
        </div>
        <button class="btn-add-card" data-product-id="${p.id}">
          <span>🛒</span> Adicionar ao Carrinho
        </button>
      </div>
    </article>`;
  }).join('');

  productGrid.querySelectorAll('[data-product-id]').forEach(el => {
    el.addEventListener('click', () => openModal(el.dataset.productId));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openModal(el.dataset.productId);
    });
  });
}

// ── Modal ───────────────────────────────────────────────────────
function openModal(productId) {
  modalProduct = allProducts.find(p => p.id === productId);
  if (!modalProduct) return;

  const isMulti = !!modalProduct.multiSelect;

  modalSelection = {
    weight: modalProduct.weights[0],
    flavors: isMulti ? [] : [modalProduct.flavors[0]],
    quantity: 1,
  };

  // Usa image2 (retrato, para coluna lateral no desktop) se disponível; senão usa image
  const modalImgSrc = modalProduct.image2 || modalProduct.image;
  modalImg.src = modalImgSrc;
  modalImg.alt = modalProduct.name;
  modalImg.style.display = 'block';
  modalImgFb.style.display = 'none';
  modalImg.onerror = () => {
    // Se image2 falhou e era diferente de image, tenta o fallback para image
    if (modalProduct.image2 && modalImg.src !== modalProduct.image) {
      modalImg.src = modalProduct.image;
      return;
    }
    modalImg.style.display = 'none';
    modalImgFb.style.display = 'flex';
    modalImgFb.textContent = modalProduct.imageFallback;
  };

  if (modalProduct.badge) {
    modalBadge.textContent = modalProduct.badge;
    modalBadge.style.background = modalProduct.badgeColor;
    modalBadge.style.display = 'inline-block';
  } else {
    modalBadge.style.display = 'none';
  }

  modalName.textContent = modalProduct.name;
  modalDesc.textContent = modalProduct.description;

  if (modalProduct.note) {
    modalNote.textContent = '💡 ' + modalProduct.note;
    modalNote.style.display = 'block';
  } else {
    modalNote.style.display = 'none';
  }

  // Atualiza label do grupo de sabores
  if (isMulti) {
    flavorGroupLabel.textContent = `🍫 Sabores (escolha ${modalProduct.multiSelect})`;
  } else {
    flavorGroupLabel.textContent = '🍫 Sabor';
  }

  renderModalWeights();
  renderModalFlavors();
  updateModalTotal();

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  modalOverlay.querySelector('.modal-box').scrollTop = 0;
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  modalProduct = null;
}

function renderModalWeights() {
  modalWeights.innerHTML = modalProduct.weights.map(w => `
    <button class="weight-btn${w.id === modalSelection.weight?.id ? ' selected' : ''}" data-weight-id="${w.id}">
      <span class="w-label">${w.label}</span>
      <span class="w-price">${formatCurrency(w.price)}</span>
    </button>
  `).join('');

  modalWeights.querySelectorAll('.weight-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modalSelection.weight = modalProduct.weights.find(w => w.id === btn.dataset.weightId);
      renderModalWeights();
      updateModalTotal();
    });
  });
}

function renderModalFlavors() {
  const isMulti = !!modalProduct.multiSelect;
  const max = modalProduct.multiSelect || 1;
  const selectedIds = new Set(modalSelection.flavors.map(f => f.id));

  modalFlavors.innerHTML = modalProduct.flavors.map(f => {
    const sel = selectedIds.has(f.id);
    // Se atingiu o max e este não está selecionado, desativa o botão
    const disabled = !sel && isMulti && modalSelection.flavors.length >= max;
    return `
      <button
        class="flavor-btn${sel ? ' selected' : ''}${disabled ? ' disabled' : ''}"
        data-flavor-id="${f.id}"
        ${disabled ? 'disabled' : ''}
        aria-pressed="${sel}"
      >${f.label}</button>`;
  }).join('');

  modalFlavors.querySelectorAll('.flavor-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const flavor = modalProduct.flavors.find(f => f.id === btn.dataset.flavorId);
      if (isMulti) {
        // Toggle: adiciona ou remove do array
        const idx = modalSelection.flavors.findIndex(f => f.id === flavor.id);
        if (idx >= 0) {
          modalSelection.flavors.splice(idx, 1);
        } else if (modalSelection.flavors.length < max) {
          modalSelection.flavors.push(flavor);
        }
      } else {
        modalSelection.flavors = [flavor];
      }
      renderModalFlavors();
      updateModalTotal();
    });
  });
}

function updateModalTotal() {
  const price = (modalSelection.weight?.price || 0) * modalSelection.quantity;
  modalTotal.textContent = formatCurrency(price);
  modalQtyValue.textContent = modalSelection.quantity;

  const isMulti = !!modalProduct?.multiSelect;
  const flavorOk = isMulti
    ? modalSelection.flavors.length === modalProduct.multiSelect
    : modalSelection.flavors.length === 1;

  btnAddCart.disabled = !(modalSelection.weight && flavorOk);

  // Feedback visual no botão quando multi-select
  if (isMulti) {
    const count = modalSelection.flavors.length;
    const max   = modalProduct.multiSelect;
    btnAddCart.textContent = count < max
      ? `Selecione mais ${max - count} sabor${max - count > 1 ? 'es' : ''}`
      : '🛒 Adicionar ao Carrinho';
  } else {
    btnAddCart.innerHTML = '<span>🛒</span> Adicionar ao Carrinho';
  }
}

// Qty controls
$('btnQtyMinus').addEventListener('click', () => {
  if (modalSelection.quantity > 1) { modalSelection.quantity--; updateModalTotal(); }
});
$('btnQtyPlus').addEventListener('click', () => {
  if (modalSelection.quantity < 99) { modalSelection.quantity++; updateModalTotal(); }
});

// Add to cart
btnAddCart.addEventListener('click', () => {
  if (!modalProduct || !modalSelection.weight || !modalSelection.flavors.length) return;

  const _addedProduct = modalProduct; // capture before closeModal clears it
  cart.addItem({
    product:  modalProduct,
    weight:   modalSelection.weight,
    flavor:   modalSelection.flavors,
    quantity: modalSelection.quantity,
  });

  closeModal();
  showCartConfirm(_addedProduct);
});

// Close modal
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
$('btnCloseModal').addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (modalOverlay.classList.contains('open')) closeModal();
    else if (cartDrawer.classList.contains('open')) closeCartDrawer();
  }
});

// ── Cart ─────────────────────────────────────────────────────────
function openCart() {
  cartOverlay.classList.add('open');
  cartDrawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  cartOverlay.classList.remove('open');
  cartDrawer.classList.remove('open');
  document.body.style.overflow = '';
}

cartOverlay.addEventListener('click', closeCartDrawer);
$('btnOpenCart').addEventListener('click', openCart);
$('btnCloseCart').addEventListener('click', closeCartDrawer);

// Limpar carrinho
btnClearCart.addEventListener('click', () => {
  if (cart.totalQuantity === 0) return;
  if (!confirm('Deseja remover todos os itens do carrinho?')) return;
  cart.clear();
  showToast('🗑️ Carrinho limpo');
});

function renderCart(c) {
  const count = c.totalQuantity;
  cartBadge.textContent = count;
  cartBadge.classList.toggle('visible', count > 0);
  cartCountBadge.textContent = `${count} ${count === 1 ? 'item' : 'itens'}`;
  cartTotalVal.textContent = c.totalFormatted;
  btnWhatsapp.disabled = count === 0;

  // Mostrar/ocultar botão Limpar
  btnClearCart.style.display = c.items.length > 0 ? 'inline-flex' : 'none';

  if (c.items.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <h3>Seu carrinho está vazio</h3>
        <p>Escolha seus ovos de Páscoa favoritos e adicione aqui!</p>
      </div>`;
    return;
  }

  cartItems.innerHTML = c.items.map(item => {
    const flavorTags = item.flavors.map(f =>
      `<span>🍫 ${f.label}</span>`
    ).join('');

    const imgHtml = item.product.image
      ? `<img src="${item.product.image}" alt="${item.product.name}"
            onerror="this.style.display='none';this.parentElement.textContent='${item.product.imageFallback}'">`
      : item.product.imageFallback;

    return `
    <div class="cart-item" data-item-id="${item.id}">
      <div class="cart-item-top">
        <div class="cart-item-emoji">${imgHtml}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.product.name}</div>
          <div class="cart-item-details">
            <span>⚖️ ${item.weight.label}</span>
            ${flavorTags}
          </div>
        </div>
        <button class="btn-remove-item" data-remove="${item.id}" aria-label="Remover item">✕</button>
      </div>
      <div class="cart-item-bottom">
        <div class="cart-item-price">${formatCurrency(item.totalPrice)}</div>
        <div class="qty-control">
          <button class="qty-btn" data-cart-minus="${item.id}">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" data-cart-plus="${item.id}">+</button>
        </div>
      </div>
    </div>`;
  }).join('');

  cartItems.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      cart.removeItem(Number(btn.dataset.remove));
      showToast('🗑️ Item removido');
    });
  });

  cartItems.querySelectorAll('[data-cart-minus]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.cartMinus);
      const item = cart.getItem(id);
      if (!item) return;
      if (item.quantity <= 1) { cart.removeItem(id); showToast('🗑️ Item removido'); }
      else cart.updateItem(id, { quantity: item.quantity - 1 });
    });
  });

  cartItems.querySelectorAll('[data-cart-plus]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.cartPlus);
      const item = cart.getItem(id);
      if (!item) return;
      cart.updateItem(id, { quantity: item.quantity + 1 });
    });
  });
}

// ── WhatsApp ──────────────────────────────────────────────────
btnWhatsapp.addEventListener('click', () => {
  if (cart.totalQuantity === 0) return;
  const msg = cart.buildWhatsappMessage();
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
});

// ── Toast ────────────────────────────────────────────────────
function showToast(message, duration = 3000) {
  const container = $('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fadeout');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

// ── Hero CTA ─────────────────────────────────────────────────
document.getElementById('heroCta').addEventListener('click', () => {
  document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
});

// ── Cart Confirm Banner ──────────────────────────────────────────
const cartConfirmOverlay = document.getElementById('cartConfirmOverlay');
const ccbProgressBar     = document.getElementById('ccbProgressBar');
const ccbTitle           = document.getElementById('ccbTitle');
const ccbSubtitle        = document.getElementById('ccbSubtitle');
const ccbIcon            = document.getElementById('ccbIcon');
const ccbContinue        = document.getElementById('ccbContinue');
const ccbCheckout        = document.getElementById('ccbCheckout');

let _ccbTimer   = null;
const CCB_DURATION = 6000; // ms

function showCartConfirm(product) {
  // Clear any running timer
  clearTimeout(_ccbTimer);
  ccbProgressBar.classList.remove('running');
  // Force reflow to restart animation
  void ccbProgressBar.offsetWidth;

  // Populate
  ccbTitle.textContent = product.name + ' adicionado!';
  ccbSubtitle.textContent = 'Deseja finalizar seu pedido?';

  // Icon: try product image, fallback to emoji
  if (product.image) {
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    img.onerror = () => { ccbIcon.innerHTML = ''; ccbIcon.textContent = product.imageFallback; };
    ccbIcon.innerHTML = '';
    ccbIcon.appendChild(img);
  } else {
    ccbIcon.innerHTML = '';
    ccbIcon.textContent = product.imageFallback;
  }

  // Show
  cartConfirmOverlay.classList.add('open');

  // Start progress bar
  ccbProgressBar.style.transition = 'none';
  ccbProgressBar.style.transform  = 'scaleX(1)';
  void ccbProgressBar.offsetWidth;
  ccbProgressBar.style.transition = `transform ${CCB_DURATION}ms linear`;
  ccbProgressBar.style.transform  = 'scaleX(0)';

  // Auto-dismiss
  _ccbTimer = setTimeout(hideCartConfirm, CCB_DURATION);
}

function hideCartConfirm() {
  clearTimeout(_ccbTimer);
  cartConfirmOverlay.classList.remove('open');
}

ccbContinue.addEventListener('click', hideCartConfirm);

ccbCheckout.addEventListener('click', () => {
  hideCartConfirm();
  openCart();
});

// Dismiss if user clicks the overlay background
cartConfirmOverlay.addEventListener('click', e => {
  if (e.target === cartConfirmOverlay) hideCartConfirm();
});

init();
