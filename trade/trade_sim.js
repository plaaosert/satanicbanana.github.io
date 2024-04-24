/*
= Settlements
settlements contain industries which create resources by expending other resources.
settlements can select taxes on a per-resource basis, default 12%. this applies to all sales and purchases, usable by the settlement for building more industries.
settlements always contain an industry (People) which produces population (a resource) at the cost of a bunch of other resources.
the People industry works identically to other industries, except it doesn't create sell orders or produce anything, instead increasing Stability.
Stability can be from 0% to 100%. At 50% stability, the settlement does not change population. At 100%, it gains 5% per month. At 0%, it loses 5% per month.
The settlement will lose 1% stability every week (People counteracts this by adding 2% per week).


= Industries
industries have a storage for the resources they consume and produce. they will start making buy orders when they have 2 months or less of stockpiles.
the price they will make a buy order for is affected by urgency (how close to 0 are they) and the base price of the resource,
starting at 60% at 2 months stockpiled and 200% at completely empty
they will try to buy up to 50% of their total funds or up to 2 months' worth of resources, whichever is lower.

sell orders are created automatically whenever the industry has more than 10% max goods in their production stockpile.
price of a sell order is based on how much of the resource the industry has and the market value - 10% full means 150% price, 100% full means 40% price.

if a buy/sell order isn't fulfilled for one week, it is invalidated (and therefore remade).
buy and sell orders may be fulfilled within the settlement - instantly if the buy price is <= sell price or vice versa.

industries will stop producing anything if they don't have enough resources, or have a full production stockpile.
industries also have a consistent cost per month which is taken out of their funds - if they run out, the entire business vanishes(!)


= Resources
resource prices are determined by the local market value. this is the average of all recent buy/sell transactions,
going back 3 months (weighting per transaction based on how recent it was; 1 at "right now", 0 at 3 months).
current orders also contribute to market value as if they had 0.75 weight.
if there are no market orders, tries to derive the price based on supply chains
(market value of precursors to make 1 unit, plus upkeep cost of the average industry multiplied by the production time).
derivation of resource value picks the cheapest source if multiple exist, prioritising industries that exist in the settlement, using all possible industries otherwise
if this isn't possible (e.g. the resource has no industries to create it), falls back to a base value

perishable resources also have lifetimes. these resources will vanish after their lifetime ends.
traders will take this into account when planning routes.
resources get 2 extra days of lifetime when picked up by a trader.

= Traders
traders are separate entities that move between settlements carrying goods.
traders only care about their own profit. they will purchase things where they're cheap and sell them where they're expensive.
traders have a set of units for defense (including the leader, who is usually a civilian) and a fleet of wagons
wagons cost a specific amount and have a consistent upkeep over time. each wagon carries a specific group of goods
e.g. one might carry food, another might carry gems, etc
traders don't have perfect information. they'll remember the price of goods in places they've been to.
based on how old the information is, traders will assume prices went down or up (assume bad),
then eventually invalidate the information, affected by their "optimism" stat.
when traders have excess money, they may purchase more units or wagons.
they will pick this based on their "fear" variable, which changes based on their "suspicion" stat and:
    - whether they saw / were attacked by bandits or law enforcement (recent events cause more fear, bandits produce more fear for non-smugglers)
    - if they have traded illegal items recently; if they have, they get a huge fear bonus (and essentially become smugglers)

fearful traders will buy more units to protect their wagons (if trader), and avoid buying more wagons
*/

// TODO buy and sell orders,
// make industries accept buy and sell orders
// then see how traders fit in

const Resource = {
    MEAT: "Meat",
    FISH: "Fish",
    FRUIT: "Fruit",
    VEGETABLES: "Vegetables",
    FOOD: "Food",
    DOMESTIC_GOODS: "Domestic Goods",
    LUXURY_GOODS: "Luxury Goods",
    ARTISAN_GOODS: "Artisan Goods",
    WOOD: "Wood",
    LUMBER: "Lumber",
    COPPER_ORE: "Copper Ore",
    COPPER: "Copper",
    IRON_ORE: "Iron Ore",
    IRON: "Iron",
    GOLD_ORE: "Gold Ore",
    GOLD: "Gold",
    GEMSTONES: "Gemstones",
    COAL: "Coal",
    STEEL: "Steel",
    WEAPONS: "Weapons",
    TOOLS: "Tools",
}

