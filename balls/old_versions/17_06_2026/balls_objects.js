class BaseObject extends WeaponBall {
    constructor(board, radius, colour) {
        super(board, Number.POSITIVE_INFINITY, radius, colour, 1, 1, {}, 0, false);
    
        this.display = true;
        this.affected_by_gravity = false;
        this.moves = false;
        this.collision = true;
        this.ignore_bounds_checking = false;

        this.display_hp = false;
    }

    get_stat(name) {
        return 1;
    }
}