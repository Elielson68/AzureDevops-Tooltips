let repositoriesData = {
    avaiableRepos: [],
    mainRepos: [],
    linkedRepos: [],
    mainRepoConfigs: {}
};

let azureData = null;

export async function LoadData() {
    return new Promise((resolve) => {
        chrome.storage.local.get([
            'azureConfig',
            'repositoriesData'
        ], async (data) => {
            azureData = data.azureConfig;
            if (data.repositoriesData) {
                Object.assign(repositoriesData, data.repositoriesData);
                console.log('repositoriesData carregado do storage:', repositoriesData);
            }
            else {
                repositoriesData.avaiableRepos = await fetchRepositories(azureData.token);
            }
            resolve(repositoriesData);
        });
    });
}

// Salva o objeto repositoriesData no chrome.storage.local
export function saveRepositoriesData() {
    chrome.storage.local.set({ repositoriesData }, () => {
        console.log('repositoriesData salvo no storage:', repositoriesData);
    });
}

// Funções auxiliares
export async function fetchRepositories(token) {
    // Implemente a chamada à API para obter os repositórios
    // Exemplo: return await callAzureDevOpsApi(`https://dev.azure.com/{organization}/_apis/git/repositories`, token);
    return [
        { id: 'repo1', name: 'Repositório 1' },
        { id: 'repo2', name: 'Repositório 2' },
        { id: 'repo3', name: 'Repositório 3' }
    ]; // Exemplo
}

export function updateRepositoriesData(data) {
    Object.assign(repositoriesData, data);
    console.log('Dados atualizados:', repositoriesData);
}