const initializeModulePath = "/scripts/view/js/popup/initialize_tabs.mjs";

async function initializeModules(modulePath) {
    try {
        const module = await import(chrome.runtime.getURL(modulePath));
        await module.StartModule();
    } catch (error) {
        console.error(`Erro ao carregar o módulo ${modulePath}:`, error);
    }
}

initializeModules(initializeModulePath);

