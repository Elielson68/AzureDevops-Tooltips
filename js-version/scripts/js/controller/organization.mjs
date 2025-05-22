import { getAllTeamMembers } from './../model/api_azure.mjs';


export async function StartModule() {
    console.log(await getAllTeamMembers());
}
