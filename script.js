document.addEventListener('DOMContentLoaded', () => {
    fetch('db.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Initialize all modules with data from db.json
            initNarrative(data.narrative);
            initCharts(data.housingData, data.steelData);
            initEstimator(data.estimatorParams);
            initNewsTicker(data.newsTicker);
        })
        .catch(error => {
            console.error('Error fetching or parsing data:', error);
            // Display error to the user on the page
            document.body.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">Failed to load critical data. Please check db.json and network connection.</div>`;
        });
});

function initNarrative(narrativeData) {
    document.getElementById('brand-story').innerText = narrativeData.story;
}

function initNewsTicker(newsData) {
    const tickerElement = document.getElementById('news-ticker-content');
    let newsIndex = 0;
    setInterval(() => {
        tickerElement.style.opacity = 0;
        setTimeout(() => {
            newsIndex = (newsIndex + 1) % newsData.length;
            tickerElement.innerText = newsData[newsIndex];
            tickerElement.style.opacity = 1;
        }, 500);
    }, 5000); // Change news every 5 seconds
}

function initCharts(housingData, steelData) {
    // Chart.js - Housing Market
    const housingCtx = document.getElementById('housingChart').getContext('2d');
    new Chart(housingCtx, {
        type: 'line',
        data: {
            labels: housingData.labels,
            datasets: [{
                label: 'شاخص قیمت مسکن (میلیون تومان)',
                data: housingData.prices,
                borderColor: '#00f7ff',
                backgroundColor: 'rgba(0, 247, 255, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#fff' } } },
            scales: {
                x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
        }
    });

    // Chart.js - Steel Market
    const steelCtx = document.getElementById('steelChart').getContext('2d');
    new Chart(steelCtx, {
        type: 'bar',
        data: {
            labels: steelData.labels,
            datasets: [{
                label: 'قیمت فولاد (تومان)',
                data: steelData.prices,
                backgroundColor: '#ffd700',
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#fff' } } },
            scales: {
                x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
        }
    });
}

function initEstimator(params) {
    const form = document.getElementById('estimatorForm');
    const resultDiv = document.getElementById('estimatorResult');

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
