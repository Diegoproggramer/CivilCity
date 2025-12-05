/**
 * LEVIATHAN ENGINE v2.0
 * Component-Based SPA Core
 * 
 * This engine operates on a component-first architecture, fetching and rendering
 * modular HTML fragments for maximum scalability and maintainability.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('[LEVIATHAN ENGINE v2.0] Awakening...');

    const state = {
        db: null,
        lang: localStorage.getItem('lang') || 'fa',
        theme: localStorage.getItem('theme') || 'dark',
        currentPageId: 'home'
    };

    const dom = {
        outlet: document.getElementById('content-outlet'),
        nav: document.getElementById('sidebar-nav'),
        langSwitcher: document.getElementById('lang-switcher'),
        themeSwitcher: document.getElementById('theme-switcher'),
        tickerContainer: document.getElementById('ticker-tape-container')
    };

    const init = async () => {
        console.log('[LEVIATHAN ENGINE] Binding subsystems...');
        setupEventListeners();
        
        const dbLoaded = await fetchData();
        if (dbLoaded) {
            console.log('[LEVIATHAN ENGINE] Data core is online.');
            window.addEventListener('hashchange', handleRouteChange);
            handleRouteChange(); // Initial render
            loadTickerTape();
        } else {
            displayFatalError('DATA_CORE_FAILURE', 'db.json is corrupted or unreachable.');
        }
    };

    const fetchData = async () => {
        try {
            const response = await fetch('db.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            state.db = await response.json();
            return true;
        } catch (error) {
            console.error('[LEVIATHAN ENGINE] Fetch error:', error);
            return false;
        }
    };

    const handleRouteChange = () => {
        const pageId = window.location.hash.substring(1) || 'home';
        console.log(`[LEVIATHAN ENGINE] Routing to: ${pageId}`);
        state.currentPageId = pageId;
        renderPage(pageId);
        renderNavigation();
    };

    const renderPage = async (pageId) => {
        const navItem = state.db.navigation[state.lang].find(item => item.id === pageId);

        if (!navItem) {
            displayFatalError('ROUTE_NOT_FOUND', `Route definition for '${pageId}' is missing.`);
            return;
        }

        let htmlContent = '';
        if (navItem.type === 'page') {
            const pageData = state.db.pages[state.lang][pageId];
            htmlContent = `<h1>${pageData.title}</h1><p>${pageData.content}</p>`;
            if (pageId === 'analysis') {
                 htmlContent += '<div id="tv-chart-container" style="height: 65vh;"></div>';
            }
        } else if (navItem.type === 'component') {
            try {
                const response = await fetch(`components/${pageId}.html`);
                if (!response.ok) throw new Error(`Component fetch failed with status ${response.status}`);
                htmlContent = await response.text();
            } catch (error) {
                console.error(`[LEVIATHAN ENGINE] Failed to load component: ${pageId}.html`, error);
                displayFatalError('COMPONENT_LOAD_FAILURE', `Could not load the '${pageId}' component.`);
                return;
            }
        }

        dom.outlet.innerHTML = htmlContent;
        console.log(`[LEVIATHAN ENGINE] Rendered '${pageId}' of type '${navItem.type}'.`);

        // Post-render injections
        if (pageId === 'analysis') {
            injectAdvancedChart();
        }
    };

    const renderNavigation = () => {
        const navItems = state.db.navigation[state.lang];
        dom.nav.innerHTML = navItems.map(item =>
            `<a href="#${item.id}" class="${item.id === state.currentPageId ? 'active' : ''}">${item.text}</a>`
        ).join('');
    };

    const setupEventListeners = () => {
        dom.themeSwitcher.addEventListener('click', toggleTheme);
        dom.langSwitcher.addEventListener('click', () => alert('Language switching will be activated in a future phase.'));
    };

    const toggleTheme = () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', state.theme);
        document.body.setAttribute('data-theme', state.theme);
        
        // Force re-render of theme-sensitive widgets
        handleRouteChange(); 
        loadTickerTape(true); // Force reload of ticker
    };

    const loadTickerTape = (forceReload = false) => {
        if(forceReload) dom.tickerContainer.innerHTML = '';
        if(dom.tickerContainer.hasChildNodes()) return;

        const script = document.createElement('script');
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
          "symbols": [
            { "proName": "FOREXCOM:SPXUSD", "title": "S&P 500" },
            { "proName": "BINANCE:BTCUSDT", "title": "Bitcoin" },
            { "proName": "BINANCE:ETHUSDT", "title": "Ethereum" },
            { "proName": "FX_IDC:XAUUSD", "title": "Gold" }
          ],
          "showSymbolLogo": true,
          "colorTheme": state.theme,
          "isTransparent": false,
          "displayMode": "adaptive",
          "locale": "en"
        });
        dom.tickerContainer.appendChild(script);
        console.log('[LEVIATHAN ENGINE] Ticker Tape subsystem initialized.');
    };

    const injectAdvancedChart = () => {
        if (typeof TradingView === 'undefined') {
            console.error('[LEVIATHAN ENGINE] TradingView library not found. Critical failure.');
            return;
        }
        new TradingView.widget({
            "width": "100%",
            "height": "100%",
            "symbol": "BINANCE:BTCUSDT",
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": state.theme,
            "style": "1",
            "locale": "en",
            "toolbar_bg": state.theme === 'dark' ? '#1e1e1e' : '#ffffff',
            "enable_publishing": false,
            "allow_symbol_change": true,
            "container_id": "tv-chart-container"
        });
        console.log('[LEVIATHAN ENGINE] Advanced Analysis Module injected and operational.');
    };
    
    const displayFatalError = (code, msg) => {
        dom.outlet.innerHTML = `<div style='text-align:center; padding: 50px; color: #ff5555;'><h2>SYSTEM HALTED</h2><p><strong>${code}:</strong> ${msg}</p></div>`;
    };

    init();
});
