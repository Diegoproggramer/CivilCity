/**// State management
const state = {
    lang: 'fa',
    db: null,
    currentPageId: 'home',
};

// DOM Elements
const dom = {
    nav: document.getElementById('main-nav'),
    content: document.getElementById('main-content'),
    header: document.querySelector('header'),
};

// --- CORE FUNCTIONS ---

const loadComponent = async (componentName) => {
    try {
        const response = await fetch(`components/${componentName}.html`);
        if (!response.ok) throw new Error(`Component not found: ${componentName}`);
        const html = await response.text();
        dom.content.innerHTML = html;
        // If there's a script associated with the component, load it
        const scriptPath = `components/${componentName}.js`;
        // Remove old script if it exists
        const oldScript = document.getElementById('component-script');
        if (oldScript) oldScript.remove();
        // Add new script
        const script = document.createElement('script');
        script.id = 'component-script';
        script.src = scriptPath;
        script.onload = () => console.log(`${componentName}.js loaded.`);
        document.body.appendChild(script);

    } catch (error) {
        console.error('Error loading component:', error);
        dom.content.innerHTML = `<p>Error loading content. Please try again later.</p>`;
    }
};

const navigateToPage = (pageId) => {
    // For now, pages are just placeholders in the content area
    // This will be expanded later
    dom.content.innerHTML = `<h1>Page: ${pageId}</h1><p>Content for ${pageId} will be loaded here.</p>`;
};

const renderNavigation = () => {
    const navCategories = state.db.navigation?.[state.lang] || [];
    let navHtml = '';

    navCategories.forEach(category => {
        navHtml += `<div class="nav-category"><h4>${category.category}</h4>`;
        category.items.forEach(item => {
            const active = item.id === state.currentPageId ? 'active' : '';
            navHtml += `<a href="#${item.id}" class="${active}" data-type="${item.type}" data-id="${item.id}">${item.text}</a>`;
        });
        navHtml += `</div>`;
    });

    dom.nav.innerHTML = navHtml;

    // Use event delegation on the navigation container
    dom.nav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const id = e.target.getAttribute('data-id');
            const type = e.target.getAttribute('data-type');
            
            if (id === state.currentPageId) return; // Do nothing if clicking the active item

            state.currentPageId = id;
            
            // Update active classes
            dom.nav.querySelectorAll('a').forEach(a => a.classList.remove('active'));
            e.target.classList.add('active');
            
            // Navigate
            if (type === 'component') {
                loadComponent(id);
            } else {
                navigateToPage(id);
            }
        }
    });
};

const init = async () => {
    try {
        const response = await fetch('db.json');
        state.db = await response.json();
        renderNavigation();
        // Load the initial component/page
        loadComponent(state.currentPageId); 
    } catch (error) {
        console.error('Initialization failed:', error);
        dom.content.innerHTML = '<p>Could not load initial site data.</p>';
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', init);

