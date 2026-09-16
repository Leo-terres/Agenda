// Lógica de Navegação entre Telas
function openView(viewId) {
    const views = document.querySelectorAll('.view-section');
    views.forEach(view => {
        view.classList.add('hidden');
    });
    document.getElementById(viewId).classList.remove('hidden');
}

const KEYS = {
    todo: 'agenda_todos',
    shop: 'agenda_shopping'
};

const SCHEDULE_KEY = 'agenda_schedule_v6'; 
const CLASSES_KEY = 'agenda_classes'; 
const WEEK_KEY = 'agenda_week_marker'; 

let dataStore = {
    todo: JSON.parse(localStorage.getItem(KEYS.todo)) || [
        { id: Date.now(), text: "Sessão de musculação", completed: false }
    ],
    shop: JSON.parse(localStorage.getItem(KEYS.shop)) || [
        { id: Date.now()+1, text: "Whey Protein", completed: false }
    ]
};

let scheduleStore = JSON.parse(localStorage.getItem(SCHEDULE_KEY)) || {
    segunda: [], terca: [], quarta: [], quinta: [], sexta: [], sabado: [], domingo: []
};

let classesStore = JSON.parse(localStorage.getItem(CLASSES_KEY)) || [
    { id: 'default', name: '📌 Padrão', color: '#9e9e9e' }
];

// --- Funções de Tarefas e Compras ---
function saveData(type) {
    localStorage.setItem(KEYS[type], JSON.stringify(dataStore[type]));
}

