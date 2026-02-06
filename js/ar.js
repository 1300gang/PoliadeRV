// ==========================================
// MOTEUR RÉALITÉ AUGMENTÉE (MULTI-TARGET)
// Raycasting manuel THREE.js
// ==========================================

const arContainer = document.getElementById('ar-scene-container');
const arInstructions = document.querySelector('.ar-instructions');
const btnARChat = document.getElementById('btn-ar-chat');
const btnAROpenChat = document.getElementById('btn-ar-open-chat');
const arModal = document.getElementById('ar-modal');
const arModalText = document.getElementById('ar-modal-text');
const btnARModalChat = document.getElementById('btn-ar-modal-chat');
const btnARModalContinue = document.getElementById('btn-ar-modal-continue');
const arWordDisplay = document.getElementById('ar-word-display');

let arAudioPlayer = null;
let currentCity = null;
let isModalOpen = false;
let arClickListenerActive = false;

// --- LANCER LA RA ---
document.getElementById('btn-activate-ar').onclick = () => {
    showScreen('screen-ar');
    startAR();
};

function startAR() {
    currentCity = gameData.cities[gameState.currentCityIndex];
    console.log("🚀 Démarrage RA :", currentCity.name);
    arClickListenerActive = false;
    
    const sceneHTML = buildMultiTargetARScene();
    arContainer.innerHTML = sceneHTML;
    
    // Attendre que la scène A-Frame soit chargée avant d'attacher les listeners
    const sceneEl = arContainer.querySelector('a-scene');
    if (sceneEl.hasLoaded) {
        attachAREventListeners();
    } else {
        sceneEl.addEventListener('loaded', () => {
            attachAREventListeners();
        });
    }
}

// --- CONSTRUCTION SCÈNE MULTI-TARGET ---
function buildMultiTargetARScene() {
    const scene = currentCity.arScene;
    const cityId = currentCity.id;
    const targetFile = currentCity.arScene.targetFile;
    
    let entitiesHTML = '';
    
    // TARGET 0 : VISION
    entitiesHTML += `
        <a-entity mindar-image-target="targetIndex: 0">
            <a-gltf-model 
                id="ar-vision-model"
                src="${scene.vision.model}"
                position="${scene.vision.position}" 
                scale="${scene.vision.scale}" 
                class="clickable"
                data-target-type="vision">
            </a-gltf-model>
        </a-entity>
    `;
    
    // TARGET 1 : AUDIO
    entitiesHTML += `
        <a-entity mindar-image-target="targetIndex: 1">
            <a-gltf-model 
                id="ar-audio-model"
                src="${scene.audio.model}"
                position="${scene.audio.position}" 
                scale="${scene.audio.scale}" 
                class="clickable"
                data-target-type="audio">
            </a-gltf-model>
        </a-entity>
    `;
    
    // TARGET 2 : TOUCH (Objets multiples)
    const collectedLetters = gameState.collectedLetters[`city_${cityId}_touch`] || [];
    let touchObjectsHTML = '';
    
    scene.touch.objects.forEach((obj, index) => {
        if (collectedLetters.includes(obj.letter)) {
            touchObjectsHTML += `
                <a-text 
                    value="${obj.letter}" 
                    position="${obj.position}" 
                    scale="2 2 2" 
                    color="#00FF00" 
                    align="center">
                </a-text>
            `;
        } else {
            touchObjectsHTML += `
                <a-gltf-model 
                    id="ar-touch-obj-${index}"
                    src="${obj.model}"
                    position="${obj.position}" 
                    scale="${obj.scale}" 
                    class="clickable"
                    data-target-type="touch"
                    data-letter="${obj.letter}"
                    data-obj-index="${index}">
                </a-gltf-model>
            `;
        }
    });
    
    entitiesHTML += `
        <a-entity mindar-image-target="targetIndex: 2">
            ${touchObjectsHTML}
        </a-entity>
    `;
    
    // PAS de cursor ni raycaster A-Frame — tout se fait en THREE.js manuellement
    return `
        <a-scene 
            mindar-image="imageTargetSrc: ${targetFile}; uiScanning: no; maxTrack: 3" 
            color-space="sRGB" 
            renderer="colorManagement: true, physicallyCorrectLights" 
            vr-mode-ui="enabled: false" 
            device-orientation-permission-ui="enabled: false"
            embedded>
            
            <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

            ${entitiesHTML}

            <a-light type="ambient" intensity="1"></a-light>
            <a-light type="directional" position="10 10 10" intensity="1.5"></a-light>
        </a-scene>
    `;
}

