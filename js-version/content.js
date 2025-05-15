function isAzureDevOpsPage() {
  return window.location.hostname.includes('visualstudio.com') ||
    window.location.hostname.includes('dev.azure.com');
}

async function initializeModule(modulePath) {
  try {
    const module = await import(chrome.runtime.getURL(modulePath));
    module.StartModule();
  } catch (error) {
    console.error(`Erro ao carregar o módulo ${modulePath}:`, error);
  }
}

initializeModule('scripts/modal.js');
initializeModule('scripts/api_azure.js');
