"use strict";

function injectLevel() {
    setTimeout(() => {
        cancelAnimationFrame(rAFIdx);

        const levelCode = prompt("Enter level code");

        if (levelCode) {
            loadMap(levelCode.trim());
            reset();
            init();
        }
    }, 1000);
}

window.addEventListener("load", injectLevel, false);