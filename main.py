import requests
from API_links import GET_TASKS_FROM_STORY, HEADERS

story_id = "86474" #ID da Story/Bug/Spike/Technical Debt...

link_get = GET_TASKS_FROM_STORY.format(story_id=story_id)
story_data = requests.get(link_get, headers=HEADERS).json()

story_area_path = story_data['fields']['System.AreaPath']
story_iteration_path = story_data['fields']['System.IterationPath']

tasks_data = story_data["relations"]
tasks_links = [task['url']  for task in tasks_data]
tasks = [requests.get(link, headers=HEADERS).json() for link in tasks_links]
tasks = [task for task in tasks if task['fields']['System.WorkItemType'] == 'Task']

def update_task(task, area_path, iteration_path):
    task_url = task["url"]
    if "api-version" not in task_url:
        task_url += "?api-version=7.1-preview.3"

    update_payload = [
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
    ]

    HEADERS.update({
        "Content-Type": "application/json-patch+json"  # ← Obrigatório para PATCH
    })

    response = requests.patch(
        task_url,
        headers=HEADERS,
        json=update_payload
    )

    print("Status Code:", response.status_code)
    print("Response:", response.json())

def update_all_tasks():
    for task in tasks:
        update_task(task, story_area_path, story_iteration_path)

if __name__ == "__main__":
    update_all_tasks()