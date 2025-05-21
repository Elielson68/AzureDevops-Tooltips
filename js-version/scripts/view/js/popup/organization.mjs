
function initializeScreen() {
    console.log("Carregou organization.mjs");

    const selectOrganizationId = "organization_select";
    const selectProjectId = "project";

    function saveConfig() {
        alert("Configuração salva!");
        const organization = document.getElementById(selectOrganizationId).value;
        const project = document.getElementById(selectProjectId).value;
        const team = document.getElementById('team').value;

        chrome.storage.local.set({
            organization: organization,
            project: project,
            team: team
        });
    }

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

    async function populateSelect(selectId, items) {
        const select = document.getElementById(selectId);
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

    document.getElementById('organization_select').addEventListener('change', async function () {
        const org = this.value;
        const token = null;

        if (org) {
            try {
                const projects = await fetchProjects(token, org);
                const projectSelect = document.getElementById(selectProjectId);
                console.log("Projetos Select: ", projectSelect);
                projectSelect.disabled = false;
                populateSelect(selectProjectId, projects);
            } catch (error) {
                console.error('Erro ao carregar projetos:', error);
            }
        }
    });

    document.getElementById(selectProjectId).addEventListener('change', async function () {
        const token = null;
        const org = document.getElementById(selectOrganizationId).value;
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

    document.getElementById('saveConfig').addEventListener('click', saveConfig);

    chrome.storage.local.get(['azureConfig'], async (result) => {

        chrome.storage.local.get([
            'azureConfig',
            'organization',
            'project',
            'team'
        ], async (data) => {
            console.log("Dados carregados: ", data);

            if (data.azureConfig) {
                const organization = await fetchOrganizations(result.azureConfig.token);
                await populateSelect(selectOrganizationId, organization);
                const project = await fetchProjects(result.azureConfig.token, data.organization);
                await populateSelect(selectProjectId, project);
                const team = await fetchTeams(result.azureConfig.token, data.project);
                await populateSelect('team', team);
            }

            if (data.organization) document.getElementById(selectOrganizationId).value = data.organization;

            if (data.project) {
                const selectProject = document.getElementById(selectProjectId);
                selectProject.value = data.project;
                selectProject.disabled = false;
            }
            if (data.team) {
                const selectTeam = document.getElementById('team');
                selectTeam.value = data.team;
                selectTeam.disabled = false;
            }
        });
    });
}

initializeScreen();
