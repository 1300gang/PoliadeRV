
// core.js
// Gestion de l'état global, sauvegarde, navigation et villes

export const gameState = {
  hasCompletedTutorial: false,
  currentCityIndex: 0,
  progress: {}, // progress[cityId]
  chatHistory: {},
  collectedLetters: {}
};

export function initCityProgress(cityId) {
  if (!gameState.progress[cityId]) {
    gameState.progress[cityId] = {
      vision: { found: false, solved: false },
      audio: { found: false, solved: false },
      touch: { found: false, solved: false },
      complete: false
    };
  }
}

export function saveGame() {
  localStorage.setItem("myGameSave", JSON.stringify(gameState));
}

export function loadGame() {
  const saved = localStorage.getItem("myGameSave");
  if (saved) Object.assign(gameState, JSON.parse(saved));
}

export function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

export function loadCity(index, gameData) {
  const total = gameData.cities.length;
  if (index < 0) index = total - 1;
  if (index >= total) index = 0;

  gameState.currentCityIndex = index;
  const city = gameData.cities[index];
  initCityProgress(city.id);
  saveGame();
  return city;
}
