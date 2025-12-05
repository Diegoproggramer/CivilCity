document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const state = {
        db: null,
        lang: 'fa',
        theme: 'dark',
        currentPage: 'home'
    };

    // --- DOM SELECTORS ---
    const dom = {
        outlet: document.getElementById('content-outlet'),
        nav: document.getElementById('main-nav'),
        langSwitcher: document.getElementById('lang-switcher'),
        themeSwitcher: document.getElementById('theme-switcher'),
        body: document.body,
        html: document.documentElement,
        tickerContainer: document.getElementById('ticker-tape-container')
    };

    // --- CORE LOGIC ---
    const init = async () => {
        setupEventListeners();
        loadInitialState();
        await fetchData();
        handleRouteChange();
        window.addEventListener('hashchange', handleRouteChange);
    };

    const loadInitialState = () => {
        state.theme = localStorage.getItem('theme') || 'dark';
        state.lang = localStorage.getItem('lang') || 'fa';
        applyTheme();
        applyLanguage();
    };

    const fetchData = async () => {
        try {
            const response = await fetch('db.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            state.db = await response.json();
        } catch (error) {
            console.error("Fatal Error: Could not fetch db.json.", error);
            dom.outlet.innerHTML = `<h1>Error</h1><p>Could not load essential data. Please check the console.</p>`;
        }
    };

    // --- ROUTING & RENDERING ---
    const handleRouteChange = () => {
        const pageId = window.location.hash.substring(1) || 'home';
        state.currentPage = pageId;
        renderNavigation();
        renderPageContent(pageId);
    };

    const renderNavigation = () => {
        if (!state.db) return;
        const navItems = state.db.navigation[state.lang];
        dom.nav.innerHTML = navItems.map(item =>
            `<a href="#${item.id}" class="${item.id === state.currentPage ? 'active' : ''}">${item.text}</a>`
        ).join('');
    };

    const renderPageContent = (pageId) => {
        if (!state.db) return;
        const pageInfo = state.db.pages[state.lang][pageId];
        let html = `<h1>${pageInfo.title}</h1><p>${pageInfo.content}</p>`;

        if (pageId === 'news') {
            html += renderArticleGrid();
        } else if (pageId === 'analysis') {
            html += renderAnalysisWidget();
        }
        
        dom.outlet.innerHTML = html;

        // Load page-specific scripts if any
        if (pageId === 'analysis') {
            loadScriptForAnalysis();
        }
    };
    
    const renderArticleGrid = () => {
        const articles = state.db.articles.filter(a => a.lang === state.lang);
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

    const renderAnalysisWidget = () => {
        return `
            <div class="tradingview-widget-container" style="height: 600px;">
                <div id="technical-analysis-widget"></div>
            </div>
        `;
    };

    const loadScriptForAnalysis = () => {
        const script = document.createElement('script');
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "interval": "1D", "width": "100%", "isTransparent": true, "height": "100%",
            "symbol": "BINANCE:BTCUSDT", "showIntervalTabs": true,
            "locale": "en", "colorTheme": state.theme
        });
        // Clear previous widget script and append new one
        const widgetContainer = document.getElementById('technical-analysis-widget');
        if(widgetContainer) {
            widgetContainer.innerHTML = '';
            widgetContainer.appendChild(script);
        }
    };

    // --- UI & STATE SWITCHERS ---
    const setupEventListeners = () => {
        dom.themeSwitcher.addEventListener('click', toggleTheme);
        dom.langSwitcher.addEventListener('click', toggleLanguage);
    };

    const toggleTheme = () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', state.theme);
        applyTheme();
        // Re-render current page to apply theme to dynamic widgets
        handleRouteChange();
    };

    const toggleLanguage = () => {
        state.lang = state.lang === 'fa' ? 'en' : 'fa';
        localStorage.setItem('lang', state.lang);
        applyLanguage();
        renderNavigation();
        renderPageContent(state.currentPage);
    };

    const applyTheme = () => {
        dom.body.setAttribute('data-theme', state.theme);
        dom.themeSwitcher.textContent = state.theme === 'dark' ? 'تم روشن' : 'تم تاریک';
    };

    const applyLanguage = () => {
        dom.html.lang = state.lang;
        dom.html.dir = state.lang === 'fa' ? 'rtl' : 'ltr';
        dom.langSwitcher.textContent = state.lang === 'fa' ? 'EN' : 'FA';
    };
    
    // --- WIDGETS ---
    const loadTickerTape = () => {
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
    };

    // --- Let's go! ---
    init();
    loadTickerTape();
});
