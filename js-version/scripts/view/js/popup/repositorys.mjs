console.log("Carregou repositorys.mjs");

async function initializeScreen() {

    let repositoriesData = {
        allRepos: [],
        mainRepos: [],
        repoConfigs: {}
    };
    let currentRepoId = null;



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
        document.getElementById('repositorys').querySelector('.form-group:not(#repoConfig)').style.display = 'none';
        document.getElementById('repoConfig').style.display = 'block';
    }

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
        // Repositórios já usados em qualquer lugar
        const usedRepos = [
            ...repositoriesData.mainRepos,
            ...Object.values(repositoriesData.repoConfigs).flatMap(c => [...c.submodules, ...c.packages])
        ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicados

        // Repositórios disponíveis
        const availableRepos = repositoriesData.allRepos
            .filter(repo => !usedRepos.includes(repo.id) && repo.id !== repoId);

        // Atualiza dropdown de submodules
        const linkedRepoSelect = document.getElementById('linkedReposDropdown');
        linkedRepoSelect.innerHTML = '';

        if (availableRepos.length === 0) {
            linkedRepoSelect.innerHTML = '<option value="">Nenhum repositório disponível</option>';
        } else {
            availableRepos.forEach(repo => {
                const option = document.createElement('option');
                option.value = repo.id;
                option.textContent = repo.name;
                linkedRepoSelect.appendChild(option);
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
        currentRepoId = evt.target.value;
        updateAvailableLinkedReposDropdowns(currentRepoId);
    }

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

    // Exemplo de uso
    document.getElementById('addLinkedRepo').addEventListener('click', () => {
        const repoType = getSelectedRepoType();
        const repoId = document.getElementById('linkedReposDropdown').value;

        if (repoId) {
            setupRepoConfig(currentRepoId);
            if (repoType === 'submodules') {
                // Adicionar como submodule
                repositoriesData.repoConfigs[currentRepoId].submodules.push(repoId);
            } else {
                // Adicionar como package
                repositoriesData.repoConfigs[currentRepoId].packages.push(repoId);
            }
            saveRepositoriesData();
            updateLinkedReposLists(currentRepoId);
            updateAvailableLinkedReposDropdowns(currentRepoId);
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

    // Voltar para lista principal
    document.getElementById('backToRepos').addEventListener('click', () => {
        document.getElementById('repoConfig').style.display = 'none';
        document.getElementById('repositorys').querySelector('.form-group:not(#repoConfig)').style.display = 'block';
    });

    // Carrega dados salvos ao iniciar
    chrome.storage.local.get(['repositoriesData', 'azureConfig'], async (result) => {
        if (result.azureConfig) {
            repositoriesData.allRepos = await fetchRepositories(result.azureConfig.token);
            if (result.repositoriesData) {
                repositoriesData = result.repositoriesData;
                loadMainReposList();
                updateAvailableReposDropdown();
            }
            return;
        }
        alert("Token não encontrado. Por favor, configure o token no menu de configurações.");
    });
}

initializeScreen();