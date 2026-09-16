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
const SPORTS_KEY = 'agenda_sports_v1'; 

let currentSportId = null;
let currentRoutineId = null; 
let currentExerciseId = null; 

let dataStore = {
    todo: JSON.parse(localStorage.getItem(KEYS.todo)) || [
        { id: Date.now(), text: "Estudar conceitos de C", completed: false }
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

let sportsStore = JSON.parse(localStorage.getItem(SPORTS_KEY)) || [];

function saveData(type) {
    localStorage.setItem(KEYS[type], JSON.stringify(dataStore[type]));
}

function saveSports() {
    localStorage.setItem(SPORTS_KEY, JSON.stringify(sportsStore));
}

// --- Listas Padrão (Todo e Shop) ---
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
        deleteBtn.onclick = () => deleteItem(type, item.id);

        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);
        listElement.appendChild(li);
    });

    if (type === 'todo') renderTodoSummary();
}

function renderTodoSummary() {
    const summaryList = document.getElementById('todo-summary-list');
    summaryList.innerHTML = '';

    const pendingTodos = dataStore.todo.filter(item => !item.completed);

    if (pendingTodos.length === 0) {
        summaryList.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin: 10px 0;">Nenhuma tarefa pendente! 🎉</p>';
        return;
    }

    pendingTodos.forEach(item => {
        const li = document.createElement('li');
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('task-content');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = false;
        checkbox.onchange = () => toggleItem('todo', item.id);

        const span = document.createElement('span');
        span.textContent = item.text;

        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(span);
        li.appendChild(contentDiv);
        summaryList.appendChild(li);
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

// --- Funções dos Esportes ---
function renderSports() {
    const grid = document.getElementById('sports-grid');
    grid.innerHTML = '';

    if (sportsStore.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-muted); text-align: center; width: 100%; grid-column: 1 / -1;">Nenhuma modalidade cadastrada. Clique no botão acima para criar o seu primeiro esporte!</p>';
        return;
    }

    sportsStore.forEach(sport => {
        const card = document.createElement('div');
        card.classList.add('sport-card');
        card.onclick = () => openSportDetails(sport.id);

        const delBtn = document.createElement('button');
        delBtn.innerHTML = '✖';
        delBtn.classList.add('delete-event-btn');
        delBtn.style.position = 'absolute';
        delBtn.style.top = '10px';
        delBtn.style.right = '10px';
        delBtn.onclick = (e) => {
            e.stopPropagation(); 
            deleteSport(sport.id);
        };

        const emojiSpan = document.createElement('div');
        emojiSpan.style.fontSize = '3rem';
        emojiSpan.textContent = sport.emoji;

        const titleSpan = document.createElement('div');
        titleSpan.style.fontWeight = 'bold';
        titleSpan.style.marginTop = '10px';
        titleSpan.textContent = sport.name;

        card.appendChild(delBtn);
        card.appendChild(emojiSpan);
        card.appendChild(titleSpan);
        grid.appendChild(card);
    });
}

function openSportModal() {
    document.getElementById('new-sport-modal').classList.remove('hidden');
    document.getElementById('new-sport-name').value = '';
    document.getElementById('new-sport-emoji').selectedIndex = 0;
}

function closeSportModal() {
    document.getElementById('new-sport-modal').classList.add('hidden');
}

function saveNewSport() {
    const nameInput = document.getElementById('new-sport-name').value.trim();
    const emojiValue = document.getElementById('new-sport-emoji').value;

    if (nameInput === '') return alert('Por favor, digite o nome!');

    sportsStore.push({
        id: 'sport_' + Date.now(),
        name: nameInput,
        emoji: emojiValue,
        routines: [] 
    });

    saveSports();
    renderSports();
    closeSportModal();
}

function deleteSport(id) {
    if(confirm("Tem certeza que deseja excluir esta modalidade?")) {
        sportsStore = sportsStore.filter(s => s.id !== id);
        saveSports();
        renderSports();
    }
}

// --- Funções da Tela 5: Lista de Treinos ---
function openSportDetails(id) {
    currentSportId = id;
    const sport = sportsStore.find(s => s.id === id);
    document.getElementById('sport-details-title').textContent = `${sport.emoji} ${sport.name}`;
    
    if (!sport.routines) sport.routines = [];

    openView('sport-details-view');
    renderSportRoutines();
}

function renderSportRoutines() {
    if (!currentSportId) return;
    
    const sport = sportsStore.find(s => s.id === currentSportId);
    const listElement = document.getElementById('sport-routine-list');
    listElement.innerHTML = '';

    if (sport.routines.length === 0) {
        listElement.innerHTML = '<li style="justify-content: center; color: var(--text-muted);">Nenhuma anotação ainda.</li>';
        return;
    }

    sport.routines.forEach(item => {
        const li = document.createElement('li');
        if (item.completed) li.classList.add('completed');

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('task-content');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.completed;
        checkbox.onchange = () => toggleSportRoutine(item.id);

        const span = document.createElement('span');
        span.innerHTML = `${item.text} <span style="color: var(--text-muted); font-size: 0.9rem;">➔</span>`; 
        span.onclick = () => openRoutineDetails(item.id);

        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(span);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '✖';
        deleteBtn.onclick = () => deleteSportRoutine(item.id);

        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);
        listElement.appendChild(li);
    });
}

function addSportRoutine() {
    if (!currentSportId) return;
    const inputElement = document.getElementById('sport-routine-input');
    const text = inputElement.value.trim();
    if (text === '') return;

    const sport = sportsStore.find(s => s.id === currentSportId);
    sport.routines.push({ id: Date.now(), text: text, completed: false, exercises: [] });

    inputElement.value = ''; 
    saveSports();
    renderSportRoutines();
}

function toggleSportRoutine(routineId) {
    const sport = sportsStore.find(s => s.id === currentSportId);
    const item = sport.routines.find(r => r.id === routineId);
    if (item) {
        item.completed = !item.completed;
        saveSports();
        renderSportRoutines();
    }
}

function deleteSportRoutine(routineId) {
    const sport = sportsStore.find(s => s.id === currentSportId);
    sport.routines = sport.routines.filter(r => r.id !== routineId);
    saveSports();
    renderSportRoutines();
}

function handleSportRoutineKeyPress(event) {
    if (event.key === 'Enter') addSportRoutine();
}

// --- Funções da Tela 6 (Lista de Exercícios) ---
function openRoutineDetails(routineId) {
    currentRoutineId = routineId;
    const sport = sportsStore.find(s => s.id === currentSportId);
    const routine = sport.routines.find(r => r.id === routineId);
    
    document.getElementById('routine-details-title').textContent = `📝 ${routine.text}`;
    
    if (!routine.exercises) routine.exercises = [];

    openView('routine-details-view');
    renderRoutineExercises();
}

function renderRoutineExercises() {
    if (!currentSportId || !currentRoutineId) return;
    
    const sport = sportsStore.find(s => s.id === currentSportId);
    const routine = sport.routines.find(r => r.id === currentRoutineId);
    const listElement = document.getElementById('routine-exercise-list');
    listElement.innerHTML = '';

    if (routine.exercises.length === 0) {
        listElement.innerHTML = '<li style="justify-content: center; color: var(--text-muted);">Nenhum exercício cadastrado.</li>';
        return;
    }

    routine.exercises.forEach(ex => {
        const li = document.createElement('li');
        if (ex.completed) li.classList.add('completed');

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('task-content');
        contentDiv.style.alignItems = 'flex-start'; 
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = ex.completed;
        checkbox.style.marginTop = '4px'; 
        checkbox.onchange = () => toggleRoutineExercise(ex.id);

        const textContainer = document.createElement('div');
        textContainer.style.display = 'flex';
        textContainer.style.flexDirection = 'column';
        textContainer.style.gap = '5px';
        textContainer.style.cursor = 'pointer';
        textContainer.onclick = () => openExerciseDetails(ex.id);

        const nameSpan = document.createElement('span');
        nameSpan.style.fontWeight = 'bold';
        nameSpan.innerHTML = `${ex.name || ex.text} <span style="color: var(--text-muted); font-size: 0.9rem;">➔</span>`; 
        textContainer.appendChild(nameSpan);

        // Renderiza as Etiquetas (Séries, Peso da última série, e Obs)
        if ((ex.sets && ex.sets.length > 0) || ex.obs) {
            const tagsDiv = document.createElement('div');
            tagsDiv.style.display = 'flex';
            tagsDiv.style.flexWrap = 'wrap';
            tagsDiv.style.gap = '8px';
            tagsDiv.style.fontSize = '0.8rem';
            
            if (ex.sets && ex.sets.length > 0) {
                const repTag = document.createElement('span');
                repTag.style.background = 'var(--bg-color)';
                repTag.style.padding = '2px 6px';
                repTag.style.borderRadius = '4px';
                repTag.style.border = '1px solid var(--border-color)';
                repTag.style.color = 'var(--text-muted)';
                repTag.textContent = `🔄 ${ex.sets.length} Séries`;
                tagsDiv.appendChild(repTag);

                // Tenta achar a carga da última série preenchida pra mostrar de preview
                const validWeights = ex.sets.map(s => s.weight).filter(w => w && w.trim() !== '');
                if (validWeights.length > 0) {
                    const weightTag = document.createElement('span');
                    weightTag.style.background = 'var(--bg-color)';
                    weightTag.style.padding = '2px 6px';
                    weightTag.style.borderRadius = '4px';
                    weightTag.style.border = '1px solid var(--border-color)';
                    weightTag.style.color = 'var(--accent-blue)';
                    weightTag.textContent = `⚖️ ${validWeights[validWeights.length - 1]}`;
                    tagsDiv.appendChild(weightTag);
                }
            }
            
            if (ex.obs) {
                const obsTag = document.createElement('span');
                obsTag.style.background = 'rgba(16, 185, 129, 0.15)'; 
                obsTag.style.padding = '2px 6px';
                obsTag.style.borderRadius = '4px';
                obsTag.style.border = '1px solid var(--accent-green)';
                obsTag.style.color = 'var(--accent-green)';
                obsTag.textContent = `📝 ${ex.obs}`;
                tagsDiv.appendChild(obsTag);
            }
            textContainer.appendChild(tagsDiv);
        }

        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(textContainer);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '✖';
        deleteBtn.style.alignSelf = 'flex-start';
        deleteBtn.onclick = () => deleteRoutineExercise(ex.id);

        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);
        listElement.appendChild(li);
    });
}

