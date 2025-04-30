// Verifica o estado dos tooltips
chrome.storage.sync.get(['tooltipsActive'], function (result) {
  const tooltipsActive = result.tooltipsActive !== false; // Ativo por padrão
  if (tooltipsActive && isAzureDevOpsPage()) {
    addTooltips();
  }
});

// Listener para mensagens do popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "toggleTooltips") {
    if (request.state) {
      addTooltips();
    } else {
      removeTooltips();
    }
  }
});

function isAzureDevOpsPage() {
  return window.location.hostname.includes('visualstudio.com') ||
    window.location.hostname.includes('dev.azure.com');
}

function addTooltips() {
  // Remove tooltips existentes primeiro
  removeTooltips();

  // Seu código existente para adicionar tooltips
  const tooltipMap = {
    '.work-item-form-id': 'ID do Work Item',
    // ... outros mapeamentos
  };

  Object.entries(tooltipMap).forEach(([selector, tooltipText]) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      addTooltipToElement(element, tooltipText);
    });
  });
}

function removeTooltips() {
  const existingTooltips = document.querySelectorAll('.azure-tooltip');
  existingTooltips.forEach(tooltip => tooltip.remove());
}

// ... restante do seu código existente ...