// Virtual Canvas Dimensions
const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 720;

// Canvas Initialization
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.style.touchAction = "none";

// Engine Game States
const STATE_LOADING = -2;
const STATE_WELCOME = -1;
const STATE_LOBBY = 0;
const STATE_DOKDOKMA = 1;
const STATE_KADANG = 2;
const STATE_ACHIEVEMENTS = 3;
const STATE_BADGES = 4;
const STATE_ARTIFACTS = 5;

let currentState = STATE_LOADING;
let loadingProgress = 0;

// Platform Mode: "PHONE" or "PC"
let currentDeviceMode = (window.innerWidth <= 800 || 'ontouchstart' in window) ? "PHONE" : "PC";

// Cultural Artifact & Achievement Database for Rewards
const CULTURAL_ARTIFACTS = {
    EASY: [
        { name: "Banga", icon: "pottery", desc: "A traditional earthenware clay pot handcrafted in Pasil, Kalinga, used for cooking and storing water." },
        { name: "Lingling-o", icon: "pendant", desc: "An indigenous fertility amulet and pendant crafted from brass, bronze, or jade." },
        { name: "Winnowing Basket", icon: "basket", desc: "A flat, circular woven bamboo tray used to separate grain husks from rice." },
        { name: "Agaw-ed", icon: "woven", desc: "A traditional woven sleeping mat made from reed or palm leaves." },
        { name: "Kalinga Headband", icon: "headband", desc: "A woven cotton band adorned with traditional red, black, and white threads." },
        { name: "Banga Rattan Ring", icon: "ring", desc: "A woven ring cushion placed underneath clay pots for stability." },
        { name: "Kallaleng", icon: "flute", desc: "A bamboo nose flute played during courtship or quiet mountain moments." },
        { name: "Inabel Pouch", icon: "pouch", desc: "A small hand-woven textile bag used to carry personal items." },
        { name: "Siok", icon: "utensil", desc: "A hand-carved wooden utensil featuring intricate tribal motifs." },
        { name: "Coconut Ladle", icon: "ladle", desc: "A traditional wooden-handled spoon made from polished coconut shells." }
    ],
    MEDIUM: [
        { name: "Pasiking", icon: "backpack", desc: "An indigenous backpack intricately woven from split rattan and bamboo." },
        { name: "Ilik (Bolo)", icon: "bolo", desc: "A sturdy single-edged machete used for clearing paths and farming." },
        { name: "Gansa", icon: "gong", desc: "A flat bronze musical instrument beaten during regional celebrations." },
        { name: "Ukop (Rain Cape)", icon: "cape", desc: "A traditional weather garment woven from dried palm fronds." },
        { name: "Akil (Bamboo Pipe)", icon: "bamboo", desc: "A cylindrical bamboo container used to carry spring water or wine." },
        { name: "Dinalag Stool", icon: "stool", desc: "A sturdy low chair carved from a single piece of hardwood." },
        { name: "Batek Case", icon: "cylinder", desc: "A carved wooden cylinder used by traditional tattoo practitioners." },
        { name: "Rattan Fire Kit", icon: "firekit", desc: "A traditional friction-based fire starter bundle in a woven case." },
        { name: "Bobo (Fishing Trap)", icon: "fishtrap", desc: "A funnel-shaped bamboo trap placed in rivers to catch mountain fish." },
        { name: "Kalasag Hat", icon: "hat", desc: "A reinforced woven sun hat worn during long hours of farming." }
    ],
    HARD: [
        { name: "Chilan (Spear)", icon: "spear", desc: "A forged metal blade with a carved wooden shaft representing tribal protection." },
        { name: "Kalasag Shield", icon: "shield", desc: "A rectangular carved wooden shield featuring geometric relief patterns." },
        { name: "Kone-ad Beads", icon: "beads", desc: "Precious heirloom necklaces made of agate, shell, and brass beads." },
        { name: "Aliwa (Battle Axe)", icon: "axe", desc: "A defensive weapon featuring a crescent-shaped steel blade and hooked pick." },
        { name: "Ba-ag (G-String)", icon: "textile", desc: "A hand-woven traditional loincloth dyed with sacred ancestral motifs." },
        { name: "Kallong Armlet", icon: "armlet", desc: "Heavy metallic arm rings worn by respected community leaders." },
        { name: "Pundung Token", icon: "token", desc: "A sacred heirloom artifact exchanged to seal a formal Bodong peace pact." },
        { name: "Kaping Headdress", icon: "headdress", desc: "An ornate ceremonial crown adorned with wild boar tusks and feathers." },
        { name: "Tupil Quiver", icon: "quiver", desc: "An intricately carved bamboo tube case designed to hold hunting darts." },
        { name: "Ancestral Guardian", icon: "figurine", desc: "A miniature carved wooden guardian figure placed near doorways to ward off spirits." }
    ]
};

// Player Unlocked Achievements & Artifact Tracking
const playerAchievements = {
    EASY: [],
    MEDIUM: [],
    HARD: []
};

const PERSONAL_BESTS_STORAGE_KEY = "kalingaLegendsPersonalBestTimes";
const personalBestTimes = loadPersonalBestTimes();

function loadPersonalBestTimes() {
    const bests = {
        dokdokma: { EASY: null, MEDIUM: null, HARD: null },
        kadang: null
    };

    try {
        const saved = localStorage.getItem(PERSONAL_BESTS_STORAGE_KEY);
        if (!saved) return bests;

        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
            for (const difficulty of Object.keys(bests.dokdokma)) {
                const time = parsed.dokdokma && parsed.dokdokma[difficulty];
                if (Number.isInteger(time) && time >= 0) bests.dokdokma[difficulty] = time;
            }

            if (Number.isInteger(parsed.kadang) && parsed.kadang >= 0) {
                bests.kadang = parsed.kadang;
            }
        }
    } catch (error) {
        console.warn("Could not load personal best times.", error);
    }

    return bests;
}

function recordDokdokmaBest(seconds, difficulty) {
    const previousBest = personalBestTimes.dokdokma[difficulty];
    if (previousBest !== null && seconds >= previousBest) return false;

    personalBestTimes.dokdokma[difficulty] = seconds;
    savePersonalBestTimes();
    return true;
}

function recordKadangBest(seconds) {
    if (personalBestTimes.kadang !== null && seconds >= personalBestTimes.kadang) return false;

    personalBestTimes.kadang = seconds;
    savePersonalBestTimes();
    return true;
}

function savePersonalBestTimes() {
    try {
        localStorage.setItem(PERSONAL_BESTS_STORAGE_KEY, JSON.stringify(personalBestTimes));
    } catch (error) {
        console.warn("Could not save personal best times.", error);
    }
}

let currentRunArtifact = null;

// Dedicated Warrior Badges Interactive State Sub-Interface
const badgeInterface = {
    selectedBadgeIndex: null
};

// Image Asset Preloading and Fallbacks
const bgImg = new Image();
bgImg.onerror = () => {
    if (!bgImg.src.endsWith("mountain.png")) {
        bgImg.src = "mountain.png";
    } else {
        console.warn("Mountain background image missing; rendering background fallback.");
    }
};
bgImg.src = "mountain.jpg";

const lobbyBgImg = new Image();
lobbyBgImg.onerror = () => {
    console.warn("lobby.jpg missing; falling back to default background.");
};
lobbyBgImg.src = "res/minigames/lobby.jpg";

const pigImg = new Image();
pigImg.onerror = () => console.warn("pig.png not found, falling back to shape.");
pigImg.src = "res/minigames/pig.png";

const playerImg = new Image();
playerImg.onerror = () => console.warn("player.png not found, falling back to shape.");
playerImg.src = "res/minigames/player.png";

const player2Img = new Image();
player2Img.onerror = () => console.warn("player2.png not found, falling back to shape.");
player2Img.src = "res/minigames/player2.png";

const player3Img = new Image();
player3Img.onerror = () => console.warn("player3.png not found, falling back to shape.");
player3Img.src = "res/minigames/player3.png";

// Kadang-Kadang character back-view sprites.
const kadangPlayer1Img = new Image();
kadangPlayer1Img.onerror = () => console.warn("player8 image not found, falling back.");
kadangPlayer1Img.src = "res/minigames/player8.png";

const kadangPlayer2Img = new Image();
kadangPlayer2Img.onerror = () => console.warn("player9 image not found, falling back.");
kadangPlayer2Img.src = "res/minigames/player9.png";

const playerRunImg = new Image();
playerRunImg.onerror = () => console.warn("player_run.png not found, falling back to static player.");
playerRunImg.src = "res/minigames/player_run.png";

const loadingImg = new Image();
loadingImg.onerror = () => {
    if (!loadingImg.src.endsWith("loading.png")) {
        loadingImg.src = "loading.png";
    } else {
        console.warn("loading.jpg missing, using dark color fallback.");
    }
};
loadingImg.src = "res/minigames/loading.jpg";

// Audio Management System (Background Music Only)
const audioManager = {
    bgmMuted: false,
    track: new Audio("res/audio/song3.mp3"),
    init() {
        this.track.volume = 0.4;
        this.track.loop = true;
    },
    playBgm() {
        if (this.bgmMuted) return;
        if (this.track.paused) {
            this.track.play().catch(() => { });
        }
    },
    stopBgm() {
        this.track.pause();
        this.track.currentTime = 0;
    }
};
audioManager.init();

// DOM References
const menuBtn = document.getElementById("menu-btn");
const sideDrawer = document.getElementById("side-drawer");
const closeDrawerBtn = document.getElementById("close-drawer-btn");
const modalBackdrop = document.getElementById("modal-backdrop");

const minigameInfoModal = document.getElementById("minigame-info-modal");
const settingsModal = document.getElementById("settings-modal");
const exitModal = document.getElementById("exit-modal");

const btnLobby = document.getElementById("btn-lobby");
const btnSettings = document.getElementById("btn-settings");
const closeModalsBtns = document.querySelectorAll(".close-modal");

const btnQuitYes = document.getElementById("btn-quit-yes");
const btnQuitNo = document.getElementById("btn-quit-no");

const toggleBgmBtn = document.getElementById("btn-toggle-bgm");

const btnModePortrait = document.getElementById("btn-mode-portrait");
const btnModeLandscape = document.getElementById("btn-mode-landscape");
const phoneLobby = document.getElementById("phone-lobby");
const phoneRotatePrompt = document.getElementById("phone-rotate-prompt");
const phoneLoading = document.getElementById("phone-loading");
const narrowPortraitQuery = window.matchMedia("(orientation: portrait) and (max-width: 800px)");

// Setup Device Mode Buttons (Phone vs PC)
if (btnModePortrait) {
    btnModePortrait.textContent = "Phone Mode";
    btnModePortrait.addEventListener("click", () => {
        setDeviceMode("PHONE");
        closeDrawer();
    });
}
if (btnModeLandscape) {
    btnModeLandscape.textContent = "PC Mode";
    btnModeLandscape.addEventListener("click", () => {
        setDeviceMode("PC");
        closeDrawer();
    });
}

function setDeviceMode(mode) {
    currentDeviceMode = mode;
    if (btnModePortrait && btnModeLandscape) {
        if (mode === "PHONE") {
            btnModePortrait.classList.add("active");
            btnModeLandscape.classList.remove("active");
        } else {
            btnModeLandscape.classList.add("active");
            btnModePortrait.classList.remove("active");
        }
    }
    document.body.classList.remove("portrait-mode", "phone-mode", "landscape-mode");
    document.body.classList.add(mode === "PHONE" ? "phone-mode" : "landscape-mode");
}
setDeviceMode(currentDeviceMode);

function syncPhoneLayout() {
    const narrowPortrait = narrowPortraitQuery.matches;
    const showPhoneLobby = narrowPortrait &&
        (currentState === STATE_LOBBY || currentState === STATE_WELCOME);
    const showRotatePrompt = narrowPortrait &&
        currentState !== STATE_LOADING &&
        currentState !== STATE_LOBBY &&
        currentState !== STATE_WELCOME;
    const showLoading = narrowPortrait && currentState === STATE_LOADING;

    if (showPhoneLobby && currentState === STATE_WELCOME) {
        currentState = STATE_LOBBY;
    }

    const activeGame = currentState === STATE_DOKDOKMA
        ? dokdokma
        : currentState === STATE_KADANG ? kadang : null;
    if (activeGame && narrowPortrait) {
        if (activeGame.isCountingDown && !activeGame.phoneOrientationCountdownPaused) {
            if (activeGame.countdownInterval) clearInterval(activeGame.countdownInterval);
            activeGame.countdownInterval = null;
            activeGame.phoneOrientationCountdownPaused = true;
        } else if (!activeGame.isCountingDown &&
            !activeGame.isGameOver &&
            !activeGame.isPaused &&
            !activeGame.phoneOrientationPaused) {
            activeGame.isPaused = true;
            activeGame.pauseStartedAt = Date.now();
            activeGame.phoneOrientationPaused = true;
            if (currentState === STATE_DOKDOKMA) releaseDokTouchControls();
        }
    } else if (activeGame) {
        if (activeGame.phoneOrientationCountdownPaused) {
            activeGame.phoneOrientationCountdownPaused = false;
            if (activeGame.isCountingDown) activeGame.startCountdown();
        }
        if (activeGame.phoneOrientationPaused) {
            activeGame.startTime += Date.now() - activeGame.pauseStartedAt;
            activeGame.pauseStartedAt = 0;
            activeGame.isPaused = false;
            activeGame.phoneOrientationPaused = false;
        }
    }

    if (phoneLobby) phoneLobby.classList.toggle("hidden", !showPhoneLobby);
    if (phoneRotatePrompt) phoneRotatePrompt.classList.toggle("hidden", !showRotatePrompt);
    if (phoneLoading) phoneLoading.classList.toggle("hidden", !showLoading);
}

document.getElementById("phone-play-dokdokma").addEventListener("click", () => {
    requestFullscreenAndLandscape();
    openMinigameInfoModal("DOKDOKMA");
});
document.getElementById("phone-play-kadang").addEventListener("click", () => {
    requestFullscreenAndLandscape();
    openMinigameInfoModal("KADANG");
});
document.getElementById("phone-how-to-play").addEventListener("click", () => {
    requestFullscreenAndLandscape();
    openHowToPlaySelector();
});
document.getElementById("phone-achievements").addEventListener("click", () => {
    currentState = STATE_ACHIEVEMENTS;
});
document.getElementById("phone-artifacts").addEventListener("click", () => {
    currentState = STATE_ARTIFACTS;
});
document.getElementById("phone-return-lobby").addEventListener("click", () => {
    currentState = STATE_LOBBY;
    audioManager.playBgm();
});

// Inject side drawer menu buttons
(function injectSideDrawerMenuButtons() {
    if (!sideDrawer) return;

    const drawerList = sideDrawer.querySelector(".drawer-menu") || sideDrawer;
    const progressActions = document.getElementById("drawer-progress-actions");

    const navItems = [
        { id: "btn-menu-achievements", text: "Achievements", state: STATE_ACHIEVEMENTS },
        { id: "btn-menu-badges", text: "Warrior Badges", state: STATE_BADGES },
        { id: "btn-menu-artifacts", text: "Cultural Artifacts", state: STATE_ARTIFACTS }
    ];

    navItems.forEach(item => {
        let btn = document.getElementById(item.id);
        if (!btn) {
            btn = document.createElement("button");
            btn.id = item.id;
            btn.className = "drawer-btn";
            btn.textContent = item.text;

            if (progressActions) {
                progressActions.appendChild(btn);
            } else {
                drawerList.appendChild(btn);
            }
        }

        btn.addEventListener("click", () => {
            currentState = item.state;
            badgeInterface.selectedBadgeIndex = null;
            closeDrawer();
        });
    });
})();

if (toggleBgmBtn) {
    toggleBgmBtn.addEventListener("click", () => {
        audioManager.bgmMuted = !audioManager.bgmMuted;
        toggleBgmBtn.textContent = `AUDIO: ${audioManager.bgmMuted ? "OFF" : "ON"}`;
        if (audioManager.bgmMuted) {
            audioManager.stopBgm();
        } else {
            audioManager.playBgm();
        }
    });
}

const btnExitGame = { cx: 1220, cy: 45, r: 22 };
const LOBBY_CARDS = {
    dokdokma: { x: 290, y: 240, w: 280, h: 320 },
    kadang: { x: 710, y: 240, w: 280, h: 320 }
};
const LOBBY_ACTIONS = {
    howToPlay: { x: 290, y: 604, w: 210, h: 70 },
    achievements: { x: 535, y: 604, w: 210, h: 70 },
    artifacts: { x: 780, y: 604, w: 210, h: 70 }
};
const RESULT_ACTIONS = {
    replay: { x: 410, y: 492, w: 210, h: 84 },
    lobby: { x: 660, y: 492, w: 210, h: 84 }
};
const PAUSE_PANEL = { x: 420, y: 230, w: 440, h: 260 };
const PAUSE_ACTIONS = {
    resume: { x: 460, y: 362, w: 165, h: 88 },
    quit: { x: 655, y: 362, w: 165, h: 88 }
};

function isPointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function handleMinigameResultAction(x, y) {
    if (isPointInRect(x, y, RESULT_ACTIONS.replay)) {
        if (currentState === STATE_DOKDOKMA) {
            const difficulty = dokdokma.difficulty;
            const playerCount = dokdokma.activePlayersCount;
            dokdokma.reset(difficulty, playerCount, dokdokma.practiceMode, dokdokma.timedChallenge);
        } else {
            kadang.reset(kadang.mode);
        }
        return true;
    }

    if (isPointInRect(x, y, RESULT_ACTIONS.lobby)) {
        currentState = STATE_LOBBY;
        audioManager.playBgm();
        return true;
    }

    return false;
}

function handleMinigamePauseAction(x, y) {
    const isPaused = currentState === STATE_DOKDOKMA
        ? dokdokma.isPaused
        : currentState === STATE_KADANG && kadang.isPaused;
    if (!isPaused) return false;

    if (isPointInRect(x, y, PAUSE_ACTIONS.resume)) {
        const game = currentState === STATE_DOKDOKMA ? dokdokma : kadang;
        if (game.startTime > 0) game.startTime += Date.now() - game.pauseStartedAt;
        game.pauseStartedAt = 0;
        game.isPaused = false;
        return true;
    }

    if (isPointInRect(x, y, PAUSE_ACTIONS.quit)) {
        openMinigameInfoModal(currentState === STATE_DOKDOKMA ? "DOKDOKMA" : "KADANG");
        return true;
    }

    return true;
}

