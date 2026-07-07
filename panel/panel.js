/**
 * panel/panel.js
 * -------------------------------------------------------------------------
 * Orquestrador da UI do side panel. Substitui o antigo
 * controller/initialize_tabs.mjs (que buscava um fragmento HTML por clique
 * e injetava uma <script> nova a cada troca de aba — necessário porque o
 * popup era recriado do zero toda vez que era aberto). O side panel fica
 * aberto entre trocas de aba do navegador, então aqui os 4 fragmentos são
 * buscados uma única vez no carregamento do painel, e cada controller é
 * inicializado no máximo uma vez (na primeira vez que sua aba é aberta),
 * em vez de re-executado a cada clique.
 */

import { getAzureConnection } from '../common/storage.js';
import * as mainController from '../scripts/js/controller/main.mjs';
import * as updateTasksController from '../scripts/js/controller/update_tasks.mjs';
import * as organizationController from '../scripts/js/controller/organization.mjs';
import * as repositorysController from '../scripts/js/controller/repositorys.mjs';

const TAB_CONTROLLERS = {
    main: mainController,
    update_tasks: updateTasksController,
    organization: organizationController,
    repositorys: repositorysController
};

const initializedTabs = new Set();

async function loadFragment(tabName) {
    const response = await fetch(chrome.runtime.getURL(`scripts/html/${tabName}.html`));
    return await response.text();
}

async function loadAllFragments() {
    const container = document.getElementById('tab-content');
    const tabNames = Object.keys(TAB_CONTROLLERS);
    const fragments = await Promise.all(tabNames.map(loadFragment));
    container.innerHTML = fragments.join('');
}

function activateTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach((panel) => {
        panel.classList.toggle('active', panel.id === tabName);
    });
}

async function ensureTabInitialized(tabName) {
    if (initializedTabs.has(tabName)) return;
    initializedTabs.add(tabName);
    await TAB_CONTROLLERS[tabName].init();
}

/** Mesma trava que existia no popup: sem token salvo, só a aba "Tasks" é acessível. */
async function onClickTab(evt) {
    const tabName = evt.currentTarget.dataset.tab;
    if (!tabName || !(tabName in TAB_CONTROLLERS)) return;

    if (tabName !== 'main') {
        const connection = await getAzureConnection();
        if (!connection?.token) {
            alert('Por favor, insira o token na página principal primeiro');
            return;
        }
    }

    activateTab(tabName);
    await ensureTabInitialized(tabName);
}

function wireTabNavigation() {
    document.querySelectorAll('.nav-tab').forEach((btn) => {
        btn.addEventListener('click', onClickTab);
    });
}

async function init() {
    await loadAllFragments();
    wireTabNavigation();
    activateTab('main');
    await ensureTabInitialized('main');
}

document.addEventListener('DOMContentLoaded', init);
