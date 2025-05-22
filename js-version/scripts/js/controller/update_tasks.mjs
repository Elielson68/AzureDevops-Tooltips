import { updateTasks } from "../model/update_tasks.mjs";
import { addEventListenerToUpdateButton, getInputStoryIdValue, showLoading, showStatus } from "../view/update_tasks.mjs";

async function startUpdateTasks() {
    const storyId = getInputStoryIdValue();
    if (!storyId) {
        showStatus('Por favor, informe o ID da Story/Bug', 'error');
        return;
    }

    showLoading();
    try {
        updateTasks()
        showStatus(`Sucesso! ${updatedCount} tasks atualizadas.`, 'success');
    }
    catch (error) {
        showStatus(error.message, 'error');
    }
    finally {
        hideLoading();
    }
}

addEventListenerToUpdateButton(startUpdateTasks);