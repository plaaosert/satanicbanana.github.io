game_id = "time";

const DisplayMode = {
    NONE: 0,
    CLICK: 1,
    LIGHT: 2,
    MEDIUM: 3,
    LARGE: 4,
    HUGE: 5,
}

const DisplayModeInfo = {
    [DisplayMode.NONE]: {cls: "NONE", col: "#ccc", snd: null},
    [DisplayMode.CLICK]: {cls: "CLICK", col: "#fff", snd: new Audio("snd/click.mp3")},
    [DisplayMode.LIGHT]: {cls: "LIGHT", col: "#57f", snd: new Audio("snd/click.mp3")},
    [DisplayMode.MEDIUM]: {cls: "MEDIUM", col: "#0c0", snd: new Audio("snd/click.mp3")},
    [DisplayMode.LARGE]: {cls: "LARGE", col: "#cf5", snd: new Audio("snd/click.mp3")},
    [DisplayMode.HUGE]: {cls: "HUGE", col: "#fc5", snd: new Audio("snd/click.mp3")},
}

let triggers_hhmm = [
    {element: null, name: "Palindrome", mode: DisplayMode.LARGE, enabled: true, predicate: t => t == t.split("").reverse().join("")},
    {element: null, name: "11:11", mode: DisplayMode.HUGE, enabled: true, predicate: t => t == "11:11"},
    {element: null, name: "22:22", mode: DisplayMode.LARGE, enabled: true, predicate: t => t == "22:22"},
    {element: null, name: "XY:XY", mode: DisplayMode.MEDIUM, enabled: true, predicate: t => t[0] == t[3] && t[1] == t[4]},
    {element: null, name: "Exact hour", mode: DisplayMode.LIGHT, enabled: true, predicate: t => t.endsWith(":00")},
    {element: null, name: "Midnight", mode: DisplayMode.MEDIUM, enabled: true, predicate: t => t == "00:00"},
    {element: null, name: "Noon", mode: DisplayMode.MEDIUM, enabled: true, predicate: t => t == "12:00"},
    {element: null, name: "13:37", mode: DisplayMode.LARGE, enabled: true, predicate: t => t == "13:37"},
    {element: null, name: "Sums to 60", mode: DisplayMode.LIGHT, enabled: true, predicate: t => t.split(":").reduce((p, c) => p + Number.parseInt(c), 0) == 60},
    {element: null, name: "15 minutes", mode: DisplayMode.LIGHT, enabled: true, predicate: t => Number.parseInt(t.split(":")[1]) % 15 == 0},
    {element: null, name: "Work's done", mode: DisplayMode.MEDIUM, enabled: true, predicate: t => t == "17:00"},
    {element: null, name: "Even", mode: DisplayMode.CLICK, enabled: true, predicate: t => Number.parseInt(t[t.length-1]) % 2 == 0},
    {element: null, name: "Multiple of 3", mode: DisplayMode.LIGHT, enabled: true, predicate: t => Number.parseInt(t.split(":")[0]) % 3 == 0 || Number.parseInt(t.split(":")[1]) % 3 == 0},
    {element: null, name: "1 1", mode: DisplayMode.CLICK, enabled: true, predicate: t => t.split("1").length == 2}
]

let triggers_hhmmss = [
    {element: null, name: "Palindrome", mode: DisplayMode.HUGE, enabled: true, predicate: t => t == t.split("").reverse().join("")},
    {element: null, name: "11:11:11", mode: DisplayMode.HUGE, enabled: true, predicate: t => t == "11:11:11"},
    {element: null, name: "22:22:22", mode: DisplayMode.HUGE, enabled: true, predicate: t => t == "22:22:22"},
    {element: null, name: "XY:XY:XY", mode: DisplayMode.LARGE, enabled: true, predicate: t => (t[0] == t[3] && t[3] == t[6]) && (t[1] == t[4] && t[4] == t[7])},
    {element: null, name: "Sums to 60", mode: DisplayMode.LARGE, enabled: true, predicate: t => t.split(":").reduce((p, c) => p + Number.parseInt(c), 0) == 60},
    {element: null, name: "Fizz", mode: DisplayMode.CLICK, enabled: true, predicate: t => Number.parseInt(t.split(":")[2]) % 3 == 0},
    {element: null, name: "Buzz", mode: DisplayMode.LIGHT, enabled: true, predicate: t => Number.parseInt(t.split(":")[2]) % 5 == 0},
    {element: null, name: "Fizzbuzz", mode: DisplayMode.MEDIUM, enabled: true, predicate: t => Number.parseInt(t.split(":")[2]) % 15 == 0},
    {element: null, name: "Even", mode: DisplayMode.CLICK, enabled: true, predicate: t => Number.parseInt(t[t.length - 1]) % 2 == 0},
    {element: null, name: "Exact minute", mode: DisplayMode.MEDIUM, enabled: true, predicate: t => t.split(":")[2] == "00"},
    {element: null, name: "((H-S)^(M+S)+7) multiple of 827", mode: DisplayMode.LARGE, enabled: true, predicate: t => (7 + Math.pow(Number.parseInt(t.split(":")[0]) - Number.parseInt(t.split(":")[2]), Number.parseInt(t.split(":")[1]) + Number.parseInt(t.split(":")[2]))) % 827 == 0}
]

let formatter = new Intl.DateTimeFormat("en-GB", {
    timeStyle: "long"
});

let current_hhmm_display_trigger = null;
let current_hhmmss_display_trigger = null;

