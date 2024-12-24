game_id = "factory";

/* factory game is kind of like widget inc but with procedurally generated production chains and upgrades. */
// asset colours are generated procedurally as well by picking a random sprite and replacing its colours.
// every sprite is drawn with certain colours on certain surfaces to be replaced:
/*
#b4202a - bright 1
#73172d - medium 1
#3b1725 - darker 1
#d6f264 - bright 2
#9cdb43 - medium 2
#59c135 - darker 2
#249fde - bright 3
#285cc4 - medium 3
#143464 - darker 3
#060608 - solid outline (black)

and every generated item will randomly select as many "palettes" as is required to complete the item sprite.
*/

/*
every recipe is performed by one (unique) machine.
we score an item (as recipe output) by the total score of its reagents, divided by the quantity of output, multiplied by time taken.
for items with no reagents, it is simply the time taken.
the lowest score is chosen for an item.
the score does not include upgrades.
*/

class Item {
    static id_inc = 1;

    constructor(name, sprite, lowest_value=Number.POSITIVE_INFINITY) {
        this.id = Item.id_inc;
        Item.id_inc++;

        this.name = name;
        this.sprite = sprite;
        this.lowest_value = lowest_value;
    }
}

// Bonus types are additive
const BuildingBonusType = {
    CRAFT_SPEED: "crafting speed",  // craft speed bonus
    PRODUCTIVITY: "productivity",   // productivity is the multiplier on the product count. the fractional component is the chance to add 1 (so 6.2 means 6 always, plus 1 20% of the time)
}

const BuildingConditionAdjacencyType = {
    ORTHOGONAL: "directly adjacent",
    ALL: "next"
}

const BuildingConditionComparisonType = {
    EQUAL: 1,            
    GREATER_THAN: 2,     
    LESS_THAN: 3,        
    COUNT_OF_PLUS: 4000,    
    MINUS_COUNT_OF: 5000,   
}

class BuildingBonus {
    constructor(bonus_type, bonus_amount) {
        this.bonus_type = bonus_type;
        this.bonus_amount = bonus_amount;

        this.bonus_string = "";
    }

    generate_bonus_string() {
        this.bonus_string = `Increases ${this.bonus_type} by ${Math.round(this.bonus_amount * 100)}%`;
    }
}

class BuildingUpgrade {
    constructor(name, cost, bonus) {
        this.name = name;
        this.cost = cost;
        this.bonus = bonus;
    }
}

class BuildingPlacementCondition {
    constructor(adjacency, building, tile, comparison_type, count) {
        this.adjacency = adjacency;

        // building takes priority. only one is selected
        this.building = building;
        this.tile = tile;
        
        this.count = count;
        this.comparison_type = comparison_type;

        this.is_counter = this.comparison_type >= 1000;
    }
}

class BuildingPlacementBonus {
    constructor(conditions, bonus) {
        this.conditions = conditions;
        this.count_conditions = this.conditions.filter(c => c.is_counter);
        this.test_conditions = this.conditions.filter(c => !c.is_counter);
        
        this.bonus = bonus;

        this.bonus_string = ""
    }