function openMinigameInfoModal(gameType) {
    const titleElem = document.getElementById("info-modal-title");
    const bodyElem = document.getElementById("info-modal-body");

    if (gameType === "DOKDOKMA") {
        titleElem.textContent = "DOKDOKMA (PIG CATCHING)";
        if (currentDeviceMode === "PHONE") {
            bodyElem.innerHTML = `
                <p><strong>Objective:</strong> Pursue and capture the escaped pig inside the wooden pen before stamina drains, or practice without pressure.</p>
                <p style="color: #E5A93C; font-weight: bold; margin-top: 8px;">📱 PHONE MODE INSTRUCTIONS:</p>
                <ul>
                    <li><strong>1 Player (Solo):</strong> Drag the left touch joystick to run. Tap the <strong>GRAB</strong> button on the right when near the pig.</li>
                    <li><strong>2 Players (Dual Mode):</strong> Player 1 controls the left joystick and left <strong>P1 GRAB</strong> button. Player 2 controls the right joystick and right <strong>P2 GRAB</strong> button!</li>
                    <li><strong style="color: #A34836;">Notice:</strong> 3-Player Co-op is supported on PC only due to mobile screen size limits.</li>
                </ul>
                <p style="color: #E5A93C; margin-top: 10px; font-weight: bold;">SELECT MODE:</p>
                <button class="modal-btn-action" id="modal-mode-1p" style="background: #3A6351;">1 PLAYER (SOLO)</button>
                <button class="modal-btn-action" id="modal-mode-2p" style="background: #2E5A78;">2 PLAYERS DUAL TOUCH</button>
                <button class="modal-btn-action" id="modal-mode-3p-disabled" style="background: #4A3E34; opacity: 0.6; cursor: not-allowed;">3 PLAYERS (PC ONLY)</button>
                <button class="modal-btn-action" id="modal-home-lobby" style="background: #4E3629; margin-top: 10px;">RETURN TO LOBBY</button>
            `;
        } else {
            bodyElem.innerHTML = `
                <p><strong>Objective:</strong> Pursue and capture the escaped pig inside the wooden pen before stamina drains, or practice without pressure.</p>
                <p style="color: #E5A93C; font-weight: bold; margin-top: 8px;">💻 PC MODE INSTRUCTIONS:</p>
                <ul>
                    <li><strong>1 Player (Solo):</strong> Use <code>WASD</code> keys to move, <code>SPACEBAR</code> to grab.</li>
                    <li><strong>2 Players Co-op:</strong> Player 1 uses <code>WASD</code> + <code>SPACEBAR</code>. Player 2 uses <code>Arrow Keys</code> + <code>ENTER</code> / Touch.</li>
                    <li><strong>3 Players Co-op:</strong> Player 1 uses <code>WASD</code>, Player 2 uses <code>Arrow Keys</code>, Player 3 uses <code>I J K L</code> keys!</li>
                </ul>
                <p style="color: #E5A93C; margin-top: 10px; font-weight: bold;">SELECT PLAYERS:</p>
                <button class="modal-btn-action" id="modal-mode-1p" style="background: #3A6351;">1 PLAYER (SOLO)</button>
                <button class="modal-btn-action" id="modal-mode-2p" style="background: #2E5A78;">2 PLAYERS CO-OP</button>
                <button class="modal-btn-action" id="modal-mode-3p" style="background: #8C5A32;">3 PLAYERS CO-OP</button>
                <button class="modal-btn-action" id="modal-home-lobby" style="background: #4E3629; margin-top: 10px;">RETURN TO LOBBY</button>
            `;
        }

        document.getElementById("modal-mode-1p").addEventListener("click", () => showDifficultySelector(1));
        document.getElementById("modal-mode-2p").addEventListener("click", () => showDifficultySelector(2));

        const btn3p = document.getElementById("modal-mode-3p");
        if (btn3p) {
            btn3p.addEventListener("click", () => showDifficultySelector(3));
        }

        const btn3pDisabled = document.getElementById("modal-mode-3p-disabled");
        if (btn3pDisabled) {
            btn3pDisabled.addEventListener("click", () => {
                alert("3 Players mode is only playable on PC with keyboard controls.");
            });
        }

        document.getElementById("modal-home-lobby").addEventListener("click", () => {
            closeAllModals();
            currentState = STATE_LOBBY;
            audioManager.playBgm();
        });
    } else if (gameType === "KADANG") {
        titleElem.textContent = "KADANG-KADANG RACE & SOLO CHALLENGES";
        bodyElem.innerHTML = `
            <p><strong>Objective:</strong> Race on bamboo stilts. Choose a head-to-head race, a solo challenge, or untimed solo practice.</p>
            <p style="color: #E5A93C; font-weight: bold; margin-top: 8px;">INSTRUCTIONS:</p>
            <ul>
                <li><strong>Phone Mode:</strong> Alternate the on-screen <strong>[LEFT]</strong> and <code>[RIGHT]</code> foot buttons.</li>
                <li><strong>Solo PC Controls:</strong> Alternate tapping <code>A</code> and <code>D</code>.</li>
                <li><strong>Two-Player PC Controls:</strong> Player 1 uses <code>A</code>/<code>D</code>; Player 2 uses the left/right arrows.</li>
                <li>Solo challenges use a route twice as long and a 120-second limit.</li>
                <li>The No-Fall challenge ends on the first stumble. Keep a steady rhythm!</li>
            </ul>
            <p style="color: #E5A93C; margin-top: 10px; font-weight: bold;">CHOOSE YOUR MODE</p>
            <button class="modal-btn-action" id="modal-start-kadang" style="background: #C28245;">2-PLAYER RACE</button>
            <button class="modal-btn-action" id="modal-solo-time-trial" style="background: #3A6351;">SOLO TIME TRIAL (2X ROUTE / 120 SEC)</button>
            <button class="modal-btn-action" id="modal-solo-no-fall" style="background: #8C5A32;">SOLO NO-FALL CHALLENGE (2X ROUTE / 120 SEC)</button>
            <button class="modal-btn-action" id="modal-practice-kadang" style="background: #2E5A78; border-color:#6BA2B5;">2-PLAYER PRACTICE (NO TIMER OR RECORD)</button>
            <button class="modal-btn-action" id="modal-solo-practice-kadang" style="background: #2E5A78; border-color:#6BA2B5;">SOLO PRACTICE (NO TIMER OR RECORD)</button>
            <button class="modal-btn-action" id="modal-home-lobby-kadang" style="background: #4E3629; margin-top: 8px; color:#fff; padding:10px; border:none; border-radius:4px; cursor:pointer; width:100%;">RETURN TO LOBBY</button>
        `;

        const startKadangMode = mode => {
            closeAllModals();
            kadang.reset(mode);
            currentState = STATE_KADANG;
        };

        document.getElementById("modal-start-kadang").addEventListener("click", () => {
            startKadangMode("RACE");
        });
        document.getElementById("modal-solo-time-trial").addEventListener("click", () => {
            startKadangMode("SOLO_TIME_TRIAL");
        });
        document.getElementById("modal-solo-no-fall").addEventListener("click", () => {
            startKadangMode("SOLO_NO_FALL");
        });
        document.getElementById("modal-practice-kadang").addEventListener("click", () => {
            startKadangMode("PRACTICE");
        });
        document.getElementById("modal-solo-practice-kadang").addEventListener("click", () => {
            startKadangMode("SOLO_PRACTICE");
        });
        document.getElementById("modal-home-lobby-kadang").addEventListener("click", () => {
            closeAllModals();
            currentState = STATE_LOBBY;
            audioManager.playBgm();
        });
    }

    openModal(minigameInfoModal);
}

function openHowToPlaySelector() {
    const titleElem = document.getElementById("info-modal-title");
    const bodyElem = document.getElementById("info-modal-body");
    titleElem.textContent = "HOW TO PLAY";
    bodyElem.innerHTML = `
        <p>Choose a game to see its goal, controls, and player modes.</p>
        <button class="modal-btn-action" id="how-to-play-dokdokma" style="background:#3A6351;">DOKDOKMA</button>
        <button class="modal-btn-action" id="how-to-play-kadang" style="background:#2E5A78;">KADANG-KADANG</button>
    `;
    document.getElementById("how-to-play-dokdokma").addEventListener("click", () => {
        openMinigameInfoModal("DOKDOKMA");
    });
    document.getElementById("how-to-play-kadang").addEventListener("click", () => {
        openMinigameInfoModal("KADANG");
    });
    openModal(minigameInfoModal);
}

function showDifficultySelector(numPlayers) {
    const titleElem = document.getElementById("info-modal-title");
    const bodyElem = document.getElementById("info-modal-body");

    titleElem.textContent = `DOKDOKMA | ${numPlayers} PLAYER${numPlayers > 1 ? 'S' : ''}`;
    bodyElem.innerHTML = `
        <div class="difficulty-intro">
            <p class="difficulty-eyebrow">CHOOSE YOUR CHALLENGE</p>
            <p class="difficulty-help">Catch the pig before your stamina runs out.</p>
        </div>
        <div class="difficulty-options">
            <button class="difficulty-card difficulty-easy" id="modal-diff-easy" type="button" aria-label="Easy: slower pig and slower stamina drain">
                <span class="difficulty-mark" aria-hidden="true">01</span>
                <span class="difficulty-copy">
                    <span class="difficulty-name">Easy</span>
                    <span class="difficulty-description">A relaxed chase with a slower pig.</span>
                    <span class="difficulty-tag">BEGINNER</span>
                </span>
                <span class="difficulty-meter" aria-hidden="true"><i class="is-active"></i><i></i><i></i></span>
                <span class="difficulty-chevron" aria-hidden="true"></span>
            </button>
            <button class="difficulty-card difficulty-medium" id="modal-diff-medium" type="button" aria-label="Medium: faster pig and moderate stamina drain">
                <span class="difficulty-mark" aria-hidden="true">02</span>
                <span class="difficulty-copy">
                    <span class="difficulty-name">Medium</span>
                    <span class="difficulty-description">A quicker chase that tests your timing.</span>
                    <span class="difficulty-tag">BALANCED</span>
                </span>
                <span class="difficulty-meter" aria-hidden="true"><i class="is-active"></i><i class="is-active"></i><i></i></span>
                <span class="difficulty-chevron" aria-hidden="true"></span>
            </button>
            <button class="difficulty-card difficulty-hard" id="modal-diff-hard" type="button" aria-label="Hard: fastest pig and rapid stamina drain">
                <span class="difficulty-mark" aria-hidden="true">03</span>
                <span class="difficulty-copy">
                    <span class="difficulty-name">Hard</span>
                    <span class="difficulty-description">The fastest pig and toughest pursuit.</span>
                    <span class="difficulty-tag">EXPERT</span>
                </span>
                <span class="difficulty-meter" aria-hidden="true"><i class="is-active"></i><i class="is-active"></i><i class="is-active"></i></span>
                <span class="difficulty-chevron" aria-hidden="true"></span>
            </button>
            <button class="difficulty-card difficulty-challenge" id="modal-diff-challenge" type="button" aria-label="Timed challenge: medium pace, catch the pig in 90 seconds">
                <span class="difficulty-mark" aria-hidden="true">90</span>
                <span class="difficulty-copy">
                    <span class="difficulty-name">Timed Challenge</span>
                    <span class="difficulty-description">Catch the pig in 90 seconds on Medium pace.</span>
                    <span class="difficulty-tag">90 SECOND LIMIT</span>
                </span>
                <span class="difficulty-meter" aria-hidden="true"><i class="is-active"></i><i class="is-active"></i><i></i></span>
                <span class="difficulty-chevron" aria-hidden="true"></span>
            </button>
            <button class="difficulty-card difficulty-practice" id="modal-diff-practice" type="button" aria-label="Practice mode: easy pace, no timer, stamina drain, or rewards">
                <span class="difficulty-mark" aria-hidden="true">P</span>
                <span class="difficulty-copy">
                    <span class="difficulty-name">Practice</span>
                    <span class="difficulty-description">Easy pace with no timer or stamina drain.</span>
                    <span class="difficulty-tag">NO REWARDS OR RECORDS</span>
                </span>
                <span class="difficulty-meter" aria-hidden="true"><i></i><i></i><i></i></span>
                <span class="difficulty-chevron" aria-hidden="true"></span>
            </button>
        </div>
        <button class="difficulty-back" id="modal-back-players" type="button">BACK TO PLAYER MODE</button>
    `;

    document.getElementById("modal-diff-easy").addEventListener("click", () => {
        closeAllModals();
        dokdokma.reset(DIFFICULTY_SETTINGS.EASY, numPlayers);
        currentState = STATE_DOKDOKMA;
    });
    document.getElementById("modal-diff-medium").addEventListener("click", () => {
        closeAllModals();
        dokdokma.reset(DIFFICULTY_SETTINGS.MEDIUM, numPlayers);
        currentState = STATE_DOKDOKMA;
    });
    document.getElementById("modal-diff-hard").addEventListener("click", () => {
        closeAllModals();
        dokdokma.reset(DIFFICULTY_SETTINGS.HARD, numPlayers);
        currentState = STATE_DOKDOKMA;
    });
    document.getElementById("modal-diff-challenge").addEventListener("click", () => {
        closeAllModals();
        dokdokma.reset(DIFFICULTY_SETTINGS.MEDIUM, numPlayers, false, true);
        currentState = STATE_DOKDOKMA;
    });
    document.getElementById("modal-diff-practice").addEventListener("click", () => {
        closeAllModals();
        dokdokma.reset(DIFFICULTY_SETTINGS.EASY, numPlayers, true);
        currentState = STATE_DOKDOKMA;
    });
    document.getElementById("modal-back-players").addEventListener("click", () => {
        openMinigameInfoModal("DOKDOKMA");
    });
}

function openDrawer() {
    sideDrawer.classList.remove("drawer-closed");
    modalBackdrop.classList.remove("hidden");
}

function closeDrawer() {
    sideDrawer.classList.add("drawer-closed");
    if (minigameInfoModal.classList.contains("hidden") &&
        settingsModal.classList.contains("hidden") &&
        exitModal.classList.contains("hidden")) {
        modalBackdrop.classList.add("hidden");
    }
}

function openModal(modal) {
    closeDrawer();
    modalBackdrop.classList.remove("hidden");
    modal.classList.remove("hidden");
}

function closeAllModals() {
    minigameInfoModal.classList.add("hidden");
    settingsModal.classList.add("hidden");
    exitModal.classList.add("hidden");
    const authModal = document.getElementById("auth-modal");
    if (authModal) {
        authModal.classList.add("hidden");
        authModal.style.display = "none";
    }
    modalBackdrop.classList.add("hidden");
}

menuBtn.addEventListener("click", openDrawer);
closeDrawerBtn.addEventListener("click", closeDrawer);
modalBackdrop.addEventListener("click", () => {
    closeDrawer();
    closeAllModals();
});

btnLobby.addEventListener("click", () => {
    if (currentState !== STATE_LOBBY && currentState !== STATE_WELCOME && currentState !== STATE_LOADING) {
        openModal(exitModal);
    } else if (currentState !== STATE_LOADING) {
        currentState = STATE_LOBBY;
        badgeInterface.selectedBadgeIndex = null;
        closeDrawer();
        audioManager.playBgm();
    }
});

btnSettings.addEventListener("click", () => openModal(settingsModal));
closeModalsBtns.forEach(btn => btn.addEventListener("click", closeAllModals));

btnQuitYes.addEventListener("click", () => {
    closeAllModals();
    if (currentState === STATE_DOKDOKMA) {
        openMinigameInfoModal("DOKDOKMA");
    } else if (currentState === STATE_KADANG) {
        openMinigameInfoModal("KADANG");
    } else {
        currentState = STATE_LOBBY;
        audioManager.playBgm();
    }
});

btnQuitNo.addEventListener("click", () => {
    closeAllModals();
});

const keys = {};
window.addEventListener("keydown", e => {
    audioManager.playBgm();

    if (currentState === STATE_DOKDOKMA && dokdokma.isCountingDown) {
        if (e.code === "Space") e.preventDefault();
        return;
    }

    if (!keys[e.code]) {
        handleKeyDownOnce(e.code);
    }
    keys[e.code] = true;
    if (e.code === "Space") e.preventDefault();
    if (currentState === STATE_WELCOME) {
        currentState = STATE_LOBBY;
        audioManager.playBgm();
    }
});
window.addEventListener("keyup", e => keys[e.code] = false);

let p1GrabTapped = false;
let p2GrabTapped = false;

// Dual virtual joystick touch tracking states
const dualTouchState = {
    p1JoystickActive: false,
    p1BaseX: 100, p1BaseY: 580, p1KnobX: 100, p1KnobY: 580, p1TouchId: null,
    p2JoystickActive: false,
    p2BaseX: 1180, p2BaseY: 580, p2KnobX: 1180, p2KnobY: 580, p2TouchId: null,
    maxRadius: 60
};

function handleKeyDownOnce(code) {
    if (currentState === STATE_KADANG && !kadang.isGameOver && !kadang.isPaused && !kadang.isCountingDown) {
        if (code === "KeyA") {
            kadang.registerStep(1, "left");
        } else if (code === "KeyD") {
            kadang.registerStep(1, "right");
        } else if (code === "ArrowLeft") {
            kadang.registerStep(2, "left");
        } else if (code === "ArrowRight") {
            kadang.registerStep(2, "right");
        }
    }
}

const cage = { x: 200, y: 50, w: 880, h: 520 };

const DIFFICULTY_SETTINGS = {
    EASY: { name: "EASY", pigSpeed: 4.5, drainRate: 0.1, regenRate: 0.15 },
    MEDIUM: { name: "MEDIUM", pigSpeed: 6.5, drainRate: 0.2, regenRate: 0.1 },
    HARD: { name: "HARD", pigSpeed: 8.5, drainRate: 0.35, regenRate: 0.05 }
};

function drawCanvasBackground() {
    if (bgImg.complete && bgImg.naturalWidth !== 0) {
        ctx.drawImage(bgImg, 0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    } else {
        ctx.fillStyle = "#2B231D";
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    }
}

const dokdokma = {
    difficulty: null,
    activePlayersCount: 1,
    player: {
        x: cage.x + 120,
        y: cage.y + cage.h / 2 - 60,
        speed: 6,
        facingRight: true,
        stamina: 100,
        frameIndex: 0,
        totalFrames: 4,
        tickCount: 0,
        ticksPerFrame: 6
    },
    player2: {
        x: cage.x + 120,
        y: cage.y + cage.h / 2,
        speed: 6,
        facingRight: true,
        stamina: 100,
        frameIndex: 0,
        totalFrames: 4,
        tickCount: 0,
        ticksPerFrame: 6
    },
    player3: {
        x: cage.x + 120,
        y: cage.y + cage.h / 2 + 60,
        speed: 6,
        facingRight: true,
        stamina: 100,
        frameIndex: 0,
        totalFrames: 4,
        ticksPerFrame: 6
    },
    pig: {
        x: cage.x + cage.w - 120,
        y: cage.y + cage.h / 2,
        vx: -4.5,
        vy: 3,
        frameIndex: 0,
        totalFrames: 4,
        tickCount: 0,
        ticksPerFrame: 8
    },
    gripProgress: 0,
    catchRadius: 105,
    isGameOver: false,
    hasWon: false,
    resultStartedAt: 0,
    newPersonalBest: false,
    newArtifactUnlocked: false,
    practiceMode: false,
    timedChallenge: false,
    challengeTimeLimit: 90,
    resultReason: null,
    isCountingDown: false,
    countdownTimer: 3,
    countdownInterval: null,
    isPaused: false,
    pauseStartedAt: 0,
    phoneOrientationPaused: false,
    phoneOrientationCountdownPaused: false,
    spaceWasPressed: false,
    startTime: 0,
    elapsedTime: 0,

    p1GrabBtnSingle: { cx: 1180, cy: 580, r: 55 },
    p1GrabBtnDual: { cx: 240, cy: 580, r: 45 },
    p2GrabBtnDual: { cx: 1040, cy: 580, r: 45 },

    reset(selectedDifficulty = null, numPlayers = 1, practiceMode = false, timedChallenge = false) {
        audioManager.playBgm();
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.difficulty = selectedDifficulty;
        this.activePlayersCount = numPlayers;
        this.practiceMode = Boolean(practiceMode);
        this.timedChallenge = Boolean(timedChallenge) && !this.practiceMode;
        this.newArtifactUnlocked = false;
        currentRunArtifact = null;

        this.player.x = cage.x + 120;
        this.player.y = cage.y + cage.h / 2 - (numPlayers > 1 ? 60 : 0);
        this.player.stamina = 100;
        this.player.facingRight = true;
        this.player.frameIndex = 0;
        this.player.tickCount = 0;

        this.player2.x = cage.x + 120;
        this.player2.y = cage.y + cage.h / 2;
        this.player2.stamina = 100;
        this.player2.facingRight = true;
        this.player2.frameIndex = 0;
        this.player2.tickCount = 0;

        this.player3.x = cage.x + 120;
        this.player3.y = cage.y + cage.h / 2 + 60;
        this.player3.stamina = 100;
        this.player3.facingRight = true;
        this.player3.frameIndex = 0;
        this.player3.tickCount = 0;

        if (this.difficulty) {
            const speed = this.difficulty.pigSpeed;
            this.pig.x = cage.x + cage.w - 120;
            this.pig.y = cage.y + cage.h / 2;
            this.pig.vx = -speed;
            this.pig.vy = speed * 0.7;

            if (!this.practiceMode) {
                const tierList = CULTURAL_ARTIFACTS[this.difficulty.name];
                const collectedNames = new Set(playerAchievements[this.difficulty.name].map(artifact => artifact.name));
                const availableArtifacts = tierList.filter(artifact => !collectedNames.has(artifact.name));
                if (availableArtifacts.length > 0) {
                    currentRunArtifact = availableArtifacts[Math.floor(Math.random() * availableArtifacts.length)];
                }
            }
        }

        this.pig.frameIndex = 0;
        this.pig.tickCount = 0;
        this.gripProgress = 0;
        this.isGameOver = false;
        this.hasWon = false;
        this.resultStartedAt = 0;
        this.resultReason = null;
        this.newPersonalBest = false;
        this.isCountingDown = Boolean(selectedDifficulty) && !this.practiceMode;
        this.countdownTimer = 3;
        this.isPaused = false;
        this.pauseStartedAt = 0;
        this.phoneOrientationPaused = false;
        this.phoneOrientationCountdownPaused = false;
        this.spaceWasPressed = false;
        dualTouchState.p1JoystickActive = false;
        dualTouchState.p1TouchId = null;
        dualTouchState.p1BaseX = 100;
        dualTouchState.p1BaseY = 580;
        dualTouchState.p1KnobX = 100;
        dualTouchState.p1KnobY = 580;
        dualTouchState.p2JoystickActive = false;
        dualTouchState.p2TouchId = null;
        dualTouchState.p2BaseX = 1180;
        dualTouchState.p2BaseY = 580;
        dualTouchState.p2KnobX = 1180;
        dualTouchState.p2KnobY = 580;
        p1GrabTapped = false;
        p2GrabTapped = false;
        ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyI", "KeyJ", "KeyK", "KeyL", "Space"].forEach(code => {
            keys[code] = false;
        });
        this.startTime = 0;
        this.elapsedTime = 0;

        if (this.isCountingDown) this.startCountdown();
    },

    startCountdown() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.countdownInterval = setInterval(() => {
            this.countdownTimer--;
            if (this.countdownTimer < 0) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                this.isCountingDown = false;
                this.startTime = Date.now();
            }
        }, 1000);
    }
};

