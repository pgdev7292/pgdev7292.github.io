var backButton = document.getElementById("back_button");

var attempts = 0;

backButton.addEventListener("click", (e) => {
    if (attempts < 1) {
        alert("nuh uh");
        alert("I know it's you, Orangelizard107")
        alert("Now, you don't get a back button!");
        backButton.textContent = "Click Me!";
    } else {
        alert("You don't quit, do ya?");
        alert("I guess you don't want to have anything, Orangelizard107.")
        document.body.innerHTML = "";
    }

    attempts++;
});