const ResourceInformation = {
    [Resource.MEAT]: {
        base_value: 20,
        lifetime: 3,
        illegal: false
    },

    [Resource.FISH]: {
        base_value: 15,
        lifetime: 7,
        illegal: false
    },

    [Resource.FRUIT]: {
        base_value: 10,
        lifetime: 4,
        illegal: false
    },

    [Resource.VEGETABLES]: {
        base_value: 7,
        lifetime: 14,
        illegal: false
    },

    [Resource.FOOD]: {
        base_value: 1,
        lifetime: 7,
        illegal: false
    },

    [Resource.DOMESTIC_GOODS]: {
        base_value: 1,
        lifetime: 0,
        illegal: false
    },

    [Resource.LUXURY_GOODS]: {
        base_value: 1,
        lifetime: 0,
        illegal: false
    },

    [Resource.ARTISAN_GOODS]: {
        base_value: 1,
        lifetime: 0,
        illegal: false
    },

    [Resource.WOOD]: {
        base_value: 1,
        lifetime: 0,
        illegal: false
    },

    [Resource.LUMBER]: {
        base_value: 1,
        lifetime: 0,
        illegal: false
    },

    [Resource.COPPER_ORE]: {
        base_value: 1,
        lifetime: 0,
        illegal: false
    },

    [Resource.COPPER]: {
        base_value: 1,
        lifetime: 0,
        illegal: false
    },

    [Resource.IRON_ORE]: {
        base_value: 1,
        lifetime: 0,
        illegal: false
    },

    [Resource.IRON]: {
        base_value: 1,
        lifetime: 0,
        illegal: false
    },

    [Resource.GOLD_ORE]: {
        base_value: 1,
        lifetime: 0,
        illegal: false
    },

    [Resource.GOLD]: {
        base_value: 1,
        lifetime: 0,
        illegal: false
    },

    [Resource.GEMSTONES]: {
        base_value: 1,
        lifetime: 0,
        illegal: false
    },

    [Resource.COAL]: {
        base_value: 1,
        lifetime: 0,
        illegal: false
    },

    [Resource.STEEL]: {
        base_value: 1,
        lifetime: 0,
        illegal: false
    },

    [Resource.WEAPONS]: {
        base_value: 1,
        lifetime: 0,
        illegal: true
    },

    [Resource.TOOLS]: {
        base_value: 1,
        lifetime: 0,
        illegal: true
    }
}

class Settlement {
    constructor(name, industries=[], population=100, funds=0, tax_rate=0.12, stability=75) {
        this.name = name;
        this.industries = industries.slice();
        this.funds = funds;
        this.population = population;
        this.tax_rate = tax_rate;
        this.stability = stability;

        this.orders = [];
        this.market_prices = null;

        this.industries.push(new Industry(industry_template_list["People"]))
    }

    update_market_prices() {

    }

    pass_day() {
        // process any waiting traders

        // expire any out-of-date orders

        // update local market prices

        // pass days for industries
        this.industries.forEach(industry => {
            industry.pass_day();
        })
    }
}

class IndustryTemplate {
    constructor(name, resources_in, resources_out, upkeep_daily, days_per_production) {
        this.name = name;
        this.resources_in = resources_in.slice();
        this.resources_out = resources_out.slice();
        this.upkeep_daily = upkeep_daily
        this.days_per_production = days_per_production
    }
}

class Industry {
    static id_inc = 0;

    constructor(template, settlement, funds=0, input_stockpile=[], output_stockpile=[], cur_days_stored=0) {
        this.id = Industry.id_inc;
        Industry.id_inc++;

        this.template = template
        this.settlement = settlement;

        this.funds = funds
        this.input_stockpile = input_stockpile;
        this.output_stockpile = output_stockpile;
        this.cur_days_stored = cur_days_stored;
    }

