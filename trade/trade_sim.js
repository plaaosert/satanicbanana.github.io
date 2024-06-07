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
they will try to buy up to 30% of their total funds, 3 months' worth or the total resource lifetime's worth of resources, whichever is lower.

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
derivation of resource value picks the average if multiple exist, prioritising industries that exist in the settlement, using all possible industries otherwise
if this isn't possible (e.g. the resource has no industries to create it), falls back to a base value

perishable resources also have lifetimes. these resources will vanish after their lifetime ends.
traders will take this into account when planning routes.
resources get 2 extra days of lifetime when picked up by a trader.

= Traders
traders are separate entities that move between settlements carrying goods.
traders only care about their own profit. they will purchase things where they're cheap and sell them where they're expensive.
traders do care about supplies, however. they need Food constantly, which they will try to stockpile as much as they can.
traders have a set of units for defense (including the leader, who is usually a civilian) and a fleet of wagons
wagons cost a specific amount and have a consistent upkeep over time. each wagon carries a specific group of goods
e.g. one might carry food, another might carry gems, etc
traders don't have perfect information. they'll remember the price of goods in places they've been to.
based on how old the information is, traders will assume prices have varied by a specific amount, with the "origin" of the variance based on optimism
(so if high optimism, assumption will be that the price has likely increased, while with low optimism the opposite assumption is made)
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
        lifetime: 7,
        illegal: false
    },

    [Resource.FISH]: {
        base_value: 15,
        lifetime: 10,
        illegal: false
    },

    [Resource.FRUIT]: {
        base_value: 10,
        lifetime: 14,
        illegal: false
    },

    [Resource.VEGETABLES]: {
        base_value: 7,
        lifetime: 21,
        illegal: false
    },

    [Resource.FOOD]: {
        base_value: 1,
        lifetime: 14,
        illegal: false
    },

    [Resource.DOMESTIC_GOODS]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: false
    },

    [Resource.LUXURY_GOODS]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: false
    },

    [Resource.ARTISAN_GOODS]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: false
    },

    [Resource.WOOD]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: false
    },

    [Resource.LUMBER]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: false
    },

    [Resource.COPPER_ORE]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: false
    },

    [Resource.COPPER]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: false
    },

    [Resource.IRON_ORE]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: false
    },

    [Resource.IRON]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: false
    },

    [Resource.GOLD_ORE]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: false
    },

    [Resource.GOLD]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: false
    },

    [Resource.GEMSTONES]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: false
    },

    [Resource.COAL]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: false
    },

    [Resource.STEEL]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: false
    },

    [Resource.WEAPONS]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: true
    },

    [Resource.TOOLS]: {
        base_value: 1,
        lifetime: Number.POSITIVE_INFINITY,
        illegal: true
    }
}

class WagonTemplate {
    constructor(name, valid_resources, resources_to_build, days_labour_to_build) {
        this.name = name;
        this.valid_resources = valid_resources;
        this.resources_to_build = resources_to_build;
        this.days_labour_to_build = days_labour_to_build;
    }
}

class Wagon {
    constructor(template, owner) {
        this.template = template;
        this.owner = owner;

        this.resources = [];
    }

    pass_day() {
        // age all the goods in the bundles
    }
}

class Trader {
    constructor(name, col, position, funds, wagons, optimism, expected_price_variance, memory_length_days, patience, fear) {
        // dummy class for now
        this.name = name;
        this.col = col;
        this.position = position;

        this.funds = funds;
        this.wagons = wagons;

        this.in_settlement = null;
        this.destination = null;

        this.days_in_settlement = 0;

        this.optimism = optimism;
        this.expected_price_variance = expected_price_variance;
        this.memory_length_days = memory_length_days;
        this.patience = patience;
        this.fear = fear;

        // {settlement: {prices: Map{resource, price}, knowledge_age}
        this.price_memory = new Map();

        // speed is reduced by size of wagon fleet. max 8 tiles/day, min 2 tiles/day
        // movement is conducted in 8 subsections for each day
    } 

    get_size() {
        return 2;
    }

    pass_day() {
        // pass day for wagons and remove supplies
        this.wagons.forEach(wagon => {
            wagon.pass_day();
        })

        // then move if moving

        // if in a settlement, decide if it's time to leave or not.
        // wish to leave is increased by:
        //  - days in settlement (scaled by patience)
        //  - ability to make good trades with current supplies
        //
        // if wanting to leave but not enough resources to make the journey, will consider selling cargo to get enough
        //
    }
}