let options_container_template = null;

function do_display(target, mode) {
    // TODO implement the animations and shit
    // then showing the options on each trigger
    // each trigger option should have an option to change the intensity (coloured box with a number inside)
    // and an option to toggle the trigger on or off (just click the trigger anywhere except the intensity option)
    if (!navigator.userActivation || navigator.userActivation.hasBeenActive) {
        DisplayModeInfo[mode].snd?.play();
    }

    Object.values(DisplayMode).forEach(v => {
        target.classList.remove(DisplayModeInfo[v].cls);
    })

    target.classList.add(DisplayModeInfo[mode].cls);
}

function update_time_display() {
    let element = document.getElementById("time-title");
    let element2 = document.getElementById("time-title-small");
    let parts = formatter.formatToParts(Date.now());

    element.textContent = parts.slice(0, 3).map(t => t.value).join("");
    element2.textContent = parts.slice(0, 5).map(t => t.value).join("");

    let hhmm_display_mode = DisplayMode.NONE;
    let hhmm_display_trigger = "";

    triggers_hhmm.forEach(trigger => {
        if (trigger.enabled && trigger.predicate(element.textContent)) {
            trigger.element.style.outline = "1px solid white";

            if (trigger.mode >= hhmm_display_mode) {
                hhmm_display_mode = trigger.mode;
                hhmm_display_trigger = trigger.name;
            }
        } else {
            trigger.element.style.outline = "";
        }
    });

    let hhmmss_display_mode = DisplayMode.NONE;
    let hhmmss_display_trigger = "";

    triggers_hhmmss.forEach(trigger => {
        if (trigger.enabled && trigger.predicate(element2.textContent)) {
            trigger.element.style.outline = "1px solid white";

            if (trigger.mode >= hhmmss_display_mode) {
                hhmmss_display_mode = trigger.mode;
                hhmmss_display_trigger = trigger.name;
            }
        } else {
            trigger.element.style.outline = "";
        }
    });

    if (hhmm_display_trigger != current_hhmm_display_trigger) {
        current_hhmm_display_trigger = hhmm_display_trigger;
        do_display(element, hhmm_display_mode);
    }

    if (hhmmss_display_trigger != current_hhmmss_display_trigger) {
        current_hhmmss_display_trigger = hhmmss_display_trigger;
        do_display(element2, hhmmss_display_mode);
    }
}

function save_state() {
    localStorage.setItem("time-hhmm-triggers", JSON.stringify(triggers_hhmm));
    localStorage.setItem("time-hhmmss-triggers", JSON.stringify(triggers_hhmmss));
}

function load_state() {
    // overwrite every value in triggers_hhmm with the stored values, except "predicate"
    let hhmm_saved = JSON.parse(localStorage.getItem("time-hhmm-triggers"));
    if (hhmm_saved) {
        hhmm_saved.forEach((t, i) => {
            if (triggers_hhmm[i]) {
                triggers_hhmm[i].mode = t.mode;
                triggers_hhmm[i].enabled = t.enabled;
            }
        })
    }

    let hhmmss_saved = JSON.parse(localStorage.getItem("time-hhmmss-triggers"));
    if (hhmmss_saved) {
        hhmmss_saved.forEach((t, i) => {
            if (triggers_hhmmss[i]) {
                triggers_hhmmss[i].mode = t.mode;
                triggers_hhmmss[i].enabled = t.enabled;
            }
        })
    }
}

function setup_option_displays() {
    [[triggers_hhmm, "options-container-hhmm"], [triggers_hhmmss, "options-container-hhmmss"]].forEach(e => {
        e[0].forEach(trigger => {
            let elem = options_container_template.cloneNode(true);
        
            elem.id = `option-${trigger.name.toLowerCase().replaceAll(" ", "-")}`;

            elem.getElementsByClassName("option-name")[0].textContent = trigger.name;
            elem.getElementsByClassName("mode-select")[0].style.backgroundColor = DisplayModeInfo[trigger.mode].col;
            elem.getElementsByClassName("mode-select")[0].querySelector("p").textContent = trigger.mode;
            if (!trigger.enabled) {
                elem.classList.add("disabled");
            }

            document.getElementById(e[1]).appendChild(elem);

            elem.addEventListener("click", function(evt) {
                trigger.enabled = !trigger.enabled;
                save_state();

                if (trigger.enabled) {
                    elem.classList.remove("disabled");
                } else {
                    elem.classList.add("disabled");
                }
            })

            let ns = elem.getElementsByClassName("mode-select")[0];
            ns.addEventListener("click", function(evt) {
                trigger.mode = (trigger.mode + 1);
                if (trigger.mode > 5) {
                    trigger.mode -= 5;
                }

                if (e[1] == "options-container-hhmm") {
                    if (current_hhmm_display_trigger == trigger.name) {
                        current_hhmm_display_trigger = null;
                    }
                } else {
                    if (current_hhmmss_display_trigger == trigger.name) {
                        current_hhmmss_display_trigger = null;
                    }
                }

                save_state();
                
                ns.style.backgroundColor = DisplayModeInfo[trigger.mode].col;
                ns.querySelector("p").textContent = trigger.mode;

                evt.preventDefault();
                evt.stopPropagation();
            })

            trigger.element = elem;
        })
    })
}

document.addEventListener("DOMContentLoaded", function(e) {
    options_container_template = document.getElementById("options_container_template");

    load_state();
    setup_option_displays();

    setInterval(update_time_display, 25);
});
