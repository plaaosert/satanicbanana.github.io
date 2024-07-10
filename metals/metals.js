/*
average process is:
- get rock. each rock has unique contaminants which are picked based on the mine it comes from
- melt rock, macerate for bonus yield, powderise for even more. blast furnaces can be used to insert a lot of carbon into a metal as it melts (best used with iron).
- mix in solid items to remove impurities (lime, calcium) - other machines for stuff like passing oxygen through it, also for removing impurities
- add alloy items; for steel this is carbon as crushed coal coke, which is hopefully already added from the blast furnace, for bronze it would be copper+tin
- cast either as single objects or as a continuous bar (billet/bloom/slab). continuous casting is less wasteful but less versatile for shaping. 
   some continuous casting machines also perform some kind of heat treatment too
- perform (further) heat treatment and/or hot/cold working, repeat as desired. most of these hot/cold working machines are compatible with only specific shapes.
- shape at this point too if necessary (only for continuous casting), as either hot or cold work.
- cooling throughout, but it needs to end at room temperature, either through air cooling over a long period or by quenching

heat treatment:
- annealing; increases the crystal uniformity by heating to upper critical and then slowly cooling the metal. prevents problems in metals which don't deal well with fast cooling, but softens it
- normalizing; similar to annnealing but cools in air
- quenching; rapid cooling through either gas (super fast) or fluid (slower)

material property of the object is based on the average of all possible alloys (many defined) weighted by the closeness of the object's composition to each alloy
this is then modified by a few factors:
- crystal structure uniformity, improves hardness and endurance/brittleness durability, improved by staying at high (UC+) temperatures, hurt by any kind of working 
- stress, reduces durability of all types, reduced by working, increased by fast cooling
- softness modifier, reduces hardness and yield durability, increased by staying at high (UC+) temperatures, reduced by fast cooling (for steel! but if iron is <60%, softness will increase instead) and cold working.
- brittleness modifier, reduces brittleness durability, increased by fast cooling, reduced by staying at mid-high (LC+) temperatures


calcium oxide removes sulfur and phosphorus
*/

const Compound = {
    IRON, 
    COPPER,
    ALUMINIUM,

    MANGANESE, SILICON, SULFUR, PHOSPHORUS,

    CARBON,
    SILICON_OXIDE,
}

const Shape = {
    MOLTEN,

    // compatible with continuous casting
    BILLET, BLOOM, SLAB, ANGLE, TUBING, I_BEAM,

    // not compatible
    PLATE,

    // must be done in a casting machine which supports custom shapes, limitation is size of shape
    CUSTOM_PART,
}

// quenching will modify softness by a factor determined by the proportion of these materials in the alloy.
// for example, if positive quenchers take up 40% of the alloy, the softness will INCREASE by 0.2x normal.
// if 100%, softness will DECREASE by 1x normal (*-1)
const Compound_PositiveQuenchHardness = [IRON];

const room_temperature = 293;

const AlloyTag = {
    CORROSION_RESISTANCE,
    OXIDATION_RESISTANCE
}

function c_k(t) {
    return t + 273;
}

function k_c(t) {
    return t - 273;
}

class AlloyProperties {                                                     // resist deformation    // resist repeated stress   // resist fracturing (non-plastic, just breaking)
    constructor(lower_critical_t, upper_critical_t, density, base_hardness, base_yield_str,          base_endurance_str,         base_brittle_str) {
        this.lower_critical_t = lower_critical_t;
        this.upper_critical_t = upper_critical_t;
        this.density = density;
        this.base_hardness = base_hardness;  // use rockwell hardness, but this won't be 1:1 at the end because of modifiers
        this.base_yield_str = base_yield_str;  // "tensile strength, yield", MPa, same as above
        this.base_endurance_str = base_endurance_str;  // based on "elongation at break", %, A36 steel is 20% here
        this.base_brittle_str = base_brittle_str;  // based on "shear modulus"
    }
}

class AlloyData { 
    constructor(name, makeup, properties, special_tags) {
        this.name = name;
        this.makeup = makeup;
        this.properties = properties;
    }

    compare_composition(other) {
        
    }
}

let alloy_list = [
    new AlloyData(
        "Plain Carbon Steel", {
            [Compound.CARBON]:     0.27,
            [Compound.COPPER]:     0.2,
            [Compound.IRON]:       98.13,
            [Compound.MANGANESE]:  1.03,
            [Compound.PHOSPHORUS]: 0.040,
            [Compound.SILICON]:    0.280,
            [Compound.SULFUR]:     0.050
        }, new AlloyProperties(
            c_k(677), c_k(899),
            7.85, 75, 250, 20, 79.3
        )
    )
]

class MetalObject {
    constructor() {
        this.temperature = 0;
        this.last_temperature = 0;

        this.shape = Shape.MOLTEN;

        this.composition = [];

        this.crystal_uniformity = 0;
        this.stress = 0;
        this.softness_modifier = 0;
        this.brittleness_modifier = 0;
    }

    get_current_alloy_properties() {

    }

    // heating_factor is the amount of "force" put into the temperature difference. for example, heat treatment might heat and cool slowly, while quenching is very fast
    update(delta_time, external_temperature, heating_factor) {
        /*
        - crystal structure uniformity, improves hardness and endurance/brittleness durability, improved by staying at high (UC+) temperatures, hurt by any kind of working 
        - stress, reduces durability of all types, reduced by working, increased by fast cooling
        - softness modifier, reduces hardness and yield durability, increased by staying at high (UC+) temperatures, reduced by fast cooling (for steel! but if iron is <60%, softness will increase instead) and cold working.
        - brittleness modifier, reduces brittleness durability, increased by fast cooling, reduced by staying at mid-high (LC+) temperatures
        */

        this.last_temperature = this.temperature;

        let temperature_diff = external_temperature - this.temperature;
        let amount_to_change = temperature_diff * heating_factor * delta_time;
    }
}