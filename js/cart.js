// ======================== CART ========================

let cart = JSON.parse(localStorage.getItem("msCart")) || [];

function saveCart() {
    localStorage.setItem("msCart", JSON.stringify(cart));
    updateBadge();
}

function updateBadge() {
    const total = cart.reduce((s, i) => s + i.qty, 0);
    const badge = document.getElementById("cartBadge");
    if (badge) badge.textContent = total;
}

function addToCart(id) {
    if (!requireAuth()) return;
    const prod = allProducts.find(p => p.id === id);
    if (!prod) return;
    const existing = cart.find(i => i.id === id);
    if (existing) { existing.qty++; }
    else { cart.push({ ...prod, qty: 1 }); }
    saveCart();
    renderProducts();
    toast(prod.name + " agregado al carrito");
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCartModal();
    renderProducts();
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCartModal();
    renderProducts();
}

function getCartTotal() {
    return cart.reduce((s, i) => s + i.price * i.qty, 0);
}
function getCartCount() {
    return cart.reduce((s, i) => s + i.qty, 0);
}

// ---- Cart Modal ----
function openCart() {
    const overlay = document.getElementById("modalOverlay");
    if (overlay) overlay.classList.add("open");
    renderCartModal();
}

function renderCartModal() {
    const content = document.getElementById("modalContent");
    if (!content) return;
    if (cart.length === 0) {
        content.innerHTML = `
            <button class="close-btn" onclick="closeModal()">&times;</button>
            <h2>Tu Carrito</h2>
            <div class="cart-empty"><div class="big">&#128722;</div><p>Tu carrito est&aacute; vac&iacute;o</p></div>
            <button class="btn-primary" onclick="closeModal()">Seguir comprando</button>
        `; return;
    }
    let html = `<button class="close-btn" onclick="closeModal()">&times;</button>
        <h2>Tu Carrito (${cart.reduce((s,i)=>s+i.qty,0)} items)</h2>`;
    cart.forEach(item => {
        const img = item.img || "";
        const imgHtml = img ? `<img class="cart-item-img" src="${img}" alt="${item.name}" loading="lazy">` : `<div class="cart-item-img" style="display:flex;align-items:center;justify-content:center;font-size:1.6em">&#128230;</div>`;
        html += `
            <div class="cart-item">
                ${imgHtml}
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">S/${(item.price * item.qty).toFixed(2)}</div>
                </div>
                <div class="cart-item-qty">
                    <button onclick="changeQty(${item.id}, -1)">&minus;</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${item.id}, 1)">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Eliminar</button>
            </div>`;
    });
    html += `<div class="cart-total">Total: S/${getCartTotal().toFixed(2)}</div>`;
    html += `<button class="btn-primary" onclick="checkout()">Proceder al pago</button>`;
    html += `<button class="btn-secondary" onclick="closeModal()">Seguir comprando</button>`;
    content.innerHTML = html;
}

function getOrderNumber() {
    return 'P' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

function sendWhatsApp(orderNum) {
    const user = currentUser;
    const lines = [];
    lines.push('🍺 *Nuevo Pedido - La Guarapachanga*');
    lines.push('📄 Pedido: *' + orderNum + '*');
    lines.push('👤 Cliente: ' + (user ? user.name : 'No especificado'));
    lines.push('📧 Email: ' + (user ? user.email : '--'));
    lines.push('📍 Dirección: ' + (user && user.dir ? user.dir : 'No especificada'));
    lines.push('');
    lines.push('*Productos:*');
    cart.forEach((item, i) => {
        lines.push((i+1) + '. ' + item.name + ' x' + item.qty + ' = S/' + (item.price * item.qty).toFixed(2));
    });
    lines.push('');
    lines.push('💰 *Total: S/' + getCartTotal().toFixed(2) + '*');
    const msg = encodeURIComponent(lines.join('\n'));
    window.open('https://wa.me/5359189261?text=' + msg, '_blank');
}

function checkout() {
    if (!requireAuth()) return;
    if (cart.length === 0) { toast("Carrito vac&iacute;o"); return; }
    const orderNum = getOrderNumber();
    const total = getCartTotal().toFixed(2);
    sendWhatsApp(orderNum);
    toast("&#10003; Pedido " + orderNum + " enviado por WhatsApp. Total: S/" + total);
    cart = [];
    saveCart();
    closeModal();
    renderProducts();
}
