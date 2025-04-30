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
GET_TASKS_FROM_STORY = f"{base_api_project_link}/_apis/wit/workitems/" + "{story_id}?$expand=Relations&api-version=7.1-preview.3"

