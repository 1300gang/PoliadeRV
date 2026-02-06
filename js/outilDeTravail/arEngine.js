
// arEngine.js
// Gestion de la réalité augmentée (MindAR)

import { gameState, saveGame } from "./core.js";

let currentCity = null;

export function startAR(city) {
  currentCity = city;
  buildScene();
}

function buildScene() {
  const container = document.getElementById("ar-scene-container");
  container.innerHTML = `
    <a-scene mindar-image="imageTargetSrc: ${currentCity.arScene.targetFile}; maxTrack: 3">
      <a-camera position="0 0 0"></a-camera>
    </a-scene>
  `;
}

export function handleARStep(cityId, step, onSuccess) {
  const data = gameState.progress[cityId][step];
  if (data.found) return;
  data.found = true;
  saveGame();
  onSuccess();
}
