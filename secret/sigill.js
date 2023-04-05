function crash_now() {
    var cells = [];
    var y = 64;
    var x = 64;

    for (var yt=0; yt<y; y++) {
        cells.push([]);

        for (var xt=0; xt<x; xt++) {
            cells[yt].push(null);
        }
    }
}