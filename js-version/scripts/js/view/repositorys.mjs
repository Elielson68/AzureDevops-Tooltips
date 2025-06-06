console.log("Carregou repositorys.mjs");
let currentLinkedRepoTypeSelect = "submodules";
const linkedReposData = {}

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
    configureSelect.dispatchEvent(new Event('change'));

    linkedReposData[option.value] = [];
}

function removeFromMainAndConfigureDropdowns(index) {
    const mainDropdown = document.getElementById('mainReposDropdown');
    const configureSelect = document.getElementById('configureDropdown');

    delete linkedReposData[configureSelect.options[index].value];

    mainDropdown.remove(index);
    configureSelect.remove(index);
    configureSelect.dispatchEvent(new Event('change'));
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

function addToLinkedRepoDropdown() {
    const configureDropdown = document.getElementById('configureDropdown');
    const linkedRepoSelect = document.getElementById('linkedReposDropdown');


    const repo = linkedRepoSelect.options[linkedRepoSelect.selectedIndex];
    const repoParent = configureDropdown.options[configureDropdown.selectedIndex];

    if (!repo) {
        return;
    }

    createItemOnLinkedReposList(repo.textContent, repo.value, currentLinkedRepoTypeSelect);
    addLinkedRepoToData(repoParent.value, repo.value, repo.textContent);

    linkedRepoSelect.remove(linkedRepoSelect.selectedIndex);
}

function createItemOnLinkedReposList(itemName, itemValue, itemType) {
    const configureDropdown = document.getElementById('configureDropdown');
    const linkedRepoList = document.getElementById('linkedReposList');
    const linkedRepoSelect = document.getElementById('linkedReposDropdown');

    const item = document.createElement('div');
    item.className = 'repo-item linked-repo-type';
    item.innerHTML = `
        <span name=${itemValue}>${itemName}</span>
        <button class="remove-linked-repo" data-repo-id="${itemType}" data-type="${itemType}">Remover</button>
    `;
    linkedRepoList.appendChild(item);

    const btn = item.querySelector('.remove-linked-repo');
    btn.addEventListener('click', () => {
        const span = btn.previousElementSibling;
        const option = document.createElement('option');
        option.value = span.getAttribute('name');
        option.textContent = span.textContent;

        // Remove do linkedReposData
        const repoParentId = configureDropdown.options[configureDropdown.selectedIndex].value;
        const repoIdToRemove = span.getAttribute('name');
        if (linkedReposData[repoParentId]) {
            linkedReposData[repoParentId] = linkedReposData[repoParentId].filter(repo => {
                console.log("repo.id", repo.id);
                return repo.id !== repoIdToRemove;
            });
        }

        linkedRepoSelect.appendChild(option);
        item.remove();
    });
}

function addLinkedRepoToData(repoLinkedParentId, repoId, repoName) {
    if (!linkedReposData[repoLinkedParentId]) {
        linkedReposData[repoLinkedParentId] = [];
    }

    linkedReposData[repoLinkedParentId].push({
        id: repoId,
        name: repoName,
        type: currentLinkedRepoTypeSelect
    });
}

function onConfigureDropdownChange() {
    const configureDropdown = document.getElementById('configureDropdown');
    const linkedReposDropdown = document.getElementById('linkedReposDropdown');
    const avaiableDropdown = document.getElementById('availableRepos');
    const linkedRepoList = document.getElementById('linkedReposList');
    const style = document.getElementById('repoConfig-content').style;

    const selectedIndex = configureDropdown.selectedIndex;

    if (configureDropdown.options.length === 0 || configureDropdown.options[selectedIndex].value === "") {
        style.display = 'none';
        return;
    }

    const selectedRepoId = configureDropdown.options[selectedIndex].value;

    linkedReposDropdown.innerHTML = avaiableDropdown.innerHTML;

    const linkedRepos = linkedReposData[selectedRepoId] || [];
    const linkedIds = linkedRepos.map(repo => repo.id);
    Array.from(linkedReposDropdown.options).forEach(option => {
        if (linkedIds.includes(option.value)) {
            option.remove();
        }
    });

    style.display = 'block';
    linkedRepoList.innerHTML = '';


    linkedRepos.forEach(repo => {
        createItemOnLinkedReposList(repo.name, repo.id, repo.type);
    });
}

export function updateAvailableReposDropdown(availableRepos) {
    setInnerHTMLToAvaiableAndLinkedDropdowns(null);
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

export function updateMainReposDropdown(mainRepos) {
    setInnerHTMLToMainAndConfigureDropdowns(null);
    if (mainRepos.length === 0) {
        setInnerHTMLToMainAndConfigureDropdowns('<option value="">Nenhum repositório adicionado</option>');
        return;
    }

    mainRepos.forEach(repo => {
        const option = document.createElement('option');
        option.value = repo.id;
        option.textContent = repo.name;
        addToMainAndConfigureDropdowns(option);
    });
}

export function addEventListenerToAddMainRepoButton(event) {
    document.getElementById('addMainRepo').addEventListener('click', event);
}

export function addEventListenerToRemoveMainRepoButton(event) {
    document.getElementById('removeRepoBtn').addEventListener('click', event);
}

export function addEventListenerToAddLinkedRepoButton(event) {
    document.getElementById('addLinkedRepo').addEventListener('click', event);
}

export function addEventListenerToSaveRepoConfigButton(event) {
    document.getElementById('saveRepoConfig').addEventListener('click', event);
}

export function addEventListenerToConfigureRepoDropdown(event) {
    document.getElementById('configureDropdown').addEventListener('change', event);
}

export function addEventListenerToLinkedReposDropdown(event) {
    document.getElementById('linkedReposDropdown').addEventListener('change', event);
}

export function addEventListenerToRadioGroup(callback) {
    const radioGroup = document.querySelector('.radio-group');
    if (radioGroup) {
        radioGroup.addEventListener('change', (event) => {
            if (event.target && event.target.type === 'radio') {
                callback(event.target.value, event.target);
            }
        });
    }
}

export function getDropdownsValues() {
    const avaiableDropdown = document.getElementById('availableRepos');
    const mainRepoDropdown = document.getElementById('mainReposDropdown');

    const getDropdownValues = dropdown => {
        return Array.from(dropdown.options).filter(opt => opt.value != "").map(opt => ({ "id": opt.value, "name": opt.textContent }));
    }

    return {
        avaiableRepos: getDropdownValues(avaiableDropdown),
        mainRepos: getDropdownValues(mainRepoDropdown)
    };
}

export function registerAllEvents() {
    addEventListenerToAddMainRepoButton(removeFromAvaiableDropdownToMainDropdown);
    addEventListenerToRemoveMainRepoButton(removeFromMainDropdownToAvaiableDropdown);
    addEventListenerToAddLinkedRepoButton(addToLinkedRepoDropdown);

    addEventListenerToConfigureRepoDropdown(onConfigureDropdownChange);

    addEventListenerToRadioGroup((value, _) => {
        currentLinkedRepoTypeSelect = value;
    });

    addEventListenerToSaveRepoConfigButton(() => {
        alert("Dados salvos com sucesso!");
    });
}

