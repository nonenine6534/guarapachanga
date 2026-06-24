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
let pendingVerification = null;

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
        <div class="field"><label>Tel&eacute;fono</label><input type="tel" id="regPhone" placeholder="+53 5 123 4567"></div>
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
    if (found.verified === false) { error.textContent = "Cuenta no verificada. Revisa tu correo o tel&eacute;fono."; error.style.display = "block"; return; }
    currentUser = { id: Date.now(), name: found.name, email: found.email, phone: found.phone || '', dir: found.dir || "", isAdmin: false };
    token = "local_" + Date.now(); saveUser();
    updateUserUI(); closeModal(); toast("Bienvenido, " + found.name);
}

function generateCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function sendVerificationCode(user) {
    const code = generateCode();
    pendingVerification = { user, code, expires: Date.now() + 600000 };
    localStorage.setItem("msVerify", JSON.stringify(pendingVerification));
    const maskedEmail = user.email.replace(/(.{2}).*@/, '$1***@');
    const maskedPhone = user.phone ? user.phone.replace(/(\+?\d{2})\d{3,}(\d{2})/, '$1***$2') : '';
    showVerificationForm({ code, maskedEmail, maskedPhone, phone: user.phone });
}

function showVerificationForm(info) {
    const content = document.getElementById("modalContent");
    if (!content) return;
    const waLink = info.phone
        ? `<a href="https://wa.me/${info.phone.replace(/[^0-9]/g,'')}?text=Mi%20c%C3%B3digo%20de%20verificaci%C3%B3n%20es:%20${info.code}" target="_blank" rel="noopener" class="btn-secondary" style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:8px">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Enviar por WhatsApp
        </a>`
        : '';
    content.innerHTML = `
        <button class="close-btn" onclick="closeModal();pendingVerification=null">&times;</button>
        <h2>Verifica tu cuenta</h2>
        <p style="color:var(--text-sec);font-size:0.9em;line-height:1.5;margin-bottom:16px">
            Hemos enviado un c&oacute;digo de verificaci&oacute;n a
            <strong>${info.maskedEmail}</strong>${info.maskedPhone ? ' y al tel&eacute;fono <strong>' + info.maskedPhone + '</strong>' : ''}.
        </p>
        <div style="background:#f0f9f0;border:2px dashed #27ae60;border-radius:12px;padding:16px;text-align:center;margin-bottom:20px">
            <div style="font-size:0.8em;color:#27ae60;font-weight:600;margin-bottom:4px">TU C&Oacute;DIGO DE VERIFICACI&Oacute;N</div>
            <div style="font-size:2em;font-weight:800;color:#2c3e50;letter-spacing:8px">${info.code}</div>
        </div>
        <div class="field">
            <label>Ingresa el c&oacute;digo</label>
            <input type="text" id="verifyCode" placeholder="000000" maxlength="6" autofocus style="text-align:center;font-size:1.3em;letter-spacing:6px;font-weight:700" oninput="if(this.value.length>=6)handleVerification()">
        </div>
        <div class="error-msg" id="verifyError"></div>
        <button class="btn-primary" onclick="handleVerification()">Verificar cuenta</button>
        ${waLink}
        <div class="switch-link" style="margin-top:12px">
            <a onclick="showRegisterForm();pendingVerification=null" style="font-size:0.85em">Volver al registro</a>
        </div>
    `;
    setTimeout(() => document.getElementById("verifyCode")?.focus(), 100);
}

function handleVerification() {
    const input = document.getElementById("verifyCode");
    const error = document.getElementById("verifyError");
    if (!input || !error) return;
    const code = input.value.trim();
    if (!pendingVerification || Date.now() > pendingVerification.expires) {
        error.textContent = "El c&oacute;digo ha expirado. Reg&iacute;strate de nuevo.";
        error.style.display = "block";
        return;
    }
    if (code !== pendingVerification.code) {
        error.textContent = "C&oacute;digo incorrecto. Intenta de nuevo.";
        error.style.display = "block";
        return;
    }
    const u = pendingVerification.user;
    const users = JSON.parse(localStorage.getItem("msUsers")) || [];
    users.push({ name: u.name, email: u.email, phone: u.phone || '', pass: u.pass, dir: u.dir || '', verified: true });
    localStorage.setItem("msUsers", JSON.stringify(users));
    currentUser = { id: Date.now(), name: u.name, email: u.email, phone: u.phone, dir: u.dir || '', isAdmin: false };
    token = "local_" + Date.now(); saveUser();
    pendingVerification = null;
    localStorage.removeItem("msVerify");
    updateUserUI(); closeModal(); toast("Cuenta verificada. &iexcl;Bienvenido, " + u.name + "!");
}

function handleRegister() {
    const name = document.getElementById("regName")?.value.trim();
    const email = document.getElementById("regEmail")?.value.trim();
    const phone = document.getElementById("regPhone")?.value.trim() || "";
    const pass = document.getElementById("regPass")?.value.trim();
    const dir = document.getElementById("regDir")?.value.trim() || "";
    const error = document.getElementById("regError");
    if (!error) return;
    if (!name || !email || !pass) { error.textContent = "Completa todos los campos"; error.style.display = "block"; return; }
    if (pass.length < 4) { error.textContent = "M&iacute;nimo 4 caracteres"; error.style.display = "block"; return; }
    const users = JSON.parse(localStorage.getItem("msUsers")) || [];
    if (users.find(u => u.email === email)) { error.textContent = "El correo ya est&aacute; registrado"; error.style.display = "block"; return; }
    const user = { name, email, phone, pass, dir };
    sendVerificationCode(user);
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
