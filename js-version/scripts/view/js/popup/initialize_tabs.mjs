let lastTab = null;

export async function StartModule() {
    async function loadTabContent(navButton, tabName) {
        lastTab?.classList.remove('active');
        lastTab = navButton;
        navButton.classList.add('active');

        const response = await fetch(`/scripts/view/html/popup/${tabName}.html`);
        const html = await response.text();
        document.getElementById('tab-content').innerHTML = html;

        // const script = document.createElement('script');
        // script.src = `./popup/${tabName}.mjs`;
        // document.body.appendChild(script);
    }

    loadTabContent(document.querySelectorAll('.nav-tab')[0], 'main');

    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.addEventListener('click', evt => {
            chrome.storage.local.get(['azureConfig'], (result) => {

                if (!result.azureConfig) {
                    alert('Por favor, insira o token na página principal primeiro');
                    return;
                }
                loadTabContent(evt.target, btn.dataset.tab);
            })
        });
    });
}