class Order {
    static id_inc = 0;

    constructor(industry, resource_bundle, price_per_item, selling, max_age=7) {
        this.id = Order.id_inc;
        Order.id_inc++;

        this.industry = industry;
        this.resource_bundle = resource_bundle;
        this.price_per_item = price_per_item;
        this.selling = selling ? true : false;

        this.age = 0;
        this.max_age = max_age;

        this.expired = false;  // set to true when the order is filled, or expires
    }

    pass_day() {
        this.age++;

        if (this.resource_bundle.pass_day()) {
            // if the goods in the order expire, the order also expires
            this.expired = true;
        }

        if (this.age >= this.max_age) {
            this.expired = true;
        }

        return this.expired;
    }
}

class Settlement {
    constructor(name, position, industries=[], population=100, funds=0, tax_rate=0.12, stability=75) {
        this.name = name;

        this.position = position;

        this.industries = [];
        this.industries.push(new Industry(industry_template_list["People"], this, 10000));

        this.industries = [...this.industries, ...industries.map(i => {
            i.settlement = this;
            return i;
        })];

        this.funds = funds;
        this.population = population;
        this.tax_rate = tax_rate;
        this.stability = stability;

        this.orders = [];
        this.market_sell_prices = new Map();
        this.market_buy_prices = new Map();

        this.order_history = [];
    }

    get_size() {
        return Math.max(4, Math.floor(Math.log10(this.population) * 2))
    }

    update_market_prices() {
        this.market_sell_prices = new Map();
        this.market_buy_prices = new Map();

        let ts = [[this.market_buy_prices, false], [this.market_sell_prices, true]];

        ts.forEach(p => {
            Object.values(Resource).forEach(r => {
                let relevant_past_orders = this.order_history.filter(order => order.resource_bundle.resource == r && p[1] == order.selling);
                let relevant_current_orders = this.orders.filter(order => order.resource_bundle.resource == r && p[1] == order.selling);
                
                let num_relevant_orders = (relevant_past_orders.length + relevant_current_orders.length);

                if (num_relevant_orders > 0) {
                    let avg_price = [
                        ...relevant_past_orders.map(order => (order.price_per_item * ((90 - order.age) / 90)) / order.resource_bundle.amount),
                        ...relevant_current_orders.map(order => (order.price_per_item * 0.75) / order.resource_bundle.amount)
                    ].reduce((p, c) => p + c, 0) / num_relevant_orders;

                    p[0].set(r, avg_price);
                } else {
                    // otherwise, derive the resource value after we finish this.
                    // so set it to -1 to indicate that
                    p[0].set(r, -1);
                }
            })
        })

        // derivation step
        ts.forEach(p => {
            Object.values(Resource).forEach(r => {
                if (p[0].get(r) == -1) {
                    // need to derive the resource's price
                    this.derive_resource_price(r, p[0]);
                }
            });
        });
    }
    
    derive_resource_price(resource, prices_set) {
        // get the industry templates that produce this resource
        // and figure out the price of each
        // this is the market value of the precursors + (upkeep cost of the industry * days taken to produce)
        let all_industry_producers = Object.values(industry_template_list).filter(industry => {
            return industry.resources_out.some(out => out.res == resource);
        });

        let settlement_industry_producers = this.industries.filter(industry => {
            return industry.template.resources_out.some(out => out.res == resource);
        }).map(industry => industry.template);

        let list_to_use = settlement_industry_producers.length > 0 ? settlement_industry_producers : all_industry_producers;
        if (list_to_use.length <= 0) {
            // use the resource's base price (this is a last resort!)
            console.log(`Used a fallback base price for ${resource}`);
            prices_set.set(resource, ResourceInformation[resource].base_value);
            return;
        }
        
        let projected_prices = list_to_use.map(industry => {
            let total_precursors_price = industry.resources_in.reduce((p, c) => {
                if (!c.res) {
                    return p;
                }

                if (!prices_set.has(c.res)) {
                    // need to derive this one's price too
                    this.derive_resource_price(c.res, prices_set);
                }

                return p + (prices_set.get(c.res) * c.amt);
            }, 0);

            // price of precursors plus upkeep * days taken per craft
            // divided by amount of resource created
            let total_cost_per_craft = total_precursors_price + (industry.upkeep_daily * industry.days_per_production);

            let target_resource_amount = industry.resources_out.find(r => r.res == resource).amt;

            return total_cost_per_craft / target_resource_amount;
        });

        prices_set.set(resource, Math.round(projected_prices.reduce((p, c) => p + c) / projected_prices.length));
    }

