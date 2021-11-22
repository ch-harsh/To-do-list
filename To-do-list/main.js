let addBtn = document.getElementById("addToDo-btn");
let listContainer = document.getElementById("list-container");
let input = document.getElementById("input");

addBtn.addEventListener("click", function () {
  var paragraph = document.createElement("p");
  paragraph.classList.add("paragraph-styling");
  paragraph.innerText = input.value;
  listContainer.appendChild(paragraph);
  input.value = "";
  paragraph.addEventListener("click", function () {
    paragraph.style.textDecoration = "line-through";
  });
  paragraph.addEventListener("dblclick", function () {
    listContainer.removeChild(paragraph);
  });
});
