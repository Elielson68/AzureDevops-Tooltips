export const data_config = {
    "path_browser_user_profile": "",
    "actual_user_display_name": "Elielson Barbosa",
    "token_azure": "TOKEN AZURE",
    "organization": "ORGANIZATION NAME",
    "project": "PROJECT NAME",
    "team": "TEAM NAME",
    "repositories": {
        "REPOSITORY": {
            "valid": false,
            "creation_status_message": "",
            "type_repo": "principal"
        }
    }
}

export const base_api_link = `https://dev.azure.com/${data_config.organization}`;
export const base_api_project_link = `${base_api_link}/${data_config.project}`;

export const repository_name = "REPOSITORY NAME";
export const search_criteria = (branch_name) => `searchCriteria.sourceRefName=refs/heads/${branch_name}&`;

export const GET_WORK_ITEM_DATA = (story_id) =>
    `${base_api_project_link}/_apis/wit/workitems/${story_id}?$expand=Relations&api-version=7.1-preview.3`;

export const GET_PR_ID =
    `${base_api_project_link}/_apis/git/repositories/${repository_name}/pullrequests?api-version=7.1-preview.1`;

export const GET_USER_ID = (user_name) =>
    `https://vssps.dev.azure.com/${data_config.organization}/_apis/identities?searchFilter=General&filterValue=${user_name}&api-version=7.1-preview.1`;

export const GET_MY_USER =
    `${base_api_link}/_apis/connectionData?api-version=7.1-preview.1`;

export const GET_PRs_BY_USER = (user_id) =>
    `${base_api_project_link}/_apis/git/repositories/${repository_name}/pullrequests?searchCriteria.creatorId=${user_id}&searchCriteria.status=active&api-version=7.1`;

export const WORK_ITEM_INFO = (work_item_id) =>
    `${base_api_project_link}/_apis/wit/workItems/${work_item_id}?api-version=7.1-preview.3`;

export const USER_INFO_BY_NAME = (user_name) =>
    `https://vsaex.dev.azure.com/${data_config.organization}/_apis/userentitlements?$filter=name+eq+%27${user_name}%27&api-version=7.1-preview.4`;

export const USER_WORK_ITEMS =
    `${base_api_project_link}/_apis/wit/wiql?api-version=7.1`;