    update_orders() {
        let new_orders = [];

        this.orders.forEach(order => {
            // obey expiries for sell orders but not buy orders
            let expired = order.pass_day();

            if (expired && order.selling) {
                // don't do anything - it expired and we need to get rid of it
            } else {
                new_orders.push(order);
            }
        })

        this.orders = new_orders;
    }

    pay_industry(industry, amount) {
        // settlement takes a certain cut
        // TODO might need to modify buy/sell prices based on tax rate?
        let taxed_funds = Math.floor(amount * this.tax_rate);

        industry.funds += (amount - taxed_funds);

        this.funds += taxed_funds;
    }

    pass_day() {
        // process any waiting traders

        // temporarily immediately fill all orders here
        // traders might only partially fill orders - if they do, just take away from the bundle
        // and keep the order

        // ordinarily, here we would resolve any buy/sell orders internally (if there is a sell order for less than a buy order, or a buy order for more than a sell order)
        // then tell all the traders currently in the city to make their orders and resolve them too (instantly).
        // orders would then last as long as the trader's patience. traders can make only one order at a time.
        // if traders aren't successfully buying anything, they'll steadily lower their expectations (this happens naturally as they "learn" the local value of goods)
        this.orders.forEach(order => {
            if (order.selling) {
                // give the industry the money
                this.pay_industry(order.industry, order.price_per_item * order.resource_bundle.amount);
            } else {
                // give the industry the goods
                order.industry.put_bundle_in_stockpile(order.industry.input_stockpile, order.resource_bundle)
            }
        })
        this.orders = [];

        // expire any out-of-date orders
        this.update_orders();

        // update local market prices
        this.update_market_prices();

        // pass days for industries
        this.industries.forEach(industry => {
            industry.pass_day();
            industry.make_orders();

            if (industry.template.name == "Food Company") {
                console.log(`food company funds: ${industry.funds}`);
            }
        })

        // do stuff for the settlement (population change etc)
        this.stability = Math.max(0, Math.min(100, this.stability - 0.16))
        let factor = 0.999 + (0.002 * this.stability * 0.01);

        this.population = Math.floor(this.population * factor);
    }

    get_industry_orders(industry, buy=true, sell=true) {
        return this.orders.filter(order => {
            return order.industry.id == industry.id && (buy && !order.selling) && (sell && order.selling);
        })
    }

    create_buy_order(industry, resource, amount, price_per_item) {
        this.orders.push(new Order(
            industry, new ResourceBundle(resource, amount, 0, true),
            price_per_item, false, 7
        ))
    }