function addRoutineExercise() {
    const nameInput = document.getElementById('exercise-name');
    const name = nameInput.value.trim();
    if (name === '') return;

    const sport = sportsStore.find(s => s.id === currentSportId);
    const routine = sport.routines.find(r => r.id === currentRoutineId);

    routine.exercises.push({
        id: Date.now(),
        name: name,
        obs: "",
        sets: [], // Inicia sempre com ZERO séries!
        completed: false
    });

    nameInput.value = '';
    saveSports();
    renderRoutineExercises();
}

function toggleRoutineExercise(exId) {
    const sport = sportsStore.find(s => s.id === currentSportId);
    const routine = sport.routines.find(r => r.id === currentRoutineId);
    const ex = routine.exercises.find(e => e.id === exId);
    if (ex) {
        ex.completed = !ex.completed;
        saveSports();
        renderRoutineExercises();
    }
}

function deleteRoutineExercise(exId) {
    const sport = sportsStore.find(s => s.id === currentSportId);
    const routine = sport.routines.find(r => r.id === currentRoutineId);
    routine.exercises = routine.exercises.filter(e => e.id !== exId);
    saveSports();
    renderRoutineExercises();
}

function handleExerciseKeyPress(event) {
    if (event.key === 'Enter') addRoutineExercise();
}

