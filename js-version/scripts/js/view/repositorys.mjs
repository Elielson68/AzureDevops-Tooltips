console.log("Carregou repositorys.mjs");
let currentLinkedRepoTypeSelect = "submodules";

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
}

function removeFromMainAndConfigureDropdowns(index) {
    const mainDropdown = document.getElementById('mainReposDropdown');
    const configureSelect = document.getElementById('configureDropdown');

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
    const linkedRepoSelect = document.getElementById('linkedReposDropdown');
    const linkedRepoList = document.getElementById('linkedReposList');
    const repo = linkedRepoSelect.options[linkedRepoSelect.selectedIndex];

    const item = document.createElement('div');
    item.className = 'repo-item linked-repo-type';
    item.innerHTML = `
        <span>${repo.textContent}</span>
        <button class="remove-linked-repo" data-repo-id="${currentLinkedRepoTypeSelect}" data-type="${currentLinkedRepoTypeSelect}">Remover</button>
    `;
    linkedRepoList.appendChild(item);

    const btn = item.querySelector('.remove-linked-repo');
    btn.addEventListener('click', () => {
        item.remove();
    });
}

function onConfigureDropdownChange() {
    const configureDropdown = document.getElementById('configureDropdown');
    const style = document.getElementById('repoConfig-content').style;
    const selectedIndex = configureDropdown.selectedIndex;

    if (configureDropdown.options.length === 0 || configureDropdown.options[selectedIndex].value === "") {
        style.display = 'none';
        return;
    }

    style.display = 'block';
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
    addEventListenerToConfigureRepoDropdown(onConfigureDropdownChange);

    addEventListenerToRadioGroup((value, _) => {
        currentLinkedRepoTypeSelect = value;
    });

    addEventListenerToAddLinkedRepoButton(addToLinkedRepoDropdown);
    addEventListenerToSaveRepoConfigButton(() => {
        alert("Dados salvos com sucesso!");
    });
}