    get_stockpile_resource_amount(stockpile, resource) {
        return stockpile.reduce((prev, cur) => {
            if (cur.resource == resource) {
                return prev + cur.amount;
            }

            return prev;
        }, 0);
    }

    put_in_stockpile(stockpile, resource, amount) {
        stockpile.push(new ResourceBundle(resource, amount));
    }

    take_from_stockpile(stockpile, resource, amount) {
        let amount_to_take = amount;
        let relevant_bundles = stockpile.filter(t => t.resource == resource).sort((a, b) => a.amount - b.amount);

        while (amount_to_take > 0 && relevant_bundles.length > 0) {
            let r = relevant_bundles[0];
            let take_amount = Math.min(amount_to_take, r.amount);

            if (take_amount >= r.amount) {
                r.amount = 0;
                relevant_bundles.shift();
            } else {
                r.amount -= take_amount;
            }

            amount_to_take -= take_amount;
        }

        stockpile.sort((a, b) => a.amount - b.amount)
        while (stockpile.length > 0 && stockpile[0].amount <= 0) {
            stockpile.shift();
        }
    }

    age_stockpile(stockpile) {
        let new_stockpile = [];
        stockpile.forEach(resource => {
            if (resource.pass_day()) {
                // leave it out
            } else {
                new_stockpile.push(resource);
            }
        })

        return new_stockpile;
    }

    produce_goods() {
        this.template.resources_out.forEach(resource => {
            if (resource.spc) {
                this.settlement[resource.spc] += resource.amt;
            } else {
                this.put_in_stockpile(this.output_stockpile, resource.res, resource.amt)
            }
        })
    }

    consume_goods_resources() {
        this.template.resources_in.forEach(resource => {
            this.take_from_stockpile(this.input_stockpile, resource.res, resource.amt);
        })
    }

    has_resources_for_goods() {
        return this.template.resources_in.every(resource => {
            if (this.get_stockpile_resource_amount(this.input_stockpile, resource.res) >= resource.amt) {
                return true;
            }

            return false;
        })
    }

    pass_day() {
        this.cur_days_stored++;
        
        this.input_stockpile = this.age_stockpile(this.input_stockpile);
        this.output_stockpile = this.age_stockpile(this.output_stockpile);

        this.funds -= this.template.upkeep_daily;

        if (this.cur_days_stored >= this.template.days_per_production) {
            this.cur_days_stored -= this.template.days_per_production;

            if (this.has_resources_for_goods()) {
                this.consume_goods_resources();
                this.produce_goods();
            }
        }
    }

    debug_get_all_resources(num_productions=1) {
        this.template.resources_in.forEach(r => {
            this.put_in_stockpile(this.input_stockpile, r.res, r.amt * num_productions);
        })
    }
}

class ResourceBundle {
    constructor(resource, amount, age=0) {
        this.resource = resource;
        this.amount = amount;
        this.age = age;
    }

    pass_day() {
        this.age++;
        if (this.age >= ResourceInformation[this.resource].lifetime) {
            return true;
        }

        return false;
    }
}

const industry_template_list = {
    "People": new IndustryTemplate(
        "People", [
            {res: Resource.FOOD, amt: 10},
            {res: Resource.DOMESTIC_GOODS, amt: 5},
            {res: Resource.ARTISAN_GOODS, amt: 2},
            {res: Resource.LUXURY_GOODS, amt: 1},
            {res: Resource.LUMBER, amt: 3}
        ], [
            {spc: "stability", amt: 2}
        ], 0, 7
    ),

    "Food Company": new IndustryTemplate(
        "Food Company", [
            {res: Resource.MEAT, amt: 1},
            {res: Resource.FISH, amt: 1},
            {res: Resource.FRUIT, amt: 1},
            {res: Resource.VEGETABLES, amt: 2}
        ], [
            {res: Resource.FOOD, amt: 10}
        ], 10, 1
    )
}