// --- NOVO: Funções da Tela 7 (Lista Individual de Séries) ---
function openExerciseDetails(exId) {
    currentExerciseId = exId;
    const sport = sportsStore.find(s => s.id === currentSportId);
    const routine = sport.routines.find(r => r.id === currentRoutineId);
    const ex = routine.exercises.find(e => e.id === exId);
    
    document.getElementById('exercise-details-title').textContent = `⚙️ ${ex.name || ex.text}`;
    document.getElementById('edit-ex-obs').value = ex.obs || "";

    // Retrocompatibilidade se tiver criado exercícios na versão passada
    if (!ex.sets) ex.sets = []; 

    openView('exercise-details-view');
    renderExerciseSets();
}

function renderExerciseSets() {
    const sport = sportsStore.find(s => s.id === currentSportId);
    const routine = sport.routines.find(r => r.id === currentRoutineId);
    const ex = routine.exercises.find(e => e.id === currentExerciseId);
    
    const container = document.getElementById('exercise-sets-container');
    container.innerHTML = '';

    if (ex.sets.length === 0) {
        container.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; margin-top: 10px;">Nenhuma série adicionada.</p>';
        return;
    }

    ex.sets.forEach((set, index) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '10px';
        row.style.alignItems = 'center';

        const badge = document.createElement('span');
        badge.textContent = `${index + 1}ª`;
        badge.style.fontWeight = 'bold';
        badge.style.color = 'var(--accent-blue)';
        badge.style.width = '25px';

        const repsInput = document.createElement('input');
        repsInput.type = 'text';
        repsInput.className = 'form-control';
        repsInput.placeholder = 'Reps (Ex: 10)';
        repsInput.value = set.reps || '';
        // Salva silenciosamente enquanto digita
        repsInput.oninput = (e) => set.reps = e.target.value;

        const weightInput = document.createElement('input');
        weightInput.type = 'text';
        weightInput.className = 'form-control';
        weightInput.placeholder = 'Carga (Ex: 20kg)';
        weightInput.value = set.weight || '';
        // Salva silenciosamente enquanto digita
        weightInput.oninput = (e) => set.weight = e.target.value;

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.innerHTML = '✖';
        delBtn.onclick = () => {
            ex.sets = ex.sets.filter(s => s.id !== set.id);
            saveSports();
            renderExerciseSets();
        };

        row.appendChild(badge);
        row.appendChild(repsInput);
        row.appendChild(weightInput);
        row.appendChild(delBtn);

        container.appendChild(row);
    });
}

