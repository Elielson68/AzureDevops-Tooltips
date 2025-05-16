const moduleManagerPath = 'scripts/module_manager.mjs';

function isAzureDevOpsPage() {
  return window.location.hostname.includes('visualstudio.com') ||
    window.location.hostname.includes('dev.azure.com');
}

async function initializeModules(modulePath) {
  try {
    const moduleManager = await import(chrome.runtime.getURL(modulePath));
    moduleManager.StartModules();
  } catch (error) {
    console.error(`Erro ao carregar o módulo ${modulePath}:`, error);
  }
}

initializeModules(moduleManagerPath);