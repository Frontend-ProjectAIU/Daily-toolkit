// 1-тапсырма: обработчики готовы, даже когда вкладка скрыта.
{
  const greeting = document.getElementById("greeting");
  const greetingButton = document.getElementById("change-greeting");

  greetingButton.addEventListener("click", () => {
    const shown = greeting.textContent === "Сәлем, әлем!";
    greeting.textContent = shown ? "Здесь появится новый текст." : "Сәлем, әлем!";
    greetingButton.textContent = shown ? "Показать «Сәлем, әлем!»" : "Вернуть исходный текст";
  });

  let newDiv = null;
  const removeDivButton = document.getElementById("remove-div");
  const newDivStatus = document.getElementById("new-div-status");
  const newDivContainer = document.getElementById("new-div-container");

  document.getElementById("add-div").addEventListener("click", () => {
    if (!newDiv) {
      newDiv = document.createElement("div");
      newDiv.className = "new-div";
      newDiv.textContent = "Мен жаңа элементпін";
      newDivContainer.appendChild(newDiv);
      removeDivButton.disabled = false;
      newDivStatus.textContent = "Новый текст добавлен:";
      console.log("Добавлен новый текст: Мен жаңа элементпін");
    }
  });

  removeDivButton.addEventListener("click", () => {
    newDiv?.remove();
    newDiv = null;
    removeDivButton.disabled = true;
    newDivStatus.textContent = "Новый div удалён. Его можно добавить снова.";
    console.log("Новый текст удалён");
  });

  document.getElementById("remove-old").addEventListener("click", (event) => {
    document.querySelector(".old-element").remove();
    event.currentTarget.disabled = true;
    document.getElementById("removed-status").textContent = "✓ Элемент .old-element удалён со страницы";
  });

  document.getElementById("create-paragraph").addEventListener("click", (event) => {
    const container = document.getElementById("changeable-paragraph");
    if (container.firstElementChild) {
      container.firstElementChild.remove();
      event.currentTarget.textContent = "Создать абзац";
      return;
    }

    const paragraph = document.createElement("p");
    paragraph.textContent = "Бұл ауыспалы абзац";
    paragraph.className = "changeable-paragraph";
    paragraph.tabIndex = 0;
    paragraph.setAttribute("role", "button");

    function changeStyle() {
      const changed = paragraph.style.color !== "";
      paragraph.style.color = changed ? "" : "#fff";
      paragraph.style.fontSize = changed ? "" : "1.6rem";
      paragraph.style.backgroundColor = changed ? "" : "#3f5b49";
    }

    paragraph.addEventListener("click", changeStyle);
    paragraph.addEventListener("keydown", (keyEvent) => {
      if (keyEvent.key === "Enter" || keyEvent.key === " ") {
        keyEvent.preventDefault();
        changeStyle();
      }
    });

    container.appendChild(paragraph);
    event.currentTarget.textContent = "Удалить абзац";
  });
}

// 2-тапсырма: переключение active и вывод всех классов.
{
  const classTarget = document.getElementById("class-target");
  const classListOutput = document.getElementById("class-list");
  const toggleButton = document.getElementById("toggle-active");

  function printClasses() {
    const classes = [...classTarget.classList];
    console.log(`Элемент кластары: ${classes.join(", ") || "жоқ"}`);
    classListOutput.textContent = `Кластар: ${classes.join(", ") || "жоқ"}`;
    toggleButton.textContent = classTarget.classList.contains("active")
      ? "Убрать класс active"
      : "Добавить класс active";
  }

  toggleButton.addEventListener("click", () => {
    classTarget.classList.toggle("active");
    printClasses();
  });

  printClasses();
}

// 3-тапсырма: таблица с переключаемым выделением строки и столбца.
{
  const form = document.getElementById("table-settings");
  const container = document.getElementById("table-container");
  const status = document.getElementById("table-status");
  let selectedCell = null;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const rows = Number(document.getElementById("table-rows").value);
    const columns = Number(document.getElementById("table-columns").value);
    if (!Number.isInteger(rows) || !Number.isInteger(columns) || rows < 1 || columns < 1 || rows > 20 || columns > 20) {
      status.textContent = "Введите целые числа от 1 до 20.";
      return;
    }

    const table = document.createElement("table");
    table.className = "interactive-table";
    table.setAttribute("aria-label", `Таблица: ${rows} строк, ${columns} столбцов`);
    const body = document.createElement("tbody");
    for (let row = 0; row < rows; row++) {
      const tr = document.createElement("tr");
      for (let column = 0; column < columns; column++) {
        const td = document.createElement("td");
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = `${row + 1} : ${column + 1}`;
        button.setAttribute("aria-label", `Строка ${row + 1}, столбец ${column + 1}`);
        button.setAttribute("aria-pressed", "false");
        button.dataset.row = row;
        button.dataset.column = column;
        td.appendChild(button);
        tr.appendChild(td);
      }
      body.appendChild(tr);
    }
    table.appendChild(body);
    container.replaceChildren(table);
    selectedCell = null;
    status.textContent = `Создана таблица: ${rows} строк × ${columns} столбцов.`;
  });

  container.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-row][data-column]");
    if (!button || !container.contains(button)) return;
    const table = container.querySelector("table");
    const sameCell = selectedCell === button;
    table.querySelectorAll(".is-selected-row, .is-selected-column").forEach((cell) => {
      cell.classList.remove("is-selected-row", "is-selected-column");
    });
    if (selectedCell) selectedCell.setAttribute("aria-pressed", "false");
    selectedCell = sameCell ? null : button;
    if (selectedCell) {
      const row = Number(button.dataset.row);
      const column = Number(button.dataset.column);
      [...table.rows[row].cells].forEach((cell) => cell.classList.add("is-selected-row"));
      [...table.rows].forEach((tableRow) => tableRow.cells[column].classList.add("is-selected-column"));
      button.setAttribute("aria-pressed", "true");
      status.textContent = `Выделены строка ${row + 1} и столбец ${column + 1}.`;
    } else {
      status.textContent = "Выделение снято.";
    }
  });
}

// 4-тапсырма: переключатель темы с сохранением выбора.
{
  const toggle = document.getElementById("theme-toggle");
  const status = document.getElementById("theme-status");
  function setTheme(dark) {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    toggle.checked = dark;
    status.textContent = dark ? "Сейчас включена тёмная тема." : "Сейчас включена светлая тема.";
    try { localStorage.setItem("team-theme", dark ? "dark" : "light"); } catch (_) {}
  }
  let savedTheme = "light";
  try { savedTheme = localStorage.getItem("team-theme") || "light"; } catch (_) {}
  setTheme(savedTheme === "dark");
  toggle.addEventListener("change", () => setTheme(toggle.checked));
}
