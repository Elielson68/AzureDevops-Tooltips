import * as api_links from "./api_links.mjs";
import * as requests from "./requests.mjs";

export async function getProjects(organization) {
    const projects = await requests.get(api_links.USER_PROJECTS(organization));
    const projectsData = await projects.json();

    if (!projectsData) {
        return;
    }

    const projectsNames = projectsData.value.map(x => x.name);
    return projectsNames;
}

export async function getRepositories(organization, project) {
    const repoResponse = await requests.get(api_links.GET_REPOS(organization, project));

    const repoJsonData = await repoResponse.json();
    return repoJsonData.value.map(x => { return { id: x.name, name: x.name } });
}

export async function getWorkItemData(organization, project, storyId) {
    try {
        const response = await requests.get(api_links.GET_WORK_ITEM_DATA(organization, project, storyId));
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

export async function updateWorkItemState(organization, project, work_item_id, state) {
    const update_payload = [
        {
            "op": "replace",
            "path": "/fields/System.State",
            "value": state
        }
    ];

    try {
        await requests.path(api_links.WORK_ITEM_INFO(organization, project, work_item_id), update_payload);
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

export async function getUserId(organization, user_name) {
    try {
        const response = await requests.get(api_links.GET_USER_ID(organization, user_name));
        const data = await response.json();
        return data.value[0].id;
    } catch (error) {
        console.error("Error getting user ID:", error);
        return null;
    }
}

export async function getMyUserInfo(organization) {
    try {
        const response = await requests.get(api_links.GET_MY_USER(organization));
        return await response.json();
    } catch (error) {
        console.error("Error getting user info:", error);
        return null;
    }
}

export async function getMyId(organization) {
    const user_info = await getMyUserInfo(organization);
    return user_info?.authenticatedUser?.id;
}

export async function getAllTeams(organization, project) {
    try {
        const response = await requests.get(api_links.GET_TEAMS(organization, project));
        const data = await response.json();
        return data.value.map(x => x.name);
    } catch (error) {
        console.error('Erro ao obter times:', error);
        return [];
    }
}

async function getAllObjectTeams(organization, project) {
    try {
        const response = await requests.get(api_links.GET_TEAMS(organization, project));
        const data = await response.json();
        return data.value;
    } catch (error) {
        console.error('Erro ao obter times:', error);
        return [];
    }
}

export async function getTeamMembers(organization, project, teamId) {
    try {
        const response = await requests.get(api_links.GET_TEAM_MEMBERS(organization, project, teamId));
        const data = await response.json();
        return data.value;
    } catch (error) {
        console.error('Erro ao obter membros do time:', error);
        return [];
    }
}

export async function getAllTeamMembersData(organization, project, teamName) {
    const teams = await getAllObjectTeams(organization, project);
    const team = teams.find(t => t.name === teamName);
    if (team) {
        const members = await getTeamMembers(organization, project, team.id);
        return members.map(member => member.identity);
    }
    return [];
}
