'use strict';

(() => {
  // Preços em centavos evitam erros de arredondamento no cálculo dos totais.
  const products = [
    { id: 'teclado', name: 'Teclado Orbit', category: 'perifericos', price: 24990, art: 'keyboard', symbol: '▤', detail: 'Teclado compacto · produto fictício' },
    { id: 'mouse', name: 'Mouse Vector', category: 'perifericos', price: 12990, art: 'mouse', symbol: '◉', detail: 'Mouse sem fio · produto fictício' },
    { id: 'headphone', name: 'Headphone Pulse', category: 'audio', price: 31990, art: 'headphone', symbol: '∩', detail: 'Headphone estéreo · produto fictício' },
    { id: 'caixa', name: 'Caixa de som Echo', category: 'audio', price: 18990, art: 'speaker', symbol: '▣', detail: 'Caixa compacta · produto fictício' },
    { id: 'hub', name: 'Hub Connect', category: 'acessorios', price: 15990, art: 'hub', symbol: '⊞', detail: 'Hub de conexões · produto fictício' },
    { id: 'suporte', name: 'Suporte Elevate', category: 'acessorios', price: 9990, art: 'stand', symbol: '⌁', detail: 'Suporte de mesa · produto fictício' }
  ];
  const catalog = new Map(products.map((product) => [product.id, product]));
  const storageKey = 'dsaol-demo-cart-v1';
  const formatMoney = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const notice = document.querySelector('#storage-notice');
  const feedback = document.querySelector('#cart-feedback');
  const productGrid = document.querySelector('#products');
  const cartList = document.querySelector('#cart-items');
  const search = document.querySelector('#search');
  const category = document.querySelector('#category');
  const checkout = document.querySelector('#checkout');

  function showStorageNotice(message) {
    notice.hidden = false;
    notice.textContent = message;
  }

  function readCart() {
    const result = new Map();
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return result;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length > products.length) throw new Error('Formato inválido');
      let invalid = false;
      parsed.forEach((entry) => {
        if (!entry || !catalog.has(entry.id) || !Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 99 || result.has(entry.id)) {
          invalid = true;
          return;
        }
        result.set(entry.id, entry.quantity);
      });
      if (invalid) showStorageNotice('Itens inválidos do carrinho salvo foram ignorados. Você pode continuar a demonstração.');
      return result;
    } catch {
      showStorageNotice('Não foi possível recuperar o carrinho salvo. A demonstração continua com um carrinho vazio.');
      return result;
    }
  }

  const cart = readCart();

  function saveCart() {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...cart].map(([id, quantity]) => ({ id, quantity }))));
    } catch {
      showStorageNotice('Armazenamento local indisponível. Seu carrinho funciona nesta página, mas pode não ser mantido ao sair.');
    }
  }

  function normalize(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function renderProducts() {
    const query = normalize(search.value.trim());
    const visible = products.filter((product) =>
      (category.value === 'all' || product.category === category.value) && normalize(product.name).includes(query)
    );
    // O HTML usa apenas o catálogo fixo acima; busca e armazenamento nunca viram HTML.
    productGrid.innerHTML = visible.map((product) => `
      <article class="panel product-card">
        <div class="product-art art-${product.art}" aria-hidden="true"><span>${product.symbol}</span><small>CONCEPT / ${product.id.toUpperCase()}</small></div>
        <h3>${product.name}</h3><p>${product.detail}</p><strong class="product-price">${formatMoney.format(product.price / 100)}</strong>
        <button class="button secondary" type="button" data-add="${product.id}" aria-label="Adicionar ${product.name} ao carrinho">Adicionar ao carrinho</button>
      </article>`).join('');
    document.querySelector('#result-count').textContent = `${visible.length} produto${visible.length === 1 ? '' : 's'} encontrado${visible.length === 1 ? '' : 's'}.`;
    document.querySelector('#empty-results').hidden = visible.length !== 0;
  }

  function renderCart() {
    const focusKey = document.activeElement?.dataset.focus;
    let subtotal = 0;
    let count = 0;
    cartList.innerHTML = [...cart].map(([id, quantity]) => {
      const product = catalog.get(id);
      subtotal += product.price * quantity;
      count += quantity;
      return `<li class="cart-item"><h3>${product.name}</h3><p>${formatMoney.format(product.price / 100)} / unidade</p>
        <div class="quantity-controls"><button type="button" data-action="decrease" data-id="${id}" data-focus="decrease-${id}" aria-label="Diminuir quantidade de ${product.name}" ${quantity === 1 ? 'disabled' : ''}>−</button>
        <label class="sr-only" for="quantity-${id}">Quantidade de ${product.name}</label><input id="quantity-${id}" data-quantity="${id}" data-focus="quantity-${id}" type="number" min="1" max="99" step="1" value="${quantity}">
        <button type="button" data-action="increase" data-id="${id}" data-focus="increase-${id}" aria-label="Aumentar quantidade de ${product.name}" ${quantity === 99 ? 'disabled' : ''}>+</button>
        <button class="remove-item" type="button" data-action="remove" data-id="${id}" data-focus="remove-${id}" aria-label="Remover ${product.name}">Remover</button></div>
        <strong class="line-total">${formatMoney.format(product.price * quantity / 100)}</strong></li>`;
    }).join('');
    document.querySelector('#empty-cart').hidden = cart.size > 0;
    document.querySelector('#cart-count').textContent = `(${count})`;
    document.querySelector('#subtotal').textContent = formatMoney.format(subtotal / 100);
    document.querySelector('#total').textContent = formatMoney.format(subtotal / 100);
    checkout.disabled = cart.size === 0;
    if (focusKey) {
      const target = [...cartList.querySelectorAll('[data-focus]')].find((element) => element.dataset.focus === focusKey);
      if (target && !target.disabled) target.focus({ preventScroll: true });
      else document.querySelector('#cart-heading').focus({ preventScroll: true });
    }
  }

  function updateCart(message) {
    saveCart();
    renderCart();
    feedback.textContent = message;
  }

  productGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add]');
    if (!button) return;
    const id = button.dataset.add;
    const quantity = cart.get(id) || 0;
    if (quantity >= 99) {
      feedback.textContent = 'Limite de 99 unidades por produto atingido.';
      return;
    }
    cart.set(id, quantity + 1);
    updateCart(`${catalog.get(id).name} adicionado. Quantidade: ${quantity + 1}.`);
  });

  cartList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const { id, action } = button.dataset;
    if (action === 'remove') cart.delete(id);
    else cart.set(id, Math.max(1, Math.min(99, cart.get(id) + (action === 'increase' ? 1 : -1))));
    updateCart(action === 'remove' ? `${catalog.get(id).name} removido do carrinho.` : 'Quantidade e total atualizados.');
  });

  cartList.addEventListener('change', (event) => {
    const input = event.target.closest('[data-quantity]');
    if (!input) return;
    const quantity = Number(input.value);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      input.value = cart.get(input.dataset.quantity);
      feedback.textContent = 'Informe uma quantidade inteira entre 1 e 99.';
      return;
    }
    cart.set(input.dataset.quantity, quantity);
    updateCart('Quantidade e total atualizados.');
  });

  search.addEventListener('input', renderProducts);
  category.addEventListener('change', renderProducts);
  checkout.addEventListener('click', () => {
    feedback.textContent = 'Esta é uma demonstração fictícia. Nenhum pedido foi criado, nenhum pagamento foi processado e nenhum dado pessoal foi coletado.';
  });
  renderProducts();
  renderCart();
})();
