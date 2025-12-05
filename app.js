// =================================================================================
// PROJECT LEVIATHAN - Core Application Logic (app.js)
// PHASE 5: PROJECT PROMETHEUS - "The All-Seeing Eye" Module Integration
// =================================================================================

// ---------------------------------------------------------------------------------
// MODULE 1: DYNAMIC NEWS FEED ("The All-Seeing Eye")
// ---------------------------------------------------------------------------------

/**
 * Fetches news articles from the JSON database.
 * This is the foundational function for our intelligence stream.
 */
async function loadNews() {
    try {
        const response = await fetch('db.json');
        if (!response.ok) {
            throw new Error(`CRITICAL: Data stream failed. Status: ${response.status}`);
        }
        const data = await response.json();
        return data.articles;
    } catch (error) {
        console.error("Intelligence Feed Compromised:", error);
        // In a real-world scenario, we would have fallbacks. For now, we return an empty array.
        return [];
    }
}

/**
 * Renders the fetched news articles into the 'news-content' tab.
 * This function translates raw data into a structured, high-impact visual format.
 */    // Find and replace the entire renderNews function with this:
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

    // Purge existing content to prepare for the live feed.
    newsContent.innerHTML = ''; 

    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = 'Live Intelligence Feed';
    newsContent.appendChild(title);

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

    newsContent.appendChild(feedContainer);
}


// ---------------------------------------------------------------------------------
// CORE INITIALIZATION SEQUENCE
// This event listener is the trigger for the entire application.
// It ensures all systems are online only after the DOM is fully loaded.
// ---------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    
    // --- System 1: Tab Navigation Control ---
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all tabs and content
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activate the clicked tab and its corresponding content
            tab.classList.add('active');
            const targetContent = document.getElementById(tab.dataset.tab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // --- System 2: Simulated Mining Terminal ---
    const terminalBody = document.getElementById('terminal-body');
    const balanceElement = document.getElementById('civ-balance');
    const civPerClick = 10;
    let civBalance = parseFloat(localStorage.getItem('civBalance')) || 0;

    function updateBalance() {
        balanceElement.textContent = civBalance.toFixed(4);
        localStorage.setItem('civBalance', civBalance);
    }

    function logToTerminal(message, type = 'info') {
        const logEntry = document.createElement('div');
        logEntry.className = `terminal-log ${type}`;
        logEntry.innerHTML = `<span>[${new Date().toLocaleTimeString()}]</span> ${message}`;
        terminalBody.appendChild(logEntry);
        // Auto-scroll to the bottom
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    if (document.getElementById('mining-terminal')) {
        document.getElementById('mining-terminal').addEventListener('click', () => {
            civBalance += civPerClick;
            updateBalance();
            logToTerminal(`+${civPerClick} CIV mined. New Balance: ${civBalance.toFixed(4)}`, 'success');
        });
    }

    // Initial state setup
    updateBalance();
    logToTerminal("CIV Mining Protocol Initialized. System online. Awaiting user input.", "system");

    // --- System 3: TradingView Widget Injection ---
    // The widget script is already in index.html, this is a placeholder for future JS control if needed.
    // Example: Dynamically changing the symbol would happen here.

    // --- System 4: Activate Intelligence Feed ---
    // This is the final step in the boot sequence.
    loadNews().then(articles => {
        if (articles.length > 0) {
            renderNews(articles);
            console.log("Prometheus Module: 'All-Seeing Eye' is active.");
        } else {
            console.error("Prometheus Module: Failed to load intelligence data.");
        }
    });

    // Set a default active tab if none are active
    if (!document.querySelector('.tab-button.active')) {
        document.querySelector('.tab-button').click();
    }
});