function renderList(type) {
    const listElement = document.getElementById(`${type}-list`);
    listElement.innerHTML = ''; 

    dataStore[type].forEach(item => {
        const li = document.createElement('li');
        if (item.completed) li.classList.add('completed');

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('task-content');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.completed;
        checkbox.onchange = () => toggleItem(type, item.id);

        const span = document.createElement('span');
        span.textContent = item.text;
        span.onclick = () => toggleItem(type, item.id);

        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(span);

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

function addItem(type) {
    const inputElement = document.getElementById(`${type}-input`);
    const text = inputElement.value.trim();
    if (text === '') return;
    const newItem = { id: Date.now(), text: text, completed: false };
    dataStore[type].push(newItem);
    inputElement.value = ''; 
    saveData(type);
    renderList(type);
}

function toggleItem(type, id) {
    const item = dataStore[type].find(i => i.id === id);
    if (item) {
        item.completed = !item.completed;
        saveData(type);
        renderList(type);
    }
}

function deleteItem(type, id) {
    dataStore[type] = dataStore[type].filter(i => i.id !== id);
    saveData(type);
    renderList(type);
}

function handleKeyPress(event, type) {
    if (event.key === 'Enter') addItem(type);
}

// --- Lógicas dos Dropdowns Customizados (Dias e Classes) ---

function toggleDayDropdown() {
    document.getElementById('day-dropdown-list').classList.toggle('show');
}

function updateSelectedDaysText() {
    const checkboxes = document.querySelectorAll('input[name="event-day"]:checked');
    const textElement = document.getElementById('selected-days-text');
    
    if (checkboxes.length === 0) {
        textElement.textContent = '📅 Dias'; 
    } else if (checkboxes.length === 1) {
        const dayMap = {
            segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta',
            quinta: 'Quinta', sexta: 'Sexta', sabado: 'Sábado', domingo: 'Domingo'
        };
        textElement.textContent = `📅 ${dayMap[checkboxes[0].value]}`;
    } else {
        textElement.textContent = `📅 ${checkboxes.length} dias selecionados`;
    }
}

function toggleClassDropdown() {
    document.getElementById('class-dropdown-list').classList.toggle('show');
}

function renderClassesDropdown() {
    const list = document.getElementById('class-dropdown-list');
    list.innerHTML = ''; 

    // Rosa e Ciano removidos
    const colorMap = {
        '#ef4444': '🔴', '#f59e0b': '🟠', '#eab308': '🟡',
        '#10b981': '🟢', '#3b82f6': '🔵',
        '#8b5cf6': '🟣', '#8b4513': '🟤', '#9e9e9e': '⚪', '#1f2937': '⚫'
    };

    classesStore.forEach(c => {
        const item = document.createElement('div');
        item.classList.add('dropdown-item');
        
        const colorIndicator = colorMap[c.color] || '🎨';
        
        const textSpan = document.createElement('span');
        textSpan.textContent = `${c.name} (${colorIndicator})`;
        textSpan.style.flex = "1";
        textSpan.onclick = () => selectClass(c.id, textSpan.textContent);

        item.appendChild(textSpan);

        if (c.id !== 'default') {
            const delBtn = document.createElement('button');
            delBtn.innerHTML = '✖';
            delBtn.classList.add('delete-class-btn');
            delBtn.title = "Apagar categoria";
            delBtn.onclick = (e) => {
                e.stopPropagation(); 
                deleteClass(c.id);
            };
            item.appendChild(delBtn);
        }

        list.appendChild(item);
    });

    const newBtn = document.createElement('div');
    newBtn.classList.add('dropdown-item');
    newBtn.style.fontWeight = 'bold';
    newBtn.style.color = '#3b82f6';
    newBtn.textContent = '➕ Nova Categoria...';
    newBtn.onclick = () => {
        toggleClassDropdown();
        openClassModal();
    };
    list.appendChild(newBtn);
    
    const currentSelectedId = document.getElementById('event-class-id').value;
    const currentClass = classesStore.find(c => c.id === currentSelectedId) || classesStore[0];
    const ind = colorMap[currentClass.color] || '🎨';
    document.getElementById('selected-class-text').textContent = `${currentClass.name} (${ind})`;
}

function selectClass(id, text) {
    document.getElementById('event-class-id').value = id;
    document.getElementById('selected-class-text').textContent = text;
    toggleClassDropdown();
}

function deleteClass(id) {
    if(confirm("Tem certeza que deseja excluir esta categoria?")) {
        classesStore = classesStore.filter(c => c.id !== id);
        localStorage.setItem(CLASSES_KEY, JSON.stringify(classesStore));
        
        if (document.getElementById('event-class-id').value === id) {
            document.getElementById('event-class-id').value = 'default';
        }
        
        renderClassesDropdown();
        renderSchedule(); 
    }
}

document.addEventListener('click', function(event) {
    const daySelect = document.getElementById('day-multi-select');
    if (daySelect && !daySelect.contains(event.target)) {
        document.getElementById('day-dropdown-list').classList.remove('show');
    }

    const classSelect = document.getElementById('class-custom-select');
    if (classSelect && !classSelect.contains(event.target)) {
        document.getElementById('class-dropdown-list').classList.remove('show');
    }
});


// --- Lógica do Modal ---
function openClassModal() {
    document.getElementById('new-class-modal').classList.remove('hidden');
    document.getElementById('new-class-name').value = '';
    document.getElementById('new-class-emoji').selectedIndex = 0;
    document.getElementById('new-class-color').selectedIndex = 0;
}

function closeClassModal() {
    document.getElementById('new-class-modal').classList.add('hidden');
}

function saveNewClass() {
    const nameInput = document.getElementById('new-class-name').value.trim();
    const emojiValue = document.getElementById('new-class-emoji').value;
    const colorValue = document.getElementById('new-class-color').value;

    if (nameInput === '') {
        alert('Por favor, digite um nome para a categoria!');
        return;
    }

    const newClass = {
        id: 'class_' + Date.now(),
        name: `${emojiValue} ${nameInput}`, 
        color: colorValue 
    };

    classesStore.push(newClass);
    localStorage.setItem(CLASSES_KEY, JSON.stringify(classesStore));
    
    document.getElementById('event-class-id').value = newClass.id;
    renderClassesDropdown();
    
    closeClassModal(); 
}

// --- Funções da Grade de Horários ---
function saveSchedule() {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(scheduleStore));
}

function renderSchedule() {
    const gridContainer = document.getElementById('schedule-grid');
    gridContainer.innerHTML = '';

    const daysMap = [
        { key: 'segunda', label: 'Segunda' },
        { key: 'terca', label: 'Terça' },
        { key: 'quarta', label: 'Quarta' },
        { key: 'quinta', label: 'Quinta' },
        { key: 'sexta', label: 'Sexta' },
        { key: 'sabado', label: 'Sábado' },
        { key: 'domingo', label: 'Domingo' }
    ];

    const currentDayIndex = new Date().getDay();
    const jsDayToOurKey = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const todayKey = jsDayToOurKey[currentDayIndex];

    daysMap.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.classList.add('day-card');
        
        if (day.key === todayKey) dayCard.classList.add('current-day');

        const dayTitle = document.createElement('div');
        dayTitle.classList.add('day-title');
        
        if (day.key === todayKey) {
            dayTitle.textContent = `${day.label} (Hoje)`;
        } else {
            dayTitle.textContent = day.label;
        }
        
        dayCard.appendChild(dayTitle);

        const dayEvents = scheduleStore[day.key] || [];

        dayEvents.sort((a, b) => {
            if (a.startTime < b.startTime) return -1;
            if (a.startTime > b.startTime) return 1;
            return 0;
        });

        dayEvents.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event'); 
            
            if (event.mode === 'variavel') {
                eventDiv.classList.add('variavel');
            }
            
            const myClass = classesStore.find(c => c.id === event.classId);
            if (myClass) {
                eventDiv.style.borderLeftColor = myClass.color;
            }
            
            const spanText = document.createElement('span');
            spanText.textContent = `${event.startTime} às ${event.endTime} - ${event.text}`;
            eventDiv.appendChild(spanText);

            const deleteEventBtn = document.createElement('button');
            deleteEventBtn.innerHTML = '✖';
            deleteEventBtn.classList.add('delete-event-btn');
            deleteEventBtn.onclick = () => removeScheduleItem(day.key, event.id);
            
            eventDiv.appendChild(deleteEventBtn);
            dayCard.appendChild(eventDiv);
        });

        gridContainer.appendChild(dayCard);
    });
}

