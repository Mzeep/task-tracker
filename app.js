// Task Tracker - plain JavaScript, no libraries.
// State is an array of { id, text, done }. It is saved to localStorage
// so tasks survive a page reload.

(function () {
  'use strict';

  var STORAGE_KEY = 'task-tracker.tasks';
  var tasks = load();
  var filter = 'all';

  var form = document.getElementById('task-form');
  var input = document.getElementById('task-input');
  var errorEl = document.getElementById('task-error');
  var listEl = document.getElementById('task-list');
  var summaryEl = document.getElementById('summary');
  var clearBtn = document.getElementById('clear-done');
  var filterButtons = document.querySelectorAll('.filters button');

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      // Storage can be blocked (private mode) or hold bad data. Start empty.
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      // Ignore: the app still works for this visit.
    }
  }

  function visibleTasks() {
    return tasks.filter(function (t) {
      if (filter === 'active') { return !t.done; }
      if (filter === 'done') { return t.done; }
      return true;
    });
  }

  function render() {
    listEl.textContent = '';
    var shown = visibleTasks();

    if (shown.length === 0) {
      var empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = tasks.length === 0 ? 'No tasks yet. Add your first one above.' : 'Nothing in this view.';
      listEl.appendChild(empty);
    }

    shown.forEach(function (task) {
      var li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' done' : '');
      li.dataset.id = task.id;

      var box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = task.done;
      box.id = 'task-' + task.id;

      var label = document.createElement('label');
      label.className = 'text';
      label.htmlFor = box.id;
      label.textContent = task.text; // textContent avoids injecting HTML

      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'delete';
      del.textContent = 'Delete';
      del.setAttribute('aria-label', 'Delete task: ' + task.text);

      li.appendChild(box);
      li.appendChild(label);
      li.appendChild(del);
      listEl.appendChild(li);
    });

    var remaining = tasks.filter(function (t) { return !t.done; }).length;
    summaryEl.textContent = remaining + (remaining === 1 ? ' task left' : ' tasks left');
    clearBtn.disabled = !tasks.some(function (t) { return t.done; });

    filterButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.filter === filter));
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var text = input.value.trim();

    if (!text) {
      errorEl.textContent = 'Type a task before adding it.';
      input.focus();
      return;
    }
    var duplicate = tasks.some(function (t) { return t.text.toLowerCase() === text.toLowerCase() && !t.done; });
    if (duplicate) {
      errorEl.textContent = 'That task is already on your list.';
      input.focus();
      return;
    }

    errorEl.textContent = '';
    tasks.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text: text, done: false });
    input.value = '';
    save();
    render();
    input.focus();
  });

  // One listener on the list handles every checkbox and delete button.
  listEl.addEventListener('click', function (event) {
    var item = event.target.closest('.task-item');
    if (!item) { return; }
    var id = item.dataset.id;

    if (event.target.matches('.delete')) {
      tasks = tasks.filter(function (t) { return t.id !== id; });
      save();
      render();
    }
  });

  listEl.addEventListener('change', function (event) {
    var item = event.target.closest('.task-item');
    if (!item || !event.target.matches('input[type="checkbox"]')) { return; }
    tasks.forEach(function (t) {
      if (t.id === item.dataset.id) { t.done = event.target.checked; }
    });
    save();
    render();
  });

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filter = btn.dataset.filter;
      render();
    });
  });

  clearBtn.addEventListener('click', function () {
    tasks = tasks.filter(function (t) { return !t.done; });
    save();
    render();
  });

  render();
})();
