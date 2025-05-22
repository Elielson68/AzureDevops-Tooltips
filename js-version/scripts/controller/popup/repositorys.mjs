import { getAllTeamMembers } from './api_azure.mjs';


export async function StartModule() {
    console.log(await getAllTeamMembers());
}
