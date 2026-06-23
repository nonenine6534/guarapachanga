// ======================== PRODUCT DATA ========================

function cup(usd) {
    const cached = JSON.parse(localStorage.getItem('msExchangeRate'));
    const rate = (cached && cached.USD) ? parseFloat(cached.USD) : 440;
    return Math.round(usd * rate);
}
function fmtCup(val) { return '$' + val.toLocaleString('es-CU') + ' CUP'; }

const CAT_COLORS = { 'Cervezas':'f39c12','Carnes a la Brasa':'e74c3c','Snacks & Tapas':'2ecc71','Licores':'9b59b6','Cócteles':'3498db' };
function productImg(p) {
    const c = CAT_COLORS[p.cat] || '95a5a6';
    const label = p.name.replace(/&/g,'').replace(/\s*x\s*\d+/,'').trim().substring(0,16);
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#' + c + '"/><text x="200" y="150" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-size="22" font-weight="700" font-family="sans-serif">' + label + '</text></svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

const allProducts = [
    { id: 1,  name: "Cerveza Corona x 6",         cat: "Cervezas",         price: 8.50, old: 10.00, section: "destacados", stock: 40, desc: "Cerveza Corona extra fría. Pack de 6 botellas de 355ml. Importada de México." },
    { id: 2,  name: "Cerveza Heineken x 6",       cat: "Cervezas",         price: 9.00, old: 11.00, section: "destacados", stock: 35, desc: "Heineken lager premium. Pack 6 latas de 330ml. Cerveza holandesa." },
    { id: 3,  name: "Cerveza Nacional x 6",       cat: "Cervezas",         price: 4.50, old: 5.50,  section: "destacados", stock: 60, desc: "Cerveza nacional cubana. Pack de 6 botellas de 330ml. Fresca y ligera." },
    { id: 4,  name: "Cerveza Artesanal IPA",     cat: "Cervezas",         price: 3.50, section: "destacados", stock: 25, desc: "Cerveza artesanal estilo IPA. Amarga y aromática. Botella de 500ml." },
    { id: 5,  name: "Cerveza Bucanero x 6",       cat: "Cervezas",         price: 5.00, old: 6.50,  section: "destacados", stock: 50, desc: "Bucanero cerveza cubana. Pack 6 botellas de 330ml. Sabor intenso." },
    { id: 6,  name: "Cerveza Sin Alcohol x 6",    cat: "Cervezas",         price: 4.00, section: "destacados", stock: 20, desc: "Cerveza sin alcohol. Pack 6 latas de 330ml. Ideal para conductores." },
    { id: 7,  name: "Costillas de Cerdo BBQ",     cat: "Carnes a la Brasa", price: 12.50, old: 15.00, section: "destacados", stock: 15, desc: "Costillas de cerdo ahumadas con salsa BBQ casera. Porción para 2 personas." },
    { id: 8,  name: "Pollo a la Brasa 1/2",       cat: "Carnes a la Brasa", price: 8.00, old: 10.00, section: "destacados", stock: 20, desc: "Medio pollo a la brasa con adobo secreto. Acompañado de yuca y ensalada." },
    { id: 9,  name: "Filete de Res a la Parilla", cat: "Carnes a la Brasa", price: 15.00, section: "destacados", stock: 12, desc: "Filete de res angus a la parilla. Término a elegir. Incluye papas fritas." },
    { id: 10, name: "Choripán Argentino",         cat: "Carnes a la Brasa", price: 5.50, old: 7.00,  section: "destacados", stock: 25, desc: "Chorizo parrillero en pan artesanal con chimichurri y salsa criolla." },
    { id: 11, name: "Brocheta de Camarones",      cat: "Carnes a la Brasa", price: 7.50, section: "destacados", stock: 18, desc: "Brocheta de camarones salteados con vegetales. Porción de 4 unidades." },
    { id: 12, name: "Pulpo a la Gallega",         cat: "Carnes a la Brasa", price: 11.00, section: "destacados", stock: 10, desc: "Pulpo cocido a la parilla con pimentón y aceite de oliva. Plato tradicional." },
    { id: 13, name: "Tazón de Maní Salado",       cat: "Snacks & Tapas",   price: 2.00, section: "menu", stock: 80, desc: "Maní salado tostado. Perfecto para acompañar tu cerveza." },
    { id: 14, name: "Papas Fritas con Queso",     cat: "Snacks & Tapas",   price: 4.50, old: 5.50,  section: "menu", stock: 40, desc: "Papas fritas crujientes bañadas en queso cheddar derretido y bacon." },
    { id: 15, name: "Alitas de Pollo BBQ",        cat: "Snacks & Tapas",   price: 6.00, old: 8.00,  section: "menu", stock: 30, desc: "Alitas de pollo bañadas en salsa BBQ ahumada. Porción de 8 unidades." },
    { id: 16, name: "Nachos con Guacamole",        cat: "Snacks & Tapas",   price: 5.00, section: "menu", stock: 35, desc: "Nachos crujientes con guacamole fresco, crema agria y pico de gallo." },
    { id: 17, name: "Tabla de Quesos y Embutidos", cat: "Snacks & Tapas",   price: 10.00, section: "menu", stock: 15, desc: "Selección de quesos finos y embutidos con frutas y frutos secos." },
    { id: 18, name: "Tostones con Mojo",          cat: "Snacks & Tapas",   price: 3.50, section: "menu", stock: 50, desc: "Tostones de plátano verde crujientes con mojo de ajo y limón." },
    { id: 19, name: "Ron Havana Club 7 Años",     cat: "Licores",          price: 25.00, old: 30.00, section: "destacados", stock: 20, desc: "Ron Havana Club 7 años. Botella de 750ml. Suave y añejo." },
    { id: 20, name: "Vodka Absolut 750ml",        cat: "Licores",          price: 22.00, section: "destacados", stock: 15, desc: "Vodka Absolut original. Botella de 750ml. Destilado sueco premium." },
    { id: 21, name: "Whisky Johnnie Walker Red",  cat: "Licores",          price: 30.00, old: 35.00, section: "destacados", stock: 12, desc: "Whisky escocés Johnnie Walker Red Label. Botella de 750ml." },
    { id: 22, name: "Gin Tonic Preparado",        cat: "Cócteles",         price: 6.00, section: "destacados", stock: 30, desc: "Gin tonic preparado con ginebra premium, tónica Schweppes y rodaja de limón." },
    { id: 23, name: "Mojito Cubano",              cat: "Cócteles",         price: 5.00, old: 6.50,  section: "destacados", stock: 40, desc: "Mojito cubano clásico con hierbabuena, lima y ron Havana Club." },
    { id: 24, name: "Piña Colada",                cat: "Cócteles",         price: 6.50, section: "destacados", stock: 25, desc: "Piña colada cremosa con ron, crema de coco y jugo de piña natural." },
    { id: 25, name: "Cerveza Parranda x 12",      cat: "Cervezas",         price: 15.00, old: 20.00, section: "destacados", stock: 30, desc: "Cerveza Parranda. Pack de 12 botellas. ¡La favorita de la fiesta!" },
    { id: 26, name: "Parrillada para 2",          cat: "Carnes a la Brasa", price: 24.00, old: 30.00, section: "destacados", stock: 10, desc: "Parrillada completa para 2 personas: carne, pollo, chorizo, costillas y acompañantes." },
];

const categories = ["Todos", "Cervezas", "Carnes a la Brasa", "Snacks & Tapas", "Licores", "Cócteles", "Bebidas", "Hielos & Mixers"];

// ======================== STATE ========================
let currentCategory = "Todos";

// ======================== DOM REFS ========================
const productsGrid = document.getElementById("productsGrid");
const menuGrid = document.getElementById("menuGrid");
const searchInput = document.getElementById("searchInput");

// ======================== RENDER ========================
function renderCard(p) {
    const priceCUP = cup(p.price);
    const oldCUP = p.old ? cup(p.old) : null;
    const discount = oldCUP ? Math.round((1 - priceCUP / oldCUP) * 100) : 0;
    const oldHtml = oldCUP ? `<span class="old">${fmtCup(oldCUP)}</span>` : "";
    const tagHtml = discount > 0 ? `<span class="discount-tag">-${discount}%</span>` : "";
    return `
        <div class="product-card" onclick="window.location.href='producto.html?id=${p.id}'">
            <div class="product-img-wrap">
                <img class="product-img" src="${productImg(p)}" alt="${p.name}">
                ${tagHtml}
            </div>
            <div class="product-info">
                <div class="product-cat">${p.cat}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-footer">
                    <div class="product-price">${oldHtml} ${fmtCup(priceCUP)}</div>
                </div>
            </div>
        </div>
    `;
}

function renderProducts() {
    const search = (searchInput ? searchInput.value : "").toLowerCase().trim();
    let filtered = allProducts;
    if (currentCategory !== "Todos") filtered = filtered.filter(p => p.cat === currentCategory);
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search));

    const destacados = filtered.filter(p => p.section === "destacados");
    const tapas = filtered.filter(p => p.section === "menu");

    if (productsGrid) {
        productsGrid.innerHTML = destacados.length
            ? destacados.map(p => renderCard(p)).join("")
            : '<p class="not-found">No se encontraron productos</p>';
    }
    if (menuGrid) {
        menuGrid.innerHTML = tapas.length
            ? tapas.map(p => renderCard(p)).join("")
            : '<p class="not-found">No se encontraron productos</p>';
    }
}

