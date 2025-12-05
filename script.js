document.addEventListener('DOMContentLoaded', () => {
    // Fetch data and initialize modules
    fetch('db.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            initNarrative(data.narrative);
            initCharts(data.housingData, data.steelData);
            initEstimator(data.estimatorParams);
            initNewsTicker(data.newsTicker);
        })
        .catch(error => {
            console.error('Error fetching or parsing data:', error);
            document.body.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Failed to load critical data from db.json.</div>`;
        });

    // Tab switching logic
    const tabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');

            const target = document.querySelector(tab.dataset.target);
            tabContents.forEach(content => content.style.display = 'none');
            if (target) target.style.display = 'block';
        });
    });

    // Initialize the first tab
    document.querySelector('.nav-tab').click();

    // Mining Terminal Logic
    initMiningTerminal();
});

function initNarrative(data) {
    const el = document.getElementById('brand-story');
    if (el) el.innerText = data.story;
}

function initNewsTicker(data) {
    const tickerElement = document.getElementById('news-ticker-content');
    if (!tickerElement) return;
    let newsIndex = 0;
    setInterval(() => {
        tickerElement.style.opacity = 0;
        setTimeout(() => {
            newsIndex = (newsIndex + 1) % data.length;
            tickerElement.innerText = data[newsIndex];
            tickerElement.style.opacity = 1;
        }, 500);
    }, 5000);
}

function initCharts(housingData, steelData) {
    const housingCtx = document.getElementById('housingChart');
    if (housingCtx) {
        new Chart(housingCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: housingData.labels,
                datasets: [{ label: 'شاخص قیمت مسکن (میلیون تومان)', data: housingData.prices, borderColor: '#00f7ff', backgroundColor: 'rgba(0, 247, 255, 0.1)', tension: 0.4, fill: true }]
            },
            options: { responsive: true, plugins: { legend: { labels: { color: '#fff' } } }, scales: { x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.1)' } }, y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.1)' } } } }
        });
    }

    const steelCtx = document.getElementById('steelChart');
    if (steelCtx) {
        new Chart(steelCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: steelData.labels,
                datasets: [{ label: 'قیمت فولاد (تومان)', data: steelData.prices, backgroundColor: '#ffd700' }]
            },
            options: { responsive: true, plugins: { legend: { labels: { color: '#fff' } } }, scales: { x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.1)' } }, y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.1)' } } } }
        });
    }
}

function initEstimator(params) {
    const form = document.getElementById('estimatorForm');
    const resultDiv = document.getElementById('estimatorResult');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const area = parseFloat(document.getElementById('area').value);
        const quality = document.getElementById('quality').value;
        if (isNaN(area) || area <= 0) {
            resultDiv.innerText = "لطفاً متراژ معتبر وارد کنید.";
            resultDiv.style.color = "#ff4a4a";
            return;
        }
        const cost = area * params.baseCostPerMeter * params.qualityMultiplier[quality];
        resultDiv.innerText = `هزینه تخمینی ساخت: ${cost.toLocaleString('fa-IR')} تومان`;
        resultDiv.style.color = "#00f7ff";
    });
}

// --- NEW MINING TERMINAL ---
function initMiningTerminal() {
    const terminal = document.getElementById('mining-terminal');
    const openBtn = document.getElementById('open-miner-btn');
    const closeBtn = document.getElementById('close-terminal-btn');
    const mineBtn = document.getElementById('mine-click-area');
    const balanceEl = document.getElementById('civ-balance-terminal');

    let balance = parseFloat(localStorage.getItem('civ_balance_v2')) || 0.0000;
    balanceEl.innerText = balance.toFixed(6);

    function updateBalance(newBalance) {
        balance = newBalance;
        balanceEl.innerText = balance.toFixed(6);
        localStorage.setItem('civ_balance_v2', balance);
    }

    openBtn.addEventListener('click', () => terminal.style.display = 'flex');
    closeBtn.addEventListener('click', () => terminal.style.display = 'none');

    mineBtn.addEventListener('mousedown', () => {
        // Visual feedback
        mineBtn.style.transform = 'scale(0.95)';
        if (navigator.vibrate) navigator.vibrate(50);
        
        // Add floating number effect
        const floatingText = document.createElement('div');
        const reward = 0.001 + Math.random() * 0.002;
        floatingText.innerText = `+${reward.toFixed(6)}`;
        floatingText.className = 'floating-text';
        mineBtn.appendChild(floatingText);
        setTimeout(() => floatingText.remove(), 1000);

        // Update balance
        updateBalance(balance + reward);
    });

    mineBtn.addEventListener('mouseup', () => {
        mineBtn.style.transform = 'scale(1)';
    });

    // Passive mining simulation
    setInterval(() => {
        updateBalance(balance + 0.000010);
    }, 1000);
}
