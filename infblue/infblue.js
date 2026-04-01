mousepos = Vector2.zero;

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("mousemove", e => {
        mousepos = new Vector2(e.clientX, e.clientY);
    })

    fn = () => {
        e = document.querySelector(".card.card-drag-item");

        e.style.top = `${mousepos.y}px`;
        e.style.left = `${mousepos.x}px`;

        window.requestAnimationFrame(fn);
    }

    window.requestAnimationFrame(fn);
})