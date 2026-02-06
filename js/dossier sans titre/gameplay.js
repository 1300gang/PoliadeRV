
// gameplay.js
// ================================
// TUTORIAL & CHAT ENGINE
// ================================

import { gameState, saveGame } from './core.js';

export function getCityStep(progress) {
  if (progress.complete) return 'complete';
  if (progress.touch.found && !progress.touch.solved) return 'touch_pending';
  if (progress.audio.solved && !progress.touch.found) return 'after_audio';
  if (progress.vision.solved && !progress.audio.found) return 'after_vision';
  if (progress.vision.found && !progress.vision.solved) return 'vision_pending';
  return 'intro';
}

export function determineDialogueNode(city) {
  const progress = gameState.progress[city.id];
  const step = getCityStep(progress);
  return city.dialogues[step];
}

export function pushChatMessage({ text, sender, imageUrl }, addBubbleFn) {
  addBubbleFn(text, sender, imageUrl);

  const cityId = gameState.currentCityIndex;
  const key = `city_${cityId}`;
  if (!gameState.chatHistory[key]) gameState.chatHistory[key] = [];

  gameState.chatHistory[key].push({
    text,
    sender,
    imageUrl,
    timestamp: Date.now()
  });

  saveGame();
}
