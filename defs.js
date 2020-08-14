// generate alphabet i want to die again
var alphabet = [];
var start = 65
var last  = 90
for (var i = start; i <= last; ++i) {
	alphabet.push(String.fromCharCode(i));
}

alphabet.push("▓");
alphabet.push("▒");
alphabet.push("░");


// define a replace_at function because strings are immutable
String.prototype.replace_at = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

main_intervals = {};
start_funcs = {};