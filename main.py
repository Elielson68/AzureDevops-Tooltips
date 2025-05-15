import threading
from functools import wraps

import requests
from time import sleep
from API_links import GET_TASKS_FROM_STORY, HEADERS, USER_WORK_ITEMS, GET_USER_ID, GET_PRs_BY_USER, GET_MY_USER, \
    WORK_ITEM_INFO
from concurrent.futures import ThreadPoolExecutor

story_id = "86474"  #ID da Story/Bug/Spike/Technical Debt...

link_get = GET_TASKS_FROM_STORY.format(story_id=story_id)
story_data = requests.get(link_get, headers=HEADERS).json()

story_area_path = story_data['fields']['System.AreaPath']
story_iteration_path = story_data['fields']['System.IterationPath']

tasks_data = story_data["relations"]
tasks_links = [task['url'] for task in tasks_data]
tasks = [requests.get(link, headers=HEADERS).json() for link in tasks_links]
tasks = [task for task in tasks if task['fields']['System.WorkItemType'] == 'Task']


def log_print(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"[{func.__name__}] ", end="")
        return func(*args, **kwargs)

    return wrapper


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


def update_work_item_state(work_item_id, state):
    update_payload = [
        {
            "op": "replace",
            "path": "/fields/System.State",
            "value": state
        }
    ]

    HEADERS.update({
        "Content-Type": "application/json-patch+json"  # ← Obrigatório para PATCH
    })

    response = requests.patch(
        WORK_ITEM_INFO.format(work_item_id=work_item_id),
        headers=HEADERS,
        json=update_payload
    )

    print("Status Code:", response.status_code)
    print("Response:", response.json())


def update_all_tasks():
    for task in tasks:
        update_task(task, story_area_path, story_iteration_path)


def write_file(content, file_name="result.json"):
    with open(file_name, "w") as f:
        f.write(content)


def get_work_items_by_status(user_name, status="Aguardando PR"):
    query = {
        "query": f"SELECT [System.Id], [System.Title], [System.WorkItemType] FROM WorkItems WHERE [System.AssignedTo] = '{user_name}' AND [System.State] = '{status}' AND [System.WorkItemType] != 'Task' ORDER BY [System.ChangedDate] DESC"
    }
    result = requests.post(USER_WORK_ITEMS, json=query, headers=HEADERS)
    try:
        work_items_id = [data["id"] for data in result.json()['workItems']]
        return work_items_id
    except Exception as e:
        print(e)
        return []


def get_user_id(user_name="Elielson Barbosa"):
    id = requests.get(GET_USER_ID.format(user_name=user_name), headers=HEADERS).json()["value"][0]["id"]
    return id


def get_my_user_info():
    r = requests.get(GET_MY_USER, headers=HEADERS)
    return r.json()


def get_my_id():
    user_info = get_my_user_info()
    id = user_info["authenticatedUser"]["id"]
    return id


def get_pr_data_formatted(result_json):
    return {"title": result_json["title"], "id": result_json["pullRequestId"],
            "status": result_json["status"], "url": result_json["url"]}


def get_works_prs_by_user(user_name="Elielson Barbosa"):
    work_items = get_work_items_by_status(user_name)
    user_id = get_user_id(user_name)
    link_pr_by_user = GET_PRs_BY_USER.format(user_id=user_id)
    pr_by_user_data = requests.get(link_pr_by_user, headers=HEADERS)
    try:
        result = pr_by_user_data.json()
    except:
        result = {"value": []}
    write_file(pr_by_user_data.text)
    prs_data = [get_pr_data_formatted(pr_data) for pr_data in result["value"]]

    works_items_with_prs = {
        work_item_id: {
            pr["title"]: pr for pr in prs_data if str(work_item_id) in pr["title"]
        } for work_item_id in work_items
    }

    return works_items_with_prs


def get_pr_url_from_pr_data(pr_data):
    work_item_id = list(pr_data.keys())[0]
    pr_title = list(pr_data[work_item_id].keys())[0]

    return pr_data[work_item_id][pr_title]["url"]


def update_pr_data():
    for work_item_id in pr_data_global:
        for pr_title in pr_data_global[work_item_id]:
            try:
                pr_data_updated = requests.get(pr_data_global[work_item_id][pr_title]["url"], headers=HEADERS).json()
                pr_data_global[work_item_id][pr_title].update(get_pr_data_formatted(pr_data_updated))
            except:
                print("Deu erro ao tentar buscar dados do PR para atualizar")


@log_print
def update_pr_data_thread():
    print("Iniciou a thread")
    while True:
        global pr_data_global
        pr_data_global.update(get_works_prs_by_user())
        update_pr_data()
        print(f"Atualizou os dados dos PRs:\n{pr_data_global}")
        sleep(5)


@log_print
def update_work_item_thread():
    print("Iniciou a thread")
    while True:
        for work_item_id in pr_data_global:
            for pr_title in pr_data_global[work_item_id]:
                if pr_data_global[work_item_id][pr_title]["status"] == "completed":
                    print(f"PR '{pr_title}' concluído! tentando alterar a story {work_item_id} para homologação...")
                    update_work_item_state(work_item_id, "Homologação")
                    print(f"Story {work_item_id} alterado para homologação com sucesso!")
                    print(f"Removendo key do objeto...")
                    del pr_data_global[work_item_id]
                    print(f"Key removida do objeto!")
                    #Executar alteração da story aqui
        sleep(5)


pr_data_global = {}

if __name__ == "__main__":

    thread1 = threading.Thread(target=update_pr_data_thread, daemon=True)
    thread2 = threading.Thread(target=update_work_item_thread, daemon=True)

    thread1.start()
    thread2.start()

    while True:
        sleep(1)
