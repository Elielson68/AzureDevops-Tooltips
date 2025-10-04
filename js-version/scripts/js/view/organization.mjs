export const selectProjectId = "project";
export const selectTeamId = "team";
export const selectReviewersId = "listReviewers";
export const selectAddReviewerId = "listAddReviewers";

export async function populateSelect(selectId, items) {
    const select = document.getElementById(selectId);
    select.disabled = false;
    select.innerHTML = '';

    if (items.length === 0) {
        select.innerHTML = '<option value="">Nenhum item encontrado</option>';
        console.log("NÃO POPULOU: ", selectId);
        return;
    }
    console.log("Populou: ", selectId);
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
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

export function addSelectValue(selectId, value) {
    const select = document.getElementById(selectId);
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
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

export function setSelectValue(selectId, value, disableSelect = false) {
    const select = document.getElementById(selectId);
    select.value = value;
    select.disabled = disableSelect;
}

export function getSelectValue(selectId) {
    const select = document.getElementById(selectId);
    return select.value;
}
