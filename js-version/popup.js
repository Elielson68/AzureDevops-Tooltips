document.addEventListener('DOMContentLoaded', function () {
    // Carrega configurações salvas
    loadConfig();

    // Botão Salvar
    document.getElementById('saveConfig').addEventListener('click', saveConfig);

    // Botão Atualizar Tasks
    document.getElementById('updateTasks').addEventListener('click', updateTasks);
});

function loadConfig() {
    chrome.storage.local.get([
        'token',
        'organization',
        'project',
        'team'
    ], function (data) {
        if (data.token) document.getElementById('token').value = data.token;
        if (data.organization) document.getElementById('organization').value = data.organization;
        if (data.project) document.getElementById('project').value = data.project;
        if (data.team) document.getElementById('team').value = data.team;
    });
}

function saveConfig() {
    const token = document.getElementById('token').value;
    const organization = document.getElementById('organization').value;
    const project = document.getElementById('project').value;
    const team = document.getElementById('team').value;

    chrome.storage.local.set({
        token: token,
        organization: organization,
        project: project,
        team: team
    }, function () {
        showStatus('Configurações salvas com sucesso!', 'success');
    });
}

async function updateTasks() {
    const storyId = document.getElementById('storyId').value;
    if (!storyId) {
        showStatus('Por favor, informe o ID da Story/Bug', 'error');
        return;
    }

    // Mostra loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('updateTasks').disabled = true;

    try {
        // Recupera configurações
        const config = await new Promise(resolve => {
            chrome.storage.local.get([
                'token',
                'organization',
                'project'
            ], resolve);
        });

        if (!config.token || !config.organization || !config.project) {
            throw new Error('Por favor, configure o token, organização e projeto antes de continuar.');
        }

        // Codifica token para Basic Auth
        const authToken = btoa(`:${config.token}`);

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

        showStatus(`Sucesso! ${updatedCount} tasks atualizadas.`, 'success');
    } catch (error) {
        console.error('Erro:', error);
        showStatus(error.message, 'error');
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('updateTasks').disabled = false;
    }
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = type;
    statusDiv.style.display = 'block';

    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}