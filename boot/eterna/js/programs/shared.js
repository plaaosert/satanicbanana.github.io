class EternaDisplayObject {
    static create_styles(x, y, w, h, extra) {
        let styles = {
            left: isNaN(x) ? x : `${x}px`,
            top: isNaN(y) ? y : `${y}px`,
            height: isNaN(h) ? h : `${h}px`,
            width: isNaN(w) ? w : `${w}px`,
        }

        if (extra) {
            Object.keys(extra).forEach(k => {
                styles[k] = extra[k];
            })
        }

        return styles;
    }

    static div(name, x, y, w, h, extra_styles, onclick_enabled, text_content="") {
        let styles = EternaDisplayObject.create_styles(x, y, w, h, extra_styles);

        return new EternaDisplayObject(
            name, "div", styles, text_content, false, onclick_enabled, false
        )
    }

    static image(name, path, x, y, w, h, extra_styles, onclick_enabled) {
        extra_styles.backgroundImage = path;
        let styles = EternaDisplayObject.create_styles(x, y, w, h, extra_styles);

        return new EternaDisplayObject(
            name, "div", styles, "", false, onclick_enabled, false
        )
    }

    static label(name, content, x, y, w, h, extra_styles, linewrap, onclick_enabled) {
        if (linewrap) {
            extra_styles.wordBreak = "break-all";
            extra_styles.whiteSpace = "normal";
        }

        let styles = EternaDisplayObject.create_styles(x, y, w, h, extra_styles);

        return new EternaDisplayObject(
            name, "p", styles, content, false, onclick_enabled, false
        )
    }

    static simple_elem(name, typ, x, y, w, h, extra_styles, onclick_enabled, content) {
        let styles = EternaDisplayObject.create_styles(x, y, w, h, extra_styles);

        return new EternaDisplayObject(
            name, typ, styles, content, false, onclick_enabled, false
        )
    }

    constructor(id, typ, styles, content, disabled, onclick_enabled, keypress_enabled) {
        this.id = id;
        this.typ = typ;
        this.styles = styles ? styles : {};
        this.content = content ? content : "";
        this.disabled = disabled ? true : false;
        this.onclick_enabled = onclick_enabled ? true : false;
        this.keypress_enabled = keypress_enabled ? true : false;

        if (this.onclick_enabled && !this.styles.cursortype) {
            this.styles.cursortype = MouseDisplayTypes.POINT
        }
    }

    to_initial_paint(parent_obj) {
        return {
            add_to: parent_obj ? parent_obj.object.id : null,
            object: {
                id: this.id,
                typ: this.typ,
                styles: this.styles,
                content: this.content,
                disabled: this.disabled,
                onclick_enabled: this.onclick_enabled,
                keypress_enabled: this.keypress_enabled
            }
        }
    }
}

class EternaDisplayMarkupElement {
    static childless(obj) {
        return new EternaDisplayMarkupElement(obj, []);
    }

    constructor(object, children) {
        this.object = object;
        this.parent_obj = null;
        this.children = children ? children : [];

        let sthis = this;
        this.children.forEach(c => {
            c.parent_obj = sthis;
        })
    }

    to_initial_paint() {
        // we should already be in order.
        // create this element, then its children.
        return [
            this.object.to_initial_paint(this.parent_obj), ...this.children.map(o => o.to_initial_paint())
        ].flat();
    }
}

class EternaDisplayMarkupContainer {
    constructor(title, objects) {
        this.title = title;
        this.objects = objects;
    }

    to_initial_paint() {
        return {
            title: this.title,
            additions: this.objects.map(o => o.to_initial_paint()).flat()
        }
    }
}

class EternaProcessKernel {
    constructor(initial_markup, spawn, heartbeat, process, paint, prefs) {
        this.initial_markup = initial_markup;
        this.spawn = spawn;
        this.heartbeat = heartbeat;
        this.process = process;
        this.paint = paint;
        this.prefs = prefs ? prefs : {};
    }

    initial_paint() {
        return this.initial_markup.to_initial_paint();
    }
}
