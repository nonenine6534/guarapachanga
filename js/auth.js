// ======================== AUTH ========================

const API = window.location.port === '3000' ? '' : 'http://localhost:3000';
const ADMIN_EMAIL = 'logisticagua@cuba.com';
const ADMIN_PASS = 'guarapachanga5984';
const ADMIN_NAME = 'Administrador';

function toast(msg) {
    const el = document.getElementById("toast");
    if (el) { el.innerHTML = msg; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 2500); return; }
    const t = document.createElement("div");
    t.style.cssText = "position:fixed;bottom:24px;right:24px;background:#2c3e50;color:#fff;padding:14px 24px;border-radius:12px;font-size:0.9em;z-index:999;box-shadow:0 6px 24px rgba(0,0,0,0.2);opacity:0;transition:opacity 0.35s";
    t.innerHTML = msg; t.className = "toast";
    document.body.appendChild(t);
    requestAnimationFrame(() => t.style.opacity = "1");
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 400); }, 2500);
}

let currentUser = JSON.parse(localStorage.getItem("msUser")) || null;
let token = localStorage.getItem("msToken") || null;

function saveUser() {
    localStorage.setItem("msUser", JSON.stringify(currentUser));
    if (token) localStorage.setItem("msToken", token);
    else localStorage.removeItem("msToken");
}
function clearAuth() {
    currentUser = null; token = null;
    localStorage.removeItem("msUser"); localStorage.removeItem("msToken");
}

function getToken() { return token; }

function updateUserUI() {
    const btn = document.getElementById("loginBtn");
    if (!btn) return;
    if (currentUser) {
        const name = currentUser.name || currentUser.email;
        btn.innerHTML = `<span class="user-display">${name}</span> <span style="font-size:0.6em">&#9660;</span>`;
        btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggleUserMenu(); };
        renderUserMenu();
    } else {
        btn.innerHTML = '&#128100; <span class="user-display">Mi Cuenta</span>';
        btn.onclick = (e) => { e.preventDefault(); openModal('login'); };
        removeUserMenu();
    }
}

function renderUserMenu() {
    let menu = document.getElementById("userMenu");
    if (!menu) {
        menu = document.createElement("div");
        menu.id = "userMenu";
        document.querySelector(".header-actions")?.appendChild(menu);
    }
    menu.innerHTML = `
        <div style="padding:12px 16px;border-bottom:1px solid #eee;font-size:0.85em">
            <div style="font-weight:700;color:#333">${currentUser?.name || ''}</div>
            <div style="color:#888;font-size:0.85em">${currentUser?.email || ''}</div>
        </div>
        <a href="cuenta.html">&#128100; Mi Perfil</a>

        ${currentUser?.isAdmin ? '<a href="inventario.html">&#128202; Inventario</a>' : ''}
        <div style="border-top:1px solid #eee;margin:4px 0"></div>
        <button onclick="logout()" style="color:#e74c3c">&#128682; Cerrar Sesi&oacute;n</button>
    `;
    menu.classList.add("open");
}

function toggleUserMenu() {
    const menu = document.getElementById("userMenu");
    if (!menu) return;
    menu.classList.toggle("open");
}

function removeUserMenu() {
    const menu = document.getElementById("userMenu");
    if (menu) menu.classList.remove("open");
}

document.addEventListener("click", (e) => {
    if (!e.target.closest("#userMenu") && !e.target.closest("#loginBtn")) {
        removeUserMenu();
    }
});

// ---- Modal ----
function openModal(type) {
    const overlay = document.getElementById("modalOverlay");
    if (!overlay) return;
    overlay.classList.add("open");
    if (type === "login") showLoginForm();
    else if (type === "register") showRegisterForm();
}
function closeModal() {
    const overlay = document.getElementById("modalOverlay");
    if (overlay) overlay.classList.remove("open");
}
document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("modalOverlay");
    if (overlay) overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
});

