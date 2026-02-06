
// arEngine.js
// ================================
// AUGMENTED REALITY ENGINE
// ================================

import { gameState, saveGame } from './core.js';

let activeModal = null;

export function openModal(el) {
  if (activeModal) return;
  activeModal = el;
  el.classList.remove('hidden');
}

export function closeModal(el) {
  activeModal = null;
  el.classList.add('hidden');
}

export function handleARStep({ cityId, step, onSuccess }) {
  const data = gameState.progress[cityId][step];
  if (data.found) return;

  data.found = true;
  saveGame();
  onSuccess();
}

export function handleTouchCollect({ city, obj, element }) {
  const cityId = city.id;
  const key = `city_${cityId}_touch`;

  if (!gameState.collectedLetters[key]) {
    gameState.collectedLetters[key] = [];
  }

  if (gameState.collectedLetters[key].includes(obj.letter)) return;

  gameState.collectedLetters[key].push(obj.letter);
  saveGame();

  element.setAttribute('visible', 'false');

  const allLetters = city.arScene.touch.objects.map(o => o.letter);
  if (gameState.collectedLetters[key].length === allLetters.length) {
    gameState.progress[cityId].touch.found = true;
    saveGame();
  }
}