    create_sell_order(industry, resource, amount, price_per_item, starting_age) {
        this.orders.push(new Order(
            industry, new ResourceBundle(resource, amount, starting_age),
            price_per_item, true, 7
        ))
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

    put_bundle_in_stockpile(stockpile, bundle) {
        stockpile.push(bundle);
    }

    take_from_stockpile(stockpile, resource, amount) {
        let amount_to_take = amount;
        let relevant_bundles = stockpile.filter(t => t.resource == resource).sort((a, b) => a.age - b.age);

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
                // leave it out, it's expired
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
            let amt = this.template.name == "People" ? resource.amt * (this.settlement.get_size() - 3) : resource.amt; 
            this.take_from_stockpile(this.input_stockpile, resource.res, amt);
        })
    }

    has_resources_for_goods() {
        return this.template.resources_in.every(resource => {
            let amt = this.template.name == "People" ? resource.amt * (this.settlement.get_size() - 3) : resource.amt; 
            if (this.get_stockpile_resource_amount(this.input_stockpile, resource.res) >= amt) {
                return true;
            }

            return false;
        })
    }

    pass_day() {
        this.cur_days_stored++;
        
        this.input_stockpile = this.age_stockpile(this.input_stockpile);
        this.output_stockpile = this.age_stockpile(this.output_stockpile);

        // limit is 3 months of production.
        // if we're over the limit, throw away the rest
        this.template.resources_out.forEach(resource_out => {
            let amount_max = (resource_out.amt / this.template.days_per_production) * 90;
            let amount_to_dump = this.get_stockpile_resource_amount(this.output_stockpile, resource_out.res) - amount_max;
            
            if (amount_to_dump > 0) {
                this.take_from_stockpile(this.output_stockpile, amount_to_dump);
            }
        })

        // buy stockpile has no limit since industries won't ever buy above 3 months anyway

        this.funds -= this.template.upkeep_daily;

        if (this.cur_days_stored >= this.template.days_per_production) {
            this.cur_days_stored -= this.template.days_per_production;

            if (this.has_resources_for_goods()) {
                this.consume_goods_resources();
                this.produce_goods();
            }
        }
    }

    make_orders() {
        // when an order is made, the industry loses the goods / money in question.
        // an industry won't duplicate the same order for buying, but might duplicate orders for selling different sets of goods.
        let buy_orders = this.settlement.get_industry_orders(this, true, false);
        let sell_orders = this.settlement.get_industry_orders(this, false, true);

        let buy_orders_to_create = [];
        this.template.resources_in.forEach(resource_need => {
            if (buy_orders.some(order => order.resource_bundle.resource == resource_need.res)) {
                // don't make duplicate buy orders
                return;
            }

            // buy if stock is under 2 months' worth
            let days_to_purchase_to = Math.min(60, ResourceInformation[resource_need.res].lifetime);
            let amount_req_per_day = resource_need.amt / this.template.days_per_production;

            let days_available = this.get_stockpile_resource_amount(this.input_stockpile, resource_need.res) / amount_req_per_day;

            let days_needed = days_to_purchase_to - days_available;
            let funds_threshold = Math.max(0, this.funds * 0.3);

            // console.log(`need ${Math.floor(days_needed * 100) / 100} days of ${resource_need.res} (${Math.floor(days_needed * amount_req_per_day)})`);
            if (days_needed > 0) {
                // find out urgency factor, then multiply that with market price to get total price
                let urgency_factor = 0.6 + (1.4 * (days_needed / days_to_purchase_to));

                let price_per_item = Math.floor(urgency_factor * this.settlement.market_buy_prices.get(resource_need.res));

                // we'll either buy up to days_needed worth of items, or limit down to 30% current funds
                let funds_limit_items = funds_threshold / price_per_item;

                let required_num_items = days_needed * amount_req_per_day;

                let final_amount = Math.floor(Math.min(funds_limit_items, required_num_items));

                // add the order
                if (final_amount > 0) {
                    buy_orders_to_create.push([resource_need.res, final_amount, price_per_item]);
                }
            }
        });

        let sell_orders_to_create = [];
        this.template.resources_out.forEach(resource_out => {
            let amount_produced_per_day = resource_out.amt / this.template.days_per_production;

            // 10% of max (3 months)
            let max_capacity = amount_produced_per_day * 90;
            let minimum_sell_threshold = max_capacity / 10;
            let cur_amount = this.get_stockpile_resource_amount(this.output_stockpile, resource_out.res);

            if (cur_amount >= minimum_sell_threshold) {
                // find out the price based on how full the stockpile is.
                // 150% price if 10% full, 40% price if full
                let fullness = cur_amount / max_capacity;
                
                let fullness_factor = 1.62 - (fullness * 1.2);

                let sell_price = Math.ceil(fullness_factor * this.settlement.market_sell_prices.get(resource_out.res));

                sell_orders_to_create.push([resource_out.res, cur_amount, sell_price]);
            }
        })

        buy_orders_to_create.forEach(order => {
            // make the order, lose funds
            // console.log(`${this.template.name} making buy order for ${order[1]} ${order[0]} at ${order[2]} per item`);
            this.settlement.create_buy_order(this, order[0], order[1], order[2]);
            this.funds -= order[1] * order[2];
        });

        sell_orders_to_create.forEach(order => {
            // make the order, pull out bundles from stockpile to make it
            // consolidate items into a single bundle, but use the shortest lifetime(!)
            let bundles = this.output_stockpile.filter(t => t.resource == order[0]).sort((a, b) => b.age - a.age);
            let oldest_bundle = bundles[0];

            // console.log(`${this.template.name} making sell order for ${order[1]} ${order[0]} at ${order[2]} per item`);
            this.settlement.create_sell_order(this, order[0], order[1], order[2], oldest_bundle.age);

            this.take_from_stockpile(this.output_stockpile, order[0], order[1]);
        });
    }

    debug_get_all_resources(num_productions=1) {
        this.template.resources_in.forEach(r => {
            this.put_in_stockpile(this.input_stockpile, r.res, r.amt * num_productions);
        })
    }
}

