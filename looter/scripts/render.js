// Renderer works as such:
// "renderedObjects" list contains all the objects when they are created
// fuck writing more code for this right now i hate ui code
renderedObjects = [];
mousex = 0;
mousey = 0;
itemDialog = null;
itemDialogInterval = null;
selectedItem = null;
overEquippedItem = undefined;
comparisonMode = false;
pickingAccSlot = false;
variableObjects = {};
inventory_objs = [];
menu_screens = {};
inventory_page = 0;
current_screen = "inventory";


class ItemFrame {
	// frames are initialised either by an item or by nothing
	constructor() {
		this.item = null;
		this.border = null;
		this.border2 = null;
		this.box = null;
		this.title = null;
		this.level = null;
	}
	
	bindToObjects(border, border2, box, title, level) {
		// Binds a frame to a pre-existing set of objects.
		this.border = border;
		this.border2 = border2;
		this.box = box;
		this.title = title;
		this.level = level;
		
		this.setItem(this.item);
	}
	
	setItem(item) {
		if (item == undefined || item == null) {
			this.border.src = "sprites/items/borders/000.png";
			this.border2.src = "";
			this.box.src = "";
			
			if (this.title != undefined) {
				this.title.textContent = "No item";
			}
		} else {
			this.border.src = "sprites/items/borders/" + item.border + ".png";
			this.border2.src = "sprites/items/borders/i" + item.border2 + ".png";
			this.box.src = "sprites/items/" + item.typ + "s/" + item.sprite + ".png";
			
			if (this.title != undefined) {
				this.title.textContent = item.name;
			}
		}
	}
	
	makeBaseFrame(xpos, ypos, target) {
		let itemborder = document.createElement("img");
		itemborder.class = "bg";
		itemborder.src = "sprites/items/borders/000.png";
		itemborder.style.position = "absolute";
		itemborder.style.top = ypos + "px";
		itemborder.style.left = xpos + "px";
		
		let itemborder2 = document.createElement("img");
		itemborder2.class = "bg";
		itemborder2.src = "sprites/items/borders/i999.png";
		itemborder2.style.position = "absolute";
		itemborder2.style.top = ypos + "px";
		itemborder2.style.left = xpos + "px";
		
		let itembox = document.createElement("img");
		itembox.class = "fg";
		itembox.src = "";
		itembox.style.position = "absolute";
		itembox.style.top = (ypos + 2) + "px";
		itembox.style.left = (xpos + 2) + "px";
		
		target.appendChild(itemborder);
		target.appendChild(itemborder2);
		target.appendChild(itembox);
		
		this.border = itemborder;
		this.border2 = itemborder2;
		this.box = itembox;
	}
}


function init() {
	if (window.Event) {
		document.captureEvents(Event.MOUSEMOVE);
	}
	document.onmousemove = getCursorXY;
	
	// get the item dialog
	itemDialog = document.getElementById("item-dialog");
	
	get_variable_objects();
	
	testrnd();
}


function get_variable_objects() {
	menu_screens.inventory = document.getElementById("inventory-screen");
	["weapon", "armour", "acc1", "acc2", "acc3"].forEach(function (item) {
		var obj = new ItemFrame();
		b = document.getElementById("equip-" + item + "-" + "border");
		b2 = document.getElementById("equip-" + item + "-" + "border2");
		bx = document.getElementById("equip-" + item + "-" + "box");
		bt = document.getElementById("equip-" + item + "-" + "title");
		bl = document.getElementById("equip-" + item + "-" + "level");
		obj.bindToObjects(b, b2, bx, bt, bl);
		
		bx.addEventListener("mouseenter", (function (item) { 
														return function() {
															make_item_dialog(item);
														} 
													})(item));
													
		bx.addEventListener("mouseleave", kill_item_dialog);
		obj.setItem(metaplayer.items[item]);
		
		menu_screens.inventory["equip_" + item] = obj;
	});
	
	menu_screens.equip_weapon = document.getElementById("equip-weapon");
	menu_screens.equip_armour = document.getElementById("equip-armour");
	menu_screens.equip_acc1 = document.getElementById("equip-acc1");
	menu_screens.equip_acc2 = document.getElementById("equip-acc2");
	menu_screens.equip_acc3 = document.getElementById("equip-acc3");
	
	menu_screens.adventure = document.getElementById("adventure-screen");
	menu_screens.settings = document.getElementById("settings-screen");
	
	variableObjects.itemdialog = {};
	variableObjects.itemdialog.border = document.getElementById("idlg-bord");
	variableObjects.itemdialog.border2 = document.getElementById("idlg-bord2");
	variableObjects.itemdialog.sprite = document.getElementById("idlg-spr");
	variableObjects.itemdialog.level = document.getElementById("idlg-lvl");
	variableObjects.itemdialog.rarity = document.getElementById("idlg-rarity");
	variableObjects.itemdialog.name = document.getElementById("idlg1");
	variableObjects.itemdialog.bonus1 = document.getElementById("idlg2");
	variableObjects.itemdialog.bonus2 = document.getElementById("idlg3");
	variableObjects.itemdialog.bonus3 = document.getElementById("idlg4");
	variableObjects.itemdialog.acc_choice = document.getElementById("idlg-acc-choice");
}


