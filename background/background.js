/**
 * background/background.js
 * -------------------------------------------------------------------------
 * Service worker (Manifest V3, type: "module").
 *
 * A extensão não tem mais popup (manifest.json não define mais
 * "action.default_popup") — o painel vive exclusivamente no side panel
 * agora. Sem um popup, clicar no ícone da extensão na barra de ferramentas
 * não abre nada por padrão; esta linha é o que faz o Chrome abrir o side
 * panel diretamente nesse clique.
 */
chrome.sidePanel
    ?.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => console.error('[Azure DevOps Tooltips] Falha ao configurar abertura do side panel:', err));
