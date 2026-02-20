// ==========================================
// MOTEUR DE CONVERSATION (CHAT) - VERSION 2.0
// ==========================================

const chatModal = document.getElementById('modal-chat');
const chatHistory = document.getElementById('chat-history');
const chatControls = document.getElementById('chat-controls');
const btnCloseChat = document.getElementById('btn-close-chat');
const typingIndicator = document.getElementById('typing-indicator');
const btnChatActivateAR = document.getElementById('btn-chat-activate-ar');
// nouvelle référence pour mettre à jour le nom de la ville
const chatCityName = document.getElementById('chat-city-name');

// Sons
const soundNewMessage = new Audio('css/assets/audio/notif.mp3');
const soundTyping = new Audio('css/assets/audio/texting.mp3');

let currentDialogueId = null;
let currentCityId = null; // ✅ NOUVEAU : Fige la ville au moment de l'ouverture du chat
let isTyping = false;

const TYPING_SPEED_MS_PER_50_CHARS = 1000;

// ==========================================
// SYSTÈME DE PROGRESSION
// ==========================================

/**
 * Détermine l'état actuel du joueur dans une ville
 * Retourne le prochain dialogue à afficher
 */
function getDialogueState(cityId) {
    const city = gameData.cities[cityId];
    
    // Ville complète
    if (gameState.flags[`city_${cityId}_complete`]) {
        return { dialogue: city.dialogues.complete, isNew: false };
    }
    
    // Touch : trouvé mais non résolu
    if (gameState.flags[`city_${cityId}_touch_complete`] && 
        !gameState.flags[`city_${cityId}_touch_solved`]) {
        const dialogueKey = city.dialogues.afterTouch;
        const isNew = !gameState.flags[`city_${cityId}_dialogue_${dialogueKey}_started`];
        return { dialogue: dialogueKey, isNew: isNew };
    }
    
    // Audio : résolu, en attente de Touch
    if (gameState.flags[`city_${cityId}_audio_solved`] && 
        !gameState.flags[`city_${cityId}_touch_complete`]) {
        return { dialogue: null, isNew: false }; // En attente de scan Touch
    }
    
    // Audio : trouvé mais non résolu
    if (gameState.flags[`city_${cityId}_audio_found`] && 
        !gameState.flags[`city_${cityId}_audio_solved`]) {
        const dialogueKey = city.dialogues.afterAudio;
        const isNew = !gameState.flags[`city_${cityId}_dialogue_${dialogueKey}_started`];
        return { dialogue: dialogueKey, isNew: isNew };
    }
    
    // Vision : résolu, en attente d'Audio
    if (gameState.flags[`city_${cityId}_vision_solved`] && 
        !gameState.flags[`city_${cityId}_audio_found`]) {
        return { dialogue: null, isNew: false }; // En attente de scan Audio
    }
    
    // Vision : trouvé mais non résolu
    if (gameState.flags[`city_${cityId}_vision_found`] && 
        !gameState.flags[`city_${cityId}_vision_solved`]) {
        const dialogueKey = city.dialogues.afterVision;
        const isNew = !gameState.flags[`city_${cityId}_dialogue_${dialogueKey}_started`];
        return { dialogue: dialogueKey, isNew: isNew };
    }
    
    // Intro (début de ville)
    const dialogueKey = city.dialogues.intro;
    const isNew = !gameState.flags[`city_${cityId}_dialogue_${dialogueKey}_started`];
    return { dialogue: dialogueKey, isNew: isNew };
}

/**
 * Détermine quel type d'énigme on est en train de résoudre
 */
function getCurrentPuzzleType(cityId) {
    if (gameState.flags[`city_${cityId}_touch_complete`] && 
        !gameState.flags[`city_${cityId}_touch_solved`]) {
        return 'touch';
    }
    if (gameState.flags[`city_${cityId}_audio_found`] && 
        !gameState.flags[`city_${cityId}_audio_solved`]) {
        return 'audio';
    }
    if (gameState.flags[`city_${cityId}_vision_found`] && 
        !gameState.flags[`city_${cityId}_vision_solved`]) {
        return 'vision';
    }
    return null;
}

// ==========================================
// OUVERTURE DU CHAT
// ==========================================

document.getElementById('btn-chat').addEventListener('click', () => {
    openChat();
});

