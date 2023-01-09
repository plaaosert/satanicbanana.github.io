function random_int(min, max) {
    return min + Math.floor(
        Math.random() * (max - min)
    );
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(arr) {
    return arr
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}
