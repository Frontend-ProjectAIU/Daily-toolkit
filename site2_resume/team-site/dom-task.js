// Демонстрация запускается только на экране заданий.
if (!document.getElementById("dom-demo").hidden) {
  // 1-тапсырма: DOM элементтерін өзгерту, қосу және жою.
  document.getElementById("greeting").textContent = "Сәлем, әлем!";

  const newDiv = document.createElement("div");
  newDiv.className = "new-div";
  newDiv.textContent = "Мен жаңа элементпін";
  document.body.appendChild(newDiv);

  document.querySelector(".old-element").remove();
  document.getElementById("removed-status").textContent = "✓ Элемент .old-element удалён со страницы";

  const changeableParagraph = document.createElement("p");
  changeableParagraph.textContent = "Бұл ауыспалы абзац";
  changeableParagraph.className = "changeable-paragraph";
  changeableParagraph.tabIndex = 0;
  changeableParagraph.setAttribute("role", "button");
  document.getElementById("changeable-paragraph").appendChild(changeableParagraph);

  function changeParagraphStyle() {
    const changed = changeableParagraph.style.color !== "";
    changeableParagraph.style.color = changed ? "" : "#fff";
    changeableParagraph.style.fontSize = changed ? "" : "1.6rem";
    changeableParagraph.style.backgroundColor = changed ? "" : "#3f5b49";
  }

  changeableParagraph.addEventListener("click", changeParagraphStyle);
  changeableParagraph.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      changeParagraphStyle();
    }
  });

  // 2-тапсырма: active класын ауыстырып, барлық кластарды көрсету.
  const classTarget = document.getElementById("class-target");
  const classListOutput = document.getElementById("class-list");

  function printClasses() {
    const classes = [...classTarget.classList];
    console.log("Элемент кластары:", classes);
    classListOutput.textContent = `Кластар: ${classes.join(", ") || "жоқ"}`;
    document.getElementById("toggle-active").textContent = classTarget.classList.contains("active")
      ? "Убрать класс active"
      : "Добавить класс active";
  }

  document.getElementById("toggle-active").addEventListener("click", () => {
    classTarget.classList.toggle("active");
    printClasses();
  });

  printClasses();
}
