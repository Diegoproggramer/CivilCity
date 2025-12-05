// --- PROJECT LEVIATHAN: APPLICATION LOGIC (app.js) ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Global Data Fetch ---
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            // Populate dynamic content
            document.getElementById('brand-story').textContent = data.brandStory;
            // Removed chart logic as we are using more TradingView widgets
        })
        .catch(error => console.error('Error fetching db.json:', error));

    // --- Tab Navigation Logic ---
    const tabs = document.querySelectorAll('.main-nav button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activate clicked tab
            tab.classList.add('active');
            const target = document.querySelector(tab.dataset.target);
            if (target) {
                target.classList.add('active');
            }
        });
    });

    // Default to the first tab
    if (tabs.length > 0) {
        tabs[0].click();
    }

    // --- AI Estimator Logic ---
    const estimatorForm = document.getElementById('estimatorForm');
    if (estimatorForm) {
        estimatorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const area = parseFloat(document.getElementById('area').value);
            const quality = document.getElementById('quality').value;
            let costPerMeter;
            switch(quality) {
                case 'premium': costPerMeter = 15000000; break;
                case 'luxury': costPerMeter = 25000000; break;
                default: costPerMeter = 9000000;
            }
            const totalCost = area * costPerMeter;
            document.getElementById('estimatorResult').textContent = `هزینه تخمینی: ${totalCost.toLocaleString('fa-IR')} تومان`;
        });
    }

    // --- Mining Terminal Logic ---
    const miningTerminal = document.getElementById('mining-terminal');
    const openMinerBtn = document.getElementById('open-miner-btn');
    const closeTerminalBtn = document.getElementById('close-terminal-btn');
    const mineClickArea = document.getElementById('mine-click-area');
    const civBalanceTerminal = document.getElementById('civ-balance-terminal');

    let civBalance = parseFloat(localStorage.getItem('civBalance_v2')) || 0;
    const MINE_INCREMENT = 0.000035; // Example value

    const updateBalanceDisplay = () => {
        civBalanceTerminal.textContent = civBalance.toFixed(6);
    };

    if (openMinerBtn) {
        openMinerBtn.addEventListener('click', () => miningTerminal.style.display = 'flex');
    }
    if (closeTerminalBtn) {
        closeTerminalBtn.addEventListener('click', () => miningTerminal.style.display = 'none');
    }
    if (mineClickArea) {
        mineClickArea.addEventListener('click', (e) => {
            civBalance += MINE_INCREMENT;
            localStorage.setItem('civBalance_v2', civBalance.toString());
            updateBalanceDisplay();

            // Create floating text effect
            const floatingText = document.createElement('div');
            floatingText.className = 'floating-text';
            floatingText.textContent = `+${MINE_INCREMENT.toFixed(6)}`;
            floatingText.style.left = `${e.clientX - mineClickArea.getBoundingClientRect().left - 30}px`;
            floatingText.style.top = `${e.clientY - mineClickArea.getBoundingClientRect().top - 20}px`;
            mineClickArea.appendChild(floatingText);
            setTimeout(() => floatingText.remove(), 1200);

            // Click visual effect
            mineClickArea.style.transform = 'scale(0.98)';
            setTimeout(() => mineClickArea.style.transform = 'scale(1)', 100);
        });
    }

    // Initial balance update
    updateBalanceDisplay();
});

