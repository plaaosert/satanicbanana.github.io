class Entry {
    constructor(title, colour, text) {
        this.title = title;
        this.colour = colour;
        this.text = text;
    }
}

let game_entries = [
    new Entry(
        "Ball", Colour.from_hex("#fcc"),
        "A ball is a fighter. All fighters are balls. There are no non-ball fighters. Even <span class='link'>Lemon</span> is a ball.<br><br>Also see <span class='link' data-linkto='ball' data-cat='lore'>Ball (lore)</span>"
    ),

    new Entry(
        "Level", Colour.from_hex("#cfc"),
        "A ball's level is the primary value that determines its overall power.<br>Each ball has a specific and unique level-up effect, plus an <span class='link'>Awakening</span> effect unlocked at level 100.<br><br>In <span class='link' data-linkto='campaign'>Campaign mode (WIP)</span>, balls will also gain bonus HP each level, up to 200 at level 100."
    ),

    new Entry(
        "Awakening", Colour.from_hex("#fcf"),
        "A ball at <span class='link'>level</span> 100 gains a unique bonus effect. Usually, the awakening effect alongside the cumulative level-up effects are enough to raise the ball to the next <span class='link'>tier</span>."
    ),

    new Entry(
        "Ailment", Colour.from_hex("#b6b"),
        "An ailment is an effect that deals damage to or in some other way hurts a ball. The three ailments in the game are <span class='link'>rupture</span>, <span class='link'>poison</span> and <span class='link'>burn</span>."
    ),

    new Entry(
        "Rupture", Colour.from_hex("#f66"),
        `Rupture is an <span class='link'>ailment</span>. A ball with rupture takes damage per second equal to its current rupture. Rupture decays by 50% per second and is represented by the character ${AILMENT_CHARS[0]}.<br><br>The amount of damage dealt by a given amount x of rupture is therefore x / Ln(2).<br><br>Ln(2) is approximately equal to 0.69315. So, rupture causes approximately 1.44x damage compared to straight damage (though this does not take into account subsequent applications).`
    ),

    new Entry(
        "Poison", Colour.from_hex("#9d9"),
        `Poison is an <span class='link'>ailment</span>. A ball with poison takes damage per second equal to <b>poison intensity</b>. All poison remains until <b>poison duration</b> fully expires, and any subsequent poison applications will add separate values to poison intensity and duration. Poison is represented by the character ${AILMENT_CHARS[1]}.`
    ),

    new Entry(
        "Burn", Colour.from_hex("#f80"),
        `Burn is an <span class='link'>ailment</span>. A ball with burn takes damage per second equal to current burn, and takes additional damage from all direct hits (not damage over time) equal to +20% per current burn. This means that a ball will take 1.1x damage at 0.5 burn, and 2x(!) damage at 5 burn. Burn is represented by the character ${AILMENT_CHARS[2]} and, for good reason, is the strongest ailment out of the three.`
    ),

    new Entry(
        "Tier", Colour.from_hex("#aaf"),
        `A ball's tier is a loose indication of the power level it sits in. As a general rule, the average winrate of a ball against all other balls in the same tier is around 50%. All <span style='background-color:${CATEGORIES_INFO.STANDARD.col.lerp(Colour.black, 0.8).css()}'>STANDARD</span> balls are base tier <span style='background-color:${TIERS_INFO.A.col.lerp(Colour.black, 0.6).css()}; color:${TIERS_INFO.A.col.css()}'>\xa0A\xa0</span>, and tier <span style='background-color:${TIERS_INFO.A.col.lerp(Colour.black, 0.6).css()}; color:${TIERS_INFO.APLUS.col.css()}'>\xa0A+\xa0</span> when awakened. The rest may be any tier.<br><br>Remember that this doesn't mean the winrate against <b>any</b> ball in the same tier is around 50%, just that the overall winrate against <b>all</b> other balls in that tier is around 50%.<br><br>List of tiers:<br>${
            Object.keys(TIERS).map(t => {
                let info = TIERS_INFO[t];
                return `<span style='background-color:${info.col.lerp(Colour.black, 0.6).css()}; color:${info.col.css()}'>\xa0${info.name}\xa0</span>${"\xa0".repeat(Math.max(8 - info.name.length))}| ${info.desc}`
            }).join("<br>")
        }`
    ),
    
    new Entry(
        "Category", Colour.from_hex("#eee"),
        `A category is a general theme that a ball fits into. The deepest category is <span style='color:${CATEGORIES_INFO.STANDARD.col.css()}; background-color:${CATEGORIES_INFO.STANDARD.col.lerp(Colour.black, 0.8).css()}'>STANDARD</span>, which contains balls that are explicitly balance tested against all others of the category to ensure each one has a ~50% average winrate. These balls are the primary focus of campaign mode alongside <span style='color:${CATEGORIES_INFO.HIGHTIER.col.css()}; background-color:${CATEGORIES_INFO.HIGHTIER.col.lerp(Colour.black, 0.8).css()}'>HIGHTIER</span> and <span style='color:${CATEGORIES_INFO.LOWTIER.col.css()}; background-color:${CATEGORIES_INFO.LOWTIER.col.lerp(Colour.black, 0.8).css()}'>LOWTIER</span> balls.<br><br>List of categories:<br><br>${
            Object.keys(CATEGORIES).map(t => {
                let info = CATEGORIES_INFO[t];
                return `<span style='background-color:${info.col.lerp(Colour.black, 0.8).css()}; color:${info.col.css()}'>\xa0${t}\xa0</span><br>${info.desc}`
            }).join("<br><br>")
        }`
    ),

    new Entry(
        "Skin", Colour.from_hex("#ffd"),
        "A skin is a non-gameplay-affecting aesthetic modification to a ball. Most skins will change the main weapon sprite, and some may add additional particle effects or create new ones. Some weapon skins change the sounds of the weapon or add new ones. The only thing a skin cannot do is change the gameplay or power level of a ball."
    ),

    new Entry(
        "Team", Colour.from_hex("#fcf"),
        "Balls enter battle with a team. Most balls cannot hit, parry or interact with allied team members, but some balls do have the ability to provide beneficial effects to allies. A battle will only end when one <b>team</b> remains, and all balls from the winning team are considered victorious, even if they do not survive to the end of the battle."
    ),

    new Entry(
        "Sandbox", Colour.from_hex("#bbf"),
        "Sandbox mode is the default mode in plaaoballs. In this mode, you can choose any matchup of up to 4 different balls and freely select their <span class='link' data-linkto='level'>levels</span>, <span class='link' data-linkto='skin'>skins</span> and <span class='link' data-linkto='team'>teams</span>."
    ),

    new Entry(
        "Cinema", Colour.from_hex("#bfb"),
        `A.K.A. 'Gambling'. Cinema mode produces an endless stream of matches (once every 90 seconds) between <span style='background-color:${CATEGORIES_INFO.STANDARD.col.lerp(Colour.black, 0.8).css()}; color:${CATEGORIES_INFO.STANDARD.col.css()}'>STANDARD</span> category balls at either level 1 or level 100, each capped at 60 seconds duration unlike the typical 300 seconds of a <span class='link'>sandbox</span> fight. You can bet <span class='link'>coins</span> on one <span class='link'>team</span> of these fights, gaining a payout if you bet correctly.<br><br>` +
        "Cinema is unique in that every player in the world sees the same matches at once, but requires no internet access. This means you can treat this as sort of an offline livestream."
    ),

    new Entry(
        "Campaign", Colour.from_hex("#fcc"),
        "Campaign mode is a game mode in which you will be able to gather balls to challenge tournaments, fight rivals and develop your team to climb the ranks of the Grand Arena and become the strongest ball team of all time! You will be able to upgrade your balls by levelling them up, as well as creating upgrades using <span class='link'>upgrade materials</span> to use alongside unique special upgrades and customise your ball build even further. Tournament formats will include 1v1, 1v1v1v1, 2v2 and 3v3 Knockout and online multiplayer WILL be a thing.<br><br>This mode is currently a work in progress. :("
    ),

    new Entry(
        "Coins", Colour.from_hex("#fc6"),
        "Coins are a currency gained in <span class='link'>Cinema</span> mode for betting correctly. They are not currently used for anything, but one day they will be."
    ),

    new Entry(
        "Upgrade materials", Colour.from_hex("#fff"),
        "Upgrade materials are used for ball upgrades in Campaign mode. They are also the namesakes for ball alignments.<br><br>List of upgrade materials/alignments:<br><br>" +
        `${Object.keys(materials2sprites).map(k => {
            let desc = materials2descs[k];
            let sprs = materials2sprites[k];

            let col = Colour.from_hex(sprs[2]);
            let col2 = col.lerp(Colour.white, 0.75);

            return `<img class='ballmanac-inline-icon' src='../img/icons/${sprs[1]}.png'> <b style='color:${col.css()}'>${sprs[0]}</b><br><span style='color:${col2.css()}'>${desc}</span>`
        }).join("<br><br>")}`
    ),
]
let lore_entries = [
    new Entry(
        "Ball", Colour.from_hex("#fcc"),
        "A ball (weapon ball) is a form of life originally alien to the <span class='link'>home planes</span>. When the <span class='link'>convergence</span> occurred, the plane and city of <span class='link'>Remnath</span> was briefly connected to our own, through which the first balls emerged. Though <span class='link' data-linkto='the first war'>our history was bloody</span>, man and ball have reached a steady coexistence with the permanent opening of the <span class='link'>riftways</span>.<br><br>" +
        "Balls differ from most life on the home planes in their <span class='link' data-linkto='concept'>conceptual</span> porosity, making them both individually and collectively much more affected by concept changes, which allows (and, indeed, forces) them to <span class='link' data-linkto='tethering'>tether</span>. The most recent example of a collective concept effect are the events of <span class='link'>the First War</span>, during which balls permanently lost the concept of mortality.<br><br>"
    ),
    
    new Entry(
        "Tethering", Colour.from_hex("#fd9"),
        "Because of balls' conceptual porosity, they are fundamentally incapable of existing in any plane for an extended period without finding a concept to anchor their identity on. For most balls in history, this has been a weapon, as it provides a simple goal (combat) and the means to achieve it. After the <span class='link'>convergence</span> opened ballkind up to many new ideas, this particular self-reinforcing loop began to deteriorate, and, come the modern day, balls find themselves able to tether to practically anything.<br><br>" +
        "If a tether's goal or means is missing or difficult to access, it can malfunction in many disastrous ways, the worst being untethering, which is usually fatal. Equally, a ball must be careful to tether to something sufficiently dense with concept, as without enough concept the tether fails to function, and similarly they must avoid tethering to anything with too much concept, as doing so risks the object's concept overwhelming the ball's willpower and subsuming it entirely. Because of the deeply intimate nature of a tether, a ball will usually consider the tethered object part of their own self, and under normal circumstances is unable to ever break it in a way that doesn't end their own life.<br><br>" +
        "Since balls lose more and more of themselves the longer they remain untethered, most balls will tether from between one month and three years of birth, though anything before a year is usually accidental. One of the primary lessons ball parents aim to teach to their children is to take great care when choosing a tether, as it will last until death."
    ),

    new Entry(
        "Home Planes", Colour.from_hex("#cdf"),
        "The home planes are the planes least distant from the planet Earth, sharing the largest proportion of physical rules and habitable for human life. The existence of additional planes was first posited in 1876 by Leopold Boschwitz in Austria, but was proven experimentally over four hundred years later. Some suggest that humanity's opening and subsequent colonisation of the neighbouring planes may have attracted the balls to our plane in the first place."
    ),

    new Entry(
        "Convergence", Colour.from_hex("#dfd"),
        "The convergence was the opening of a seam between <span class='link'>Remnath</span> and Earth, thought to be a result of a runaway conceptual reaction inadvertently caused by Remnath scientists. Struggling to understand humanity, the balls attempted to greet us with combat, which did not go over well and started <span class='link'>the First War</span>. The seam remained open for only a few weeks, closing abruptly only hours after the ceasefire and leaving many balls on the wrong side, forcing the two races into an uneasy coexistence."
    ),

    new Entry(
        "Remnath", Colour.from_hex("#9af"),
        "Remnath is the name of both the plane and capital city of the Ball civilisation. Because of balls' differing housing requirements, they do not typically spread out in the same way as humans might, so their population density is mostly centered around this one city. At the time of the convergence, Remnath was an authoritarian state, but exposure to human concept through the seam began to instill new ideas in balls' minds, forming an unstoppable wave that left Remnath's government shattered for some years. By the time the <span class='link'>riftways</span> were opened, Remnath had become a semi-democratic state with a hereditary monarchy, which it has remained to this day."
    ),

    new Entry(
        "The First War", Colour.from_hex("#f77"),
        "The First War was fundamentally a misunderstanding. Because of balls' requirement of <span class='link'>tethering</span> to (at the time) weapons, they were subject to a self-reinforcing loop of violent instincts. However, they viewed (and still do view) fighting not as a negative action, but rather a social act as simple as saying hello, fundamentally missing the concept that fighting meant killing. So, to a ball, fighting was simply a fun pastime, definitely not worth starting a war over, and certainly not something that would result in death.<br><br>" +
        "Unfortunately, humans were not privy to such conceptual benefits, so when the first balls through the <span class='link'>convergence</span> tried to greet them with combat, they instead left them dead on the floor. Not yet speaking human language well enough to explain the misunderstanding, the balls were not able to explain the mistake, and when the first bullet struck a ball dead, they realised they needed to fight back, this time for survival. The concept bomb from this event became a self-reinforcing loop, strengthening the existence of the war in the balls' minds until they truly believed they were fighting to annihilation.<br><br>" +
        "Humans, being (though subconsciously) such immense producers of concept, soon began to affect their attackers in a variety of ways. Winning fronts weakened the balls, but losing fronts implanted dangerous concepts into them. Unfortunately, bad news travels fast, and instead of weakening, the balls strengthened. As they took two, five, ten, fifty bullets to kill, humans began to believe they were unkillable by force... and so they were.<br><br>" + 
        "Now suddenly hopeless, humanity attempted to send diplomats to Remnath, observing how the balls had learned human language and hoping that they could use diplomacy to save their race. Miraculously, the leaders in Remnath were not so affected by the blood fury in the <span class='link'>home planes</span>, and the two nations quickly set about drawing up a ceasefire agreement, hoping that the letter of the law would reverse the conceptual runaway, which, of course, it did.<br><br>" + 
        "Unfortunately, only hours later, the convergence closed completely, leaving two sides previously at each others throats both suddenly quite confused about how exactly to proceed. It was only until the establishment of the <span class='link'>riftways</span> years later that Remnath and the home planes could reconnect, starting peacetime between the two civilisations in earnest."
    ),

    new Entry(
        "Riftways", Colour.from_hex("#fff"),
        "After the closure of the <span class='link'>convergence</span>, humanity and ballkind set about attempting to cause it again, but this time in a more controlled fashion. With human understanding of the planes and ballkind's understanding of concept (and the two respective races' diaspora of those stuck on the wrong side of the seam), it was just a matter of time. The process only took a few years to go from ideation to practicum, setting up an initial working riftway for leaders, diplomats and scientists before opening more general-purpose stations all over both worlds after the success of the first. Easily linkable to humanity's existing planar transport networks, today the riftways are a form of international travel as ubiquitous as a train."
    ),

    new Entry(
        "Concept", Colour.from_hex("#d8f"),
        "Concept is a primary building block of reality, alongside space and time. Unlike humans, who exist almost entirely within space and time, balls exist with over half of their entire being in concept. Though this affords them an ability of change so shockingly vast most humans still consider it supernatural, they pay for this power by being much less capable of personally affecting the concept of anything, being mainly involuntarily affected by the thoughts and ideas of other less conceptual beings, like humans.<br><br>" +
        "Humans, being mostly conceptually impermeable, are able to affect concept in a much stronger fashion, however, because of said impermeability, cannot easily affect it with purpose. Terms such as \"collective consciousness\" and \"noosphere\" refer mainly to this shared power over concept unique to humanity, and resulted in complete upheaval of every part of ball society, starting when the <span class='link'>convergence</span> originally exposed them to it. As a result, balls have grown to become much more like humans, enough to absorb human language and integrate into human life almost seamlessly, though their love of combat is not yet quenched and their loss of mortality seems to have stuck."
    ),
]