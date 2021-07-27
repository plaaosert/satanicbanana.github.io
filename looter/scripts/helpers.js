// Helper function file

function randInt(min, max) {
	// Min is inclusive, max is exclusive
	diff = max - min;
	return Math.floor(Math.random() * diff) + min;
}

function randomFromCollection(collection) {
	return collection[randInt(0, collection.length)]
}

sortArrayOfObjects = (arr, key) => {
	return arr.sort((a, b) => {
		return a[key] == b[key] ? 0 : (a[key] > b[key] ? 1 : -1);
	});
};

filterArrayOfObjects = (arr, key, attr) => {
	return arr.filter(a => {
		a[attr].toLowerCase().includes(key.toLowerCase());
	});
};

// Fits a value in a list using a binary search.
// Does this by modifying the conditions for finding a spot to be:
// "Is coll[cur] >= value and is coll[cur - 1] < value?
function arbBinaryFit(collection, parameter, value) {
	// Prone to breakage. If at any point anything is undefined, return instantly.
	if (value[parameter] == undefined)
		return -1;
	
	start = 0;
	end = collection.length - 1;
	diff = end + start;
	current = Math.floor(diff / 2);
	last = -1;
	// Shortcuts: if < collection[0] or collection is empty, return 0.
	//			  if > collection[collection.length - 1], return collection.length.
	target = value[parameter];
	if (collection.length == 0 || target < collection[0][parameter]) {
		return 0;
	} else if (target > collection[collection.length - 1][parameter]) {
		return collection.length;
	}
	
	while (true) {
		last = current;
		found = collection[current][parameter];
		behind = current > 0 ? collection[current - 1][parameter] : -1e308; // if we try to index collection[-1], make it negative infinity
		target = value[parameter];
		
		if (found == undefined || behind == undefined)
			return -1;
		
		// console.log(start, end, found, behind, target);
		
		if (found >= target && behind <= target) {
			return current;
		} else {
			if (found > target) {
				// it's in the lower side
				end = current - 1;
			} else {
				// it's in the higher side
				start = current + 1;
			}
			
			diff = end + start;
			current = Math.floor(diff / 2);
		}
	}
}

function arbBinarySearch(collection, parameter, target) {
	start = 0;
	end = collection.length - 1;
	diff = end + start;
	current = Math.floor(diff / 2);
	last = -1;
	while (last != current) {
		last = current;
		found = collection[current][parameter];
		
		if (found == target) {
			return current;
		} else {
			if (found > target) {
				// it's in the lower side
				end = current - 1;
			} else {
				// it's in the higher side
				start = current + 1;
			}
			
			diff = end + start;
			current = Math.floor(diff / 2);
		}
	}
	
	return -1; // not found
}

// https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-and-arrays-by-string-path
Object.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

// https://stackoverflow.com/questions/18936915/dynamically-set-property-of-nested-object
Object.setByString = function(o, p, v) {
    var schema = o;  // a moving reference to internal objects within obj
    var pList = p.split('.');
    var len = pList.length;
    for(var i = 0; i < len-1; i++) {
        var elem = pList[i];
        if( !schema[elem] ) schema[elem] = {}
        schema = schema[elem];
    }

    schema[pList[len-1]] = v;
}

// https://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+'h '+minutes+'m '+seconds+'s ';
}