function getCursorXY(e) {
	mousex = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
	mousey = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
}


function add_object(obj) {
	renderedObjects.push(obj); // just for accounting and later removal
}


function format_bonus_number(number) {
	if (number < 1e9) {
		return (Math.round(number * 100) / 100).toLocaleString();
	} else {
		return (Math.round(number * 100) / 100).toPrecision(3).toLocaleString();
	}
}


function set_bonus_text(bonus, target) {
	target.style.color = "#0ef";
	if (bonus != null) {
		txt = "";
		if (bonus[1] == "*") {
			if (bonus[2] < 1) {
				target.style.color = "#f22";
			}
			
			txt += format_bonus_number(bonus[2]);
			txt += "x ";
		} else {
			if (bonus[1] == "-") {
				target.style.color = "#f22";
			}
			
			txt += bonus[1];
			txt += format_bonus_number(bonus[2]);
			txt += " ";
		}
		
		txt += bonus_var_to_words[bonus[0]];
		target.textContent = txt;
	} else {
		target.textContent = "";
	}
}


function make_item_dialog(item_id) {
	// We don't actually make the item dialog. We just update it with the item info and move it to the cursor position +1
	if (metaplayer.reverse)
		metaplayer.inventory.reverse();
	
	if (itemDialogInterval == null) {
		// If item_id is a string, it's referring to an equipped item.
		// If this is true, lookup differently.
		if (typeof item_id == "string") {
			item_ref = metaplayer.items[item_id];
			overEquippedItem = item_id;
		} else {
			item_ref = metaplayer.inventory[item_id + (64 * inventory_page)];
			overEquippedItem = undefined;
		}
		
		// Might be undefined because of respawning the dialog after item removal. If so, get out now.
		if (item_ref != undefined) {
			selectedItem = {item:item_ref, pos:item_id};
			
			variableObjects.itemdialog.acc_choice.style.visibility = "hidden";
			pickingAccSlot = false;
			
			variableObjects.itemdialog.border.src = "sprites/items/borders/" + item_ref.border + ".png";
			variableObjects.itemdialog.border2.src = "sprites/items/borders/i" + item_ref.border2 + ".png";
			variableObjects.itemdialog.sprite.src = "sprites/items/" + item_ref.typ + "s/" + item_ref.sprite + ".png";
			variableObjects.itemdialog.name.textContent = item_ref.name;
			
			set_bonus_text(item_ref.bonus1, variableObjects.itemdialog.bonus1);
			set_bonus_text(item_ref.bonus2, variableObjects.itemdialog.bonus2);
			set_bonus_text(item_ref.bonus3, variableObjects.itemdialog.bonus3);
			
			variableObjects.itemdialog.level.textContent = "Item level " + item_ref.level;
			variableObjects.itemdialog.rarity.textContent = getItemRarityName(item_ref.rarity);
			variableObjects.itemdialog.rarity.style.color = rarityColours[item_ref.rarity % 10];
			
			itemDialogInterval = setInterval(move_item_dialog, 1/144);
		}
	}
	
	if (metaplayer.reverse)
		metaplayer.inventory.reverse();
}


function move_item_dialog() {
	// Set position of item dialog to the cursor position
	itemDialog.style.left = Math.ceil((mousex / 2) + 1);
	itemDialog.style.top = Math.ceil((mousey / 2) + 1);
}


function kill_item_dialog() {
	// We don't actually kill the item dialog. We just set its position to -1000,-1000
	if (itemDialogInterval != null) {
		selectedItem = null;
		overEquippedItem = undefined;

		itemDialog.style.left = -1000;
		itemDialog.style.top = -1000;
		clearInterval(itemDialogInterval);
		itemDialogInterval = null;
	}
}


