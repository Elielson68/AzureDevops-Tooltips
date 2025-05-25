console.log("Carregou repositorys.mjs");

async function initializeScreen() {

    // Configurar repositório
    function setupRepoConfig(repoId) {
        const repo = repositoriesData.allRepos.find(r => r.id === repoId);
        document.getElementById('currentRepoName').textContent = repo.name;

        // Inicializa configuração se não existir
        //TODO: criar método para criar novo campo
        // if (!repositoriesData.repoConfigs[repoId]) {
        //     repositoriesData.repoConfigs[repoId] = {
        //         submodules: [],
        //         packages: []
        //     };
        // }

        // Atualiza listas
        updateLinkedReposLists(repoId);
        updateAvailableLinkedReposDropdowns(repoId);
        updateAvailableReposDropdown();

        // Mostra a tela de configuração
        document.getElementById('repoConfig').style.display = 'block';
    }

    function updateLinkedReposLists(repoId, repoConfigs) {
        const config = repoConfigs[repoId] || { submodules: [], packages: [] };

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

                repositoriesData.linkedRepos = repositoriesData.linkedRepos.filter(id => id !== linkedRepoId);
                saveRepositoriesData();
                updateLinkedReposLists(repoId);
                updateAvailableLinkedReposDropdowns(repoId);
                updateAvailableReposDropdown();

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
        updateLinkedReposLists(currentRepoId);
        updateAvailableLinkedReposDropdowns(currentRepoId);
        updateAvailableReposDropdown();
    }

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
            repositoriesData.linkedRepos.push(repoId);
            saveRepositoriesData();
            updateLinkedReposLists(currentRepoId);
            updateAvailableLinkedReposDropdowns(currentRepoId);
            updateAvailableReposDropdown();
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
            updateLinkedReposLists(currentRepoId);
            updateAvailableLinkedReposDropdowns(currentRepoId);
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
    chrome.storage.local.get(['repositoriesData', 'azureConfig'], async (result) => {
        if (result.azureConfig) {
            repositoriesData.allRepos = await fetchRepositories(result.azureConfig.token);

            if (result.repositoriesData && result.repositoriesData.allRepos.length !== 0) {
                repositoriesData = result.repositoriesData;
            }

            for (const repoId in repositoriesData.repoConfigs) {
                console.log("Configurando repositório", repoId);
                updateLinkedReposLists(repoId);
                updateAvailableLinkedReposDropdowns(repoId);
            }

            loadMainReposList();
            updateAvailableReposDropdown();
            return;
        }
        alert("Token não encontrado. Por favor, configure o token no menu de configurações.");
    });
}

function addToAvaiableAndLinkedDropdowns(option) {
    const avaiableDropdown = document.getElementById('availableRepos');
    const linkedSelect = document.getElementById('linkedReposDropdown');

    avaiableDropdown.appendChild(option.cloneNode(true));
    linkedSelect.appendChild(option.cloneNode(true));
}

function removeFromAvaiableAndLinkedDropdowns(index) {
    const avaiableDropdown = document.getElementById('availableRepos');
    const linkedSelect = document.getElementById('linkedReposDropdown');

    avaiableDropdown.remove(index);
    linkedSelect.remove(index);
}

function setInnerHTMLToAvaiableAndLinkedDropdowns(innerHTML) {
    const avaiableDropdown = document.getElementById('availableRepos');
    const linkedSelect = document.getElementById('linkedReposDropdown');

    avaiableDropdown.innerHTML = innerHTML;
    linkedSelect.innerHTML = innerHTML;
}

function addToMainAndConfigureDropdowns(option) {
    const mainDropdown = document.getElementById('mainReposDropdown');
    const configureSelect = document.getElementById('configureDropdown');

    mainDropdown.appendChild(option.cloneNode(true));
    configureSelect.appendChild(option.cloneNode(true));
}

function removeFromMainAndConfigureDropdowns(index) {
    const mainDropdown = document.getElementById('mainReposDropdown');
    const configureSelect = document.getElementById('configureDropdown');

    mainDropdown.remove(index);
    configureSelect.remove(index);
}

