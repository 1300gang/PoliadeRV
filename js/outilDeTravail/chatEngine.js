
// chatEngine.js
// Moteur narratif et dialogues

import { gameState, saveGame } from "./core.js";

export function getCityStep(progress) {
  if (progress.complete) return "complete";
  if (progress.touch.found && !progress.touch.solved) return "afterTouch";
  if (progress.audio.solved && !progress.touch.found) return "afterAudio";
  if (progress.audio.found && !progress.audio.solved) return "afterAudio";
  if (progress.vision.solved && !progress.audio.found) return "afterVision";
  if (progress.vision.found && !progress.vision.solved) return "afterVision";
  return "intro";
}

export function determineDialogue(city) {
  const progress = gameState.progress[city.id];
  const step = getCityStep(progress);
  return city.dialogues[step];
}

export function pushChatMessage({ text, sender, imageUrl = null }) {
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
