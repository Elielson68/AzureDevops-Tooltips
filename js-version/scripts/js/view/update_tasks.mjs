export function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('storyId').disabled = true;
}

export function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('storyId').disabled = false;
}

export function getInputStoryIdValue() {
    return document.getElementById('storyId').value;
}

export function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = type;
    statusDiv.style.display = 'block';

    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

export function addEventListenerToUpdateButton(event) {
    document.getElementById('update').addEventListener('click', event);
}