function openChat() {
    showScreen('modal-chat');
    
    // ✅ FIGER la ville actuelle pour éviter les incohérences
    currentCityId = gameState.currentCityIndex;
    const city = gameData.cities[currentCityId];
    const chatKey = `city_${currentCityId}`;

    // Mettre à jour le header avec le nom de la ville
    if (chatCityName) {
        chatCityName.innerText = city.name;
    }

    console.log("💬 Ouverture chat pour ville:", currentCityId, city.name);
    console.log("🔍 Flags:", gameState.flags);

    // Afficher l'historique complet
    chatHistory.innerHTML = '';
    if (gameState.chatHistory[chatKey]) {
        gameState.chatHistory[chatKey].forEach(msg => {
            addBubbleToHistory(msg.text, msg.sender, msg.imageUrl);
        });
    }

    chatModal.classList.remove('hidden');

    // Déterminer l'état du dialogue
    const state = getDialogueState(currentCityId);
    
    console.log("📊 État du dialogue:", state);

    // Si c'est un nouveau dialogue, le lancer
    if (state.dialogue && state.isNew) {
        console.log("▶️ Lancement nouveau dialogue:", state.dialogue);
        
        // Marquer ce dialogue comme commencé
        gameState.flags[`city_${currentCityId}_dialogue_${state.dialogue}_started`] = true;
        saveGame();
        
        processDialogueNode(state.dialogue);
    } else if (state.dialogue && !state.isNew) {
        console.log("📖 Dialogue déjà en cours, affichage de l'historique uniquement");
        
        // Vérifier si on est en attente d'une réponse à un puzzle
        const puzzleType = getCurrentPuzzleType(currentCityId);
        if (puzzleType) {
            console.log(`🧩 En attente de résolution du puzzle ${puzzleType}`);
            // Afficher les contrôles du puzzle sans rejouer les messages
            showPuzzleControls(currentCityId, puzzleType);
        }
    } else {
        console.log("⏸️ En attente de scan en RA");
    }
}

/**
 * Affiche les contrôles d'un puzzle sans rejouer les messages
 */
function showPuzzleControls(cityId, puzzleType) {
    const city = gameData.cities[cityId];
    let dialogueKey;
    
    if (puzzleType === 'vision') {
        dialogueKey = city.dialogues.afterVision;
    } else if (puzzleType === 'audio') {
        dialogueKey = city.dialogues.afterAudio;
    } else if (puzzleType === 'touch') {
        dialogueKey = city.dialogues.afterTouch;
    }
    
    // Trouver le nœud puzzle dans le dialogue
    let currentNode = gameData.dialogues[dialogueKey];
    
    // Parcourir jusqu'au nœud puzzle
    while (currentNode && currentNode.type !== 'puzzle') {
        if (currentNode.next) {
            currentNode = gameData.dialogues[currentNode.next];
        } else {
            break;
        }
    }
    
    if (currentNode && currentNode.type === 'puzzle') {
        currentDialogueId = dialogueKey; // Pour que checkPuzzleAnswer fonctionne
        renderPuzzleInput(currentNode, puzzleType);
    }
}

// ==========================================
// FERMETURE DU CHAT
// ==========================================

btnCloseChat.addEventListener('click', () => {
    chatModal.classList.add('hidden');
    showScreen('screen-hub');
});

if (btnChatActivateAR) {
    btnChatActivateAR.addEventListener('click', () => {
        chatModal.classList.add('hidden');
        showScreen('screen-ar');
        startAR();
    });
}

// ==========================================
// TRAITEMENT DES NŒUDS
// ==========================================

function processDialogueNode(nodeId) {
    if (!nodeId) return;
    
    currentDialogueId = nodeId;
    const node = gameData.dialogues[nodeId];

    if (!node) {
        console.error("❌ Dialogue introuvable:", nodeId);
        return;
    }

    console.log("🎬 Traitement nœud:", nodeId, node);

    // Si le nœud a du texte, l'afficher avec effet typing
    if (node.text) {
        showTypingIndicator(node.sender);
        
        const typingTime = calculateTypingTime(node.text);
        
        setTimeout(() => {
            hideTypingIndicator();
            addBubble(node.text, node.sender);
            playSoundNewMessage();
            saveChatMessage(node.text, node.sender);
            
            // Passer aux contrôles
            handleNodeControls(node);
        }, typingTime);
    } else {
        // Nœud sans texte (image, etc.)
        if (node.type === 'image' && node.url) {
            addImageBubble(node.url);
            saveChatMessage('', node.sender, node.url);
        }
        handleNodeControls(node);
    }
}

