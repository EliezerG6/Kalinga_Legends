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
        { name: "Banga", desc: "A traditional earthenware clay pot handcrafted in Pasil, Kalinga, used for cooking and storing water." },
        { name: "Lingling-o", desc: "An indigenous fertility amulet and pendant crafted from brass, bronze, or jade." },
        { name: "Winnowing Basket", desc: "A flat, circular woven bamboo tray used to separate grain husks from rice." },
        { name: "Agaw-ed", desc: "A traditional woven sleeping mat made from reed or palm leaves." },
        { name: "Kalinga Headband", desc: "A woven cotton band adorned with traditional red, black, and white threads." },
        { name: "Banga Rattan Ring", desc: "A woven ring cushion placed underneath clay pots for stability." },
        { name: "Kallaleng", desc: "A bamboo nose flute played during courtship or quiet mountain moments." },
        { name: "Inabel Pouch", desc: "A small hand-woven textile bag used to carry personal items." },
        { name: "Siok", desc: "A hand-carved wooden utensil featuring intricate tribal motifs." },
        { name: "Coconut Ladle", desc: "A traditional wooden-handled spoon made from polished coconut shells." }
    ],
    MEDIUM: [
        { name: "Pasiking", desc: "An indigenous backpack intricately woven from split rattan and bamboo." },
        { name: "Ilik (Bolo)", desc: "A sturdy single-edged machete used for clearing paths and farming." },
        { name: "Gansa", desc: "A flat bronze musical instrument beaten during regional celebrations." },
        { name: "Ukop (Rain Cape)", desc: "A traditional weather garment woven from dried palm fronds." },
        { name: "Akil (Bamboo Pipe)", desc: "A cylindrical bamboo container used to carry spring water or wine." },
        { name: "Dinalag Stool", desc: "A sturdy low chair carved from a single piece of hardwood." },
        { name: "Batek Case", desc: "A carved wooden cylinder used by traditional tattoo practitioners." },
        { name: "Rattan Fire Kit", desc: "A traditional friction-based fire starter bundle in a woven case." },
        { name: "Bobo (Fishing Trap)", desc: "A funnel-shaped bamboo trap placed in rivers to catch mountain fish." },
        { name: "Kalasag Hat", desc: "A reinforced woven sun hat worn during long hours of farming." }
    ],
    HARD: [
        { name: "Chilan (Spear)", desc: "A forged metal blade with a carved wooden shaft representing tribal protection." },
        { name: "Kalasag Shield", desc: "A rectangular carved wooden shield featuring geometric relief patterns." },
        { name: "Kone-ad Beads", desc: "Precious heirloom necklaces made of agate, shell, and brass beads." },
        { name: "Aliwa (Battle Axe)", desc: "A defensive weapon featuring a crescent-shaped steel blade and hooked pick." },
        { name: "Ba-ag (G-String)", desc: "A hand-woven traditional loincloth dyed with sacred ancestral motifs." },
        { name: "Kallong Armlet", desc: "Heavy metallic arm rings worn by respected community leaders." },
        { name: "Pundung Token", desc: "A sacred heirloom artifact exchanged to seal a formal Bodong peace pact." },
        { name: "Kaping Headdress", desc: "An ornate ceremonial crown adorned with wild boar tusks and feathers." },
        { name: "Tupil Quiver", desc: "An intricately carved bamboo tube case designed to hold hunting darts." },
        { name: "Ancestral Guardian", desc: "A miniature carved wooden guardian figure placed near doorways to ward off spirits." }
    ]
};

// Player Unlocked Achievements & Artifact Tracking
const playerAchievements = {
    EASY: [],
    MEDIUM: [],
    HARD: []
};

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

// Kadang-Kadang Character Back-View Sprites (.jpg format matching folder)
const kadangPlayer1Img = new Image();
kadangPlayer1Img.onerror = () => console.warn("player8 image not found, falling back.");
kadangPlayer1Img.src = "res/minigames/player8.jpg";

const kadangPlayer2Img = new Image();
kadangPlayer2Img.onerror = () => console.warn("player9 image not found, falling back.");
kadangPlayer2Img.src = "res/minigames/player9.jpg";

const playerRunImg = new Image();
playerRunImg.onerror = () => console.warn("player_run.png not found, falling back to static player.");
playerRunImg.src = "res/minigames/player_run.png";

