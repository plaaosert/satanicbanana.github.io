class EternaFSNamePresentError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class EternaFSNoFileError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class EternaFSIllegalOperationError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class EternaFSNoAuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class EternaFSNoPermissionsError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class EternaFSPermissions {
    constructor(world_read, world_write, implicit) {
        this.world_read = world_read;
        this.world_write = world_write;
        this.implicit = implicit;
    }

    copy() {
        return new EternaFSPermissions(this.world_read, this.world_write, false);
    }
}

// "safe", "server code"
class EternaFSContainer {
    static name_legal_regex = new RegExp("^\\w[\\w\\-\\_\\.]*(?:\\.\\w\\w\\w)?$");
    static name_is_legal(name) {
        return this.name_legal_regex.test(name);
    }

    constructor(root) {
        this.root = root ? root : new EternaFSDirectory("", "SYSTEM", null, true);
    }

    _visualise_fs(l, nestlevel) {
        let s = "";
        let nl = nestlevel ? nestlevel : 0;

        if (!l) {
            l = this.root;
        }

        s += `${"-".repeat(nl*4)}${((l.name ? " " + l.name : "") + (l instanceof EternaFSDirectory ? "/" : "")).padEnd(48-(nl*4))} ${l.owner.padEnd(12)} ${l.permissions.world_read ? "r" : "-"}${l.permissions.world_write ? "w" : "-"}\n`

        l.children.forEach(child => {
            s += this._visualise_fs(child, nl+1);
        })

        return s;
    }

    _resolve_path(path) {
        // remove any double slashes here
        let segs = path.replaceAll(/\/+/g, "/").split("/");
        let final_segs = [];
        segs.forEach(s => {
            switch (s) {
                case ".":
                    break;
                case "..":
                    final_segs.pop();
                    break;
                default:
                    if (s) {
                        final_segs.push(s);
                    }
                    break;
            }
        })

        return final_segs;
    }

    _get_object(ctx, path) {
        let segs = this._resolve_path(path);
        let location = fs.root;
        segs.forEach(s => {
            let n = location.get_object(s);
            if (n.can_read(ctx.user)) {
                location = n;
            } else {
                throw new EternaFSNoPermissionsError("the user in the current context cannot read this object's contents");
            }
        });

        return location;
    }

    _add_object(ctx, path, newobj) {
        let location = this._get_object(ctx, path);

        if (location.can_write(ctx.user)) {
            if (newobj.permissions.implicit) {
                newobj.permissions = location.permissions.copy();
            }
            location.put_object(newobj)
        } else {
            throw new EternaFSNoPermissionsError("the user in the current context cannot edit this object's contents");
        }
    }

    _chown(ctx, path, newowner) {
        let location = this._get_object(ctx, path);

        if (location.can_write(ctx.user)) {
            location.set_owner(newowner);
        } else {
            throw new EternaFSNoPermissionsError("the user in the current context cannot edit this object's contents");
        }
    }

    _parse_str(str) {
        return `${str}`;
    }

    _parse_permissions(permissions) {
        return permissions ? new EternaFSPermissions(permissions.world_read ? true : false, permissions.world_write ? true : false, permissions.implicit ? true : false) : new EternaFSPermissions(false, false, true);
    }

    get_object(ctx, path) {
        return this._get_object(ctx, this._parse_str(path));
    }

    resolve_path(ctx, path) {
        return this._resolve_path(this._parse_str(path));
    }

    add_file(ctx, path, name, content, permissions) {
        let fobj = new EternaFSFile(this._parse_str(name), this._parse_str(ctx.user.name), this._parse_permissions(permissions), this._parse_str(content));
        this._add_object(ctx, this._parse_str(path), fobj);
    }

    create_directory(ctx, path, name, permissions) {
        let dobj = new EternaFSDirectory(this._parse_str(name), this._parse_str(ctx.user.name), this._parse_permissions(permissions));
        this._add_object(ctx, this._parse_str(path), dobj);
    }

