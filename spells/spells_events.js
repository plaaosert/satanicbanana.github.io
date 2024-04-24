class MsgboxEvent {
    constructor(name, tags, msgbox, condition) {
        this.name = name;
        this.tags = tags;
        this.condition = condition;
        this.msgbox = msgbox
    }

    condition_valid() {
        if (this.condition) {
            return this.condition()
        } else {
            return true;
        }
    }
}


// TODO implement these events
events_list_unsorted = [
    // Common
    new MsgboxEvent(
        "mana_vein",
        ["common", "positive", "nonpermanent"],
        new MessageBoxTemplate(
            "- - MANA VEIN - -",
            "You spotted a [cyan]mana vein [white]before leaving the dimension. Absorbing some of its energy should increase your max [cyan]MP[clear].",
            ["Leave", "Touch the vein"],
            ["#600", "#046"],
            [
                function() {
                    // nothing
                },
        
                function() {
                    // give +10, +25 or +40 max MP
                    let mp_restore = [10, 25, 40][Math.floor(game.random() * 3)];

                    game.player_ent.max_mp += mp_restore;
                    game.player_ent.restore_mp(mp_restore);

                    return {
                        text: `A success!\n\n+ You touched the mana vein and gained [cyan]+${mp_restore} max MP[clear]!`
                    }
                },
            ]
        )
    ),

    new MsgboxEvent(
        "astral_lockbox",
        ["common", "neutral", "nonpermanent"],
        new MessageBoxTemplate(
            "- - ASTRAL LOCKBOX - -",
            "You see a [#abdee6]sma[#ffc5bf]ll [#ecd5e3]loc[#cce2cb]kb[#ffccb6]ox[clear] discarded on the ground. Its surface shimmers between different colours, a stark contrast from the dull tones around it. Find out what's inside?",
            ["Leave it", "Crack it open"],
            ["#600", "#060"],
            [
                function() {
                    // nothing
                },
        
                function() {
                    // gain 2 uncommon fragments (20%), a 33% hp restore (20%), a 20% hp drain (20%), 1 rare fragment (10%) or nothing (30%)
                    let random_choice = Math.floor(game.random() * 5);
                    
                    if (random_choice == 3 && game.random() < 0.5) {
                        random_choice = 4
                    }
                    
                    switch (random_choice) {
                        case 0:
                            let drops = game.drop_items_of_rarity_name(
                                "u", 2, 2
                            )

                            return {
                                text: `The lockbox opens at your command, revealing two [#0f0]uncommon[clear] spell fragments within.\n\n+ You gained the fragments [${drops[0].item.col}]${drops[0].item.name}[clear] and [${drops[1].item.col}]${drops[1].item.name}[clear].`
                            }

                        case 1:
                            let amt_restore = Math.round(game.player_ent.max_hp / 3)
                            game.player_ent.restore_hp(amt_restore);

                            return {
                                text: `The lockbox opens at your command, revealing a bundle of [cyan]healing mana[clear]!\n\n+ You restored [#0cf]33%[clear] max [#f00]HP[clear] (+[#0cf]${amt_restore}[clear]).`
                            }

                        case 2:
                            let amt_take = Math.round(game.player_ent.hp * 0.2)
                            game.player_ent.lose_hp(amt_take);

                            return {
                                text: `The lockbox opens at your command, revealing... [#888]nothing.[clear]\n\nAfter a few seconds, though, that [#888]nothing[clear] starts to suck in everything around it, [#f00]including you![clear]\n\n- You lost [#0cf]20%[clear] of your current [#f00]HP[clear] trying to stop it. (-[#f88]${amt_take}[clear]).`
                            }

                        case 3:
                            let rdrop = game.drop_items_of_rarity_name(
                                "r", 1, 1
                            )

                            return {
                                text: `The lockbox opens at your command, revealing one [#0ef]rare[clear] spell fragment within.\n\n+ You gained the fragment [${rdrop[0].item.col}]${rdrop[0].item.name}[clear].`
                            }

                        case 4:
                            return {
                                text: `The lockbox opens at your command, revealing... [#888]nothing.[clear]`
                            }                                       
                    }
                },
            ]
        )
    ),

    // Events beyond this point ARE NOT COMPLETED!!! TODO COMPLETE THEM!!!

    // Rare
    // Affinity
    new MsgboxEvent(
        "necromancer_tome",
        ["rare", "neutral", "permanent", "affinity", Affinity.Dark],
        new MessageBoxTemplate(
            "- - NECROMANCER'S TOME - -",
            "A small wooden shack somehow remains standing here.\n" +
            "You look inside and find a [#74a]necromancer's tome [clear]inside, somehow in pristine condition.\n\n" +
            "You could take it and become a [#74a]necromancer[clear], gaining the [#74a]Dark[clear] affinity (replacing your third affinity if you have three), [#f00]reducing your max HP by 33%[clear] and gaining the cores [#99a]Ball of Skulls[clear], [#99a]Mass Haunting[clear], [#74a]Reinforce[clear] and [#74a]Turn Unwilling Dead[clear].\n\n" +
            "You could also [#0cf]leave and try to forget you ever saw it.",
            ["Leave", "Become a necromancer"],
            ["#600", "#317"],
            [
                function() {
                    // nothing
                    return {
                        title: "- - NECROMANCER'S TOME: [#0cf]RESIST[clear] - -",
                        text: `You turn the other way and try to clear your mind of the [#74a]temptation[clear]. Just to make sure, you [#e52]burn down the entire shack behind you.[clear]`
                    }
                },
        
                function() {
                    // become a necromancer. make sure to set the affinity flag too
                    return {
                        title: "- - NECROMANCER'S TOME: [#74a]SUCCUMB[clear] - -",
                        text: `You open the tome and begin to absorb its [#74a]secrets[clear]. Within seconds, your mind is extinguished like a candle in rain.\n\nYou wake hours later, feeling a terrible power pulse within your veins... and a newfound [#74a]hunger[clear] for death.\n\n` +
                              `+ [#74a]Dark[clear] affinity gained\n` +
                              `+ Gained cores: [#99a]Ball of Skulls[clear], [#99a]Mass Haunting[clear], [#74a]Reinforce[clear], [#74a]Turn Unwilling Dead[clear]\n` +
                              `- [#f00]Max HP reduced by 33% (-[#f88]###[#f00])[clear]\n`
                    }
                },
            ]
        )
    ),

    new MsgboxEvent(
        "elementalist_tower",
        ["rare", "neutral", "permanent", "affinity", Affinity.Fire, Affinity.Ice, Affinity.Lightning],
        new MessageBoxTemplate(
            "- - ELEMENTALIST'S TOWER - -",
            "This tower stood guard over your last conflict, protected from the outside by a powerful shield. When fighting ceased the shield dissipated, allowing you inside.\n\n" +
            "Within, you find multiple elemental pools. [#e52]Take [#aff]a [#ff3]dip?\n\n" +
            "The [#e52]fiery[clear] pool burns with power. You would gain the [#e52]Fire[clear] affinity (replacing your third affinity if you have three) and gain a [#0cf]permanent +1 radius[clear] bonus to all your cores.\n\n" +
            "The [#aff]frosted[clear] pool quietly emanates frigid air. You would gain the [#aff]Ice[clear] affinity (replacing your third affinity if you have three) and [#0cf]multiply your max [cyan]MP[#0cf] by 1.5x.[clear]\n\n" +
            "The [#ff3]crackling[clear] pool hums with energy. You would gain the [#ff3]Lightning[clear] affinity (replacing your third affinity if you have three) and gain a [#0cf]permanent +12 damage[clear] bonus to all your cores.\n\n",
            ["Leave", "Enter the fire", "Bathe in frost", "Yummy voltage"],
            ["#300", "#510", "#244", "#660"],
            [
                function() {
                    return {
                        title: "- - ELEMENTALIST'S TOWER: [#fff]PURITY[clear] - -",
                        text: `You'd rather stay unaligned in the end. You leave the tower in the same state you came in.`
                    }
                },
        
                function() {
                    // +1 radius emblem. make sure to set the affinity flag too
                    return {
                        title: "- - ELEMENTALIST'S TOWER: [#e52]FIRE[clear] - -",
                        text: `You take a quick dip in the [#e52]fiery[clear] pool. The heat starts almost unbearable, but within seconds you find yourself getting more and more comfortable. Before long, though, you see the pools start to [#bbb]evaporate[clear], including the one you're in. After it empties entirely and you turn to leave, you notice that your footsteps leave [#888]plumes of smoke[clear] behind you.\n\n` +
                              `+ [#e52]Fire[clear] affinity gained\n` +
                              `+ Gained an [#4f4]emblem[clear]: {[#0cf]+1 radius to all cores[clear]}`
                    }
                },

                function() {
                    // 1.5x max mp. make sure to set the affinity flag too
                    return {
                        title: "- - ELEMENTALIST'S TOWER: [#aff]ICE[clear] - -",
                        text: `You take a quick dip in the [#aff]frosted[clear] pool. Or, at least, you would, if it wasn't frozen solid. Luckily for you, sitting on top of it seems to have an effect anyway. Soon, you see the pools start to [#bbb]evaporate[clear], including the one you're in. After it empties entirely and you turn to leave, you notice that your movements seem to [#aff]freeze[clear] water in the air around you, leaving a trail of [#aff]snow[clear].\n\n` +
                              `+ [#aff]Ice[clear] affinity gained\n` +
                              `+ Multiplied max [cyan]MP[clear] by [#0cf]1.5x[clear] ([#0cf]+###[clear])`
                    }
                },

                function() {
                    // +12 damage emblem. make sure to set the affinity flag too
                    return {
                        title: "- - ELEMENTALIST'S TOWER: [#ff3]LIGHTNING[clear] - -",
                        text: `You take a quick dip in the [#ff3]crackling[clear] pool. Your body is immediately assaulted by thousands of [#ff3]powerful electric shocks[clear], knocking you unconscious immediately. When you come to, you find yourself at the bottom of one of three now empty pools, but oddly, you feel completely unharmed. In fact, as you turn to leave, you feel an [#ff3]electric[clear] spring in your step and an unusual [#ff3]mental acuity[clear].\n\n` +
                              `+ [#ff3]Lightning[clear] affinity gained\n` +
                              `+ Gained an [#4f4]emblem[clear]: {[#0cf]+12 damage to all cores[clear]}`
                    }
                },
            ]
        )
    ),
    
    new MsgboxEvent(
        "1_order_of_order",
        ["rare", "neutral", "permanent", "affinity", Affinity.Order],
        new MessageBoxTemplate(
            "- - THE ORDER OF ORDER: INITIATION - -",
            "You are approached by a sharply-dressed wizard. How did he even get here?\n\n" +
            "[#0cf]\"Hello, sir! I am from the Order of Order. I simply loved seeing your fighting firsthand!\"\n\n[clear]It's one of them.\n\n[#0cf]\"We are offering on-the-spot initiations for powerful wizards such as yourself. Are you interested?\"\n\n" +
            "[#0cf]\"We offer many benefits. For starters, you will gain the [#D5C2A5]Order[#0cf] affinity, replacing your third affinity if you have three, of course. You will also receive your very own [#D5C2A5]Rock Golem[#0cf], which will follow you to every conflict and protect you with its life! Most importantly, you can proudly say you are a member of the [#D5C2A5]Order of Order[#0cf] - and gain exclusive access to our\n[#D5C2A5]further programs of study[#0cf], of course.\"\n\n" +
            "[clear]How'd he speak in colours? Anyway, you can listen to this crackpot or politely inform him you're leaving.",
            ["Leave", "Join the Order of Order"],
            ["#600", "#542"],
            [
                function() {
                    // nothing
                    return {
                        title: "- - THE ORDER OF ORDER: REFUSAL - -",
                        text: `Any more time spent listening to this fool would be better spent in a grave. You thank him for his time, refuse his offer and leave.`
                    }
                },
        
                function() {
                    // join the order of order
                    // set flag here for the initiation event chain
                    return {
                        title: "- - THE ORDER OF ORDER: [#D5C2A5]INITIATE[clear] - -",
                        text: `[#0cf]\"Thank you very much, sir! I promise you, this is the best decision you've ever made.\"\n\n` +
                              `[clear]The wizard touches your arm and, before you have a chance to refuse, teleports you to what you assume is the [#D5C2A5]Order of Order's headquarters[clear], somehow unaffected by the shattered state of the rest of existence.\n\n` +
                              `You live there for a time, learning their customs and the [#D5C2A5]Order's[clear] scripture, before you are sent back to your fight for your [#0cf]\"annual leave\"[clear]. Was it really that long?\n\n` +
                              `+ [#D5C2A5]Order[clear] affinity gained\n` +
                              `+ [#D5C2A5]+1[clear] indoctrination\n` +
                              `+ Gained an [#4f4]emblem[clear]: {[#0cf]One allied [#dca]Rock Golem[#0cf] spawns near you at the start of every combat[clear]}`
                    }
                },
            ]
        )
    ),

    // UNIQUE/SPECIAL
    new MsgboxEvent(
        "2_order_of_order",
        ["orderoforder_1"],
        new MessageBoxTemplate(
            "- - THE ORDER OF ORDER: STUDY - -",
            "You have attended a few Order of Order study sessions already and, according to your mentor, you are ready for the next stage. You follow him into the Council's audience chamber, where a voice booms down at you from above.\n\n" +
            "[#0cf]\"Greetings, young acolyte of [#D5C2A5]Order[#0cf]. You have done well and learned much. We see fit to grant you access to a higher level of study. In return, the Council shall see to it that your modest [#dca]Rock Golem[#0cf] will be enhanced into a mighty [#dcd]Rock Titan[#0cf]. All we need from you is a contribution. [#f00]One fifth of your maximum HP and MP[#0cf] will do.\"\n\n" +
            "[clear]Well, better not disappoint them. Or, well, you could. But if you did, you probably [#f00]wouldn't ever be called in here again.[clear]",
            ["Refuse", "Contribute to the Order"],
            ["#600", "#542"],
            [
                function() {
                    // remove initiation event chain flag
                    return {
                        title: "- - THE ORDER OF ORDER: ETERNAL ACOLYTE - -",
                        text: `You're quite content to stop here. You will eagerly answer the [#D5C2A5]Order of Order[clear] if called, but are otherwise happy to remain at your current lowly station.`
                    }
                },
        
                function() {
                    // upgrade the order of order and pay the cost (1/5th max hp/mp)
                    // set flag here for the initiation event chain
                    return {
                        title: "- - THE ORDER OF ORDER: [#D5C2A5]ELEVATION[clear] - -",
                        text: `\"Very good. You have made a good decision. Further programs of study will be available to you immediately.\"\n\n` +
                              `You feel a portion of your energy [#f00]drift away[clear] as you are transported back to your familiar living quarters.\n\n` +
                              `You live there for a few years more, by your estimation anyway. By the time you're sent back to your battles, the Order of Order feels more important to you than your revenge against Efrit.\n\n` +
                              `+ [#D5C2A5]+2[clear] indoctrination\n` +
                              `+ Upgraded an [#4f4]emblem[clear]: {[#0cf]One allied [#dcd]Rock Titan[#0cf] spawns near you at the start of every combat[clear]}\n` +
                              `- [#f00]Max HP reduced by 20% (-[#f88]###[#f00])[clear]\n` +
                              `- [#f00]Max MP reduced by 20% (-[#f88]###[#f00])[clear]\n` 
                    }
                },
            ]
        )
    ),

    new MsgboxEvent(
        "superboss_choices",
        ["superboss_choices"],
        new MessageBoxTemplate(
            "- - PORTENTS OF RUIN - -",
            "You have come far, fleeing the ceaseless wave of corruption as you inch closer to Efrit's presence. You can feel it. He's close.\n\n" +
            "But here, in the depths of this world beyond your understanding, you see a new rift form - something different, something primal. Something that should not exist, even in this world devoid of reason.\n\n" +
            "[#e20]What do you see?[clear]",
            ["[#ecb]Birds and beds[clear]", "[#2f2]Creation[clear]"],
            ["#421", "#151"],
            [
                function() {
                    // remove initiation event chain flag
                    return {
                        title: "- - AVATAR OF RUIN: Refticus - -",
                        text: `Fight, fight before time runs out. You can do this.`
                    }
                },
        
                function() {
                    // upgrade the order of order and pay the cost (1/5th max hp/mp)
                    // set flag here for the initiation event chain
                    return {
                        title: "- - AVATAR OF RUIN: plaaosert - -",
                        text: `Prove you control this reality.`
                    }
                },
            ]
        )
    ),
]


event_messageboxes = {

}


events_list_unsorted.forEach(evt => {
    evt.tags.forEach(tag => {
        if (event_messageboxes[tag]) {
            event_messageboxes[tag].push(evt);
        } else {
            event_messageboxes[tag] = [evt];
        }
    })
});


evt_text = "Event tags:\n";
Object.keys(event_messageboxes).forEach(tag => {
    evt_text += `${tag} (${event_messageboxes[tag].length})\n`;
})

console.log(evt_text)
