// State Variables
let currentScore = localStorage.getItem('cvc_score') ? parseInt(localStorage.getItem('cvc_score')) : 0;
let currentEnergy = 1000;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Router (Load Home by default)
    router('home');
    
    // 2. Fetch Live Data
    fetchCryptoData();
    
    // 3. Initialize Miner
    updateMinerUI();
    setInterval(regenerateEnergy, 1000);
});

// === 1. SYSTEM ROUTER (جابجایی بین صفحات) ===
function router(pageName) {
    // Hide all sections
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => sec.style.display = 'none');
    
    // Remove active class from nav
    const navLinks = document.querySelectorAll('.top-nav li');
    navLinks.forEach(link => link.classList.remove('active-link'));

    // Show target section
    const targetSection = document.getElementById(`section-${pageName}`);
    const targetLink = document.getElementById(`link-${pageName}`);
    
    if (targetSection) {
        targetSection.style.display = 'block';
        if (targetLink) targetLink.classList.add('active-link');
        
        // Special Init for Charts
        if (pageName === 'charts') {
            initTradingView();
        }
    }
}

// === 2. LIVE DATA (داده های واقعی بازار) ===
async function fetchCryptoData() {
    const listContainer = document.getElementById('crypto-list');
    
    try {
        // استفاده از API رایگان CoinCap
        const response = await fetch('https://api.coincap.io/v2/assets?limit=10');
        const data = await response.json();
        const assets = data.data;

        listContainer.innerHTML = ''; // پاک کردن اسپینر

        assets.forEach(coin => {
            const price = parseFloat(coin.priceUsd).toFixed(2);
            const change = parseFloat(coin.changePercent24Hr).toFixed(2);
            const isPositive = change >= 0;
            
            const row = document.createElement('div');
            row.className = 'crypto-row';
            row.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-weight:bold;">${coin.symbol}</span>
                    <span style="color:#8b949e; font-size:0.8em;">${coin.name}</span>
                </div>
                <div>$${price}</div>
                <div class="${isPositive ? 'price-up' : 'price-down'}">
                    ${isPositive ? '▲' : '▼'} ${change}%
                </div>
                <div>
                    <button style="background:none; border:1px solid #30363d; color:white; border-radius:4px; cursor:pointer;">خرید</button>
                </div>
            `;
            listContainer.appendChild(row);
        });

    } catch (error) {
        listContainer.innerHTML = '<p style="color:red; text-align:center;">خطا در دریافت قیمت‌ها. لطفا فیلترشکن را چک کنید یا صفحه را رفرش کنید.</p>';
        console.error('Error fetching crypto:', error);
    }
}

// === 3. TRADINGVIEW WIDGET (تحلیل تکنیکال) ===
let tvWidgetInitialized = false;
function initTradingView() {
    if (tvWidgetInitialized) return; // جلوگیری از لود تکراری
    
    new TradingView.widget({
        "width": "100%",
        "height": 500,
        "symbol": "BINANCE:BTCUSDT",
        "interval": "D",
        "timezone": "Asia/Tehran",
        "theme": "dark",
        "style": "1",
        "locale": "fa_IR",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_chart"
    });
    tvWidgetInitialized = true;
}

// === 4. CALCULATOR LOGIC (محاسبات عمرانی) ===
function calculateCivil() {
    const area = parseFloat(document.getElementById('calc-area').value);
    const cityFactor = parseFloat(document.getElementById('calc-city').value);
    const type = document.getElementById('calc-type').value;
    const resultBox = document.getElementById('calc-result');

    if (!area || area <= 0) {
        resultBox.innerHTML = "لطفا متراژ صحیح وارد کنید";
        resultBox.style.color = "red";
        return;
    }

    // قیمت پایه ساخت هر متر مربع (فرضی برای 1404) - مثلا 8 میلیون تومان
    let baseCost = 8000000;
    
    if (type === 'felez') baseCost *= 1.2; // فلزی 20% گرانتر

    const totalCost = area * baseCost * cityFactor;
    
    // فرمت کردن عدد به تومان
    const formattedCost = new Intl.NumberFormat('fa-IR').format(Math.floor(totalCost));
    
    resultBox.style.color = "#2f81f7";
    resultBox.innerHTML = `
        هزینه تقریبی ساخت:<br>
        <span style="font-size:1.5rem;">${formattedCost} تومان</span>
        <br><small style="color:white; font-size:0.7rem;">(برآورد اولیه بدون احتساب تجهیزات لوکس)</small>
    `;
}

// === 5. MINER LOGIC (ماینر) ===
const tapBtn = document.getElementById('tap-btn');
const scoreEl = document.getElementById('miner-score');
const energyFill = document.getElementById('energy-fill');
const energyVal = document.getElementById('energy-val');

function updateMinerUI() {
    scoreEl.innerText = currentScore;
    energyVal.innerText = currentEnergy;
    energyFill.style.width = (currentEnergy / 1000 * 100) + "%";
}

tapBtn.addEventListener('click', () => {
    if (currentEnergy > 0) {
        currentScore++;
        currentEnergy--;
        
        // ذخیره در لوکال استوریج
        localStorage.setItem('cvc_score', currentScore);
        
        updateMinerUI();
        
        // انیمیشن کلیک (ساده)
        tapBtn.style.transform = "scale(0.9)";
        setTimeout(() => tapBtn.style.transform = "scale(1)", 100);
    }
});

function regenerateEnergy() {
    if (currentEnergy < 1000) {
        currentEnergy++;
        updateMinerUI();
    }
}

