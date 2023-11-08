changes = [
    {
        "ts": 1699468325,
        "title": "Redesigned site",
        "typ": "major",
        "desc": "Added the changelog and decluttered the landing page a bit,\nincluding moving games into their own subcategory.\nFinally retired the oldass infopages for things I don't use anymore."
    }
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