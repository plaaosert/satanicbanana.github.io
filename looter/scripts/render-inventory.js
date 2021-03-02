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
			itemElem.box.addEventListener("click", equip_button_pressed);

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


function try_equip_item(selectedItem, slot) {
	// We must be on the inventory screen, otherwise this fails.
	if (current_screen != "inventory") {
		return;
	}
	
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
	menu_screens.inventory["combat_equip_" + ref_typ_text].setItem(ref_item);
	
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
		previewPlayer = new Player(metaplayer);
		lvValue = document.getElementById("update-stats-input").value;
		previewPlayer.level = Math.round(Number(lvValue));
		
		previewPlayer.calculate_all_stats();
		stats_text = "at LV " + format_bonus_number(previewPlayer.level) + "<br><br>";
		Object.keys(previewPlayer.stats).forEach(function (item) {			
			stats_text += item.toUpperCase() + " " + format_bonus_number(previewPlayer.stats[item]) + "<br>";
		});
		
		document.getElementById("stats-preview").innerHTML = stats_text;
	}
}


function equip_button_pressed() {
	if (selectedItem != null) {
		if (pickingAccSlot) {
			// Try to equip in an empty slot. If an empty slot is not available, do nothing.
			if (metaplayer.items.acc1 == null)
				try_equip_item(selectedItem, "acc1");
			else if (metaplayer.items.acc2 == null)
				try_equip_item(selectedItem, "acc2");
			else if (metaplayer.items.acc3 == null)
				try_equip_item(selectedItem, "acc3");
			
			return;
		}
		else {
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
		}
		
		return true;
	}
	
	return false;
}