    change_owner(ctx, path, newowner) {
        this._chown(ctx, this._parse_str(path), this._parse_str(newowner));
    }

    remove_object(ctx, path, recursive) {
        // need to walk the children of the object and delete as necessary
        // if the children of an object are not empty, we cannot delete the object
    }

    make_context(whoami) {
        // needs a validity check here if we're really going for the security thing
        return new EternaFSContainerEditContext(whoami, whoami.user, this);
    }
}

// modelled as "unsafe", "client code"
// it's all play fun really but it's nice to practice
class EternaFSContainerEditContext {
    constructor(userctx, user, fs) {
        this.userctx = userctx;
        this.user = user;
        this.fs = fs;

        this.temp_next_loc = null;

        this.current_location = "/";
        this.current_location_info = null;
    }

    impersonate(whoami) {
        let tempctx = this.fs.make_context(whoami);
        return tempctx;
    }

    enter() {
        if (this.temp_next_loc) {
            this.cd(this.temp_next_loc);
        }

        return this;
    }

    resolve_path(path) {
        return this.fs.resolve_path(this, path);
    }

    cd(path) {
        let np = path.startsWith("/") ? path : this.current_location + (this.current_location.endsWith("/") ? "" : "/") + path;

        this.current_location = this.resolve_path(np).join("/");
        if (!this.current_location) {
            this.current_location = "/"
        }

        this.current_location_info = this.get_file(this.current_location);

        return this;
    }

    change_owner(path, new_owner) {
        let fpath = path ? path : this.current_location

        this.fs.change_owner(this, fpath, new_owner);

        return this;
    }

    get_file(path) {
        return this.get_object(path);
    }

    get_object(path) {
        let fpath = path ? path : this.current_location;

        return this.fs.get_object(this, fpath);
    }

    add_file(path, name, content, permissions) {
        let fpath = path ? path : this.current_location

        this.fs.add_file(this, fpath, name, content, permissions);
        this.temp_next_loc = name;

        return this;
    }

    create_directory(path, name, permissions) {
        let fpath = path ? path : this.current_location;

        this.fs.create_directory(this, fpath, name, permissions);
        this.temp_next_loc = name;

        return this;
    }
}

class EternaFSObject {
    constructor(name, owner, permissions, isroot) {
        if (!isroot && !EternaFSContainer.name_is_legal(name)) {
            throw new EternaFSIllegalOperationError(`not a valid ETERNA object identifier name`)
        }

        this.name = name;
        this.owner = owner ? owner : "SYSTEM"
        this.permissions = permissions ? permissions : new EternaFSPermissions(false, false, true);
        this.children = [];
        this.parent = null;
        this.data = {};
    }

    can_read(user) {
        return user.name == "SYSTEM" || user.name == this.owner || this.permissions.world_read;
    }

    can_write(user) {
        return user.name == "SYSTEM" || user.name == this.owner || this.permissions.world_write;
    }

    put_object(obj) {
        throw new EternaFSIllegalOperationError("object does not support this function");
    }

    has_object(objn) {
        throw new EternaFSIllegalOperationError("object does not support this function");
    }

    get_abs_path() {
        return (this.parent && this.parent.name ? this.parent.get_abs_path() : "") + "/" + this.name;
    }

    get_ext() {
        return this.name.slice(this.name.lastIndexOf(".")+1);
    }

    get_base() {
        return this.name.slice(0, this.name.lastIndexOf("."))
    }

    get_object(objn) {
        throw new EternaFSIllegalOperationError("object does not support this function");
    }

    get_content() {
        throw new EternaFSIllegalOperationError("object does not support this function");
    }

    remove_object(objn) {
        throw new EternaFSIllegalOperationError("object does not support this function");
    }

    set_owner(new_owner) {
        this.owner = new_owner;
    }
}

