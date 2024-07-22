document.addEventListener('DOMContentLoaded', (event) => {
    displayHistory();
});

document.getElementById('saveButton').addEventListener('click', function() {
    const text = document.getElementById('notepad').value.trim();
    const alertContainer = document.getElementById('alertContainer');

    // Clear previous alerts
    alertContainer.innerHTML = '';

    if (text === '') {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger';
        alertDiv.role = 'alert';
        alertDiv.innerText = 'Text area cannot be empty. Please enter some text.';
        alertContainer.appendChild(alertDiv);
    } else {
        fetch('/api/save', {  // Updated the endpoint to /api/save
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text }),
        })
        .then(response => response.json())
        .then(data => {
            const linkContainer = document.getElementById('linkContainer');
            linkContainer.innerHTML = `<p><a href="${data.url}" target="_blank" class="text-blue-500 hover:text-blue-700">${data.url}</a></p>`;
            saveToHistory(data.url);
            displayHistory();
        });
    }
});

function saveToHistory(url) {
    let history = getCookie('history');
    history = history ? JSON.parse(history) : [];
    const timestamp = new Date().toLocaleString(); // Get the current date and time
    history.push({ url: url, timestamp: timestamp });
    setCookie('history', JSON.stringify(history), 365);
}

function displayHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    let history = getCookie('history');
    history = history ? JSON.parse(history) : [];
    history.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'p-2 bg-gray-100 rounded shadow-md hover:bg-gray-200 transition';
        listItem.innerHTML = `
            <a href="${item.url}" target="_blank" class="bg-blue-500 text-white hover:bg-blue-700 py-1 px-3 rounded">${item.url}</a>
            <span class="text-gray-500 ml-2">${item.timestamp}</span>
        `;
        historyList.appendChild(listItem);
    });
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
