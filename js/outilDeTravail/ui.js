
// ui.js
// Gestion UI : modales, boutons, feedback visuel

export function openModal(id) {
  document.getElementById(id)?.classList.remove("hidden");
}

export function closeModal(id) {
  document.getElementById(id)?.classList.add("hidden");
}

export function bindButton(id, callback) {
  const btn = document.getElementById(id);
  if (btn) btn.addEventListener("click", callback);
}
