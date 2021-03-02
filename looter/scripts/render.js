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


function SHOWALLITEMS() {
	// Destructive. Damaging. Refresh after using. Remove me later.
	// Uses a similar routine to initial inventory rendering but enumerates every sprite on a normal border2 and border1.
	offset = 0;
	["weapons", "armours", "accs"].forEach((typ) => {
		// For 200 items (50x4)
		for (i=0; i<4; i++) {
			inventory_objs.push([]);
			
			for (j=0; j<50; j++) {
				var xpos = j * 32;
				var ypos = i * 32;
				var itemid = (i * 50) + j;
				
				itemElem = new ItemFrame();
				itemElem.makeBaseFrame(xpos, ypos + offset, document.body)
				itemElem.box.src = "sprites/items/" + typ + "/" + itemid.toString().padStart(3, "0") + ".png";
			}
		}
		
		offset += 160;
	});
}


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
		this.border.src = "sprites/items/borders/000.png";
		this.border2.src = "";
		this.box.src = "";
		
		if (item == undefined || item == null) {
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

class SkillFrame {
	// frames are always initialised with a skill
	constructor(skill) {
		this.skill = skill;
		this.box = null;
	}
	
	setSkill(skill) {
		// We pick either the skill on its own or "o".
		this.box.src = "sprites/skills/skilltree/" + (player.skills[skill.id][1] ? "o" : "") + skill.fname + ".png";
	}
	
	makeBaseFrame(xpos, ypos, target) {
		let itembox = document.createElement("img");
		itembox.class = "fg";
		itembox.src = "";
		itembox.style.border = "1px solid #555";
		itembox.style.position = "absolute";
		itembox.style.top = (ypos + 2) + "px";
		itembox.style.left = (xpos + 2) + "px";
		
		target.appendChild(itembox);
		
		this.box = itembox;
		this.setSkill(this.skill);
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
		bx.addEventListener("click", equip_button_pressed);
		obj.setItem(metaplayer.items[item]);
		
		menu_screens.inventory["equip_" + item] = obj;
		
		var cobj = new ItemFrame();
		b = document.getElementById("combat-equip-" + item + "-" + "border");
		b2 = document.getElementById("combat-equip-" + item + "-" + "border2");
		bx = document.getElementById("combat-equip-" + item + "-" + "box");
		bt = document.getElementById("combat-equip-" + item + "-" + "title");
		bl = document.getElementById("combat-equip-" + item + "-" + "level");
		cobj.bindToObjects(b, b2, bx, bt, bl);
		
		bx.addEventListener("mouseenter", (function (item) { 
														return function() {
															make_item_dialog(item);
														} 
													})(item));
													
		bx.addEventListener("mouseleave", kill_item_dialog);
		cobj.setItem(metaplayer.items[item]);
		
		menu_screens.inventory["combat_equip_" + item] = cobj;
	});
	
	menu_screens.screens = {};
	menu_screens.screens.inventory = document.getElementById("inventory-screen");
	menu_screens.screens.adventure = document.getElementById("adventure-screen");
	menu_screens.screens.settings = null;
	
	menu_screens.equip_weapon = document.getElementById("equip-weapon");
	menu_screens.equip_armour = document.getElementById("equip-armour");
	menu_screens.equip_acc1 = document.getElementById("equip-acc1");
	menu_screens.equip_acc2 = document.getElementById("equip-acc2");
	menu_screens.equip_acc3 = document.getElementById("equip-acc3");
	
	menu_screens.c_equip_weapon = document.getElementById("combat-equip-weapon");
	menu_screens.c_equip_armour = document.getElementById("combat-equip-armour");
	menu_screens.c_equip_acc1 = document.getElementById("combat-equip-acc1");
	menu_screens.c_equip_acc2 = document.getElementById("combat-equip-acc2");
	menu_screens.c_equip_acc3 = document.getElementById("combat-equip-acc3");
	
	menu_screens.adventure = document.getElementById("adventure-screen");
	menu_screens.settings = document.getElementById("settings-screen");
	
	menu_screens.area_box1 = document.getElementById("area-1-image");
	menu_screens.area_box2 = document.getElementById("area-2-image");
	menu_screens.area_box3 = document.getElementById("area-3-image");
	
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


function clear_all_objects() {
	renderedObjects.forEach(function(item) {
		item.remove();
	});
	
	renderedObjects = [];
}


function draw() {
	// Main drawing loop
	lrs.bg.drawImage(base, 0, 0);

	window.requestAnimationFrame(draw);
}

function switch_screen(screen) {
	current_screen = screen;
	
	menu_screens.screens["inventory"].style.visibility = "hidden";
	menu_screens.screens["adventure"].style.visibility = "hidden";
	// menu_screens.screens["settings"].style.visibility = "hidden";
	
	menu_screens.screens[screen].style.visibility = "visible";
}

function initial_skills_render() {
	skills_div = document.getElementById("skills-items");
	skills_div.style.position = "absolute";
	skills_div.style.left = "8px";
    skills_div.style.top = "4px";
	skills_div.style.width = "128px";
    skills_div.style.height = "256px";
	
	for (i=0; i<6; i++) {
		inventory_objs.push([]);
		
		for (j=0; j<4; j++) {
			var xpos = j * 40;
			var ypos = i * 36;
			var skillid = (i * 8) + j;
			skillid = Math.min(skillid, 4);
			
			skillElem = new SkillFrame(skills_list[skillid]);
			skillElem.makeBaseFrame(xpos, ypos, skills_div);
			
			skillElem.box.addEventListener("mouseenter", (function (skillid) { 
														return function() {
															console.log("set skill " + skillid + " mouseenter action here")
														} 
													})(skillid));
													
			skillElem.box.addEventListener("mouseleave", _ => console.log("set skill mouseout action here"));
			skillElem.box.addEventListener("click", equip_button_pressed);

			inventory_objs[i].push(skillElem);
		}
	}
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
			if (equip_button_pressed())
				e.preventDefault(); // prevent default action
			
			break;

        case 83: // s
			// sell. remove item and gain gold for it
			break;

		case 80: // p
			// set to inventory screen
			switch_screen("inventory");
			break;
		
		case 219: // [
			// set to adventure screen
			switch_screen("adventure");
			break;
			
		case 221: // ]
			// set to setttings screen
			switch_screen("settings");
			break;

        default: return; // exit handler
    }
};


window.onload = init;