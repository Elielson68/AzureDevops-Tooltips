export function StartModule() {
    const data_config = {
        "path_browser_user_profile": "",
        "actual_user_display_name": "Elielson Barbosa",
        "token_azure": "token azure",
        "organization": "org name",
        "project": "project name",
        "repositories": {
            "repo1": {
                "valid": false,
                "creation_status_message": "",
                "type_repo": "principal"
            }
        }
    }

    const auth_token = btoa(`:${data_config.token_azure}`);
    const HEADERS = { 'Authorization': `Basic ${auth_token}`, 'Content-Type': 'application/json', };

    const base_api_link = `https://dev.azure.com/${data_config.organization}`;
    const base_api_project_link = `${base_api_link}/${data_config.project}`;

    const repository_name = "repositório";
    const search_criteria = (branch_name) => `searchCriteria.sourceRefName=refs/heads/${branch_name}&`;
    let pr_data_global = {};

    const headerGetRequest = {
        headers: HEADERS
    };

    const headerPathRequest = (data) => ({
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify(data)
    });

    const headerPostRequest = (data) => ({
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(data)
    });

    async function getRequest(uri) {
        return await fetch(uri, headerGetRequest);
    }

    async function pathRequest(uri, data) {
        return await fetch(uri, headerPathRequest(data));
    }

    async function postRequest(uri, data) {
        return await fetch(uri, headerPostRequest(data));
    }

    const GET_WORK_ITEM_DATA = (story_id) =>
        `${base_api_project_link}/_apis/wit/workitems/${story_id}?$expand=Relations&api-version=7.1-preview.3`;

    const GET_PR_ID =
        `${base_api_project_link}/_apis/git/repositories/${repository_name}/pullrequests?api-version=7.1-preview.1`;

    const GET_USER_ID = (user_name) =>
        `https://vssps.dev.azure.com/${data_config.organization}/_apis/identities?searchFilter=General&filterValue=${user_name}&api-version=7.1-preview.1`;

    const GET_MY_USER =
        `${base_api_link}/_apis/connectionData?api-version=7.1-preview.1`;

    const GET_PRs_BY_USER = (user_id) =>
        `${base_api_project_link}/_apis/git/repositories/${repository_name}/pullrequests?searchCriteria.creatorId=${user_id}&searchCriteria.status=active&api-version=7.1`;

    const WORK_ITEM_INFO = (work_item_id) =>
        `${base_api_project_link}/_apis/wit/workItems/${work_item_id}?api-version=7.1-preview.3`;

    const USER_INFO_BY_NAME = (user_name) =>
        `https://vsaex.dev.azure.com/${data_config.organization}/_apis/userentitlements?$filter=name+eq+%27${user_name}%27&api-version=7.1-preview.4`;

    const USER_WORK_ITEMS =
        `${base_api_project_link}/_apis/wit/wiql?api-version=7.1`;


    async function updateTasks() {
        try {

            const storyResponse = await getRequest(GET_USER_ID("Elielson Barbosa"));

            if (!storyResponse.ok) {
                throw new Error(`Erro ao buscar Story: ${storyResponse.status}`);
            }

            const storyData = await storyResponse.json();
            console.log(storyData);
        }
        catch {
            console.error("Deu erro na requisição");
        }
    }

    async function getWorkItemData(storyId) {
        try {
            const response = await getRequest(GET_WORK_ITEM_DATA(storyId));
            return await response.json();
        } catch (error) {
            console.error("Error fetching story data:", error);
            return null;
        }
    }

    async function updateAreaAndIterationPathOfTask(task, area_path, iteration_path) {
        let task_url = task.url;
        if (!task_url.includes("api-version")) {
            task_url += "?api-version=7.1-preview.3";
        }

        const update_payload = [
            {
                "op": "replace",
                "path": "/fields/System.AreaPath",
                "value": area_path
            },
            {
                "op": "replace",
                "path": "/fields/System.IterationPath",
                "value": iteration_path
            },
        ];

        try {
            await pathRequest(task_url, update_payload);
            console.log("Updated successfully");
        } catch (error) {
            console.error("Error updating task:", error);
        }
    }

    async function updateWorkItemState(work_item_id, state) {
        const update_payload = [
            {
                "op": "replace",
                "path": "/fields/System.State",
                "value": state
            }
        ];

        try {
            await pathRequest(WORK_ITEM_INFO(work_item_id), update_payload);
            console.log("Updated successfully");
        } catch (error) {
            console.error("Error updating work item state:", error);
        }
    }

    async function updateAreaAndIterationPathOfAllTasks(story_data, tasks) {
        const story_area_path = story_data.fields['System.AreaPath'];
        const story_iteration_path = story_data.fields['System.IterationPath'];

        for (const task of tasks) {
            await updateAreaAndIterationPathOfTask(task, story_area_path, story_iteration_path);
        }
    }

    async function getWorkItemsByStatus(user_name = "Elielson Barbosa", status = "Aguardando PR") {
        const query = {
            "query": `SELECT [System.Id], [System.Title], [System.WorkItemType] FROM WorkItems WHERE [System.AssignedTo] = '${user_name}' AND [System.State] = '${status}' AND [System.WorkItemType] != 'Task' ORDER BY [System.ChangedDate] DESC`
        };

        try {
            const response = await postRequest(USER_WORK_ITEMS, query);
            const data = await response.json();
            return data.workItems.map(item => item.id);
        } catch (error) {
            console.error("Error getting work items by status:", error);
            return [];
        }
    }

    async function getUserId(user_name = "Elielson Barbosa") {
        try {
            const response = await getRequest(GET_USER_ID(user_name));
            const data = await response.json();
            return data.value[0].id;
        } catch (error) {
            console.error("Error getting user ID:", error);
            return null;
        }
    }

    async function getMyUserInfo() {
        try {
            const response = await getRequest(GET_MY_USER);
            return await response.json();
        } catch (error) {
            console.error("Error getting user info:", error);
            return null;
        }
    }

    async function getMyId() {
        const user_info = await getMyUserInfo();
        return user_info?.authenticatedUser?.id;
    }

    function getPrDataFormatted(result_json) {
        return {
            title: result_json.title,
            id: result_json.pullRequestId,
            status: result_json.status,
            url: result_json.url
        };
    }

    async function getWorksPrsByUser(user_name = "Elielson Barbosa") {
        const work_items = await getWorkItemsByStatus(user_name);
        const user_id = await getUserId(user_name);
        const link_pr_by_user = GET_PRs_BY_USER(user_id);

        try {
            const response = await getRequest(link_pr_by_user);
            const result = await response.json() || { value: [] };
            const prs_data = result.value.map(pr_data => getPrDataFormatted(pr_data));

            const works_items_with_prs = {};
            for (const work_item_id of work_items) {
                works_items_with_prs[work_item_id] = {};
                for (const pr of prs_data) {
                    if (pr.title.includes(work_item_id.toString())) {
                        works_items_with_prs[work_item_id][pr.title] = pr;
                    }
                }
            }

            return works_items_with_prs;
        } catch (error) {
            console.error("Error getting PRs by user:", error);
            return {};
        }
    }

    function getPrUrlFromPrData(pr_data) {
        const work_item_id = Object.keys(pr_data)[0];
        const pr_title = Object.keys(pr_data[work_item_id])[0];
        return pr_data[work_item_id][pr_title].url;
    }

    async function updatePrData() {
        for (const work_item_id in pr_data_global) {
            for (const pr_title in pr_data_global[work_item_id]) {
                try {
                    const response = await getRequest(pr_data_global[work_item_id][pr_title].url);
                    const data = await response.json();
                    pr_data_global[work_item_id][pr_title] = {
                        ...pr_data_global[work_item_id][pr_title],
                        ...getPrDataFormatted(data)
                    };
                } catch (error) {
                    console.error("Error updating PR data:", error);
                }
            }
        }
    }

    // Função para inicialização
    async function getClosedTasksFromWorkItem(workItemId) {
        const story_data = await getWorkItemData(workItemId);
        if (!story_data) return;

        const tasks_data = story_data.relations;
        const tasks_links = tasks_data.map(task => task.url);

        // Fetch all tasks in parallel
        const tasks_responses = await Promise.all(
            tasks_links.map(link => getRequest(link))
        );

        const tasks = await Promise.all(
            tasks_responses.map(response => response.json())
        );

        const filtered_tasks = tasks.filter(
            task => task.fields['System.WorkItemType'] === 'Task' && task.fields['System.State'] === 'Closed'
        );

        return filtered_tasks;
    }
}