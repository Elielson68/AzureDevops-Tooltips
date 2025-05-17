// document.addEventListener('DOMContentLoaded', () => {
//     // Carrega configurações salvas
//     loadConfig();

//     // Botão Salvar
//     document.getElementById('saveConfig').addEventListener('click', saveConfig);

//     // Botão Atualizar Tasks
//     document.getElementById('updateTasks').addEventListener('click', updateTasks);
// });

// function loadConfig() {
//     chrome.storage.local.get([
//         'token',
//         'organization',
//         'project',
//         'team'
//     ], function (data) {
//         if (data.token) document.getElementById('token').value = data.token;
//         if (data.organization) document.getElementById('organization').value = data.organization;
//         if (data.project) document.getElementById('project').value = data.project;
//         if (data.team) document.getElementById('team').value = data.team;
//     });
// }

// function saveConfig() {
//     const token = document.getElementById('token').value;
//     const organization = document.getElementById('organization').value;
//     const project = document.getElementById('project').value;
//     const team = document.getElementById('team').value;

//     chrome.storage.local.set({
//         token: token,
//         organization: organization,
//         project: project,
//         team: team
//     }, function () {
//         showStatus('Configurações salvas com sucesso!', 'success');
//     });
// }

// async function updateTasks() {
//     const storyId = document.getElementById('storyId').value;
//     if (!storyId) {
//         showStatus('Por favor, informe o ID da Story/Bug', 'error');
//         return;
//     }

//     // Mostra loading
//     document.getElementById('loading').style.display = 'block';
//     document.getElementById('updateTasks').disabled = true;

//     try {
//         // Recupera configurações
//         const config = await new Promise(resolve => {
//             chrome.storage.local.get([
//                 'token',
//                 'organization',
//                 'project'
//             ], resolve);
//         });

//         if (!config.token || !config.organization || !config.project) {
//             throw new Error('Por favor, configure o token, organização e projeto antes de continuar.');
//         }

//         // Codifica token para Basic Auth
//         const authToken = btoa(`:${config.token}`);

//         // URL base
//         const baseUrl = `https://dev.azure.com/${config.organization}/${config.project}`;

//         // 1. Busca dados da Story
//         const storyUrl = `${baseUrl}/_apis/wit/workitems/${storyId}?$expand=Relations&api-version=7.1-preview.3`;
//         const storyResponse = await fetch(storyUrl, {
//             headers: {
//                 'Authorization': `Basic ${authToken}`
//             }
//         });

//         if (!storyResponse.ok) {
//             throw new Error(`Erro ao buscar Story: ${storyResponse.status}`);
//         }

//         const storyData = await storyResponse.json();

//         // 2. Extrai AreaPath e IterationPath da Story
//         const areaPath = storyData.fields['System.AreaPath'];
//         const iterationPath = storyData.fields['System.IterationPath'];

//         // 3. Busca todas as tasks relacionadas
//         if (!storyData.relations) {
//             throw new Error('Nenhuma task relacionada encontrada.');
//         }

//         const tasksUrls = storyData.relations
//             .filter(rel => rel.rel === 'System.LinkTypes.Hierarchy-Forward')
//             .map(rel => rel.url);

//         // 4. Processa cada task
//         let updatedCount = 0;

//         for (const taskUrl of tasksUrls) {
//             try {
//                 // Busca dados da task
//                 const taskResponse = await fetch(taskUrl, {
//                     headers: {
//                         'Authorization': `Basic ${authToken}`
//                     }
//                 });

//                 if (!taskResponse.ok) continue;

//                 const taskData = await taskResponse.json();

//                 // Verifica se é uma Task
//                 if (taskData.fields['System.WorkItemType'] !== 'Task') continue;

//                 // Atualiza a task
//                 const updateUrl = taskUrl.includes('api-version') ?
//                     taskUrl :
//                     `${taskUrl}?api-version=7.1-preview.3`;

