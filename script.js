/**
 * ピッグリ運命の選択 - クライアントサイド・ロジック
 */

let appState = {
    currentWeightLevel: 1,
    unlockedZukan: [false, true, false, false, false],
    currentOmikujiResult: null
};

const WEIGHT_CONFIG = {
    0: { text: "スタイリッシュ(虹)", class: "avatar-slim", badgeClass: "status-slim" },
    1: { text: "標準ブヒ(ピンク)", class: "avatar-normal", badgeClass: "status-normal" },
    2: { text: "マシュマロ(緑)", class: "avatar-chubby", badgeClass: "status-chubby" },
    3: { text: "わがまま(青)", class: "avatar-fat", badgeClass: "status-fat" },
    4: { text: "ギガ・ブタ(茶色)", class: "avatar-giga", badgeClass: "status-giga" }
};

const ZUKAN_NAMES = {
    0: "スタイリッシュ（虹色）",
    1: "標準ブヒ（ピンク）",
    2: "マシュマロ（緑）",
    3: "わがまま（青）",
    4: "ギガ・ブタ（茶色）"
};

const OMIKUJI_POOL = [
    { type: 'good', luck: '超大吉', food: '🥬 新鮮サラダ' },
    { type: 'good', luck: '大吉', food: '🧘 1食スキップ！' },
    { type: 'good', luck: '中吉', food: '🐟 焼き魚定食' },
    { type: 'good', luck: '小吉', food: '🍎 リンゴ1個' },
    { type: 'bad', luck: '凶', food: '🍜 豚骨ラーメン' },
    { type: 'bad', luck: '大凶', food: '🍔 ダブルチーズバーガー' },
    { type: 'bad', luck: '末凶', food: '🍕 特盛りピザ' }
];

const screens = {
    home: document.getElementById('screen-home'),
    omikuji: document.getElementById('screen-omikuji'),
    detector: document.getElementById('screen-detector'),
    resolution: document.getElementById('screen-resolution'),
    zukan: document.getElementById('screen-zukan')
};

const pigAvatar = document.getElementById('pig-avatar');
const pigStatusText = document.getElementById('pig-status-text');
const omikujiLoading = document.getElementById('omikuji-loading');
const omikujiResult = document.getElementById('omikuji-result');
const omikujiLuck = document.getElementById('omikuji-luck');
const omikujiFood = document.getElementById('omikuji-food');
const detectorStatus = document.getElementById('detector-status');
const resolutionTitle = document.getElementById('resolution-title');
const resolutionPigAvatar = document.getElementById('resolution-pig-avatar');
const resolutionText = document.getElementById('resolution-text');

function showScreen(screenKey) {
    Object.keys(screens).forEach(key => {
        screens[key].classList.toggle('active', key === screenKey);
    });
    if (screenKey === 'home') updateHomeDisplay();
    if (screenKey === 'zukan') renderZukan();
}

function updateHomeDisplay() {
    const config = WEIGHT_CONFIG[appState.currentWeightLevel];
    pigAvatar.className = "pig-image " + config.class;
    pigStatusText.textContent = config.text;
    pigStatusText.className = "status-badge " + config.badgeClass;
}

function handleDrawOmikuji() {
    showScreen('omikuji');
    omikujiLoading.classList.remove('hidden');
    omikujiResult.classList.add('hidden');
    
    setTimeout(() => {
        omikujiLoading.classList.add('hidden');
        omikujiResult.classList.remove('hidden');
        appState.currentOmikujiResult = OMIKUJI_POOL[Math.floor(Math.random() * OMIKUJI_POOL.length)];
        omikujiLuck.textContent = appState.currentOmikujiResult.luck;
        omikujiFood.textContent = appState.currentOmikujiResult.food;
    }, 1500);
}

function handleReportSuccess() {
    showScreen('detector');
    detectorStatus.textContent = "計測中...";
    setTimeout(() => {
        processResolution(Math.random() > 0.5);
    }, 2000);
}

function processResolution(isPassed) {
    showScreen('resolution');
    const foodType = appState.currentOmikujiResult.type;
    let message = "";
    
    if (isPassed) {
        if (foodType === 'good') {
            if (appState.currentWeightLevel > 0) appState.currentWeightLevel--;
            message = "🎉 【合格】正直に我慢しましたね！ブタさんの色が鮮やかに変化しました！";
        } else {
            if (appState.currentWeightLevel < 4) appState.currentWeightLevel++;
            message = "🍔 【合格】正直に食べましたね。指示通りブタさんの色が変わりました。";
        }
    } else {
        if (appState.currentWeightLevel < 4) appState.currentWeightLevel++;
        message = "🚨 【エラー】嘘つき判定！理不尽ペナルティでブタさんの色が突然変異しました！";
    }
    
    appState.unlockedZukan[appState.currentWeightLevel] = true;
    const config = WEIGHT_CONFIG[appState.currentWeightLevel];
    resolutionPigAvatar.className = "pig-image " + config.class;
    resolutionText.innerHTML = message;
}

function renderZukan() {
    for (let i = 0; i <= 4; i++) {
        let itemEl;
        switch(i) {
            case 0: itemEl = document.getElementById('zukan-slim'); break;
            case 1: itemEl = document.getElementById('zukan-normal'); break;
            case 2: itemEl = document.getElementById('zukan-chubby'); break;
            case 3: itemEl = document.getElementById('zukan-fat'); break;
            case 4: itemEl = document.getElementById('zukan-giga'); break;
        }
        if (itemEl) {
            if (appState.unlockedZukan[i]) {
                itemEl.innerHTML = `
                    <div class="zukan-pic item-${getStylePrefix(i)}"></div>
                    <p>${ZUKAN_NAMES[i]}</p>
                `;
            } else {
                itemEl.innerHTML = `<div class="zukan-pic">🔒</div><p>未解放</p>`;
            }
        }
    }
}

function getStylePrefix(level) {
    return ['slim', 'normal', 'chubby', 'fat', 'giga'][level];
}

document.addEventListener('DOMContentLoaded', () => {
    updateHomeDisplay();
    document.getElementById('btn-draw-omikuji').addEventListener('click', handleDrawOmikuji);
    document.getElementById('btn-open-zukan').addEventListener('click', () => showScreen('zukan'));
    document.getElementById('btn-close-zukan').addEventListener('click', () => showScreen('home'));
    document.getElementById('btn-report-success').addEventListener('click', handleReportSuccess);
    document.getElementById('btn-back-home').addEventListener('click', () => showScreen('home'));
});