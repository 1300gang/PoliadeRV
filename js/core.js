console.log("🎮 App démarrée - Version Multi-Target");

// ==========================================
// ÉTAT DU JEU
// ==========================================

let gameState = {
    hasCompletedTutorial: false,
    currentCityIndex: 0,
    flags: {},
    chatHistory: {},
    collectedLetters: {}
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
        
        if (gameState.hasCompletedTutorial) {
            loadCity(gameState.currentCityIndex);
            showScreen('screen-hub');
            return;
        }
    }
    showScreen('screen-splash');
}

// ==========================================
// NAVIGATION (ÉCRANS)
// ==========================================

function showScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (!screen) {
        console.error(`❌ Écran non trouvé : ${screenId}`);
        return;
    }
    
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });
    screen.classList.add('active');

    const mainHeader = document.getElementById('main-header');
    if (mainHeader) {
        if (screenId === 'screen-splash') {
            mainHeader.classList.add('hidden');
        } else {
            mainHeader.classList.remove('hidden');
        }
    }

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

    if (targetIndex < 0) targetIndex = totalCities - 1;
    if (targetIndex >= totalCities) targetIndex = 0;

    gameState.currentCityIndex = targetIndex;
    const cityData = gameData.cities[targetIndex];

    console.log("🏙️ Chargement Ville :", cityData.name);

    uiCityTitle.innerText = cityData.name;
    uiCityBg.innerText = "Illustration : " + cityData.name;
    
    saveGame();
}

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
// DÉMARRAGE
// ==========================================

loadGame();