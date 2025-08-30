game_id = "mahjong";

class MajTile {
    static Suit = {
        MAN: "MAN",
        PIN: "PIN",
        SOU: "SOU",
        WIND: "WIND",
        DRAGON: "DRAGON",
        FLOWER: "FLOWER",
        SEASON: "SEASON",
        HONOUR: "HONOUR",
        WILD: "WILD",
    }

    constructor(game, suit, number, is_red) {
        this.game = game;

        this.suit = suit;
        this.number = number;
        this.is_red = is_red;
    }

    is_honour() {
        switch (this.suit) {
            case MajTile.Suit.DRAGON:
            case MajTile.Suit.WIND:
                return true;    
                break;

            case MajTile.Suit.SEASON:
            case MajTile.Suit.FLOWER:
                return this.game.rules.GENERAL.FLOWERS_ARE_HONOURS;
                break;

            case MajTile.Suit.WILD:
                return this.game.rules.GENERAL.WILDS_ARE_HONOURS;
                break;
        }

        return false;
    }
    
    is_terminal() {
        if (this.is_honour()) {
            return false;
        }

        return this.number == 1 || this.number == 9;
    }

    equals(other) {
        return other.is_red == this.is_red && this.number == other.number && this.suit == other.suit;
    }

    in_array(array) {
        return array.some(tile => this.equals(tile));
    }
}

class Game {
    static DrawType = {
        NORMAL: "NORMAL",
        DEAD_WALL: "DEAD_WALL",
        STOLEN_KAN: "STOLEN_KAN",
        OUTSIDE_GAME: "OUTSIDE_GAME"
    }

    constructor(num_players, deck, rules) {
        this.rules = {
            GENERAL: {
                DRAWS_PER_TURN: 1,
                MAX_HAND_SIZE: 13,  // players discard until they hit max hand size
                MELD_SIZE: 3,

                DEAD_WALL_SIZE: 14,

                DORA_ENABLED: true,
                DORA_STARTING_TILES: 1,

                URADORA_ON_RIICHI: true,
                URADORA_ALWAYS: false,

                SEQUENCES_CAN_LOOP: false,

                WILDS_ARE_HONOURS: true,
                FLOWERS_ARE_HONOURS: true,
                HONOUR_SEQUENCES_ENABLED: false,
            },

            CALLS: {
                CHII_ENABLED: true,
                CAN_CHII_HONOURS: false,
                CHII_PREV_PLAYER_ONLY: true,
                DRAWS_AFTER_CHII: 0,  // so no bonus draws; game will make you discard automatically

                PON_ENABLED: true,
                CAN_PON_HONOURS: true,
                DRAWS_AFTER_PON: 0,

                KAN_ENABLED: true,
                CAN_KAN_HONOURS: true,
                CLOSED_KAN_ENABLED: true,
                ADDED_KAN_ENABLED: true,
                DRAWS_AFTER_KAN: 1,
                KAN_DEAD_WALL_DRAWS: 1,  // num. of tiles to draw from the dead wall.
                                         // if DRAWS_AFTER_KAN is higher, first N are from the dead wall, then the rest are from the live wall.

                RON_ENABLED: true,
                RON_OPENS_HAND: true,
                CAN_RON_CLOSED_KAN: false,
            },

            WINNING: {
                WINNING_SHAPE_NUM_MELDS: 4,
                WINNING_SHAPE_NUM_PAIRS: 1,

                YAKUS: [
                    new Yaku(
                        "All Simples", "Tanyao", "断幺九", true, 1, 0, function(game, player, hand) {
                            return hand.every(tile => !tile.is_honour() && !tile.is_terminal());
                        }
                    )
                ]
            }
        }
    }
}

class Yaku {
    static count_suits(game, hand) {
        let suits = new Set();
        hand.forEach(tile => {
            switch (tile.suit) {
                case MajTile.Suit.WILD:
                    break;

                case MajTile.Suit.DRAGON:
                case MajTile.Suit.WIND:
                    suits.add(MajTile.Suit.HONOUR);
                    break;

                case MajTile.Suit.FLOWER:
                case MajTile.Suit.SEASON:
                    if (game.rules.GENERAL.FLOWERS_ARE_HONOURS) {
                        suits.add(MajTile.Suit.HONOUR);
                    } else {
                        suits.add(tile.suit);
                    }
                    break;

                default:
                    suits.add(tile.suit);
                    break;
            }
        });

        return suits;
    }

    constructor(name_en, name_rom, name_jp, needs_winning_shape, han, penalty_if_open, verification_fn) {
        this.name_en = name_en;
        this.name_rom = name_rom;
        this.name_jp = name_jp;

        this.verification_fn = verification_fn;
        this.needs_winning_shape = needs_winning_shape;
        this.penalty_if_open = penalty_if_open;  // if this brings total han below 0, the yaku doesn't count
        this.han = han;
    }

    verify(game, player, hand) {
        return this.verification_fn(game, player, hand);
    }
}

document.addEventListener("DOMContentLoaded", function(e) {
    
});