//                 const updateResponse = await fetch(updateUrl, {
//                     method: 'PATCH',
//                     headers: {
//                         'Authorization': `Basic ${authToken}`,
//                         'Content-Type': 'application/json-patch+json; charset=UTF-8'
//                     },
//                     body: JSON.stringify([
//                         {
//                             "op": "replace",
//                             "path": "/fields/System.AreaPath",
//                             "value": areaPath
//                         },
//                         {
//                             "op": "replace",
//                             "path": "/fields/System.IterationPath",
//                             "value": iterationPath
//                         }
//                     ])
//                 });

//                 if (updateResponse.ok) {
//                     updatedCount++;
//                 }
//             } catch (error) {
//                 console.error('Erro ao processar task:', error);
//             }
//         }

//         showStatus(`Sucesso! ${updatedCount} tasks atualizadas.`, 'success');
//     } catch (error) {
//         console.error('Erro:', error);
//         showStatus(error.message, 'error');
//     } finally {
//         document.getElementById('loading').style.display = 'none';
//         document.getElementById('updateTasks').disabled = false;
//     }
// }

// function showStatus(message, type) {
//     const statusDiv = document.getElementById('status');
//     statusDiv.textContent = message;
//     statusDiv.className = type;
//     statusDiv.style.display = 'block';

//     setTimeout(() => {
//         statusDiv.style.display = 'none';
//     }, 5000);
// }

// Navegação entre abas
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove a classe active de todas as abas e conteúdos
        document.querySelectorAll('.nav-tab, .tab-content').forEach(el => {
            el.classList.remove('active');
        });

        // Adiciona a classe active apenas na aba clicada e no conteúdo correspondente
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// Carregar organizações quando a aba de configurações for aberta
document.querySelector('.nav-tab[data-tab="config"]').addEventListener('click', async () => {
    const configTokenInput = document.getElementById('configToken');
    const tokenInput = document.getElementById('token');
    const token = (tokenInput && tokenInput.value) || (configTokenInput && configTokenInput.value);

    if (!token) {
        alert('Por favor, insira o token na página principal primeiro');
        document.querySelector('.nav-tab[data-tab="main"]').click();
        return;
    }

    try {
        const organizations = await fetchOrganizations(token);
        populateSelect('organization', organizations);
    } catch (error) {
        console.error('Erro ao carregar organizações:', error);
        alert('Erro ao carregar organizações. Verifique o token e tente novamente.');
    }
});

// Carregar projetos quando uma organização for selecionada
document.getElementById('organization').addEventListener('change', async function () {
    const configTokenInput = document.getElementById('configToken');
    const tokenInput = document.getElementById('token');
    const token = (tokenInput && tokenInput.value) || (configTokenInput && configTokenInput.value);
    const org = this.value;

    if (org) {
        try {
            const projects = await fetchProjects(token, org);
            const projectSelect = document.getElementById('project');
            projectSelect.disabled = false;
            populateSelect('project', projects);
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
        }
    }
});

// Carregar times quando um projeto for selecionado
document.getElementById('project').addEventListener('change', async function () {
    const configTokenInput = document.getElementById('configToken');
    const tokenInput = document.getElementById('token');
    const token = (tokenInput && tokenInput.value) || (configTokenInput && configTokenInput.value);
    const org = document.getElementById('organization').value;
    const project = this.value;

    if (project) {
        try {
            const teams = await fetchTeams(token, org, project);
            const teamSelect = document.getElementById('team');
            teamSelect.disabled = false;
            populateSelect('team', teams);
        } catch (error) {
            console.error('Erro ao carregar times:', error);
        }
    }
});

// Funções auxiliares (você precisará implementar as chamadas à API do Azure DevOps)
async function fetchOrganizations(token) {
    // Implemente a chamada à API para obter as organizações
    // Exemplo: return await callAzureDevOpsApi('https://app.vssps.visualstudio.com/_apis/accounts', token);
    return ['Org1', 'Org2', 'Org3']; // Exemplo
}

async function fetchProjects(token, organization) {
    // Implemente a chamada à API para obter os projetos
    // Exemplo: return await callAzureDevOpsApi(`https://dev.azure.com/${organization}/_apis/projects`, token);
    return ['Projeto1', 'Projeto2', 'Projeto3']; // Exemplo
}

