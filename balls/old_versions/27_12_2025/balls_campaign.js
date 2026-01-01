class Player {
    constructor() {
        this.name = "player";

        this.money = 0;  // used for buying balls, entering tournaments, etc
        this.materials = {
            "green": 0,
            "red": 0,
            "cyan": 0,
            "white": 0,
        };  // used for upgrading ball stats

        this.ball_inventory = [];  // list of up to 6 - "active" balls

        this.ball_storage = [];  // unlimited list of inactive balls
    }
}