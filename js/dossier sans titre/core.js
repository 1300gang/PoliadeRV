
// core.js
// ================================
// CORE APP & GLOBAL STATE
// ================================

export const gameState = {
  hasCompletedTutorial: false,
  currentCityIndex: 0,
  progress: {},
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
  localStorage.setItem('myGameSave', JSON.stringify(gameState));
}

export function loadGame() {
  const saved = localStorage.getItem('myGameSave');
  if (saved) {
    Object.assign(gameState, JSON.parse(saved));
  }
}

export function loadCity(index, gameData) {
  const total = gameData.cities.length;
  gameState.currentCityIndex = (index + total) % total;
  const city = gameData.cities[gameState.currentCityIndex];
  initCityProgress(city.id);
  saveGame();
  return city;
}