function addExerciseSet() {
    const sport = sportsStore.find(s => s.id === currentSportId);
    const routine = sport.routines.find(r => r.id === currentRoutineId);
    const ex = routine.exercises.find(e => e.id === currentExerciseId);
    
    // UX: Copia os dados da última série para poupar digitação do usuário
    let lastReps = "";
    let lastWeight = "";
    if (ex.sets.length > 0) {
        lastReps = ex.sets[ex.sets.length - 1].reps;
        lastWeight = ex.sets[ex.sets.length - 1].weight;
    }

    ex.sets.push({
        id: Date.now(),
        reps: lastReps,
        weight: lastWeight
    });

    saveSports();
    renderExerciseSets();
}

function saveExerciseDetails() {
    const sport = sportsStore.find(s => s.id === currentSportId);
    const routine = sport.routines.find(r => r.id === currentRoutineId);
    const ex = routine.exercises.find(e => e.id === currentExerciseId);
    
    ex.obs = document.getElementById('edit-ex-obs').value.trim();

    // As séries já foram salvas pelos eventos "oninput", aqui a gente só garante a gravação final.
    saveSports();
    
    // Volta para a Tela 6 com tudo atualizado
    openRoutineDetails(currentRoutineId);
}

// --- Lógicas Gerais (Dropdowns, Grade) ---
function toggleDayDropdown() {
    document.getElementById('day-dropdown-list').classList.toggle('show');
}

function updateSelectedDaysText() {
    const checkboxes = document.querySelectorAll('input[name="event-day"]:checked');
    const textElement = document.getElementById('selected-days-text');
    if (checkboxes.length === 0) textElement.textContent = '📅 Dias'; 
    else if (checkboxes.length === 1) {
        const dayMap = { segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta', quinta: 'Quinta', sexta: 'Sexta', sabado: 'Sábado', domingo: 'Domingo' };
        textElement.textContent = `📅 ${dayMap[checkboxes[0].value]}`;
    } else textElement.textContent = `📅 ${checkboxes.length} dias selecionados`;
}

function toggleClassDropdown() {
    document.getElementById('class-dropdown-list').classList.toggle('show');
}

function renderClassesDropdown() {
    const list = document.getElementById('class-dropdown-list');
    list.innerHTML = ''; 

    const colorMap = { '#ef4444': '🔴', '#f59e0b': '🟠', '#eab308': '🟡', '#10b981': '🟢', '#3b82f6': '🔵', '#8b5cf6': '🟣', '#8b4513': '🟤', '#9e9e9e': '⚪', '#1f2937': '⚫' };

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
            delBtn.onclick = (e) => { e.stopPropagation(); deleteClass(c.id); };
            item.appendChild(delBtn);
        }
        list.appendChild(item);
    });

    const newBtn = document.createElement('div');
    newBtn.classList.add('dropdown-item');
    newBtn.style.fontWeight = 'bold';
    newBtn.style.color = '#3b82f6';
    newBtn.textContent = '➕ Nova Categoria...';
    newBtn.onclick = () => { toggleClassDropdown(); openClassModal(); };
    list.appendChild(newBtn);
    
    const currentSelectedId = document.getElementById('event-class-id').value;
    const currentClass = classesStore.find(c => c.id === currentSelectedId) || classesStore[0];
    document.getElementById('selected-class-text').textContent = `${currentClass.name} (${colorMap[currentClass.color] || '🎨'})`;
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
        if (document.getElementById('event-class-id').value === id) document.getElementById('event-class-id').value = 'default';
        renderClassesDropdown();
        renderSchedule(); 
    }
}