async function fetchTeams(token, organization, project) {
    // Implemente a chamada à API para obter os times
    // Exemplo: return await callAzureDevOpsApi(`https://dev.azure.com/${organization}/${project}/_apis/teams`, token);
    return ['Time1', 'Time2', 'Time3']; // Exemplo
}

function populateSelect(selectId, items) {
    const select = document.getElementById(selectId);
    select.innerHTML = '';

    if (items.length === 0) {
        select.innerHTML = '<option value="">Nenhum item encontrado</option>';
        return;
    }

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

// Salvar configuração
document.getElementById('saveConfig').addEventListener('click', () => {
    const configTokenInput = document.getElementById('configToken');
    const token = (configTokenInput && configTokenInput.value);
    const org = document.getElementById('organization').value;
    const project = document.getElementById('project').value;
    const team = document.getElementById('team').value;

    // Salve essas informações no chrome.storage.local ou localStorage
    chrome.storage.local.set({ azureConfig: { token, org, project, team } }, () => {
        alert('Configuração salva com sucesso!');
    });
});


/*
   *** COMPORTAMENTO DA ABA DE REPOSITÓRIOS ***
*/


// Variável para armazenar os dados
let repositoriesData = {
    allRepos: [],
    mainRepos: [],
    repoConfigs: {}
};

// Quando a aba de repositórios é aberta
document.querySelector('.nav-tab[data-tab="repos"]').addEventListener('click', async () => {
    const configTokenInput = document.getElementById('configToken');
    const tokenInput = document.getElementById('token');
    const token = (tokenInput && tokenInput.value) || (configTokenInput && configTokenInput.value);

    if (!token) {
        alert('Por favor, insira o token na página principal primeiro');
        document.querySelector('.nav-tab[data-tab="main"]').click();
        return;
    }

    try {
        // Carrega todos os repositórios
        repositoriesData.allRepos = await fetchRepositories(token);
        updateAvailableReposDropdown();
        loadMainReposList();
    } catch (error) {
        console.error('Erro ao carregar repositórios:', error);
        alert('Erro ao carregar repositórios. Verifique o token e tente novamente.');
    }
});

// Adicionar repositório principal
document.getElementById('addMainRepo').addEventListener('click', () => {
    const repoSelect = document.getElementById('availableRepos');
    const repoId = repoSelect.value;

    if (repoId && !repositoriesData.mainRepos.includes(repoId)) {
        repositoriesData.mainRepos.push(repoId);
        saveRepositoriesData();
        loadMainReposList();
        updateAvailableReposDropdown();
    }
});

// Configurar repositório
function setupRepoConfig(repoId) {
    const repo = repositoriesData.allRepos.find(r => r.id === repoId);
    document.getElementById('currentRepoName').textContent = repo.name;

    // Inicializa configuração se não existir
    if (!repositoriesData.repoConfigs[repoId]) {
        repositoriesData.repoConfigs[repoId] = {
            submodules: [],
            packages: []
        };
    }

    // Atualiza listas
    updateLinkedReposLists(repoId);
    updateAvailableLinkedReposDropdowns(repoId);

    // Mostra a tela de configuração
    document.getElementById('repos').querySelector('.form-group:not(#repoConfig)').style.display = 'none';
    document.getElementById('repoConfig').style.display = 'block';
}

// Voltar para lista principal
document.getElementById('backToRepos').addEventListener('click', () => {
    document.getElementById('repoConfig').style.display = 'none';
    document.getElementById('repos').querySelector('.form-group:not(#repoConfig)').style.display = 'block';
});

// Adicionar submodule
document.getElementById('addSubmodule').addEventListener('click', () => {
    const repoId = document.querySelector('#repoConfig').getAttribute('data-current-repo');
    const submoduleId = document.getElementById('availableSubmodules').value;

    if (submoduleId && !repositoriesData.repoConfigs[repoId].submodules.includes(submoduleId)) {
        repositoriesData.repoConfigs[repoId].submodules.push(submoduleId);
        saveRepositoriesData();
        updateLinkedReposLists(repoId);
        updateAvailableLinkedReposDropdowns(repoId);
    }
});

// Funções auxiliares
async function fetchRepositories(token) {
    // Implemente a chamada à API para obter os repositórios
    // Exemplo: return await callAzureDevOpsApi(`https://dev.azure.com/{organization}/_apis/git/repositories`, token);
    return [
        { id: 'repo1', name: 'Repositório 1' },
        { id: 'repo2', name: 'Repositório 2' },
        { id: 'repo3', name: 'Repositório 3' }
    ]; // Exemplo
}

function updateAvailableReposDropdown() {
    const availableRepos = repositoriesData.allRepos
        .filter(repo => !repositoriesData.mainRepos.includes(repo.id));

    const select = document.getElementById('availableRepos');
    select.innerHTML = '';

    if (availableRepos.length === 0) {
        select.innerHTML = '<option value="">Nenhum repositório disponível</option>';
        return;
    }

    availableRepos.forEach(repo => {
        const option = document.createElement('option');
        option.value = repo.id;
        option.textContent = repo.name;
        select.appendChild(option);
    });
}

// Adicione estas novas funções:
function updateMainReposDropdown() {
    const dropdown = document.getElementById('mainReposDropdown');
    dropdown.innerHTML = '';

    if (repositoriesData.mainRepos.length === 0) {
        dropdown.innerHTML = '<option value="">Nenhum repositório adicionado</option>';
        return;
    }

    repositoriesData.mainRepos.forEach(repoId => {
        const repo = repositoriesData.allRepos.find(r => r.id === repoId);
        if (!repo) return;

        const option = document.createElement('option');
        option.value = repoId;
        option.textContent = repo.name;
        dropdown.appendChild(option);
    });
}

function loadMainReposList() {
    const dropdown = document.getElementById('mainReposDropdown');
    const configureDropdown = document.getElementById('configureDropdown');
    configureDropdown.addEventListener("change", onSelectRepositoryToConfigure);

    // Limpa os dropdowns
    dropdown.innerHTML = '';
    configureDropdown.innerHTML = '<option value="">Selecione um repositório...</option>';

    if (repositoriesData.mainRepos.length === 0) {
        dropdown.innerHTML = '<option value="">Nenhum repositório adicionado</option>';
        return;
    }

    repositoriesData.mainRepos.forEach(repoId => {
        const repo = repositoriesData.allRepos.find(r => r.id === repoId);
        if (!repo) return;

        // Adiciona ao dropdown de visualização/remoção
        const option = document.createElement('option');
        option.value = repoId;
        option.textContent = repo.name;
        dropdown.appendChild(option.cloneNode(true));

        // Adiciona ao dropdown de configuração
        configureDropdown.appendChild(option);
    });
}


function updateLinkedReposLists(repoId) {
    const config = repositoriesData.repoConfigs[repoId] || { submodules: [], packages: [] };

    // Atualiza lista de submodules
    const linkedReposList = document.getElementById('linkedReposList');
    linkedReposList.innerHTML = '';

    config.submodules.forEach(submoduleId => {
        const repo = repositoriesData.allRepos.find(r => r.id === submoduleId);
        if (!repo) return;

        const item = document.createElement('div');
        item.className = 'repo-item linked-repo-type';
        item.innerHTML = `
            <span>${repo.name}</span>
            <button class="remove-linked-repo" data-repo-id="${submoduleId}" data-type="submodules">Remover</button>
        `;
        linkedReposList.appendChild(item);
    });

    config.packages.forEach(packageId => {
        const repo = repositoriesData.allRepos.find(r => r.id === packageId);
        if (!repo) return;

        const item = document.createElement('div');
        item.className = 'repo-item linked-repo-type';
        item.innerHTML = `<span>${repo.name}</span>
        <button class="remove-linked-repo" data-repo-id="${packageId}" data-type="packages">Remover</button>`;
    });

    // Adiciona eventos aos botões de remover
    document.querySelectorAll('.remove-linked-repo').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const linkedRepoId = e.target.dataset.repoId;
            const type = e.target.dataset.type;

            repositoriesData.repoConfigs[repoId][type] =
                repositoriesData.repoConfigs[repoId][type].filter(id => id !== linkedRepoId);

            saveRepositoriesData();
            updateLinkedReposLists(repoId);
            updateAvailableLinkedReposDropdowns(repoId);
        });
    });
}

