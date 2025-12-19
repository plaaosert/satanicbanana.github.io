class ThirteenLongswordsBall extends WeaponBall {
    static ball_name = "13 Longswords";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "13 Longswords";
        this.description_brief = "Has 13 longswords that each do 2 damage.";
        this.level_description = "This ball has no levelup effect.";
        this.max_level_description = "This ball has no awakening effect.";
        this.quote = "Thanks to @XxRodxXr for the deranged idea.";

        this.weapon_data = new Array(13).fill("").map(_ => new BallWeapon(1, "LONGSORD", [
            {pos: new Vector2(116, 72), radius: 8},
            {pos: new Vector2(100, 72), radius: 8},
            {pos: new Vector2(80, 74), radius: 8},
            {pos: new Vector2(64, 74), radius: 8},
            {pos: new Vector2(48, 74), radius: 8},
            {pos: new Vector2(32, 72), radius: 8},
            {pos: new Vector2(16, 68), radius: 8},
        ]))

        this.damage_base = 2
        this.speeds_range = [80, 240]

        this.speeds = new Array(this.weapon_data.length).fill(0).map(_ => random_float(...this.speeds_range, this.board.random));
        
        for (let i=0; i<this.weapon_data.length; i++) {
            if (i % 2 == 1) {
                this.reverse_weapon(i);
            }
        }

        this.explosions_num = 4;
        this.explosions_range_per_sord = [0,4];
        this.explosions_delay_max = 0.02;
        this.explosions_delay = this.explosions_delay_max;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        for (let i=0; i<this.weapon_data.length; i++) {
            this.rotate_weapon(i, this.speeds[i] * time_delta);
        }

        this.explosions_delay -= time_delta;
        while (this.explosions_delay < 0) {
            this.explosions_delay += this.explosions_delay_max;

            for (let i=0; i<this.explosions_num; i++) {
                for (let wp=0; wp<this.weapon_data.length; wp++) {
                    let wp_offset = this.get_weapon_offset(wp);
                    let hitboxes = this.get_hitboxes_offsets(wp);

                    let times = random_int(...this.explosions_range_per_sord, this.board.random);
                    for (let n=0; n<times; n++) {
                        let hitbox_index = random_int(0, hitboxes.length, this.board.random);

                        let pos = this.position.add(wp_offset.add(hitboxes[hitbox_index]));
                        this.board.spawn_particle(new Particle(
                            pos, random_float(0, Math.PI * 2, this.board.random), 0.1, entity_sprites.get("explosion"), 24, 3, false, 0, true
                        ), pos);
                    }
                }
            }
        }
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Longswords: 13`
        )
        this.write_desc_line(
            `Longswords: lit up on fire`
        )
    }
}

class AStickBall extends WeaponBall {
    static ball_name = "A Stick";

    constructor(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed) {
        super(board, mass, radius, colour, bounce_factor, friction_factor, player, level, reversed);
    
        this.name = "A Stick";
        this.description_brief = "Has a stick that does 75 damage.";
        this.level_description = "This ball has no levelup effect.";
        this.max_level_description = "This ball has no awakening effect.";
        this.quote = "Thanks to @XxRodxXr for the deranged idea.";

        this.weapon_data = [
            new BallWeapon(1, "stick", [
                {pos: new Vector2(88, 66), radius: 10},
                {pos: new Vector2(68, 74), radius: 10},
                {pos: new Vector2(48, 74), radius: 10},
                {pos: new Vector2(32, 72), radius: 10},
                {pos: new Vector2(16, 68), radius: 10},
            ])
        ];

        this.damage_base = 75
        this.speed = 160;
    }

    weapon_step(board, time_delta) {
        // rotate the weapon
        this.rotate_weapon(0, this.speed * time_delta);
    }

    hit_other(other, with_weapon_index) {
        let dmg = this.damage_base;
        let result = super.hit_other(other, with_weapon_index, dmg);

        result.snd = "strongpunch";

        return result;
    }

    render_stats(canvas, ctx, x_anchor, y_anchor) {
        this.start_writing_desc(ctx, x_anchor, y_anchor);

        this.write_desc_line(
            `Damage: ${this.damage_base.toFixed(2)}`
        )
        this.write_desc_line(
            `Stick: That's what it is`
        )
    }
}


let additional_selectable_balls = [
    ThirteenLongswordsBall, AStickBall
]