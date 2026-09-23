const ORDER_ITEMS = [
  { name: 'Овочевий кошик', qty: 1, price: 780 },
  { name: 'Молочний набір', qty: 1, price: 320 },
];

const DELIVERY_FEE = 89;
const FREE_DELIVERY_THRESHOLD = 1000;

const PROMO_CODES = {
  SAVE10: 0.10,
  SAVE20: 0.20,
};

const PROMO_PATTERN = /^[A-Z0-9]{4,12}$/;

const NBSP = ' ';

let appliedDiscount = 0;
let lastAppliedCode = '';

function formatUAH(value) {
  const sign = value < 0 ? '-' : '';
  const amount = Math.abs(value);
  const digits = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return sign + digits + NBSP + 'грн';
}

function getSubtotal() {
  return ORDER_ITEMS.reduce((sum, item) => sum + item.qty * item.price, 0);
}

function getDelivery(subtotal) {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

function renderItems() {
  const body = document.querySelector('.items-body');
  body.innerHTML = '';
  ORDER_ITEMS.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML =
      '<td>' + item.name + '</td>' +
      '<td>' + item.qty + '</td>' +
      '<td>' + formatUAH(item.price) + '</td>';
    body.appendChild(row);
  });
}

function showDiscountRow(discount) {
  let row = document.querySelector('[data-row="discount"]');
  if (!row) {
    row = document.createElement('div');
    row.className = 'summary-row';
    row.dataset.row = 'discount';
    row.innerHTML = '<span>Знижка</span><span data-testid="summary-discount"></span>';
    const subtotalRow = document.querySelector('[data-row="subtotal"]');
    subtotalRow.insertAdjacentElement('afterend', row);
  }
  row.querySelector('[data-testid="summary-discount"]').textContent = formatUAH(-discount);
}

function applyPromo() {
  const input = document.querySelector('[data-testid="promo-input"]');
  const raw = input.value || input.dataset.lastCode;
  const code = raw.trim().toUpperCase();
  const alert = document.querySelector('[data-testid="page-alert"]');

  if (!PROMO_PATTERN.test(raw) || PROMO_CODES[code] === undefined) {
    alert.textContent = 'Промокод недійсний';
    return;
  }

  alert.textContent = '';
  lastAppliedCode = code;
  appliedDiscount = Math.round(getSubtotal() * PROMO_CODES[code]);
  showDiscountRow(appliedDiscount);
  renderSummary();
}

function renderSummary() {
  const subtotal = getSubtotal();
  const delivery = getDelivery(subtotal);
  const total = subtotal + delivery;

  document.querySelector('[data-testid="summary-subtotal"]').textContent = formatUAH(subtotal);
  document.querySelector('[data-testid="summary-delivery"]').textContent = formatUAH(delivery);
  document.querySelector('[data-testid="summary-total"]').textContent = formatUAH(total);
  document.querySelector('.delivery-note').textContent =
    delivery === 0 ? 'Безкоштовна доставка застосована' : '';
  document.querySelector('.confirmation-total').textContent = formatUAH(total);
}

function confirmOrder() {
  document.querySelector('.confirmation').hidden = false;
}

function init() {
  renderItems();
  renderSummary();
  document.querySelector('[data-testid="promo-apply"]').addEventListener('click', applyPromo);
  document.querySelector('[data-testid="confirm-order"]').addEventListener('click', confirmOrder);
}

document.addEventListener('DOMContentLoaded', init);