class EternaFSFile extends EternaFSObject {
    constructor(name, owner, permissions, content, isroot) {
        super(name, owner, permissions, isroot);
        this.data.content = content;
    }

    get_content() {
        return this.data.content;
    }
}

class EternaFSDirectory extends EternaFSObject {
    constructor(name, owner, permissions, isroot) {
        super(name, owner, permissions, isroot);
    }

    put_object(obj) {
        // TODO probably want to insort here so we can get using binary search

        if (this.has_object(obj.name)) {
            throw new EternaFSNamePresentError(`object with the same name already exists`);
        }

        obj.parent = this;
        this.children.push(obj);
    }

    has_object(objn) {
        return this.children.some(o => o.name == objn);
    }

    get_object(objn) {
        if (!this.has_object(objn)) {
            throw new EternaFSNoFileError(`object does not exist`);
        }

        let ind = this.children.findIndex(o => o.name == objn);
        return this.children[ind];
    }

    remove_object(objn) {
        if (!this.has_object(objn)) {
            throw new EternaFSNoFileError(`object does not exist`);
        }

        let ind = this.children.findIndex(o => o.name == objn);
        this.children = this.children.splice(ind, 1);
    }
}

// if we don't have an ETERNA filesystem loaded, make it.
// TODO saveload lol

/*
.xct | executable
.img | image
.snd | sound
.vid | video
.tex | text
.lin | link (shortcut to a program, file or webpage)
.con | config file

/
    SYSTEM/
        CONFIGS/
            ...
        ICONS/
            ...
        PROGRAMS/
            Clock.xct       [clock]
            Draw.xct        [image editor]
            filebrowse.xct  [file browser]
            imgview.xct     [image viewer]
            sndview.xct     [sound player]
            Status.xct      [system status viewer]
            texpad.xct      [text editor]
            vidview.xct     [video player]
    users/
        paul.w/
            Games/
                ...

            Media/
                Images/
                    ...
                Sounds/
                    ...
                Videos/
                    ...

            Notes/
                guide.txt
                notes.txt

            Preferences/
                Styles.con

            Tools/
                ...
        ETERNA/
            [You are not permitted to view the contents of this folder.]
*/

let fs = new EternaFSContainer();

let sys = {user: {name: "SYSTEM"}};
let paul = {user: {name: "paul.w"}};
let eterna = {user: {name: "ETERNA"}};

let ctx = fs.make_context(sys);
let paul_ctx = ctx.impersonate(paul);
let eterna_ctx = ctx.impersonate(eterna);

ctx.create_directory("/", "SYSTEM", new EternaFSPermissions(true, false)).enter(); {
    ctx.create_directory("", "CONFIGS", new EternaFSPermissions(false, false)).enter(); {
        ctx.cd("..")
    }

    ctx.create_directory("", "DAT", new EternaFSPermissions(true, false)).enter(); {
        ctx.create_directory("", "FLDR", new EternaFSPermissions(true, false)).enter(); {
            ctx.create_directory("", "TDEL", new EternaFSPermissions(true, false)).enter(); {
                ctx.create_directory("", "TRASH", new EternaFSPermissions(true, false)).enter(); {
                    ctx.cd("..")
                }
                ctx.cd("..")
            }
            ctx.cd("..")
        }
        ctx.cd("..")
    }

    ctx.create_directory("", "test", new EternaFSPermissions(true, true)).enter(); {
        ctx.cd("..")
    }

    ctx.create_directory("", "ICONS", new EternaFSPermissions(true, false)).enter(); {
        ctx.add_file("", "debug_16x16.img", debug_16x16);
        ctx.add_file("", "debug_32x32.img", debug_32x32);
        ctx.add_file("", "debug_64x64.img", debug_64x64);
        ctx.add_file("", "debug_foldericon.img", debug_foldericon);
        ctx.add_file("", "debug_fileicon.img", debug_fileicon);

        ctx.add_file("", "eterna_icon_large.img", eterna_icon);
        ctx.add_file("", "shortcut_icon.img", shortcut_icon);

        ctx.create_directory("", "CURSOR").enter(); {
            Object.keys(cursor_datas).forEach(k => {
                ctx.create_directory("", k, new EternaFSPermissions(true, false)).enter(); {
                    for (let i=0; i<9; i++) {
                        ctx.add_file("", `${i}.img`, cursor_datas[k][i], new EternaFSPermissions(true, false));
                    }
                }

                ctx.cd("..");
            })

            ctx.cd("..");
        }

        ctx.cd("..");
    }

    ctx.create_directory("", "PROGRAMS", new EternaFSPermissions(true, false)).enter(); {
        ctx.add_file("", "Clock.xct", "/SYSTEM/ICONS/debug_32x32.img\nKERNEL clock", new EternaFSPermissions(true, false))
        ctx.add_file("", "filebrowse.xct", "/SYSTEM/ICONS/debug_32x32.img\nKERNEL filebrowse", new EternaFSPermissions(true, false))
        
        ctx.add_file("", "xcttest.xct", "/SYSTEM/ICONS/debug_32x32.img\nCONSOLELOG i'm working")
        ctx.cd("..")
    }

    ctx.cd("..")
}

