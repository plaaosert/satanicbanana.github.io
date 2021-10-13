updates = [
	{
    "name": "Quick patch",
    "id": "0.0.0",
    "date": "24/02/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 1,
            "text": "Improvements made in the backend which will help me a lot later."
          },
          {
            "type": 1,
            "text": "Secondary stats implemented but not used right now (still need to be tested)"
          }
        ]
      },
      {
        "name": "Balance",
        "changes": [
          {
            "type": 3,
            "text": "Wizard INT gain reduced from **8** to **7**. Wizard base INT reduced from **18** to **14**."
          },
          {
            "type": 3,
            "text": "Frostbolt MATK reduced from **170%** to **150%** MATK."
          },
          {
            "type": 3,
            "text": "Chaos Bolt MATK reduced from **200%** to **180%** MATK."
          }
        ]
      },
      {
        "name": "Reworks",
        "changes": [
          {
            "type": 2,
            "text": "Thief signature changed: **Take Your Heart 🔆** - *Apply Change of Heart to a single target and Changed a Heart to yourself. This makes your target take 1.25x damage and gives you a bonus of 1.1x AGI, INT and FTN. Both effects remain until death.*"
          }
        ]
      }
    ]
  },
  {
    "name": "Battlepost Update (Bupdate)",
    "id": "0.0.1",
    "date": "27/02/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 0,
            "text": "Don't look at the Soul of Cinder. Boss mode."
          }
        ]
      },
      {
        "name": "Balance",
        "changes": [
          {
            "type": 2,
            "text": "Whirlwind Strike reworked. - \"Deal 90% PATK damage to 3 enemies, then apply Downed to yourself.\""
          }
        ]
      }
    ]
  },
  {
    "name": "Hotfix",
    "id": "0.0.2",
    "date": "01/03/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 3,
            "text": "XP gained on death reduced from a factor of 0.7 to 0.6."
          },
          {
            "type": 1,
            "text": "XP gained from damage increased by 23.076923076923076923076923076923‬%."
          },
          {
            "type": 1,
            "text": "Fixed a bug where all players never took damage."
          }
        ]
      }
    ]
  },
  {
    "name": "Breathtaking",
    "id": "0.0.3",
    "date": "03/03/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 1,
            "text": "Plaao reduces code clutter by 25%. Bugs are likely to happen but I'm pushing it directly to master anyway."
          },
          {
            "type": 1,
            "text": "Changing other thing to disconnect old server from Battlepost."
          },
          {
            "type": 1,
            "text": "Change of Heart no longer also prevents attacks."
          }
        ]
      }
    ]
  },
  {
    "name": "SECONDARY STATS AND PASSIVES",
    "id": "0.0.4",
    "date": "07/03/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 0,
            "text": "Every class now has their own unique passive ability. This is visible using `b!view class <classname>`."
          },
          {
            "type": 0,
            "text": "Four secondary stats have been added and some skills have been changed to work around giving them or removing them. All secondary stats decay at a rate of 25% per turn. When you have them, you will see them in your b!stats display. Otherwise, they will be hidden to reduce clutter."
          },
          {
            "type": 4,
            "text": "Simply:"
          },
          {
            "type": 4,
            "text": "- BLS - Bloodlust. Increases damage taken and increases PATK."
          },
          {
            "type": 4,
            "text": "- ATF - Artifact. Decreases spell costs and increases MATK."
          },
          {
            "type": 4,
            "text": "- VIT - Vitality. Reduces damage taken."
          },
          {
            "type": 4,
            "text": "- FTN - Fortune. Increases crit chance and multiplies the effect of LCK on crit damage."
          },
          {
            "type": 4,
            "text": "Secondary stats *can*  be negative. They will apply a negative or no effect if negative."
          }
        ]
      },
      {
        "name": "Balances",
        "changes": [
          {
            "type": 1,
            "text": "Deaths now give lower XP if the difference in level between the killer and the target is high. This means that, for example, a LV 12 player killing a LV 16 opponent will only give 1/4 as much XP to the opponent. This means that dying many times in a row no longer makes you win."
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 2,
            "text": "Blindside now also gives **8** BLS. PATK damage reduced from **150%** to **120%**."
          },
          {
            "type": 1,
            "text": "Arcane Grasp now also gives **6** ATF."
          },
          {
            "type": 1,
            "text": "Blood Revelry now also gives **2** BLS."
          },
          {
            "type": 1,
            "text": "Blood Fusion now also gives **4** BLS."
          },
          {
            "type": 3,
            "text": "Cosmic Judgement now also reduces ATF by **8** after use."
          },
          {
            "type": 1,
            "text": "Power in Silence now also provides **10** BLS and **10** ATF."
          },
          {
            "type": 1,
            "text": "Cross Drive now also provides **2** BLS and **4** FTN."
          },
          {
            "type": 1,
            "text": "Close the Distance now also provides **4** ATF and **2** BLS."
          },
          {
            "type": 1,
            "text": "Bulwark now also provides **5** VIT."
          },
          {
            "type": 1,
            "text": "Poke in the Eyes now also provides **4** FTN."
          }
        ]
      }
    ]
  },
  {
    "name": "The Balancing Update",
    "id": "0.0.5",
    "date": "09/03/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 2,
            "text": "Damage can no longer overkill. This means that, for the purposes of XP, damage dealt is capped to the health of the targets."
          },
          {
            "type": 1,
            "text": "Effect amplification now works. It was funky before. Stats should be normal now."
          },
          {
            "type": 1,
            "text": "Base HP increased from 150 to 250."
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 1,
            "text": "All skills that give stats now give twice the amount of stats, apart from Roll the Dice."
          },
          {
            "type": 3,
            "text": "All skills that gave secondary stats before now give half as many secondary stats, apart from Cosmic Judgement, Power in Silence, Bulwark."
          },
          {
            "type": 2,
            "text": "Battle Trance reworked. - `Deal 140% PATK damage to a single enemy. Triple your BLS then gain 2 BLS.` Mana cost increased to 2,000."
          },
          {
            "type": 3,
            "text": "DIRECTIVE: Terminate manacost increased from 6,000 to 10,000. PATK damage reduced from 250% to 180%."
          },
          {
            "type": 3,
            "text": "The Machina PATK reduced from 500%/250% to 400%/200%."
          }
        ]
      },
      {
        "name": "Classes",
        "changes": [
          {
            "type": 3,
            "text": "Automaton nerfed. CNS gain reduced from 6/level to 4/level."
          },
          {
            "type": 3,
            "text": "Wizard nerfed. Now gains much less ATF from their passive."
          },
          {
            "type": 1,
            "text": "Warrior buffed. AGI gain increased from 3/lv to 4/lv. LCK gain increased from 2/lv to 3/lv. WIS gain increased from 2/lv to 3/lv."
          },
          {
            "type": 3,
            "text": "Spellsword, Berserker passives fixed. They gave 1 more of their stat than intended."
          }
        ]
      },
      {
        "name": "Effects",
        "changes": [
          {
            "type": 3,
            "text": "Spin-Up Stage 1 now also reduces CNS. Reduces all stats by 0.5x."
          },
          {
            "type": 3,
            "text": "Spin-Up Stage 2 now also reduces CNS. Reduces all stats by 0.75x."
          }
        ]
      }
    ]
  },
  {
    "name": "The Boss is Too Weak",
    "id": "0.0.6",
    "date": "13/03/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 1,
            "text": "Soul of Cinder now has twice as much PATK and MATK at all times."
          },
          {
            "type": 1,
            "text": "Soul of Cinder is now immune to Silenced, Snared, Thrown Off, Blind and Marked for Death."
          },
          {
            "type": 1,
            "text": "Soul of Cinder now also knows Whirlwind Strike."
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 1,
            "text": "In addition to its current effect, Burning Soul now also grants 100 BLS, 100 VIT, 100 FTN."
          }
        ]
      }
    ]
  },
  {
    "name": "The Boss is Too Strong",
    "id": "0.0.7",
    "date": "16/03/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 1,
            "text": "Kiln of the First Flame (the boss battle) now triples XP gained."
          }
        ]
      }
    ]
  },
  {
    "name": "Thanks, Saturn",
    "id": "0.0.8",
    "date": "19/03/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "Skills",
        "changes": [
          {
            "type": 3,
            "text": "Explorer's Trick stat gain now limited to no more than 25% of the caster's current stats for the chosen stat."
          },
          {
            "type": 1,
            "text": "Artemis Bow now also gives 25 FTN."
          },
          {
            "type": 1,
            "text": "Cognizant now remains until hit by an attack."
          }
        ]
      }
    ]
  },
  {
    "name": "Flowing Slash is Broken Again",
    "id": "0.1.0",
    "date": "25/03/2020",
    "flavour": "Also, Summons",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 0,
            "text": "New things: Summons. Summons are skills that allow a player to create an autonomous unit that attacks enemies for them. The unit gives XP to its summoner and will never directly target its summoner. When a summon dies, it disappears."
          },
          {
            "type": 3,
            "text": "IMPORTANT: YOU CAN ONLY HAVE ONE SUMMONED UNIT AT ONCE. IF YOU TRY AND SUMMON MORE, THE SKILL WILL FAIL."
          },
          {
            "type": 2,
            "text": "Level requirement for victory in Battle Royale changed from LV20 to LV25."
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 1,
            "text": "Added a summon for every single class, learned at varying levels."
          },
          {
            "type": 3,
            "text": "Flowing Slash now deals **120%** PATK damage and also applies Weariness for the current turn."
          }
        ]
      }
    ]
  },
  {
    "name": "Summons and QoLs",
    "id": "0.1.1",
    "date": "01/04/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "Bugs",
        "changes": [
          {
            "type": 1,
            "text": "Metronome fixed."
          },
          {
            "type": 1,
            "text": "Dave removed."
          },
          {
            "type": 1,
            "text": "Integrity checker added. Should prevent bugs in future from causing ill effects."
          }
        ]
      },
      {
        "name": "General",
        "changes": [
          {
            "type": 1,
            "text": "Skill descriptions now show the level at which classes learn the ability."
          },
          {
            "type": 1,
            "text": "Class descriptions now show all skills learned by that class and at which levels."
          }
        ]
      },
      {
        "name": "Classes",
        "changes": [
          {
            "type": 1,
            "text": "Hebrew Golem no longer shadows Golem in search results."
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 1,
            "text": "A Friend maximum level increased to LV 7."
          },
          {
            "type": 1,
            "text": "Golemcraft:"
          },
          {
            "type": 4,
            "text": "- Mana cost reduced."
          },
          {
            "type": 4,
            "text": "- There is now a 0.1% chance to summon Dave, a LV 20 Golem, instead of a regular Golem."
          },
          {
            "type": 4,
            "text": "- Learn level reduced for all classes that learn it."
          },
          {
            "type": 4,
            "text": "Warrior: 15 -> 10"
          },
          {
            "type": 4,
            "text": "Artificer: 13 -> 8"
          },
          {
            "type": 4,
            "text": "Automaton: 15 -> 9"
          }
        ]
      }
    ]
  },
  {
    "name": "Thanks, Bog",
    "id": "0.1.2",
    "date": "02/04/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "Bugs",
        "changes": [
          {
            "type": 1,
            "text": "Berserker and Spellsword passives now work."
          }
        ]
      },
      {
        "name": "Classes",
        "changes": [
          {
            "type": 3,
            "text": "Berserker stat gain reduced."
          },
          {
            "type": 4,
            "text": "STR: 9 -> 7"
          },
          {
            "type": 4,
            "text": "CNS: 8 -> 6"
          },
          {
            "type": 2,
            "text": "Spellsword stat gain changed."
          },
          {
            "type": 4,
            "text": "STR: 8 -> 5"
          },
          {
            "type": 4,
            "text": "AGI: 6 -> 7"
          }
        ]
      }
    ]
  },
  {
    "name": "We Keep Getting Balance Patches, Huh?",
    "id": "0.1.3",
    "date": "03/04/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 1,
            "text": "Units with no stat gain per level no longer show \"+ 0 per level\" on that stat."
          },
          {
            "type": 1,
            "text": "I have more admin commands now."
          },
          {
            "type": 1,
            "text": "One new event added."
          },
          {
            "type": 2,
            "text": "Dave returned"
          },
          {
            "type": 2,
            "text": "Events changed:"
          },
          {
            "type": 1,
            "text": "Arcane Defusion MP reduction changed from 50% to 30%."
          },
          {
            "type": 3,
            "text": "Arcane Infusion MP gain changed from 50% to 30%."
          },
          {
            "type": 3,
            "text": "BLS damage amplification significantly increased:"
          },
          {
            "type": 4,
            "text": "`1 + ((bls ** 0.48) / 12)` -> ` 1 + ((bls ** 0.7) / 12)`"
          }
        ]
      },
      {
        "name": "Classes",
        "changes": [
          {
            "type": 3,
            "text": "Spellsword passive reduced:"
          },
          {
            "type": 4,
            "text": "Max ATF: 20 -> 10"
          },
          {
            "type": 4,
            "text": "% MP per ATF: 4% -> 8%"
          },
          {
            "type": 3,
            "text": "Berserker passive reduced:"
          },
          {
            "type": 4,
            "text": "Max BLS: 20 -> 10"
          },
          {
            "type": 4,
            "text": "% HP per BLS: 4% -> 8%"
          },
          {
            "type": 3,
            "text": "Wizard passive reduced:"
          },
          {
            "type": 4,
            "text": "ATF gain halved."
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 1,
            "text": "Lock-On FTN gain increased from 10 to 15."
          },
          {
            "type": 1,
            "text": "Familiar of Coals now actually summons a Demon Familiar."
          }
        ]
      }
    ]
  },
  {
    "name": "Stop Crying, Frog",
    "id": "0.1.4",
    "date": "05/04/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 1,
            "text": "PATK / MATK scaling increased. This means that higher AGI and INT give more damage, especially in the early levels."
          },
          {
            "type": 1,
            "text": "Overall PATK / MATK scaling increased. This means that in later levels, classes with high AGI / INT scale better."
          },
          {
            "type": 4,
            "text": "PATK scaling (AGI): *65 -> *105"
          },
          {
            "type": 4,
            "text": "MATK scaling (INT):  *65 -> *105"
          },
          {
            "type": 4,
            "text": "Overall scaling: ^0.52 -> ^0.56"
          },
          {
            "type": 1,
            "text": "HP base increased again. This reduces the difference in HPs between higher CNS classes and lower CNS classes."
          },
          {
            "type": 4,
            "text": "Base: 250 -> 400"
          },
          {
            "type": 3,
            "text": "CNS scaling for HP decreased. Also reduces difference in HPs."
          },
          {
            "type": 4,
            "text": "Scaling: ^1.6 -> ^1.52"
          }
        ]
      }
    ]
  },
  {
    "name": "Update",
    "id": "0.1.5",
    "date": "09/04/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 3,
            "text": "Summons now only provide 40% XP from all sources to their summoner."
          },
          {
            "type": 3,
            "text": "Animated Axe, Animated Sword, Golem reduced in power."
          },
          {
            "type": 3,
            "text": "PATK/MATK scaling reduced from ^0.56 to ^0.55."
          },
          {
            "type": 3,
            "text": "XP from damage scaling reduced from /60 to /100."
          },
          {
            "type": 2,
            "text": "Removed a problem where Dave would cause large amounts of damage to arenas indiscriminately"
          },
          {
            "type": 2,
            "text": "HP base is now applied correctly."
          },
          {
            "type": 1,
            "text": "If an ability costs more than your maximum mana, its cost will be reduced to 100% of your maximum mana or 70% of its manacost, whichever is larger."
          },
          {
            "type": 1,
            "text": "Healing abilities now grant XP as if that much damage were dealt to an enemy of your level. This includes healing from abilities such as Blood Revelry."
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 4,
            "text": "Roll the Dice:"
          },
          {
            "type": 1,
            "text": "LCK gain increased from 5 to 10"
          },
          {
            "type": 1,
            "text": "Now also gives 8 FTN."
          },
          {
            "type": 4,
            "text": "Tinkering:"
          },
          {
            "type": 1,
            "text": "Both stats given increased from 2 to 7"
          },
          {
            "type": 1,
            "text": "Now also gives 4 ATF, 2 BLS."
          },
          {
            "type": 4,
            "text": "Sharpen Weapon:"
          },
          {
            "type": 1,
            "text": "AGI gain increased from 4 to 12"
          },
          {
            "type": 1,
            "text": "Now also gives 5 BLS."
          },
          {
            "type": 4,
            "text": "Bulk Up:"
          },
          {
            "type": 1,
            "text": "Both stats given increased from 2 to 5"
          },
          {
            "type": 1,
            "text": "Now also gives 10 VIT."
          },
          {
            "type": 4,
            "text": "Field Study:"
          },
          {
            "type": 1,
            "text": "Both stats given increased from 2 to 6"
          },
          {
            "type": 1,
            "text": "Now also gives 6 ATF."
          },
          {
            "type": 4,
            "text": "Artemis Bow:"
          },
          {
            "type": 1,
            "text": "Now also provides Cognizant."
          },
          {
            "type": 4,
            "text": "A Friend:"
          },
          {
            "type": 1,
            "text": "Level cap increased from 7 to 9"
          },
          {
            "type": 4,
            "text": "Field Medicine:"
          },
          {
            "type": 1,
            "text": "Healing increased from 15% max HP to 25% max HP"
          },
          {
            "type": 4,
            "text": "Lesser Heal:"
          },
          {
            "type": 1,
            "text": "Healing increased from 90% MATK to 120% MATK"
          }
        ]
      },
      {
        "name": "Effects",
        "changes": [
          {
            "type": 4,
            "text": "Changed a Heart:"
          },
          {
            "type": 1,
            "text": "Multiplier increased from 1.1x to 1.25x (AGI, INT, LCK)"
          }
        ]
      }
    ]
  },
  {
    "name": "It Still Counts",
    "id": "0.1.5b",
    "date": "10/04/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "Skills",
        "changes": [
          {
            "type": 4,
            "text": "Megidolaon:"
          },
          {
            "type": 3,
            "text": "Damage reduced from 75%/75% to 50%/50%."
          },
          {
            "type": 3,
            "text": "MP cost increased from 3500 to 6000."
          }
        ]
      }
    ]
  },
  {
    "name": "You'll Never Believe This Only Took Me One Line Of Code",
    "id": "0.1.6",
    "date": "11/04/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 2,
            "text": "Buffs now remain no matter what if added during the current turn. Relevant abilities: Monk passive, DIRECTIVE: Terminate, Blaze of Glory (sometimes), Deathstrider passive for selfdamage, arena damage effects."
          }
        ]
      },
      {
        "name": "Classes",
        "changes": [
          {
            "type": 4,
            "text": "Ranger passive changed:"
          },
          {
            "type": 1,
            "text": "On taking damage, gain Hidden. Critical hits also apply Downed to enemies."
          },
          {
            "type": 2,
            "text": "Hidden: Reduce all damage taken by 33%. Does not stack with Bulwark."
          },
          {
            "type": 1,
            "text": "Wizard passive now grants slightly more ATF."
          },
          {
            "type": 1,
            "text": "Mage passive ATF gain increased from 6 to 10."
          }
        ]
      }
    ]
  },
  {
    "name": "Why Are We Speed Gaming Now?",
    "id": "0.2.0",
    "date": "16/04/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "Why Are We Speed Gaming Now?",
        "changes": [
          {
            "type": 0,
            "text": "THIS IS SOMETHING USEFUL"
          },
          {
            "type": 4,
            "text": "**b$fetch** is a command that retrieves the formula for a given calculation."
          },
          {
            "type": 4,
            "text": "It fetches directly from the Python code so it is essentially certain to be correct."
          },
          {
            "type": 4,
            "text": "This is a temporary command that may be cleaned up for all users to use eventually."
          },
          {
            "type": 4,
            "text": "Use **b$fetch** on its own for a list of functions."
          }
        ]
      },
      {
        "name": "General",
        "changes": [
          {
            "type": 1,
            "text": "Multiple games can now be played at once. However, infrastructure for starting games and initial game setup still doesn't exist. Maybe it never will."
          },
          {
            "type": 1,
            "text": "It will."
          },
          {
            "type": 2,
            "text": "Because of limitations with Discord rate limiting (:/), I will probably have to shard the bot before release. This is hard."
          },
          {
            "type": 4,
            "text": "HP formula changed:"
          },
          {
            "type": 1,
            "text": "Base HP increased from 400 to 403.475 (why? -> <https://imgur.com/N9hyESM>)"
          },
          {
            "type": 2,
            "text": "All stats are now given a +25 base bonus when calculating HP. This gives an advantage to lower STR/CNS classes."
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 4,
            "text": "Final Incantation:"
          },
          {
            "type": 3,
            "text": "Targets reduced from 4 to 3"
          },
          {
            "type": 3,
            "text": "Mana cost increased from 40,000 to 50,000"
          },
          {
            "type": 4,
            "text": "Cosmic Judgement:"
          },
          {
            "type": 1,
            "text": "No longer applies Silenced after cast"
          },
          {
            "type": 1,
            "text": "Mana cost reduced from 20,000 to 15,000"
          },
          {
            "type": 3,
            "text": "ATF penalty increased from -8 to -10"
          },
          {
            "type": 4,
            "text": "Familiar of Coals:"
          },
          {
            "type": 1,
            "text": "All stats of the Demon Familiar increased. Their power is now roughly equivalent to a player at LV 17."
          }
        ]
      },
      {
        "name": "Classes",
        "changes": [
          {
            "type": 3,
            "text": "Deathstrider no longer learns Grave Robbing."
          }
        ]
      }
    ]
  },
  {
    "name": "Here We Go",
    "id": "0.2.1",
    "date": "19/04/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 1,
            "text": "Two new events added, focused around giving and removing secondary stats"
          },
          {
            "type": 1,
            "text": "New boss added: The Holy Grail"
          },
          {
            "type": 1,
            "text": "New arenas added: Volgograd, Second Heaven"
          },
          {
            "type": 2,
            "text": "All numbers are now formatted correctly (with comma separators)"
          }
        ]
      },
      {
        "name": "Classes",
        "changes": [
          {
            "type": 1,
            "text": "Two new classes: Puppetmaster, Shiftling. View them for more info."
          },
          {
            "type": 3,
            "text": "All of the following classes no longer learn any summon moves in addition to any listed changes."
          },
          {
            "type": 2,
            "text": "Spellsword"
          },
          {
            "type": 1,
            "text": "INT gain increased from 7 to 8 per level"
          },
          {
            "type": 1,
            "text": "CNS gain increased from 4 to 5 per level"
          },
          {
            "type": 2,
            "text": "Berserker"
          },
          {
            "type": 1,
            "text": "AGI gain increased from 1 to 2 per level"
          },
          {
            "type": 2,
            "text": "Frogman"
          },
          {
            "type": 1,
            "text": "STR gain increased from 6 to 7 per level"
          },
          {
            "type": 2,
            "text": "Thief:"
          },
          {
            "type": 1,
            "text": "AGI gain increased from 7 to 9 per level"
          },
          {
            "type": 2,
            "text": "Sniper"
          },
          {
            "type": 1,
            "text": "Base CNS increased from 5 to 15"
          },
          {
            "type": 2,
            "text": "Pirate"
          },
          {
            "type": 1,
            "text": "STR gain increased from 5 to 6 per level"
          },
          {
            "type": 2,
            "text": "Paladin"
          },
          {
            "type": 1,
            "text": "INT gain increased from 2 to 3 per level"
          },
          {
            "type": 2,
            "text": "Juggernaut"
          },
          {
            "type": 2,
            "text": "Monk"
          },
          {
            "type": 1,
            "text": "AGI gain increased from 8 to 9 per level"
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 1,
            "text": "New skill: Area Denial. Learned by Ranger, Deathstrider, Automaton, Puppetmaster."
          },
          {
            "type": 3,
            "text": "Final Incantation now requires 80% max mana to cast."
          },
          {
            "type": 4,
            "text": "Karmic Reversal:"
          },
          {
            "type": 3,
            "text": "Now has a base of 75% PATK and increases by 75% PATK for each effect. (reduced from 100% both)"
          },
          {
            "type": 3,
            "text": "Mana cost increased from 2,500 to 4,000"
          }
        ]
      }
    ]
  },
  {
    "name": "ok",
    "id": "0.2.2",
    "date": "23/04/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 2,
            "text": "Skills now show total damage when dealing both MATK and PATK."
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 1,
            "text": "Lock-On mana restoration increased from 10% to 20%."
          },
          {
            "type": 1,
            "text": "Lock-On now also adds Hidden."
          }
        ]
      }
    ]
  },
  {
    "name": "ok (2)",
    "id": "0.2.2b",
    "date": "23/04/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 2,
            "text": "DM for attack info reworked to show more information in a cleaner way."
          },
          {
            "type": 2,
            "text": "Some skill and effect descriptions cleaned up to reflect what actually happens rather than what isn't happening."
          }
        ]
      }
    ]
  },
  {
    "name": "ok (3)",
    "id": "0.2.2c",
    "date": "24/04/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 2,
            "text": "DM for attack info no longer shows total damage if only one target is hit."
          },
          {
            "type": 2,
            "text": "Effects are now also cleared on revival, which means no more bosses applying effects to your next life if they kill you with the attack."
          }
        ]
      }
    ]
  },
  {
    "name": "ok (4)",
    "id": "0.2.2d",
    "date": "24/04/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "Classes",
        "changes": [
          {
            "type": 3,
            "text": "Shiftling passive now also reduces a random secondary stat by 1-3. Stat increase from passive reduced from 5 to 3."
          }
        ]
      }
    ]
  },
  {
    "name": "A Rushed Update",
    "id": "0.2.3",
    "date": "05/05/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 0,
            "text": "Games can now be started using `b!make`."
          },
          {
            "type": 0,
            "text": "Games can now be joined using `b!join`."
          },
          {
            "type": 2,
            "text": "Only Battle Royale games on the default arena can be created right now."
          },
          {
            "type": 1,
            "text": "Summoned units now provide 0.6x XP gained instead of 0.4x."
          }
        ]
      },
      {
        "name": "Classes",
        "changes": [
          {
            "type": 1,
            "text": "Artificer passive now also makes all summoning spells cost no mana."
          },
          {
            "type": 1,
            "text": "Puppetmaster passive BLS gain increased from 10 to 20."
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 4,
            "text": "Dimensional Rift:"
          },
          {
            "type": 1,
            "text": "MP cost reduced from 20,000 MP to 10,000 MP"
          },
          {
            "type": 4,
            "text": "Vengeance of the Self:"
          },
          {
            "type": 1,
            "text": "MP cost reduced from 20,000 MP to 15,000 MP"
          },
          {
            "type": 4,
            "text": "Lock-On:"
          },
          {
            "type": 1,
            "text": "FTN gain increased to +25"
          },
          {
            "type": 3,
            "text": "VIT reduction increased from -10 to -15"
          }
        ]
      }
    ]
  },
  {
    "name": "Things I Forgot",
    "id": "0.2.3b",
    "date": "06/05/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 1,
            "text": "You can also view your summon stats with `b!view summon name`."
          },
          {
            "type": 2,
            "text": "FTN reworked for crit damage. Now provides a bonus to the LCK stat for the calculation of crit damage - for example, +20 from FTN will calculate crit damage as if you had 20 more LCK."
          },
          {
            "type": 2,
            "text": "FTN formula for crit damage reworked (clearly). New formula: `4000log(-1 / (0.4x - 100)) + 8000`"
          },
          {
            "type": 3,
            "text": "Crit damage scaling reduced from ^1.5 to ^1.4"
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 4,
            "text": "Roll the Dice:"
          },
          {
            "type": 3,
            "text": "LCK gain decreased from 10 LCK to 6 LCK"
          },
          {
            "type": 3,
            "text": "FTN gain decreased from 8 FTN to 5 FTN"
          }
        ]
      }
    ]
  },
  {
    "name": "hi",
    "id": "0.2.4",
    "date": "08/05/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 3,
            "text": "VIT formula for negative VIT changed to (-0.2 * ((-2x + 25) ^ 1.5)) + 25"
          },
          {
            "type": 4,
            "text": "- This is far more negative than before and scales such that losing more VIT has an exponentially higher effect rather than an exponentially lower one."
          },
          {
            "type": 1,
            "text": "Effect viewing improved in a way that can only be shown. Try and view an effect."
          },
          {
            "type": 0,
            "text": "`b!view <effect> detailed` added. Detailed effect viewing shows what would happen to your stats if you were to gain the chosen effect."
          },
          {
            "type": 4,
            "text": "*this is really cool*"
          },
          {
            "type": 2,
            "text": "Secondary stats can now be seen by any player through `b!view <player>`."
          }
        ]
      },
      {
        "name": "Classes",
        "changes": [
          {
            "type": 3,
            "text": "Puppetmaster passive does not apply Hidden and only applies 10 BLS, not 20 BLS. Labels will be edited to reflect this shortly."
          }
        ]
      },
      {
        "name": "Effects",
        "changes": [
          {
            "type": 1,
            "text": "Blaze of Glory all stats multiplier increased from **7.5x** to **10x**."
          }
        ]
      }
    ]
  },
  {
    "name": "Bet you didn't expect a balance patch as well",
    "id": "0.3.0",
    "date": "11/05/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "Bet you didn't expect a balance patch as well",
        "changes": [
          {
            "type": 0,
            "text": "Command processing method entirely reworked to allow for intelligent aliasing and automatic prefixing of commands"
          },
          {
            "type": 4,
            "text": "*(for example, try using a command in a `#battlepost` channel without including the `b!` prefix!*"
          },
          {
            "type": 0,
            "text": "Aliases added for all commands and `b!view` arguments. They should be very intuitive, e.g"
          },
          {
            "type": 4,
            "text": "`b!v` - `b!view`"
          },
          {
            "type": 4,
            "text": "`b!sk` - `b!skip`"
          },
          {
            "type": 4,
            "text": "`b!s` - `b!stats`"
          },
          {
            "type": 4,
            "text": "`c` - `class`"
          },
          {
            "type": 4,
            "text": "`d` - `detailed`"
          }
        ]
      },
      {
        "name": "General",
        "changes": [
          {
            "type": 1,
            "text": "Turn shuffling now happens at a 33% chance instead of 50%."
          },
          {
            "type": 1,
            "text": "Effects for damage reduction / increase now completely stack with each other and themselves."
          },
          {
            "type": 1,
            "text": "List commands now work again (looking at you, b!view skill list...)"
          },
          {
            "type": 1,
            "text": "Quotes are now accepted in command parsing. `b!use \"Poke In The\" \"Copy of Golem (Saturn) (Lythine)\"`"
          },
          {
            "type": 2,
            "text": "Rare Candy now grants XP equal to current level."
          },
          {
            "type": 2,
            "text": "Event chance scales based on number of players (more players means higher chance of event, as rounds are longer)"
          },
          {
            "type": 3,
            "text": "Damage XP now scales slower (/ 2.5 -> / 3) from level difference."
          },
          {
            "type": 3,
            "text": "XP gain from summons reduced from 60% to 50%"
          }
        ]
      },
      {
        "name": "Effects",
        "changes": [
          {
            "type": 0,
            "text": "Almost all effects increased in power. Most soft effects have been buffed."
          },
          {
            "type": 3,
            "text": "Change of Heart damage mult decreased from **1.25x** to **1.2x**."
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 1,
            "text": "Hilt Strike: Now also inflicts Faltering"
          },
          {
            "type": 1,
            "text": "Veil of Darkness: Now also inflicts Inhibited"
          },
          {
            "type": 1,
            "text": "Arena of Blood: Applies 10 VIT on cast. If you survive, also gain Blessed."
          },
          {
            "type": 1,
            "text": "Righteous Command: Now also gain Unceasing after cast."
          },
          {
            "type": 1,
            "text": "Poke in the Eyes: Now also inflicts Faltering."
          },
          {
            "type": 1,
            "text": "Lesser Heal: Now also applies Bolstered."
          },
          {
            "type": 1,
            "text": "Grapple: Now also gain Strong after use."
          },
          {
            "type": 2,
            "text": "Vengeance of the Self reworked: `Summon a copy of a single target that shares their class, level, current HP, current MP and any active effects.`"
          },
          {
            "type": 4,
            "text": "\"Should've Gone for the Head\":"
          },
          {
            "type": 1,
            "text": "Now also gain Destructive after cast."
          },
          {
            "type": 3,
            "text": "Damage reduced from 200% to 150% MATK."
          }
        ]
      }
    ]
  },
  {
    "name": "\"You could not pay me to harm a kobold\"",
    "id": "0.3.0b",
    "date": "27/05/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 0,
            "text": "Reworked skill text parsing, removing graphical bugs from The Machina, Preon Accumulator and other similar abilities."
          },
          {
            "type": 0,
            "text": "Class emojis are now shown in the player list (`b!view players`). This allows you to view all classes of all players easily."
          },
          {
            "type": 1,
            "text": "New arena: `Kobold Den`"
          },
          {
            "type": 1,
            "text": "New boss: `The Dancer`"
          },
          {
            "type": 1,
            "text": "All boss skills now announce in the news channel. This means Dancer has a total of 5 different ways of sending a message there."
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 2,
            "text": "Explorer's Trick mana cost changed from 8,000 MP to 40% max MP."
          },
          {
            "type": 2,
            "text": "Cosmic Judgement mana cost changed from 15,000 MP to 75% max MP."
          }
        ]
      }
    ]
  },
  {
    "name": "Untitled",
    "id": "0.3.1",
    "date": "30/05/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "Untitled",
        "changes": [
          {
            "type": 0,
            "text": "Added a single line of code that should fix just about every crash bug in the game right now. No promises, but there's a chance."
          }
        ]
      }
    ]
  },
  {
    "name": "Dancer...",
    "id": "0.3.2",
    "date": "30/05/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "Bosses",
        "changes": [
          {
            "type": 4,
            "text": "The Dancer:"
          },
          {
            "type": 1,
            "text": "Now knows Megidolaon and Karmic Reversal"
          },
          {
            "type": 1,
            "text": "Now has drastically increased all stats (does not change max MP or HP)"
          },
          {
            "type": 1,
            "text": "Now has higher, fixed mana regen (75,000/turn)"
          },
          {
            "type": 1,
            "text": "All style change moves now provide some sort of defensive effect."
          }
        ]
      }
    ]
  },
  {
    "name": "...no, this name was necessary... yes, i can hold...",
    "id": "0.3.3",
    "date": "01/06/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 1,
            "text": "Info from DMs now show which game they came from."
          },
          {
            "type": 1,
            "text": "Info from DMs now separated with multiple fields, which means less chance of running out of space."
          },
          {
            "type": 1,
            "text": "Using the new Kill Object Bundling Operation (Late Deconstructor) system, or KOBOLD for short, kills are now shown as a pack when a player gets multiple kills."
          }
        ]
      }
    ]
  },
  {
    "name": "The Items Patch",
    "id": "0.4.0",
    "date": "15/08/2020",
    "flavour": "Items...",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 0,
            "text": "Items have been added! They drop randomly during games (at a higher chance if you do things that make for better television!) There are 75 items in total and they are all very likely bugged in some capacity. Please report bugs."
          },
          {
            "type": 0,
            "text": "Lobbies can now also be created in Boss Mode! To do this, `b!make` a game that has a name starting with `(b)`. <- temporary method"
          },
          {
            "type": 1,
            "text": "`b!view arena` now also supports `list`, so you can finally view the list of the game's arenas like you've always wanted to."
          },
          {
            "type": 1,
            "text": "`calc_manablade_mult` and `calc_kill_xp` added to `b$fetch`."
          },
          {
            "type": 1,
            "text": "ATF spell cost reduction scaling increased from **^0.6** to **^0.7**. Stacking ATF is now much more effective for reducing spell costs."
          },
          {
            "type": 1,
            "text": "HP scaling increased wholesale. All classes will now have **1.25x** as much HP at all points."
          },
          {
            "type": 1,
            "text": "STR and WIS now both scale more effectively for their respective XATK stats. (**66%** more effective)"
          },
          {
            "type": 1,
            "text": "STR exponent for HP increased from `^ 1` to `^ 1.15`."
          },
          {
            "type": 2,
            "text": "XP gain from kills changed from `1.1x + 1` to `2 + 0.7x^1.1` (where `x` is the target's level). This means that at very high levels you gain higher scaling XP for kills and at lower levels more XP is gained for kills."
          },
          {
            "type": 2,
            "text": "XP gain from damage is now also negatively scaled, which means that the damage dealt for the purposes of XP can be subject to up to a **64%** penalty at a level difference of 6. (e.g if attacking player is lv25 and target is lv19)"
          }
        ]
      },
      {
        "name": "Classes",
        "changes": [
          {
            "type": 4,
            "text": "Ranger:"
          },
          {
            "type": 1,
            "text": "AGI per level increased from **7** to **8**."
          },
          {
            "type": 3,
            "text": "AGI base reduced from **18** to **14**."
          },
          {
            "type": 1,
            "text": "**Cosmic Judgement** mana cost reduced from **75%** max MP to **65%** max MP."
          },
          {
            "type": 1,
            "text": "Spellsword special max ATF increased from **10** to **20**."
          },
          {
            "type": 1,
            "text": "Berserker special max BLS increased from **10** to **20**."
          },
          {
            "type": 1,
            "text": "**Familiar of Coals** familiar now has **+20** to all stats."
          },
          {
            "type": 4,
            "text": "Wizard:"
          },
          {
            "type": 1,
            "text": "ATF gain from passive ability doubled."
          },
          {
            "type": 3,
            "text": "LCK gain per level reduced from **6** to **5**."
          },
          {
            "type": 1,
            "text": "Frogman passive is now more likely to roll a positive outcome."
          },
          {
            "type": 4,
            "text": "Battlemage:"
          },
          {
            "type": 1,
            "text": "STR gain per level increased from **3** to **5**."
          },
          {
            "type": 3,
            "text": "MP gain from damage dealt reduced from `x ^ 1.25` to `x ^ 1.15`."
          },
          {
            "type": 4,
            "text": "Artificer:"
          },
          {
            "type": 2,
            "text": "Passive changed: `When levelling up, gain 6 ATF and Empowered.`"
          },
          {
            "type": 3,
            "text": "**Preon Accumulator** mana cost increased from **13,000 MP** to **55% max MP**."
          },
          {
            "type": 1,
            "text": "Gladiator base STR increased from **12** to **20**."
          },
          {
            "type": 4,
            "text": "Paladin:"
          },
          {
            "type": 1,
            "text": "AGI gain per level increased from **2** to **3**."
          },
          {
            "type": 3,
            "text": "Passive VIT reduced from `10 + level` to `7 + level`."
          },
          {
            "type": 3,
            "text": "Juggernaut base STR reduced from **16** to **12**."
          },
          {
            "type": 4,
            "text": "Automaton:"
          },
          {
            "type": 1,
            "text": "Spin-Up stage 1, 2 no longer reduce STR."
          },
          {
            "type": 1,
            "text": "Spin-Up stage 3 multiplier to STR, INT, LCK increased from **1.75x** to **2x**."
          },
          {
            "type": 1,
            "text": "Monk CNS and LCK per level increased from **4** to **5**."
          },
          {
            "type": 4,
            "text": "Puppetmaster [cracks knuckles]:"
          },
          {
            "type": 3,
            "text": "Vengeance of the Self mana cost changed from **15,000 MP** to **60% max MP**."
          },
          {
            "type": 3,
            "text": "Summon XP gain reduced from **50%** to **40%**. This isn't a Puppetmaster-based change but it's basically a direct nerf."
          },
          {
            "type": 3,
            "text": "INT gain per level reduced from **6** to **5**."
          },
          {
            "type": 4,
            "text": "Shiftling:"
          },
          {
            "type": 1,
            "text": "Passive secondary stat gain increased from **1 - 3** to **3 - 5**."
          },
          {
            "type": 1,
            "text": "CNS per level increased from **3** to **4**."
          },
          {
            "type": 1,
            "text": "INT per level increased from **7** to **8**."
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 4,
            "text": "*buff skills need buffing again...*"
          },
          {
            "type": 1,
            "text": "Grapple damage increased from **70%** PATK to **80%** PATK"
          },
          {
            "type": 1,
            "text": "Clairvoyance now also grants Empowered."
          },
          {
            "type": 1,
            "text": "Close the Distance secondary stat change increased from **+1 BLS, +2 ATF** to **+2 BLS, +5 ATF**."
          },
          {
            "type": 1,
            "text": "Veil of Darkness now also grants **+6 FTN.**"
          },
          {
            "type": 1,
            "text": "All stat buffing moves have been given +3 gain for all stats they provide."
          },
          {
            "type": 1,
            "text": "Power in Silence BLS, ATF gain increased from **10** to **20**."
          },
          {
            "type": 1,
            "text": "Really Good Slash damage increased from **10%** PATK to **11%** PATK."
          },
          {
            "type": 1,
            "text": "Arcane Grasp now also applies Empowered."
          },
          {
            "type": 3,
            "text": "Quick Slice damage reduced from **130%** PATK to **120%** PATK."
          },
          {
            "type": 3,
            "text": "Piledriver damage reduced from **140%** PATK to **130%** PATK."
          },
          {
            "type": 3,
            "text": "Cross Drive secondary stat change reduced from **+1 BLS, +2 FTN** to **-1 BLS, -2 FTN**."
          }
        ]
      },
      {
        "name": "Effects",
        "changes": [
          {
            "type": 1,
            "text": "Almost all positive effects are now more effective. On average, effects are 25% more effective, though this varies between effects."
          }
        ]
      }
    ]
  },
  {
    "name": "The Little Balance Patch",
    "id": "0.4.1",
    "date": "31/08/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 0,
            "text": "Summoning skills now cannot be used by name if you would fail to summon anything, with a message explaining why."
          },
          {
            "type": 2,
            "text": "Integrated skills (Athlete's Leg, Milk, \"Based\" Paper, etc.) now work."
          },
          {
            "type": 2,
            "text": "ATF now affects skills with % max MP manacosts."
          }
        ]
      },
      {
        "name": "Classes",
        "changes": [
          {
            "type": 4,
            "text": "*STR classes are still somewhat underwhelming, because they don't do enough damage.*"
          },
          {
            "type": 1,
            "text": "STR now scales better for PATK (increased from `x50` to `x80`)"
          },
          {
            "type": 4,
            "text": "*WIS classes can't really do anything since they don't have enough mana regen.*"
          },
          {
            "type": 1,
            "text": "ATF exponent for cost reduction increased from `0.2` to `0.4` (which means that at ~15 ATF, spell costs have a ~66% cost, compared to the previous 78%)"
          },
          {
            "type": 1,
            "text": "Mana regen given a flat 1.1x bonus, applied after everything else."
          },
          {
            "type": 4,
            "text": "*Frogman hasn't been good.*"
          },
          {
            "type": 1,
            "text": "FTN now increases LCK for the purposes of crit damage by 7x its current value, added to the previous equation."
          },
          {
            "type": 4,
            "text": "`int((4000 * math.log10(-1 / ((0.4 * min(200, ftn)) - 100))) + 8000) + int(ftn * 7)`  :)"
          },
          {
            "type": 4,
            "text": "*This also makes -50 FTN result in -666 LCK for crit damage, which is cool.*"
          }
        ]
      },
      {
        "name": "Items",
        "changes": [
          {
            "type": 1,
            "text": "Athlete's Leg no longer ends your turn."
          },
          {
            "type": 1,
            "text": "Bag of Rocks now also restores 10% HP and MP."
          },
          {
            "type": 1,
            "text": "Potion no longer ends your turn."
          },
          {
            "type": 1,
            "text": "Shovel now also grants Strong."
          },
          {
            "type": 1,
            "text": "Smoke Bomb's description now actually works, selecting a random date as the description on every restart of the bot."
          },
          {
            "type": 1,
            "text": "Spare Parts no longer end your turn. MP restore reduced to 10%."
          }
        ]
      }
    ]
  },
  {
    "name": "The Big Balance Patch",
    "id": "0.4.2",
    "date": "17/12/2020",
    "flavour": "Sorry about being so late. I want to work faster but my brain tells me to turn to dust.",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 0,
            "text": "New meta stats just dropped. They do nothing for now but should be successfully awarded when games end. View them with `b!stats` outside of a battlepost channel (like #general for example)"
          },
          {
            "type": 0,
            "text": "b$sim exists now which lets you see a snapshot of a player's stats given certain class, level, sec.stats, effects... Do `b$sim` to see a fat help embed."
          },
          {
            "type": 0,
            "text": "Many bugs fixed, the scope of which is too large to convey in this patchnote"
          },
          {
            "type": 2,
            "text": "Max % MP spell costs now do not scale with current max MP, instead scaling with max MP before buffs or debuffs. This means that buffing your own INT/WIS doesn't make you unable to cast %MP spells, but also makes MP debuffs (Sealed, Cursed, etc.) much more effective. Feature (somewhat) subject to change. Stop Metronoming."
          }
        ]
      },
      {
        "name": "Bosses",
        "changes": [
          {
            "type": 1,
            "text": "**The Dancer**"
          },
          {
            "type": 4,
            "text": "- AGI **2500** -> **4000**"
          },
          {
            "type": 4,
            "text": "- INT **1000** -> **1750**"
          },
          {
            "type": 4,
            "text": "- HP  **50,000** -> **75,000**"
          },
          {
            "type": 4,
            "text": "- Destruction Style now also grants a passive **0.7x** damage multiplier (reducing the damage multiplier from Destruction Style's 40 BLS to approximately **1.4x**)."
          }
        ]
      },
      {
        "name": "Effects",
        "changes": [
          {
            "type": 3,
            "text": "Hidden is now a unique effect, which means only one instance of it can be active at once. Ranger go in bin"
          },
          {
            "type": 3,
            "text": "Hidden now reduces damage by **0.4x **rather than **0.33x**. Ranger go in BIN."
          }
        ]
      },
      {
        "name": "Classes",
        "changes": [
          {
            "type": 4,
            "text": "Warrior"
          },
          {
            "type": 3,
            "text": "Gigaslash mana cost increased from **3000** to **3500**."
          },
          {
            "type": 3,
            "text": "LCK gain reduced from **3** to **2**."
          },
          {
            "type": 4,
            "text": "Spellsword"
          },
          {
            "type": 3,
            "text": "Passive ability reduced from **1** ATF per **4% MP** missing to every **8% MP** missing (halving its effectiveness)"
          },
          {
            "type": 4,
            "text": "Gladiator"
          },
          {
            "type": 3,
            "text": "VIT gain from being damaged reduced from **3** to **2**"
          },
          {
            "type": 1,
            "text": "CNS base increased from **14** to **20**"
          },
          {
            "type": 4,
            "text": "Thief"
          },
          {
            "type": 1,
            "text": "AGI gain increased from **9** to **10**"
          },
          {
            "type": 1,
            "text": "Take Your Heart now also heals the user by 30% max HP."
          },
          {
            "type": 1,
            "text": "Changed a Heart now grants 1.25x (STR, INT, CNS), 1.5x (AGI, LCK) and 1x WIS. (Changed from 1.25x AGI, INT, LCK)"
          },
          {
            "type": 4,
            "text": "Juggernaut"
          },
          {
            "type": 1,
            "text": "Flowing Slash mana cost reduced from **1000** to **900**"
          },
          {
            "type": 1,
            "text": "Weariness now applies 0.55x STR, AGI (Changed from 0.4x STR, AGI)"
          },
          {
            "type": 1,
            "text": "Flowing Slash damage increased from 150% PATK to 160% PATK (also fixed a bug where it said it dealt 120% PATK instead)"
          },
          {
            "type": 4,
            "text": "Automaton"
          },
          {
            "type": 1,
            "text": "Spin-Up Stage 1, 2 now both only reduce CNS by 0.75x and 0.9x respectively. Spin-Up Stage 1 provides an innate 25% damage reduction."
          },
          {
            "type": 4,
            "text": "Shiftling:"
          },
          {
            "type": 1,
            "text": "STR gain increased from 2 to 4"
          },
          {
            "type": 1,
            "text": "LCK gain increased from 5 to 6"
          },
          {
            "type": 1,
            "text": "Base CNS increased from 4 to 10"
          }
        ]
      }
    ]
  },
  {
    "name": "no comment",
    "id": "0.4.3",
    "date": "18/12/2020",
    "flavour": "-",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 0,
            "text": "All Rock/Glory-granting items now actually grant their Rocks and Glory. lol"
          }
        ]
      }
    ]
  },
  {
    "name": "The Automaton Rework",
    "id": "0.4.4",
    "date": "20/12/2020",
    "flavour": "I never liked just spinning anyway.",
    "categories": [
      {
        "name": "Automaton",
        "changes": [
          {
            "type": 3,
            "text": "Spin-Up Stage 1 no longer provides damage reduction."
          },
          {
            "type": 1,
            "text": "Spin-Up Stage 3 now unlocks **Cycle Slam**."
          }
        ]
      },
      {
        "name": "DIRECTIVE: Terminate",
        "changes": [
          {
            "type": 2,
            "text": "New description: `(Signature Ability) Deal 180% PATK to one target and gain Spin-Up Stage 1 if not currently in a Spin-Up stage. If affected by Spin-Up Stage 3, instead gain Shielded and Concentrated before the attack, then gain Spin-Up Stage 1 after attacking.`"
          },
          {
            "type": 2,
            "text": "Key change is: This move now works more as a spin extender, providing additional protection (Shielded) and working as a very high damage execute on a single target while also resetting the Automaton back to stage 1 of their spin for free."
          }
        ]
      },
      {
        "name": "Cycle Slam",
        "changes": [
          {
            "type": 1,
            "text": "`(Unlearnable Ability) Deal 150% PATK and 150% MATK damage and apply Downed to 4 enemies, then gain Snared, Silenced and lose 10 VIT.`"
          },
          {
            "type": 2,
            "text": "This move functions as a combo finisher, allowing the Automaton to deal huge damage to multiple targets and possibly get many kills in the process, but at the cost of being very vulnerable in following turns."
          },
          {
            "type": 2,
            "text": "This makes Automaton a class that lends itself to a more unique playstyle, with the ability to make a choice between extending your spin or dealing big damage. Previously, Automaton didn't really have much AoE kill opportunity in the lategame so this should rectify their weakness and make them feel more fun."
          },
          {
            "type": 1,
            "text": "This overall comes out to be a large Automaton buff."
          }
        ]
      }
    ]
  },
  {
    "name": "haha dancer shoot",
    "id": "0.4.4b",
    "date": "02/01/2021",
    "flavour": "Thank you ren",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 2,
            "text": "All random effect selectors no longer consider Item effects (such as Gun or Greevil's Blessing) as valid effects to apply. This primarily applies to Dimensional Barrier and Errant Spell."
          }
        ]
      }
    ]
  },
  {
    "name": "The Huge Balance Patch",
    "id": "0.4.5",
    "date": "18/02/2021",
    "flavour": "haha",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 0,
            "text": "Added a new arena, \"Silly Zone\". Cannot be selected in games by anyone who isn't me currently. Has very silly events."
          },
          {
            "type": 1,
            "text": "Fixed a bug where a player could make actions for subsequent players by sending a message during the time between the bot recieving a command and processing it."
          },
          {
            "type": 1,
            "text": "Summon XP share increased from 40% to 55%. Long live the summoners!"
          }
        ]
      },
      {
        "name": "Classes",
        "changes": [
          {
            "type": 3,
            "text": "Warrior"
          },
          {
            "type": 4,
            "text": "Base STR reduced from 20 to 16."
          },
          {
            "type": 4,
            "text": "Base CNS reduced from 16 to 10."
          },
          {
            "type": 4,
            "text": "AGI growth reduced from 4 to 3."
          },
          {
            "type": 4,
            "text": "Gigaslash PATK damage reduced from 550% to 450%."
          },
          {
            "type": 4,
            "text": "Gigaslash mana cost increased from 3,000 to 4,000."
          },
          {
            "type": 3,
            "text": "Mage"
          },
          {
            "type": 4,
            "text": "ATF gain on kill reduced from 10 to 7."
          },
          {
            "type": 4,
            "text": "Cosmic Judgement damage reduced from 750% to 650%."
          },
          {
            "type": 4,
            "text": "Cosmic Judgement ATF reduction increased from 10 to 14."
          },
          {
            "type": 3,
            "text": "Spellsword"
          },
          {
            "type": 4,
            "text": "CNS growth reduced from 5 to 4."
          },
          {
            "type": 4,
            "text": "Megidolaon P/MATK damage reduced from 50/50 to 40/40."
          },
          {
            "type": 1,
            "text": "Berserker"
          },
          {
            "type": 4,
            "text": "AGI growth increased from 2 to 3"
          },
          {
            "type": 4,
            "text": "Base CNS increased from 16 to 20"
          },
          {
            "type": 1,
            "text": "Deathstrider:"
          },
          {
            "type": 4,
            "text": "Passive ability now inflicts Inhibited instead of Drained."
          },
          {
            "type": 4,
            "text": "Demon Familiar stats increased from `100,60,200,70,70,60` to `130,90,260,70,100,80`."
          },
          {
            "type": 3,
            "text": "Wizard"
          },
          {
            "type": 4,
            "text": "Final Incantation mana cost increased from 80% max MP to 90% max MP."
          },
          {
            "type": 1,
            "text": "Frogman"
          },
          {
            "type": 4,
            "text": "Now also gains bonus BLS, ATF and VIT equal to 20% of their current FTN."
          },
          {
            "type": 4,
            "text": "Ribbit target count increased from 4 to 5."
          },
          {
            "type": 4,
            "text": "Ribbit damage increased from 60% PATK to 80% PATK."
          },
          {
            "type": 2,
            "text": "Thief"
          },
          {
            "type": 1,
            "text": "Change of Heart damage multiplier increased from 1.2x to 1.35x."
          },
          {
            "type": 3,
            "text": "Change of Heart is now unique."
          },
          {
            "type": 1,
            "text": "Changed a Heart gives 0.9x damage taken."
          },
          {
            "type": 1,
            "text": "Battlemage"
          },
          {
            "type": 4,
            "text": "\"Should've Gone for the Head\" mana cost reduced from 11,000 to 10,000."
          },
          {
            "type": 4,
            "text": "\"Should've Gone for the Head\" target count increased from 6 to 8."
          },
          {
            "type": 4,
            "text": "\"Should've Gone for the Head\" applies Downed to all targets."
          },
          {
            "type": 3,
            "text": "Sniper"
          },
          {
            "type": 4,
            "text": "AGI growth reduced from 9 to 7."
          },
          {
            "type": 4,
            "text": "Base CNS reduced from 15 to 12."
          },
          {
            "type": 4,
            "text": "The Machina PATK reduced from 400/200 to 200/100."
          },
          {
            "type": 4,
            "text": "The Machina now has a 50% chance to cause penetration damage rather than 100%."
          },
          {
            "type": 4,
            "text": "Lock-On no longer provides Hidden."
          },
          {
            "type": 4,
            "text": "Lock-On FTN gain reduced from 25 to 15."
          },
          {
            "type": 1,
            "text": "Artificer"
          },
          {
            "type": 4,
            "text": "Level-up ATF gain increased from 6 to 10."
          },
          {
            "type": 4,
            "text": "Preon Accumulator mana cost reduced from 55% max MP to 51% max MP."
          },
          {
            "type": 1,
            "text": "Gladiator"
          },
          {
            "type": 4,
            "text": "Arena of Blood now also applies Shielded."
          },
          {
            "type": 1,
            "text": "Juggernaut"
          },
          {
            "type": 4,
            "text": "Flowing Slash damage increased from 160% to 175%."
          },
          {
            "type": 2,
            "text": "Automaton"
          },
          {
            "type": 3,
            "text": "Cycle Slam P/MATK damage reduced from 150/150 to 125/75."
          },
          {
            "type": 3,
            "text": "Cycle Slam target count reduced from 4 to 3."
          },
          {
            "type": 3,
            "text": "Cycle Slam VIT reduction increased from -10 to -15."
          },
          {
            "type": 1,
            "text": "DIRECTIVE: Terminate now also restores 33% MP when cast at Spin-Up Stage 3."
          },
          {
            "type": 3,
            "text": "Monk"
          },
          {
            "type": 4,
            "text": "Karmic Reversal base damage reduced from 75% PATK to 25% PATK."
          },
          {
            "type": 1,
            "text": "Puppetmaster"
          },
          {
            "type": 4,
            "text": "CNS growth increased from 2 to 3."
          },
          {
            "type": 1,
            "text": "Shiftling"
          },
          {
            "type": 4,
            "text": "CNS growth increased from 4 to 5."
          },
          {
            "type": 4,
            "text": "Dimensional Rift mana cost reduced from 10,000 to 8,500."
          }
        ]
      },
      {
        "name": "Effects",
        "changes": [
          {
            "type": 3,
            "text": "Hidden damage reduction reduced from 40% to 50%."
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 1,
            "text": "Fireball MATK damage increased from 125% to 130%."
          },
          {
            "type": 1,
            "text": "Frostbolt MATK damage increased from 150% to 165%."
          },
          {
            "type": 1,
            "text": "Hilt Strike MATK damage increased from 70% to 90%."
          }
        ]
      },
      {
        "name": "Items",
        "changes": [
          {
            "type": 1,
            "text": "Some items changed to activate without ending your turn. There are now 52 non-turn-ending items and 23 turn-ending items."
          },
          {
            "type": 4,
            "text": "Items changed from turn-ending to non-turn-ending:"
          },
          {
            "type": 4,
            "text": "Balaclava, Dead Man's Switch, Metronome Shaped Box, Milk, Spare Parts, Target Analyser"
          },
          {
            "type": 1,
            "text": "Smoke Bomb now also grants Hidden."
          },
          {
            "type": 1,
            "text": "Sooch Slab now also restores 25% HP."
          }
        ]
      }
    ]
  },
  {
    "name": "Eh",
    "id": "0.4.6",
    "date": "23/03/2021",
    "flavour": "Wrote a tiny balance patch but more importantly made skills much nicer behind the scenes to allow for easier talent upgrades. Talents are still being worked on, juggling university coursework and my own sanity is hard",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 2,
            "text": "There may be bugs in the display of skills because of the rewrite. Tell me if you find any. I will kill them"
          },
          {
            "type": 1,
            "text": "Placed a bodge fix on the bug where double kills (and double damages) would happen for seemingly no reason, while also adding more protections that means dead people won't get affected by attacks at all, even in the (glitched) occurrence they are targeted by them. Will try to find out why it happens as we go on."
          },
          {
            "type": 1,
            "text": "XP gain from damage scaling improved from ^0.7 to ^0.77 https://cdn.discordapp.com/attachments/686648540763914287/823736675821289472/unknown.png."
          }
        ]
      },
      {
        "name": "Skills",
        "changes": [
          {
            "type": 1,
            "text": "Clairvoyance now also heals by 90% MATK."
          },
          {
            "type": 4,
            "text": "Arena of Blood:"
          },
          {
            "type": 1,
            "text": "VIT gain increased from 6 to 14."
          },
          {
            "type": 3,
            "text": "No longer grants Shielded."
          },
          {
            "type": 3,
            "text": "Retaliation damage reduced from 300% PATK to 220%."
          },
          {
            "type": 1,
            "text": "Cycle Slam VIT reduction reduced from -15 to -10."
          },
          {
            "type": 1,
            "text": "Really Good Slash damage increased from 11% PATK to 12%."
          }
        ]
      }
    ]
  },
  {
    "name": "A Talented Update",
    "id": "0.5.0",
    "date": "01/05/2021",
    "flavour": "So talented. So brave. So wise.",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 0,
            "text": "Talents added for every single class. Balance is unlikely. Bugs are almost certain. If you notice something that looks weird, **report it**, even if you aren't sure if it's a bug."
          },
          {
            "type": 1,
            "text": "When using `b!view` or `b!use`, the lookup first checks your player's skills (if applicable) and biases the selection to those skills first. This means `b!view skill at` will show the `Attack` skill on a LV1 class, not `Battle Trance` - which was almost never what people were looking for. This selection is further biased towards later learned skills on players, so `b!view skill at` on a LV15 Berserker *would*  result in `Battle Trance` being selected. With talents upgrading skills to very similarly named ones, this was pretty much a requirement."
          },
          {
            "type": 1,
            "text": "Game channels also all have their game number appended to them now."
          }
        ]
      },
      {
        "name": "Balance",
        "changes": [
          {
            "type": 3,
            "text": "Frogman all secondary stats bonus passive reduced from 20% to 13%"
          },
          {
            "type": 1,
            "text": "Pirate now benefits from their passive on their signature ability. This constitutes a buff to Explorer's Trick of 2x stat gain. This only applies on the stat gain on Pirate, not the reduction on their target."
          },
          {
            "type": 1,
            "text": "Vengeance (and Creation) of the Self also mirrors talents."
          }
        ]
      }
    ]
  },
  {
    "name": "Frog Neutering",
    "id": "0.5.1",
    "date": "02/05/2021",
    "flavour": "Holy shit, veev",
    "categories": [
      {
        "name": "Frogman",
        "changes": [
          {
            "type": 3,
            "text": "Frogman left-side LV25 talent reduced to 2x Lucky stacks."
          },
          {
            "type": 3,
            "text": "Frogman passive FTN changed from 1-10 random every turn to `Every turn, modify FTN by a random value from -4 to +7.`"
          },
          {
            "type": 3,
            "text": "Ribbit damage reduced from 80% PATK to 40% PATK."
          },
          {
            "type": 3,
            "text": "Warcry damage reduced from 125% PATK to 100% PATK."
          },
          {
            "type": 3,
            "text": "Frogman passive no longer provides VIT."
          }
        ]
      }
    ]
  },
  {
    "name": "Thief Neutering",
    "id": "0.5.2",
    "date": "22/05/2021",
    "flavour": "Holy shit, ender",
    "categories": [
      {
        "name": "General",
        "changes": [
          {
            "type": 1,
            "text": "Base and bonus secondary stats now show separately. This means that, if a class had 10 BLS base and 3 bonus BLS, what would before be `13 BLS` is now `10 (+3) BLS`, for example."
          },
          {
            "type": 2,
            "text": "Many assorted bugs fixed. We got the code monkeys back under control after one of them tried to use the Battlepost Gun."
          }
        ]
      },
      {
        "name": "Thief",
        "changes": [
          {
            "type": 1,
            "text": "Take your Heart and upgrades now also heal 30% max HP."
          },
          {
            "type": 1,
            "text": "Changed a Heart damage reduction improved from **0.9x** to **0.8x**..."
          },
          {
            "type": 3,
            "text": "...but Changed a Heart is now a unique effect. ~~Get fucked~~"
          }
        ]
      }
    ]
  },
  {
    "name": "Spring Cleaning",
    "id": "0.5.3",
    "date": "29/05/2021",
    "flavour": "it's not spring you fucking stupid axolotl you fucking stupid idiot dumb stupid f",
    "categories": [
      {
        "name": "Pirate",
        "changes": [
          {
            "type": 2,
            "text": "Pirate left-side LV20 talent changed from `Gain Greevil's Blessing on kill` to `Replace Explorer's Trick with Explorer's Gambit`"
          },
          {
            "type": 3,
            "text": "Pirate stat growth reduced from `6,6,3,4,4,6` to `6,5,3,4,3,5`"
          },
          {
            "type": 1,
            "text": "Pirate stat base increased from `14,14,10,8,8,14` to`16,16,10,8,10,15`"
          }
        ]
      },
      {
        "name": "Gladiator",
        "changes": [
          {
            "type": 3,
            "text": "Gladiator CNS gain reduced from **8** to **7**"
          },
          {
            "type": 3,
            "text": "Gladiator left-side LV15 talent no longer grants ATF"
          },
          {
            "type": 3,
            "text": "Gladiator passive VIT gain from passive reduced from flat **2** to a scaling amount based on damage taken (base 1, +1 VIT per 750 damage taken)"
          }
        ]
      },
      {
        "name": "Deathstrider",
        "changes": [
          {
            "type": 3,
            "text": "Perfected Familiar stats reduced from `190,130,350,100,180,140` to `170,110,320,100,120,120`"
          }
        ]
      }
    ]
  },
  {
    "name": "Frogman",
    "id": "0.5.4",
    "date": "25/06/2021",
    "flavour": "-",
    "categories": [
      {
        "name": "Frogman",
        "changes": [
          {
            "type": 3,
            "text": "Warcry damage reduced from **100%** PATK to **65%** PATK"
          },
          {
            "type": 2,
            "text": "Frogman passive text updated to reflect previous change: `Passive no longer grants VIT.`"
          },
          {
            "type": 3,
            "text": "Frogman passive BLS/ATF bonus reduced from **13%** to **10%**"
          },
          {
            "type": 3,
            "text": "Frogman passive spread changed: **-4** to **+7** -> **-6** to **+7**"
          },
          {
            "type": 3,
            "text": "Frogman left-side LV10 talent changed from `+2 FTN per turn` to `+1 FTN per turn`"
          }
        ]
      },
      {
        "name": "Paladin",
        "changes": [
          {
            "type": 1,
            "text": "Base STR increased from **14** to **15**"
          }
        ]
      }
    ]
  },
    {
    "name": "Relics",
    "id": "0.6.0",
    "date": "01/08/2021",
    "flavour": "Finally. More things to balance.",
    "categories": [
      {
        "name": "General",
        "changes": [
			{
            "type": "0",
            "text": "RELICS ARE IN THE GAME NOW!!!! `b!relic`. Use `b!relic select` in a game before it starts to select a relic."
          },
          {
            "type": "3",
            "text": "Summon XP gain to owner changed from **50%** to **35%**. Puppetmaster go in bin"
          },
          {
            "type": "2",
            "text": "Kills by summons should now add to the killcount of the owner. This does not activate \"on-kill\" effects for the summoner."
          },
          {
            "type": "1",
            "text": "New events added to Silly Mode."
          },
        ]
      },
      {
        "name": "Classes",
        "changes": [
          {
            "type": "3",
            "text": "\"Should've Gone For The Head\" and Apotheosis target count reduced from **8** to **6**."
          },
          {
            "type": "3",
            "text": "\"Should've Gone For The Head\" and Apotheosis damage reduced from **150%** MATK to **120%** MATK."
          },
          {
            "type": "2",
            "text": "Puppetmaster left-side LV10 talent changed from `Replace A Friend with A Companion` to `Replace A Friend with Animated Arms`"
          },
          {
            "type": "3",
            "text": "Puppetmaster is now subject to a spell cost increase of 5% per level (same mechanics as Mage, Wizard, Battlemage, Artificer)"
          },
          {
            "type": "3",
            "text": "Puppetmaster CNS gain per level reduced from **3** to **2**"
          },
        ]
      },
    ]
  },
    {
    "name": "Talentless (?)",
    "id": "0.6.1",
    "date": "14/09/2021",
    "flavour": "Bosses need some love, too...",
    "categories": [
      {
		"name": "General",
		"changes": [
		  {
			"type": "0",
			"text": "Bosses can now earn XP and level up, still starting at LV 50. Each level milestone (`LV 60 -> LV 75 -> LV 90 -> LV 100`) grants the boss a talent selection like a normal player. This is highly likely to be incorrectly tuned and will be refined as boss games are played. Boss win conditions have been changed from `Gain 200 kills.` to `Reach level 125.`"
		  },
		  {
			"type": "0",
			"text": "Command handler completely reworked. It's much faster and easier to maintain but will be riddled with bugs. Report them at will."
		  },
		  {
			"type": "1",
			"text": "WIS now contributes to MATK as much as STR contributes to PATK (previously contributed 50% less)"
		  },
		  {
			"type": "1",
			"text": "Base XP gained on kill increased by **2**. This means all kills grant 2 more XP than they would before."
		  },
		  {
			"type": "1",
			"text": "Base XP gained on death increased by **1**. Same as above."
		  },
		]
	  },
	  {
		"name": "Classes",
		"changes": [
		  {
			"type": "5",
			"text": "**Berserker**"
		  },
		  {
			"type": "3",
			"text": "Battle Trance no longer grants any constant BLS (still triples BLS as before)."
		  },
		  {
			"type": "2",
			"text": "Battle Fervor upgrade changed from `BLS bonus increased to 9.` to `Deals 10% more PATK damage. Also grants +4 BLS.`"
		  },
		  {
			"type": "5",
			"text": "**Gladiator**"
		  },
		  {
			"type": "3",
			"text": "Right-side LV5 talent PATK bonus reduced from **+10%** to **+8%**"
		  },
		  {
			"type": "3",
			"text": "Right-side LV15 talent PATK increase reduced from **+20%** to **+12%**"
		  },
		  {
			"type": "3",
			"text": "Arena of Blood VIT gain reduced from **14** to **10**"
		  },
		  {
			"type": "3",
			"text": "Arena of Glory VIT gain reduced from **28** to **16**"
		  },
		  {
			"type": "3",
			"text": "Arena of Death PATK damage on cast reduced from **90%** to **80%**"
		  },
		  {
			"type": "5",
			"text": "**Paladin**"
		  },
		  {
			"type": "3",
			"text": "Passive VIT changed from `7 + level` to `level`"
		  },
		  {
			"type": "3",
			"text": "Righteous Command heal changed from 100% HP to 400% MATK"
		  },
		  {
			"type": "2",
			"text": "Righteous Judgement modifier changed from `Targeting changed from 1 chosen target to 2 random targets.` to `Replaces heal with 50% life leech. Targeting changed from 1 chosen to 3 random.`"
		  },
		  {
			"type": "1",
			"text": "AGI growth changed from **3** to **4**"
		  },
		  {
			"type": "5",
			"text": "**Pirate**"
		  },
		  {
			"type": "1",
			"text": "Explorer's Trick/Gambit [Pirate] MP cost reduced from **40% max MP** to **30% max MP**"
		  },
		  {
			"type": "5",
			"text": "**Juggernaut**"
		  },
		  {
			"type": "3",
			"text": "Omnislash damage reduced from **275%** PATK to **225%** PATK"
		  },
		  {
			"type": "3",
			"text": "Omnislash MP cost increased from **1000** to **1500**."
		  },
		]
	  },
	  {
		"name": "Bosses",
		"changes": [
		  {
			"type": "1",
			"text": "Fierce Mentor passive changed from `Can only be damaged by critical hits.` to `Takes 50% damage from non-critical hits.`"
		  },
		  {
			"type": "1",
			"text": "Fierce Mentor HP increased from **80,000** to **120,000**"
		  },
		  {
			"type": "1",
			"text": "Rigorous Training target count increased from **3** to **6**"
		  },
		  {
			"type": "1",
			"text": "Fierce Mentor now also learns Warcry."
		  },
		]
	  },
	]
  },
    {
    "name": "Immediate Surgery",
    "id": "0.6.2",
    "date": "22/09/2021",
    "flavour": "We kind of knew this was going to happen.",
    "categories": [
      {
            "name": "General",
            "changes": [
			  {
                "type": "0",
                "text": "Effects can now provide talent-like effects. This doesn't mean anything on its own but will provide a wealth of new design space! This was also used to enable the **Juggernaut** rework."
              },
              {
                "type": "1",
                "text": "Bosses now gain **8x** XP. Maybe they'll actually reach their talents now."
              },
            ]
          },
          {
            "name": "Relics",
            "changes": [
              {
                "type": "3",
                "text": "Heavy Blade PATK multiplier reduced from **1.75x** to **1.5x**"
              },
              {
                "type": "3",
                "text": "Shaped Glass P/MATK multiplier reduced from **2x** to **1.75x**"
              },
              {
                "type": "3",
                "text": "Sharpened Glass P/MATK multiplier reduced from **2.5x** to **2.25x**"
              },
              {
                "type": "1",
                "text": "Mentor's Weapon P/MATK reduction changed from **-50%** to **-40%**"
              },
              {
                "type": "1",
                "text": "Colossal Shield VIT gain increased from **+6** to **+10**"
              },
              {
                "type": "3",
                "text": "Recalled ManaBoost Syringe now randomises mana by selecting two random values and picking the lower one - like Metronome"
              },
            ]
          },
          {
            "name": "Bosses",
            "changes": [
              {
                "type": "1",
                "text": "Soul of Cinder HP increased from **100,000** to **125,000**"
              },
              {
                "type": "1",
                "text": "The Holy Grail HP increased from **40,000** to **50,000**"
              },
              {
                "type": "1",
                "text": "The Dancer HP increased from **75,000** to **100,000**"
              },
              {
                "type": "3",
                "text": "Fierce Mentor HP reduced from **120,000** to **100,000**"
              },
              {
                "type": "3",
                "text": "Rigorous Training target count reduced from **6** to **5**"
              },
            ]
          },
          {
            "name": "Juggernaut",
            "changes": [
              {
                "type": "2",
                "text": "Flowing Slash has been entirely reworked. It is now a **6**-stage combo move (`Ascending Carp`) which is designed to be very difficult to be executed in its entirety. It still uses the `does not end turn` gimmick, but the final move **does** end your turn."
              },
              {
                "type": "4",
                "text": "Combo, in order, is: `Ascending Carp`, `Descending Carp`, `Waterfall Cross`, `Crashing River`, `Vital Force`, `Perfected Crushing Strike: Final Attack`."
              },
            ]
          },
	]
  },
    {
    "name": "just a tiny little update nothing major",
    "id": "0.6.3",
    "date": "13/10/2021",
    "flavour": "probably not even worth reading",
    "categories": [
      {
            "name": "General",
            "changes": [
              {
                "type": "0",
                "text": "CATEGORY SUPPORT ADDED. This means our max games is not only now quantifiable but also increased from 10 to 106! We also have alternative server support coming. If we really need it."
              },
              {
                "type": "1",
                "text": "`b$sim` now has a new mode: `de`, which is a variable viewer. Check it out with `b$sim`."
              },
              {
                "type": "1",
                "text": "Game channels slimmed down. Divider channel removed and news messages are now posted in the -xx-chat channel. This brings channel count per server down from **5** to **3**. I need feedback on this change, so please do so once we try it out."
              },
            ]
          },
          {
            "name": "Relics",
            "changes": [
              {
                "type": "3",
                "text": "Heavy Blade now also reduces max MP by **25%**"
              },
              {
                "type": "1",
                "text": "Reactive Nanites Injection HP reduction changed from **-25%** to **-12%**"
              },
              {
                "type": "1",
                "text": "Reactive Nanites Injection VIT gain on hit increased from **+2** to **+3**"
              },
            ]
          },
		]
      },
]