const loadingImg = new Image();
loadingImg.onerror = () => {
    if (!loadingImg.src.endsWith("loading.jpg")) {
        loadingImg.src = "loading.jpg";
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
    document.body.classList.add("landscape-mode");
    document.body.classList.remove("portrait-mode", "phone-mode");
}
setDeviceMode(currentDeviceMode);

// Inject side drawer menu buttons
(function injectSideDrawerMenuButtons() {
    if (!sideDrawer) return;

    const drawerList = sideDrawer.querySelector(".drawer-menu") || sideDrawer;

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

            if (btnSettings && btnSettings.parentNode) {
                btnSettings.parentNode.insertBefore(btn, btnSettings.nextSibling);
            } else {
                drawerList.appendChild(btn);
            }
        }

        btn.style.backgroundColor = "#2E241E";
        btn.style.color = "#E5C396";
        btn.style.border = "1px solid #5C4333";
        btn.style.borderRadius = "6px";
        btn.style.padding = "14px 16px";
        btn.style.width = "100%";
        btn.style.textAlign = "center";
        btn.style.fontFamily = "sans-serif";
        btn.style.fontSize = "17px";
        btn.style.fontWeight = "500";
        btn.style.cursor = "pointer";
        btn.style.marginTop = "8px";
        btn.style.marginBottom = "4px";
        btn.style.boxSizing = "border-box";
        btn.style.transition = "background-color 0.2s, border-color 0.2s, color 0.2s";

        btn.onmouseover = () => {
            btn.style.backgroundColor = "#3D2F27";
            btn.style.borderColor = "#E5A93C";
            btn.style.color = "#E5A93C";
        };
        btn.onmouseout = () => {
            btn.style.backgroundColor = "#2E241E";
            btn.style.borderColor = "#5C4333";
            btn.style.color = "#E5C396";
        };

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

function openMinigameInfoModal(gameType) {
    const titleElem = document.getElementById("info-modal-title");
    const bodyElem = document.getElementById("info-modal-body");

    if (gameType === "DOKDOKMA") {
        titleElem.textContent = "DOKDOKMA (PIG CATCHING)";
        if (currentDeviceMode === "PHONE") {
            bodyElem.innerHTML = `
                <p><strong>Objective:</strong> Pursue and capture the escaped pig inside the wooden pen before stamina drains.</p>
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
                <p><strong>Objective:</strong> Pursue and capture the escaped pig inside the wooden pen before stamina drains.</p>
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
        titleElem.textContent = "KADANG-KADANG (2-PLAYER STILT RACE)";
        bodyElem.innerHTML = `
            <p><strong>Objective:</strong> Race head-to-head on bamboo stilts across the track without losing balance. Face forward away from the screen like Temple Run!</p>
            <p style="color: #E5A93C; font-weight: bold; margin-top: 8px;">INSTRUCTIONS:</p>
            <ul>
                <li><strong>Phone Mode:</strong> Use the on-screen <strong>[LEFT]</strong> and <code>[RIGHT]</code> foot buttons in your respective viewport.</li>
                <li><strong>PC Player 1 Controls:</strong> Alternate tapping <code>A</code> and <code>D</code>.</li>
                <li><strong>PC Player 2 Controls:</strong> Alternate tapping <code>Left</code> and <code>Right</code> Arrow keys.</li>
                <li>Mashing the same foot causes imbalance/stumble! Keep a steady rhythm.</li>
            </ul>
            <p style="color: #E5A93C; margin-top: 10px; font-weight: bold;">READY TO RACE?</p>
            <button class="modal-btn-action" id="modal-start-kadang" style="background: #C28245; color:#fff; padding:12px; border:none; border-radius:4px; font-weight:bold; cursor:pointer; width:100%;">START GAME</button>
            <button class="modal-btn-action" id="modal-home-lobby-kadang" style="background: #4E3629; margin-top: 8px; color:#fff; padding:10px; border:none; border-radius:4px; cursor:pointer; width:100%;">RETURN TO LOBBY</button>
        `;

        document.getElementById("modal-start-kadang").addEventListener("click", () => {
            closeAllModals();
            kadang.reset();
            currentState = STATE_KADANG;
        });
        document.getElementById("modal-home-lobby-kadang").addEventListener("click", () => {
            closeAllModals();
            currentState = STATE_LOBBY;
            audioManager.playBgm();
        });
    }

    openModal(minigameInfoModal);
}

function showDifficultySelector(numPlayers) {
    const titleElem = document.getElementById("info-modal-title");
    const bodyElem = document.getElementById("info-modal-body");

    titleElem.textContent = `DOKDOKMA (${numPlayers} PLAYER${numPlayers > 1 ? 'S' : ''})`;
    bodyElem.innerHTML = `
        <p style="color: #E5A93C; font-weight: bold;">CHOOSE DIFFICULTY:</p>
        <button class="modal-btn-action" id="modal-diff-easy">EASY MODE</button>
        <button class="modal-btn-action" id="modal-diff-medium">MEDIUM MODE</button>
        <button class="modal-btn-action" id="modal-diff-hard">HARD MODE</button>
        <button class="modal-btn-action" id="modal-back-players" style="background: #4E3629; margin-top: 10px;">BACK</button>
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
    if (currentState === STATE_KADANG && !kadang.isGameOver) {
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
    isPaused: false,
    spaceWasPressed: false,
    startTime: 0,
    elapsedTime: 0,

    p1GrabBtnSingle: { cx: 1180, cy: 580, r: 55 },
    p1GrabBtnDual: { cx: 240, cy: 580, r: 45 },
    p2GrabBtnDual: { cx: 1040, cy: 580, r: 45 },

    reset(selectedDifficulty = null, numPlayers = 1) {
        audioManager.playBgm();
        this.difficulty = selectedDifficulty;
        this.activePlayersCount = numPlayers;

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

            const tierList = CULTURAL_ARTIFACTS[this.difficulty.name];
            const randomIndex = Math.floor(Math.random() * tierList.length);
            currentRunArtifact = tierList[randomIndex];

            if (!playerAchievements[this.difficulty.name].some(a => a.name === currentRunArtifact.name)) {
                playerAchievements[this.difficulty.name].push(currentRunArtifact);
                syncProgressToServer();
            }
        }

        this.pig.frameIndex = 0;
        this.pig.tickCount = 0;
        this.gripProgress = 0;
        this.isGameOver = false;
        this.hasWon = false;
        this.isPaused = false;
        this.spaceWasPressed = false;
        dualTouchState.p1JoystickActive = false;
        dualTouchState.p1TouchId = null;
        dualTouchState.p2JoystickActive = false;
        dualTouchState.p2TouchId = null;
        p1GrabTapped = false;
        p2GrabTapped = false;
        this.startTime = Date.now();
        this.elapsedTime = 0;
    }
};

// =============================================
// IMPROVED KADANG-KADANG (DUO STILT RACE - TEMPLE RUN BACK VIEW)
// =============================================
const kadang = {
    targetDistance: 100,
    maxSpeed: 4.5,
    stepDistance: 1.2,
    isGameOver: false,
    isCountingDown: true,
    countdownTimer: 3,
    countdownInterval: null,
    winner: null,
    loser: null,
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
        wobbleTime: 0
    },

    reset() {
        audioManager.playBgm();
        this.isGameOver = false;
        this.isCountingDown = true;
        this.countdownTimer = 3;
        this.winner = null;
        this.loser = null;
        this.elapsedTime = 0;

        [this.p1, this.p2].forEach(p => {
            p.distance = 0;
            p.balance = 50;
            p.speed = 0;
            p.lastFoot = null;
            p.stumbleCooldown = 0;
            p.isStumbling = false;
            p.animTime = 0;
            p.stepCount = 0;
            p.wobbleTime = 0;
        });

        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.countdownInterval = setInterval(() => {
            this.countdownTimer--;
            if (this.countdownTimer <= 0) {
                clearInterval(this.countdownInterval);
                this.isCountingDown = false;
                this.startTime = Date.now();
            }
        }, 1000);
    },

    registerStep(playerNum, foot) {
        if (this.isGameOver || this.isCountingDown) return;
        const p = (playerNum === 1) ? this.p1 : this.p2;
        if (p.isStumbling) return;

        p.animTime += 1;
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
        }

        if (p.distance >= this.targetDistance) {
            p.distance = this.targetDistance;
            this.endRace(p);
        }
    },

    triggerStumble(p) {
        p.balance = 50;
        p.speed = 0;
        p.stumbleCooldown = 60;
        p.isStumbling = true;
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
        if (this.isGameOver || this.isCountingDown) return;
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);

        [this.p1, this.p2].forEach(p => {
            p.animTime += 0.2;
            if (p.isStumbling) {
                this.recoverFromStumble(p);
                return;
            }
            p.speed = Math.max(0, p.speed - 0.015);
            p.distance += p.speed * 0.08;

            if (p.distance >= this.targetDistance) {
                p.distance = this.targetDistance;
                this.endRace(p);
            }
        });
    },

    endRace(p) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.winner = p.name;
        this.loser = (p === this.p1) ? this.p2.name : this.p1.name;
        syncProgressToServer();
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

    // Kadang-Kadang on-screen touch controller buttons
    if (currentState === STATE_KADANG && !kadang.isGameOver && !kadang.isCountingDown) {
        const halfW = VIRTUAL_WIDTH / 2;
        // Left viewport: Player 1 controls (Left Button vs Right Button)
        if (clickX < halfW) {
            // Check if clicking left foot button area (bottom left)
            if (clickX >= 40 && clickX <= 300 && clickY >= 520 && clickY <= 670) {
                kadang.registerStep(1, "left");
                return;
            }
            // Check if clicking right foot button area (bottom center-left)
            if (clickX >= 340 && clickX <= 600 && clickY >= 520 && clickY <= 670) {
                kadang.registerStep(1, "right");
                return;
            }
        }
        // Right viewport: Player 2 controls (Left Button vs Right Button)
        else {
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

    if (currentState === STATE_DOKDOKMA && dokdokma.isPaused) {
        const modalW = 440;
        const modalH = 260;
        const modalX = (VIRTUAL_WIDTH - modalW) / 2;
        const modalY = (VIRTUAL_HEIGHT - modalH) / 2;

        const btnResumeX = modalX + 40;
        const btnResumeY = modalY + 150;
        const btnW = 165;
        const btnH = 55;

        const btnQuitX = modalX + 235;
        const btnQuitY = modalY + 150;

        if (clickX >= btnResumeX && clickX <= btnResumeX + btnW && clickY >= btnResumeY && clickY <= btnResumeY + btnH) {
            dokdokma.isPaused = false;
            return;
        }
        if (clickX >= btnQuitX && clickX <= btnQuitX + btnW && clickY >= btnQuitY && clickY <= btnQuitY + btnH) {
            openMinigameInfoModal("DOKDOKMA");
            return;
        }
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
        if (distExit <= btnExitGame.r) {
            if (badgeInterface.selectedBadgeIndex !== null) {
                badgeInterface.selectedBadgeIndex = null;
                return;
            }
            if (currentState === STATE_DOKDOKMA) {
                dokdokma.isPaused = true;
            } else if (currentState === STATE_KADANG) {
                openModal(exitModal);
            } else {
                currentState = STATE_LOBBY;
                audioManager.playBgm();
            }
            return;
        }
    }

    if (currentState === STATE_DOKDOKMA && dokdokma.isGameOver) {
        openMinigameInfoModal("DOKDOKMA");
        return;
    }

    if (currentState === STATE_KADANG && kadang.isGameOver) {
        openMinigameInfoModal("KADANG");
        return;
    }

    if (currentState === STATE_LOBBY) {
        if (clickX >= 290 && clickX <= 570 && clickY >= 240 && clickY <= 560) {
            openMinigameInfoModal("DOKDOKMA");
        } else if (clickX >= 710 && clickX <= 990 && clickY >= 240 && clickY <= 560) {
            openMinigameInfoModal("KADANG");
        }
    }
});

canvas.addEventListener("touchstart", e => {
    audioManager.playBgm();
    requestFullscreenAndLandscape();

    if (!modalBackdrop.classList.contains("hidden") || currentState === STATE_LOADING) return;

    if (currentState === STATE_WELCOME) {
        currentState = STATE_LOBBY;
        audioManager.playBgm();
        return;
    }

    if (e.target === canvas && currentState !== STATE_LOBBY) {
        e.preventDefault();
    } else {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;

    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const tx = (touch.clientX - rect.left) * scaleX;
        const ty = (touch.clientY - rect.top) * scaleY;

        if (currentState === STATE_KADANG && !kadang.isGameOver && !kadang.isCountingDown) {
            const halfW = VIRTUAL_WIDTH / 2;
            if (tx < halfW) {
                if (tx >= 40 && tx <= 300 && ty >= 520 && ty <= 670) {
                    kadang.registerStep(1, "left");
                } else if (tx >= 340 && tx <= 600 && ty >= 520 && ty <= 670) {
                    kadang.registerStep(1, "right");
                }
            } else {
                const rx = tx - halfW;
                if (rx >= 40 && rx <= 300 && ty >= 520 && ty <= 670) {
                    kadang.registerStep(2, "left");
                } else if (rx >= 340 && rx <= 600 && ty >= 520 && ty <= 670) {
                    kadang.registerStep(2, "right");
                }
            }
        }
    }
}, { passive: false });

function updateDokdokma() {
    if (!dokdokma.difficulty || dokdokma.isGameOver || dokdokma.isPaused) return;

    dokdokma.elapsedTime = Math.floor((Date.now() - dokdokma.startTime) / 1000);

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

    let allStaminaDepleted = p1.stamina <= 0;
    if (dokdokma.activePlayersCount >= 2) allStaminaDepleted = allStaminaDepleted && p2.stamina <= 0;
    if (dokdokma.activePlayersCount >= 3) allStaminaDepleted = allStaminaDepleted && p3.stamina <= 0;

    if (dokdokma.gripProgress >= 100) {
        dokdokma.gripProgress = 100;
        dokdokma.isGameOver = true;
        dokdokma.hasWon = true;
        syncProgressToServer();
    } else if (allStaminaDepleted) {
        dokdokma.isGameOver = true;
        dokdokma.hasWon = false;
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function drawFence() {
    ctx.fillStyle = "#4A3525";
    ctx.fillRect(cage.x, cage.y, cage.w, cage.h);

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

    drawDualJoysticksUI();

    if (dokdokma.activePlayersCount >= 2 && currentDeviceMode === "PHONE") {
        drawKalingaGrabBtn(dokdokma.p1GrabBtnDual.cx, dokdokma.p1GrabBtnDual.cy, dokdokma.p1GrabBtnDual.r, "P1 GRAB", dist1 <= dokdokma.catchRadius);
        drawKalingaGrabBtn(dokdokma.p2GrabBtnDual.cx, dokdokma.p2GrabBtnDual.cy, dokdokma.p2GrabBtnDual.r, "P2 GRAB", dist2 <= dokdokma.catchRadius);
    } else {
        let grabInRange = dist1 <= dokdokma.catchRadius;
        if (dokdokma.activePlayersCount >= 2) grabInRange = grabInRange || (dist2 <= dokdokma.catchRadius);
        if (dokdokma.activePlayersCount >= 3) grabInRange = grabInRange || (dist3 <= dokdokma.catchRadius);
        drawKalingaGrabBtn(dokdokma.p1GrabBtnSingle.cx, dokdokma.p1GrabBtnSingle.cy, dokdokma.p1GrabBtnSingle.r, "GRAB", grabInRange);
    }

    drawInGameExitButton();

    ctx.fillStyle = "#E5A93C";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`LEVEL: ${dokdokma.difficulty.name} (${dokdokma.activePlayersCount}P - ${currentDeviceMode})`, cage.x, cage.y - 20);

    ctx.textAlign = "right";
    ctx.fillText(`TIME: ${formatTime(dokdokma.elapsedTime)}`, cage.x + cage.w, cage.y - 20);

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

    if (dokdokma.isPaused) {
        const modalW = 440;
        const modalH = 260;
        const modalX = (VIRTUAL_WIDTH - modalW) / 2;
        const modalY = (VIRTUAL_HEIGHT - modalH) / 2;

        ctx.fillStyle = "rgba(18, 15, 13, 0.85)";
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

        ctx.fillStyle = "#2B1A0E";
        ctx.fillRect(modalX, modalY, modalW, modalH);
        ctx.strokeStyle = "#E5A93C";
        ctx.lineWidth = 3;
        ctx.strokeRect(modalX, modalY, modalW, modalH);

        ctx.fillStyle = "#E5A93C";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GAME PAUSED", VIRTUAL_WIDTH / 2, modalY + 55);

        ctx.fillStyle = "#E2D7C5";
        ctx.font = "16px sans-serif";
        ctx.fillText("Choose an option to continue:", VIRTUAL_WIDTH / 2, modalY + 95);

        const btnW = 165;
        const btnH = 55;
        const btnResumeX = modalX + 40;
        const btnResumeY = modalY + 150;
        const btnQuitX = modalX + 235;
        const btnQuitY = modalY + 150;

        ctx.fillStyle = "#3A6351";
        ctx.fillRect(btnResumeX, btnResumeY, btnW, btnH);
        ctx.strokeStyle = "#E5A93C";
        ctx.strokeRect(btnResumeX, btnResumeY, btnW, btnH);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("RESUME", btnResumeX + btnW / 2, btnResumeY + 34);

        ctx.fillStyle = "#A34836";
        ctx.fillRect(btnQuitX, btnQuitY, btnW, btnH);
        ctx.strokeStyle = "#E5A93C";
        ctx.strokeRect(btnQuitX, btnQuitY, btnW, btnH);

        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("QUIT", btnQuitX + btnW / 2, btnQuitY + 34);
    }

    if (dokdokma.isGameOver) {
        ctx.fillStyle = "rgba(18, 15, 13, 0.88)";
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

        ctx.textAlign = "center";
        if (dokdokma.hasWon) {
            ctx.fillStyle = "#E5A93C";
            ctx.font = "bold 48px sans-serif";
            ctx.fillText("YOU WIN!", VIRTUAL_WIDTH / 2, 200);

            if (currentRunArtifact) {
                ctx.fillStyle = "#C28245";
                ctx.font = "bold 24px sans-serif";
                ctx.fillText(`Artifact Unlocked: ${currentRunArtifact.name}`, VIRTUAL_WIDTH / 2, 260);

                ctx.fillStyle = "#E2D7C5";
                ctx.font = "18px sans-serif";
                ctx.fillText(currentRunArtifact.desc, VIRTUAL_WIDTH / 2, 300);
            }

            ctx.fillStyle = "#E2D7C5";
            ctx.font = "20px sans-serif";
            ctx.fillText(`Captured in: ${formatTime(dokdokma.elapsedTime)} (${dokdokma.difficulty.name})`, VIRTUAL_WIDTH / 2, 360);
            ctx.fillText("Tap screen to view game info & restart.", VIRTUAL_WIDTH / 2, 410);
        } else {
            ctx.fillStyle = "#A34836";
            ctx.font = "bold 56px sans-serif";
            ctx.fillText("GAME OVER", VIRTUAL_WIDTH / 2, 280);

            ctx.fillStyle = "#E2D7C5";
            ctx.font = "24px sans-serif";
            ctx.fillText(`Stamina Drained after ${formatTime(dokdokma.elapsedTime)}`, VIRTUAL_WIDTH / 2, 340);
            ctx.font = "20px sans-serif";
            ctx.fillText("Tap screen to view game info & restart.", VIRTUAL_WIDTH / 2, 400);
        }
    }
}

// =============================================
// KADANG-KADANG CANVAS RENDERING (WITH DYNAMIC TILT & STUMBLE)
// =============================================
function drawTraditionalPlayer(ctx, player, x, y, isPlayerTwo = false) {
    const walking = player.animTime;
    const moving = player.speed > 0.1 && !player.isStumbling;

    ctx.save();
    ctx.translate(x, y);

    const balanceOffset = player.balance - 50;

    if (player.isStumbling) {
        const stumbleProgress = 1 - (player.stumbleCooldown / 60);

        if (stumbleProgress < 0.35) {
            const wobbleAngle = Math.sin(stumbleProgress * 30) * 0.25;
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
            leanTilt = (balanceOffset / 50) * 0.35;
        }

        const wobbleShake = player.wobbleTime > 0 ? Math.sin(player.wobbleTime * 1.5) * 0.15 : 0;
        ctx.rotate(leanTilt + wobbleShake);
    }

    const stiltTilt = moving ? Math.cos(walking * 0.5) * 0.04 : 0;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.save();
    ctx.rotate(stiltTilt);
    const leftX = -12;
    const rightX = 12;

    ctx.strokeStyle = "#8C713B";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(leftX, 6); ctx.lineTo(leftX, -80);
    ctx.moveTo(rightX, 6); ctx.lineTo(rightX, -80);
    ctx.stroke();

    ctx.fillStyle = "#A8844E";
    ctx.fillRect(leftX - 5, -22, 10, 4);
    ctx.fillRect(rightX - 5, -22, 10, 4);
    ctx.restore();

    const spriteImg = isPlayerTwo ? kadangPlayer2Img : kadangPlayer1Img;
    const spriteWidth = 50;
    const spriteHeight = 64;

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

function renderKadang() {
    ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    drawCanvasBackground();

    const halfW = VIRTUAL_WIDTH / 2;

    // Player 1 Viewport
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, halfW, VIRTUAL_HEIGHT);
    ctx.clip();

    ctx.fillStyle = "#76C6F2";
    ctx.fillRect(0, 0, halfW, VIRTUAL_HEIGHT);

    ctx.fillStyle = "#B88A52";
    ctx.fillRect(0, VIRTUAL_HEIGHT * 0.6, halfW, VIRTUAL_HEIGHT * 0.4);
    ctx.fillStyle = "#D4A66C";
    ctx.beginPath();
    ctx.moveTo(halfW * 0.35, VIRTUAL_HEIGHT * 0.6);
    ctx.lineTo(halfW * 0.65, VIRTUAL_HEIGHT * 0.6);
    ctx.lineTo(halfW * 0.95, VIRTUAL_HEIGHT * 0.95);
    ctx.lineTo(halfW * 0.05, VIRTUAL_HEIGHT * 0.95);
    ctx.closePath();
    ctx.fill();
    drawKadangFinishLine(halfW);

    const p1Prog = Math.min(kadang.p1.distance / kadang.targetDistance, 1);
    const startY = VIRTUAL_HEIGHT * 0.90;
    const finishPosY = VIRTUAL_HEIGHT * 0.65;
    const p1Y = startY - p1Prog * (startY - finishPosY);

    drawTraditionalPlayer(ctx, kadang.p1, halfW * 0.5, p1Y, false);
    drawKadangBalanceHUD(kadang.p1, 30, 30, "PLAYER 1", "A / D");
    drawKadangTouchControllers(ctx);

    ctx.restore();

    ctx.strokeStyle = "#E5A93C";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(halfW, 0);
    ctx.lineTo(halfW, VIRTUAL_HEIGHT);
    ctx.stroke();

    // Player 2 Viewport
    ctx.save();
    ctx.translate(halfW, 0);
    ctx.beginPath();
    ctx.rect(0, 0, halfW, VIRTUAL_HEIGHT);
    ctx.clip();

    ctx.fillStyle = "#76C6F2";
    ctx.fillRect(0, 0, halfW, VIRTUAL_HEIGHT);

    ctx.fillStyle = "#B88A52";
    ctx.fillRect(0, VIRTUAL_HEIGHT * 0.6, halfW, VIRTUAL_HEIGHT * 0.4);
    ctx.fillStyle = "#D4A66C";
    ctx.beginPath();
    ctx.moveTo(halfW * 0.35, VIRTUAL_HEIGHT * 0.6);
    ctx.lineTo(halfW * 0.65, VIRTUAL_HEIGHT * 0.6);
    ctx.lineTo(halfW * 0.95, VIRTUAL_HEIGHT * 0.95);
    ctx.lineTo(halfW * 0.05, VIRTUAL_HEIGHT * 0.95);
    ctx.closePath();
    ctx.fill();
    drawKadangFinishLine(halfW);

    const p2Prog = Math.min(kadang.p2.distance / kadang.targetDistance, 1);
    const p2Y = startY - p2Prog * (startY - finishPosY);

    drawTraditionalPlayer(ctx, kadang.p2, halfW * 0.5, p2Y, true);
    drawKadangBalanceHUD(kadang.p2, 30, 30, "PLAYER 2", "◄ / ►");
    drawKadangTouchControllers(ctx);

    ctx.restore();

    drawInGameExitButton();

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

    if (kadang.isGameOver) {
        ctx.fillStyle = "rgba(18, 15, 13, 0.88)";
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

        ctx.textAlign = "center";
        ctx.fillStyle = "#E5A93C";
        ctx.font = "bold 46px sans-serif";
        ctx.fillText(`${kadang.winner.toUpperCase()} WINS! (${formatTime(kadang.elapsedTime)})`, VIRTUAL_WIDTH / 2, 250);

        ctx.font = "bold 40px sans-serif";
        ctx.fillStyle = "#A34836";
        ctx.fillText(`${kadang.loser.toUpperCase()} LOSE`, VIRTUAL_WIDTH / 2, 330);

        ctx.font = "18px sans-serif";
        ctx.fillStyle = "#E2D7C5";
        ctx.fillText("Tap screen to view game info & restart.", VIRTUAL_WIDTH / 2, 410);
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
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("KALINGA LEGENDS LOBBY", VIRTUAL_WIDTH / 2, 110);

    ctx.fillStyle = "#E2D7C5";
    ctx.font = "20px sans-serif";
    ctx.fillText(`Select a Minigame (${currentDeviceMode} MODE)`, VIRTUAL_WIDTH / 2, 150);

    drawLobbyCard(290, 240, 280, 320, "DOKDOKMA", "Pig Catching Game", "#3A6351");
    drawLobbyCard(710, 240, 280, 320, "KADANG-KADANG", "2-Player Stilt Race", "#3A6351");
}

function drawLobbyCard(x, y, w, h, title, sub, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#E2D7C5";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = "#E2D7C5";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title, x + w / 2, y + 140);
    ctx.font = "16px sans-serif";
    ctx.fillText(sub, x + w / 2, y + 180);
}

function renderAchievementsScreen() {
    ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    drawCanvasBackground();

    ctx.fillStyle = "rgba(18, 15, 13, 0.85)";
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    drawInGameExitButton();

    ctx.fillStyle = "#E5A93C";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ACHIEVEMENTS", VIRTUAL_WIDTH / 2, 90);

    const easyWins = playerAchievements.EASY.length;
    const medWins = playerAchievements.MEDIUM.length;
    const hardWins = playerAchievements.HARD.length;

    const cards = [
        { title: "EASY MASTERY", desc: "Catch the pig in Easy Mode", count: easyWins },
        { title: "MEDIUM MASTERY", desc: "Catch the pig in Medium Mode", count: medWins },
        { title: "HARD MASTERY", desc: "Catch the pig in Hard Mode", count: hardWins }
    ];

    cards.forEach((card, idx) => {
        const x = 160 + idx * 340;
        const y = 180;
        const w = 280;
        const h = 380;

        ctx.fillStyle = "#2B1A0E";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = card.count > 0 ? "#E5A93C" : "#5C4028";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = card.count > 0 ? "#E5A93C" : "#8C5A32";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(card.title, x + w / 2, y + 60);

        ctx.fillStyle = "#E2D7C5";
        ctx.font = "14px sans-serif";
        ctx.fillText(card.desc, x + w / 2, y + 110);

        let statusText = "LOCKED";
        let statusColor = "#A34836";
        if (card.count === 10) {
            statusText = "COMPLETED";
            statusColor = "#3A6351";
        } else if (card.count > 0) {
            statusText = "ONGOING";
            statusColor = "#E5A93C";
        }

        ctx.font = "bold 28px sans-serif";
        ctx.fillStyle = statusColor;
        ctx.fillText(statusText, x + w / 2, y + 220);

        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#E2D7C5";
        ctx.fillText(`Unlocked: ${card.count}/10`, x + w / 2, y + 280);
    });
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
            desc: "Awarded for completing the Easy Kalinga hunt.",
            requirement: "Collect all 10 Easy Artifacts (10/10)",
            count: playerAchievements.EASY.length,
            max: 10,
            unlocked: playerAchievements.EASY.length === 10
        },
        {
            rank: "Mansasag",
            sub: "Agile Tracker",
            desc: "Awarded for exceptional reflexes in Medium trials.",
            requirement: "Collect all 10 Medium Artifacts (10/10)",
            count: playerAchievements.MEDIUM.length,
            max: 10,
            unlocked: playerAchievements.MEDIUM.length === 10
        },
        {
            rank: "Maingel",
            sub: "Brave Warrior",
            desc: "The highest tribal honor for conquering Hard trials.",
            requirement: "Collect all 10 Hard Artifacts (10/10)",
            count: playerAchievements.HARD.length,
            max: 10,
            unlocked: playerAchievements.HARD.length === 10
        },
        {
            rank: "Pasil Potter",
            sub: "Archivist",
            desc: "Uncover every single cultural relic.",
            requirement: "Collect all 30/30 Artifacts",
            count: playerAchievements.EASY.length + playerAchievements.MEDIUM.length + playerAchievements.HARD.length,
            max: 30,
            unlocked: (playerAchievements.EASY.length + playerAchievements.MEDIUM.length + playerAchievements.HARD.length) === 30
        },
        {
            rank: "Stilt Acrobat",
            sub: "Balanced Stride",
            desc: "Win a stilt race without a single stumble.",
            requirement: "Finish Kadang-Kadang with 0 stumbles",
            count: 0,
            max: 1,
            unlocked: false
        },
        {
            rank: "Kabunian",
            sub: "Mountain Sprinter",
            desc: "Mastery of speed and balance in the high mountain stilt race.",
            requirement: "Win a Kadang-Kadang race",
            count: (kadang.isGameOver && kadang.winner !== null) ? 1 : 0,
            max: 1,
            unlocked: kadang.isGameOver && kadang.winner !== null
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
        let circleSymbol = "🔒";

        if (b.unlocked) {
            statusText = "STATUS: COMPLETED";
            statusColor = "#4A8C6F";
            circleSymbol = "★";
        } else if (b.count > 0 && b.count < b.max) {
            statusText = "STATUS: ONGOING";
            statusColor = "#E5A93C";
            circleSymbol = "🔒";
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

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(circleSymbol, circleX, circleY);
        ctx.textBaseline = "alphabetic";

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

        ctx.fillStyle = "#C28245";
        ctx.font = "18px sans-serif";
        ctx.fillText(b.sub, VIRTUAL_WIDTH / 2, modalY + 85);

        ctx.fillStyle = "#E2D7C5";
        ctx.font = "16px sans-serif";
        ctx.fillText(b.desc, VIRTUAL_WIDTH / 2, modalY + 135, modalW - 40);

        ctx.fillStyle = "#F3BA4F";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(`Unlock Requirement: ${b.requirement}`, VIRTUAL_WIDTH / 2, modalY + 200);

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

    ctx.fillStyle = "rgba(18, 15, 13, 0.85)";
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    drawInGameExitButton();

    ctx.fillStyle = "#E5A93C";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CULTURAL ARTIFACT GALLERY", VIRTUAL_WIDTH / 2, 80);

    const totalCollected = playerAchievements.EASY.length + playerAchievements.MEDIUM.length + playerAchievements.HARD.length;
    ctx.fillStyle = "#E2D7C5";
    ctx.font = "18px sans-serif";
    ctx.fillText(`Total Collected: ${totalCollected} / 30`, VIRTUAL_WIDTH / 2, 115);

    const tiers = [
        { name: "EASY TIER", list: CULTURAL_ARTIFACTS.EASY, unlocked: playerAchievements.EASY },
        { name: "MEDIUM TIER", list: CULTURAL_ARTIFACTS.MEDIUM, unlocked: playerAchievements.MEDIUM },
        { name: "HARD TIER", list: CULTURAL_ARTIFACTS.HARD, unlocked: playerAchievements.HARD }
    ];

    tiers.forEach((tier, tIdx) => {
        const startX = 120 + tIdx * 360;
        const startY = 150;

        ctx.fillStyle = "#2B1A0E";
        ctx.fillRect(startX, startY, 320, 500);
        ctx.strokeStyle = "#C28245";
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, 320, 500);

        ctx.fillStyle = "#E5A93C";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(tier.name, startX + 160, startY + 35);

        tier.list.forEach((art, aIdx) => {
            const isUnlocked = tier.unlocked.some(u => u.name === art.name);
            const itemY = startY + 60 + aIdx * 42;

            ctx.fillStyle = isUnlocked ? "rgba(58, 99, 81, 0.4)" : "rgba(43, 26, 14, 0.4)";
            ctx.fillRect(startX + 10, itemY, 300, 36);

            ctx.fillStyle = isUnlocked ? "#E5A93C" : "#722F22";
            ctx.textAlign = "left";
            ctx.font = "bold 14px sans-serif";
            ctx.fillText(`${aIdx + 1}. ${art.name}`, startX + 20, itemY + 22);

            ctx.textAlign = "right";
            ctx.fillText(isUnlocked ? "✓" : "🔒", startX + 300, itemY + 22);
        });
    });
}

// User Authentication & Database Sync
let currentUser = null;
let isRegisterMode = false;

(function injectAuthDrawerButton() {
    const sideDrawer = document.getElementById("side-drawer");
    if (!sideDrawer) return;
    const drawerList = sideDrawer.querySelector(".drawer-menu") || sideDrawer;

    const authBtn = document.createElement("button");
    authBtn.id = "btn-menu-auth";
    authBtn.className = "drawer-btn";
    authBtn.textContent = "Account Login";

    authBtn.style.backgroundColor = "#2E241E";
    authBtn.style.color = "#E5C396";
    authBtn.style.border = "1px solid #5C4333";
    authBtn.style.borderRadius = "6px";
    authBtn.style.padding = "14px 16px";
    authBtn.style.width = "100%";
    authBtn.style.textAlign = "center";
    authBtn.style.fontFamily = "sans-serif";
    authBtn.style.fontSize = "17px";
    authBtn.style.fontWeight = "500";
    authBtn.style.cursor = "pointer";
    authBtn.style.marginTop = "8px";
    authBtn.style.marginBottom = "4px";
    authBtn.style.boxSizing = "border-box";

    authBtn.addEventListener("click", () => {
        closeDrawer();
        openAuthModal();
    });

    drawerList.insertBefore(authBtn, drawerList.firstChild);
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