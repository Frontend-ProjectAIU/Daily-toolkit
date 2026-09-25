// 1-тапсырма: все изменения элементов запускаются действиями пользователя.
if (!document.getElementById("task-1").hidden) {
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

  document.getElementById("add-div").addEventListener("click", () => {
    if (!newDiv) {
      newDiv = document.createElement("div");
      newDiv.className = "new-div";
      newDiv.textContent = "Мен жаңа элементпін";
      document.body.appendChild(newDiv);
      removeDivButton.disabled = false;
      newDivStatus.textContent = "Новый div добавлен в конец body ↓";
    }
    newDiv.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  removeDivButton.addEventListener("click", () => {
    newDiv?.remove();
    newDiv = null;
    removeDivButton.disabled = true;
    newDivStatus.textContent = "Новый div удалён. Его можно добавить снова.";
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
if (!document.getElementById("task-2").hidden) {
  const classTarget = document.getElementById("class-target");
  const classListOutput = document.getElementById("class-list");
  const toggleButton = document.getElementById("toggle-active");

  function printClasses() {
    const classes = [...classTarget.classList];
    console.log("Элемент кластары:", classes);
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