class ResourceBundle {
    constructor(resource, amount, age=0, abstract=false) {
        this.resource = resource;
        this.amount = amount;
        this.age = age;
        this.abstract = abstract ? true : false;  // abstract resource bundles do not age (used for buy orders where they are simply representative of the goods)
    }

    pass_day() {
        if (!this.abstract) {
            this.age++;

            if (this.age >= ResourceInformation[this.resource].lifetime ) {
                return true;
            }
        }

        return false;
    }
}

class Game {
    constructor(world, settlements, traders) {
        this.world = world;
        this.settlements = settlements;
        this.traders = traders;
    }
}

// FOOD probably needs more sources
const industry_template_list = {
    "People": new IndustryTemplate(
        "People", [
            {res: Resource.FOOD, amt: 30},
            {res: Resource.DOMESTIC_GOODS, amt: 5},
            {res: Resource.ARTISAN_GOODS, amt: 2},
            {res: Resource.LUXURY_GOODS, amt: 1},
            {res: Resource.LUMBER, amt: 3},
            {res: Resource.TOOLS, amt: 1}
        ], [
            {spc: "stability", amt: 2}
        ], 0, 7
    ),

    // MEAT
    "Livestock Farm": new IndustryTemplate(
        "Livestock Farm", [
            {res: Resource.VEGETABLES, amt: 30},
            {spc: "source_meat"}
        ], [
            {res: Resource.MEAT, amt: 10}
        ], 10, 30
    ),

    "Hunters' Lodge": new IndustryTemplate(
        "Hunters' Lodge", [,
            {spc: "source_hunting_meat"}
        ], [
            {res: Resource.MEAT, amt: 25}
        ], 6, 60
    ),

    // FISH
    "Fishery": new IndustryTemplate(
        "Fishery", [
            {spc: "source_fish"}
        ], [
            {res: Resource.FISH, amt: 2}
        ], 20, 2
    ),

    // FRUIT
    "Orchard": new IndustryTemplate(
        "Orchard", [
            {spc: "source_fruit"}
        ], [
            {res: Resource.FRUIT, amt: 6}
        ], 10, 14
    ),

    // VEGETABLES
    "Farm": new IndustryTemplate(
        "Farm", [
            {spc: "source_vegetables"}
        ], [
            {res: Resource.VEGETABLES, amt: 10}
        ], 15, 14
    ),

    // FOOD
    "Soup Kitchen": new IndustryTemplate(
        "Soup Kitchen", [
            {res: Resource.VEGETABLES, amt: 2}
        ], [
            {res: Resource.FOOD, amt: 2}
        ], 10, 1
    ),

    "Cookhouse": new IndustryTemplate(
        "Cookhouse", [
            {res: Resource.FISH, amt: 1},
            {res: Resource.FRUIT, amt: 1}
        ], [
            {res: Resource.FOOD, amt: 3}
        ], 20, 1
    ),

    "Food Company": new IndustryTemplate(
        "Food Company", [
            {res: Resource.MEAT, amt: 2},
            {res: Resource.FISH, amt: 2},
            {res: Resource.FRUIT, amt: 4},
            {res: Resource.VEGETABLES, amt: 5}
        ], [
            {res: Resource.FOOD, amt: 10}
        ], 30, 1
    ),

    // DOMESTIC_GOODS
    "Workshop": new IndustryTemplate(
        "Workshop", [
            {res: Resource.LUMBER, amt: 12},
            {res: Resource.TOOLS, amt: 1},
            {res: Resource.IRON, amt: 5}
        ], [
            {res: Resource.DOMESTIC_GOODS, amt: 8}
        ], 25, 10
    ),

    // LUXURY_GOODS
    "Jeweler's Workshop": new IndustryTemplate(
        "Jeweler's Workshop", [
            {res: Resource.GEMSTONES, amt: 3},
            {res: Resource.TOOLS, amt: 1},
            {res: Resource.GOLD, amt: 6}
        ], [
            {res: Resource.LUXURY_GOODS, amt: 2}
        ], 20, 16
    ),

    // ARTISAN_GOODS
    "Artisan's Guild": new IndustryTemplate(
        "Artisan's Guild", [
            {res: Resource.LUMBER, amt: 6},
            {res: Resource.TOOLS, amt: 1},
            {res: Resource.COPPER, amt: 7},
            {res: Resource.IRON, amt: 4},
            {res: Resource.GOLD, amt: 2}
        ], [
            {res: Resource.ARTISAN_GOODS, amt: 3}
        ], 15, 12
    ),

    // WOOD
    "Logging Camp": new IndustryTemplate(
        "Logging Camp", [
            {spc: "source_wood"}
        ], [
            {res: Resource.WOOD, amt: 2}
        ], 15, 1
    ),

    // LUMBER
    "Lumber Mill": new IndustryTemplate(
        "Lumber Mill", [
            {res: Resource.WOOD, amt: 1}
        ], [
            {res: Resource.LUMBER, amt: 2}
        ], 25, 1
    ),

    // COPPER_ORE
    "Copper Mine": new IndustryTemplate(
        "Copper Mine", [
            {spc: "source_copper_ore"},
            {res: Resource.TOOLS, amt: 1}
        ], [
            {res: Resource.COPPER_ORE, amt: 30}
        ], 25, 10
    ),

    // COPPER
    "Copper Foundry": new IndustryTemplate(
        "Copper Foundry", [
            {res: Resource.COPPER_ORE, amt: 1}
        ], [
            {res: Resource.COPPER, amt: 1}
        ], 50, 1
    ),

    // IRON_ORE
    "Iron Mine": new IndustryTemplate(
        "Iron Mine", [
            {spc: "source_iron_ore"},
            {res: Resource.TOOLS, amt: 1}
        ], [
            {res: Resource.IRON_ORE, amt: 20}
        ], 30, 10
    ),

    // IRON
    "Iron Foundry": new IndustryTemplate(
        "Iron Foundry", [
            {res: Resource.IRON_ORE, amt: 3}
        ], [
            {res: Resource.IRON, amt: 2}
        ], 50, 1
    ),

    // GOLD_ORE
    "Gold Mine": new IndustryTemplate(
        "Gold Mine", [
            {spc: "source_gold_ore"},
            {res: Resource.TOOLS, amt: 1}
        ], [
            {res: Resource.GOLD_ORE, amt: 10}
        ], 30, 30
    ),

    // GOLD
    "Gold Foundry": new IndustryTemplate(
        "Gold Foundry", [
            {res: Resource.GOLD_ORE, amt: 3}
        ], [
            {res: Resource.GOLD, amt: 1}
        ], 70, 1
    ),

    // GEMSTONES
    "Gemstone Mine": new IndustryTemplate(
        "Gemstone Mine", [
            {spc: "source_gemstones"},
            {res: Resource.TOOLS, amt: 1}
        ], [
            {res: Resource.GEMSTONES, amt: 10}
        ], 60, 70
    ),

    // COAL
    "Coal Mine": new IndustryTemplate(
        "Coal Mine", [
            {spc: "source_coal"}
        ], [
            {res: Resource.COAL, amt: 5}
        ], 25, 1
    ),

    // STEEL
    "Steel Refinery": new IndustryTemplate(
        "Steel Refinery", [
            {res: Resource.COAL, amt: 4},
            {res: Resource.IRON, amt: 2}
        ], [
            {res: Resource.STEEL, amt: 2}
        ], 60, 2
    ),

    // WEAPONS
    "Weaponsmith": new IndustryTemplate(
        "Weaponsmith", [
            {res: Resource.STEEL, amt: 2}
        ], [
            {res: Resource.WEAPONS, amt: 1}
        ], 30, 3
    ),

    // TOOLS
    "Tool Smith": new IndustryTemplate(
        "Tool Smith", [
            {res: Resource.STEEL, amt: 2}
        ], [
            {res: Resource.TOOLS, amt: 1}
        ], 20, 2
    ),
}
