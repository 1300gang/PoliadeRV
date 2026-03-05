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

let previousScreen = 'screen-hub'; // ✅ Tracking de l'écran précédent

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
        
        // ✅ CORRECTION : Toujours vérifier si le tutoriel est complété
        if (gameState.hasCompletedTutorial) {
            loadCity(gameState.currentCityIndex);
            showScreen('screen-hub');
            return;
        }
    }
    // Si pas de sauvegarde ou tutoriel non complété
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
    
    // Sauvegarder l'écran actuel avant de changer
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen && currentScreen.id !== 'modal-chat') {
        previousScreen = currentScreen.id;
    }
    
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    screen.classList.add('active');
    screen.classList.remove('hidden');
    scrollToTopOnScreenChange(); // ✅ Appeler pour défiler en haut

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
    // Circuit SPA : Splash -> Comic -> Tuto -> Hub -> AR
    if (!gameState.hasCompletedTutorial) {
        showScreen('screen-tuto');
    } else {
        showScreen('screen-hub');
    }
});

// Ajout navigation Hub -> AR
document.getElementById('btn-activate-ar').addEventListener('click', () => {
    showScreen('screen-ar');
});

// Ajout navigation AR -> Hub (bouton quitter)
document.getElementById('btn-quit-ar').addEventListener('click', () => {
    showScreen('screen-hub');
});

// Ajout navigation Hub -> Chat
document.getElementById('btn-chat').addEventListener('click', () => {
    document.getElementById('modal-chat').classList.remove('hidden');
});

// Ajout fermeture du chat
document.getElementById('btn-close-chat').addEventListener('click', () => {
    document.getElementById('modal-chat').classList.add('hidden');
});

// Ajout bouton pour fermer le tiroir droit
document.getElementById('btn-close-drawer-right').addEventListener('click', () => {
    document.getElementById('drawer-right').classList.remove('open');
    document.getElementById('drawer-backdrop').classList.add('hidden');
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
    // ✅ NOUVEAU : Générer dynamiquement le menu des villes
    generateCityMenu();
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

// ✅ NOUVEAU : Générer le menu de navigation des villes
function generateCityMenu() {
    const menuList = leftDrawer.querySelector('ul');
    if (!menuList) return;
    
    // Vider le menu actuel
    menuList.innerHTML = '';
    
    // Ajouter les options de menu classiques
    const profileLi = document.createElement('li');
    profileLi.innerText = 'Profil';
    profileLi.onclick = () => {
        alert('Fonctionnalité Profil à venir');
        closeAllDrawers();
    };
    menuList.appendChild(profileLi);
    
    const settingsLi = document.createElement('li');
    settingsLi.innerText = 'Paramètres';
    settingsLi.onclick = () => {
        alert('Fonctionnalité Paramètres à venir');
        closeAllDrawers();
    };
    menuList.appendChild(settingsLi);
    
    // Séparateur
    const separatorLi = document.createElement('li');
    separatorLi.innerHTML = '<hr style="border: 1px solid #ccc; margin: 10px 0;">';
    menuList.appendChild(separatorLi);
    
    // Titre section villes
    const citiesTitleLi = document.createElement('li');
    citiesTitleLi.innerHTML = '<strong>🏙️ Villes disponibles</strong>';
    citiesTitleLi.style.cursor = 'default';
    menuList.appendChild(citiesTitleLi);
    
    // Ajouter toutes les villes
    if (gameData && gameData.cities) {
        gameData.cities.forEach((city, index) => {
            const cityLi = document.createElement('li');
            
            // Indicateur si c'est la ville actuelle
            const isCurrent = index === gameState.currentCityIndex;
            const indicator = isCurrent ? '➤ ' : '';
            
            // Indicateur si la ville est complétée
            const isComplete = gameState.flags[`city_${city.id}_complete`];
            const statusIcon = isComplete ? ' ✅' : '';
            
            cityLi.innerText = `${indicator}${city.name}${statusIcon}`;
            cityLi.style.cursor = 'pointer';
            cityLi.style.paddingLeft = '20px';
            
            if (isCurrent) {
                cityLi.style.fontWeight = 'bold';
                cityLi.style.color = '#007bff';
            }
            
            cityLi.onclick = () => {
                loadCity(index);
                closeAllDrawers();
                showScreen('screen-hub');
            };
            
            menuList.appendChild(cityLi);
        });
    }
    
    // Séparateur
    const separator2Li = document.createElement('li');
    separator2Li.innerHTML = '<hr style="border: 1px solid #ccc; margin: 10px 0;">';
    menuList.appendChild(separator2Li);
    
    // Crédits
    const creditsLi = document.createElement('li');
    creditsLi.innerText = 'Crédits';
    creditsLi.onclick = () => {
        alert('Fonctionnalité Crédits à venir');
        closeAllDrawers();
    };
    menuList.appendChild(creditsLi);
}

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
        // ✅ CORRECTION : Marquer définitivement le tutoriel comme complété
        gameState.hasCompletedTutorial = true;
        saveGame();
        
        tutoInput.value = '';
        loadCity(0);
        showScreen('screen-hub');
        
        console.log("✅ Tutoriel complété et sauvegardé définitivement");
    } else {
        alert("Ce n'est pas ça. Cherchez encore avec le téléphone !");
        tutoInput.value = '';
    }
});

// ==========================================
// DÉMARRAGE
// ==========================================

loadGame();

// --- GESTION DU DÉFILEMENT ---
function scrollToTopOnScreenChange() {
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen) {
        activeScreen.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}
