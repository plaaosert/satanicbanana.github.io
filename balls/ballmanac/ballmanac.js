let current_category = "ball";
let current_index = 0;

function show_ball_info_view() {
    let ball_info_view_template = document.querySelector(".templates .infosection.info-ball");

    let clone = ball_info_view_template.cloneNode(true);
    document.querySelector(".content:not(.index)").innerHTML = "";
    document.querySelector(".content:not(.index)").append(clone);

    // clone.querySelectorAll(".panel").forEach(e => {
    //     e.classList.add("flickout");
    //     e.classList.remove("flickin");

    //     let st = 0 + Math.floor(Math.random() * 1000);

    //     let n = 2 + (Math.floor(Math.random() * Math.random() * 4) * 2);
    //     let t = 0;
    //     for (let i=0; i<n; i++) {
    //         let nt = st + t;
    //         setTimeout(() => {
    //             e.classList.add(i%2 == 0 ? "flickout" : "flickin");
    //             e.classList.remove(i%2 == 0 ? "flickin" : "flickout");
    //         }, nt);

    //         t += Math.floor(Math.random() * (250 - (i * 25)));
    //     }
    // })

    return clone;
}

function show_generic_info_view() {
    let generic_view_template = document.querySelector(".templates .infosection.info-generic");

    let clone = generic_view_template.cloneNode(true);
    document.querySelector(".content:not(.index)").innerHTML = "";
    document.querySelector(".content:not(.index)").append(clone);

    return clone;
}

/**
 * 
 * @param {HTMLElement} elem
 * @param {typeof WeaponBall} ball_proto 
 */
