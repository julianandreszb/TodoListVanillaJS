class Todo {
    id = Date.now();
    text;

    constructor(text) {
        this.text = text;
    }
}

class Dialog {
    element;
    buttonCancel;
    buttonConfirm;

    constructor(elementId, cancelButtonId = null, confirmButtonId = null) {
        this.element = document.getElementById(elementId);

        if (cancelButtonId) {
            this.buttonCancel = this.element.querySelector(`#${cancelButtonId}`);
            this.buttonCancel.addEventListener('click', () => this.close());
        }
        if (confirmButtonId) {
            this.buttonConfirm = this.element.querySelector(`#${confirmButtonId}`);
        }
    }

    open() {
        this.element.classList.remove('invisible');
        this.element.classList.add('visible');
    }

    close() {
        this.element.classList.remove('visible')
        this.element.classList.add('invisible');
    }

}

class DialogEditTodo extends Dialog {
    inputEditTodoText;

    constructor(elementId, cancelButtonId = null, confirmButtonId = null) {
        super(elementId, cancelButtonId, confirmButtonId);
        this.inputEditTodoText = this.element.querySelector('input');
        this.buttonConfirm.addEventListener('click', () => this.saveEditTodoHandler());
    }

    close() {
        super.close();
        App.removeBlurDivTodoWorkingArea();
    }

    setInputEditTodoTextValue(text){
        this.inputEditTodoText.value = text;
    }

    saveEditTodoHandler() {
        const todoId = App.editTodoElement.getAttribute('todo-id');
        const todoIndex = App.todoList.todos.findIndex(object => object.id.toString() === todoId);

        App.todoList.todos[todoIndex].text = this.inputEditTodoText.value;
        App.editTodoElement.querySelector('span').textContent = App.getEditTodoElementTextDisplayed(this.inputEditTodoText.value);
        super.close();
        App.removeBlurDivTodoWorkingArea();
    }
}

class DialogConfirm extends Dialog {
    message;

    constructor(elementId, cancelButtonId = null, confirmButtonId = null, message) {
        super(elementId, cancelButtonId, confirmButtonId);
        this.message = message;
    }
}

class TodoList {

    todos = [];

    constructor() {
    }

    addTodo(todo) {
        this.todos.push(todo);
        App.todoFormHandler.clearInputTodoName();
        this.renderTodo(todo);
    }

    #editTodoHandler(todo) {
        App.editTodoElement = document.querySelector(`li[todo-id="${todo.id}"]`);

