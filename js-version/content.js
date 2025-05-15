function isAzureDevOpsPage() {
  return window.location.hostname.includes('visualstudio.com') ||
    window.location.hostname.includes('dev.azure.com');
}

async function initializeModal(modulePath) {
  try {
    const module = await import(chrome.runtime.getURL(modulePath));
    module.StartModule();
  } catch (error) {
    console.error(`Erro ao carregar o módulo ${modulePath}:`, error);
  }
}

initializeModal('scripts/modal.js');