function setInnerHTMLToMainAndConfigureDropdowns(innerHTML) {
    const mainDropdown = document.getElementById('mainReposDropdown');
    const configureSelect = document.getElementById('configureDropdown');

    mainDropdown.innerHTML = innerHTML;
    configureSelect.innerHTML = innerHTML;
}

function removeFromAvaiableDropdownToMainDropdown() {
    const avaiableDropdown = document.getElementById('availableRepos');
    const mainRepoDropdown = document.getElementById('mainReposDropdown');

    const option = () => avaiableDropdown.options[avaiableDropdown.selectedIndex];
    const opt = option();

    if (opt === null || opt === undefined || opt.value === "") {
        return;
    }

    if (mainRepoDropdown.options.length === 1 && mainRepoDropdown.options[0].value === "") {
        removeFromMainAndConfigureDropdowns(0);
    }

    addToMainAndConfigureDropdowns(opt);
    removeFromAvaiableAndLinkedDropdowns(avaiableDropdown.selectedIndex);

    if (avaiableDropdown.options.length === 0) {
        setInnerHTMLToAvaiableAndLinkedDropdowns('<option value="">Nenhum repositório disponível</option>');
    }
}

function removeFromMainDropdownToAvaiableDropdown() {
    const avaiableDropdown = document.getElementById('availableRepos');
    const mainRepoDropdown = document.getElementById('mainReposDropdown');

    const option = () => mainRepoDropdown.options[mainRepoDropdown.selectedIndex];
    const opt = option();

    if (opt === null || opt === undefined || opt.value === "") {
        return;
    }

    if (avaiableDropdown.options.length === 1 && avaiableDropdown.options[0].value === "") {
        removeFromAvaiableAndLinkedDropdowns(0);
    }

    addToAvaiableAndLinkedDropdowns(opt);
    removeFromMainAndConfigureDropdowns(mainRepoDropdown.selectedIndex);

    if (mainRepoDropdown.options.length === 0) {
        setInnerHTMLToMainAndConfigureDropdowns('<option value="">Nenhum repositório adicionado</option>');
    }
}

function onConfigureDropdownChange() {
    const configureDropdown = document.getElementById('configureDropdown');
    const style = document.getElementById('repoConfig-content').style;
    style.display = configureDropdown.selectedIndex != 0 ? 'block' : 'none';
}

export function updateAvailableReposDropdown(availableRepos) {
    if (availableRepos.length === 0) {
        setInnerHTMLToAvaiableAndLinkedDropdowns('<option value="">Nenhum repositório disponível</option>');
        return;
    }

    availableRepos.forEach(repo => {
        const option = document.createElement('option');
        option.value = repo.id;
        option.textContent = repo.name;
        addToAvaiableAndLinkedDropdowns(option);
    });
}

export function addEventListenerToAddMainRepoButton(event) {
    document.getElementById('addMainRepo').addEventListener('click', event);
}

export function addEventListenerToRemoveMainRepoButton(event) {
    document.getElementById('removeRepoBtn').addEventListener('click', event);
}

export function addEventListenerToConfigureRepoDropdown(event) {
    document.getElementById('configureDropdown').addEventListener('change', event);
}

export function getDropdownsValues() {
    const avaiableDropdown = document.getElementById('availableRepos');
    const mainRepoDropdown = document.getElementById('mainReposDropdown');

    const getDropdownValues = dropdown => {
        return Array.from(dropdown.options).map(opt => opt.value);
    }

    return {
        avaiableRepos: getDropdownValues(avaiableDropdown),
        mainRepos: getDropdownValues(mainRepoDropdown)
    };
}

export function registerAllEvents() {
    setInnerHTMLToAvaiableAndLinkedDropdowns('<option value="">Selecione um repositório...</option>');
    setInnerHTMLToMainAndConfigureDropdowns('<option value="">Nenhum repositório adicionado</option>');

    addEventListenerToAddMainRepoButton(removeFromAvaiableDropdownToMainDropdown);
    addEventListenerToRemoveMainRepoButton(removeFromMainDropdownToAvaiableDropdown);
    addEventListenerToConfigureRepoDropdown(onConfigureDropdownChange);
}

