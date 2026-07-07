export async function LoadData() {
    return new Promise(resolve => {
        chrome.storage.local.get([
            'azureConfig',
            'organization',
            'project'
        ], resolve);
    });
}

export async function updateTasks() {

    const config = await LoadData();
    if (!config.azureConfig.token || !config.organization || !config.project) {
        throw new Error('Por favor, configure o token, organização e projeto antes de continuar.');
    }

    // Codifica token para Basic Auth
    const authToken = btoa(`:${config.azureConfig.token}`);

    // URL base
    const baseUrl = `https://dev.azure.com/${config.organization}/${config.project}`;

    // 1. Busca dados da Story
    const storyUrl = `${baseUrl}/_apis/wit/workitems/${storyId}?$expand=Relations&api-version=7.1-preview.3`;
    const storyResponse = await fetch(storyUrl, {
        headers: {
            'Authorization': `Basic ${authToken}`
        }
    });

    if (!storyResponse.ok) {
        throw new Error(`Erro ao buscar Story: ${storyResponse.status}`);
    }

    const storyData = await storyResponse.json();

    // 2. Extrai AreaPath e IterationPath da Story
    const areaPath = storyData.fields['System.AreaPath'];
    const iterationPath = storyData.fields['System.IterationPath'];

    // 3. Busca todas as tasks relacionadas
    if (!storyData.relations) {
        throw new Error('Nenhuma task relacionada encontrada.');
    }

    const tasksUrls = storyData.relations
        .filter(rel => rel.rel === 'System.LinkTypes.Hierarchy-Forward')
        .map(rel => rel.url);

    // 4. Processa cada task
    let updatedCount = 0;

    for (const taskUrl of tasksUrls) {
        try {
            // Busca dados da task
            const taskResponse = await fetch(taskUrl, {
                headers: {
                    'Authorization': `Basic ${authToken}`
                }
            });

            if (!taskResponse.ok) continue;

            const taskData = await taskResponse.json();

            // Verifica se é uma Task
            if (taskData.fields['System.WorkItemType'] !== 'Task') continue;

            // Atualiza a task
            const updateUrl = taskUrl.includes('api-version') ?
                taskUrl :
                `${taskUrl}?api-version=7.1-preview.3`;

            const updateResponse = await fetch(updateUrl, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Basic ${authToken}`,
                    'Content-Type': 'application/json-patch+json; charset=UTF-8'
                },
                body: JSON.stringify([
                    {
                        "op": "replace",
                        "path": "/fields/System.AreaPath",
                        "value": areaPath
                    },
                    {
                        "op": "replace",
                        "path": "/fields/System.IterationPath",
                        "value": iterationPath
                    }
                ])
            });

            if (updateResponse.ok) {
                updatedCount++;
            }
        } catch (error) {
            console.error('Erro ao processar task:', error);
        }
    }
}