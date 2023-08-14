class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static from_hash_code(code) {
        return new Vector2((code-1) % 1000000, Math.floor((code-1) / 1000000));
    }

    static from_angle(angle_rad, r) {
        return new Vector2(
            Math.cos(angle_rad),
            Math.sin(angle_rad)
        ).mul(r ? r : 1)
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }

    hash_code() {
        return (this.y * 1000000) + this.x + 1;
    }

    equals(other) {
        return this.x == other.x && this.y == other.y;
    }

    copy() {
        return new Vector2(this.x, this.y);
    }

    neg() {
        return new Vector2(-this.x, -this.y);
    }

    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    sub(other) {
        return this.add(other.neg());
    }

    mul(other) {
        return new Vector2(this.x * other, this.y * other);
    }

    div(other) {
        return new Vector2(this.x / other, this.y / other);
    }

    // TODO test it works (moved sqr_magnitude into its own function from magnitude)
    sqr_magnitude() {
        return Math.pow(this.x, 2) + Math.pow(this.y, 2)
    }

    magnitude() {
        return Math.sqrt(this.sqr_magnitude());
    }

    normalize() {
        if (this.sqr_magnitude() == 0) {
            return this;
        }

        return this.div(this.magnitude());
    }

    sqr_distance(other) {
        return this.sub(other).sqr_magnitude();
    }

    distance(other) {
        return this.sub(other).magnitude();
    }

    round() {
        return new Vector2(Math.round(this.x), Math.round(this.y));
    }

    wrap(bounds) {
        return new Vector2(this.x % bounds.x, this.y % bounds.y);
    }

    rotate_towards(other, theta_max) {
        let angle_diff = this.angle_between(other);

        if (Math.abs(angle_diff) >= theta_max) {
            angle_diff = theta_max * Math.sign(angle_diff);
        }

        //console.log(angle_diff)

        let result_angle = this.angle() + angle_diff;
        return Vector2.from_angle(result_angle, this.magnitude());
    }

    rotate(rad) {
        return new Vector2(
            this.x * Math.cos(rad) - this.y * Math.sin(rad),
            this.x * Math.sin(rad) + this.y * Math.cos(rad),
        )
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    dot(other) {
        return (this.x * other.x) + (this.y * other.y);
    }

    angle_between(other) {
        let angle = Math.atan2(other.y, other.x) - Math.atan2(this.y, this.x);
        if (angle > Math.PI) {
            angle = -((2 * Math.PI) - angle);
        }

        if (angle < -Math.PI) {
            angle = -((-2 * Math.PI) + angle);
        }

        return angle;

        if (this.magnitude() * other.magnitude() == 0) {
            return 0;
        }

        let dot = (this.dot(other)) / (this.magnitude() * other.magnitude())
        let dp = Math.max(-1, Math.min(1, dot));

        return Math.acos(dp);
    }
}

class Colour {
    static from_array(arr) {
        return new Colour(
            arr[0],
            arr[1],
            arr[2],
            arr[3]
        )
    }

    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    
        this.data = Array(4);
        this.get_data();
    }

    get_data() {
        this.data[0] = this.r;
        this.data[1] = this.g;
        this.data[2] = this.b;
        this.data[3] = this.a;
    }
}