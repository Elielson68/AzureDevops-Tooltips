import { getAllTeams, getProjects, getAllTeamMembersData } from "./api_azure.mjs";
import { getAzureConnection, setAzureConnection, getReviewersConfig, setReviewersConfig } from "../../../common/storage.js";

export async function fetchProjects() {
    const connection = await getAzureConnection();
    return await getProjects(connection.organization);
}

export async function fetchTeams(project) {
    const connection = await getAzureConnection();
    return await getAllTeams(connection.organization, project);
}

export async function fetchTeamMembers() {
    const connection = await getAzureConnection();
    const members = await getAllTeamMembersData(connection.organization, connection.project, connection.teamName);
    return members.map(member => ({ id: member.id, displayName: member.displayName }));
}

export async function saveConfig(projectValue, teamValue) {
    alert("Configuração salva!");
    await setAzureConnection({ project: projectValue, teamName: teamValue });
}

export async function saveReviewersConfig(available, selected) {
    console.log("Configuração de revisores salva!");
    await setReviewersConfig(available, selected);
}

export async function LoadData() {
    const connection = await getAzureConnection();
    const reviewersConfig = await getReviewersConfig();

    return {
        organization: connection?.organization || null,
        project: connection?.project || null,
        teamName: connection?.teamName || null,
        available: reviewersConfig?.available || [],
        selected: reviewersConfig?.selected || [],
        reviewersConfigured: reviewersConfig !== null
    };
}