ctx.create_directory("/", "users", new EternaFSPermissions(true, false)).enter(); {
    ctx.create_directory("", "paul.w").enter().change_owner("", "paul.w"); {
        paul_ctx.cd("/users/paul.w");
        paul_ctx.create_directory("", "Desktop").enter(); {
            paul_ctx.add_file("", "Trash.lin", "/SYSTEM/ICONS/debug_32x32.img\n/SYSTEM/DAT/FLDR/TDEL/TRASH/")
            paul_ctx.add_file("", "Tools.lin", "/SYSTEM/ICONS/debug_foldericon.img\n/users/paul.w/Tools/")
            paul_ctx.add_file("", "Games.lin", "/SYSTEM/ICONS/debug_foldericon.img\n/users/paul.w/Games/")
            paul_ctx.add_file("", "Drive.lin", "/SYSTEM/ICONS/debug_32x32.img\n/")
            paul_ctx.add_file("", "guide.tex.lin", "/SYSTEM/ICONS/debug_fileicon.img\n/users/paul.w/Notes/guide.tex")
            paul_ctx.add_file("", "notes.tex.lin", "/SYSTEM/ICONS/debug_fileicon.img\n/users/paul.w/Notes/notes.tex")
            paul_ctx.add_file("", "Clock.lin", "/SYSTEM/ICONS/debug_32x32.img\n/SYSTEM/PROGRAMS/Clock.xct")
            paul_ctx.add_file("", "ETERNA.lin", "/SYSTEM/ICONS/eterna_icon_large.img\n/users/paul.w/Tools/ETERNA.xct")
        
            paul_ctx.cd("..")
        }

        paul_ctx.create_directory("", "Games").enter(); {
            paul_ctx.cd("..")
        }

        paul_ctx.create_directory("", "Media").enter(); {
            paul_ctx.cd("..")
        }

        paul_ctx.create_directory("", "Notes").enter(); {
            paul_ctx.add_file("", "guide.tex", "test...\nhi");
            paul_ctx.cd("..")
        }

        paul_ctx.create_directory("", "Preferences").enter(); {
            paul_ctx.cd("..")
        }

        paul_ctx.create_directory("", "Tools").enter(); {
            paul_ctx.add_file("", "ETERNA.xct", "/SYSTEM/ICONS/debug_32x32.img\nKERNEL eterna")
        
            paul_ctx.cd("..")
        }

        ctx.cd("..")
    }
    
    ctx.create_directory("/users", "ETERNA", new EternaFSPermissions(false, false)).enter().change_owner("", "ETERNA"); {

    }
}