function removeScheduleItem(dayKey, eventId) {
    scheduleStore[dayKey] = scheduleStore[dayKey].filter(event => event.id !== eventId);
    saveSchedule();
    renderSchedule();
}

function addScheduleEvent() {
    const startTimeInput = document.getElementById('event-start-time');
    const endTimeInput = document.getElementById('event-end-time');
    const nameInput = document.getElementById('event-name');
    const classId = document.getElementById('event-class-id').value; 
    const modeSelect = document.getElementById('event-mode'); 
    const dayCheckboxes = document.querySelectorAll('input[name="event-day"]:checked');

    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const text = nameInput.value.trim();
    const mode = modeSelect.value;

    if (startTime === '' || endTime === '') {
        alert('Por favor, selecione os horários de início e fim!');
        return;
    }
    if (startTime >= endTime) {
        alert('O horário de fim deve ser depois do horário de início!');
        return;
    }
    if (text === '') {
        alert('Por favor, digite o nome do evento!');
        return;
    }
    if (dayCheckboxes.length === 0) {
        alert('Por favor, selecione pelo menos um dia da semana!');
        return;
    }

    dayCheckboxes.forEach(checkbox => {
        const dayKey = checkbox.value;
        const newEvent = {
            id: Date.now() + Math.random(), 
            startTime: startTime,
            endTime: endTime,
            text: text,
            classId: classId, 
            mode: mode 
        };

        if (!scheduleStore[dayKey]) {
            scheduleStore[dayKey] = [];
        }

        scheduleStore[dayKey].push(newEvent);
    });

    startTimeInput.value = '';
    endTimeInput.value = '';
    nameInput.value = '';
    dayCheckboxes.forEach(cb => cb.checked = false); 
    
    document.getElementById('event-class-id').value = classesStore[0].id; 
    renderClassesDropdown();
    
    modeSelect.value = 'fixo'; 
    updateSelectedDaysText();
    
    saveSchedule();
    renderSchedule();
}

function checkAndResetWeekly() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    
    const mondayDate = new Date(now);
    mondayDate.setDate(now.getDate() - distanceToMonday);
    mondayDate.setHours(0, 0, 0, 0);
    
    const currentWeekStr = mondayDate.toISOString().split('T')[0]; 
    const savedWeek = localStorage.getItem(WEEK_KEY);

    if (savedWeek !== currentWeekStr) {
        let hasChanges = false;
        
        for (let day in scheduleStore) {
            const originalLength = scheduleStore[day].length;
            scheduleStore[day] = scheduleStore[day].filter(event => event.mode === 'fixo');
            
            if (scheduleStore[day].length !== originalLength) {
                hasChanges = true;
            }
        }

        if (hasChanges) {
            saveSchedule();
            alert("📅 Nova semana! Seus horários flexíveis da semana passada foram limpos.");
        }
        
        localStorage.setItem(WEEK_KEY, currentWeekStr);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem(KEYS.todo)) saveData('todo');
    if (!localStorage.getItem(KEYS.shop)) saveData('shop');
    if (!localStorage.getItem(SCHEDULE_KEY)) saveSchedule();
    
    checkAndResetWeekly(); 
    
    renderList('todo');
    renderList('shop');
    
    renderClassesDropdown(); 
    renderSchedule();
});