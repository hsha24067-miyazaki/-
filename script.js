/**
 * ピッグリ運命の選択 - クライアントサイド・ロジック
 */

// --- アプリケーション状態の管理 (State) ---
let appState = {
    currentWeightLevel: 1, // 0: スタイリッシュ, 1: 標準, 2: ぽっちゃり, 3: 大激太り, 4: ギガデブ
    unlockedZukan: [false, true, false, false, false], // 最初は「標準(1)」のみ解放
    currentOmikujiResult: null
};

// 体型データの定義
const WEIGHT_CONFIG = {
    0: { text: "スタイリッシュ", class: "avatar-slim", badgeClass: "status-slim" },
    1: { text: "標準ブヒ", class: "avatar-normal", badgeClass: "status-normal" },
    2: { text: "ぽっちゃり", class: "avatar-chubby", badgeClass: "status-chubby" },
    3: { text: "大激太り", class: "avatar-fat", badgeClass: "status-fat" },
    4: { text: "ギガデブ(最終形態)", class: "avatar-giga", badgeClass: "status-giga" }
};

// 図鑑の名前マッピング
const ZUKAN_NAMES = {
    0: "スタイリッシュ・ピッグ",
    1: "標準ブヒ",
    2: "マシュマロ・トントン",
    3: "わがままボディ・ブー",
    4: "ギガ・ブタゴラス"
};

// おみくじ結果データベース
const OMIKUJI_POOL = [
    { type: 'good', luck: '超大吉', food: '🥬 新鮮サラダ＆プロテイン' },
    { type: 'good', luck: '大吉', food: '🧘 1食スキップ（水で我慢！）' },
    { type: 'good', luck: '中吉', food: '🐟 焼き魚と十六穀米定食' },
    { type: 'good', luck: '小吉', food: '🍎 リンゴ1個とヨーグルト' },
    { type: 'bad', luck: '凶', food: '🍜 背脂マシマシ豚骨ラーメン' },
    { type: 'bad', luck: '大凶', food: '🍔 メガ盛背徳のダブルチーズバーガー' },
    { type: 'bad', luck: '末凶', food: '🍕 特盛りピザ＆ドデカコーラ' }
];

// --- DOM 要素の取得 ---
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

// --- 画面遷移コントロール ---
function showScreen(screenKey) {
    Object.keys(screens).forEach(key => {
        if (key === screenKey) {
            screens[key].classList.add('active');
        } else {
            screens[key].classList.remove('active');
        }
    });
    
    // 特定の画面に遷移した際のリフレッシュ処理
    if (screenKey === 'home') {
        updateHomeDisplay();
    } else if (screenKey === 'zukan') {
        renderZukan();
    }
}

// --- メインロジック ---

// ホーム画面の豚の姿・バッジを更新
function updateHomeDisplay() {
    const config = WEIGHT_CONFIG[appState.currentWeightLevel];
    
    // クラスの全リセットと再付与
    pigAvatar.className = "pig-image " + config.class;
    pigStatusText.textContent = config.text;
    pigStatusText.className = "status-badge " + config.badgeClass;
}

// おみくじを引く
function handleDrawOmikuji() {
    showScreen('omikuji');
    omikujiLoading.classList.remove('hidden');
    omikujiResult.classList.add('hidden');
    
    // 1.5秒シャッフルを演出
    setTimeout(() => {
        omikujiLoading.classList.add('hidden');
        omikujiResult.classList.remove('hidden');
        
        // ランダムでおみくじを抽選
        const randomIndex = Math.floor(Math.random() * OMIKUJI_POOL.length);
        appState.currentOmikujiResult = OMIKUJI_POOL[randomIndex];
        
        // 画面への反映
        omikujiLuck.textContent = appState.currentOmikujiResult.luck;
        omikujiFood.textContent = appState.currentOmikujiResult.food;
        
        // 運勢に応じたクラス付与
        if (appState.currentOmikujiResult.type === 'good') {
            omikujiLuck.className = "luck-title luck-good";
        } else {
            omikujiLuck.className = "luck-title luck-bad";
        }
    }, 1500);
}