// =============================================
// IMPROVED KADANG-KADANG (DUO STILT RACE - TEMPLE RUN BACK VIEW)
// =============================================
const kadang = {
    targetDistance: 100,
    soloDistance: 200,
    soloTimeLimit: 120,
    maxSpeed: 4.5,
    stepDistance: 1.2,
    mode: "RACE",
    challengeType: null,
    activePlayersCount: 2,
    resultOutcome: null,
    resultReason: null,
    isGameOver: false,
    isPaused: false,
    pauseStartedAt: 0,
    phoneOrientationPaused: false,
    phoneOrientationCountdownPaused: false,
    isCountingDown: true,
    countdownTimer: 3,
    countdownInterval: null,
    winner: null,
    loser: null,
    resultStartedAt: 0,
    newPersonalBest: false,
    practiceMode: false,
    hasCompetitiveWin: false,
    startTime: 0,
    elapsedTime: 0,
    p1: {
        name: "Player 1",
        distance: 0,
        balance: 50,
        speed: 0,
        lastFoot: null,
        stumbleCooldown: 0,
        isStumbling: false,
        animTime: 0,
        stepCount: 0,
        stumbleCount: 0,
        wobbleTime: 0
    },
    p2: {
        name: "Player 2",
        distance: 0,
        balance: 50,
        speed: 0,
        lastFoot: null,
        stumbleCooldown: 0,
        isStumbling: false,
        animTime: 0,
        stepCount: 0,
        stumbleCount: 0,
        wobbleTime: 0
    },

    reset(mode = "RACE") {
        audioManager.playBgm();
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.mode = mode;
        this.challengeType = mode === "SOLO_TIME_TRIAL"
            ? "TIME_TRIAL"
            : mode === "SOLO_NO_FALL" ? "NO_FALL" : null;
        this.activePlayersCount = mode.startsWith("SOLO") ? 1 : 2;
        this.practiceMode = mode === "PRACTICE" || mode === "SOLO_PRACTICE";
        this.targetDistance = this.activePlayersCount === 1 ? this.soloDistance : 100;
        this.resultOutcome = null;
        this.resultReason = null;
        this.isGameOver = false;
        this.isPaused = false;
        this.pauseStartedAt = 0;
        this.phoneOrientationPaused = false;
        this.phoneOrientationCountdownPaused = false;
        this.isCountingDown = !this.practiceMode;
        this.countdownTimer = this.practiceMode ? 0 : 3;
        this.winner = null;
        this.loser = null;
        this.resultStartedAt = 0;
        this.newPersonalBest = false;
        this.elapsedTime = 0;
        this.startTime = 0;

        [this.p1, this.p2].forEach(p => {
            p.distance = 0;
            p.balance = 50;
            p.speed = 0;
            p.lastFoot = null;
            p.stumbleCooldown = 0;
            p.isStumbling = false;
            p.animTime = 0;
            p.stepCount = 0;
            p.stumbleCount = 0;
            p.wobbleTime = 0;
        });

        if (this.isCountingDown) this.startCountdown();
    },

    startCountdown() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.countdownInterval = setInterval(() => {
            this.countdownTimer--;
            if (this.countdownTimer < 0) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                this.isCountingDown = false;
                this.startTime = Date.now();
            }
        }, 1000);
    },

    registerStep(playerNum, foot) {
        if (this.isGameOver || this.isPaused || this.isCountingDown) return;
        if (playerNum === 2 && this.activePlayersCount === 1) return;
        const p = (playerNum === 1) ? this.p1 : this.p2;
        if (p.isStumbling) return;

        p.stepCount += 1;

        if (p.lastFoot === foot) {
            p.balance += (foot === "left") ? -25 : 25;
            p.speed = Math.max(0, p.speed - 0.5);
            p.wobbleTime = 20;
        } else {
            p.balance += (foot === "left") ? -4 : 4;
            p.balance = Math.max(0, Math.min(100, p.balance));
            p.speed = Math.min(this.maxSpeed, p.speed + 0.65);
            p.distance += this.stepDistance;
            p.wobbleTime = Math.max(0, p.wobbleTime - 2);
        }

        p.lastFoot = foot;

        if (p.balance <= 0 || p.balance >= 100) {
            this.triggerStumble(p);
            if (this.isGameOver) return;
        }

        if (p.distance >= this.targetDistance) {
            p.distance = this.targetDistance;
            this.endRace(p, true);
        }
    },

    triggerStumble(p) {
        p.stumbleCount += 1;
        p.balance = 50;
        p.speed = 0;
        p.stumbleCooldown = 60;
        p.isStumbling = true;
        if (this.challengeType === "NO_FALL") {
            this.endRace(p, false, "FALL");
        }
    },

    recoverFromStumble(p) {
        if (!p.isStumbling) return;
        p.stumbleCooldown--;
        if (p.stumbleCooldown <= 0) {
            p.isStumbling = false;
            p.stumbleCooldown = 0;
            p.balance = 50;
            p.lastFoot = null;
            p.distance = 0;
        }
    },

    update() {
        if (this.isGameOver || this.isPaused || this.isCountingDown) return;
        if (!this.practiceMode) {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        }
        if (this.challengeType && this.elapsedTime >= this.soloTimeLimit) {
            this.endRace(this.p1, false, "TIME_UP");
            return;
        }

        const activePlayers = this.activePlayersCount === 1 ? [this.p1] : [this.p1, this.p2];
        activePlayers.forEach(p => {
            if (p.speed > 0.1) {
                p.animTime += 0.12 + Math.min(p.speed / this.maxSpeed, 1) * 0.1;
            } else {
                p.animTime *= 0.85;
            }

            if (p.isStumbling) {
                this.recoverFromStumble(p);
                return;
            }
            p.speed = Math.max(0, p.speed - 0.015);
            p.distance += p.speed * 0.08;

            if (p.distance >= this.targetDistance) {
                p.distance = this.targetDistance;
                this.endRace(p, true);
            }
        });
    },

    endRace(p, completed = true, reason = null) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.resultOutcome = completed ? "WIN" : "LOSS";
        this.resultReason = reason;
        this.winner = completed ? p.name : null;
        this.loser = completed
            ? this.activePlayersCount > 1 ? (p === this.p1 ? this.p2.name : this.p1.name) : null
            : p.name;
        this.resultStartedAt = Date.now();
        if (!this.practiceMode && completed) {
            if (this.mode === "RACE") {
                this.newPersonalBest = recordKadangBest(this.elapsedTime);
            }
            this.hasCompetitiveWin = true;
            syncProgressToServer();
        }
    }
};

// Request Fullscreen & Landscape Orientation on mobile tap
async function requestFullscreenAndLandscape() {
    try {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
            await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
            await docEl.webkitRequestFullscreen();
        }

        if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock("landscape");
        }
    } catch (err) {
        // Handled silently
    }
}

function getCanvasPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
        x: (clientX - rect.left) * VIRTUAL_WIDTH / rect.width,
        y: (clientY - rect.top) * VIRTUAL_HEIGHT / rect.height
    };
}

function handleDokdokmaTouchStart(event, x, y) {
    if (currentDeviceMode !== "PHONE" ||
        currentState !== STATE_DOKDOKMA ||
        dokdokma.isGameOver ||
        dokdokma.isPaused ||
        dokdokma.isCountingDown) {
        return false;
    }

    const dualPlayerMode = dokdokma.activePlayersCount >= 2;
    const p1Grab = dualPlayerMode ? dokdokma.p1GrabBtnDual : dokdokma.p1GrabBtnSingle;
    const p2Grab = dokdokma.p2GrabBtnDual;

    if (Math.hypot(x - p1Grab.cx, y - p1Grab.cy) <= p1Grab.r + 10) {
        p1GrabTapped = true;
        event.preventDefault();
        return true;
    }
    if (dualPlayerMode && Math.hypot(x - p2Grab.cx, y - p2Grab.cy) <= p2Grab.r + 10) {
        p2GrabTapped = true;
        event.preventDefault();
        return true;
    }

    const playerNum = dualPlayerMode && x >= VIRTUAL_WIDTH / 2 ? 2 : 1;
    const joystick = playerNum === 1
        ? { x: 100, y: 580, activeKey: "p1JoystickActive", touchKey: "p1TouchId", baseXKey: "p1BaseX", baseYKey: "p1BaseY", knobXKey: "p1KnobX", knobYKey: "p1KnobY" }
        : { x: 1180, y: 580, activeKey: "p2JoystickActive", touchKey: "p2TouchId", baseXKey: "p2BaseX", baseYKey: "p2BaseY", knobXKey: "p2KnobX", knobYKey: "p2KnobY" };
    const distance = Math.hypot(x - joystick.x, y - joystick.y);

    if (distance > dualTouchState.maxRadius + 45 || dualTouchState[joystick.activeKey]) return false;

    dualTouchState[joystick.activeKey] = true;
    dualTouchState[joystick.touchKey] = event.pointerId;
    dualTouchState[joystick.baseXKey] = joystick.x;
    dualTouchState[joystick.baseYKey] = joystick.y;
    dualTouchState[joystick.knobXKey] = joystick.x;
    dualTouchState[joystick.knobYKey] = joystick.y;
    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
    return true;
}

function updateDokdokmaJoystick(event) {
    const playerNum = event.pointerId === dualTouchState.p1TouchId
        ? 1
        : event.pointerId === dualTouchState.p2TouchId ? 2 : 0;
    if (!playerNum) return;

    const point = getCanvasPoint(event.clientX, event.clientY);
    if (!point) return;
    const baseXKey = playerNum === 1 ? "p1BaseX" : "p2BaseX";
    const baseYKey = playerNum === 1 ? "p1BaseY" : "p2BaseY";
    const knobXKey = playerNum === 1 ? "p1KnobX" : "p2KnobX";
    const knobYKey = playerNum === 1 ? "p1KnobY" : "p2KnobY";
    const dx = point.x - dualTouchState[baseXKey];
    const dy = point.y - dualTouchState[baseYKey];
    const distance = Math.hypot(dx, dy);
    const scale = distance > dualTouchState.maxRadius
        ? dualTouchState.maxRadius / distance
        : 1;

    dualTouchState[knobXKey] = dualTouchState[baseXKey] + dx * scale;
    dualTouchState[knobYKey] = dualTouchState[baseYKey] + dy * scale;
    event.preventDefault();
}

function endDokdokmaJoystick(pointerId) {
    if (pointerId === dualTouchState.p1TouchId) {
        dualTouchState.p1JoystickActive = false;
        dualTouchState.p1TouchId = null;
        dualTouchState.p1BaseX = 100;
        dualTouchState.p1BaseY = 580;
        dualTouchState.p1KnobX = 100;
        dualTouchState.p1KnobY = 580;
    }
    if (pointerId === dualTouchState.p2TouchId) {
        dualTouchState.p2JoystickActive = false;
        dualTouchState.p2TouchId = null;
        dualTouchState.p2BaseX = 1180;
        dualTouchState.p2BaseY = 580;
        dualTouchState.p2KnobX = 1180;
        dualTouchState.p2KnobY = 580;
    }
}

function releaseDokTouchControls() {
    endDokdokmaJoystick(dualTouchState.p1TouchId);
    endDokdokmaJoystick(dualTouchState.p2TouchId);
    p1GrabTapped = false;
    p2GrabTapped = false;
}

