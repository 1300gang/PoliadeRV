/* ============================================
   DONNÉES DU JEU - VERSION CORRIGÉE MULTI-TARGET
   ============================================ */

const gameData = {
    
    // === CONFIGURATION DES PERSONNAGES ===
    characters: {
        arron: {
            name: "Arron",
            avatar: "css/assets/images/avatar_aron.png",
            color: "#4A90E2",
            bubbleClass: "bubble-arron"
        },
        professeur: {
            name: "Professeur",
            avatar: "css/assets/images/avatar_bene.png",
            color: "#7B68EE",
            bubbleClass: "bubble-professeur"
        }
    },

    // === CONFIGURATION DES VILLES ===
    cities: [
        // ---------------------------------------------------------
        // VILLE 1 : La Grande Place
        // ---------------------------------------------------------
        {
            id: 0,
            name: "La Grande Place",
            
            assets: {
                background: "assets/images/ville_01_bg.png",
                title: "assets/images/ville_01_titre.png"
            },

            arScene: {
                // IMPORTANT : Ce fichier doit être compilé avec 3 images !
                // Image 1 = Index 0 (Vision)
                // Image 2 = Index 1 (Audio)
                // Image 3 = Index 2 (Touch)
                targetFile: "assets/target/targets.mind", 
                
                // CIBLE 0 : VISION
                vision: {
                    targetIndex: 0,
                    name: "La Table Mystérieuse",
                    model: "assets/target/table.glb",
                    scale: "1 1 1",
                    position: "0 0 0",
                    discoveryMessage: "🎯 Vous avez trouvé la Table ! Arron a un message pour vous.",
                    flagKey: "city_0_vision_found"
                },
                
                // CIBLE 1 : AUDIO
                audio: {
                    targetIndex: 1,
                    name: "Le Marché Sonore",
                    // Placeholder (Ours) ou ton propre modèle
                    model: "assets/target/table.glb", 
                    scale: "0.5 0.5 0.5",
                    position: "0 0 0",
                    audioFile: "assets/target/audi.mp3",
                    discoveryMessage: "🔊 Indice audio activé ! Écoutez attentivement...",
                    flagKey: "city_0_audio_found"
                },
                
                // CIBLE 2 : TOUCH (Lettres)
                touch: {
                    targetIndex: 2,
                    name: "Les Lettres Cachées",
                    objects: [
                        { id: "obj1", model: "assets/target/table.glb", letter: "T", position: "-1 0 0", scale: "0.3 0.3 0.3" },
                        { id: "obj2", model: "assets/target/table.glb", letter: "A", position: "0 0 0", scale: "0.3 0.3 0.3" },
                        { id: "obj3", model: "assets/target/table.glb", letter: "B", position: "1 0 0", scale: "0.3 0.3 0.3" },
                        { id: "obj4", model: "assets/target/table.glb", letter: "L", position: "0 1 0", scale: "0.3 0.3 0.3" },
                        { id: "obj5", model: "assets/target/table.glb", letter: "E", position: "0 -1 0", scale: "0.3 0.3 0.3" }
                    ],
                    secretWord: "TABLE",
                    discoveryMessage: "✨ Lettre récupérée ! Continuez à explorer.",
                    completeMessage: "🎉 Vous avez trouvé toutes les lettres ! Le mot est : TABLE",
                    flagKey: "city_0_touch_complete"
                }
            },

            dialogues: {
                intro: "intro_ville_01",
                afterVision: "puzzle_vision_01",
                afterAudio: "puzzle_audio_01",
                afterTouch: "puzzle_touch_01",
                complete: "fin_ville_01"
            }
        },

        // ---------------------------------------------------------
        // VILLE 2 : Le Vieux Port
        // ---------------------------------------------------------
        {
            id: 1,
            name: "Le Vieux Port",
            
            assets: {
                background: "assets/images/ville_02_bg.png",
                title: "assets/images/ville_02_titre.png"
            },

            arScene: {
                // Tu peux utiliser le même fichier targets.mind pour tester, 
                // ou en créer un autre "targets_ville2.mind" plus tard.
                targetFile: "assets/target/targets.mind",
                
                vision: {
                    targetIndex: 0,
                    name: "L'Ancre Rouillée",
                    model: "assets/target/table.glb",
                    scale: "1.2 1.2 1.2",
                    position: "0 0 0",
                    discoveryMessage: "⚓ L'ancre vous révèle un secret...",
                    flagKey: "city_1_vision_found"
                },
                
                audio: {
                    targetIndex: 1,
                    name: "Le Chant des Vagues",
                    model: "assets/target/table.glb",
                    scale: "1 1 1",
                    position: "0 0 0",
                    audioFile: "assets/target/audi.mp3",
                    discoveryMessage: "🌊 Les vagues murmurent un indice...",
                    flagKey: "city_1_audio_found"
                },
                
                touch: {
                    targetIndex: 2,
                    name: "Les Coquillages",
                    objects: [
                        { id: "obj1", model: "assets/target/table.glb", letter: "A", position: "-1.5 0 0", scale: "0.3 0.3 0.3" },
                        { id: "obj2", model: "assets/target/table.glb", letter: "N", position: "-0.5 0 0", scale: "0.3 0.3 0.3" },
                        { id: "obj3", model: "assets/target/table.glb", letter: "C", position: "0.5 0 0", scale: "0.3 0.3 0.3" },
                        { id: "obj4", model: "assets/target/table.glb", letter: "R", position: "1.5 0 0", scale: "0.3 0.3 0.3" },
                        { id: "obj5", model: "assets/target/table.glb", letter: "E", position: "0 1 0", scale: "0.3 0.3 0.3" }
                    ],
                    secretWord: "ANCRE",
                    discoveryMessage: "🐚 Coquillage récupéré !",
                    completeMessage: "🎉 Le mot secret : ANCRE",
                    flagKey: "city_1_touch_complete"
                }
            },

            dialogues: {
                intro: "intro_ville_02",
                afterVision: "puzzle_vision_02",
                afterAudio: "puzzle_audio_02",
                afterTouch: "puzzle_touch_02",
                complete: "fin_ville_02"
            }
        },

        // ---------------------------------------------------------
        // VILLE 3 : La Tour
        // ---------------------------------------------------------
        {
            id: 2,
            name: "La Tour",
            
            assets: {
                background: "assets/images/ville_03_bg.png",
                title: "assets/images/ville_03_titre.png"
            },

            arScene: {
                targetFile: "assets/target/targets.mind",
                
                vision: {
                    targetIndex: 0,
                    name: "Le Sommet Nuageux",
                    model: "assets/target/table.glb",
                    scale: "1.5 1.5 1.5",
                    position: "0 1 0",
                    discoveryMessage: "☁️ Un nuage porte un message...",
                    flagKey: "city_2_vision_found"
                },
                
                audio: {
                    targetIndex: 1,
                    name: "Le Vent Siffleur",
                    model: "assets/target/table.glb",
                    scale: "1 1 1",
                    position: "0 0 0",
                    audioFile: "assets/target/audi.mp3",
                    discoveryMessage: "💨 Le vent chuchote un secret...",
                    flagKey: "city_2_audio_found"
                },
                
                touch: {
                    targetIndex: 2,
                    name: "Les Briques Gravées",
                    objects: [
                        { id: "obj1", model: "assets/target/table.glb", letter: "N", position: "-1 0 0", scale: "0.4 0.4 0.4" },
                        { id: "obj2", model: "assets/target/table.glb", letter: "U", position: "0 0 0", scale: "0.4 0.4 0.4" },
                        { id: "obj3", model: "assets/target/table.glb", letter: "A", position: "1 0 0", scale: "0.4 0.4 0.4" },
                        { id: "obj4", model: "assets/target/table.glb", letter: "G", position: "0 1 0", scale: "0.4 0.4 0.4" },
                        { id: "obj5", model: "assets/target/table.glb", letter: "E", position: "0 -1 0", scale: "0.4 0.4 0.4" }
                    ],
                    secretWord: "NUAGE",
                    discoveryMessage: "🧱 Brique déchiffrée !",
                    completeMessage: "🎉 Le mot secret : NUAGE",
                    flagKey: "city_2_touch_complete"
                }
            },

            dialogues: {
                intro: "intro_ville_03",
                afterVision: "puzzle_vision_03",
                afterAudio: "puzzle_audio_03",
                afterTouch: "puzzle_touch_03",
                complete: "fin_ville_03"
            }
        }
    ],

    // === DIALOGUES (inchangés, mais inclus pour la complétude) ===
    dialogues: {
        
        "intro_ville_01": {
            type: "text",
            sender: "arron",
            text: "Bienvenue à La Grande Place ! Je suis Arron, ton guide.",
            next: "intro_ville_01_suite"
        },
        "intro_ville_01_suite": {
            type: "text",
            sender: "professeur",
            text: "Et moi, le Professeur. Nous allons t'aider à résoudre les énigmes de cette ville.",
            next: "intro_ville_01_mission"
        },
        "intro_ville_01_mission": {
            type: "text",
            sender: "arron",
            text: "Active la Réalité Augmentée et pars à la recherche de 3 indices cachés dans la ville. Commence par chercher la Table Mystérieuse !",
            next: null
        },

        "puzzle_vision_01": {
            type: "text",
            sender: "arron",
            text: "Tu as trouvé la table ! Impressionnant. Maintenant, dis-moi : quel objet as-tu vu ?",
            next: "enigme_vision_01"
        },
        "enigme_vision_01": {
            type: "puzzle",
            sender: "arron",
            text: "Entre le nom de l'objet que tu as scanné :",
            correctAnswers: ["TABLE", "UNE TABLE", "LA TABLE"],
            successNext: "bravo_vision_01",
            failText: "Mmh, ce n'est pas ça. Retourne voir en RA si tu as un doute."
        },
        "bravo_vision_01": {
            type: "text",
            sender: "professeur",
            text: "Exact ! Premier indice validé. Retourne en RA pour trouver le prochain indice : cherche un son à écouter.",
            next: null
        },

        "puzzle_audio_01": {
            type: "text",
            sender: "professeur",
            text: "J'ai entendu dire que tu as écouté quelque chose d'intéressant...",
            next: "enigme_audio_01"
        },
        "enigme_audio_01": {
            type: "puzzle",
            sender: "professeur",
            text: "Quelle couleur as-tu entendue dans le message ?",
            correctAnswers: ["BLEU", "LE BLEU", "BLUE"],
            successNext: "bravo_audio_01",
            failText: "Non, écoute plus attentivement le message audio."
        },
        "bravo_audio_01": {
            type: "text",
            sender: "arron",
            text: "Bien joué ! Deuxième indice validé. Il reste un dernier défi : trouve les lettres cachées en RA !",
            next: null
        },

        "puzzle_touch_01": {
            type: "text",
            sender: "arron",
            text: "Tu as collecté toutes les lettres ! Quel mot as-tu formé ?",
            next: "enigme_touch_01"
        },
        "enigme_touch_01": {
            type: "puzzle",
            sender: "professeur",
            text: "Entre le mot secret formé avec les lettres :",
            correctAnswers: ["TABLE"],
            successNext: "bravo_touch_01",
            failText: "Vérifie les lettres que tu as collectées."
        },
        "bravo_touch_01": {
            type: "text",
            sender: "professeur",
            text: "Parfait ! Tu as résolu toutes les énigmes de La Grande Place.",
            next: "fin_ville_01"
        },

        "fin_ville_01": {
            type: "end_level",
            sender: "arron",
            text: "Direction le Vieux Port ! Prépare-toi à de nouvelles aventures.",
            next: null
        },

        // DIALOGUES VILLES 2 & 3
        "intro_ville_02": { type: "text", sender: "professeur", text: "Bienvenue au Vieux Port !", next: "intro_ville_02_suite" },
        "intro_ville_02_suite": { type: "text", sender: "arron", text: "Active la RA et explore !", next: null },
        "puzzle_vision_02": { type: "text", sender: "arron", text: "L'ancre... Qu'as-tu vu ?", next: "enigme_vision_02" },
        "enigme_vision_02": { type: "puzzle", sender: "professeur", text: "Quel objet ?", correctAnswers: ["ANCRE", "L'ANCRE", "UNE ANCRE"], successNext: "bravo_vision_02", failText: "Retourne voir." },
        "bravo_vision_02": { type: "text", sender: "arron", text: "Bien ! Continue en RA.", next: null },
        "puzzle_audio_02": { type: "text", sender: "professeur", text: "Les vagues... Quelle direction ?", next: "enigme_audio_02" },
        "enigme_audio_02": { type: "puzzle", sender: "professeur", text: "Direction :", correctAnswers: ["NORD", "LE NORD"], successNext: "bravo_audio_02", failText: "Réécoute." },
        "bravo_audio_02": { type: "text", sender: "arron", text: "Cap au Nord ! Retourne en RA.", next: null },
        "puzzle_touch_02": { type: "text", sender: "professeur", text: "Quel mot ?", next: "enigme_touch_02" },
        "enigme_touch_02": { type: "puzzle", sender: "arron", text: "Le mot :", correctAnswers: ["ANCRE"], successNext: "bravo_touch_02", failText: "Vérifie." },
        "bravo_touch_02": { type: "text", sender: "professeur", text: "Excellent !", next: "fin_ville_02" },
        "fin_ville_02": { type: "end_level", sender: "arron", text: "En route vers La Tour !", next: null },

        "intro_ville_03": { type: "text", sender: "arron", text: "La Tour...", next: "intro_ville_03_suite" },
        "intro_ville_03_suite": { type: "text", sender: "professeur", text: "Active la RA !", next: null },
        "puzzle_vision_03": { type: "text", sender: "professeur", text: "Un nuage... Qu'as-tu vu ?", next: "enigme_vision_03" },
        "enigme_vision_03": { type: "puzzle", sender: "arron", text: "Décris :", correctAnswers: ["NUAGE", "LE NUAGE", "UN NUAGE"], successNext: "bravo_vision_03", failText: "Retourne." },
        "bravo_vision_03": { type: "text", sender: "professeur", text: "Parfait ! Continue.", next: null },
        "puzzle_audio_03": { type: "text", sender: "arron", text: "Le vent... Quel mot ?", next: "enigme_audio_03" },
        "enigme_audio_03": { type: "puzzle", sender: "professeur", text: "Qu'as-tu entendu ?", correctAnswers: ["VENT", "LE VENT"], successNext: "bravo_audio_03", failText: "Réécoute." },
        "bravo_audio_03": { type: "text", sender: "arron", text: "Bien ! Dernière énigme en RA.", next: null },
        "puzzle_touch_03": { type: "text", sender: "professeur", text: "Quel mot ?", next: "enigme_touch_03" },
        "enigme_touch_03": { type: "puzzle", sender: "arron", text: "Le mot final :", correctAnswers: ["NUAGE"], successNext: "bravo_touch_03", failText: "Vérifie." },
        "bravo_touch_03": { type: "text", sender: "professeur", text: "Incroyable ! Tu as tout résolu !", next: "fin_ville_03" },
        "fin_ville_03": { type: "end_level", sender: "arron", text: "Félicitations ! Aventure terminée.", next: null }
    }
};