// 嘘発見器の作動
function handleReportSuccess() {
    showScreen('detector');
    detectorStatus.textContent = "心拍数を計測中...";
    
    // 完全ランダムな嘘発見器判定（2秒後に結果）
    setTimeout(() => {
        const isPassed = Math.random() > 0.5; // 50%の確率で「正直」か「嘘つき」か
        
        processResolution(isPassed);
    }, 2000);
}

// 運命の最終処理
function processResolution(isPassed) {
    showScreen('resolution');
    
    const originalLevel = appState.currentWeightLevel;
    const foodType = appState.currentOmikujiResult.type; // 'good' = ヘルシー, 'bad' = 太る料理
    
    let isSuccess = false;
    let message = "";
    
    if (isPassed) {
        // 嘘発見器をパスした場合
        if (foodType === 'good') {
            // ヘルシーメニューに正直に従った → 痩せる
            if (appState.currentWeightLevel > 0) appState.currentWeightLevel--;
            isSuccess = true;
            message = `🎉 【誠実判定：合格】<br>おめでとうございます！指示通り「${appState.currentOmikujiResult.food}」を選択したあなたを嘘発見器は正直者と認めました！<br>身体に良い選択をしたため、ブタさんはスリムになりました！`;
        } else {
            // 太るメニューに正直に従った → 太る（理不尽おみくじルール）
            if (appState.currentWeightLevel < 4) appState.currentWeightLevel++;
            isSuccess = false;
            message = `🍔 【誠実判定：合格】<br>嘘発見器「あなたは正直に高カロリー食品を食べましたね。」<br>おみくじの絶対ルールに従って「${appState.currentOmikujiResult.food}」を食べたため、ブタさんは丸々と太ってしまいました！これぞ理不尽の極み！`;
        }
    } else {
        // 嘘発見器で「嘘つき」濡れ衣判定された場合（完全な理不尽ペナルティ）
        if (appState.currentWeightLevel < 4) appState.currentWeightLevel++;
        isSuccess = false;
        message = `🚨 【誠実判定：エラー（嘘つき判定）】<br>ブブーーッ！！嘘発見器があなたの不穏な心拍数をキャッチしました！<br>「本当は我慢してないブヒね！？」と疑われ、理不尽ペナルティとしてブタさんが急激に太ってしまいました！`;
    }
    
    // 新しい状態を図鑑に登録
    appState.unlockedZukan[appState.currentWeightLevel] = true;
    
    // 解放結果画面のビジュアル更新
    resolutionTitle.textContent = isSuccess ? "✨ ナイスチョイス！ ✨" : "😭 ナムアミブダブダ... 😭";
    resolutionTitle.style.color = isSuccess ? "var(--primary-dark)" : "#CC0000";
    
    const newConfig = WEIGHT_CONFIG[appState.currentWeightLevel];
    resolutionPigAvatar.className = "pig-image " + newConfig.class;
    resolutionText.innerHTML = message;
}

// 図鑑（コレクション）画面の描画
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
                // 解放済み
                itemEl.innerHTML = `
                    <div class="zukan-pic item-${getStylePrefix(i)}"></div>
                    <p class="zukan-name">${ZUKAN_NAMES[i]}</p>
                `;
            } else {
                // 未解放
                itemEl.innerHTML = `
                    <div class="zukan-pic" style="background-color: #E0E0E0; border-radius: 50%;">🔒</div>
                    <p class="zukan-name" style="color:#aaa;">未解放</p>
                `;
            }
        }
    }
}

function getStylePrefix(level) {
    if (level === 0) return 'slim';
    if (level === 1) return 'normal';
    if (level === 2) return 'chubby';
    if (level === 3) return 'fat';
    return 'giga';
}

// --- イベントリスナーの登録 ---
document.addEventListener('DOMContentLoaded', () => {
    // 初回読み込み表示
    updateHomeDisplay();
    
    // ボタンクリック関連
    document.getElementById('btn-draw-omikuji').addEventListener('click', handleDrawOmikuji);
    document.getElementById('btn-open-zukan').addEventListener('click', () => showScreen('zukan'));
    document.getElementById('btn-close-zukan').addEventListener('click', () => showScreen('home'));
    document.getElementById('btn-report-success').addEventListener('click', handleReportSuccess);
    document.getElementById('btn-back-home').addEventListener('click', () => showScreen('home'));
});