// ======================== CATEGORIES ========================
function setupCategories() {
    const nav = document.getElementById("categoriesNav");
    if (!nav) return;
    nav.innerHTML = categories.map(c =>
        `<button class="${c === currentCategory ? 'active' : ''}" data-cat="${c}">${c}</button>`
    ).join("");
    nav.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            currentCategory = btn.dataset.cat;
            nav.querySelectorAll("button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderProducts();
        });
    });
}

// ======================== SEARCH ========================
function filterProducts() { renderProducts(); }

// ======================== EXCHANGE RATE (El Toque) ========================
function loadExchangeRate() {
    const el = document.getElementById("exchangeRate");
    if (!el) return;

    // Try cached rate first
    const cached = JSON.parse(localStorage.getItem('msExchangeRate'));
    if (cached && Date.now() - cached.ts < 300000) {
        renderExchangeRate(el, cached);
        return;
    }

    // Fetch from backend (proxied)
    fetch(`${API}/api/exchange`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if (data && data.USD) {
                data.ts = Date.now();
                localStorage.setItem('msExchangeRate', JSON.stringify(data));
                renderExchangeRate(el, data);
            } else if (cached) {
                renderExchangeRate(el, cached);
            } else {
                el.innerHTML = '<span style="opacity:0.5">Tasa no disponible</span>';
            }
        })
        .catch(() => {
            if (cached) renderExchangeRate(el, cached);
            else el.innerHTML = '<span style="opacity:0.5">Tasa no disponible</span>';
        });
}

function renderExchangeRate(el, data) {
    const usd = data.USD ? '$' + data.USD : '--';
    const eur = data.EUR ? '$' + data.EUR : '--';
    const mlc = data.MLC ? '$' + data.MLC : '--';
    const src = data.source || 'El Toque';
    const time = data.time || '';
    el.innerHTML = `<span style="font-weight:600">USD ${usd}</span> <span style="opacity:0.5">|</span> EUR ${eur} <span style="opacity:0.5">|</span> MLC ${mlc} <span style="opacity:0.5;font-size:0.75em">(${src}${time ? ' ' + time : ''})</span>`;
}

// ======================== INIT ========================
document.addEventListener("DOMContentLoaded", () => {
    updateUserUI();
    setupCategories();
    renderProducts();
    loadExchangeRate();
    setInterval(loadExchangeRate, 300000); // refresh cada 5 min
});
