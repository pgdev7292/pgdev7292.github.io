var backButton = document.getElementById("back_button");

backButton.addEventListener("click", (e) => {
    alert("nuh uh");
    alert("Now you don't get a button!");
    backButton.remove();
});