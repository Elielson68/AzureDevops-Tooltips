import base64
import json

with open("./data_config.json", "r") as file_config:
    data_config = json.loads(file_config.read())

token_acess = f':{data_config['token_azure']}'
auth_token = base64.b64encode(token_acess.encode()).decode()
HEADERS = {'Authorization': f'Basic {auth_token}'}

base_api_link = "https://dev.azure.com/{organization}".format(
    organization=data_config['organization'])
base_api_project_link = "{base_api_link}/{project}".format(base_api_link=base_api_link,
                                                           project=data_config['project'])

repository_name = "YOUR REPOSITORY NAME"
search_criteria = "searchCriteria.sourceRefName=refs/heads/{branch_name}&"

GET_TASKS_FROM_STORY = f"{base_api_project_link}/_apis/wit/workitems/" + "{story_id}?$expand=Relations&api-version=7.1-preview.3"
GET_PR_ID = f"{base_api_project_link}/_apis/git/repositories/" + "{repository_name}/pullrequests?api-version=7.1-preview.1".format(repository_name=repository_name)
GET_USER_ID = f"https://vssps.dev.azure.com/{data_config['organization']}/_apis/identities?searchFilter=General&filterValue="+"{user_name}&api-version=7.1-preview.1"
GET_MY_USER = f"{base_api_link}/_apis/connectionData?api-version=7.1-preview.1"
GET_PRs_BY_USER = f"{base_api_project_link}/_apis/git/repositories/"+"{repository_name}/pullrequests?searchCriteria.creatorId=".format(repository_name=repository_name)+"{user_id}&searchCriteria.status=active&api-version=7.1"

WORK_ITEM_INFO = f"{base_api_project_link}/_apis/wit/workItems/"+"{work_item_id}?api-version=7.1-preview.3"
USER_INFO_BY_NAME = f"https://vsaex.dev.azure.com/{data_config['organization']}/_apis/userentitlements?$filter=name+eq+%27" + "{user_name}%27&api-version=7.1-preview.4"
USER_WORK_ITEMS = f"{base_api_project_link}/_apis/wit/wiql?api-version=7.1"