    generate_placement_bonus_string() {
        /*
            counters are additive, but true/false are multiplicative. this means that you can sum together counters, then multiply by conditions (return 1 or 0).
            omit counters' formats with value 0 where relevant, and replace 0 with "no"/"none"/"not any", etc.
            say: OIL_FIELD ALL COUNT_PLUS 0, POWER_PLANT ORTHOGONAL MINUS_COUNT 4, SWAMP ORTHOGONAL EQUAL 0, WATER ALL LESS_THAN 2

            >> ...[for ][every adjacent Oil Field building[]][ plus ][5 - 1 for every directly adjacent Power Plant building][, ][if ][directly adjacent to 0 Swamp tiles][ and ][adjacent to less than 2 Water tiles].

            true/false is always sorted onto the end. the joiner for counters is " plus ", while the joiner for conditions is " and ".
        */
        let conditions_str = "";
        // first, pick the starter. this can be "for", "by" or "if", depending on the first condition.
        if (this.count_conditions.length > 0) {
            switch (this.count_conditions[0].comparison_type) {
                case BuildingConditionComparisonType.COUNT_OF_PLUS:
                    conditions_str += "for ";
                    break;

                case BuildingConditionComparisonType.MINUS_COUNT_OF:
                    conditions_str += "by ";
                    break;
                
                default:
                    conditions_str += "!!UNKNOWN!! ";
                    break;
            }
        } else {
            conditions_str += "if ";
        }

        // then add each count condition.
        let count_string_sec = this.count_conditions.map(c => {
            let adj_item = `${c.building ? get_building_by_id(c.building).name : get_tile_by_id(c.tile).name}`;
            let adj_item_type = c.building ? "building" : "tile"

            switch (c.comparison_type) {
                case BuildingConditionComparisonType.COUNT_OF_PLUS:
                    let joiner = "";
                    if (c.count != 0) {
                        joiner = ` ${(c.count < 0 ? "past" : "plus")} ${Math.abs(c.count)}`;
                    }

                    return `every ${c.adjacency} ${adj_item} ${adj_item_type}${joiner}`;

                case BuildingConditionComparisonType.MINUS_COUNT_OF:
                    return `${c.count} - 1 for every ${c.adjacency} ${adj_item} ${adj_item_type}`;

                default:
                    return "!!UNKNOWN!!";
            }
        }).join(" plus ");

        // if there are counters and conditions, add a joiner, else don't
        let count_test_joiner = this.count_conditions.length > 0 && this.test_conditions.length > 0 ? ", if " : "";

        let test_string_sec = this.test_conditions.map(c => {
            let adj_item = `${c.building ? get_building_by_id(c.building).name : get_tile_by_id(c.tile).name}`;
            let adj_item_type = c.building ? "building" : "tile";
            if (c.count != 1) {
                adj_item_type += "s";
            }

            switch (c.comparison_type) {
                case BuildingConditionComparisonType.EQUAL:
                    if (c.count == 0) {
                        return `not ${c.adjacency} to any ${adj_item} ${adj_item_type}`
                    } else {
                        return `${c.adjacency} to exactly ${c.count} ${adj_item} ${adj_item_type}`
                    }

                case BuildingConditionComparisonType.GREATER_THAN:
                    if (c.adjacency == BuildingConditionAdjacencyType.ORTHOGONAL && c.count == 4) {
                        return `${c.adjacency} to ${adj_item} ${adj_item_type} on all sides`;
                    } else if (c.adjacency == BuildingConditionAdjacencyType.ALL && c.count == 8) {
                        return `surrounded with ${adj_item} ${adj_item_type}`;
                    } else {
                        return `${c.adjacency} to more than ${c.count} ${adj_item} ${adj_item_type}`;
                    }
                
                case BuildingConditionComparisonType.LESS_THAN:
                    if (c.count <= 1) {
                        return `not ${c.adjacency} to any ${adj_item} ${adj_item_type}`
                    } else {
                        return `${c.adjacency} to less than ${c.count} ${adj_item} ${adj_item_type}`
                    }

                default:
                    return "!!UNKNOWN!!";
            }
        }).join(" and ")

        conditions_str += `${count_string_sec}${count_test_joiner}${test_string_sec}`;

        this.bonus.generate_bonus_string();
        this.bonus_string = `${this.bonus.bonus_string} ${conditions_str}`;
    }
}

class Building {
    static id_inc = 1;

    constructor(name, sprite, reagents, products, time_taken, placement_bonus, upgrades) {
        this.id = Building.id_inc;
        Building.id_inc++;

        this.name = name;
        this.sprite = sprite;
        this.reagents = reagents;
        this.products = products;
        this.time_taken = time_taken;
        this.placement_bonus = placement_bonus;

        this.upgrades = upgrades;
    }
}

function get_building_by_id(id) {
    return buildings[id-1];
}

function get_tile_by_id(id) {
    throw Error("not implemented");
}

let buildings = []

document.addEventListener("DOMContentLoaded", function(e) {
    buildings.push(new Building(
        "Scrimblo factory", null, [], [], 1, new BuildingPlacementBonus(
            [
                new BuildingPlacementCondition(
                    BuildingConditionAdjacencyType.ALL, 1, null,
                    BuildingConditionComparisonType.EQUAL, 2
                ),

                new BuildingPlacementCondition(
                    BuildingConditionAdjacencyType.ORTHOGONAL, 2, null,
                    BuildingConditionComparisonType.COUNT_OF_PLUS, 0
                )
            ], new BuildingBonus(
                BuildingBonusType.CRAFT_SPEED, 0.25
            )
        ), []
    ))

    buildings.push(new Building(
        "Stupid pit", null, [], [], 1, new BuildingPlacementBonus([
            new BuildingPlacementCondition(
                BuildingConditionAdjacencyType.ALL, 2, null, BuildingConditionComparisonType.GREATER_THAN, 6
            )
        ], new BuildingBonus(
            BuildingBonusType.CRAFT_SPEED, 0.25
        )), []
    ))

    buildings.forEach(building => building.placement_bonus.generate_placement_bonus_string())

    get_canvases();

    handle_resize();
});