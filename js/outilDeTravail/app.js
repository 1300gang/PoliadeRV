console.log("🎮 App démarrée - Version Multi-Target");

// ==========================================
// ÉTAT DU JEU
// ==========================================

let gameState = {
    hasCompletedTutorial: false,
    currentCityIndex: 0,
    flags: {}, // Ex: city_0_vision_found, city_0_vision_solved, city_0_audio_found, etc.
    chatHistory: {},
    collectedLetters: {} // Ex: city_0_touch: ["T", "A"]
};

// --- SAUVEGARDE / CHARGEMENT ---
function saveGame() {
    localStorage.setItem('myGameSave', JSON.stringify(gameState));
    console.log("💾 Jeu sauvegardé", gameState);
}

function loadGame() {
    const saved = localStorage.getItem('myGameSave');
    if (saved) {
        gameState = JSON.parse(saved);
        console.log("📂 Jeu chargé", gameState);
        
        // IMPORTANT : Si tutoriel complété, skip direct au hub
        if (gameState.hasCompletedTutorial) {
            loadCity(gameState.currentCityIndex);
            showScreen('screen-hub');
            return; // ← Sortir ici, ne pas continuer
        }
    }
    // Si pas de sauvegarde OU tutoriel pas fait
    showScreen('screen-splash');
}

// ==========================================
// NAVIGATION (ÉCRANS)
// ==========================================

function showScreen(screenId) {
    // Vérifier que l'écran existe
    const screen = document.getElementById(screenId);
    if (!screen) {
        console.error(`❌ Écran non trouvé : ${screenId}`);
        return;
    }
    
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });
    screen.classList.add('active');

    // Gestion du header
    const mainHeader = document.getElementById('main-header');
    if (mainHeader) {
        if (screenId === 'screen-splash') {
            mainHeader.classList.add('hidden');
        } else {
            mainHeader.classList.remove('hidden');
        }
    }

    // Recalculer tuto
    if (screenId === 'screen-tuto') {
        setTimeout(() => {
            gameAreaRect = tutoGameArea.getBoundingClientRect();
        }, 100);
    }
}

// --- BOUTONS NAVIGATION ---
document.getElementById('btn-start-intro').addEventListener('click', () => {
    showScreen('screen-comic');
});

document.getElementById('btn-end-comic').addEventListener('click', () => {
    showScreen('screen-tuto');
});

// ==========================================
// TIROIRS
// ==========================================

const backdrop = document.getElementById('drawer-backdrop');
const leftDrawer = document.getElementById('drawer-left');
const rightDrawer = document.getElementById('drawer-right');

function closeAllDrawers() {
    leftDrawer.classList.remove('open');
    rightDrawer.classList.remove('open');
    backdrop.classList.add('hidden');
}

document.getElementById('btn-menu-left').addEventListener('click', () => {
    leftDrawer.classList.add('open');
    backdrop.classList.remove('hidden');
});

document.getElementById('btn-menu-right').addEventListener('click', () => {
    rightDrawer.classList.add('open');
    backdrop.classList.remove('hidden');
});

document.querySelectorAll('.close-drawer').forEach(btn => {
    btn.addEventListener('click', closeAllDrawers);
});
backdrop.addEventListener('click', closeAllDrawers);

// ==========================================
// LOGIQUE DU JEU - CHARGEMENT VILLE
// ==========================================

const uiCityBg = document.querySelector('.city-image .placeholder-img');
const uiCityTitle = document.querySelector('.city-name-badge span');

function loadCity(index) {
    const totalCities = gameData.cities.length;
    let targetIndex = index;

    // Boucle infinie
    if (targetIndex < 0) targetIndex = totalCities - 1;
    if (targetIndex >= totalCities) targetIndex = 0;

    gameState.currentCityIndex = targetIndex;
    const cityData = gameData.cities[targetIndex];

    console.log("🏙️ Chargement Ville :", cityData.name);

    // Mise à jour UI
    uiCityTitle.innerText = cityData.name;
    uiCityBg.innerText = "Illustration : " + cityData.name;
    
    // Sauvegarder
    saveGame();
}

