class IconInfo {
    constructor(id, name, imgsrc, x, y, runs_program) {
        this.id = id;
        this.name = name;
        this.imgsrc = imgsrc;
        this.x = x;
        this.y = y;
        this.runs_program = runs_program;
    }
}

desktop_icons = [
    new IconInfo("trash", "Trash", "/SYSTEM/ICONS/recycle_bin_full.img", )
]

/*
<div class="icon" id="icon-1" style="visibility:hidden">
    <img src="sprites/ui/sourced_icons/folder_closed.png">
    <p class="icon_text">Tools</p>
</div>
<div class="icon" id="icon-2" style="visibility:hidden">
    <img src="sprites/ui/sourced_icons/folder_closed.png">
    <p class="icon_text">Games</p>
</div>
<div class="icon" id="icon-3" style="visibility:hidden">
    <img src="sprites/ui/sourced_icons/drive.png">
    <p class="icon_text">/</p>
</div>
<div class="icon" id="icon-4" style="visibility:hidden">
    <img src="sprites/ui/sourced_icons/text_file.png">
    <p class="icon_text">guide.txt</p>
</div>
<div class="icon" id="icon-5" style="visibility:hidden">
    <img src="sprites/ui/sourced_icons/text_file.png">
    <p class="icon_text">notes.txt</p>
</div>
<div class="icon" id="icon-6" style="visibility:hidden">
    <img src="sprites/ui/sourced_icons/clock.png">
    <p class="icon_text">Clock</p>
</div>
<div class="icon" id="icon-7" style="visibility:hidden">
    <img src="sprites/ui/icons/eterna_icon_shrunk.png">
    <p class="icon_text">ETERNA</p>
</div>
*/

function get_desktop_icons() {
    icons = [];

    // load every file in the current user's "Desktop" directory
    let desktop_dir = fs.make_context(cur_user_ctx).get_file(`~/Desktop`);
    console.log(desktop_dir)
    desktop_dir.children.forEach(c => {
        console.log(c);
    })
}

function load_eterna_desktop() {

}