// --- ÉCOUTEURS D'ÉVÉNEMENTS RA ---
function attachAREventListeners() {
    console.log("🔗 Attachement des événements AR");
    
    const sceneEl = arContainer.querySelector('a-scene');
    const sceneConfig = currentCity.arScene;
    
    // ========================================
    // DÉTECTION DES TARGETS (targetFound / targetLost)
    // ========================================
    const targetEntities = document.querySelectorAll('[mindar-image-target]');
    console.log("🎯 Nombre de targets trouvées:", targetEntities.length);

    targetEntities.forEach((entity, idx) => {
        const attr = entity.getAttribute('mindar-image-target');
        let targetIndex = (typeof attr === 'string') ? parseInt(attr.split(':')[1]) : attr.targetIndex;
        
        console.log(`📌 Configuration target ${idx} (index: ${targetIndex})`);

        entity.addEventListener("targetFound", () => {
            console.log(`✅ TARGET ${targetIndex} TROUVÉE !`);
            
            // LOGIQUE VISION
            if (targetIndex === 0 && !gameState.flags[sceneConfig.vision.flagKey]) {
                console.log("🎯 Vision détectée, déclenchement modale");
                triggerARSuccess(sceneConfig.vision.discoveryMessage, sceneConfig.vision.flagKey);
            }

            // LOGIQUE AUDIO
            if (targetIndex === 1 && 
                gameState.flags[sceneConfig.vision.flagKey] && 
                !gameState.flags[sceneConfig.audio.flagKey]) {
                console.log("🔊 Audio détecté, lecture son");
                const player = new Audio(sceneConfig.audio.audioFile);
                player.play();
                
                player.onended = () => {
                    console.log("🎵 Son terminé, déclenchement modale");
                    triggerARSuccess(sceneConfig.audio.discoveryMessage, sceneConfig.audio.flagKey);
                };
            }

            // LOGIQUE TOUCH
            if (targetIndex === 2 && 
                gameState.flags[sceneConfig.audio.flagKey] && 
                !gameState.flags[sceneConfig.touch.flagKey]) {
                console.log("🔤 Touch détecté, objets cliquables activés");
            }
        });
        
        entity.addEventListener("targetLost", () => {
            console.log(`❌ TARGET ${targetIndex} PERDUE`);
        });
    });

    // ========================================
    // RAYCASTING MANUEL THREE.JS
    // ========================================
    if (arClickListenerActive) {
        console.log("⚠️ Listener déjà actif, pas de double-bind");
        return;
    }
    
    const canvas = sceneEl.canvas;
    const camera = arContainer.querySelector('a-camera');
    
    const handleClick = (event) => {
        if (isModalOpen) return;
        
        console.log("🖱️ CLIC détecté sur canvas");
        
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        
        // Support souris + tactile
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else if (event.changedTouches && event.changedTouches.length > 0) {
            clientX = event.changedTouches[0].clientX;
            clientY = event.changedTouches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        // Coordonnées normalisées (-1 à +1)
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((clientY - rect.top) / rect.height) * 2 + 1;
        
        console.log(`📍 Position clic: (${x.toFixed(2)}, ${y.toFixed(2)})`);
        
        // Raycaster THREE.js
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(x, y);
        
        const cameraObj = camera.object3D.children[0] || camera.object3D;
        raycaster.setFromCamera(mouse, cameraObj);
        
        // ========================================
        // COLLECTER TOUS LES OBJETS 3D CLIQUABLES
        // ========================================
        const clickableObjects = [];
        
        // Vision
        const visionModel = document.getElementById('ar-vision-model');
        if (visionModel && visionModel.object3D) {
            visionModel.object3D.traverse((node) => {
                if (node.isMesh) {
                    node.userData.arType = 'vision';
                    clickableObjects.push(node);
                }
            });
        }
        
        // Audio
        const audioModel = document.getElementById('ar-audio-model');
        if (audioModel && audioModel.object3D) {
            audioModel.object3D.traverse((node) => {
                if (node.isMesh) {
                    node.userData.arType = 'audio';
                    clickableObjects.push(node);
                }
            });
        }
        
        // Touch objects (uniquement ceux pas encore collectés)
        sceneConfig.touch.objects.forEach((obj, index) => {
            const touchModel = document.getElementById(`ar-touch-obj-${index}`);
            if (touchModel && touchModel.object3D && touchModel.getAttribute('visible') !== 'false') {
                touchModel.object3D.traverse((node) => {
                    if (node.isMesh) {
                        node.userData.arType = 'touch';
                        node.userData.touchIndex = index;
                        node.userData.touchObj = obj;
                        node.userData.touchEl = touchModel;
                        clickableObjects.push(node);
                    }
                });
            }
        });
        
        console.log(`🎯 Objets cliquables dans la scène: ${clickableObjects.length}`);
        
        // ========================================
        // DÉTECTION D'INTERSECTION
        // ========================================
        const intersects = raycaster.intersectObjects(clickableObjects, false);
        
        if (intersects.length > 0) {
            const hit = intersects[0].object;
            console.log(`✅ INTERSECTION ! Type: ${hit.userData.arType}`);
            
            switch (hit.userData.arType) {
                case 'vision':
                    console.log("👁️ Vision cliquée via raycaster");
                    handleVisionClick();
                    break;
                    
                case 'audio':
                    console.log("🔊 Audio cliqué via raycaster");
                    handleAudioClick();
                    break;
                    
                case 'touch':
                    console.log(`🔤 Touch objet ${hit.userData.touchIndex} cliqué via raycaster`);
                    handleTouchClick(
                        hit.userData.touchObj,
                        hit.userData.touchEl,
                        hit.userData.touchIndex
                    );
                    break;
            }
        } else {
            console.log("❌ Aucune intersection");
        }
    };
    
    // Binder sur le canvas
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchend', (evt) => {
        evt.preventDefault();
        handleClick(evt);
    }, { passive: false });
    
    arClickListenerActive = true;
    console.log("✅ Raycasting manuel THREE.js configuré");
    
    updateWordDisplay();
    console.log("✅ Tous les listeners AR attachés");
}

