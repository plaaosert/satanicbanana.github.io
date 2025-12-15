changes = [
    {
        "ts": 1699468325,
        "title": "Redesigned site",
        "typ": "major",
        "desc": "Added the changelog and decluttered the landing page a bit,\nincluding moving games into their own subcategory.\nFinally retired the oldass infopages for things I don't use anymore."
    },

    {
        "ts": 1699928082,
        "title": "Reworked rendering for games",
        "typ": "minor",
        "desc": "I just found out about window.requestAnimationFrame(). That's kind of cool.\nAll the newer plaao.net games (wheels, circles and\nall other incomplete projects) now use that!"
    },

    {
        "ts": 1713984095,
        "title": "Fighting my motivation",
        "typ": "minor",
        "desc": "If you take a look around this website's source code,\nyou'll see SO MANY more pages that aren't linked to anywhere.\nI'm working on them. In the meantime, <a class=\"new-thing\" href=\"time/index.html\">time</a>. (funny little thing, not a game)"
    },

    {
        "ts": 1714049903,
        "title": "Fixing my old mistakes",
        "typ": "minor",
        "desc": "I fixed a bunch of different problems regarding sizing of the top and bottom bar on games.\nNow, zooming in and out shouldn't make those borders unstable.\nMost notable on <a class=\"new-thing\" href=\"time/index.html\">time</a> - I'll fix the rest of the games later."
    },

    {
        "ts": 1721330429,
        "title": "A new \"game\"",
        "typ": "major",
        "desc": "I have created a new... thing. <a class=\"new-thing\" href=\"turing/index.html\">turing</a> is an interactive visualiser for\nTuring machines and other assorted things, including the ET001B, a tiny (fake) CPU. Take a look."
    },

    {
        "ts": 1765829215,
        "title": "Balls!!",
        "typ": "major",
        "desc": "I have created a new game where you can watch balls fight to the death.\n<a class=\"new-thing\" href=\"balls/index.html\">balls</a> is a game about balls with weapons fighting each other. I plan to add a campaign mode in the near future.\nI am also uploading highlights to YouTube, TikTok, Instagram and Twitter under @plaaoballs.\n<a class=\"new-thing\" href=\"https://www.youtube.com/@plaaoballs\">https://www.youtube.com/@plaaoballs</a>"
    },
]

changes = changes.sort((a,b) => b.ts-a.ts);

document.addEventListener("DOMContentLoaded", function() {
    let list_obj = document.getElementById("changelist");

    changes.forEach(change => {
        let elem = document.createElement("li");

        let d = new Date(change.ts * 1000);
        let ts_str = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;

        elem.innerHTML = `<br><li><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="changelog-title-${change.typ} destructible">[${ts_str}] ${change.title}</span>`
        
        change.desc.split("\n").forEach(line => {
            elem.innerHTML += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="changelog-text-small">${line}</span><br>`
        })

        elem.innerHTML += "</li>";

        list_obj.appendChild(elem);
    });
})