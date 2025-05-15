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

// MODAL PARA GERAÇÃO DE PR

function observeWorkItemChanges() {
  // Observa mudanças na página do WorkItem
  const observer = new MutationObserver((mutations) => {
    const stateElement = document.querySelector('.work-item-state');
    if (stateElement && stateElement.textContent.trim() === 'Aguardando PR') {
      // Mostra o modal quando o estado muda para "Aguardando PR"
      document.getElementById('prReviewerModal').style.display = 'flex';
    }
  });

  // Começa a observar o container do WorkItem
  const workItemContainer = document.querySelector('.work-item-form');
  if (workItemContainer) {
    observer.observe(workItemContainer, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
}


window.onload = () => {

  function CreateModal() {
    // Verifica se estamos no Azure DevOps
    if (window.location.href.includes('dev.azure.com')) {
      // Cria o modal
      const modalHTML = `
      <div id="prReviewerModal" class="pr-modal" style="display: none;">
        <div class="pr-modal-content">
          <span class="pr-close">&times;</span>
          <h3>Informações do PR</h3>
          <div class="form-group">
            <label for="reviewerName">Desenvolvedor para revisão:</label>
            <input type="text" id="reviewerName" class="form-control" placeholder="Digite o nome do revisor">
          </div>
          <button id="saveReviewerBtn" class="save-btn">Salvar</button>
        </div>
      </div>
  
      <style>
        .pr-modal {
          position: absolute;
          z-index: 9999999999999;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color:rgba(0, 0, 0, 0.57);
          display: flex;
          align-items: center;
          justify-content: center;
        }
  
        .pr-modal-content {
          background-color: rgb(0, 0, 0);;
          padding: 20px;
          border-radius: 4px;
          width: 400px;
          box-shadow: 0 4px 8px rgb(0, 0, 0);
        }
  
        .pr-close {
          color: #aaa;
          float: right;
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
        }
  
        .pr-close:hover {
          color: #333;
        }
  
        .form-group {
          margin-bottom: 15px;
        }
  
        .form-control {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 2px;
          box-sizing: border-box;
        }
  
        .save-btn {
          background-color: #0078d4;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 2px;
          cursor: pointer;
          width: 100%;
        }
  
        .save-btn:hover {
          background-color: #106ebe;
        }
      </style>
    `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);

      // Configura os eventos do modal
      const modal = document.getElementById('prReviewerModal');
      const closeBtn = document.querySelector('.pr-close');
      const saveBtn = document.getElementById('saveReviewerBtn');

      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });

      saveBtn.addEventListener('click', () => {
        const reviewerName = document.getElementById('reviewerName').value;

        if (reviewerName === "") {
          alert('Por favor, informe o nome do revisor');
          return;
        }

        // Aqui você pode adicionar a lógica para salvar essas informações
        console.log(`Revisor: ${reviewerName}`);

        // Fechar o modal
        modal.style.display = 'none';
      });

      // Observa mudanças no estado do WorkItem
      observeWorkItemChanges();
    }
  }

  let stateWorkItem = document.getElementById('__bolt-Stat-e-input');

  async function ConfigureEventsToListenerStateChangeOnWorkItem() {
    await setupDropdownItemEnterHandler();
    await setupDropdownItemClickHandler();
  }

  async function setupDropdownItemEnterHandler() {
    new Promise((resolve, reject) => {
      function verificar() {
        stateWorkItem = document.getElementById('__bolt-Stat-e-input');
        if (stateWorkItem !== null) {
          if (stateWorkItem !== null && stateWorkItem !== undefined) {
            stateWorkItem.removeEventListener('keydown', keydownEvent);
            stateWorkItem.addEventListener('keydown', keydownEvent);

            function keydownEvent(e) {
              if (e.key === 'Enter') {
                const dropdownContainer = document.querySelector('.bolt-dropdown-list-box-container');
                if (dropdownContainer) {
                  const selectHighlightSpan = dropdownContainer.querySelector('.bolt-editable-dropdown-focused-item span');
                  if (selectHighlightSpan) {
                    const selectedHighlight = selectHighlightSpan.textContent;
                    handleDropdownSelection(selectedHighlight);
                  }
                }
              }
            }
            resolve("Condição satisfeita!");
          }
        }
        else {
          console.log("Condição não satisfeita, verificando novamente...");
          setTimeout(verificar, 500);
        }
      }
      verificar(); // Inicia o processo
    })
  };

  async function setupDropdownItemClickHandler() {
    setTimeout(() => {
      const dropdownContainer = document.querySelector('.bolt-dropdown-list-box-container');
      if (dropdownContainer) {
        dropdownContainer.removeEventListener('click', clickEvent);
        dropdownContainer.addEventListener('click', clickEvent);

        function clickEvent(event) {
          const listItem = event.target.closest('.bolt-list-box-row');
          if (listItem) {
            const selectedText = listItem.querySelector('.bolt-list-cell-text span').textContent;
            handleDropdownSelection(selectedText);
            setupDropdownItemClickHandler(true);
          }
        }
      } else {
        setupDropdownItemClickHandler(true);
      }
    }, 300);
  }

  function handleDropdownSelection(selectedValue) {
    if (selectedValue.toLowerCase().includes("aguardando pr")) {
      console.log("ABRIU O POPUP");
      document.getElementById('prReviewerModal').style.display = 'flex';
    }
  }

  let isWorkItemOpen = false;
  const boltPortalHostContent = document.querySelector(".bolt-portal-host");
  CreateModal();

  async function CheckWorkItemOpen() {
    setTimeout(() => {

      CheckWorkItemOpen();
      if (isWorkItemOpen !== boltPortalHostContent.hasChildNodes()) {
        isWorkItemOpen = boltPortalHostContent.hasChildNodes();
        if (isWorkItemOpen) {
          UpdateStateOnOpenWorkItem();
        }
        console.log(`Estado mudou para ${isWorkItemOpen ? "aberto" : "fechado"}`);
      }
    }, 300);
  }

  CheckWorkItemOpen();
  ConfigureEventsToListenerStateChangeOnWorkItem();

  function UpdateStateOnOpenWorkItem() {
    setupDropdownItemEnterHandler();
  }
};