// --- GESTION CLICS ---
function handleVisionClick() {
    const cityId = currentCity.id;
    const flagKey = `city_${cityId}_vision_found`;
    
    if (!gameState.flags[flagKey]) {
        gameState.flags[flagKey] = true;
        saveGame();
        showARModal(currentCity.arScene.vision.discoveryMessage);
    }
}

function handleAudioClick() {
    const cityId = currentCity.id;
    const flagKey = `city_${cityId}_audio_found`;
    
    if (!gameState.flags[flagKey]) {
        gameState.flags[flagKey] = true;
        saveGame();
        showARModal(currentCity.arScene.audio.discoveryMessage);
    }
}

function handleTouchClick(obj, element, index) {
    const cityId = currentCity.id;
    const collectKey = `city_${cityId}_touch`;
    
    console.log("🖱️ CLIC DÉTECTÉ sur objet Touch !");
    console.log("📍 Index:", index);
    console.log("🔤 Lettre:", obj.letter);
    
    if (!gameState.collectedLetters[collectKey]) {
        gameState.collectedLetters[collectKey] = [];
        console.log("📝 Initialisation tableau lettres");
    }
    
    console.log("📚 Lettres déjà collectées:", gameState.collectedLetters[collectKey]);
    
    if (gameState.collectedLetters[collectKey].includes(obj.letter)) {
        console.log("⚠️ Lettre déjà collectée, annulation");
        return;
    }
    
    console.log("✅ Ajout de la lettre:", obj.letter);
    gameState.collectedLetters[collectKey].push(obj.letter);
    saveGame();
    
    // Cacher l'objet 3D
    console.log("👻 Masquage de l'objet 3D");
    element.setAttribute('visible', 'false');
    
    // Afficher la lettre en 3D à la même position
    const parent = element.parentElement;
    const letterText = document.createElement('a-text');
    letterText.setAttribute('value', obj.letter);
    letterText.setAttribute('position', obj.position);
    letterText.setAttribute('scale', '2 2 2');
    letterText.setAttribute('color', '#00FF00');
    letterText.setAttribute('align', 'center');
    parent.appendChild(letterText);
    console.log("✨ Lettre affichée en 3D");
    
    updateWordDisplay();
    
    const allLetters = currentCity.arScene.touch.objects.map(o => o.letter);
    const collected = gameState.collectedLetters[collectKey];
    
    console.log("📊 Progression:", collected.length, "/", allLetters.length);
    
    if (collected.length === allLetters.length) {
        console.log("🎉 Toutes les lettres collectées !");
        gameState.flags[`city_${cityId}_touch_complete`] = true;
        saveGame();
        showARModal(currentCity.arScene.touch.completeMessage);
    } else {
        showARModal(currentCity.arScene.touch.discoveryMessage);
    }
}

