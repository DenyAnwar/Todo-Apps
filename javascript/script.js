// select items
const btnSubmit = document.querySelector(".btn-submit");
const titleActivity = document.getElementById("title");
const deadlineActivity = document.getElementById("date");

const todos = [];
const RENDER_EVENT = 'render-todo';
const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APS';

// edit option
let editElement;
let editFlag = false;
let editID = "";

function generateId() {
  return +new Date();
}

function generateTodoObject(id, task, timestamp, isCompleted) {
  return {
    id,
    task,
    timestamp,
    isCompleted,
  }
}

function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }

  return null;
}

function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }

  return -1;
}

/**
 * This function is used to check if local storage
 * supported by web browser or not
 *
 * @returns boolean
 */
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser is not supporting the local storage');
    return false;
  }

  return true;
}

/**
 * This function is used to save data to local storage
 * based on the predefined KEY
 */
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed); // STORAGE_KEY = 'TODO_APS'; 
    document.dispatchEvent(new Event(SAVED_EVENT)); // SAVED_EVENT = 'saved-todo';
  }
}

function getLocalStorage() {
  return localStorage.getItem(STORAGE_KEY)
    ? JSON.parse(localStorage.getItem(STORAGE_KEY))
    : [];
}

function setBackToDefault() {
  editFlag = false;
  editID = "";
  titleActivity.value = "";
  deadlineActivity.value = "";
  btnSubmit.value = "Submit";
}

function editData(id, value) {
  let items = getLocalStorage();

  items = items.filter(function (item) {
    if (item.id === id) {
      item.task =  value.task;
      item.timestamp = value.timestamp;
    }

    return item;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  document.dispatchEvent(new Event(SAVED_EVENT));
}

/**
 * This function is used to load data from local storage
 * and inserting the parsed data into variable @todos
 */
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeTodo(todoObject) {
  const {id, task, timestamp, isCompleted} = todoObject;

  const textTitle = document.createElement('h2');
  textTitle.innerText = task;

  const textTimestamp = document.createElement('p');
  textTimestamp.innerText = timestamp;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textTimestamp);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `todo-${id}`);

  if (isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.addEventListener('click', function () {
      undoTaskFromCompleted(id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.addEventListener('click', function () {
      removeTaskFromCompleted(id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.addEventListener('click', function () {
      addTaskToCompleted(id);
    });

    const editButton = document.createElement('button');
    editButton.classList.add('edit-button');
    editButton.addEventListener('click', function () {
      editTask(id);
    });

    container.append(editButton, checkButton);
  }

  return container;
}

function addTodo() {
  if (!editFlag) {
    const textTodo = document.getElementById('title').value;
    const timestamp = document.getElementById('date').value;

    const generatedID = generateId();
    const todoObject = generateTodoObject(generatedID, textTodo, timestamp, false);
    todos.push(todoObject);

    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
    showSaveNotification();
  } else if (editFlag) {
    const textTodo = document.getElementById('title').value;
    const timestamp = document.getElementById('date').value;

    const generatedID = editID;
    const todoObject = generateTodoObject(generatedID, textTodo, timestamp, false);

    // replace data in array with a new one (data after edited), if id is duplicate
    for (const index in todos) {
      if (todos[index].id === todoObject.id) {
        todos.splice(index, 1, todoObject);
      }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));

    editData(generatedID, todoObject);
    showSaveNotification();
    setBackToDefault();
  }
}

function addTaskToCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  showCompleteNotification();
}

function editTask(todoId) {
  const getData = findTodo(todoId);
  const showTitleActivity = getData.task;
  const showDeadlineActivity = getData.timestamp;
  // set from value
  titleActivity.value = showTitleActivity;
  deadlineActivity.value = showDeadlineActivity;
  editFlag = true;
  editID = getData.id;
  btnSubmit.value = "Edit";
}

function removeTaskFromCompleted(todoId) {
  const todoTarget = findTodoIndex(todoId);

  if (todoTarget === -1) return;

  todos.splice(todoTarget, 1);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  showDeleteNotification();
}

function undoTaskFromCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  showUndoNotification();
}

function showSaveNotification() {
  // Get the snackbar DIV
  const snackbarDiv = document.getElementById("snackbar-save");

  // Add the "show" class to DIV
  snackbarDiv.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    snackbarDiv.className = snackbarDiv.className.replace("show", "");
  }, 3000);
}

function showDeleteNotification() {
  // Get the snackbar DIV
  const snackbarDiv = document.getElementById("snackbar-delete");

  // Add the "show" class to DIV
  snackbarDiv.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    snackbarDiv.className = snackbarDiv.className.replace("show", "");
  }, 3000);
}

function showCompleteNotification() {
  // Get the snackbar DIV
  const snackbarDiv = document.getElementById("snackbar-complete");

  // Add the "show" class to DIV
  snackbarDiv.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    snackbarDiv.className = snackbarDiv.className.replace("show", "");
  }, 3000);
}

function showUndoNotification() {
  // Get the snackbar DIV
  const snackbarDiv = document.getElementById("snackbar-undo");

  // Add the "show" class to DIV
  snackbarDiv.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    snackbarDiv.className = snackbarDiv.className.replace("show", "");
  }, 3000);
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('form');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addTodo();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedTODOList = document.getElementById('todos');
  uncompletedTODOList.innerHTML = '';

  const completedTODOList = document.getElementById('completed-todos');
  completedTODOList.innerHTML = '';

  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);
    if (!todoItem.isCompleted) {
      uncompletedTODOList.append(todoElement);
    } else {
      completedTODOList.append(todoElement);
    }
  }
});