document.addEventListener('click', function(event) {
    const daySelect = document.getElementById('day-multi-select');
    if (daySelect && !daySelect.contains(event.target)) document.getElementById('day-dropdown-list').classList.remove('show');
    const classSelect = document.getElementById('class-custom-select');
    if (classSelect && !classSelect.contains(event.target)) document.getElementById('class-dropdown-list').classList.remove('show');
});

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

    if (nameInput === '') return alert('Por favor, digite um nome para a categoria!');

    const newClass = { id: 'class_' + Date.now(), name: `${emojiValue} ${nameInput}`, color: colorValue };
    classesStore.push(newClass);
    localStorage.setItem(CLASSES_KEY, JSON.stringify(classesStore));
    document.getElementById('event-class-id').value = newClass.id;
    renderClassesDropdown();
    closeClassModal(); 
}

function saveSchedule() {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(scheduleStore));
}

function renderSchedule() {
    const gridContainer = document.getElementById('schedule-grid');
    gridContainer.innerHTML = '';
    const daysMap = [ { key: 'segunda', label: 'Segunda' }, { key: 'terca', label: 'Terça' }, { key: 'quarta', label: 'Quarta' }, { key: 'quinta', label: 'Quinta' }, { key: 'sexta', label: 'Sexta' }, { key: 'sabado', label: 'Sábado' }, { key: 'domingo', label: 'Domingo' } ];
    const todayKey = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][new Date().getDay()];

    daysMap.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.classList.add('day-card');
        if (day.key === todayKey) dayCard.classList.add('current-day');

        const dayTitle = document.createElement('div');
        dayTitle.classList.add('day-title');
        dayTitle.textContent = day.key === todayKey ? `${day.label} (Hoje)` : day.label;
        dayCard.appendChild(dayTitle);

        const dayEvents = scheduleStore[day.key] || [];
        dayEvents.sort((a, b) => a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0);

        dayEvents.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event'); 
            if (event.mode === 'variavel') eventDiv.classList.add('variavel');
            
            const myClass = classesStore.find(c => c.id === event.classId);
            if (myClass) eventDiv.style.borderLeftColor = myClass.color;
            
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
    const startTime = document.getElementById('event-start-time').value;
    const endTime = document.getElementById('event-end-time').value;
    const text = document.getElementById('event-name').value.trim();
    const classId = document.getElementById('event-class-id').value; 
    const mode = document.getElementById('event-mode').value; 
    const dayCheckboxes = document.querySelectorAll('input[name="event-day"]:checked');

    if (startTime === '' || endTime === '') return alert('Por favor, selecione os horários de início e fim!');
    if (startTime >= endTime) return alert('O horário de fim deve ser depois do horário de início!');
    if (text === '') return alert('Por favor, digite o nome do evento!');
    if (dayCheckboxes.length === 0) return alert('Por favor, selecione pelo menos um dia da semana!');

    dayCheckboxes.forEach(checkbox => {
        const dayKey = checkbox.value;
        if (!scheduleStore[dayKey]) scheduleStore[dayKey] = [];
        scheduleStore[dayKey].push({ id: Date.now() + Math.random(), startTime: startTime, endTime: endTime, text: text, classId: classId, mode: mode });
    });

    document.getElementById('event-start-time').value = '';
    document.getElementById('event-end-time').value = '';
    document.getElementById('event-name').value = '';
    dayCheckboxes.forEach(cb => cb.checked = false); 
    
    document.getElementById('event-class-id').value = classesStore[0].id; 
    renderClassesDropdown();
    document.getElementById('event-mode').value = 'fixo'; 
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
            if (scheduleStore[day].length !== originalLength) hasChanges = true;
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
    renderSports(); 
    renderClassesDropdown(); 
    renderSchedule();
});