function updateAvailableLinkedReposDropdowns(repoId) {
    const config = repositoriesData.repoConfigs[repoId] || { submodules: [], packages: [] };

    // Repositórios já usados em qualquer lugar
    const usedRepos = [
        ...repositoriesData.mainRepos,
        ...Object.values(repositoriesData.repoConfigs).flatMap(c => [...c.submodules, ...c.packages])
    ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicados

    // Repositórios disponíveis
    const availableRepos = repositoriesData.allRepos
        .filter(repo => !usedRepos.includes(repo.id) && repo.id !== repoId);

    // Atualiza dropdown de submodules
    const submoduleSelect = document.getElementById('availableSubmodules');
    submoduleSelect.innerHTML = '';

    if (availableRepos.length === 0) {
        submoduleSelect.innerHTML = '<option value="">Nenhum repositório disponível</option>';
    } else {
        availableRepos.forEach(repo => {
            const option = document.createElement('option');
            option.value = repo.id;
            option.textContent = repo.name;
            submoduleSelect.appendChild(option);
        });
    }

    // Atualiza dropdown de packages (pode ser o mesmo que submodules ou diferente)
    const packageSelect = document.getElementById('availablePackages');
    packageSelect.innerHTML = '';

    if (availableRepos.length === 0) {
        packageSelect.innerHTML = '<option value="">Nenhum repositório disponível</option>';
    } else {
        availableRepos.forEach(repo => {
            const option = document.createElement('option');
            option.value = repo.id;
            option.textContent = repo.name;
            packageSelect.appendChild(option);
        });
    }
}

function saveRepositoriesData() {
    chrome.storage.local.set({ repositoriesData }, () => {
        console.log('Dados de repositórios salvos');
    });
}

// Obter o tipo selecionado
function getSelectedRepoType() {
    return document.querySelector('input[name="repoType"]:checked').value;
}


function onSelectRepositoryToConfigure(evt) {
    document.getElementById("repoConfig-content").style.display = evt.target.value !== "" ? "block" : "none";
}

// Exemplo de uso
// document.getElementById('addLinkedRepo').addEventListener('click', () => {
//     const repoType = getSelectedRepoType();
//     const repoId = document.getElementById('linkedReposDropdown').value;

//     if (repoId) {
//         if (repoType === 'submodules') {
//             // Adicionar como submodule
//             repositoriesData.repoConfigs[currentRepoId].submodules.push(repoId);
//         } else {
//             // Adicionar como package
//             repositoriesData.repoConfigs[currentRepoId].packages.push(repoId);
//         }
//         saveRepositoriesData();
//         updateLinkedReposLists(currentRepoId);
//         updateAvailableLinkedReposDropdowns(currentRepoId);
//     }
// });

// Adicione este evento para o botão de configurar:
document.getElementById('saveRepoConfig').addEventListener('click', () => {
    const repoId = document.getElementById('mainReposDropdown').value;
    if (repoId) {
        setupRepoConfig(repoId);
    }
});

// Adicione o evento para o botão de remover
document.getElementById('removeRepoBtn').addEventListener('click', () => {
    const dropdown = document.getElementById('mainReposDropdown');
    const selectedIndex = dropdown.selectedIndex;

    if (selectedIndex >= 0) {
        const repoId = dropdown.options[selectedIndex].value;

        // Remove do array principal
        repositoriesData.mainRepos = repositoriesData.mainRepos.filter(id => id !== repoId);

        // Remove as configurações associadas
        delete repositoriesData.repoConfigs[repoId];

        // Salva e atualiza a UI
        saveRepositoriesData();
        loadMainReposList();
        updateAvailableReposDropdown();

        // Se estava configurando este repositório, volta para a lista
        if (document.getElementById('repoConfig').style.display !== 'none' &&
            document.querySelector('#repoConfig').getAttribute('data-current-repo') === repoId) {
            document.getElementById('repoConfig').style.display = 'none';
        }
    } else {
        alert('Selecione um repositório para remover');
    }
});

// Carrega dados salvos ao iniciar
chrome.storage.local.get(['repositoriesData'], (result) => {
    if (result.repositoriesData) {
        repositoriesData = result.repositoriesData;
    }
});