function initial_inventory_render() {
	inventory_div = document.getElementById("inventory-items");
	inventory_div.style.position = "absolute";
	inventory_div.style.left = "12px";
    inventory_div.style.top = "67px";
	inventory_div.style.width = "256px";
    inventory_div.style.height = "256px";
	
	for (i=0; i<8; i++) {
		inventory_objs.push([]);
		
		for (j=0; j<8; j++) {
			var xpos = j * 32;
			var ypos = i * 32;
			var itemid = (i * 8) + j;
			
			itemElem = new ItemFrame();
			itemElem.makeBaseFrame(xpos, ypos, inventory_div);
			
			itemElem.box.addEventListener("mouseenter", (function (itemid) { 
														return function() {
															make_item_dialog(itemid);
														} 
													})(itemid));
													
			itemElem.box.addEventListener("mouseleave", kill_item_dialog);
			
			inventory_div.appendChild(itemElem.border);
			inventory_div.appendChild(itemElem.border2);
			inventory_div.appendChild(itemElem.box);
			inventory_objs[i].push(itemElem);
		}
	}
}


function render_inventory_page(pageno) {
	document.getElementById("dbg-pageno").textContent = "Page " + (pageno + 1) + " / " + Math.ceil(metaplayer.inventory.length / 64).toString();
	
	if (metaplayer.reverse)
		metaplayer.inventory.reverse();
	
	for (i=0; i<8; i++) {
		for (j=0; j<8; j++) {
			itemid = (i * 8) + j + (64 * pageno);
			
			inventory_objs[i][j].setItem(metaplayer.inventory[itemid]);
		}
	}
	
	if (metaplayer.reverse)
		metaplayer.inventory.reverse();
}


function mod_inventory_page(amount) {
	inventory_page += amount;
	inventory_page = Math.max(0, Math.min(Math.ceil(metaplayer.inventory.length / 64) - 1, inventory_page));
	
	render_inventory_page(inventory_page);
}


function clear_all_objects() {
	renderedObjects.forEach(function(item) {
		item.remove();
	});
	
	renderedObjects = [];
}


function try_equip_item(selectedItem, slot) {
	ref_item = selectedItem.item;
	ref_pos = selectedItem.pos;
	ref_typ = ref_item.typ;
	ref_typ_text = ref_typ;
	if (slot != undefined && slot.startsWith("acc")) {
		slot = slot[3];
		ref_typ_text += slot;
	} else {
		slot = undefined;
	}
	
	// accessories need to show the additional pick part
	old_item = metaplayer.equip_item(ref_item, slot);
	if (old_item == "same")
		ref_item = null;

	menu_screens.inventory["equip_" + ref_typ_text].setItem(ref_item);
	
	kill_item_dialog(true);
	
	// then make a new item dialog using the xy position
	make_item_dialog(ref_pos);
	
	// and calculate new stats
	player.calculate_all_stats();
	update_stats_preview();
	mod_inventory_page(0);
}


function update_stats_preview() {
	if (document.getElementById("update-stats-input").value != "") {
		player.level = parseInt(document.getElementById("update-stats-input").value);
		player.calculate_all_stats();
		stats_text = "at LV " + player.level.toLocaleString() + "<br><br>";
		Object.keys(player.stats).forEach(function (item) {
			stats_text += item.toUpperCase() + " " + player.stats[item].toLocaleString() + "<br>";
		});
		
		document.getElementById("stats-preview").innerHTML = stats_text;
	}
}


function draw() {
	// Main drawing loop
	lrs.bg.drawImage(base, 0, 0);

	window.requestAnimationFrame(draw);
}

// Set up keypress events
document.onkeydown = function(e) {
    switch(e.which) {
		case 49:
			if (pickingAccSlot) {
				try_equip_item(selectedItem, "acc1");
				e.preventDefault(); // prevent default action
			}
			break;
		
		case 50:
			if (pickingAccSlot) {
				try_equip_item(selectedItem, "acc2");
				e.preventDefault(); // prevent default action
			}
			break;
		
		case 51:
			if (pickingAccSlot) {
				try_equip_item(selectedItem, "acc3");
				e.preventDefault(); // prevent default action
			}
			break;
		
        case 67: // c
			// turn on compare mode on the item panel, basically cloning it for the equipped item
			break;

        case 69: // e
			// equip the item in the chosen slot, returning the other item to the inventory if there is one and removing this one from the inventory
			if (selectedItem != null) {
				ref_item = selectedItem.item;
				ref_pos = selectedItem.pos;
				ref_typ = ref_item.typ;
				
				// accessories need to show the additional pick part
				if (ref_typ != "acc" || overEquippedItem != undefined) {
					try_equip_item(selectedItem, overEquippedItem);
				} else {
					// Show the choice text and turn on acc picking choice.
					variableObjects.itemdialog.acc_choice.style.visibility = "visible";
					pickingAccSlot = true;
				}
				
				e.preventDefault(); // prevent default action
			}
			break;

        case 83: // s
			// sell. remove item and gain gold for it
			break;

        default: return; // exit handler
    }
};


window.onload = init;