// --- AFFICHAGE MOT À TROUS ---
function updateWordDisplay() {
    const cityId = currentCity.id;
    const collectKey = `city_${cityId}_touch`;
    const collected = gameState.collectedLetters[collectKey] || [];
    const secretWord = currentCity.arScene.touch.secretWord;
    
    if (collected.length === 0) {
        arWordDisplay.classList.add('hidden');
        return;
    }
    
    let display = '';
    for (let char of secretWord) {
        if (collected.includes(char)) {
            display += char + ' ';
        } else {
            display += '_ ';
        }
    }
    
    arWordDisplay.innerText = display.trim();
    arWordDisplay.classList.remove('hidden');
}

// --- MODAL DÉCOUVERTE ---
function showARModal(message) {
    arModalText.innerText = message;
    arModal.classList.remove('hidden');
    isModalOpen = true;
}

function triggerARSuccess(message, flagToSet) {
    console.log("🎯 Tentative déclenchement AR:", flagToSet);
    console.log("🔒 Flag existe déjà ?", gameState.flags[flagToSet]);
    
    if (gameState.flags[flagToSet]) {
        console.log("⚠️ Flag déjà activé, annulation de la modale");
        return;
    }
    
    if (isModalOpen) {
        console.log("⚠️ Modale déjà ouverte, annulation");
        return;
    }
    
    isModalOpen = true;

    gameState.flags[flagToSet] = true;
    saveGame();
    console.log("✅ Flag activé:", flagToSet);

    const audioNotification = new Audio('css/assets/audio/notif.mp3');
    audioNotification.play().catch(e => {});

    setTimeout(() => {
        showARModal(message);
    }, 500); 
}

btnARModalChat.addEventListener('click', () => {
    console.log("📱 Ouverture chat depuis modale AR");
    
    arModal.classList.add('hidden');
    isModalOpen = false;
    
    stopAR();
    
    showScreen('screen-hub');
    
    setTimeout(() => {
        openChat();
    }, 300);
});

btnARModalContinue.addEventListener('click', () => {
    arModal.classList.add('hidden');
    isModalOpen = false;
});

if (btnAROpenChat) {
    btnAROpenChat.addEventListener('click', () => {
        console.log("🔗 Ouvrir le chat depuis la RA");
        openChat();
    });
}

// --- STOPPER LA RA ---
function stopAR() {
    console.log("🛑 Arrêt RA");
    arClickListenerActive = false;
    
    if (arAudioPlayer) {
        arAudioPlayer.pause();
        arAudioPlayer = null;
    }
    
    saveGame();
    arContainer.innerHTML = '';
}

document.getElementById('btn-quit-ar').onclick = () => {
    stopAR();
};