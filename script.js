const helpText = document.getElementById("helpText");
const helpButtons = document.querySelectorAll(".help-box button");
const resetPlan = document.getElementById("resetPlan");
const checkboxes = document.querySelectorAll(".check-row input");

helpButtons.forEach((button) => {
  button.addEventListener("click", () => {
    helpText.textContent = button.dataset.text;
  });
});

resetPlan.addEventListener("click", () => {
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
});