/**
 * Gère les contrôles et la suite du nœud
 */
function handleNodeControls(node) {
    // Type puzzle : afficher l'input
    if (node.type === 'puzzle') {
        const puzzleType = getCurrentPuzzleType(currentCityId);
        renderPuzzleInput(node, puzzleType);
    }
    // Type choice : afficher les boutons
    else if (node.type === 'choice') {
        renderChoiceButtons(node);
    }
    // Type end_level : fin de ville
    else if (node.type === 'end_level') {
        handleEndLevel();
    }
    // Sinon, continuer vers le nœud suivant
    else if (node.next) {
        setTimeout(() => {
            processDialogueNode(node.next);
        }, 1500);
    }
}

// ==========================================
// CONTRÔLES (INPUTS JOUEUR)
// ==========================================

function renderPuzzleInput(node, puzzleType) {
    chatControls.innerHTML = '';
    
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
            checkPuzzleAnswer(input.value, node, puzzleType);
        }
    };
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') btn.click();
    });
    
    container.appendChild(input);
    container.appendChild(btn);
    chatControls.appendChild(container);
}

function renderChoiceButtons(node) {
    chatControls.innerHTML = '';
    
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

function handleEndLevel() {
    setTimeout(() => {
        chatModal.classList.add('hidden');
        
        // Marquer la ville comme complète
        gameState.flags[`city_${currentCityId}_complete`] = true;
        
        // Passer à la ville suivante
        gameState.currentCityIndex++;
        saveGame();
        
        // Charger la nouvelle ville
        if (gameState.currentCityIndex < gameData.cities.length) {
            loadCity(gameState.currentCityIndex);
            showScreen('screen-hub');
            alert("🎉 Ville terminée ! En route pour la suivante.");
        } else {
            showScreen('screen-hub');
            alert("🎊 Félicitations ! Vous avez terminé toutes les villes !");
        }
    }, 2000);
}

// ==========================================
// VALIDATION PUZZLE
// ==========================================

function checkPuzzleAnswer(userValue, node, puzzleType) {
    const cleanValue = userValue.trim().toUpperCase();
    
    addBubble(userValue, 'player');
    saveChatMessage(userValue, 'player');
    
    console.log(`🧩 Vérification réponse pour ${puzzleType}:`, cleanValue);
    console.log("✅ Réponses acceptées:", node.correctAnswers);
    
    if (node.correctAnswers.includes(cleanValue)) {
        console.log("✅ Réponse correcte !");
        
        // ✅ CORRECTION : Vider les contrôles immédiatement
        chatControls.innerHTML = '';
        
        // ✅ Mettre à jour le flag correspondant
        gameState.flags[`city_${currentCityId}_${puzzleType}_solved`] = true;
        saveGame();
        
        console.log(`🎯 Flag mis à jour: city_${currentCityId}_${puzzleType}_solved = true`);
        
        // Continuer vers le nœud de succès
        processDialogueNode(node.successNext);
    } else {
        console.log("❌ Réponse incorrecte");
        
        // Afficher le message d'échec
        setTimeout(() => {
            const failMessage = node.failText || "Ce n'est pas ça.";
            addBubble(failMessage, node.sender);
            saveChatMessage(failMessage, node.sender);
        }, 800);
    }
}

// ==========================================
// AFFICHAGE DES BULLES
// ==========================================

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

function calculateTypingTime(text) {
    const charCount = text.length;
    const time = (charCount / 50) * TYPING_SPEED_MS_PER_50_CHARS;
    return Math.max(500, time);
}

function playSoundNewMessage() {
    soundNewMessage.currentTime = 0;
    soundNewMessage.play().catch(e => console.log("Son désactivé par le navigateur"));
}

function playSoundTyping() {
    soundTyping.currentTime = 0;
    soundTyping.play().catch(e => console.log("Son désactivé par le navigateur"));
}

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

function saveChatMessage(text, sender, imageUrl = null) {
    const chatKey = `city_${currentCityId}`;
    
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

// ==========================================
// ZOOM IMAGE
// ==========================================

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
