// ==========================================
// MOTEUR DE CONVERSATION (CHAT)
// ==========================================

const chatModal = document.getElementById('modal-chat');
const chatHistory = document.getElementById('chat-history');
const chatControls = document.getElementById('chat-controls');
const btnCloseChat = document.getElementById('btn-close-chat');
const typingIndicator = document.getElementById('typing-indicator');
const btnChatActivateAR = document.getElementById('btn-chat-activate-ar');

// Sons
const soundNewMessage = new Audio('css/assets/audio/notif.mp3');
const soundTyping = new Audio('css/assets/audio/texting.mp3');

let currentDialogueId = null;
let isTyping = false;

const TYPING_SPEED_MS_PER_50_CHARS = 1000;

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

    chatHistory.innerHTML = '';
    if (gameState.chatHistory[chatKey]) {
        gameState.chatHistory[chatKey].forEach(msg => {
            addBubbleToHistory(msg.text, msg.sender, msg.imageUrl);
        });
    }

    chatModal.classList.remove('hidden');

    const hasHistory = gameState.chatHistory[chatKey] && gameState.chatHistory[chatKey].length > 0;
    
    let startNodeID = determineDialogueNode(cityId);
    console.log("🎬 Dialogue déterminé:", startNodeID);
    
    const isIntroAndHasHistory = (startNodeID === city.dialogues.intro) && hasHistory;
    
    if (!isIntroAndHasHistory) {
        console.log("▶️ Lancement du dialogue:", startNodeID);
        processDialogueNode(startNodeID);
    } else {
        console.log("📜 Intro déjà vue, pas de relance");
    }
}

// --- LOGIQUE : Déterminer quel dialogue ouvrir ---
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
    
    if (gameState.flags[`city_${cityId}_complete`]) {
        console.log("✅ Ville complète détectée");
        return city.dialogues.complete;
    }
    
    if (gameState.flags[`city_${cityId}_touch_complete`] && 
        !gameState.flags[`city_${cityId}_touch_solved`]) {
        console.log("🔤 Touch trouvé, attente résolution");
        return city.dialogues.afterTouch;
    }
    
    if (gameState.flags[`city_${cityId}_audio_solved`] && 
        !gameState.flags[`city_${cityId}_touch_complete`]) {
        console.log("✅ Audio résolu, retour en RA pour Touch");
        return city.dialogues.afterAudio;
    }
    
    if (gameState.flags[`city_${cityId}_audio_found`] && 
        !gameState.flags[`city_${cityId}_audio_solved`]) {
        console.log("🔊 Audio trouvé, attente résolution");
        return city.dialogues.afterAudio;
    }
    
    if (gameState.flags[`city_${cityId}_vision_solved`] && 
        !gameState.flags[`city_${cityId}_audio_found`]) {
        console.log("✅ Vision résolu, retour en RA pour Audio");
        return city.dialogues.afterVision;
    }
    
    if (gameState.flags[`city_${cityId}_vision_found`] && 
        !gameState.flags[`city_${cityId}_vision_solved`]) {
        console.log("👁️ Vision trouvé, attente résolution");
        return city.dialogues.afterVision;
    }
    
    console.log("🆕 Aucun flag, dialogue intro");
    return city.dialogues.intro;
}

function resetCityChat(cityId) {
    const chatKey = `city_${cityId}`;
    gameState.chatHistory[chatKey] = [];
    saveGame();
    console.log("🗑️ Chat réinitialisé pour ville", cityId);
}

btnCloseChat.addEventListener('click', () => {
    chatModal.classList.add('hidden');
});

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

    if (node.text) {
        showTypingIndicator(node.sender);
        
        const typingTime = calculateTypingTime(node.text);
        
        setTimeout(() => {
            hideTypingIndicator();
            addBubble(node.text, node.sender);
            playSoundNewMessage();
            
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
    
    else if (node.next) {
        setTimeout(() => {
            processDialogueNode(node.next);
        }, 1500);
    }

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
        const cityId = gameState.currentCityIndex;
        const currentNode = currentDialogueId;
        
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