// Canvas Pointer Input Handling
canvas.addEventListener("pointerdown", e => {
    audioManager.playBgm();
    requestFullscreenAndLandscape();

    if (currentState === STATE_LOADING) return;

    if (currentState === STATE_WELCOME) {
        currentState = STATE_LOBBY;
        audioManager.playBgm();
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    if (handleDokdokmaTouchStart(e, clickX, clickY)) return;

    // Kadang-Kadang on-screen touch controller buttons
    if (currentState === STATE_KADANG && !kadang.isGameOver && !kadang.isPaused && !kadang.isCountingDown) {
        const halfW = VIRTUAL_WIDTH / 2;
        if (kadang.activePlayersCount === 1) {
            const controlOffset = (VIRTUAL_WIDTH - halfW) / 2;
            if (clickX >= controlOffset + 40 && clickX <= controlOffset + 300 && clickY >= 520 && clickY <= 670) {
                kadang.registerStep(1, "left");
                return;
            }
            if (clickX >= controlOffset + 340 && clickX <= controlOffset + 600 && clickY >= 520 && clickY <= 670) {
                kadang.registerStep(1, "right");
                return;
            }
        } else if (clickX < halfW) {
            if (clickX >= 40 && clickX <= 300 && clickY >= 520 && clickY <= 670) {
                kadang.registerStep(1, "left");
                return;
            }
            if (clickX >= 340 && clickX <= 600 && clickY >= 520 && clickY <= 670) {
                kadang.registerStep(1, "right");
                return;
            }
        } else {
            const rx = clickX - halfW;
            if (rx >= 40 && rx <= 300 && clickY >= 520 && clickY <= 670) {
                kadang.registerStep(2, "left");
                return;
            }
            if (rx >= 340 && rx <= 600 && clickY >= 520 && clickY <= 670) {
                kadang.registerStep(2, "right");
                return;
            }
        }
    }

    if ((currentState === STATE_DOKDOKMA && dokdokma.isPaused) ||
        (currentState === STATE_KADANG && kadang.isPaused)) {
        handleMinigamePauseAction(clickX, clickY);
        return;
    }

    if (currentState === STATE_BADGES) {
        const badgesDataCount = 6;

        if (badgeInterface.selectedBadgeIndex !== null) {
            const modalW = 540;
            const modalH = 360;
            const modalX = (VIRTUAL_WIDTH - modalW) / 2;
            const modalY = (VIRTUAL_HEIGHT - modalH) / 2;
            const btnCloseX = modalX + modalW / 2 - 100;
            const btnCloseY = modalY + modalH - 70;

            if (clickX >= btnCloseX && clickX <= btnCloseX + 200 && clickY >= btnCloseY && clickY <= btnCloseY + 45) {
                badgeInterface.selectedBadgeIndex = null;
                return;
            }
        } else {
            const cardW = 310;
            const cardH = 250;
            const gapX = 25;
            const gapY = 20;
            const startX = (VIRTUAL_WIDTH - (3 * cardW + 2 * gapX)) / 2;
            const startY = 95;

            for (let idx = 0; idx < badgesDataCount; idx++) {
                const col = idx % 3;
                const row = Math.floor(idx / 3);
                const x = startX + col * (cardW + gapX);
                const y = startY + row * (cardH + gapY);
                const w = cardW;
                const h = cardH;

                if (clickX >= x && clickX <= x + w && clickY >= y && clickY <= y + h) {
                    badgeInterface.selectedBadgeIndex = idx;
                    break;
                }
            }
        }
    }

    if (currentState !== STATE_LOBBY) {
        const distExit = Math.hypot(clickX - btnExitGame.cx, clickY - btnExitGame.cy);
        const exitHitRadius = currentDeviceMode === "PHONE"
            ? Math.max(btnExitGame.r, 46)
            : btnExitGame.r;
        if (distExit <= exitHitRadius) {
            if (badgeInterface.selectedBadgeIndex !== null) {
                badgeInterface.selectedBadgeIndex = null;
                return;
            }
            if (currentState === STATE_DOKDOKMA) {
                if (!dokdokma.isCountingDown && !dokdokma.isGameOver) {
                    dokdokma.isPaused = true;
                    dokdokma.pauseStartedAt = Date.now();
                    releaseDokTouchControls();
                }
            } else if (currentState === STATE_KADANG) {
                if (!kadang.isCountingDown && !kadang.isGameOver) {
                    kadang.isPaused = true;
                    kadang.pauseStartedAt = Date.now();
                }
            } else {
                currentState = STATE_LOBBY;
                audioManager.playBgm();
            }
            return;
        }
    }

    if (currentState === STATE_DOKDOKMA && dokdokma.isGameOver) {
        if (handleMinigameResultAction(clickX, clickY)) return;
        openMinigameInfoModal("DOKDOKMA");
        return;
    }

    if (currentState === STATE_KADANG && kadang.isGameOver) {
        if (handleMinigameResultAction(clickX, clickY)) return;
        openMinigameInfoModal("KADANG");
        return;
    }

    if (currentState === STATE_LOBBY) {
        if (isPointInRect(clickX, clickY, LOBBY_CARDS.dokdokma)) {
            openMinigameInfoModal("DOKDOKMA");
        } else if (isPointInRect(clickX, clickY, LOBBY_CARDS.kadang)) {
            openMinigameInfoModal("KADANG");
        } else if (isPointInRect(clickX, clickY, LOBBY_ACTIONS.howToPlay)) {
            openHowToPlaySelector();
        } else if (isPointInRect(clickX, clickY, LOBBY_ACTIONS.achievements)) {
            currentState = STATE_ACHIEVEMENTS;
        } else if (isPointInRect(clickX, clickY, LOBBY_ACTIONS.artifacts)) {
            currentState = STATE_ARTIFACTS;
        }
    }
});

canvas.addEventListener("pointermove", updateDokdokmaJoystick);
canvas.addEventListener("pointerup", e => endDokdokmaJoystick(e.pointerId));
canvas.addEventListener("pointercancel", e => endDokdokmaJoystick(e.pointerId));
canvas.addEventListener("lostpointercapture", e => endDokdokmaJoystick(e.pointerId));

function updateDokdokma() {
    if (!dokdokma.difficulty || dokdokma.isGameOver || dokdokma.isPaused || dokdokma.isCountingDown) return;

    if (!dokdokma.practiceMode) {
        dokdokma.elapsedTime = Math.floor((Date.now() - dokdokma.startTime) / 1000);
    }
    if (dokdokma.timedChallenge && dokdokma.elapsedTime >= dokdokma.challengeTimeLimit) {
        dokdokma.isGameOver = true;
        dokdokma.hasWon = false;
        dokdokma.resultReason = "TIME_UP";
        dokdokma.resultStartedAt = Date.now();
        return;
    }

    const p1 = dokdokma.player;
    const p2 = dokdokma.player2;
    const p3 = dokdokma.player3;
    const pig = dokdokma.pig;

    pig.tickCount++;
    if (pig.tickCount >= pig.ticksPerFrame) {
        pig.tickCount = 0;
        pig.frameIndex = (pig.frameIndex + 1) % pig.totalFrames;
    }

    let m1X = 0, m1Y = 0;
    if (keys["KeyA"]) m1X -= 1;
    if (keys["KeyD"]) m1X += 1;
    if (keys["KeyW"]) m1Y -= 1;
    if (keys["KeyS"]) m1Y += 1;

    if (dualTouchState.p1JoystickActive) {
        const dx = dualTouchState.p1KnobX - dualTouchState.p1BaseX;
        const dy = dualTouchState.p1KnobY - dualTouchState.p1BaseY;
        const joyDist = Math.hypot(dx, dy);
        if (joyDist > 5) {
            m1X = dx / dualTouchState.maxRadius;
            m1Y = dy / dualTouchState.maxRadius;
        }
    }

    let m2X = 0, m2Y = 0;
    if (dokdokma.activePlayersCount >= 2) {
        if (keys["ArrowLeft"]) m2X -= 1;
        if (keys["ArrowRight"]) m2X += 1;
        if (keys["ArrowUp"]) m2Y -= 1;
        if (keys["ArrowDown"]) m2Y += 1;

        if (dualTouchState.p2JoystickActive) {
            const dx = dualTouchState.p2KnobX - dualTouchState.p2BaseX;
            const dy = dualTouchState.p2KnobY - dualTouchState.p2BaseY;
            const joyDist = Math.hypot(dx, dy);
            if (joyDist > 5) {
                m2X = dx / dualTouchState.maxRadius;
                m2Y = dy / dualTouchState.maxRadius;
            }
        }
    }

    let m3X = 0, m3Y = 0;
    if (dokdokma.activePlayersCount >= 3) {
        if (keys["KeyJ"]) m3X -= 1;
        if (keys["KeyL"]) m3X += 1;
        if (keys["KeyI"]) m3Y -= 1;
        if (keys["KeyK"]) m3Y += 1;
    }

    const p1Moving = Math.abs(m1X) > 0.1 || Math.abs(m1Y) > 0.1;
    if (p1Moving) {
        p1.stamina -= dokdokma.difficulty.drainRate;
        p1.tickCount++;
        if (p1.tickCount >= p1.ticksPerFrame) {
            p1.tickCount = 0;
            p1.frameIndex = (p1.frameIndex + 1) % p1.totalFrames;
        }
        if (m1X < 0) p1.facingRight = false;
        if (m1X > 0) p1.facingRight = true;
        p1.x += m1X * p1.speed;
        p1.y += m1Y * p1.speed;
    } else {
        p1.stamina += dokdokma.difficulty.regenRate;
        p1.frameIndex = 0;
    }
    p1.stamina = Math.max(0, Math.min(100, p1.stamina));

    if (dokdokma.activePlayersCount >= 2) {
        const p2Moving = Math.abs(m2X) > 0.1 || Math.abs(m2Y) > 0.1;
        if (p2Moving) {
            p2.stamina -= dokdokma.difficulty.drainRate;
            p2.tickCount++;
            if (p2.tickCount >= p2.ticksPerFrame) {
                p2.tickCount = 0;
                p2.frameIndex = (p2.frameIndex + 1) % p2.totalFrames;
            }
            if (m2X < 0) p2.facingRight = false;
            if (m2X > 0) p2.facingRight = true;
            p2.x += m2X * p2.speed;
            p2.y += m2Y * p2.speed;
        } else {
            p2.stamina += dokdokma.difficulty.regenRate;
            p2.frameIndex = 0;
        }
        p2.stamina = Math.max(0, Math.min(100, p2.stamina));
    }

    if (dokdokma.activePlayersCount >= 3) {
        const p3Moving = Math.abs(m3X) > 0.1 || Math.abs(m3Y) > 0.1;
        if (p3Moving) {
            p3.stamina -= dokdokma.difficulty.drainRate;
            p3.tickCount++;
            if (p3.tickCount >= p3.ticksPerFrame) {
                p3.tickCount = 0;
                p3.frameIndex = (p3.frameIndex + 1) % p3.totalFrames;
            }
            if (m3X < 0) p3.facingRight = false;
            if (m3X > 0) p3.facingRight = true;
            p3.x += m3X * p3.speed;
            p3.y += m3Y * p3.speed;
        } else {
            p3.stamina += dokdokma.difficulty.regenRate;
            p3.frameIndex = 0;
        }
        p3.stamina = Math.max(0, Math.min(100, p3.stamina));
    }

    p1.x = Math.max(cage.x + 35, Math.min(p1.x, cage.x + cage.w - 35));
    p1.y = Math.max(cage.y + 35, Math.min(p1.y, cage.y + cage.h - 35));
    if (dokdokma.activePlayersCount >= 2) {
        p2.x = Math.max(cage.x + 35, Math.min(p2.x, cage.x + cage.w - 35));
        p2.y = Math.max(cage.y + 35, Math.min(p2.y, cage.y + cage.h - 35));
    }
    if (dokdokma.activePlayersCount >= 3) {
        p3.x = Math.max(cage.x + 35, Math.min(p3.x, cage.x + cage.w - 35));
        p3.y = Math.max(cage.y + 35, Math.min(p3.y, cage.y + cage.h - 35));
    }

    const dist1 = Math.hypot(p1.x - pig.x, p1.y - pig.y);
    const dist2 = dokdokma.activePlayersCount >= 2 ? Math.hypot(p2.x - pig.x, p2.y - pig.y) : Infinity;
    const dist3 = dokdokma.activePlayersCount >= 3 ? Math.hypot(p3.x - pig.x, p3.y - pig.y) : Infinity;

    let closerPlayer = p1;
    let minDst = dist1;
    if (dokdokma.activePlayersCount >= 2 && dist2 < minDst) { closerPlayer = p2; minDst = dist2; }
    if (dokdokma.activePlayersCount >= 3 && dist3 < minDst) { closerPlayer = p3; minDst = dist3; }

    if (minDst < dokdokma.catchRadius * 1.5) {
        const fleeX = pig.x - closerPlayer.x;
        const fleeY = pig.y - closerPlayer.y;
        const len = Math.hypot(fleeX, fleeY);
        if (len > 0) {
            pig.vx = (fleeX / len) * (dokdokma.difficulty.pigSpeed + 1.5);
            pig.vy = (fleeY / len) * (dokdokma.difficulty.pigSpeed + 1.5);
        }
    }

    pig.x += pig.vx;
    pig.y += pig.vy;

    if (pig.x <= cage.x + 55) { pig.x = cage.x + 55; pig.vx *= -1; }
    if (pig.x >= cage.x + cage.w - 55) { pig.x = cage.x + cage.w - 55; pig.vx *= -1; }
    if (pig.y <= cage.y + 55) { pig.y = cage.y + 55; pig.vy *= -1; }
    if (pig.y >= cage.y + cage.h - 55) { pig.y = cage.y + cage.h - 55; pig.vy *= -1; }

    const spaceIsDown = keys["Space"];
    const spaceTapped = spaceIsDown && !dokdokma.spaceWasPressed;
    dokdokma.spaceWasPressed = spaceIsDown;

    const p1ValidGrab = spaceTapped || p1GrabTapped;
    const p2ValidGrab = p2GrabTapped;
    p1GrabTapped = false;
    p2GrabTapped = false;

    let inRangeCount = 0;
    if (dist1 <= dokdokma.catchRadius) inRangeCount++;
    if (dokdokma.activePlayersCount >= 2 && dist2 <= dokdokma.catchRadius) inRangeCount++;
    if (dokdokma.activePlayersCount >= 3 && dist3 <= dokdokma.catchRadius) inRangeCount++;

    if (inRangeCount > 0) {
        if (p1ValidGrab || p2ValidGrab) {
            dokdokma.gripProgress += (inRangeCount * 6);
            if (dist1 <= dokdokma.catchRadius && p1ValidGrab) p1.stamina -= 1.5;
            if (dokdokma.activePlayersCount >= 2 && dist2 <= dokdokma.catchRadius && p2ValidGrab) p2.stamina -= 1.5;
            if (dokdokma.activePlayersCount >= 3 && dist3 <= dokdokma.catchRadius) p3.stamina -= 1.5;
        }
        if (dokdokma.gripProgress > 0) dokdokma.gripProgress -= 0.25;
    } else {
        if (p1ValidGrab) p1.stamina -= 4.0;
        if (p2ValidGrab && dokdokma.activePlayersCount >= 2) p2.stamina -= 4.0;
        if (dokdokma.gripProgress > 0) dokdokma.gripProgress -= 1.0;
    }

    if (dokdokma.practiceMode) {
        p1.stamina = 100;
        p2.stamina = 100;
        p3.stamina = 100;
    }

    let allStaminaDepleted = !dokdokma.practiceMode && p1.stamina <= 0;
    if (dokdokma.activePlayersCount >= 2) allStaminaDepleted = allStaminaDepleted && p2.stamina <= 0;
    if (dokdokma.activePlayersCount >= 3) allStaminaDepleted = allStaminaDepleted && p3.stamina <= 0;

    if (dokdokma.gripProgress >= 100) {
        dokdokma.gripProgress = 100;
        dokdokma.isGameOver = true;
        dokdokma.hasWon = true;
        dokdokma.resultReason = "CAUGHT";
        dokdokma.resultStartedAt = Date.now();
        if (!dokdokma.practiceMode) {
            dokdokma.newPersonalBest = recordDokdokmaBest(dokdokma.elapsedTime, dokdokma.difficulty.name);
            if (currentRunArtifact) {
                const tierArtifacts = playerAchievements[dokdokma.difficulty.name];
                if (!tierArtifacts.some(artifact => artifact.name === currentRunArtifact.name)) {
                    tierArtifacts.push(currentRunArtifact);
                    dokdokma.newArtifactUnlocked = true;
                }
            }
            syncProgressToServer();
        }
    } else if (allStaminaDepleted) {
        dokdokma.isGameOver = true;
        dokdokma.hasWon = false;
        dokdokma.resultReason = "STAMINA";
        dokdokma.resultStartedAt = Date.now();
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function drawFence() {
    const groundGradient = ctx.createLinearGradient(0, cage.y, 0, cage.y + cage.h);
    groundGradient.addColorStop(0, "#927447");
    groundGradient.addColorStop(1, "#715532");
    ctx.fillStyle = groundGradient;
    ctx.fillRect(cage.x, cage.y, cage.w, cage.h);

    const soilMarks = [
        [270, 125], [390, 195], [525, 140], [685, 230], [850, 130],
        [315, 390], [470, 455], [615, 360], [790, 440], [980, 330]
    ];
    ctx.fillStyle = "rgba(55, 39, 23, 0.22)";
    soilMarks.forEach(([x, y], index) => {
        ctx.beginPath();
        ctx.ellipse(x, y, 5 + (index % 3), 2, 0, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.strokeStyle = "rgba(124, 145, 71, 0.72)";
    ctx.lineWidth = 2;
    [[250, 210], [360, 330], [570, 155], [735, 285], [920, 205], [1010, 485]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 4, y - 8);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 2, y - 10);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 6, y - 7);
        ctx.stroke();
    });

    ctx.fillStyle = "#5C4028";
    ctx.fillRect(cage.x - 10, cage.y - 12, cage.w + 20, 10);
    ctx.fillRect(cage.x - 10, cage.y - 2, cage.w + 20, 10);
    ctx.fillRect(cage.x - 10, cage.y + cage.h - 8, cage.w + 20, 10);
    ctx.fillRect(cage.x - 10, cage.y + cage.h + 2, cage.w + 20, 10);

    ctx.fillStyle = "#8C5A32";
    for (let x = cage.x - 10; x <= cage.x + cage.w + 10; x += 44) {
        ctx.fillRect(x, cage.y - 18, 14, 24);
        ctx.fillRect(x, cage.y + cage.h - 6, 14, 24);
    }
    for (let y = cage.y - 10; y <= cage.y + cage.h + 10; y += 44) {
        ctx.fillRect(cage.x - 18, y, 24, 14);
        ctx.fillRect(cage.x + cage.w - 6, y, 24, 14);
    }

    ctx.strokeStyle = "rgba(210, 165, 104, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cage.x - 8, cage.y - 7);
    ctx.lineTo(cage.x + cage.w + 8, cage.y - 7);
    ctx.moveTo(cage.x - 8, cage.y + cage.h - 3);
    ctx.lineTo(cage.x + cage.w + 8, cage.y + cage.h - 3);
    ctx.stroke();

    ctx.strokeStyle = "#2B1A0E";
    ctx.lineWidth = 2;
    ctx.strokeRect(cage.x, cage.y, cage.w, cage.h);
}

function drawDualJoysticksUI() {
    ctx.save();
    const p1Active = dualTouchState.p1JoystickActive;
    const p1Bx = p1Active ? dualTouchState.p1BaseX : 100;
    const p1By = p1Active ? dualTouchState.p1BaseY : 580;
    const p1Kx = p1Active ? dualTouchState.p1KnobX : 100;
    const p1Ky = p1Active ? dualTouchState.p1KnobY : 580;

    ctx.globalAlpha = p1Active ? 0.95 : 0.6;
    ctx.fillStyle = "rgba(30, 24, 18, 0.85)";
    ctx.beginPath(); ctx.arc(p1Bx, p1By, dualTouchState.maxRadius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#3A6351"; ctx.lineWidth = 4; ctx.stroke();

    ctx.fillStyle = "#3A6351";
    ctx.beginPath(); ctx.arc(p1Kx, p1Ky, 26, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#E5A93C"; ctx.lineWidth = 3; ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("P1 MOVE", p1Bx, p1By - dualTouchState.maxRadius - 8);

    if (dokdokma.activePlayersCount >= 2) {
        const p2Active = dualTouchState.p2JoystickActive;
        const p2Bx = p2Active ? dualTouchState.p2BaseX : 1180;
        const p2By = p2Active ? dualTouchState.p2BaseY : 580;
        const p2Kx = p2Active ? dualTouchState.p2KnobX : 1180;
        const p2Ky = p2Active ? dualTouchState.p2KnobY : 580;

        ctx.globalAlpha = p2Active ? 0.95 : 0.6;
        ctx.fillStyle = "rgba(30, 24, 18, 0.85)";
        ctx.beginPath(); ctx.arc(p2Bx, p2By, dualTouchState.maxRadius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#2E5A78"; ctx.lineWidth = 4; ctx.stroke();

        ctx.fillStyle = "#2E5A78";
        ctx.beginPath(); ctx.arc(p2Kx, p2Ky, 26, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#E5A93C"; ctx.lineWidth = 3; ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("P2 MOVE", p2Bx, p2By - dualTouchState.maxRadius - 8);
    }
    ctx.restore();
}

function drawKalingaGrabBtn(cx, cy, r, label, inRange) {
    ctx.save();
    ctx.fillStyle = inRange ? "#C28245" : "#4E3629";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#E5A93C";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, cx, cy);
    ctx.restore();
}

function drawInGameExitButton() {
    ctx.save();
    ctx.fillStyle = "#4E3629";
    ctx.beginPath();
    ctx.arc(btnExitGame.cx, btnExitGame.cy, btnExitGame.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#C28245";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#E5A93C";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✕", btnExitGame.cx, btnExitGame.cy);
    ctx.restore();
}

function drawInGamePauseButton() {
    const radius = currentDeviceMode === "PHONE" ? 32 : btnExitGame.r;
    ctx.save();
    ctx.fillStyle = "#4E3629";
    ctx.beginPath();
    ctx.arc(btnExitGame.cx, btnExitGame.cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#C28245";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#E5A93C";
    ctx.fillRect(btnExitGame.cx - 6, btnExitGame.cy - 8, 4, 16);
    ctx.fillRect(btnExitGame.cx + 2, btnExitGame.cy - 8, 4, 16);
    ctx.restore();
}

function drawGameTopBar(title, timeLabel) {
    ctx.save();
    ctx.fillStyle = "rgba(18, 15, 13, 0.94)";
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, 30);
    ctx.strokeStyle = "#C28245";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 29);
    ctx.lineTo(VIRTUAL_WIDTH, 29);
    ctx.stroke();

    ctx.fillStyle = "#E5A93C";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(title, 24, 15);
    ctx.textAlign = "right";
    ctx.fillStyle = "#E2D7C5";
    ctx.fillText(timeLabel, VIRTUAL_WIDTH - 72, 15);
    ctx.restore();
}

function drawResultPanel() {
    const panel = { x: 230, y: 135, w: 820, h: 455 };
    ctx.fillStyle = "rgba(36, 27, 21, 0.96)";
    ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
    ctx.strokeStyle = "#E5A93C";
    ctx.lineWidth = 3;
    ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);
}

function drawResultEffect(isWin, startedAt, centerX = VIRTUAL_WIDTH / 2, centerY = 280) {
    if (!startedAt) return;

    const elapsed = (Date.now() - startedAt) / 1000;
    const pulse = (Math.sin(elapsed * 3.2) + 1) / 2;
    const color = isWin ? "229, 169, 60" : "163, 72, 54";
    const glow = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, 330);
    glow.addColorStop(0, `rgba(${color}, ${0.08 + pulse * 0.08})`);
    glow.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    ctx.save();
    for (let i = 0; i < 28; i++) {
        const cycle = (elapsed * 0.42 + i / 28) % 1;
        const baseX = centerX + ((i * 83) % 520) - 260;
        const drift = Math.sin(elapsed * 2 + i * 1.7) * 18;
        const y = isWin
            ? centerY - 150 + cycle * 360
            : centerY + 150 - cycle * 300;
        const x = baseX + drift;
        const alpha = Math.sin(Math.PI * cycle) * 0.65;

        ctx.globalAlpha = alpha;
        if (isWin) {
            const colors = ["#E5A93C", "#F5E5C8", "#6F9B72"];
            ctx.fillStyle = colors[i % colors.length];
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(elapsed * 2 + i);
            ctx.fillRect(-4, -7, 8, 14);
            ctx.restore();
        } else {
            ctx.fillStyle = i % 2 ? "#A34836" : "#C28245";
            ctx.beginPath();
            ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
}

function drawResultActions() {
    const actions = [
        { rect: RESULT_ACTIONS.replay, label: "PLAY AGAIN", color: "#3A6351" },
        { rect: RESULT_ACTIONS.lobby, label: "RETURN TO LOBBY", color: "#4E3629" }
    ];

    actions.forEach(({ rect, label, color }) => {
        ctx.fillStyle = color;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.strokeStyle = "#E5A93C";
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
    });

    ctx.textBaseline = "alphabetic";
}

function drawResultStatTile(x, y, w, label, value, accent) {
    ctx.fillStyle = "rgba(18, 15, 13, 0.7)";
    ctx.fillRect(x, y, w, 76);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, 76);

    ctx.textAlign = "center";
    ctx.fillStyle = accent;
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(label, x + w / 2, y + 23);
    ctx.fillStyle = "#F3E9D7";
    ctx.font = "bold 17px sans-serif";
    ctx.fillText(value, x + w / 2, y + 53, w - 12);
}

function drawResultInfoRow(x, y, w, label, value, accent = "#E5A93C") {
    ctx.fillStyle = "rgba(18, 15, 13, 0.55)";
    ctx.fillRect(x, y, w, 46);
    ctx.strokeStyle = "#59432F";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, 46);

    ctx.textAlign = "left";
    ctx.fillStyle = accent;
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(label, x + 12, y + 18);
    ctx.fillStyle = "#E2D7C5";
    ctx.font = "13px sans-serif";
    ctx.fillText(value, x + 12, y + 36, w - 24);
}

function drawGamePausePanel() {
    ctx.fillStyle = "rgba(18, 15, 13, 0.85)";
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    ctx.fillStyle = "#2B1A0E";
    ctx.fillRect(PAUSE_PANEL.x, PAUSE_PANEL.y, PAUSE_PANEL.w, PAUSE_PANEL.h);
    ctx.strokeStyle = "#E5A93C";
    ctx.lineWidth = 3;
    ctx.strokeRect(PAUSE_PANEL.x, PAUSE_PANEL.y, PAUSE_PANEL.w, PAUSE_PANEL.h);

    ctx.fillStyle = "#E5A93C";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GAME PAUSED", VIRTUAL_WIDTH / 2, PAUSE_PANEL.y + 55);
    ctx.fillStyle = "#E2D7C5";
    ctx.font = "16px sans-serif";
    ctx.fillText("Choose an option to continue:", VIRTUAL_WIDTH / 2, PAUSE_PANEL.y + 95);

    const actions = [
        { rect: PAUSE_ACTIONS.resume, label: "RESUME", color: "#3A6351" },
        { rect: PAUSE_ACTIONS.quit, label: "QUIT", color: "#A34836" }
    ];
    actions.forEach(({ rect, label, color }) => {
        ctx.fillStyle = color;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.strokeStyle = "#E5A93C";
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 18px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
    });
    ctx.textBaseline = "alphabetic";
}

function renderLoading() {
    ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    if (loadingImg.complete && loadingImg.naturalWidth !== 0) {
        ctx.drawImage(loadingImg, 0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    } else {
        ctx.fillStyle = "#120F0D";
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    }

    ctx.fillStyle = "rgba(18, 15, 13, 0.45)";
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    if (loadingProgress < 100) {
        loadingProgress += 0.25;
    } else {
        loadingProgress = 100;
        currentState = STATE_WELCOME;
        audioManager.playBgm();
    }

    const barW = 500;
    const barH = 20;
    const barX = (VIRTUAL_WIDTH - barW) / 2;
    const barY = 580;

    ctx.fillStyle = "rgba(18, 15, 13, 0.85)";
    ctx.fillRect(barX, barY, barW, barH);

    ctx.fillStyle = "#E5A93C";
    ctx.fillRect(barX, barY, (loadingProgress / 100) * barW, barH);

    ctx.strokeStyle = "#E2D7C5";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.fillStyle = "#E2D7C5";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`LOADING RESOURCES... ${Math.floor(loadingProgress)}%`, VIRTUAL_WIDTH / 2, barY - 15);
}

function renderWelcome() {
    ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    drawCanvasBackground();

    ctx.fillStyle = "rgba(18, 15, 13, 0.65)";
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    ctx.fillStyle = "#E5A93C";
    ctx.font = "bold 54px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("WELCOME TO KALINGA LEGENDS", VIRTUAL_WIDTH / 2, 280);

    ctx.fillStyle = "#E2D7C5";
    ctx.font = "24px sans-serif";
    ctx.fillText("Traditional Indigenous Games Preservation", VIRTUAL_WIDTH / 2, 340);

    const pulse = (Math.sin(Date.now() / 300) + 1) / 2;
    ctx.fillStyle = `rgba(229, 169, 60, ${0.4 + pulse * 0.6})`;
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("TAP ANYWHERE TO ENTER LOBBY", VIRTUAL_WIDTH / 2, 480);
}

function renderDokdokma() {
    ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    drawCanvasBackground();

    ctx.fillStyle = "rgba(18, 15, 13, 0.45)";
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    drawFence();

    const p1 = dokdokma.player;
    const p2 = dokdokma.player2;
    const p3 = dokdokma.player3;
    const pig = dokdokma.pig;

    const dist1 = Math.hypot(p1.x - pig.x, p1.y - pig.y);
    const dist2 = dokdokma.activePlayersCount >= 2 ? Math.hypot(p2.x - pig.x, p2.y - pig.y) : Infinity;
    const dist3 = dokdokma.activePlayersCount >= 3 ? Math.hypot(p3.x - pig.x, p3.y - pig.y) : Infinity;

    ctx.fillStyle = dist1 <= dokdokma.catchRadius ? "rgba(194, 130, 69, 0.35)" : "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, dokdokma.catchRadius, 0, Math.PI * 2);
    ctx.fill();

    if (dokdokma.activePlayersCount >= 2) {
        ctx.fillStyle = dist2 <= dokdokma.catchRadius ? "rgba(46, 90, 120, 0.35)" : "rgba(255, 255, 255, 0.08)";
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, dokdokma.catchRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    if (dokdokma.activePlayersCount >= 3) {
        ctx.fillStyle = dist3 <= dokdokma.catchRadius ? "rgba(140, 90, 50, 0.35)" : "rgba(255, 255, 255, 0.08)";
        ctx.beginPath();
        ctx.arc(p3.x, p3.y, dokdokma.catchRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.save();
    ctx.translate(p1.x, p1.y);
    if (!p1.facingRight) ctx.scale(-1, 1);
    let isMoving1 = p1.frameIndex > 0 || (keys["KeyA"] || keys["KeyD"] || keys["KeyW"] || keys["KeyS"] || dualTouchState.p1JoystickActive);
    if (isMoving1 && playerRunImg.complete && playerRunImg.naturalWidth !== 0) {
        const totalFrames = 4;
        const frameWidth = playerRunImg.naturalWidth / totalFrames;
        const frameHeight = playerRunImg.naturalHeight;
        const sourceX = p1.frameIndex * frameWidth;
        ctx.drawImage(playerRunImg, sourceX, 0, frameWidth, frameHeight, -50, -50, 100, 100);
    } else if (playerImg.complete && playerImg.naturalWidth !== 0) {
        ctx.drawImage(playerImg, -38, -38, 76, 76);
    } else {
        ctx.fillStyle = "#3A6351";
        ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    if (dokdokma.activePlayersCount >= 2) {
        ctx.save();
        ctx.translate(p2.x, p2.y);
        if (!p2.facingRight) ctx.scale(-1, 1);
        let isMoving2 = p2.frameIndex > 0 || (keys["ArrowLeft"] || keys["ArrowRight"] || keys["ArrowUp"] || keys["ArrowDown"] || dualTouchState.p2JoystickActive);
        if (isMoving2 && playerRunImg.complete && playerRunImg.naturalWidth !== 0) {
            const totalFrames = 4;
            const frameWidth = playerRunImg.naturalWidth / totalFrames;
            const frameHeight = playerRunImg.naturalHeight;
            const sourceX = p2.frameIndex * frameWidth;
            ctx.drawImage(playerRunImg, sourceX, 0, frameWidth, frameHeight, -50, -50, 100, 100);
        } else if (player2Img.complete && player2Img.naturalWidth !== 0) {
            ctx.drawImage(player2Img, -38, -38, 76, 76);
        } else {
            ctx.fillStyle = "#2E5A78";
            ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    if (dokdokma.activePlayersCount >= 3) {
        ctx.save();
        ctx.translate(p3.x, p3.y);
        if (!p3.facingRight) ctx.scale(-1, 1);
        let isMoving3 = p3.frameIndex > 0 || (keys["KeyJ"] || keys["KeyL"] || keys["KeyI"] || keys["KeyK"]);
        if (isMoving3 && playerRunImg.complete && playerRunImg.naturalWidth !== 0) {
            const totalFrames = 4;
            const frameWidth = playerRunImg.naturalWidth / totalFrames;
            const frameHeight = playerRunImg.naturalHeight;
            const sourceX = p3.frameIndex * frameWidth;
            ctx.drawImage(playerRunImg, sourceX, 0, frameWidth, frameHeight, -50, -50, 100, 100);
        } else if (player3Img.complete && player3Img.naturalWidth !== 0) {
            ctx.drawImage(player3Img, -38, -38, 76, 76);
        } else {
            ctx.fillStyle = "#8C5A32";
            ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    ctx.save();
    ctx.translate(pig.x, pig.y);
    if (pig.vx < 0) ctx.scale(-1, 1);
    if (pigImg.complete && pigImg.naturalWidth !== 0) {
        const frameWidth = pigImg.naturalWidth / pig.totalFrames;
        const frameHeight = pigImg.naturalHeight;
        const sourceX = pig.frameIndex * frameWidth;
        ctx.drawImage(pigImg, sourceX, 0, frameWidth, frameHeight, -55, -55, 110, 110);
    } else {
        ctx.fillStyle = "#D39E82";
        ctx.beginPath(); ctx.arc(0, 0, 42, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    if (currentDeviceMode === "PHONE") drawDualJoysticksUI();

    if (dokdokma.activePlayersCount >= 2 && currentDeviceMode === "PHONE") {
        drawKalingaGrabBtn(dokdokma.p1GrabBtnDual.cx, dokdokma.p1GrabBtnDual.cy, dokdokma.p1GrabBtnDual.r, "P1 GRAB", dist1 <= dokdokma.catchRadius);
        drawKalingaGrabBtn(dokdokma.p2GrabBtnDual.cx, dokdokma.p2GrabBtnDual.cy, dokdokma.p2GrabBtnDual.r, "P2 GRAB", dist2 <= dokdokma.catchRadius);
    } else {
        let grabInRange = dist1 <= dokdokma.catchRadius;
        if (dokdokma.activePlayersCount >= 2) grabInRange = grabInRange || (dist2 <= dokdokma.catchRadius);
        if (dokdokma.activePlayersCount >= 3) grabInRange = grabInRange || (dist3 <= dokdokma.catchRadius);
        drawKalingaGrabBtn(dokdokma.p1GrabBtnSingle.cx, dokdokma.p1GrabBtnSingle.cy, dokdokma.p1GrabBtnSingle.r, "GRAB", grabInRange);
    }

    drawGameTopBar(
        `DOKDOKMA | ${dokdokma.practiceMode ? "PRACTICE" : dokdokma.timedChallenge ? "TIMED CHALLENGE" : dokdokma.difficulty.name} | ${dokdokma.activePlayersCount} PLAYER${dokdokma.activePlayersCount > 1 ? "S" : ""}`,
        dokdokma.practiceMode
            ? "UNTIMED PRACTICE"
            : dokdokma.timedChallenge
                ? `LEFT ${formatTime(Math.max(0, dokdokma.challengeTimeLimit - dokdokma.elapsedTime))}`
                : `TIME ${formatTime(dokdokma.elapsedTime)}`
    );
    drawInGamePauseButton();

    const barW = 400;
    const barX = (VIRTUAL_WIDTH - barW) / 2;

    ctx.fillStyle = "#120F0D";
    ctx.fillRect(barX, cage.y + cage.h + 20, barW, 16);
    ctx.fillStyle = "#C28245";
    ctx.fillRect(barX, cage.y + cage.h + 20, (dokdokma.gripProgress / 100) * barW, 16);
    ctx.strokeStyle = "#E2D7C5";
    ctx.strokeRect(barX, cage.y + cage.h + 20, barW, 16);

    ctx.fillStyle = "#120F0D";
    ctx.fillRect(barX, cage.y + cage.h + 45, barW, 14);

    if (dokdokma.activePlayersCount === 1) {
        ctx.fillStyle = p1.stamina > 25 ? "#3A6351" : "#A34836";
        ctx.fillRect(barX, cage.y + cage.h + 45, (p1.stamina / 100) * barW, 14);
    } else if (dokdokma.activePlayersCount === 2) {
        ctx.fillStyle = p1.stamina > 25 ? "#3A6351" : "#A34836";
        ctx.fillRect(barX, cage.y + cage.h + 45, (p1.stamina / 100) * (barW / 2) - 1, 14);
        ctx.fillStyle = p2.stamina > 25 ? "#2E5A78" : "#A34836";
        ctx.fillRect(barX + barW / 2, cage.y + cage.h + 45, (p2.stamina / 100) * (barW / 2) - 1, 14);
    } else if (dokdokma.activePlayersCount === 3) {
        const thirdW = barW / 3;
        ctx.fillStyle = p1.stamina > 25 ? "#3A6351" : "#A34836";
        ctx.fillRect(barX, cage.y + cage.h + 45, (p1.stamina / 100) * thirdW - 1, 14);
        ctx.fillStyle = p2.stamina > 25 ? "#2E5A78" : "#A34836";
        ctx.fillRect(barX + thirdW, cage.y + cage.h + 45, (p2.stamina / 100) * thirdW - 1, 14);
        ctx.fillStyle = p3.stamina > 25 ? "#8C5A32" : "#A34836";
        ctx.fillRect(barX + thirdW * 2, cage.y + cage.h + 45, (p3.stamina / 100) * thirdW - 1, 14);
    }
    ctx.strokeStyle = "#E2D7C5";
    ctx.strokeRect(barX, cage.y + cage.h + 45, barW, 14);

    if (dokdokma.isCountingDown) {
        ctx.fillStyle = "rgba(18, 15, 13, 0.75)";
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#E5A93C";
        ctx.font = "bold 90px sans-serif";
        ctx.fillText(dokdokma.countdownTimer > 0 ? dokdokma.countdownTimer : "GO!", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2);
        ctx.textBaseline = "alphabetic";
    }

    if (dokdokma.isPaused) drawGamePausePanel();

    if (dokdokma.isGameOver) {
        ctx.fillStyle = "rgba(18, 15, 13, 0.88)";
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
        drawResultPanel();
        drawResultEffect(dokdokma.hasWon, dokdokma.resultStartedAt);

        ctx.textAlign = "center";
        ctx.fillStyle = dokdokma.hasWon ? "#E5A93C" : "#D4775D";
        ctx.font = "bold 40px sans-serif";
        ctx.shadowColor = dokdokma.hasWon ? "#E5A93C" : "#A34836";
        ctx.shadowBlur = 12;
        const resultTitle = dokdokma.practiceMode
            ? "PRACTICE COMPLETE"
            : dokdokma.timedChallenge && dokdokma.hasWon
                ? "CHALLENGE CLEARED!"
                : dokdokma.resultReason === "TIME_UP" ? "TIME'S UP" : dokdokma.hasWon ? "YOU WIN!" : "GAME OVER";
        ctx.fillText(resultTitle, VIRTUAL_WIDTH / 2, 195);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#C7B79E";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("DOKDOKMA RUN RECAP", VIRTUAL_WIDTH / 2, 219);

        const tileY = 237;
        const tileW = 190;
        const tileGap = 12;
        const tileStartX = (VIRTUAL_WIDTH - (tileW * 4 + tileGap * 3)) / 2;
        const modeLabel = dokdokma.practiceMode
            ? `PRACTICE / ${dokdokma.difficulty.name}`
            : dokdokma.timedChallenge ? `CHALLENGE / ${dokdokma.difficulty.name}` : dokdokma.difficulty.name;
        const timeLabel = dokdokma.timedChallenge ? "TIME LEFT" : "TIME";
        const timeValue = dokdokma.practiceMode
            ? "NOT TIMED"
            : dokdokma.timedChallenge
                ? formatTime(Math.max(0, dokdokma.challengeTimeLimit - dokdokma.elapsedTime))
                : formatTime(dokdokma.elapsedTime);
        drawResultStatTile(tileStartX, tileY, tileW, "MODE", modeLabel, "#6BA2B5");
        drawResultStatTile(tileStartX + tileW + tileGap, tileY, tileW, "PLAYERS", `${dokdokma.activePlayersCount} PLAYER${dokdokma.activePlayersCount > 1 ? "S" : ""}`, "#C28245");
        drawResultStatTile(tileStartX + (tileW + tileGap) * 2, tileY, tileW, timeLabel, timeValue, "#E5A93C");
        drawResultStatTile(tileStartX + (tileW + tileGap) * 3, tileY, tileW, "CATCH PROGRESS", `${Math.round(dokdokma.gripProgress)}%`, "#6F9B72");

        let rewardText = "No artifact earned on this run.";
        let rewardColor = "#C7B79E";
        if (dokdokma.practiceMode) {
            rewardText = "Practice runs do not award artifacts or records.";
            rewardColor = "#6BA2B5";
        } else if (dokdokma.newArtifactUnlocked && currentRunArtifact) {
            rewardText = `Collected: ${currentRunArtifact.name}`;
            rewardColor = "#E5A93C";
        } else if (dokdokma.hasWon && !currentRunArtifact) {
            rewardText = `All ${dokdokma.difficulty.name} artifacts collected.`;
            rewardColor = "#6F9B72";
        }
        drawResultInfoRow(278, 326, 724, "ARTIFACT / REWARD", rewardText, rewardColor);

        const playerList = [dokdokma.player, dokdokma.player2, dokdokma.player3].slice(0, dokdokma.activePlayersCount);
        const staminaText = playerList.map((player, index) => `P${index + 1} ${Math.round(player.stamina)}%`).join("  |  ");
        drawResultInfoRow(278, 380, 724, "REMAINING STAMINA", staminaText, "#C28245");

        const bestTime = personalBestTimes.dokdokma[dokdokma.difficulty.name];
        const recordText = dokdokma.practiceMode
            ? "Personal bests are not affected by practice."
            : dokdokma.resultReason === "TIME_UP"
                ? `The ${dokdokma.challengeTimeLimit}-second challenge ended before the pig was caught.`
            : `${dokdokma.newPersonalBest ? "NEW PERSONAL BEST" : "PERSONAL BEST"}: ${bestTime === null ? "NOT SET" : formatTime(bestTime)}`;
        ctx.textAlign = "center";
        ctx.fillStyle = dokdokma.practiceMode ? "#6BA2B5" : "#E5A93C";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText(recordText, VIRTUAL_WIDTH / 2, 454);
        drawResultActions();
    }
}

// =============================================
// KADANG-KADANG CANVAS RENDERING (WITH DYNAMIC TILT & STUMBLE)
// =============================================
function drawTraditionalPlayer(ctx, player, x, y, isPlayerTwo = false) {
    const walking = player.animTime;
    const moving = player.speed > 0.1 && !player.isStumbling;
    const stepSwing = moving ? Math.sin(walking) * 0.035 : 0;
    const bodyBob = moving ? Math.abs(Math.sin(walking)) * Math.min(3, player.speed * 0.7) : 0;
    const bodySway = moving ? Math.sin(walking) * 0.015 : 0;

    ctx.save();
    ctx.translate(x, y);

    const balanceOffset = player.balance - 50;

    if (player.isStumbling) {
        const stumbleProgress = 1 - (player.stumbleCooldown / 60);

        if (stumbleProgress < 0.35) {
            const wobbleAngle = Math.sin(stumbleProgress * 30) * 0.12;
            ctx.rotate(wobbleAngle);
        } else {
            const fallProgress = (stumbleProgress - 0.35) / 0.65;
            const targetRotation = (balanceOffset > 0 ? Math.PI / 2.2 : -Math.PI / 2.2) * Math.min(1, fallProgress * 1.5);
            ctx.rotate(targetRotation);
            ctx.translate(fallProgress * 12, fallProgress * 18);
        }
    } else {
        let leanTilt = 0;
        if (player.balance !== 50) {
            leanTilt = (balanceOffset / 50) * 0.18;
        }

        const wobbleShake = player.wobbleTime > 0 ? Math.sin(player.wobbleTime * 1.5) * 0.06 : 0;
        ctx.rotate(leanTilt + wobbleShake);
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const leftX = -12;
    const rightX = 12;

    [leftX, rightX].forEach((stiltX, index) => {
        ctx.save();
        ctx.translate(stiltX, 6);
        ctx.rotate(index === 0 ? stepSwing : -stepSwing);
        ctx.strokeStyle = "#8C713B";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -102);
        ctx.stroke();
        ctx.fillStyle = "#A8844E";
        ctx.fillRect(-5, -28, 10, 4);
        ctx.restore();
    });

    const spriteImg = isPlayerTwo ? kadangPlayer2Img : kadangPlayer1Img;
    const spriteWidth = 65;
    const spriteHeight = 86;

    ctx.save();
    ctx.translate(Math.sin(walking) * (moving ? 1 : 0), -bodyBob);
    ctx.rotate(bodySway);
    if (spriteImg && spriteImg.complete && spriteImg.naturalWidth !== 0) {
        ctx.drawImage(spriteImg, -spriteWidth / 2, -spriteHeight - 22, spriteWidth, spriteHeight);
    } else {
        ctx.fillStyle = isPlayerTwo ? "#2D4263" : "#C84B31";
        ctx.beginPath();
        ctx.ellipse(0, -38, 15, 26, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#1E1812";
        ctx.beginPath();
        ctx.arc(0, -56, 9, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    ctx.restore();
}

function drawKadangFinishLine(halfTrackWidth) {
    const finishY = VIRTUAL_HEIGHT * 0.62;
    const roadTopY = VIRTUAL_HEIGHT * 0.60;
    const roadBottomY = VIRTUAL_HEIGHT * 0.95;

    const progress = (finishY - roadTopY) / (roadBottomY - roadTopY);

    const leftEdge = halfTrackWidth * 0.35 +
        (halfTrackWidth * 0.05 - halfTrackWidth * 0.35) * progress;

    const rightEdge = halfTrackWidth * 0.65 +
        (halfTrackWidth * 0.95 - halfTrackWidth * 0.65) * progress;

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(halfTrackWidth * 0.35, roadTopY);
    ctx.lineTo(halfTrackWidth * 0.65, roadTopY);
    ctx.lineTo(halfTrackWidth * 0.95, roadBottomY);
    ctx.lineTo(halfTrackWidth * 0.05, roadBottomY);
    ctx.closePath();
    ctx.clip();

    const squareSize = 16;
    const lineHeight = 18;
    const lineTop = finishY - lineHeight / 2;

    for (let x = leftEdge; x < rightEdge; x += squareSize) {
        const column = Math.floor((x - leftEdge) / squareSize);

        for (let y = lineTop; y < lineTop + lineHeight; y += squareSize / 2) {
            const row = Math.floor((y - lineTop) / (squareSize / 2));

            ctx.fillStyle = (column + row) % 2 === 0
                ? "#FFFFFF"
                : "#171717";

            ctx.fillRect(
                x,
                y,
                Math.min(squareSize, rightEdge - x),
                Math.min(squareSize / 2, lineTop + lineHeight - y)
            );
        }
    }

    ctx.restore();

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 22px sans-serif";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#171717";

    ctx.strokeText(
        "FINISH",
        (leftEdge + rightEdge) / 2,
        finishY - 25
    );

    ctx.fillStyle = "#FFFFFF";

    ctx.fillText(
        "FINISH",
        (leftEdge + rightEdge) / 2,
        finishY - 25
    );

    ctx.restore();
}

function drawKadangBalanceHUD(player, x, y, playerName, controls) {
    const width = 260;
    const height = 88;

    const stability = Math.max(
        0,
        Math.min(100, 100 - Math.abs(player.balance - 50) * 2)
    );

    let barColor = "#43A66B";
    if (player.isStumbling) {
        barColor = "#D94343";
    } else if (stability < 70) {
        barColor = "#E5A93C";
    }

    ctx.save();

    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = barColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(playerName, x + 12, y + 20);

    ctx.textAlign = "right";
    ctx.fillStyle = "#C5C5C5";
    ctx.font = "12px sans-serif";
    ctx.fillText(controls, x + width - 12, y + 20);

    ctx.textAlign = "left";
    ctx.fillStyle = "#E5A93C";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("BALANCE STABILITY", x + 12, y + 40);

    const barX = x + 12;
    const barY = y + 47;
    const barW = width - 24;
    const barH = 12;

    ctx.fillStyle = "#303846";
    ctx.fillRect(barX, barY, barW, barH);

    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barW * (stability / 100), barH);

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.restore();
}

function drawKadangTouchControllers(ctx) {
    const btnW = 260;
    const btnH = 90;
    const btnY = 580;

    // Left Foot Button (Left side of viewport)
    ctx.fillStyle = "#3A6351";
    ctx.fillRect(40, btnY, btnW, btnH);
    ctx.strokeStyle = "#E5A93C";
    ctx.lineWidth = 3;
    ctx.strokeRect(40, btnY, btnW, btnH);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LEFT FOOT", 40 + btnW / 2, btnY + btnH / 2);

    // Right Foot Button (Right side of viewport)
    ctx.fillStyle = "#2E5A78";
    ctx.fillRect(340, btnY, btnW, btnH);
    ctx.strokeStyle = "#E5A93C";
    ctx.lineWidth = 3;
    ctx.strokeRect(340, btnY, btnW, btnH);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("RIGHT FOOT", 340 + btnW / 2, btnY + btnH / 2);
    ctx.textBaseline = "alphabetic";
}

function drawKadangCloud(x, y, scale) {
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    ctx.beginPath();
    ctx.ellipse(x, y, 42 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 22 * scale, y - 7 * scale, 22 * scale, 17 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 2 * scale, y - 14 * scale, 28 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 27 * scale, y - 5 * scale, 23 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawKadangScenery(viewWidth) {
    const scaleX = viewWidth / 640;
    ctx.save();
    ctx.scale(scaleX, 1);
    drawKadangCloud(115, 170, 0.9);
    drawKadangCloud(500, 140, 0.7);

    ctx.fillStyle = "#A5C3B6";
    ctx.beginPath();
    ctx.moveTo(0, 350);
    ctx.lineTo(85, 255);
    ctx.lineTo(150, 325);
    ctx.lineTo(245, 205);
    ctx.lineTo(345, 330);
    ctx.lineTo(425, 235);
    ctx.lineTo(520, 325);
    ctx.lineTo(580, 270);
    ctx.lineTo(640, 355);
    ctx.lineTo(640, VIRTUAL_HEIGHT * 0.6);
    ctx.lineTo(0, VIRTUAL_HEIGHT * 0.6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#719783";
    ctx.beginPath();
    ctx.moveTo(0, 390);
    ctx.lineTo(95, 305);
    ctx.lineTo(185, 365);
    ctx.lineTo(295, 270);
    ctx.lineTo(390, 370);
    ctx.lineTo(485, 300);
    ctx.lineTo(640, 385);
    ctx.lineTo(640, VIRTUAL_HEIGHT * 0.6);
    ctx.lineTo(0, VIRTUAL_HEIGHT * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawKadangPlayerView(player, playerNum, offsetX, viewWidth) {
    ctx.save();
    ctx.translate(offsetX, 0);
    ctx.beginPath();
    ctx.rect(0, 0, viewWidth, VIRTUAL_HEIGHT);
    ctx.clip();

    ctx.fillStyle = "#76C6F2";
    ctx.fillRect(0, 0, viewWidth, VIRTUAL_HEIGHT);

    drawKadangScenery(viewWidth);

    ctx.fillStyle = "#B88A52";
    ctx.fillRect(0, VIRTUAL_HEIGHT * 0.6, viewWidth, VIRTUAL_HEIGHT * 0.4);
    ctx.fillStyle = "#D4A66C";
    ctx.beginPath();
    ctx.moveTo(viewWidth * 0.35, VIRTUAL_HEIGHT * 0.6);
    ctx.lineTo(viewWidth * 0.65, VIRTUAL_HEIGHT * 0.6);
    ctx.lineTo(viewWidth * 0.95, VIRTUAL_HEIGHT * 0.95);
    ctx.lineTo(viewWidth * 0.05, VIRTUAL_HEIGHT * 0.95);
    ctx.closePath();
    ctx.fill();
    drawKadangFinishLine(viewWidth);

    const progress = Math.min(player.distance / kadang.targetDistance, 1);
    const startY = VIRTUAL_HEIGHT * 0.90;
    const finishPosY = VIRTUAL_HEIGHT * 0.65;
    const playerY = startY - progress * (startY - finishPosY);

    drawTraditionalPlayer(ctx, player, viewWidth * 0.5, playerY, playerNum === 2);
    drawKadangBalanceHUD(player, 30, 30, `PLAYER ${playerNum}`, playerNum === 1 ? "A / D" : "◄ / ►");
    ctx.save();
    if (viewWidth > 640) ctx.translate((viewWidth - 640) / 2, 0);
    drawKadangTouchControllers(ctx);
    ctx.restore();
    ctx.restore();
}

function renderKadang() {
    ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    drawCanvasBackground();

    const halfW = VIRTUAL_WIDTH / 2;
    if (kadang.activePlayersCount === 1) {
        drawKadangPlayerView(kadang.p1, 1, 0, VIRTUAL_WIDTH);
    } else {
        drawKadangPlayerView(kadang.p1, 1, 0, halfW);

        ctx.strokeStyle = "#E5A93C";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(halfW, 0);
        ctx.lineTo(halfW, VIRTUAL_HEIGHT);
        ctx.stroke();

        drawKadangPlayerView(kadang.p2, 2, halfW, halfW);
    }

    drawGameTopBar(
        `KADANG-KADANG | ${kadang.mode.replace(/_/g, " ")}`,
        kadang.practiceMode
            ? "UNTIMED PRACTICE"
            : kadang.challengeType
                ? `LEFT ${formatTime(Math.max(0, kadang.soloTimeLimit - kadang.elapsedTime))}`
                : `TIME ${formatTime(kadang.elapsedTime)}`
    );
    drawInGamePauseButton();

    if (kadang.isCountingDown) {
        ctx.fillStyle = "rgba(18, 15, 13, 0.75)";
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#E5A93C";
        ctx.font = "bold 90px sans-serif";

        let displayText = kadang.countdownTimer > 0 ? kadang.countdownTimer : "GO!";
        ctx.fillText(displayText, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2);
        ctx.textBaseline = "alphabetic";
    }

    if (kadang.isPaused) drawGamePausePanel();

    if (kadang.isGameOver) {
        ctx.fillStyle = "rgba(18, 15, 13, 0.88)";
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
        drawResultPanel();
        const didComplete = kadang.resultOutcome === "WIN";
        drawResultEffect(didComplete, kadang.resultStartedAt, 640, 290);
        if (kadang.activePlayersCount > 1 && didComplete) {
            drawResultEffect(false, kadang.resultStartedAt, 820, 330);
        }

        ctx.textAlign = "center";
        ctx.fillStyle = didComplete ? "#E5A93C" : "#D4775D";
        ctx.font = "bold 38px sans-serif";
        ctx.shadowColor = didComplete ? "#E5A93C" : "#A34836";
        ctx.shadowBlur = 12;
        const resultTitle = kadang.practiceMode
            ? "PRACTICE COMPLETE"
            : didComplete
                ? kadang.activePlayersCount === 1 ? "CHALLENGE COMPLETE" : `${kadang.winner.toUpperCase()} WINS!`
                : kadang.resultReason === "TIME_UP" ? "TIME'S UP" : "FALL DETECTED";
        ctx.fillText(resultTitle, VIRTUAL_WIDTH / 2, 195);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#C7B79E";
        ctx.font = "bold 12px sans-serif";
        const recapSubtitle = kadang.activePlayersCount === 1
            ? kadang.practiceMode ? "SOLO PRACTICE RECAP" : "SOLO CHALLENGE RECAP"
            : "KADANG-KADANG RACE RECAP";
        ctx.fillText(recapSubtitle, VIRTUAL_WIDTH / 2, 219);

        const tileW = 190;
        const tileGap = 12;
        const tileStartX = (VIRTUAL_WIDTH - (tileW * 4 + tileGap * 3)) / 2;
        if (kadang.activePlayersCount === 1) {
            const soloModeLabel = kadang.practiceMode
                ? "SOLO PRACTICE"
                : kadang.challengeType === "NO_FALL" ? "NO-FALL" : "TIME TRIAL";
            const soloResultLabel = kadang.practiceMode
                ? "FINISHED"
                : didComplete ? "COMPLETED" : kadang.resultReason === "TIME_UP" ? "TIME UP" : "FALL";
            const timeValue = kadang.practiceMode
                ? "NOT TIMED"
                : `LEFT ${formatTime(Math.max(0, kadang.soloTimeLimit - kadang.elapsedTime))}`;
            drawResultStatTile(tileStartX, 237, tileW, "MODE", soloModeLabel, "#6BA2B5");
            drawResultStatTile(tileStartX + tileW + tileGap, 237, tileW, "RESULT", soloResultLabel, didComplete ? "#6F9B72" : "#D4775D");
            drawResultStatTile(tileStartX + (tileW + tileGap) * 2, 237, tileW, "TIME", timeValue, "#E5A93C");
            drawResultStatTile(tileStartX + (tileW + tileGap) * 3, 237, tileW, "ROUTE", `${Math.round(kadang.p1.distance)} / ${kadang.targetDistance}`, "#C28245");

            const performanceTileW = 350;
            const performanceGap = 24;
            const performanceStartX = (VIRTUAL_WIDTH - (performanceTileW * 2 + performanceGap)) / 2;
            drawResultStatTile(performanceStartX, 326, performanceTileW, "STEPS", `${kadang.p1.stepCount}`, "#C28245");
            drawResultStatTile(performanceStartX + performanceTileW + performanceGap, 326, performanceTileW, "STUMBLES", `${kadang.p1.stumbleCount}`, "#D4775D");
        } else {
            drawResultStatTile(tileStartX, 237, tileW, "MODE", kadang.practiceMode ? "PRACTICE" : "RACE", "#6BA2B5");
            drawResultStatTile(tileStartX + tileW + tileGap, 237, tileW, "TIME", kadang.practiceMode ? "NOT TIMED" : formatTime(kadang.elapsedTime), "#E5A93C");
            drawResultStatTile(tileStartX + (tileW + tileGap) * 2, 237, tileW, "WINNER", kadang.winner.toUpperCase(), "#6F9B72");
            drawResultStatTile(tileStartX + (tileW + tileGap) * 3, 237, tileW, "LOSER", kadang.loser.toUpperCase(), "#D4775D");

            const performanceTileW = 350;
            const performanceGap = 24;
            const performanceStartX = (VIRTUAL_WIDTH - (performanceTileW * 2 + performanceGap)) / 2;
            drawResultStatTile(performanceStartX, 326, performanceTileW, "PLAYER 1 PERFORMANCE", `${kadang.p1.stepCount} STEPS / ${kadang.p1.stumbleCount} STUMBLES`, "#C28245");
            drawResultStatTile(performanceStartX + performanceTileW + performanceGap, 326, performanceTileW, "PLAYER 2 PERFORMANCE", `${kadang.p2.stepCount} STEPS / ${kadang.p2.stumbleCount} STUMBLES`, "#C28245");
        }

        const recordText = kadang.practiceMode
            ? "Personal bests and progression are not affected by practice."
            : kadang.activePlayersCount === 1
                ? "Solo challenges do not change the two-player race record."
                : `${kadang.newPersonalBest ? "NEW PERSONAL BEST" : "FASTEST WIN"}: ${formatTime(personalBestTimes.kadang)}`;
        ctx.fillStyle = kadang.practiceMode || kadang.activePlayersCount === 1 ? "#6BA2B5" : "#E5A93C";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText(recordText, VIRTUAL_WIDTH / 2, 444);
        drawResultActions();
    }
}

function renderLobby() {
    ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    if (lobbyBgImg.complete && lobbyBgImg.naturalWidth !== 0) {
        ctx.drawImage(lobbyBgImg, 0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    } else {
        drawCanvasBackground();
    }

    ctx.fillStyle = "rgba(18, 15, 13, 0.55)";
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    ctx.fillStyle = "#E5A93C";
    ctx.font = "bold 40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CHOOSE YOUR GAME", VIRTUAL_WIDTH / 2, 100);

    ctx.fillStyle = "#E2D7C5";
    ctx.font = "18px sans-serif";
    ctx.fillText("Traditional Kalinga games, ready to play", VIRTUAL_WIDTH / 2, 135);
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "#C28245";
    ctx.fillText(`${currentDeviceMode} MODE`, VIRTUAL_WIDTH / 2, 170);

    const dokPlayers = currentDeviceMode === "PHONE" ? "1-2 PLAYERS | CO-OP" : "1-3 PLAYERS | CO-OP";
    drawLobbyCard(
        LOBBY_CARDS.dokdokma,
        "DOKDOKMA",
        "Catch the escaped pig",
        dokPlayers,
        "#3A6351",
        pigImg,
        true
    );
    drawLobbyCard(
        LOBBY_CARDS.kadang,
        "KADANG-KADANG",
        "Race on traditional stilts",
        "2 PLAYERS | LOCAL RACE",
        "#2E5A78",
        kadangPlayer1Img,
        false
    );

    ctx.fillStyle = "#E2D7C5";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MORE TO EXPLORE", VIRTUAL_WIDTH / 2, 592);
    drawLobbyAction(LOBBY_ACTIONS.howToPlay, "HOW TO PLAY");
    drawLobbyAction(LOBBY_ACTIONS.achievements, "ACHIEVEMENTS");
    drawLobbyAction(LOBBY_ACTIONS.artifacts, "CULTURAL ARTIFACTS");
}

function drawLobbyAction(rect, label) {
    ctx.fillStyle = "rgba(36, 27, 21, 0.94)";
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = "#C28245";
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = "#E5C396";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.textBaseline = "alphabetic";
}

function drawLobbyCard(rect, title, description, playerMode, color, image, isSpriteSheet) {
    ctx.fillStyle = "rgba(32, 24, 18, 0.94)";
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

    ctx.fillStyle = color;
    ctx.fillRect(rect.x, rect.y, rect.w, 8);

    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.fillRect(rect.x + 14, rect.y + 16, rect.w - 28, 112);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, rect.y + 73, 43, 0, Math.PI * 2);
    ctx.fill();

    if (image.complete && image.naturalWidth > 0) {
        if (isSpriteSheet) {
            const frameWidth = image.naturalWidth / 4;
            ctx.drawImage(image, 0, 0, frameWidth, image.naturalHeight, rect.x + 90, rect.y + 35, 100, 74);
        } else {
            ctx.drawImage(image, rect.x + 108, rect.y + 27, 64, 86);
        }
    } else {
        ctx.fillStyle = "#E2D7C5";
        ctx.beginPath();
        ctx.arc(rect.x + rect.w / 2, rect.y + 57, 14, 0, Math.PI * 2);
        ctx.ellipse(rect.x + rect.w / 2, rect.y + 91, 28, 16, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = "#E5A93C";
    ctx.font = "bold 21px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title, rect.x + rect.w / 2, rect.y + 157);

    ctx.fillStyle = "#E2D7C5";
    ctx.font = "15px sans-serif";
    ctx.fillText(description, rect.x + rect.w / 2, rect.y + 186);

    ctx.fillStyle = "#C9B89C";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(playerMode, rect.x + rect.w / 2, rect.y + 216);

    const button = { x: rect.x + 22, y: rect.y + rect.h - 52, w: rect.w - 44, h: 36 };
    ctx.fillStyle = color;
    ctx.fillRect(button.x, button.y, button.w, button.h);
    ctx.strokeStyle = "#E5A93C";
    ctx.lineWidth = 2;
    ctx.strokeRect(button.x, button.y, button.w, button.h);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("PLAY GAME", rect.x + rect.w / 2, button.y + 23);
}

function drawCulturalArtifactIcon(iconName, centerX, centerY, size, color) {
    ctx.save();
    ctx.translate(centerX - size / 2, centerY - size / 2);
    ctx.scale(size / 48, size / 48);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (iconName) {
        case "pottery":
            ctx.beginPath();
            ctx.moveTo(18, 8); ctx.lineTo(30, 8); ctx.lineTo(30, 15);
            ctx.quadraticCurveTo(35, 25, 37, 32);
            ctx.quadraticCurveTo(36, 41, 24, 42);
            ctx.quadraticCurveTo(12, 41, 11, 32);
            ctx.quadraticCurveTo(13, 24, 18, 15); ctx.closePath();
            ctx.moveTo(15, 29); ctx.quadraticCurveTo(24, 33, 34, 29);
            ctx.stroke();
            break;
        case "pendant":
            ctx.beginPath();
            ctx.arc(24, 8, 4, 0, Math.PI * 2);
            ctx.moveTo(24, 12); ctx.lineTo(35, 24); ctx.lineTo(24, 40);
            ctx.lineTo(13, 24); ctx.closePath();
            ctx.moveTo(18, 24); ctx.lineTo(30, 24);
            ctx.stroke();
            break;
        case "basket":
            ctx.beginPath();
            ctx.ellipse(24, 13, 18, 7, 0, 0, Math.PI * 2);
            ctx.moveTo(6, 13); ctx.lineTo(11, 36); ctx.quadraticCurveTo(24, 44, 37, 36); ctx.lineTo(42, 13);
            ctx.moveTo(12, 18); ctx.lineTo(15, 37);
            ctx.moveTo(20, 19); ctx.lineTo(21, 40);
            ctx.moveTo(28, 19); ctx.lineTo(27, 40);
            ctx.moveTo(36, 18); ctx.lineTo(33, 37);
            ctx.moveTo(9, 23); ctx.quadraticCurveTo(24, 28, 39, 23);
            ctx.moveTo(10, 30); ctx.quadraticCurveTo(24, 35, 38, 30);
            ctx.stroke();
            break;
        case "woven":
            ctx.beginPath();
            ctx.rect(7, 9, 34, 30);
            for (let x = 14; x < 40; x += 7) {
                ctx.moveTo(x, 10); ctx.lineTo(x, 38);
            }
            for (let y = 16; y < 38; y += 7) {
                ctx.moveTo(8, y); ctx.lineTo(40, y);
            }
            ctx.stroke();
            break;
        case "headband":
            ctx.beginPath();
            ctx.moveTo(7, 16); ctx.quadraticCurveTo(24, 5, 41, 16);
            ctx.lineTo(39, 28); ctx.quadraticCurveTo(24, 19, 9, 28); ctx.closePath();
            ctx.moveTo(10, 18); ctx.quadraticCurveTo(24, 10, 38, 18);
            ctx.moveTo(12, 23); ctx.lineTo(36, 23);
            ctx.stroke();
            break;
        case "ring":
            ctx.beginPath();
            ctx.ellipse(24, 25, 17, 12, 0, 0, Math.PI * 2);
            ctx.ellipse(24, 25, 9, 5, 0, 0, Math.PI * 2);
            ctx.moveTo(12, 15); ctx.lineTo(16, 11);
            ctx.moveTo(32, 11); ctx.lineTo(36, 15);
            ctx.stroke();
            break;
        case "flute":
            ctx.beginPath();
            ctx.moveTo(13, 40); ctx.lineTo(35, 8);
            ctx.moveTo(18, 33); ctx.lineTo(23, 36);
            ctx.moveTo(23, 25); ctx.lineTo(28, 28);
            ctx.moveTo(28, 17); ctx.lineTo(33, 20);
            ctx.stroke();
            break;
        case "pouch":
            ctx.beginPath();
            ctx.moveTo(15, 17); ctx.quadraticCurveTo(24, 22, 33, 17);
            ctx.lineTo(37, 39); ctx.quadraticCurveTo(24, 44, 11, 39); ctx.closePath();
            ctx.moveTo(16, 18); ctx.quadraticCurveTo(12, 7, 23, 7);
            ctx.quadraticCurveTo(34, 7, 32, 18);
            ctx.moveTo(13, 29); ctx.lineTo(35, 29);
            ctx.stroke();
            break;
        case "utensil":
            ctx.beginPath();
            ctx.ellipse(18, 14, 8, 10, -0.5, 0, Math.PI * 2);
            ctx.moveTo(24, 21); ctx.lineTo(37, 41);
            ctx.stroke();
            break;
        case "ladle":
            ctx.beginPath();
            ctx.ellipse(16, 15, 9, 8, 0, 0, Math.PI * 2);
            ctx.moveTo(22, 21); ctx.lineTo(38, 39);
            ctx.stroke();
            break;
        case "backpack":
            ctx.beginPath();
            ctx.rect(11, 13, 26, 29);
            ctx.moveTo(16, 15); ctx.quadraticCurveTo(16, 5, 24, 5);
            ctx.quadraticCurveTo(32, 5, 32, 15);
            ctx.moveTo(11, 22); ctx.lineTo(7, 34); ctx.moveTo(37, 22); ctx.lineTo(41, 34);
            ctx.moveTo(16, 26); ctx.lineTo(32, 26); ctx.lineTo(32, 36); ctx.lineTo(16, 36); ctx.closePath();
            ctx.stroke();
            break;
        case "bolo":
            ctx.beginPath();
            ctx.moveTo(11, 37); ctx.lineTo(17, 41); ctx.lineTo(22, 32);
            ctx.moveTo(19, 34); ctx.lineTo(34, 9); ctx.quadraticCurveTo(42, 6, 40, 14);
            ctx.lineTo(25, 37); ctx.stroke();
            break;
        case "gong":
            ctx.beginPath();
            ctx.arc(23, 24, 16, 0, Math.PI * 2);
            ctx.arc(23, 24, 5, 0, Math.PI * 2);
            ctx.moveTo(36, 10); ctx.lineTo(42, 5); ctx.lineTo(38, 17);
            ctx.stroke();
            break;
        case "cape":
            ctx.beginPath();
            ctx.moveTo(16, 9); ctx.quadraticCurveTo(24, 15, 32, 9);
            ctx.lineTo(41, 38); ctx.quadraticCurveTo(24, 44, 7, 38); ctx.closePath();
            ctx.moveTo(14, 19); ctx.lineTo(34, 19);
            ctx.moveTo(13, 27); ctx.lineTo(35, 27);
            ctx.moveTo(14, 38); ctx.lineTo(14, 43);
            ctx.moveTo(24, 40); ctx.lineTo(24, 45);
            ctx.moveTo(34, 38); ctx.lineTo(34, 43);
            ctx.stroke();
            break;
        case "bamboo":
            ctx.beginPath();
            ctx.rect(16, 7, 16, 34);
            ctx.moveTo(16, 15); ctx.lineTo(32, 15);
            ctx.moveTo(16, 33); ctx.lineTo(32, 33);
            ctx.moveTo(22, 21); ctx.lineTo(22, 23);
            ctx.moveTo(27, 26); ctx.lineTo(27, 28);
            ctx.stroke();
            break;
        case "stool":
            ctx.beginPath();
            ctx.moveTo(10, 14); ctx.lineTo(38, 14); ctx.lineTo(35, 21); ctx.lineTo(13, 21); ctx.closePath();
            ctx.moveTo(15, 22); ctx.lineTo(12, 41);
            ctx.moveTo(33, 22); ctx.lineTo(36, 41);
            ctx.moveTo(19, 22); ctx.lineTo(20, 39);
            ctx.moveTo(29, 22); ctx.lineTo(28, 39);
            ctx.stroke();
            break;
        case "cylinder":
            ctx.beginPath();
            ctx.ellipse(24, 10, 11, 4, 0, 0, Math.PI * 2);
            ctx.moveTo(13, 10); ctx.lineTo(13, 37);
            ctx.ellipse(24, 37, 11, 4, 0, 0, Math.PI);
            ctx.lineTo(35, 10);
            ctx.moveTo(14, 17); ctx.lineTo(34, 17);
            ctx.moveTo(14, 31); ctx.lineTo(34, 31);
            ctx.stroke();
            break;
        case "firekit":
            ctx.beginPath();
            ctx.moveTo(24, 35); ctx.quadraticCurveTo(13, 27, 24, 15);
            ctx.quadraticCurveTo(23, 24, 31, 25);
            ctx.quadraticCurveTo(38, 33, 29, 39);
            ctx.quadraticCurveTo(17, 43, 13, 34);
            ctx.moveTo(8, 42); ctx.lineTo(40, 42);
            ctx.moveTo(13, 38); ctx.lineTo(19, 44);
            ctx.moveTo(35, 38); ctx.lineTo(29, 44);
            ctx.stroke();
            break;
        case "fishtrap":
            ctx.beginPath();
            ctx.moveTo(8, 10); ctx.lineTo(40, 10); ctx.lineTo(28, 40); ctx.lineTo(20, 40); ctx.closePath();
            ctx.moveTo(14, 12); ctx.lineTo(23, 38);
            ctx.moveTo(24, 12); ctx.lineTo(24, 39);
            ctx.moveTo(34, 12); ctx.lineTo(26, 38);
            ctx.moveTo(11, 19); ctx.lineTo(37, 19);
            ctx.moveTo(14, 27); ctx.lineTo(34, 27);
            ctx.moveTo(18, 34); ctx.lineTo(31, 34);
            ctx.stroke();
            break;
        case "hat":
            ctx.beginPath();
            ctx.moveTo(6, 30); ctx.quadraticCurveTo(24, 37, 42, 30);
            ctx.quadraticCurveTo(38, 25, 33, 25);
            ctx.quadraticCurveTo(31, 11, 24, 10);
            ctx.quadraticCurveTo(17, 11, 15, 25);
            ctx.quadraticCurveTo(10, 25, 6, 30);
            ctx.moveTo(15, 25); ctx.lineTo(33, 25);
            ctx.stroke();
            break;
        case "spear":
            ctx.beginPath();
            ctx.moveTo(24, 5); ctx.lineTo(34, 19); ctx.lineTo(24, 16); ctx.lineTo(14, 19); ctx.closePath();
            ctx.moveTo(24, 16); ctx.lineTo(24, 44);
            ctx.moveTo(19, 34); ctx.lineTo(29, 34);
            ctx.stroke();
            break;
        case "shield":
            ctx.beginPath();
            ctx.moveTo(24, 5); ctx.lineTo(39, 11); ctx.lineTo(37, 28);
            ctx.quadraticCurveTo(34, 37, 24, 43);
            ctx.quadraticCurveTo(14, 37, 11, 28);
            ctx.lineTo(9, 11); ctx.closePath();
            ctx.moveTo(17, 17); ctx.lineTo(31, 31);
            ctx.moveTo(31, 17); ctx.lineTo(17, 31);
            ctx.stroke();
            break;
        case "beads":
            ctx.beginPath();
            ctx.arc(24, 18, 15, Math.PI * 1.05, Math.PI * 1.95);
            ctx.stroke();
            for (let i = 0; i < 7; i++) {
                const angle = Math.PI * 1.08 + i * (Math.PI * 0.84 / 6);
                ctx.beginPath();
                ctx.arc(24 + Math.cos(angle) * 15, 18 + Math.sin(angle) * 15, 2.4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.beginPath();
            ctx.moveTo(24, 31); ctx.lineTo(30, 38); ctx.lineTo(24, 45); ctx.lineTo(18, 38); ctx.closePath();
            ctx.stroke();
            break;
        case "axe":
            ctx.beginPath();
            ctx.moveTo(16, 40); ctx.lineTo(30, 13);
            ctx.moveTo(28, 18); ctx.quadraticCurveTo(33, 7, 42, 13);
            ctx.quadraticCurveTo(39, 25, 29, 27);
            ctx.moveTo(18, 35); ctx.lineTo(25, 39);
            ctx.stroke();
            break;
        case "textile":
            ctx.beginPath();
            ctx.moveTo(9, 9); ctx.lineTo(39, 9); ctx.lineTo(36, 37); ctx.lineTo(24, 42); ctx.lineTo(12, 37); ctx.closePath();
            ctx.moveTo(14, 16); ctx.lineTo(34, 16);
            ctx.moveTo(13, 23); ctx.lineTo(35, 23);
            ctx.moveTo(13, 30); ctx.lineTo(35, 30);
            ctx.moveTo(15, 12); ctx.lineTo(15, 34);
            ctx.moveTo(24, 12); ctx.lineTo(24, 38);
            ctx.moveTo(33, 12); ctx.lineTo(33, 34);
            ctx.stroke();
            break;
        case "armlet":
            ctx.beginPath();
            ctx.ellipse(24, 24, 10, 18, -0.35, 0, Math.PI * 2);
            ctx.ellipse(24, 24, 15, 18, -0.35, 0, Math.PI * 2);
            ctx.moveTo(12, 13); ctx.lineTo(17, 17);
            ctx.moveTo(32, 31); ctx.lineTo(37, 35);
            ctx.stroke();
            break;
        case "token":
            ctx.beginPath();
            ctx.arc(24, 24, 17, 0, Math.PI * 2);
            ctx.moveTo(24, 12); ctx.lineTo(34, 24); ctx.lineTo(24, 36); ctx.lineTo(14, 24); ctx.closePath();
            ctx.moveTo(24, 17); ctx.lineTo(24, 31);
            ctx.stroke();
            break;
        case "headdress":
            ctx.beginPath();
            ctx.moveTo(10, 37); ctx.quadraticCurveTo(24, 26, 38, 37);
            ctx.lineTo(38, 41); ctx.lineTo(10, 41); ctx.closePath();
            ctx.moveTo(14, 34); ctx.lineTo(9, 12);
            ctx.moveTo(22, 30); ctx.lineTo(22, 7);
            ctx.moveTo(30, 30); ctx.lineTo(35, 10);
            ctx.moveTo(9, 12); ctx.quadraticCurveTo(14, 16, 15, 22);
            ctx.moveTo(22, 7); ctx.quadraticCurveTo(28, 13, 27, 20);
            ctx.moveTo(35, 10); ctx.quadraticCurveTo(40, 15, 38, 22);
            ctx.stroke();
            break;
        case "quiver":
            ctx.beginPath();
            ctx.rect(14, 17, 19, 27);
            ctx.moveTo(17, 19); ctx.lineTo(17, 7); ctx.lineTo(22, 15);
            ctx.moveTo(24, 17); ctx.lineTo(24, 5); ctx.lineTo(29, 14);
            ctx.moveTo(30, 19); ctx.lineTo(35, 8); ctx.lineTo(35, 18);
            ctx.moveTo(14, 25); ctx.lineTo(33, 25);
            ctx.stroke();
            break;
        case "figurine":
            ctx.beginPath();
            ctx.arc(24, 9, 5, 0, Math.PI * 2);
            ctx.moveTo(24, 14); ctx.lineTo(24, 31);
            ctx.moveTo(24, 18); ctx.lineTo(14, 25); ctx.lineTo(10, 22);
            ctx.moveTo(24, 18); ctx.lineTo(34, 25); ctx.lineTo(38, 22);
            ctx.moveTo(24, 31); ctx.lineTo(16, 41);
            ctx.moveTo(24, 31); ctx.lineTo(32, 41);
            ctx.moveTo(17, 25); ctx.lineTo(31, 25);
            ctx.stroke();
            break;
    }

    ctx.restore();
}

function drawArtifactStatus(isUnlocked, centerX, centerY, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (isUnlocked) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#172019";
        ctx.beginPath();
        ctx.moveTo(centerX - 4, centerY);
        ctx.lineTo(centerX - 1, centerY + 3);
        ctx.lineTo(centerX + 4, centerY - 3);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(centerX, centerY - 2, 4, Math.PI, 0);
        ctx.stroke();
        ctx.fillRect(centerX - 5, centerY - 2, 10, 9);
    }

    ctx.restore();
}

function fitCanvasText(text, maxWidth) {
    let fittedText = text;
    while (fittedText.length > 4 && ctx.measureText(`${fittedText}...`).width > maxWidth) {
        fittedText = fittedText.slice(0, -1);
    }
    return fittedText.length < text.length ? `${fittedText.trimEnd()}...` : fittedText;
}

function renderAchievementsScreen() {
    ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    drawCanvasBackground();

    ctx.fillStyle = "rgba(18, 15, 13, 0.88)";
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    drawInGameExitButton();

    const cards = [
        {
            title: "EASY MASTERY",
            desc: "Catch the pig in Easy Mode",
            count: playerAchievements.EASY.length,
            icon: "runner",
            accent: "#84A77A"
        },
        {
            title: "MEDIUM MASTERY",
            desc: "Catch the pig in Medium Mode",
            count: playerAchievements.MEDIUM.length,
            icon: "tracker",
            accent: "#D49B48"
        },
        {
            title: "HARD MASTERY",
            desc: "Catch the pig in Hard Mode",
            count: playerAchievements.HARD.length,
            icon: "shield",
            accent: "#C66A50"
        }
    ];
    const totalCollected = cards.reduce((total, card) => total + card.count, 0);

    ctx.fillStyle = "#F3BA4F";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ACHIEVEMENTS", VIRTUAL_WIDTH / 2, 43);
    ctx.fillStyle = "#C7B8A4";
    ctx.font = "14px sans-serif";
    ctx.fillText("Your Dokdokma journey, one artifact at a time", VIRTUAL_WIDTH / 2, 67);

    const summaryX = 390;
    const summaryY = 82;
    const summaryW = 500;
    ctx.fillStyle = "rgba(43, 26, 14, 0.92)";
    ctx.fillRect(summaryX, summaryY, summaryW, 48);
    ctx.strokeStyle = "#68492F";
    ctx.lineWidth = 1;
    ctx.strokeRect(summaryX, summaryY, summaryW, 48);
    ctx.textAlign = "left";
    ctx.fillStyle = "#E2D7C5";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("TOTAL ARTIFACT COLLECTION", summaryX + 16, summaryY + 20);
    ctx.textAlign = "right";
    ctx.fillStyle = "#F3BA4F";
    ctx.fillText(`${totalCollected} / 30`, summaryX + summaryW - 16, summaryY + 20);
    ctx.fillStyle = "#483728";
    ctx.fillRect(summaryX + 16, summaryY + 30, summaryW - 32, 7);
    ctx.fillStyle = "#C28245";
    ctx.fillRect(summaryX + 16, summaryY + 30, (summaryW - 32) * Math.min(totalCollected / 30, 1), 7);

    cards.forEach((card, idx) => {
        const x = 90 + idx * 375;
        const y = 150;
        const w = 350;
        const h = 505;
        const centerX = x + w / 2;

        ctx.fillStyle = "#241A13";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = card.count > 0 ? card.accent : "#59432F";
        ctx.lineWidth = card.count > 0 ? 2 : 1;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = card.accent;
        ctx.fillRect(x, y, w, 6);

        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        ctx.beginPath();
        ctx.arc(centerX, y + 86, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = card.accent;
        ctx.lineWidth = 2;
        ctx.stroke();
        drawWarriorBadgeIcon(card.icon, centerX, y + 86, 46, card.accent);

        ctx.textAlign = "center";
        ctx.fillStyle = "#F3E9D7";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(card.title, centerX, y + 153);
        ctx.fillStyle = "#C7B8A4";
        ctx.font = "13px sans-serif";
        ctx.fillText(card.desc, centerX, y + 177);

        let statusText = "NOT STARTED";
        let statusColor = "#9A5947";
        if (card.count === 10) {
            statusText = "MASTERED";
            statusColor = "#4A8C6F";
        } else if (card.count > 0) {
            statusText = "IN PROGRESS";
            statusColor = "#B98232";
        }
        const statusWidth = 138;
        const statusX = centerX - statusWidth / 2;
        const statusY = y + 199;
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.fillRect(statusX, statusY, statusWidth, 27);
        ctx.strokeStyle = statusColor;
        ctx.strokeRect(statusX, statusY, statusWidth, 27);
        ctx.fillStyle = statusColor;
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(statusText, centerX, statusY + 18);

        ctx.fillStyle = "#AFA18D";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("ARTIFACTS COLLECTED", centerX, y + 278);
        ctx.fillStyle = "#F3E9D7";
        ctx.font = "bold 28px sans-serif";
        ctx.fillText(`${card.count} / 10`, centerX, y + 315);

        const barX = x + 28;
        const barY = y + 332;
        const barW = w - 56;
        ctx.fillStyle = "#483728";
        ctx.fillRect(barX, barY, barW, 12);
        ctx.fillStyle = card.accent;
        ctx.fillRect(barX, barY, barW * Math.min(card.count / 10, 1), 12);

        ctx.fillStyle = "#C7B8A4";
        ctx.font = "12px sans-serif";
        ctx.fillText("Win in this tier to discover a cultural artifact.", centerX, y + 384);
    });
}

function drawWarriorBadgeIcon(iconName, centerX, centerY, size, color) {
    ctx.save();
    ctx.translate(centerX - size / 2, centerY - size / 2);
    ctx.scale(size / 48, size / 48);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (iconName) {
        case "runner":
            ctx.beginPath();
            ctx.moveTo(4, 17); ctx.lineTo(13, 17);
            ctx.moveTo(2, 23); ctx.lineTo(11, 23);
            ctx.moveTo(5, 29); ctx.lineTo(14, 29);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(31, 9, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(28, 15); ctx.lineTo(23, 26); ctx.lineTo(31, 29);
            ctx.moveTo(27, 17); ctx.lineTo(20, 21); ctx.lineTo(17, 18);
            ctx.moveTo(29, 17); ctx.lineTo(36, 18); ctx.lineTo(41, 13);
            ctx.moveTo(30, 28); ctx.lineTo(22, 35); ctx.lineTo(17, 42);
            ctx.moveTo(31, 29); ctx.lineTo(37, 34); ctx.lineTo(44, 33);
            ctx.stroke();
            break;
        case "tracker":
            ctx.beginPath();
            ctx.arc(24, 24, 16, 0, Math.PI * 2);
            ctx.moveTo(24, 3); ctx.lineTo(24, 10);
            ctx.moveTo(24, 38); ctx.lineTo(24, 45);
            ctx.moveTo(3, 24); ctx.lineTo(10, 24);
            ctx.moveTo(38, 24); ctx.lineTo(45, 24);
            ctx.moveTo(17, 31); ctx.lineTo(31, 17);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(24, 24, 4, 0, Math.PI * 2);
            ctx.fill();
            break;
        case "shield":
            ctx.beginPath();
            ctx.moveTo(24, 5); ctx.lineTo(39, 11); ctx.lineTo(37, 28);
            ctx.quadraticCurveTo(34, 37, 24, 43);
            ctx.quadraticCurveTo(14, 37, 11, 28);
            ctx.lineTo(9, 11); ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(15, 34); ctx.lineTo(34, 12);
            ctx.moveTo(31, 10); ctx.lineTo(37, 7); ctx.lineTo(36, 14);
            ctx.moveTo(16, 31); ctx.lineTo(20, 35);
            ctx.stroke();
            break;
        case "pottery":
            ctx.beginPath();
            ctx.moveTo(18, 8); ctx.lineTo(30, 8); ctx.lineTo(30, 15);
            ctx.quadraticCurveTo(34, 22, 37, 31);
            ctx.quadraticCurveTo(36, 40, 24, 42);
            ctx.quadraticCurveTo(12, 40, 11, 31);
            ctx.quadraticCurveTo(14, 22, 18, 15);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(17, 15); ctx.lineTo(31, 15);
            ctx.moveTo(13, 29); ctx.quadraticCurveTo(24, 34, 35, 29);
            ctx.moveTo(16, 35); ctx.quadraticCurveTo(24, 38, 32, 35);
            ctx.stroke();
            break;
        case "stilts":
            ctx.beginPath();
            ctx.arc(24, 7, 4, 0, Math.PI * 2);
            ctx.moveTo(24, 11); ctx.lineTo(24, 23);
            ctx.moveTo(24, 14); ctx.lineTo(15, 18);
            ctx.moveTo(24, 14); ctx.lineTo(33, 18);
            ctx.moveTo(24, 23); ctx.lineTo(17, 31);
            ctx.moveTo(24, 23); ctx.lineTo(31, 31);
            ctx.moveTo(16, 19); ctx.lineTo(16, 44);
            ctx.moveTo(32, 19); ctx.lineTo(32, 44);
            ctx.moveTo(12, 34); ctx.lineTo(20, 34);
            ctx.moveTo(28, 34); ctx.lineTo(36, 34);
            ctx.stroke();
            break;
        case "mountain":
            ctx.beginPath();
            ctx.moveTo(4, 39); ctx.lineTo(17, 18); ctx.lineTo(24, 29);
            ctx.lineTo(33, 12); ctx.lineTo(45, 39); ctx.closePath();
            ctx.moveTo(12, 39); ctx.lineTo(20, 27);
            ctx.moveTo(28, 22); ctx.lineTo(33, 15); ctx.lineTo(38, 27);
            ctx.moveTo(19, 38); ctx.quadraticCurveTo(27, 35, 24, 30);
            ctx.stroke();
            break;
    }

    ctx.restore();
}

function renderBadgesScreen() {
    ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    drawCanvasBackground();

    ctx.fillStyle = "rgba(18, 15, 13, 0.90)";
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    drawInGameExitButton();

    ctx.fillStyle = "#F3BA4F";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("WARRIOR BADGES", VIRTUAL_WIDTH / 2, 45);

    ctx.fillStyle = "#E2D7C5";
    ctx.font = "14px sans-serif";
    ctx.fillText("Inspect tribal insignias and unlock requirements", VIRTUAL_WIDTH / 2, 68);

    const badges = [
        {
            rank: "Chon-gyog",
            sub: "Fast Runner",
            icon: "runner",
            desc: "Awarded for completing the Easy Kalinga hunt.",
            requirement: "Collect all 10 Easy Artifacts (10/10)",
            count: playerAchievements.EASY.length,
            max: 10,
            unlocked: playerAchievements.EASY.length === 10
        },
        {
            rank: "Mansasag",
            sub: "Agile Tracker",
            icon: "tracker",
            desc: "Awarded for exceptional reflexes in Medium trials.",
            requirement: "Collect all 10 Medium Artifacts (10/10)",
            count: playerAchievements.MEDIUM.length,
            max: 10,
            unlocked: playerAchievements.MEDIUM.length === 10
        },
        {
            rank: "Maingel",
            sub: "Brave Warrior",
            icon: "shield",
            desc: "The highest tribal honor for conquering Hard trials.",
            requirement: "Collect all 10 Hard Artifacts (10/10)",
            count: playerAchievements.HARD.length,
            max: 10,
            unlocked: playerAchievements.HARD.length === 10
        },
        {
            rank: "Pasil Potter",
            sub: "Archivist",
            icon: "pottery",
            desc: "Uncover every single cultural relic.",
            requirement: "Collect all 30/30 Artifacts",
            count: playerAchievements.EASY.length + playerAchievements.MEDIUM.length + playerAchievements.HARD.length,
            max: 30,
            unlocked: (playerAchievements.EASY.length + playerAchievements.MEDIUM.length + playerAchievements.HARD.length) === 30
        },
        {
            rank: "Stilt Acrobat",
            sub: "Balanced Stride",
            icon: "stilts",
            desc: "Win a stilt race without a single stumble.",
            requirement: "Finish Kadang-Kadang with 0 stumbles",
            count: 0,
            max: 1,
            unlocked: false
        },
        {
            rank: "Kabunian",
            sub: "Mountain Sprinter",
            icon: "mountain",
            desc: "Mastery of speed and balance in the high mountain stilt race.",
            requirement: "Win a Kadang-Kadang race",
            count: kadang.hasCompetitiveWin ? 1 : 0,
            max: 1,
            unlocked: kadang.hasCompetitiveWin
        }
    ];

    const cardW = 310;
    const cardH = 250;
    const gapX = 25;
    const gapY = 20;
    const startX = (VIRTUAL_WIDTH - (3 * cardW + 2 * gapX)) / 2;
    const startY = 95;

    badges.forEach((b, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);

        const x = startX + col * (cardW + gapX);
        const y = startY + row * (cardH + gapY);
        const w = cardW;
        const h = cardH;

        let statusText = "STATUS: LOCKED";
        let statusColor = "#B84A39";

        if (b.unlocked) {
            statusText = "STATUS: COMPLETED";
            statusColor = "#4A8C6F";
        } else if (b.count > 0 && b.count < b.max) {
            statusText = "STATUS: ONGOING";
            statusColor = "#E5A93C";
        }

        ctx.fillStyle = "#22130A";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = b.unlocked ? "#F3BA4F" : "#4A3322";
        ctx.lineWidth = b.unlocked ? 3 : 2;
        ctx.strokeRect(x, y, w, h);

        const circleX = x + w / 2;
        const circleY = y + 42;
        const circleRadius = 26;

        ctx.fillStyle = b.unlocked ? "#C28245" : "#2B1A0E";
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = b.unlocked ? "#F3BA4F" : "#6E4C33";
        ctx.lineWidth = 2;
        ctx.stroke();

        drawWarriorBadgeIcon(b.icon, circleX, circleY, 34, b.unlocked ? "#F3BA4F" : "#B08B64");

        ctx.fillStyle = b.unlocked ? "#F3BA4F" : "#A67C52";
        ctx.font = "bold 15px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(b.rank, x + w / 2, y + 90);

        ctx.fillStyle = "#D49B57";
        ctx.font = "11px sans-serif";
        ctx.fillText(`(${b.sub})`, x + w / 2, y + 107);

        ctx.fillStyle = "#F7F1E3";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(b.desc, x + w / 2, y + 138, w - 30);

        ctx.fillStyle = statusColor;
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(statusText, x + w / 2, y + 172);

        const btnH = 34;
        const btnY = y + 192;
        ctx.fillStyle = "#3D2617";
        ctx.fillRect(x + 18, btnY, w - 36, btnH);
        ctx.strokeStyle = b.unlocked ? "#F3BA4F" : "#6E4C33";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 18, btnY, w - 36, btnH);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("INSPECT INSIGNIA", x + w / 2, btnY + 22);
    });

    if (badgeInterface.selectedBadgeIndex !== null) {
        const b = badges[badgeInterface.selectedBadgeIndex];
        const modalW = 540;
        const modalH = 360;
        const modalX = (VIRTUAL_WIDTH - modalW) / 2;
        const modalY = (VIRTUAL_HEIGHT - modalH) / 2;

        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

        ctx.fillStyle = "#2B1A0E";
        ctx.fillRect(modalX, modalY, modalW, modalH);
        ctx.strokeStyle = "#F3BA4F";
        ctx.lineWidth = 4;
        ctx.strokeRect(modalX, modalY, modalW, modalH);

        ctx.fillStyle = "#F3BA4F";
        ctx.font = "bold 26px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`INSIGNIA: ${b.rank.toUpperCase()}`, VIRTUAL_WIDTH / 2, modalY + 50);

        drawWarriorBadgeIcon(b.icon, VIRTUAL_WIDTH / 2, modalY + 98, 54, "#F3BA4F");

        ctx.fillStyle = "#C28245";
        ctx.font = "18px sans-serif";
        ctx.fillText(b.sub, VIRTUAL_WIDTH / 2, modalY + 145);

        ctx.fillStyle = "#E2D7C5";
        ctx.font = "16px sans-serif";
        ctx.fillText(b.desc, VIRTUAL_WIDTH / 2, modalY + 195, modalW - 40);

        ctx.fillStyle = "#F3BA4F";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(`Unlock Requirement: ${b.requirement}`, VIRTUAL_WIDTH / 2, modalY + 250);

        const btnCloseW = 200;
        const btnCloseH = 45;
        const btnCloseX = modalX + (modalW - btnCloseW) / 2;
        const btnCloseY = modalY + modalH - 70;

        ctx.fillStyle = "#C28245";
        ctx.fillRect(btnCloseX, btnCloseY, btnCloseW, btnCloseH);
        ctx.strokeStyle = "#F3BA4F";
        ctx.strokeRect(btnCloseX, btnCloseY, btnCloseW, btnCloseH);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("CLOSE INSPECT", modalX + modalW / 2, btnCloseY + 28);
    }
}

function renderArtifactsScreen() {
    ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    drawCanvasBackground();

    ctx.fillStyle = "rgba(18, 15, 13, 0.88)";
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    drawInGameExitButton();

    ctx.fillStyle = "#E5A93C";
    ctx.font = "bold 30px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CULTURAL ARTIFACTS", VIRTUAL_WIDTH / 2, 42);
    ctx.fillStyle = "#C7B8A4";
    ctx.font = "13px sans-serif";
    ctx.fillText("Explore the treasures and stories of Kalinga", VIRTUAL_WIDTH / 2, 65);

    const totalCollected = playerAchievements.EASY.length + playerAchievements.MEDIUM.length + playerAchievements.HARD.length;
    const summaryX = 505;
    const summaryY = 78;
    const summaryW = 270;
    ctx.fillStyle = "rgba(43, 26, 14, 0.92)";
    ctx.fillRect(summaryX, summaryY, summaryW, 34);
    ctx.strokeStyle = "#68492F";
    ctx.lineWidth = 1;
    ctx.strokeRect(summaryX, summaryY, summaryW, 34);
    ctx.fillStyle = "#F3BA4F";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(`COLLECTED  ${totalCollected} / 30`, VIRTUAL_WIDTH / 2, summaryY + 22);

    const tiers = [
        { name: "EASY COLLECTION", icon: "runner", list: CULTURAL_ARTIFACTS.EASY, unlocked: playerAchievements.EASY, accent: "#84A77A" },
        { name: "MEDIUM COLLECTION", icon: "tracker", list: CULTURAL_ARTIFACTS.MEDIUM, unlocked: playerAchievements.MEDIUM, accent: "#D49B48" },
        { name: "HARD COLLECTION", icon: "shield", list: CULTURAL_ARTIFACTS.HARD, unlocked: playerAchievements.HARD, accent: "#C66A50" }
    ];

    tiers.forEach((tier, tIdx) => {
        const x = 50 + tIdx * 400;
        const y = 124;
        const w = 380;
        const h = 542;
        const collectedCount = tier.unlocked.length;

        ctx.fillStyle = "#241A13";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "#59432F";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = tier.accent;
        ctx.fillRect(x, y, w, 5);

        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.beginPath();
        ctx.arc(x + 32, y + 34, 20, 0, Math.PI * 2);
        ctx.fill();
        drawWarriorBadgeIcon(tier.icon, x + 32, y + 34, 25, tier.accent);

        ctx.textAlign = "left";
        ctx.fillStyle = "#F3E9D7";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText(tier.name, x + 60, y + 31);
        ctx.textAlign = "right";
        ctx.fillStyle = tier.accent;
        ctx.font = "bold 12px sans-serif";
        ctx.fillText(`${collectedCount} / 10`, x + w - 15, y + 31);

        ctx.fillStyle = "#483728";
        ctx.fillRect(x + 15, y + 45, w - 30, 7);
        ctx.fillStyle = tier.accent;
        ctx.fillRect(x + 15, y + 45, (w - 30) * Math.min(collectedCount / 10, 1), 7);

        tier.list.forEach((art, aIdx) => {
            const isUnlocked = tier.unlocked.some(u => u.name === art.name);
            const rowX = x + 9;
            const rowY = y + 66 + aIdx * 47;
            const rowW = w - 18;
            const rowH = 44;
            const iconColor = isUnlocked ? tier.accent : "#9B8061";

            ctx.fillStyle = isUnlocked ? "rgba(58, 99, 81, 0.22)" : "rgba(0, 0, 0, 0.17)";
            ctx.fillRect(rowX, rowY, rowW, rowH);
            ctx.strokeStyle = isUnlocked ? "rgba(132, 167, 122, 0.55)" : "#493728";
            ctx.lineWidth = 1;
            ctx.strokeRect(rowX, rowY, rowW, rowH);

            ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
            ctx.beginPath();
            ctx.arc(rowX + 21, rowY + rowH / 2, 15, 0, Math.PI * 2);
            ctx.fill();
            drawCulturalArtifactIcon(art.icon, rowX + 21, rowY + rowH / 2, 25, iconColor);

            ctx.textAlign = "left";
            ctx.fillStyle = isUnlocked ? "#F3E9D7" : "#D0C2AF";
            ctx.font = "bold 10px sans-serif";
            ctx.fillText(art.name, rowX + 43, rowY + 17);
            ctx.fillStyle = "#9F917E";
            ctx.font = "8px sans-serif";
            ctx.fillText(fitCanvasText(art.desc, rowW - 76), rowX + 43, rowY + 32);

            drawArtifactStatus(isUnlocked, rowX + rowW - 16, rowY + rowH / 2, isUnlocked ? "#84A77A" : "#755F4A");
        });
    });
}

// User Authentication & Database Sync
let currentUser = null;
let isRegisterMode = false;

(function injectAuthDrawerButton() {
    const sideDrawer = document.getElementById("side-drawer");
    if (!sideDrawer) return;
    const accountActions = document.getElementById("drawer-account-actions")
        || sideDrawer.querySelector(".drawer-menu")
        || sideDrawer;

    const authBtn = document.createElement("button");
    authBtn.id = "btn-menu-auth";
    authBtn.className = "drawer-btn";
    authBtn.textContent = "Account Login";

    authBtn.addEventListener("click", () => {
        closeDrawer();
        openAuthModal();
    });

    accountActions.appendChild(authBtn);
})();

function openAuthModal() {
    let authModal = document.getElementById("auth-modal");
    if (!authModal) {
        authModal = document.createElement("div");
        authModal.id = "auth-modal";
        authModal.className = "custom-modal";
        authModal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:9999;";
        document.body.appendChild(authModal);
    }

    if (currentUser) {
        authModal.innerHTML = `
            <div style="background:#2B1A0E;border:3px solid #E5A93C;padding:30px;border-radius:8px;width:380px;text-align:center;position:relative;box-sizing:border-box;">
                <button id="auth-close-btn" style="position:absolute;top:12px;right:15px;background:none;border:none;color:#E5A93C;font-size:22px;cursor:pointer;font-weight:bold;">✕</button>
                <h2 style="color:#E5A93C;margin-top:0;font-family:sans-serif;">ACCOUNT PROFILE</h2>
                <p style="color:#E2D7C5;font-size:18px;margin:20px 0;">Logged in as: <strong style="color:#E5A93C;">${currentUser.username}</strong></p>
                <button id="auth-logout-btn" style="background:#A34836;color:#FFF;border:2px solid #E5A93C;padding:12px 20px;border-radius:4px;width:100%;font-weight:bold;cursor:pointer;font-size:16px;margin-bottom:12px;">LOGOUT</button>
                <button id="auth-guest-continue" style="background:#4E3629;color:#FFF;border:1px solid #C28245;padding:10px 20px;border-radius:4px;width:100%;cursor:pointer;font-size:14px;">CONTINUE AS GUEST</button>
            </div>
        `;
        authModal.style.display = "flex";
        authModal.classList.remove("hidden");

        document.getElementById("auth-logout-btn").addEventListener("click", () => {
            currentUser = null;
            const authMenuBtn = document.getElementById("btn-menu-auth");
            if (authMenuBtn) authMenuBtn.textContent = "Account Login";
            closeAllModals();
            alert("Successfully logged out.");
        });

        document.getElementById("auth-guest-continue").addEventListener("click", () => {
            closeAllModals();
        });
    } else {
        authModal.innerHTML = `
            <div style="background:#2B1A0E;border:3px solid #E5A93C;padding:30px;border-radius:8px;width:380px;text-align:center;position:relative;box-sizing:border-box;">
                <button id="auth-close-btn" style="position:absolute;top:12px;right:15px;background:none;border:none;color:#E5A93C;font-size:22px;cursor:pointer;font-weight:bold;">✕</button>
                <h2 id="auth-title" style="color:#E5A93C;margin-top:0;font-family:sans-serif;">ACCOUNT LOGIN</h2>
                <input type="text" id="auth-username" placeholder="Username" style="width:100%;padding:12px;margin:10px 0;background:#18110D;border:1px solid #5C4333;color:#FFF;border-radius:4px;box-sizing:border-box;" />
                <input type="password" id="auth-password" placeholder="Password" style="width:100%;padding:12px;margin:10px 0;background:#18110D;border:1px solid #5C4333;color:#FFF;border-radius:4px;box-sizing:border-box;" />
                <button id="auth-submit-btn" style="background:#C28245;color:#FFF;border:2px solid #E5A93C;padding:12px 20px;border-radius:4px;width:100%;font-weight:bold;cursor:pointer;font-size:16px;margin-top:10px;">LOGIN</button>
                <p id="auth-msg" style="color:#A34836;margin:10px 0;font-size:14px;min-height:20px;"></p>
                <button id="auth-toggle-btn" style="background:none;border:none;color:#E5C396;cursor:pointer;text-decoration:underline;font-size:14px;margin-top:5px;">Need an account? Register</button>
                <div style="margin-top:15px;border-top:1px solid #5C4333;padding-top:15px;">
                    <button id="auth-guest-continue" style="background:#4E3629;color:#FFF;border:1px solid #C28245;padding:10px 20px;border-radius:4px;width:100%;cursor:pointer;font-size:14px;">CONTINUE AS GUEST</button>
                </div>
            </div>
        `;
        authModal.style.display = "flex";
        authModal.classList.remove("hidden");

        let localIsRegisterMode = false;
        document.getElementById("auth-toggle-btn").addEventListener("click", () => {
            localIsRegisterMode = !localIsRegisterMode;
            document.getElementById("auth-title").textContent = localIsRegisterMode ? "REGISTER ACCOUNT" : "ACCOUNT LOGIN";
            document.getElementById("auth-submit-btn").textContent = localIsRegisterMode ? "REGISTER" : "LOGIN";
            document.getElementById("auth-toggle-btn").textContent = localIsRegisterMode ? "Already have an account? Login" : "Need an account? Register";
        });

        document.getElementById("auth-submit-btn").addEventListener("click", async () => {
            const username = document.getElementById("auth-username").value.trim();
            const password = document.getElementById("auth-password").value.trim();
            const msgElem = document.getElementById("auth-msg");

            if (!username || !password) {
                msgElem.textContent = "Please fill in all fields.";
                return;
            }

            const pathSegments = window.location.pathname.split('/');
            pathSegments.pop();
            const folderBase = pathSegments.join('/');
            const endpoint = window.location.origin + folderBase + (localIsRegisterMode ? "/register.php" : "/login.php");

            try {
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });
                const result = await response.json();

                if (result.status === "success") {
                    currentUser = { id: result.user_id || result.user.id, username: result.username || result.user.username };
                    if (result.user && result.user.progress) {
                        playerAchievements.EASY = result.user.progress.EASY || [];
                        playerAchievements.MEDIUM = result.user.progress.MEDIUM || [];
                        playerAchievements.HARD = result.user.progress.HARD || [];
                    }
                    authModal.classList.add("hidden");
                    authModal.style.display = "none";
                    const authMenuBtn = document.getElementById("btn-menu-auth");
                    if (authMenuBtn) authMenuBtn.textContent = `Account: ${currentUser.username}`;
                    alert(`Welcome back, ${currentUser.username}! Your progress is synced.`);
                } else {
                    msgElem.textContent = result.message;
                }
            } catch (err) {
                msgElem.textContent = "Connection to server failed.";
            }
        });

        document.getElementById("auth-guest-continue").addEventListener("click", () => {
            closeAllModals();
        });
    }

    document.getElementById("auth-close-btn").addEventListener("click", () => {
        closeAllModals();
    });
}

async function syncProgressToServer() {
    if (!currentUser) return;
    try {
        const pathSegments = window.location.pathname.split('/');
        pathSegments.pop();
        const folderBase = pathSegments.join('/');
        const endpoint = window.location.origin + folderBase + "/save_progress.php";

        const totalScore = (playerAchievements.EASY.length * 100) +
            (playerAchievements.MEDIUM.length * 200) +
            (playerAchievements.HARD.length * 300);

        await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: currentUser.id,
                progress: playerAchievements,
                score: totalScore
            })
        });
    } catch (err) {
        console.warn("Failed to auto-sync progress to database.");
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    audioManager.playBgm();
    syncPhoneLayout();

    if (currentState === STATE_LOADING) {
        renderLoading();
    } else if (currentState === STATE_WELCOME) {
        renderWelcome();
    } else if (currentState === STATE_LOBBY) {
        renderLobby();
    } else if (currentState === STATE_DOKDOKMA) {
        updateDokdokma();
        renderDokdokma();
    } else if (currentState === STATE_KADANG) {
        kadang.update();
        renderKadang();
    } else if (currentState === STATE_ACHIEVEMENTS) {
        renderAchievementsScreen();
    } else if (currentState === STATE_BADGES) {
        renderBadgesScreen();
    } else if (currentState === STATE_ARTIFACTS) {
        renderArtifactsScreen();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();