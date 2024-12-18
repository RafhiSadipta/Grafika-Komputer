"use strict";

function setupMouseEvents(canvas, rotationXRef, rotationYRef) {
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    canvas.addEventListener("mousedown", (event) => {
        isDragging = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    });

    canvas.addEventListener("mousemove", (event) => {
        if (isDragging) {
            const deltaX = event.clientX - lastMouseX;
            const deltaY = event.clientY - lastMouseY;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;

            // Sesuaikan sensitivitas rotasi
            const sensitivity = 0.01;
            rotationXRef.value += deltaY * sensitivity;
            rotationYRef.value += deltaX * sensitivity;

            // Batasi rotasi X untuk mencegah inversi kamera
            rotationXRef.value = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationXRef.value));
        }
    });

    canvas.addEventListener("mouseup", () => {
        isDragging = false;
    });

    canvas.addEventListener("mouseout", () => {
        isDragging = false;
    });
}

