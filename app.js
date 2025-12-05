/**
 * HYPERION ENGINE v1.2
 * Scalable Single-Page Application (SPA) Core
 * 
 * This engine manages routing, state, and dynamic content rendering for the Civil City portal.
 * It is designed for modular expansion and high performance.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('[HYPERION ENGINE v1.2] Boot sequence initiated...');

    // --- STATE MANAGEMENT --- //
    // Centralized state object to hold all dynamic application data.
    const state = {
        db: null,
        lang: localStorage.getItem('lang') || 'fa',
        theme: localStorage.getItem('theme') || 'dark',
        currentPage: 'home'
    };

    // --- DOM ELEMENT CACHE --- //
    // Caching DOM elements for faster access and cleaner code.
    const dom = {
        outlet: document.getElementById('content-outlet'),
        nav: document.getElementById('main-nav'),
        langSwitcher: document.getElementById('lang-switcher'),
        themeSwitcher: document.getElementById('theme-switcher'),
        body: document.body,
        html: document.documentElement,
        tickerContainer: document.getElementById('ticker-tape-container')
    };

    // --- CORE INITIALIZATION --- //
    // The main function that orchestrates the application startup.
    const init = async () => {
        console.log('[HYPERION ENGINE] Initializing core systems...');
        setupEventListeners();
        applyInitialSettings();

        const dbLoaded = await fetchData();
        if (dbLoaded) {
            console.log('[HYPERION ENGINE] Core database loaded successfully.');
            // Initial route handling and setting up the listener for future changes.
            window.addEventListener('hashchange', handleRouteChange);
            handleRouteChange(); // Render the initial page based on the current URL hash
            loadTickerTape();
        } else {
            console.error('[HYPERION ENGINE] CRITICAL FAILURE: Database fetch failed. System halted.');
            displayFatalError('DATA_LINK_FAILURE', 'The core database (db.json) could not be fetched or parsed.');
        }
    };

    // --- DATA FETCHING --- //
    // Fetches the main database file. Returns true on success, false on failure.
    const fetchData = async () => {
        try {
            console.log('[HYPERION ENGINE] Fetching database: db.json');
            const response = await fetch('db.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}. File not found or server error.`);
            }
            state.db = await response.json();
            return true;
        } catch (error) {
            console.error('[HYPERION ENGINE] Database fetch/parse error:', error);
            return false;
        }
    };

    // --- ROUTING & NAVIGATION --- //
    // Handles changes in the URL hash to render the correct page.
    const handleRouteChange = () => {
        const pageId = window.location.hash.substring(1) || 'home';
        console.log(`[HYPERION ENGINE] Navigation event: Routing to page -> ${pageId}`);
        state.currentPage = pageId;
        renderNavigation();
        renderPage(pageId);
    };

    // --- UI RENDERING --- //
    
    // Renders the main navigation bar based on the current language and active page.
    const renderNavigation = () => {
        if (!state.db) return;
        const navItems = state.db.navigation[state.lang];
        dom.nav.innerHTML = navItems.map(item =>
            `<a href="#${item.id}" class="${item.id === state.currentPage ? 'active' : ''}">${item.text}</a>`
        ).join('');
        console.log('[HYPERION ENGINE] Navigation bar rendered.');
    };

    // Main function to render page content into the outlet.
    const renderPage = (pageId) => {
        if (!state.db || !state.db.pages[state.lang][pageId]) {
            console.warn(`[HYPERION ENGINE] Content for page '${pageId}' not found. Rendering fallback.`);
            displayFatalError('CONTENT_NOT_FOUND', `Content for page ID '${pageId}' does not exist in the database.`);
            return;
        }

        const pageInfo = state.db.pages[state.lang][pageId];
        let html = `<h1>${pageInfo.title}</h1>`;
        if (pageInfo.content) {
            html += `<p>${pageInfo.content}</p>`;
        }

        // Append page-specific modules
        if (pageId === 'news') html += renderArticleGrid();
        if (pageId === 'analysis') html += '<div id="technical-analysis-widget-container" style="height: 600px;"></div>';

        dom.outlet.innerHTML = html;
        console.log(`[HYPERION ENGINE] Content for page '${pageId}' rendered successfully.`);

        // Post-render actions (like loading scripts for specific pages)
        if (pageId === 'analysis') {
            loadAdvancedAnalysisWidget();
        }
    };
    
    // Renders the grid of articles for the news page.
    const renderArticleGrid = () => {
        const articles = state.db.articles;
        let gridHtml = '<div class="grid-container">';
        gridHtml += articles.map(article => `
            <div class="card">
                <img src="${article.image_url}" alt="${article.title}" class="card-image">
                <div class="card-content">
                    <h3>${article.title}</h3>
                    <p>${article.summary}</p>
                    <p class="card-meta">${article.category} - ${new Date(article.publish_date).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');
        gridHtml += '</div>';
        return gridHtml;
    };

    // --- DYNAMIC SCRIPT LOADING --- //
    
    // Loads the Advanced TradingView Chart widget.
    const loadAdvancedAnalysisWidget = () => {
        const container = document.getElementById('technical-analysis-widget-container');
        if (!container) {
            console.error('[HYPERION ENGINE] Analysis widget container not found!');
            return;
        }
        
        // Check if the library is already loaded to avoid re-injecting the script
        if (typeof TradingView !== 'undefined') {
            initializeTradingViewWidget(container);
        } else {
            const script = document.createElement('script');
            script.src = "https://s3.tradingview.com/tv.js";
            script.async = true;
            script.onload = () => initializeTradingViewWidget(container);
            document.head.appendChild(script);
        }
    };

    const initializeTradingViewWidget = (container) => {
        console.log('[HYPERION ENGINE] TradingView library loaded. Initializing Advanced Chart Widget.');
        container.innerHTML = ''; // Clear container before initializing
        new TradingView.widget({
            "autosize": true,
            "symbol": "BINANCE:BTCUSDT",
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": state.theme,
            "style": "1",
            "locale": "en",
            "toolbar_bg": state.theme === 'dark' ? '#131722' : '#f1f3f6',
            "enable_publishing": false,
            "allow_symbol_change": true,
            "container_id": "technical-analysis-widget-container"
        });
    };

    const loadTickerTape = () => {
        if (!dom.tickerContainer) return;
        const script = document.createElement('script');
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
        script.async = true;
        script.innerHTML = JSON.stringify({
          "symbols": [
            { "proName": "BINANCE:BTCUSDT", "title": "Bitcoin" },
            { "proName": "BINANCE:ETHUSDT", "title": "Ethereum" },
            { "proName": "FX_IDC:XAUUSD", "title": "Gold" },
            { "description": "S&P 500", "proName": "CME_MINI:ES1!" }
          ],
          "showSymbolLogo": true, "isTransparent": true, "displayMode": "adaptive",
          "colorTheme": state.theme, "locale": "en"
        });
        dom.tickerContainer.appendChild(script);
        console.log('[HYPERION ENGINE] Ticker Tape widget loaded.');
    };

    // --- EVENT LISTENERS & HANDLERS --- //
    
    // Centralized setup for all event listeners.
    const setupEventListeners = () => {
        if(dom.themeSwitcher) dom.themeSwitcher.addEventListener('click', toggleTheme);
        if(dom.langSwitcher) dom.langSwitcher.addEventListener('click', toggleLanguage);
        console.log('[HYPERION ENGINE] Event listeners attached.');
    };

    const toggleTheme = () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', state.theme);
        applyTheme();
        handleRouteChange(); // Re-render to update theme-dependent widgets like TradingView
    };

    const toggleLanguage = () => {
        state.lang = state.lang === 'fa' ? 'en' : 'fa';
        localStorage.setItem('lang', state.lang);
        applyLanguage();
        handleRouteChange(); // Re-render all content in the new language
    };
    
    // --- SETTINGS & UTILITIES --- //
    
    // Applies initial theme and language settings on load.
    const applyInitialSettings = () => {
        applyTheme();
        applyLanguage();
    };
    
    const applyTheme = () => {
        dom.body.setAttribute('data-theme', state.theme);
        updateButtonText();
    };

    const applyLanguage = () => {
        dom.html.lang = state.lang;
        dom.html.dir = state.lang === 'fa' ? 'rtl' : 'ltr';
        updateButtonText();
    };
    
    const updateButtonText = () => {
        if(dom.themeSwitcher) dom.themeSwitcher.textContent = state.lang === 'fa' ? (state.theme === 'dark' ? 'تم روشن' : 'تم تاریک') : (state.theme === 'dark' ? 'Light Mode' : 'Dark Mode');
        if(dom.langSwitcher) dom.langSwitcher.textContent = state.lang === 'fa' ? 'EN' : 'FA';
    };

    // Displays a user-friendly error message in the content outlet.
    const displayFatalError = (errorCode, errorMessage) => {
        dom.outlet.innerHTML = `
            <div class="fatal-error-box">
                <h1>CRITICAL SYSTEM ERROR</h1>
                <p><strong>Code:</strong> ${errorCode}</p>
                <p>${errorMessage}</p>
                <p>Please check the F12 developer console for more details.</p>
            </div>
        `;
    };

    // --- APPLICATION ENTRY POINT --- //
    init();
});
