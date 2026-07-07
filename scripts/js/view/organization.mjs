export const selectProjectId = "project";
export const selectTeamId = "team";
export const selectReviewersId = "listReviewers";
export const selectAddReviewerId = "listAddReviewers";

/** Projeto/Time populam o select com strings simples; Revisores com {id, displayName}. */
function toOption(item) {
    const isObject = typeof item === 'object' && item !== null;
    return {
        value: isObject ? item.id : item,
        label: isObject ? item.displayName : item
    };
}

export async function populateSelect(selectId, items) {
    const select = document.getElementById(selectId);
    select.disabled = false;
    select.innerHTML = '';

    if (!items || items.length === 0) {
        select.innerHTML = '<option value="">Nenhum item encontrado</option>';
        console.log("NÃO POPULOU: ", selectId);
        return;
    }
    console.log("Populou: ", selectId);
    items.forEach(item => {
        const { value, label } = toOption(item);
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        select.appendChild(option);
    });
}

export function addEventListenerToProjectSelect(event) {
    document.getElementById(selectProjectId).addEventListener('change', event);
}

export function addEventListenerToTeamSelect(event) {
    document.getElementById(selectTeamId).addEventListener('change', event);
}

export function addEventListenerToReviewersSelect(event) {
    document.getElementById(selectReviewersId).addEventListener('change', event);
}

export function addEventListenerToAddReviewerButton(event) {
    document.getElementById('addReviewer').addEventListener('click', event);
}

export function addEventListenerToRemoveReviewerButton(event) {
    document.getElementById('removeReviewerBtn').addEventListener('click', event);
}

export function addEventListenerToSaveConfigButton(event) {
    document.getElementById('saveConfig').addEventListener('click', event);
}

/** Retorna { id, displayName } da opção selecionada no momento, ou null se nenhuma (select vazio). */
export function getSelectedReviewer(selectId) {
    const select = document.getElementById(selectId);
    const option = select.options[select.selectedIndex];
    if (!option || option.value === '') return null;
    return { id: option.value, displayName: option.textContent };
}

export function addReviewerOption(selectId, reviewer) {
    const select = document.getElementById(selectId);
    const option = document.createElement('option');
    option.value = reviewer.id;
    option.textContent = reviewer.displayName;
    select.appendChild(option);
}

export function removeSelectValue(selectId, value) {
    const select = document.getElementById(selectId);
    const options = Array.from(select.options);
    const optionToRemove = options.find(option => option.value === value);
    if (optionToRemove) {
        select.removeChild(optionToRemove);
    }
}

export function getSelectOptions(selectId) {
    const select = document.getElementById(selectId);
    return Array.from(select.options)
        .filter(option => option.value !== '')
        .map(option => ({ id: option.value, displayName: option.textContent }));
}

export function setSelectValue(selectId, value, disableSelect = false) {
    const select = document.getElementById(selectId);
    select.value = value;
    select.disabled = disableSelect;
}

export function getSelectValue(selectId) {
    const select = document.getElementById(selectId);
    return select.value;
}
