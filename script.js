// Chaves para o LocalStorage
const KEYS = {
    todo: 'agenda_todos',
    shop: 'agenda_shopping'
};

// Estado inicial da aplicação
let dataStore = {
    todo: JSON.parse(localStorage.getItem(KEYS.todo)) || [
        { id: Date.now(), text: "Sessão de musculação", completed: false },
        { id: Date.now()+1, text: "Avançar no projeto em Java", completed: false }
    ],
    shop: JSON.parse(localStorage.getItem(KEYS.shop)) || [
        { id: Date.now()+2, text: "Esparadrapo para o dedo", completed: false },
        { id: Date.now()+3, text: "Whey Protein", completed: false }
    ]
};

// Salva os dados no navegador
function saveData(type) {
    localStorage.setItem(KEYS[type], JSON.stringify(dataStore[type]));
}

// Renderiza as listas na interface
function renderList(type) {
    const listElement = document.getElementById(`${type}-list`);
    listElement.innerHTML = ''; // Limpa a lista atual

    dataStore[type].forEach(item => {
        const li = document.createElement('li');
        if (item.completed) li.classList.add('completed');

        // Div de conteúdo (Checkbox + Texto)
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('task-content');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.completed;
        checkbox.onchange = () => toggleItem(type, item.id);

        const span = document.createElement('span');
        span.textContent = item.text;

        // Permite clicar no texto para marcar o checkbox
        span.onclick = () => toggleItem(type, item.id);

        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(span);

        // Botão de deletar
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '✖';
        deleteBtn.title = "Excluir";
        deleteBtn.onclick = () => deleteItem(type, item.id);

        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);
        listElement.appendChild(li);
    });
}

// Adiciona um novo item
function addItem(type) {
    const inputElement = document.getElementById(`${type}-input`);
    const text = inputElement.value.trim();

    if (text === '') return;

    const newItem = {
        id: Date.now(),
        text: text,
        completed: false
    };

    dataStore[type].push(newItem);
    inputElement.value = ''; // Limpa o input
    saveData(type);
    renderList(type);
}

// Alterna entre concluído/pendente
function toggleItem(type, id) {
    const item = dataStore[type].find(i => i.id === id);
    if (item) {
        item.completed = !item.completed;
        saveData(type);
        renderList(type);
    }
}

// Remove um item da lista
function deleteItem(type, id) {
    dataStore[type] = dataStore[type].filter(i => i.id !== id);
    saveData(type);
    renderList(type);
}

// Permite adicionar com a tecla "Enter"
function handleKeyPress(event, type) {
    if (event.key === 'Enter') {
        addItem(type);
    }
}

// Inicializa as listas ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Se for o primeiro acesso, forçamos um salvamento dos itens padrão sugeridos
    if (!localStorage.getItem(KEYS.todo)) saveData('todo');
    if (!localStorage.getItem(KEYS.shop)) saveData('shop');
    
    renderList('todo');
    renderList('shop');
});