/**
 * common/storage.js
 * -------------------------------------------------------------------------
 * Camada única de acesso às configurações persistidas em chrome.storage.local.
 *
 * Esta extensão guarda um único "perfil" ativo (uma organização/projeto/time
 * do Azure DevOps por vez, não múltiplos perfis) — por isso as chaves abaixo
 * não são aninhadas por domínio/organização, ao contrário de extensões que
 * precisam lembrar configurações diferentes por site.
 *
 * Carregado tanto pelo painel lateral (side panel) quanto pelo content
 * script (via web_accessible_resources em manifest.json), por isso nunca
 * lê nem escreve nada além de chrome.storage.local — nada de estado hardcoded
 * em arquivo de código-fonte.
 */

export const STORAGE_KEYS = Object.freeze({
    AZURE_CONNECTION: 'azureConnection',
    REVIEWERS_CONFIG: 'reviewersConfig'
});

/** Conexão ativa com o Azure DevOps: { token, organization, project, teamId, teamName }. */
export async function getAzureConnection() {
    const stored = await chrome.storage.local.get(STORAGE_KEYS.AZURE_CONNECTION);
    return stored[STORAGE_KEYS.AZURE_CONNECTION] || null;
}

/** Mescla e persiste um patch parcial da conexão ativa. */
export async function setAzureConnection(partialConnection) {
    const current = await getAzureConnection();
    const merged = { ...(current || {}), ...partialConnection };
    await chrome.storage.local.set({ [STORAGE_KEYS.AZURE_CONNECTION]: merged });
    return merged;
}

/**
 * Revisores: { available: [{id, displayName}], selected: [{id, displayName}] }.
 * Retorna `null` (não um objeto com arrays vazios) quando o usuário nunca
 * salvou essa configuração — quem chama precisa distinguir "nunca configurado"
 * de "configurado, mas sem nenhum revisor selecionado ainda".
 */
export async function getReviewersConfig() {
    const stored = await chrome.storage.local.get(STORAGE_KEYS.REVIEWERS_CONFIG);
    return stored[STORAGE_KEYS.REVIEWERS_CONFIG] || null;
}

export async function setReviewersConfig(available, selected) {
    const value = { available, selected };
    await chrome.storage.local.set({ [STORAGE_KEYS.REVIEWERS_CONFIG]: value });
    return value;
}