function showLoginForm() {
    const content = document.getElementById("modalContent");
    if (!content) return;
    content.innerHTML = `
        <button class="close-btn" onclick="closeModal()">&times;</button>
        <h2>Iniciar Sesi&oacute;n</h2>
        <div class="field"><label>Correo electr&oacute;nico</label><input type="email" id="loginEmail" placeholder="tu@correo.com" autofocus></div>
        <div class="field"><label>Contrase&ntilde;a</label><input type="password" id="loginPass" placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"></div>
        <div class="error-msg" id="loginError"></div>
        <button class="btn-primary" onclick="handleLogin()">Ingresar</button>
        <button class="btn-secondary" onclick="showRegisterForm()">Crear cuenta nueva</button>
    `;
    setTimeout(() => document.getElementById("loginEmail")?.focus(), 100);
}
function showRegisterForm() {
    const content = document.getElementById("modalContent");
    if (!content) return;
    content.innerHTML = `
        <button class="close-btn" onclick="closeModal()">&times;</button>
        <h2>Crear Cuenta</h2>
        <div class="field"><label>Nombre completo</label><input type="text" id="regName" placeholder="Tu nombre"></div>
        <div class="field"><label>Correo electr&oacute;nico</label><input type="email" id="regEmail" placeholder="tu@correo.com"></div>
        <div class="field"><label>Contrase&ntilde;a</label><input type="password" id="regPass" placeholder="M&iacute;nimo 4 caracteres"></div>
        <div class="field"><label>Direcci&oacute;n</label><input type="text" id="regDir" placeholder="Tu direcci&oacute;n"></div>
        <div class="error-msg" id="regError"></div>
        <button class="btn-primary" onclick="handleRegister()">Crear cuenta</button>
        <div class="switch-link">¿Ya tienes cuenta? <a onclick="showLoginForm()">Inicia sesi&oacute;n</a></div>
    `;
    setTimeout(() => document.getElementById("regName")?.focus(), 100);
}

function handleLogin() {
    const email = document.getElementById("loginEmail")?.value.trim();
    const pass = document.getElementById("loginPass")?.value.trim();
    const error = document.getElementById("loginError");
    if (!error) return;
    if (!email || !pass) { error.textContent = "Completa todos los campos"; error.style.display = "block"; return; }

    // Admin hardcodeado
    if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
        currentUser = { id: 0, name: ADMIN_NAME, email: ADMIN_EMAIL, dir: '', isAdmin: true };
        token = "admin_" + Date.now(); saveUser();
        updateUserUI(); closeModal(); toast("Bienvenido, " + ADMIN_NAME);
        return;
    }
    const users = JSON.parse(localStorage.getItem("msUsers")) || [];
    const found = users.find(u => u.email === email && u.pass === pass);
    if (!found) { error.textContent = "Correo o contrase&ntilde;a incorrectos"; error.style.display = "block"; return; }
    currentUser = { id: Date.now(), name: found.name, email: found.email, dir: found.dir || "", isAdmin: false };
    token = "local_" + Date.now(); saveUser();
    updateUserUI(); closeModal(); toast("Bienvenido, " + found.name);
}

function handleRegister() {
    const name = document.getElementById("regName")?.value.trim();
    const email = document.getElementById("regEmail")?.value.trim();
    const pass = document.getElementById("regPass")?.value.trim();
    const dir = document.getElementById("regDir")?.value.trim() || "";
    const error = document.getElementById("regError");
    if (!error) return;
    if (!name || !email || !pass) { error.textContent = "Completa todos los campos"; error.style.display = "block"; return; }
    if (pass.length < 4) { error.textContent = "M&iacute;nimo 4 caracteres"; error.style.display = "block"; return; }
    const users = JSON.parse(localStorage.getItem("msUsers")) || [];
    if (users.find(u => u.email === email)) { error.textContent = "El correo ya est&aacute; registrado"; error.style.display = "block"; return; }
    users.push({ name, email, pass, dir });
    localStorage.setItem("msUsers", JSON.stringify(users));
    currentUser = { id: Date.now(), name, email, dir };
    token = "local_" + Date.now(); saveUser();
    updateUserUI(); closeModal(); toast("Cuenta creada. &iexcl;Bienvenido, " + name + "!");
}

function logout() {
    clearAuth(); updateUserUI(); toast("Sesi&oacute;n cerrada");
}

function updateBadge() {}
function requireAuth() {
    if (!currentUser) { openModal("login"); return false; }
    return true;
}

// ======================== DARK MODE ========================
function getTheme() {
    return localStorage.getItem('msTheme') || 'light';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('msTheme', theme);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const current = getTheme();
    setTheme(current === 'dark' ? 'light' : 'dark');
}

function initTheme() {
    setTheme(getTheme());
}
document.addEventListener('DOMContentLoaded', initTheme);
