let lastTab = null;
let lastScript = null;

async function createControllerScript(moduleName) {
    const script = document.createElement('script');
    script.src = `/scripts/js/controller/${moduleName}.mjs?ts=${Date.now()}`;
    script.type = `module`;
    document.body.appendChild(script);
    lastScript = script;
}

function changeTabActiveState(navButton) {
    lastTab?.classList.remove('active');
    lastTab = navButton;
    navButton.classList.add('active');
}

function removeLastScript() {
    if (lastScript) {
        lastScript.remove();
        lastScript = null;
    }
}

async function loadClickedTabContent(tabName) {
    const response = await fetch(`/scripts/html/${tabName}.html`);
    const html = await response.text();
    document.getElementById('tab-content').innerHTML = html;
}

async function loadTabContent(navButton, tabName) {
    changeTabActiveState(navButton);
    removeLastScript();

    await loadClickedTabContent(tabName);

    createControllerScript(tabName);
}

function onClickTab(evt) {
    chrome.storage.local.get(['azureConfig'], (result) => {
        if (!result.azureConfig) {
            alert('Por favor, insira o token na página principal primeiro');
            return;
        }
        loadTabContent(evt.target, evt.target.dataset.tab);
    });
}

function getFirstTab() {
    return document.querySelectorAll('.nav-tab')[0];
}

export async function StartModule() {
    loadTabContent(getFirstTab(), 'main');
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.addEventListener('click', onClickTab);
    });
}