// Navigation villes
document.getElementById('btn-prev-city').addEventListener('click', () => {
    loadCity(gameState.currentCityIndex - 1);
});

document.getElementById('btn-next-city').addEventListener('click', () => {
    loadCity(gameState.currentCityIndex + 1);
});

// ==========================================
// TUTORIEL (MINI-JEU LENTILLE)
// ==========================================

const tutoGameArea = document.getElementById('tuto-game-area');
const lensContainer = document.getElementById('tuto-lens-container');
const solutionLayer = document.getElementById('tuto-solution-layer');
const revealWindow = document.getElementById('tuto-reveal-window');
const phoneFrameImg = document.getElementById('tuto-phone-frame');
const tutoInput = document.getElementById('tuto-input');
const btnValidateTuto = document.getElementById('btn-validate-tuto');

phoneFrameImg.src = 'assets/images/phone_mask.png';

let gameAreaRect = null;

function getCoords(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function handleTutoMove(e) {
    if (!gameAreaRect) gameAreaRect = tutoGameArea.getBoundingClientRect();
    e.preventDefault();
    
    const { x: eventX, y: eventY } = getCoords(e);
    let relativeX = eventX - gameAreaRect.left;
    let relativeY = eventY - gameAreaRect.top;

    relativeX = Math.max(0, Math.min(relativeX, gameAreaRect.width));
    relativeY = Math.max(0, Math.min(relativeY, gameAreaRect.height));

    lensContainer.style.left = `${relativeX}px`;
    lensContainer.style.top = `${relativeY}px`;

    const revealRect = revealWindow.getBoundingClientRect();
    const offsetX = -(revealRect.left - gameAreaRect.left);
    const offsetY = -(revealRect.top - gameAreaRect.top);
    const scaleX = gameAreaRect.width / revealRect.width;
    const scaleY = gameAreaRect.height / revealRect.height;
    
    solutionLayer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY})`;
}

function startTutoInteraction(e) {
    gameAreaRect = tutoGameArea.getBoundingClientRect();
    handleTutoMove(e);
}

tutoGameArea.addEventListener('mousemove', handleTutoMove);
tutoGameArea.addEventListener('mouseenter', startTutoInteraction);
tutoGameArea.addEventListener('touchmove', handleTutoMove, { passive: false });
tutoGameArea.addEventListener('touchstart', startTutoInteraction, { passive: false });

window.addEventListener('resize', () => {
    if (document.getElementById('screen-tuto').classList.contains('active')) {
        gameAreaRect = tutoGameArea.getBoundingClientRect();
    }
});

const TUTORIAL_ANSWER = "PIMENT";

btnValidateTuto.addEventListener('click', () => {
    const userInput = tutoInput.value.trim().toUpperCase();

    if (userInput === TUTORIAL_ANSWER) {
        // Marquer le tutoriel comme complété
        gameState.hasCompletedTutorial = true;
        saveGame();
        
        tutoInput.value = '';
        loadCity(0);
        showScreen('screen-hub');
    } else {
        alert("Ce n'est pas ça. Cherchez encore avec le téléphone !");
        tutoInput.value = '';
    }
});

// ==========================================
// MOTEUR DE CONVERSATION (CHAT)
// ==========================================

const chatModal = document.getElementById('modal-chat');
const chatHistory = document.getElementById('chat-history');
const chatControls = document.getElementById('chat-controls');
const btnCloseChat = document.getElementById('btn-close-chat');
const typingIndicator = document.getElementById('typing-indicator');
const btnChatActivateAR = document.getElementById('btn-chat-activate-ar'); // Nouveau bouton

// Sons
const soundNewMessage = new Audio('css/assets/audio/notif.mp3');
const soundTyping = new Audio('css/assets/audio/texting.mp3');

let currentDialogueId = null;
let isTyping = false;

// --- CONSTANTE : Temps d'écriture (AJUSTABLE ICI) ---
const TYPING_SPEED_MS_PER_50_CHARS = 1000; // 1 seconde pour 50 caractères

// --- OUVERTURE CHAT ---
document.getElementById('btn-chat').addEventListener('click', () => {
    openChat();
});

function openChat() {
    showScreen('modal-chat');
    const city = gameData.cities[gameState.currentCityIndex];
    
    const cityId = city.id;
    const chatKey = `city_${cityId}`;

    console.log("💬 Ouverture chat pour ville:", cityId);
    console.log("🔍 Flags actuels:", gameState.flags);

    // Restaurer l'historique
    chatHistory.innerHTML = '';
    if (gameState.chatHistory[chatKey]) {
        gameState.chatHistory[chatKey].forEach(msg => {
            addBubbleToHistory(msg.text, msg.sender, msg.imageUrl);
        });
    }

    chatModal.classList.remove('hidden');

    const hasHistory = gameState.chatHistory[chatKey] && gameState.chatHistory[chatKey].length > 0;
    
    // Déterminer quel dialogue afficher
    let startNodeID = determineDialogueNode(cityId);
    console.log("🎬 Dialogue déterminé:", startNodeID);
    
    // ✅ CORRECTION : On lance TOUJOURS le nouveau dialogue sauf si :
    // - C'est l'intro ET on a déjà un historique
    const isIntroAndHasHistory = (startNodeID === city.dialogues.intro) && hasHistory;
    
    if (!isIntroAndHasHistory) {
        console.log("▶️ Lancement du dialogue:", startNodeID);
        processDialogueNode(startNodeID);
    } else {
        console.log("📜 Intro déjà vue, pas de relance");
    }
}


// --- LOGIQUE : Déterminer quel dialogue ouvrir ---
// --- FONCTION CORRIGÉE : determineDialogueNode() ---
function determineDialogueNode(cityId) {
    const city = gameData.cities[cityId];
    
    console.log("🔎 Détermination dialogue pour ville", cityId);
    console.log("📊 Flags:", {
        vision_found: gameState.flags[`city_${cityId}_vision_found`],
        vision_solved: gameState.flags[`city_${cityId}_vision_solved`],
        audio_found: gameState.flags[`city_${cityId}_audio_found`],
        audio_solved: gameState.flags[`city_${cityId}_audio_solved`],
        touch_complete: gameState.flags[`city_${cityId}_touch_complete`],
        touch_solved: gameState.flags[`city_${cityId}_touch_solved`],
        complete: gameState.flags[`city_${cityId}_complete`]
    });
    
    // Priorité : Ville complète
    if (gameState.flags[`city_${cityId}_complete`]) {
        console.log("✅ Ville complète détectée");
        return city.dialogues.complete;
    }
    
    // Touch trouvé mais pas résolu
    if (gameState.flags[`city_${cityId}_touch_complete`] && 
        !gameState.flags[`city_${cityId}_touch_solved`]) {
        console.log("🔤 Touch trouvé, attente résolution");
        return city.dialogues.afterTouch;
    }
    
    // Audio résolu → Passer à Touch (message de transition)
    if (gameState.flags[`city_${cityId}_audio_solved`] && 
        !gameState.flags[`city_${cityId}_touch_complete`]) {
        console.log("✅ Audio résolu, retour en RA pour Touch");
        return city.dialogues.afterAudio; // "bravo_audio_01" qui dit de retourner en RA
    }
    
    // Audio trouvé mais pas résolu
    if (gameState.flags[`city_${cityId}_audio_found`] && 
        !gameState.flags[`city_${cityId}_audio_solved`]) {
        console.log("🔊 Audio trouvé, attente résolution");
        return city.dialogues.afterAudio;
    }
    
    // Vision résolu → Passer à Audio (message de transition)
    if (gameState.flags[`city_${cityId}_vision_solved`] && 
        !gameState.flags[`city_${cityId}_audio_found`]) {
        console.log("✅ Vision résolu, retour en RA pour Audio");
        return city.dialogues.afterVision; // "bravo_vision_01" qui dit de retourner en RA
    }
    
    // Vision trouvé mais pas résolu
    if (gameState.flags[`city_${cityId}_vision_found`] && 
        !gameState.flags[`city_${cityId}_vision_solved`]) {
        console.log("👁️ Vision trouvé, attente résolution");
        return city.dialogues.afterVision;
    }
    
    // Rien trouvé → Intro
    console.log("🆕 Aucun flag, dialogue intro");
    return city.dialogues.intro;
}

// --- BONUS : Fonction pour réinitialiser le chat d'une ville ---
function resetCityChat(cityId) {
    const chatKey = `city_${cityId}`;
    gameState.chatHistory[chatKey] = [];
    saveGame();
    console.log("🗑️ Chat réinitialisé pour ville", cityId);
}


btnCloseChat.addEventListener('click', () => {
    chatModal.classList.add('hidden');
});

// --- Bouton "Activer RA" dans le chat ---
if (btnChatActivateAR) {
    btnChatActivateAR.addEventListener('click', () => {
        chatModal.classList.add('hidden');
        showScreen('screen-ar');
        startAR();
    });
}

// --- TRAITEMENT DES NŒUDS ---
function processDialogueNode(nodeId) {
    if (!nodeId) return;
    
    currentDialogueId = nodeId;
    const node = gameData.dialogues[nodeId];

    if (!node) {
        console.error("❌ Dialogue introuvable : " + nodeId);
        return;
    }

    // Afficher le message avec animation typing
    if (node.text) {
        showTypingIndicator(node.sender);
        
        const typingTime = calculateTypingTime(node.text);
        
        setTimeout(() => {
            hideTypingIndicator();
            addBubble(node.text, node.sender);
            playSoundNewMessage();
            
            // Sauvegarder le message
            saveChatMessage(node.text, node.sender);
            
            renderControls(node);
        }, typingTime);
    } else {
        if (node.type === 'image' && node.url) {
            addImageBubble(node.url);
            saveChatMessage('', node.sender, node.url);
        }
        renderControls(node);
    }
}

// --- INDICATEUR "EN TRAIN D'ÉCRIRE" ---
function showTypingIndicator(sender) {
    isTyping = true;
    const character = gameData.characters[sender];
    const charName = character ? character.name : sender;
    
    typingIndicator.innerHTML = `
        <img src="${character.avatar}" alt="${charName}" class="typing-avatar">
        <span>${charName} est en train d'écrire<span class="typing-dots">...</span></span>
    `;
    typingIndicator.classList.remove('hidden');
    
    playSoundTyping();
}

function hideTypingIndicator() {
    isTyping = false;
    typingIndicator.classList.add('hidden');
}

// --- CALCUL DU TEMPS D'ÉCRITURE ---
function calculateTypingTime(text) {
    const charCount = text.length;
    const time = (charCount / 50) * TYPING_SPEED_MS_PER_50_CHARS;
    return Math.max(500, time);
}

// --- SONS ---
function playSoundNewMessage() {
    soundNewMessage.currentTime = 0;
    soundNewMessage.play().catch(e => console.log("Son désactivé par le navigateur"));
}

function playSoundTyping() {
    soundTyping.currentTime = 0;
    soundTyping.play().catch(e => console.log("Son désactivé par le navigateur"));
}

// --- BULLES DE CHAT ---
function addBubble(text, sender, imageUrl = null) {
    const character = gameData.characters[sender] || { name: sender, avatar: '', color: '#999' };
    
    const bubble = document.createElement('div');
    bubble.className = `bubble ${sender}`;
    
    const avatar = document.createElement('img');
    avatar.src = character.avatar;
    avatar.alt = character.name;
    avatar.className = 'bubble-avatar';
    
    const content = document.createElement('div');
    content.className = 'bubble-content';
    
    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.onclick = () => openZoom(imageUrl);
        content.appendChild(img);
    } else {
        content.innerText = text;
    }
    
    bubble.appendChild(avatar);
    bubble.appendChild(content);
    chatHistory.appendChild(bubble);
    scrollToBottom();
}

function addBubbleToHistory(text, sender, imageUrl = null) {
    addBubble(text, sender, imageUrl);
}

function addImageBubble(url) {
    addBubble('', 'npc', url);
}

function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// --- SAUVEGARDE MESSAGES ---
function saveChatMessage(text, sender, imageUrl = null) {
    const cityId = gameState.currentCityIndex;
    const chatKey = `city_${cityId}`;
    
    if (!gameState.chatHistory[chatKey]) {
        gameState.chatHistory[chatKey] = [];
    }
    
    gameState.chatHistory[chatKey].push({
        text: text,
        sender: sender,
        imageUrl: imageUrl,
        timestamp: Date.now()
    });
    
    saveGame();
}

// --- CONTRÔLES (INPUTS JOUEUR) ---
function renderControls(node) {
    chatControls.innerHTML = '';

    // CAS 1 : Choix Multiples
    if (node.type === 'choice') {
        node.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn-choice';
            btn.innerText = opt.label;
            btn.onclick = () => {
                addBubble(opt.label, 'player');
                saveChatMessage(opt.label, 'player');
                processDialogueNode(opt.next);
            };
            chatControls.appendChild(btn);
        });
    }

    // CAS 2 : Énigme / Input Texte
    else if (node.type === 'puzzle') {
        const container = document.createElement('div');
        container.className = 'puzzle-container';
        
        const input = document.createElement('input');
        input.className = 'puzzle-input';
        input.placeholder = "Votre réponse...";
        
        const btn = document.createElement('button');
        btn.className = 'btn-send';
        btn.innerText = 'Envoyer';
        
        btn.onclick = () => {
            if (input.value.trim()) {
                checkPuzzleAnswer(input.value, node);
            }
        };
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') btn.click();
        });
        
        container.appendChild(input);
        container.appendChild(btn);
        chatControls.appendChild(container);
    }
    
    // CAS 3 : Transition automatique
    else if (node.next) {
        setTimeout(() => {
            processDialogueNode(node.next);
        }, 1500);
    }

    // CAS 4 : Fin de niveau
    else if (node.type === 'end_level') {
        setTimeout(() => {
            chatModal.classList.add('hidden');
            
            const cityId = gameState.currentCityIndex;
            gameState.flags[`city_${cityId}_complete`] = true;
            
            gameState.currentCityIndex++;
            saveGame();
            loadCity(gameState.currentCityIndex);
            
            alert("🎉 Ville terminée ! En route pour la suivante.");
        }, 2000);
    }
}

// --- VALIDATION PUZZLE ---
function checkPuzzleAnswer(userValue, node) {
    const cleanValue = userValue.trim().toUpperCase();
    
    addBubble(userValue, 'player');
    saveChatMessage(userValue, 'player');
    
    if (node.correctAnswers.includes(cleanValue)) {
        // Marquer l'énigme comme résolue
        const cityId = gameState.currentCityIndex;
        const currentNode = currentDialogueId;
        
        // Déterminer quel type d'énigme vient d'être résolue
        if (currentNode.includes('vision')) {
            gameState.flags[`city_${cityId}_vision_solved`] = true;
        } else if (currentNode.includes('audio')) {
            gameState.flags[`city_${cityId}_audio_solved`] = true;
        } else if (currentNode.includes('touch')) {
            gameState.flags[`city_${cityId}_touch_solved`] = true;
        }
        
        saveGame();
        processDialogueNode(node.successNext);
    } else {
        setTimeout(() => {
            addBubble(node.failText || "Ce n'est pas ça.", node.sender);
            saveChatMessage(node.failText, node.sender);
        }, 800);
    }
}

// --- ZOOM IMAGE ---
const zoomModal = document.getElementById('image-zoom-modal');
const zoomedImage = document.getElementById('zoomed-image');
const btnCloseZoom = document.getElementById('btn-close-zoom');

function openZoom(url) {
    zoomedImage.src = url;
    zoomModal.classList.remove('hidden');
}

btnCloseZoom.addEventListener('click', () => {
    zoomModal.classList.add('hidden');
});

// ==========================================
// MOTEUR RÉALITÉ AUGMENTÉE (MULTI-TARGET)
// ==========================================

const arContainer = document.getElementById('ar-scene-container');
const arInstructions = document.querySelector('.ar-instructions');
const btnARChat = document.getElementById('btn-ar-chat');
const btnAROpenChat = document.getElementById('btn-ar-open-chat'); // Nouveau bouton
const arModal = document.getElementById('ar-modal');
const arModalText = document.getElementById('ar-modal-text');
const btnARModalChat = document.getElementById('btn-ar-modal-chat');
const btnARModalContinue = document.getElementById('btn-ar-modal-continue');
const arWordDisplay = document.getElementById('ar-word-display');

let arAudioPlayer = null;
let currentCity = null;

// --- LANCER LA RA ---
document.getElementById('btn-activate-ar').onclick = () => {
    showScreen('screen-ar');
    startAR();
};

function startAR() {
    currentCity = gameData.cities[gameState.currentCityIndex];
    console.log("🚀 Démarrage RA :", currentCity.name);
    
    // Construire la scène MULTI-TARGET
    const sceneHTML = buildMultiTargetARScene();
    arContainer.innerHTML = sceneHTML;
    
    // Écouteurs après chargement
    setTimeout(() => {
        attachAREventListeners();
    }, 1000);
}

// --- CONSTRUCTION SCÈNE MULTI-TARGET ---
function buildMultiTargetARScene() {
    const scene = currentCity.arScene;
    const cityId = currentCity.id;
    
// app.js - buildMultiTargetARScene
const targetFile = currentCity.arScene.targetFile; // Utilise la propriété unique
    
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
            // Lettre déjà collectée → Afficher la lettre
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
            // Objet cliquable
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
    
    return `
        <a-scene 
            mindar-image="imageTargetSrc: ${targetFile}; uiScanning: no; maxTrack: 3" 
            color-space="sRGB" 
            renderer="colorManagement: true, physicallyCorrectLights" 
            vr-mode-ui="enabled: false" 
            device-orientation-permission-ui="enabled: false">
            
            <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

            ${entitiesHTML}

            <a-light type="ambient" intensity="1"></a-light>
            <a-light type="directional" position="10 10 10" intensity="1.5"></a-light>
        </a-scene>
    `;
}

// ==========================================
// CORRECTION : ÉCOUTEURS D'ÉVÉNEMENTS RA
// ==========================================
function attachAREventListeners() {
    console.log("🔗 Attachement des événements AR");
    
    const targetEntities = document.querySelectorAll('[mindar-image-target]');
    console.log("🎯 Nombre de targets trouvées:", targetEntities.length);
    
    const sceneConfig = currentCity.arScene;

    targetEntities.forEach((entity, idx) => {
        const attr = entity.getAttribute('mindar-image-target');
        let targetIndex = (typeof attr === 'string') ? parseInt(attr.split(':')[1]) : attr.targetIndex;
        
        console.log(`📌 Configuration target ${idx} (index: ${targetIndex})`);

        // --- DÉTECTION ---
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

    // --- CLICS SUR MODÈLES 3D ---
    const visionModel = document.getElementById('ar-vision-model');
    if (visionModel) {
        console.log("👁️ Vision model trouvé, ajout listener");
        visionModel.addEventListener('click', handleVisionClick);
    } else {
        console.warn("⚠️ Vision model NOT FOUND");
    }

    const audioModel = document.getElementById('ar-audio-model');
    if (audioModel) {
        console.log("🔊 Audio model trouvé, ajout listener");
        audioModel.addEventListener('click', handleAudioClick);
    } else {
        console.warn("⚠️ Audio model NOT FOUND");
    }

    // TOUCH OBJECTS
    sceneConfig.touch.objects.forEach((obj, index) => {
        const el = document.getElementById(`ar-touch-obj-${index}`);
        if (el) {
            console.log(`🔤 Touch objet ${index} trouvé (lettre: ${obj.letter}), ajout listener`);
            el.addEventListener('click', () => {
                console.log(`🖱️ CLICK EVENT déclenché sur objet ${index}`);
                handleTouchClick(obj, el, index);
            });
        } else {
            console.warn(`⚠️ Touch objet ${index} NOT FOUND`);
        }
    });
    
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
    
    if (!gameState.collectedLetters[collectKey]) {
        gameState.collectedLetters[collectKey] = [];
    }
    
    gameState.collectedLetters[collectKey].push(obj.letter);
    saveGame();
    
    // Faire disparaître l'objet
    element.setAttribute('visible', 'false');
    
    // Afficher la lettre
    const parent = element.parentElement;
    const letterText = document.createElement('a-text');
    letterText.setAttribute('value', obj.letter);
    letterText.setAttribute('position', obj.position);
    letterText.setAttribute('scale', '2 2 2');
    letterText.setAttribute('color', '#00FF00');
    letterText.setAttribute('align', 'center');
    parent.appendChild(letterText);
    
    updateWordDisplay();
    
    // Vérifier si toutes les lettres sont collectées
    const allLetters = currentCity.arScene.touch.objects.map(o => o.letter);
    const collected = gameState.collectedLetters[collectKey];
    
    if (collected.length === allLetters.length) {
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
}

btnARModalChat.addEventListener('click', () => {
    console.log("📱 Ouverture chat depuis modale AR");
    
    arModal.classList.add('hidden');
    isModalOpen = false;
    
    // Stopper la RA
    stopAR();
    
    showScreen('screen-hub');
    
    // Ouvrir le chat (il détectera automatiquement le bon dialogue)
    setTimeout(() => {
        openChat();
    }, 300);
});

btnARModalContinue.addEventListener('click', () => {
    arModal.classList.add('hidden');
});

// --- BOUTON "OUVRIR CHAT" dans la RA ---
if (btnAROpenChat) {
    btnAROpenChat.addEventListener('click', () => {
        console.log("🔗 Ouvrir le chat depuis la RA");
        // Ne pas fermer la RA, juste ouvrir le chat par-dessus
        openChat();
    });
}

// --- STOPPER LA RA ---
function stopAR() {
    console.log("🛑 Arrêt RA");
    
    if (arAudioPlayer) {
        arAudioPlayer.pause();
        arAudioPlayer = null;
    }
    
    saveGame();
    arContainer.innerHTML = '';
    
    // // Reload pour libérer la caméra
    // window.location.reload();
}

document.getElementById('btn-quit-ar').onclick = () => {
    stopAR();
};


// --- VARIABLES DE CONTRÔLE ---
let isModalOpen = false;

// --- FONCTION POUR AFFICHER LA NOTIFICATION RA ---
function triggerARSuccess(message, flagToSet) {
    console.log("🎯 Tentative déclenchement AR:", flagToSet);
    console.log("🔒 Flag existe déjà ?", gameState.flags[flagToSet]);
    
    // ✅ EMPÊCHER LES DOUBLONS
    if (gameState.flags[flagToSet]) {
        console.log("⚠️ Flag déjà activé, annulation de la modale");
        return; // Ne rien faire si déjà trouvé
    }
    
    if (isModalOpen) {
        console.log("⚠️ Modale déjà ouverte, annulation");
        return;
    }
    
    isModalOpen = true;

    // 1. Marquer l'étape comme trouvée
    gameState.flags[flagToSet] = true;
    saveGame();
    console.log("✅ Flag activé:", flagToSet);

    // 2. Jouer un son
    const audioNotification = new Audio('css/assets/audio/notif.mp3');
    audioNotification.play().catch(e => {});

    // 3. Afficher la modale
    setTimeout(() => {
        showARModal(message);
    }, 500); 
}

// --- ÉCOUTEURS D'ÉVÉNEMENTS MIS À JOUR ---
function attachAREventListeners() {
    const targetEntities = document.querySelectorAll('[mindar-image-target]');
    const sceneConfig = currentCity.arScene;

    targetEntities.forEach((entity) => {
        const attr = entity.getAttribute('mindar-image-target');
        let targetIndex = (typeof attr === 'string') ? parseInt(attr.split(':')[1]) : attr.targetIndex;

        // --- DÉTECTION ---
        entity.addEventListener("targetFound", () => {
            
            // LOGIQUE VISION (Uniquement si pas encore fait)
            if (targetIndex === 0 && !gameState.flags[sceneConfig.vision.flagKey]) {
                console.log("🎯 Vision trouvée");
                triggerARSuccess("Indice trouvé ! Retourne voir Arron pour l'analyser.", sceneConfig.vision.flagKey);
            }

            // LOGIQUE AUDIO (Uniquement si Vision faite et Audio pas encore fait)
            if (targetIndex === 1 && gameState.flags[sceneConfig.vision.flagKey] && !gameState.flags[sceneConfig.audio.flagKey]) {
                console.log("🔊 Audio détecté");
                const player = new Audio(sceneConfig.audio.audioFile);
                player.play();
                
                // On attend la fin du son (Point 3 de ta demande)
                player.onended = () => {
                    triggerARSuccess("Tu as entendu l'indice sonore ! Retourne au chat.", sceneConfig.audio.flagKey);
                };
            }

            // LOGIQUE TOUCH (Uniquement si Audio fait et Touch pas fini)
            if (targetIndex === 2 && gameState.flags[sceneConfig.audio.flagKey] && !gameState.flags[sceneConfig.touch.flagKey]) {
                // Ici on laisse le joueur cliquer sur les objets (handleTouchClick)
                // La modale sera déclenchée par handleTouchClick quand toutes les lettres seront là
            }
        });
    });
}

// --- GESTION DU TOUCH (Point 4) ---
function handleTouchClick(obj, element, index) {
    const cityId = currentCity.id;
    const collectKey = `city_${cityId}_touch`;
    
    console.log("🖱️ CLIC DÉTECTÉ sur objet Touch !");
    console.log("📍 Index:", index);
    console.log("🔤 Lettre:", obj.letter);
    console.log("📦 Element:", element);
    
    if (!gameState.collectedLetters[collectKey]) {
        gameState.collectedLetters[collectKey] = [];
        console.log("📝 Initialisation tableau lettres");
    }
    
    console.log("📚 Lettres déjà collectées:", gameState.collectedLetters[collectKey]);
    
    // Vérifier si déjà collectée
    if (gameState.collectedLetters[collectKey].includes(obj.letter)) {
        console.log("⚠️ Lettre déjà collectée, annulation");
        return;
    }
    
    console.log("✅ Ajout de la lettre:", obj.letter);
    gameState.collectedLetters[collectKey].push(obj.letter);
    saveGame();
    
    // Faire disparaître l'objet
    console.log("👻 Masquage de l'objet 3D");
    element.setAttribute('visible', 'false');
    
    // Afficher la lettre
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
    
    // Vérifier si toutes les lettres sont collectées
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
// ==========================================
// DÉMARRAGE
// ==========================================

loadGame();