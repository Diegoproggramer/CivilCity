document.addEventListener('DOMContentLoaded', function () {
    // --- CORE TAB NAVIGATION ---
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tab.dataset.tab) {
                    content.classList.add('active');
                }
            });
        });
    });

    // --- MINING TERMINAL MODULE ---
    const miningTerminal = document.getElementById('mining-terminal');
    const terminalBody = document.getElementById('terminal-body');
    const civBalanceEl = document.getElementById('civ-balance');
    let civBalance = 0.0;

    function addLog(message, type = 'info') {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `> ${new Date().toLocaleTimeString()}: ${message}`;
        terminalBody.appendChild(logEntry);
        terminalBody.scrollTop = terminalBody.scrollHeight; // Auto-scroll
    }

    if (miningTerminal) {
        miningTerminal.addEventListener('click', () => {
            addLog('Mining attempt initiated...');
            const success = Math.random() < 0.7; // 70% success rate
            if (success) {
                const minedAmount = parseFloat((Math.random() * 0.0005).toFixed(6));
                civBalance += minedAmount;
                civBalanceEl.textContent = civBalance.toFixed(6);
                addLog(`Block found! +${minedAmount.toFixed(6)} CIV. New Balance: ${civBalance.toFixed(6)}`, 'success');
            } else {
                addLog('Mining failed. No block found.', 'error');
            }
        });
        addLog('Ghost Protocol Initialized. Awaiting user input...');
    }

    // --- PROMETHEUS NEWS FEED MODULE ---
    function loadNews() {
        fetch('db.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.newsFeed) {
                    // Call renderNews to inject feed into the sidebar
                    renderNews(data.newsFeed, 'news-sidebar-container');
                } else {
                    console.error('News feed data is missing or malformed in db.json');
                }
            })
            .catch(error => {
                console.error("Failed to load news feed:", error);
                const newsContainer = document.getElementById('news-sidebar-container');
                if(newsContainer) {
                    newsContainer.innerHTML = `<p style="color: var(--error-color);">Error: Could not load intelligence feed. System disconnected.</p>`;
                }
            });
    }

    function renderNews(articles, targetElementId) {
        const newsContainer = document.getElementById(targetElementId);
        if (!newsContainer) {
            console.error(`Target container '${targetElementId}' not found. Aborting render.`);
            return;
        }
    
        // Purge existing content to prepare for the live feed.
        newsContainer.innerHTML = ''; 
    
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = 'Live Intelligence Feed';
        newsContainer.appendChild(title);
    
        const feedContainer = document.createElement('div');
        feedContainer.className = 'news-feed';
        
        // Process each intelligence packet.
        articles.forEach(article => {
            const item = document.createElement('div');
            item.className = 'news-item';
            
            const header = document.createElement('div');
            header.className = 'news-header';
            header.innerHTML = `
                <span class="news-category ${article.category.toLowerCase().replace(' ', '-')}">${article.category}</span>
                <span class="news-source">Source: ${article.source}</span>
                <span class="news-timestamp">${new Date(article.timestamp).toLocaleString()}</span>
            `;
            
            const headline = document.createElement('h3');
            headline.className = 'news-headline';
            headline.textContent = article.headline;
    
            const summary = document.createElement('p');
            summary.className = 'news-summary';
            summary.textContent = article.summary;
    
            const tags = document.createElement('div');
            tags.className = 'news-tags';
            article.tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = tag;
                tags.appendChild(tagSpan);
            });
    
            item.appendChild(header);
            item.appendChild(headline);
            item.appendChild(summary);
            item.appendChild(tags);
            
            feedContainer.appendChild(item);
        });
    
        newsContainer.appendChild(feedContainer);
    }
    
    // Initial data load
    loadNews();
});