function update_ball_info_view(elem, ball_proto) {
    /** @type {WeaponBall} */
    let ball = create_testball(ball_proto);

    elem.style.setProperty("--col1", ball.default_colour.css());
    elem.style.setProperty("--col2", ball.default_colour.lerp(Colour.white, 0.5).css());
    elem.style.setProperty("--col3", ball.default_colour.lerp(Colour.black, 0.95).css());
    elem.style.setProperty("--col4", ball.default_colour.lerp(Colour.white, 0.85).css());

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

    set_with_glitch(elem.querySelector(".ball-category span"), ball.category);
    elem.querySelector(".ball-category").style.backgroundColor = CATEGORIES_INFO[ball.category].col.lerp(Colour.black, 0.9).css();
    elem.querySelector(".ball-category span").style.color = CATEGORIES_INFO[ball.category].col.css();

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

function findpage(text, forcecat="") {
    let tx = text.toLowerCase();

    let g_index = game_entries.findIndex(ge => ge.title.toLowerCase() == tx);
    let l_index = lore_entries.findIndex(le => le.title.toLowerCase() == tx);
    let b_index = selectable_balls.findIndex(b => b.ball_name.toLowerCase() == tx);

    switch (forcecat) {
        case "lore":
            g_index = -1;
            b_index = -1;
            break;

        case "game":
            l_index = -1;
            b_index = -1;
            break;

        case "ball":
            g_index = -1;
            l_index = -1;
    }

    let index = g_index == -1 ? (l_index == -1 ? b_index : l_index) : g_index;
    let cat = g_index == -1 ? (l_index == -1 ? "ball" : "lore") : "game";

    return [index, cat];
}

function openpage(text, forcecat="") {
    let res = findpage(text, forcecat);
    if (res[0] != -1) {
        ballmanac_open_category(res[1], res[0]);
    }
}

function update_generic_info_view(elem, entry) {
    elem.style.setProperty("--col1", entry.colour.css());
    elem.style.setProperty("--col2", entry.colour.lerp(Colour.white, 0.6).css());

    elem.querySelector(".title span").textContent = entry.title;

    elem.querySelector(".main-text span").innerHTML = entry.text;

    elem.querySelectorAll(".main-text span .link").forEach(e => {
        let tx = e.getAttribute("data-linkto")?.toLowerCase() ?? e.textContent.toLowerCase();
        let forcecat = e.getAttribute("data-cat");
        
        let res = findpage(tx, forcecat);

        let index = res[0]
        let cat = res[1];
        if (index == -1)
            return;

        let relevant_list = [];
        relevant_list = ballmanac_get_relevant_list(cat);

        if (cat == "ball") {
            e.style.color = create_testball(relevant_list[index]).default_colour.css();
        } else {
            e.style.color = relevant_list[index].colour.css();
        }

        e.addEventListener("click", e => {
            ballmanac_open_category(cat, index);
        });
    })
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

function setup_ballmanac_index() {
    let e = document.querySelector(".infosection.main-page");

    let ball_panel = e.querySelector(".ball-entry.template");

    Object.keys(CATEGORIES).forEach(c => {
        let e = [...document.querySelectorAll(".category")].filter(e => e.querySelector("span").textContent.includes(c))[0];
        
        if (!e)
            return;

        e.style.backgroundColor = CATEGORIES_INFO[c].col.lerp(Colour.black, 0.9).css();
        e.style.color = CATEGORIES_INFO[c].col.css();

        e.querySelector(".opt-list").innerHTML = "";
    })

    // get all balls, split by category
    selectable_balls.forEach((b, i) => {
        let ball = create_testball(b);

        let clone = ball_panel.cloneNode(true);
        clone.classList.remove("template");
        clone.querySelector("span").textContent = b.ball_name;
        clone.querySelector("img").src = 

        clone.querySelector("img").src = `../img/icons/${ball.name.toLowerCase()}.png`;
        clone.querySelector("img").addEventListener("error", e => {
            e.target.src = `../img/icons/unknown.png`;
        });

        clone.style.setProperty("--col1", ball.default_colour.css());
        clone.style.setProperty("--col2", ball.default_colour.lerp(Colour.white, 0.5).css());
        clone.style.setProperty("--col3", ball.default_colour.lerp(Colour.black, 0.95).css());
        clone.style.setProperty("--col4", ball.default_colour.lerp(Colour.white, 0.85).css());

        clone.addEventListener("click", e => {
            ballmanac_open_category("ball", i);
        })

        let c2 = ball.category.replace(/\d/, "");
        let ball_area = [...document.querySelectorAll(".category")].filter(e => e.querySelector("span").textContent.includes(c2))[0].querySelector(".opt-list");

        ball_area.append(clone);
    })

    let gamelist = e.querySelector(".index-game-list.opt-list");
    let lorelist = e.querySelector(".index-lore-list.opt-list");

    let gamepanel = gamelist.querySelector(".template");
    let lorepanel = lorelist.querySelector(".template");

    // then all info items, split by category
    game_entries.forEach((entry, i) => {
        let clone = gamepanel.cloneNode(true);

        clone.textContent = entry.title;

        clone.style.setProperty("--col1", entry.colour.css());
        clone.style.setProperty("--col2", entry.colour.lerp(Colour.white, 0.5).css());
        clone.style.setProperty("--col3", entry.colour.lerp(Colour.black, 0.95).css());
        clone.style.setProperty("--col4", entry.colour.css());

        clone.addEventListener("click", e => {
            ballmanac_open_category("game", i);
        })

        clone.classList.remove("template");

        gamelist.append(clone);
    });

    lore_entries.forEach((entry, i) => {
        let clone = lorepanel.cloneNode(true);

        clone.textContent = entry.title;

        clone.style.setProperty("--col1", entry.colour.css());
        clone.style.setProperty("--col2", entry.colour.lerp(Colour.white, 0.5).css());
        clone.style.setProperty("--col3", entry.colour.lerp(Colour.black, 0.95).css());
        clone.style.setProperty("--col4", entry.colour.css());

        clone.addEventListener("click", e => {
            ballmanac_open_category("lore", i);
        })

        clone.classList.remove("template");

        lorelist.append(clone);
    });
}

function ballmanac_back_to_index() {
    hide_nav();

    document.querySelector(".content:not(.index)").classList.add("nodisplay");
    document.querySelector(".content.index").classList.remove("nodisplay");

    // set href
    let url = new URL(window.location.href);
    url.searchParams.delete("cat");
    url.searchParams.delete("idx");
    
    if (url.href != window.location.href)
        window.history.pushState({urlPath:url.href}, null, url.href);
}

function ballmanac_set_entry(to) {
    let diff = to - current_index;
    ballmanac_mod_entry(diff);
}

function ballmanac_get_relevant_list(category) {
    let relevant_list = [];
    switch (category) {
        case "ball": {
            relevant_list = selectable_balls;
            break;
        }

        case "game": {
            relevant_list = game_entries;
            break;
        }

        case "lore": {
            relevant_list = lore_entries;
            break;
        }
    }

    return relevant_list;
}

function ballmanac_mod_entry(by) {
    // get list
    let relevant_list = ballmanac_get_relevant_list(current_category);

    // mod index
    current_index = Math.max(0, Math.min(relevant_list.length-1, current_index+by));

    let pb = document.querySelector(".prev-button");
    let nb = document.querySelector(".next-button");

    if (current_index <= 0) {
        pb.classList.add("disabled");
    } else {
        pb.classList.remove("disabled");
    }

    if (current_index >= relevant_list.length-1) {
        nb.classList.add("disabled");
    } else {
        nb.classList.remove("disabled");
    }

    // re-render
    switch (current_category) {
        case "ball": {
            update_ball_info_view(show_ball_info_view(), relevant_list[current_index]);

            pb.querySelector(".bn").textContent = relevant_list[current_index-1]?.ball_name ?? "";
            nb.querySelector(".bn").textContent = relevant_list[current_index+1]?.ball_name ?? "";
            break;
        }

        case "game":
        case "lore": {
            update_generic_info_view(show_generic_info_view(), relevant_list[current_index]);

            pb.querySelector(".bn").textContent = relevant_list[current_index-1]?.title ?? "";
            nb.querySelector(".bn").textContent = relevant_list[current_index+1]?.title ?? "";
        }
    }

    // set href
    let url = new URL(window.location.href);
    url.searchParams.set("cat", current_category);
    url.searchParams.set("idx", current_index);

    if (url.href != window.location.href)
        window.history.pushState({urlPath:url.href}, null, url.href);
}

function show_nav() {
    document.querySelector(".nav").classList.remove("hide");
    document.querySelector(".nav").classList.add("popin");
    
    document.querySelector(".content:not(.index)").classList.remove("nodisplay");
    document.querySelector(".content.index").classList.add("nodisplay");
}

function hide_nav() {
    document.querySelector(".nav").classList.remove("popin");

    document.querySelector(".content:not(.index)").classList.add("nodisplay");
    document.querySelector(".content.index").classList.remove("nodisplay");
}

function ballmanac_open_category(category, to_index=0) {
    current_category = category;
    current_index = to_index;

    show_nav();

    ballmanac_mod_entry(0);
}

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("keydown", evt => {
        if (evt.code == "KeyQ") {
            ballmanac_mod_entry(-1);            
        } else if (evt.code == "KeyE") {
            ballmanac_mod_entry(1);
        }
    });

    window.addEventListener("popstate", e => {
        window.location.reload();
    })

    let p = new URLSearchParams(window.location.search);
    
    let precat = p.get("cat");
    let preindex = p.get("idx");
    
    setup_ballmanac_index();

    if (precat) {
        let idx = Number.parseInt(preindex) ?? 0;
        ballmanac_open_category(precat, isNaN(idx) ? 0 : idx);
    } else {
        ballmanac_back_to_index();
    }

    let resizefn = () => {
        let w = window.innerWidth;

        let v = Math.floor((w * 0.7) / 166);

        document.querySelectorAll(".opt-list").forEach(e => {
            e.style.gridTemplateColumns = `repeat(${v}, minmax(166px, 1fr))`;
        })
    }

    resizefn();
    window.addEventListener("resize", resizefn);
})