function get_indexed_filename(base, n, ext="png") {
    return `${base}${base.endsWith("/") ? "" : "/"}${n.toString().padStart(3, "0")}.${ext}`;
}