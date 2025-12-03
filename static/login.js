/* ======================
         CONFIG LOGIN
      ====================== */
const PASSWORD = "1234"; // 🔒 cambia la clave aquí
const STORAGE_KEY = "rembg_auth";

const loginBox = document.getElementById("loginBox");
const app = document.getElementById("app");

function checkAuth() {
  const ok = localStorage.getItem(STORAGE_KEY) === "true";
  loginBox.style.display = ok ? "none" : "block";
  app.style.display = ok ? "block" : "none";
}

function login() {
  const pass = document.getElementById("passwordInput").value;
  if (pass === PASSWORD) {
    localStorage.setItem(STORAGE_KEY, "true");
    checkAuth();
  } else {
    document.getElementById("loginError").textContent = "Password incorrecto";
  }
}

function logout() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

checkAuth();
