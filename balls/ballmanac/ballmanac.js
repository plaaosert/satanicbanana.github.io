/**
 * 
 * @param {HTMLElement} elem
 * @param {typeof WeaponBall} ball_proto 
 */
function update_ball_info_view(elem, ball_proto) {
    /** @type {WeaponBall} */
    let ball = create_testball(ball_proto);

    console.log(`../img/icons/${ball.name.toLowerCase()}.png`);
    elem.querySelector(".ball-image img").src = `../img/icons/${ball.name.toLowerCase()}.png`;
    elem.querySelector(".ball-image img").addEventListener("error", e => {
        e.target.src = `../img/icons/unknown.png`;
    });

    elem.querySelector(".ball-name .name").textContent = ball.name;
    
    elem.querySelector(".ball-name .tier").textContent = ` ${TIERS_INFO[ball.tier].name} `;
    elem.querySelector(".ball-name .tier").style.color = TIERS_INFO[ball.tier].col.css();
    elem.querySelector(".ball-name .tier").style.backgroundColor = TIERS_INFO[ball.tier].col.lerp(Colour.black, 0.6).css();

    let parent = elem.querySelector(".ball-tags");
    parent.querySelectorAll("*:not(.template)").forEach(e => {
        parent.removeChild(e);
    });

    let template = parent.querySelector(".template");
    ball.tags.forEach(tag => {
        let c = template.cloneNode(true);

        c.textContent = ` ${TAGS_INFO[tag].name} `;
        c.classList.remove("template");

        parent.append(c);
    });

    set_with_glitch(elem.querySelector(".ball-lore-origin"), ball.lore_origin);
    set_with_glitch(elem.querySelector(".ball-lore-temperament"), ball.lore_temperament);
    set_with_glitch(elem.querySelector(".ball-lore-affiliation"), ball.lore_affiliation);

    set_with_glitch(elem.querySelector(".ball-lore-alignment"), ` ${materials2sprites[ball.lore_alignment][0]}`);

    elem.querySelector(".ball-lore-alignment-img").src = `../img/icons/${materials2sprites[ball.lore_alignment][1]}.png`;

    set_with_glitch(elem.querySelector(".ball-tagline span"), ball.tagline);

    set_with_glitch(elem.querySelector(".ball-game-desc .additional"), ball.description);
    set_with_glitch(elem.querySelector(".ball-game-desc .base"), " " + ball.description_brief);
    set_with_glitch(elem.querySelector(".ball-game-desc .levelup"), " " + ball.level_description);
    set_with_glitch(elem.querySelector(".ball-game-desc .awaken"), " " + ball.max_level_description);

    set_with_glitch(elem.querySelector(".ball-lore-desc span"), ball.lore_description);
    set_with_glitch(elem.querySelector(".ball-quote-desc span"), `"${ball.weapon_relationship}"`);
}

let rt = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890-=!\"£$%^&*()_+[];'#,./{}:@~<>?"
function set_with_glitch(elem, text) {
    if (!elem.getAttribute("glitchendtime")) {
        elem.setAttribute("glitchendtime", Date.now() + 1000 + (Math.random() * Math.random() * (3 * 1000)));
        elem.setAttribute("glitchstarttime", Date.now());
    }

    let glitch_end_time = Number.parseFloat(elem.getAttribute("glitchendtime"));
    let glitch_start_time = Number.parseFloat(elem.getAttribute("glitchstarttime"));
    let glitch_amount = (Date.now() - glitch_start_time) / (glitch_end_time - glitch_start_time);
    glitch_amount = Math.max(0, Math.min(1, 1 - glitch_amount));
    
    // this doesnt really work good
    // TODO make it work good
    glitch_amount = 0;

    let new_text = ""
    let tlen = Math.floor(text.length * (1 - Math.pow(glitch_amount, 1/2)));
    for (let i=0; i<tlen; i++) {
        let rand = Math.random();
        let c = text[i];
        rand += glitch_amount * (i / tlen);
        if (rand > 1.2) {
            // mutate to random char
            new_text += rt[Math.floor(Math.random() * rt.length)];
        }

        else if (rand > 1) {
            // jump to uppercase
            new_text += c.toUpperCase();
        }

        else {
            new_text += c;
        }
    }

    new_text = new_text.padEnd(text.length, "\u00A0 ");

    elem.textContent = new_text;
}

let index = 0;
document.addEventListener("DOMContentLoaded", () => {
    let e = document.querySelector(".infosection.info-ball");
    index = Number.parseInt(localStorage.getItem("ballmanac-index") ?? 0);

    document.addEventListener("keydown", evt => {
        if (evt.code == "KeyQ") {
            index--;
            update_ball_info_view(e, selectable_balls[index]);
        } else if (evt.code == "KeyE") {
            index++;
            update_ball_info_view(e, selectable_balls[index]);
        }

        localStorage.setItem("ballmanac-index", index);
    });

    fn = (() => {
        update_ball_info_view(e, selectable_balls[index]);
        window.requestAnimationFrame(fn);
    })

    fn();

    document.querySelectorAll(".panel").forEach(e => {
        e.classList.add("flickout");
        e.classList.remove("flickin");

        let st = 0 + Math.floor(Math.random() * 1000);

        let n = 2 + (Math.floor(Math.random() * Math.random() * 4) * 2);
        let t = 0;
        for (let i=0; i<n; i++) {
            let nt = st + t;
            setTimeout(() => {
                e.classList.add(i%2 == 0 ? "flickout" : "flickin");
                e.classList.remove(i%2 == 0 ? "flickin" : "flickout");
            }, nt);

            t += Math.floor(Math.random() * (250 - (i * 25)));
        }
    })

    update_ball_info_view(e, selectable_balls[index]);
})