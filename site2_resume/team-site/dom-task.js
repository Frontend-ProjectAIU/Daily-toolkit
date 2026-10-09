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

// 3-тапсырма: строка и столбец выбираются отдельно через заголовки.
{
  const form = document.getElementById("table-settings");
  const container = document.getElementById("table-container");
  const status = document.getElementById("table-status");
  let selectedHeader = null;

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
    const head = document.createElement("thead");
    const headingRow = document.createElement("tr");
    const corner = document.createElement("th");
    corner.scope = "col";
    corner.textContent = "№";
    headingRow.appendChild(corner);
    for (let column = 0; column < columns; column++) {
      const th = document.createElement("th");
      th.scope = "col";
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `Столбец ${column + 1}`;
      button.dataset.select = "column";
      button.dataset.index = column;
      button.setAttribute("aria-pressed", "false");
      th.appendChild(button);
      headingRow.appendChild(th);
    }
    head.appendChild(headingRow);
    table.appendChild(head);
    const body = document.createElement("tbody");
    for (let row = 0; row < rows; row++) {
      const tr = document.createElement("tr");
      const rowHeading = document.createElement("th");
      rowHeading.scope = "row";
      const rowButton = document.createElement("button");
      rowButton.type = "button";
      rowButton.textContent = `Строка ${row + 1}`;
      rowButton.dataset.select = "row";
      rowButton.dataset.index = row;
      rowButton.setAttribute("aria-pressed", "false");
      rowHeading.appendChild(rowButton);
      tr.appendChild(rowHeading);
      for (let column = 0; column < columns; column++) {
        const td = document.createElement("td");
        td.textContent = `${row + 1} : ${column + 1}`;
        tr.appendChild(td);
      }
      body.appendChild(tr);
    }
    table.appendChild(body);
    container.replaceChildren(table);
    selectedHeader = null;
    status.textContent = `Создана таблица: ${rows} строк × ${columns} столбцов.`;
  });

  container.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-select][data-index]");
    if (!button || !container.contains(button)) return;
    const table = container.querySelector("table");
    const sameHeader = selectedHeader === button;
    table.querySelectorAll(".is-selected-row, .is-selected-column").forEach((cell) => {
      cell.classList.remove("is-selected-row", "is-selected-column");
    });
    if (selectedHeader) selectedHeader.setAttribute("aria-pressed", "false");
    selectedHeader = sameHeader ? null : button;
    if (selectedHeader) {
      const index = Number(button.dataset.index);
      if (button.dataset.select === "row") {
        [...table.tBodies[0].rows[index].cells].forEach((cell) => cell.classList.add("is-selected-row"));
        status.textContent = `Выделена только строка ${index + 1}.`;
      } else {
        table.tHead.rows[0].cells[index + 1].classList.add("is-selected-column");
        [...table.tBodies[0].rows].forEach((row) => row.cells[index + 1].classList.add("is-selected-column"));
        status.textContent = `Выделен только столбец ${index + 1}.`;
      }
      button.setAttribute("aria-pressed", "true");
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
