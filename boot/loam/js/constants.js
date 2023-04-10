const x_len = 79;
const y_len = 40;

const canvas_x = 980;
const canvas_y = 851;
const canvas_clearance = 10;
const canvas_tri_width = 24;
const canvas_tri_height = (canvas_tri_width * (Math.sqrt(3) / 2));

const stat_names = [
    "hp", "atk", "def", "spd", "grow_speed"
];

const Effect = {
    Erosion: 'Erosion',
    Compaction: 'Compaction',
    Degradation: 'Degradation',
    Salinisation: 'Salinisation',
    Contamination: 'Contamination',
    Desertification: 'Desertification'
}