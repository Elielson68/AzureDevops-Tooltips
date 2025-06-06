import * as api_links from "./api_links.mjs";
import * as requests from "./requests.mjs";

let pr_data_global = {};


export async function getProjects(organization) {
    const projects = await requests.get(api_links.USER_PROJECTS(organization));
    const projectsData = await projects.json();

    if (!projectsData) {
        return;
    }

    const projectsNames = projectsData.value.map(x => x.name);
    return projectsNames;
}

export async function updateTasks() {
    try {

        const storyResponse = await requests.get(api_links.GET_USER_ID("Elielson Barbosa"));

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

export async function getWorkItemData(storyId) {
    try {
        const response = await requests.get(api_links.GET_WORK_ITEM_DATA(storyId));
        return await response.json();
    } catch (error) {
        console.error("Error fetching story data:", error);
        return null;
    }
}

export async function updateAreaAndIterationPathOfTask(task, area_path, iteration_path) {
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
        await requests.path(task_url, update_payload);
        console.log("Updated successfully");
    } catch (error) {
        console.error("Error updating task:", error);
    }
}

export async function updateWorkItemState(work_item_id, state) {
    const update_payload = [
        {
            "op": "replace",
            "path": "/fields/System.State",
            "value": state
        }
    ];

    try {
        await requests.path(api_links.WORK_ITEM_INFO(work_item_id), update_payload);
        console.log("Updated successfully");
    } catch (error) {
        console.error("Error updating work item state:", error);
    }
}

export async function updateAreaAndIterationPathOfAllTasks(story_data, tasks) {
    const story_area_path = story_data.fields['System.AreaPath'];
    const story_iteration_path = story_data.fields['System.IterationPath'];

    for (const task of tasks) {
        await updateAreaAndIterationPathOfTask(task, story_area_path, story_iteration_path);
    }
}

export async function getWorkItemsByStatus(user_name = "Elielson Barbosa", status = "Aguardando PR") {
    const query = {
        "query": `SELECT [System.Id], [System.Title], [System.WorkItemType] FROM WorkItems WHERE [System.AssignedTo] = '${user_name}' AND [System.State] = '${status}' AND [System.WorkItemType] != 'Task' ORDER BY [System.ChangedDate] DESC`
    };

    try {
        const response = await requests.post(api_links.USER_WORK_ITEMS, query);
        const data = await response.json();
        return data.workItems.map(item => item.id);
    } catch (error) {
        console.error("Error getting work items by status:", error);
        return [];
    }
}

export async function getUserId(user_name = "Elielson Barbosa") {
    try {
        const response = await requests.get(api_links.GET_USER_ID(user_name));
        const data = await response.json();
        return data.value[0].id;
    } catch (error) {
        console.error("Error getting user ID:", error);
        return null;
    }
}

export async function getMyUserInfo() {
    try {
        const response = await requests.get(api_links.GET_MY_USER);
        return await response.json();
    } catch (error) {
        console.error("Error getting user info:", error);
        return null;
    }
}

export async function getMyId() {
    const user_info = await getMyUserInfo();
    return user_info?.authenticatedUser?.id;
}

export function getPrDataFormatted(result_json) {
    return {
        title: result_json.title,
        id: result_json.pullRequestId,
        status: result_json.status,
        url: result_json.url
    };
}

export async function getWorksPrsByUser(user_name = "Elielson Barbosa") {
    const work_items = await getWorkItemsByStatus(user_name);
    const user_id = await getUserId(user_name);
    const link_pr_by_user = api_links.GET_PRs_BY_USER(user_id);

    try {
        const response = await requests.get(link_pr_by_user);
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

export function getPrUrlFromPrData(pr_data) {
    const work_item_id = Object.keys(pr_data)[0];
    const pr_title = Object.keys(pr_data[work_item_id])[0];
    return pr_data[work_item_id][pr_title].url;
}

export async function updatePrData() {
    for (const work_item_id in pr_data_global) {
        for (const pr_title in pr_data_global[work_item_id]) {
            try {
                const response = await requests.get(pr_data_global[work_item_id][pr_title].url);
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

export async function getClosedTasksFromWorkItem(workItemId) {
    const story_data = await getWorkItemData(workItemId);
    if (!story_data) return;

    const tasks_data = story_data.relations;
    const tasks_links = tasks_data.map(task => task.url);

    const tasks_responses = await Promise.all(
        tasks_links.map(link => requests.get(link))
    );

    const tasks = await Promise.all(
        tasks_responses.map(response => response.json())
    );

    const filtered_tasks = tasks.filter(
        task => task.fields['System.WorkItemType'] === 'Task' && task.fields['System.State'] === 'Closed'
    );

    return filtered_tasks;
}

export async function getAllTeams(organization, project) {
    const url = `https://dev.azure.com/${organization}/_apis/projects/${project}/teams?api-version=7.1`;

    try {
        const response = await requests.get(url);
        const data = await response.json();
        return data.value.map(x => x.name);
    } catch (error) {
        console.error('Erro ao obter times:', error);
        return [];
    }
}

export async function getTeamMembers(teamId) {
    const url = `https://dev.azure.com/${api_links.data_config.organization}/_apis/projects/${api_links.data_config.project}/teams/${teamId}/members?api-version=7.1`;

    try {
        const response = await requests.get(url);
        const data = await response.json();
        return data.value;
    } catch (error) {
        console.error('Erro ao obter membros do time:', error);
        return [];
    }
}

export async function getAllTeamMembers(organization, project) {
    const teams = await getAllTeams();
    const team = teams.find(t => t.name === api_links.data_config.team);

    if (team) {
        return await getTeamMembers(team.id);
    }
    return [];

}