        App.blurDivTodoWorkingArea();
        App.dialogEditTodo.setInputEditTodoTextValue(todo.text);
        App.dialogEditTodo.open();
    }

    #deleteTodoHandler(todo) {
        const todoIndex = this.todos.findIndex(element => element.id.toString() === todo.id.toString());
        this.todos.splice(todoIndex, 1);
        document.querySelector(`li[todo-id="${todo.id}"]`).remove();

        App.todoFormHandler.refreshTotalTodosCounter();
        App.todoFormHandler.refreshTotalDoneTodosCounter();
        App.todoFormHandler.refreshTodoProgress();
    }

    #selectTodoHandler(event) {
        App.todoFormHandler.refreshTotalDoneTodosCounter();
        App.todoFormHandler.refreshTodoProgress();
    }

    #createTodoElement(todo) {
        const todoElement = document.createElement('li');
        const todoPartialText = App.getEditTodoElementTextDisplayed(todo.text);

        todoElement.setAttribute('todo-id', todo.id);
        todoElement.className = 'odd:bg-white even:bg-slate-100 flex flex-row justify-between';
        todoElement.innerHTML = `<div>
                                    <input type="checkbox" title="">&nbsp;<span>${todoPartialText}</span>
                                </div>
                                <div>
                                    <button class="bg-sky-400 w-16 text-white">Edit</button>
                                    <button class="bg-red-400 w-16 text-white">Delete</button>
                                </div>`;

        const checkboxTodoElement = todoElement.querySelector('input');
        checkboxTodoElement.addEventListener('click', (event) => this.#selectTodoHandler(event));

        const editButton = todoElement.querySelector('button');
        editButton.addEventListener('click', () => this.#editTodoHandler(todo));

        const deleteButton = todoElement.querySelector('button:last-child');
        deleteButton.addEventListener('click', () => this.#deleteTodoHandler(todo));

        return todoElement;
    }

    renderTodo(todo) {

        const ulTodoList = document.getElementById('ulTodoList');

        const todoElement = this.#createTodoElement(todo);
        ulTodoList.appendChild(todoElement);

    }

}

class TodoFormHandler {
    #inputTodoName;
    #buttonAddTodo;

    constructor() {
        this.#init();
    }

    clearInputTodoName() {
        this.#inputTodoName.value = '';
    }

    getTotalTodosCount() {
        return Object.keys(App.todoList.todos).length;
    }

    getTotalDoneTodosCount(){
        return document.querySelectorAll('input[type="checkbox"]:checked').length;
    }

    refreshTodoProgress() {
        const totalTodos = this.getTotalTodosCount();
        const totalDoneTodos = this.getTotalDoneTodosCount();

        let todoProgressPercent = 0;

        if (totalTodos && totalDoneTodos) {
            todoProgressPercent = (100 / totalTodos) * totalDoneTodos;
        }

        App.divTodoProgress.style.width = `${todoProgressPercent}%`;

    }

    refreshTotalTodosCounter(){
        App.totalTodosElement.textContent = this.getTotalTodosCount();
    }

    refreshTotalDoneTodosCounter() {
        App.totalDoneTodosElement.textContent = this.getTotalDoneTodosCount();
    }

    #addTodoHandler() {
        const todoText = this.#inputTodoName.value;
        App.todoList.addTodo(new Todo(todoText));
        this.refreshTotalTodosCounter();
        this.refreshTodoProgress();
    }

    removeCheckedTodosHandler(){
        const todosChecked = document.querySelectorAll('input[type="checkbox"]:checked');

        for (const todoCheckedElement of todosChecked) {
            todoCheckedElement.checked = false;
        }

        this.refreshTotalDoneTodosCounter();
        this.refreshTodoProgress();

    }


    #init() {
        this.#inputTodoName = document.getElementById('inputTodoName');

        this.#buttonAddTodo = document.getElementById('buttonAddTodo');
        this.#buttonAddTodo.addEventListener('click', () => this.#addTodoHandler());

        App.buttonRemoveTodosChecked.addEventListener('click', () => this.removeCheckedTodosHandler());
    }

}

class App {
    static todoFormHandler;
    static todoList;
    static dialogEditTodo;
    static todoWorkingArea;
    static totalDoneTodosElement;
    static totalTodosElement
    static editTodoElement;
    static divTodoProgress;
    static buttonRemoveTodosChecked;

    constructor() {

    }

    static blurDivTodoWorkingArea() {
        this.todoWorkingArea.classList.add('blur-lg')
    }

    static removeBlurDivTodoWorkingArea() {
        this.todoWorkingArea.classList.remove('blur-lg')
    }

    static getEditTodoElementTextDisplayed(textContent) {
        return textContent.length > 30 ? `${textContent.substring(0, 30)}...` : textContent;
    }

    static init() {
        this.todoWorkingArea = document.getElementById('divTodoWorkingArea');
        this.totalDoneTodosElement = document.getElementById('totalDoneTodos');
        this.totalTodosElement = document.getElementById('totalTodos');
        this.divTodoProgress = document.getElementById('divTodoProgress');
        this.buttonRemoveTodosChecked = document.getElementById('buttonRemoveTodosChecked');
        this.todoFormHandler = new TodoFormHandler();
        this.todoList = new TodoList();
        this.dialogEditTodo = new DialogEditTodo(
            'divEditTodo',
            'buttonCancelDialogEditTodo',
            'buttonConfirmDialogEditTodo'
        );

    }
}

App.init();
