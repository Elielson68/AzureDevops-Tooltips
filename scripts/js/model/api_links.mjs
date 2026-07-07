/**
 * scripts/js/model/api_links.mjs
 * -------------------------------------------------------------------------
 * Construtores de URL da API REST do Azure DevOps. Nenhum valor de
 * organização/projeto/time/token é fixo aqui — tudo vem por parâmetro,
 * lido pelos módulos chamadores a partir de chrome.storage.local (ver
 * common/storage.js). Isso é o que permite a extensão funcionar com
 * qualquer organização do Azure DevOps, não só a usada em desenvolvimento.
 */

export const baseOrgUrl = (organization) => `https://dev.azure.com/${organization}`;
export const baseProjectUrl = (organization, project) =>
    `${baseOrgUrl(organization)}/${encodeURIComponent(project)}`;

export const search_criteria = (branch_name) => `searchCriteria.sourceRefName=refs/heads/${branch_name}&`;

export const GET_WORK_ITEM_DATA = (organization, project, story_id) =>
    `${baseProjectUrl(organization, project)}/_apis/wit/workitems/${story_id}?$expand=Relations&api-version=7.1-preview.3`;

export const GET_PR_ID = (organization, project, repository_name) =>
    `${baseProjectUrl(organization, project)}/_apis/git/repositories/${repository_name}/pullrequests?api-version=7.1-preview.1`;

export const GET_USER_ID = (organization, user_name) =>
    `https://vssps.dev.azure.com/${organization}/_apis/identities?searchFilter=General&filterValue=${user_name}&api-version=7.1-preview.1`;

export const GET_MY_USER = (organization) =>
    `${baseOrgUrl(organization)}/_apis/connectionData?api-version=7.1-preview.1`;

export const GET_PRs_BY_USER = (organization, project, repository_name, user_id) =>
    `${baseProjectUrl(organization, project)}/_apis/git/repositories/${repository_name}/pullrequests?searchCriteria.creatorId=${user_id}&searchCriteria.status=active&api-version=7.1`;

export const WORK_ITEM_INFO = (organization, project, work_item_id) =>
    `${baseProjectUrl(organization, project)}/_apis/wit/workItems/${work_item_id}?api-version=7.1-preview.3`;

export const USER_INFO_BY_NAME = (organization, user_name) =>
    `https://vsaex.dev.azure.com/${organization}/_apis/userentitlements?$filter=name+eq+%27${user_name}%27&api-version=7.1-preview.4`;

export const USER_PROJECTS = (organization) =>
    `https://dev.azure.com/${organization}/_apis/projects?api-version=7.1`;

export const GET_REPOS = (organization, project) =>
    `${baseProjectUrl(organization, project)}/_apis/git/repositories?api-version=7.1-preview.1`;

export const USER_WORK_ITEMS = (organization, project) =>
    `${baseProjectUrl(organization, project)}/_apis/wit/wiql?api-version=7.1`;

export const GET_TEAMS = (organization, project) =>
    `${baseOrgUrl(organization)}/_apis/projects/${encodeURIComponent(project)}/teams?api-version=7.1`;

export const GET_TEAM_MEMBERS = (organization, project, teamId) =>
    `${baseOrgUrl(organization)}/_apis/projects/${encodeURIComponent(project)}/teams/${teamId}/members?api-version=7.1`;
