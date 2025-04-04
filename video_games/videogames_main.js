game_id = "video_games";

/*
games have:
- themes - things, 0-1 normalised to 1 total, like "zombies", "monsters", "fantasy", "sci-fi", "realistic", "modern", "urban", "cerebral",
           "difficult", "casual"

- features - researchable parts of a game, like "motion controls", "voice chat". some features will also improve quality aspects simply by being in a game.
             features mean less the more there are (normalised to total 1)
             features are usually limited by console. PC works like a console that gains all tech advances 0-7 years after it ships on any console (favouring quicker)
             features need to be researched once to put on a console, then again to implement in a game. they use the following tech types:
             - Algorithms
             - Hardware
             - Pipelines
             - Graphics
             - Audio
             - Creativity

- genres - "rpg", "adventure", "strategy", "fighting", "farming", "cooking", etc. - can have "levels" of genres:
           0.25 - "elements of X" (max 2)
           0.5 - "heavy X elements" (max 2)
           1 - "an X game" (max 1)
           levels are normalised such that they always sum to 1.

- structures - "branching narrative", "postgame content", "multiple endings", etc. normalised to total 1

- player-ness - "singleplayer", "local multiplayer", "online multiplayer" - one or more

- separate maturity ratings [3, 7, 12, Mature, Adult Only]:
    - sexuality
    - violence
    - dark themes
    - gambling

- time to complete - "very short", "short", "medium", "long", "very long", "jrpg"

- quality:
    - ui graphics
    - game graphics
    - audio design
    - soundtrack
    - overall gameplay
    - gameplay split by each player-ness (if more than one)
    - replayability

- price

there is an inbuilt set of "affinities" for genres to themes, modes, player-ness and game lengths, which influence the more likely outcomes of random picks for game stats,
*but not players' opinions of games.* players' opinions of games will shift according to their experiences and naturally shift towards these themes based on supply,
or a new fad might appear based on pure chance!

there are 10,000 (probably) families generated, who can split into new families when the child grows up and moves out
families own games, with certain people as the primary owners of said games
owners will buy games. parents can buy directly, children rely on parents to do so

person stats:
- gamer-ness - the closer to 1, the higher their likelihood to want games. this typically starts quite high as a child and reduces with age
    gamer-ness will exponentially increase the "cost" of a game if it's low, meaning infinity if it's 0.

- theme-based affinities - -1 - 1 values for every game theme that determine how much they like a specific theme in a game
- feature-based affinities - -1 - 1 values for features
- genre-based affinities - -1 - 1 values for genres
- player-ness based - [0 or 1]
- mature themes based
- different quality affinity measures, all 0 - 1.
- length preference; -1 - 1

- play speed - 0.25 - 2. multiplies the time taken to complete a game.

- employment - games are purchasable based on employment. people will measure their total affinity towards a game (including everything + gamer-ness) to get an "expected price",
               and if it is under their maximum price based on income, they'll buy it.

a person's preferences change over time, mostly shifting towards the people around them as well as from playing games
(playing a good game will shift preferences towards its statistics, playing a bad one will shift them away).
strong preferences are generally harder to shift.
*/

const TechType = {
    Algorithms: "Algorithms",
    Hardware: "Hardware",
    Pipelines: "Pipelines",
    Graphics: "Graphics",
    Audio: "Audio",
    Creativity: "Creativity",
}

class Feature {
    constructor(name, requires, tech_reqs_console, tech_reqs_implement, quality_improvements) {
        this.name = name;
        this.requires = requires;
        this.tech_reqs_console = tech_reqs_console;
        this.tech_reqs_implement = tech_reqs_implement;
        this.quality_improvements = quality_improvements;
    }
}

class Game {
    /*

    | medieval astrological aliens biology swords interior_design hardcore exploration psychological mental_illness building base_building conquest industrial prehistoric futuristic cozy collectathon business food beauty fashion post_apocalyptic space tarot social_deduction nautical planes trains politics nature supernatural crafting chance_based magic occult military alternate_history historical dinosaurs 

    | arcade casual factory life_simulator fighting tycoon fishing survival sports racing city_builder strategy visual_novel mystery escape_room roguelike

    | branching_narrative postgame_content multiple_endings 

    | open_world, procedural_generation

    */

    static Theme = [
        "zombies", "monsters", "fantasy", "sci-fi", "realistic", "modern", "urban", "cerebral", "difficult"
        
    ]

    static Genre = [
        "horror", "adventure", 
    ];

    static Structure = [
        "branching narrative", "postgame content", "multiple endings"
    ]

    static PlayerMode = {
        Singleplayer: "Singleplayer",
        Multiplayer: "Multiplayer"
    };

    static MaturityRating = {
        Sexuality: "Sexuality",
        Violence: "Violence",
        Dark_Themes: "Dark themes",
        Gambling: "Gambling"
    };

    // displayname|time (days) to complete
    static CompletionTime = {
        Very_Short: "Very short|1",
        Short: "Short|3",
        Medium: "Medium|7",
        Long: "Long|20",
        Very_Long: "Very long|50",
        JRPG: "JRPG|100",
        N_A: "N/A|-1",
    }

    // also includes one for every included playermode
    static QualityType = {
        Ui_Graphics: "UI graphics",
        Game_Graphics: "Game graphics",
        Audio_Design: "Audio design",
        Soundtrack: "Soundtrack",
        Overall_Gameplay: "Overall gameplay",
        Replayability: "Replayability"
    }

    constructor(title, themes, features, genres, structures, playermodes, maturity_ratings, completion_time, quality, price) {
        this.title = title;

        this.themes = themes;
        this.features = features;
        this.genres = genres;
        this.structures = structures;
        this.playermodes = playermodes;
        this.maturity_ratings = maturity_ratings;
        this.completion_time = completion_time;
        this.quality = quality;
        this.price = price;

        this.description = this.get_description();
    }

    get_description() {
        return "A game";
    }
}

let all_features = [
    new Feature("Scrimblo Technology", "", 100, 10, {
        [Game.QualityType.Ui_Graphics]: 0,
        [Game.QualityType.Game_Graphics]: 0,
        [Game.QualityType.Audio_Design]: 0,
        [Game.QualityType.Soundtrack]: 0,
        [Game.QualityType.Overall_Gameplay]: 0,
        [Game.QualityType.Replayability]: 0,
    })
]

// can probably do a like, job simulation too, with companies and shit. for now dont do that,
// just have people get a random starting salary plus a random raise of 1%-10% every year
class Job {
    constructor(name, income, raise_rate, promotion_chance, promotion_amount) {
        this.name = name;
        this.income = income;
        this.raise_rate = raise_rate;
        this.promotion_chance = promotion_chance;
        this.promotion_amount = promotion_amount;
    }
}

class P_SocialStats {
    constructor(sociableness, persuasiveness, stubbornness, conscientiousness) {
        this.sociableness = sociableness; // rate at which they make new friends
        this.persuasiveness = persuasiveness; // bonus to preference changes on others
        this.stubbornness = stubbornness; // penalty to others' persuasion
        this.conscientiousness = conscientiousness; // likelihood to organise hangouts and refresh friendship
    }
}

class P_GamerStats {
    constructor(gamerness, theme_affinities, feature_affinities, genre_affinities, structure_affinities, playermode_affinities, maturity_affinities, quality_affinities, length_preference, live_service_preference, play_speed) {
        this.gamerness = gamerness;
        this.theme_affinities = theme_affinities;
        this.feature_affinities = feature_affinities;
        this.genre_affinities = genre_affinities;
        this.structure_affinities = structure_affinities;
        this.playermode_affinities = playermode_affinities;
        this.maturity_affinities = maturity_affinities;
        this.quality_affinities = quality_affinities;
        this.length_preference = length_preference;
        this.live_service_preference = this.live_service_preference;
        this.play_speed = play_speed;
    }
}

class Person {
    constructor(social_stats, gamer_stats, employment) {
        this.social_stats = social_stats;
        this.gamer_stats = gamer_stats;
        this.employment = employment;
    }

    // gamers dont know how good a game is until they play it!
    // so this needs quality ratings, which are a stand-in for real quality.
    // a gamer would get this quality based on the opinions of people in their social graph,
    // plus the opinions of reviewers.
    // quality also depends on current average; it's normalised to 0-1 based on the quality of other games at the time!
    get_game_preference(game, quality_ratings) {
        let total_factors = 0;
        let sum_factors = 0;

        let s = this.gamer_stats

        let factors_game = [game.themes, game.features.map(t => [t[0].name, t[1]]), game.genres, game.structures, game.playermodes, game.maturity_ratings];
        let factors_player = [s.theme_affinities, s.feature_affinities, s.genre_affinities, s.structure_affinities, s.playermode_affinities, s.maturity_affinities];
        // maturity ratings are 0-5 so weight less
        let factors_weights = [1, 1, 1, 1, 32, 3];

        let s_n = 0;
        let s_s = 0;

        factors_game.forEach((fg, i) => {
            let fp = factors_player[i];
            let fw = factors_weights[i];

            let total_pref = fg.reduce((p, c) => p + (fp[c[0]] * c[1]), 0)

            s_n += fw;
            s_s += total_pref * fw;
        });

        let s_a = s_s / s_n; 
        let OVERALL_FACTORS_WEIGHT = 32;

        console.log(`Scalars: ${s_a} (total weighting: ${OVERALL_FACTORS_WEIGHT})`);

        total_factors += OVERALL_FACTORS_WEIGHT;
        sum_factors += s_a * OVERALL_FACTORS_WEIGHT;

        let QUALITY_WEIGHTING = 16;
        let q_n = 0;
        let q_s = 0;
        Object.keys(quality_ratings).forEach(k => {
            let fp = s.quality_affinities[k]
            let fg = quality_ratings[k];

            q_n++;
            q_s += fp * fg;
        })

        let q_a = q_s / q_n;

        console.log(`Quality: ${q_a} (total weighting: ${QUALITY_WEIGHTING})`);

        total_factors += QUALITY_WEIGHTING;
        sum_factors += q_a * QUALITY_WEIGHTING;

        let completion_time_weight = 0;
        switch (game.completion_time) {
            case Game.CompletionTime.Very_Short:
                completion_time_weight = -1;
                break;
            case Game.CompletionTime.Short:
                completion_time_weight = -0.5;
                break;
            case Game.CompletionTime.Medium:
                completion_time_weight = -0.25;
                break;
            case Game.CompletionTime.Long:
                completion_time_weight = 0.25;
                break;
            case Game.CompletionTime.Very_Long:
                completion_time_weight = 0.5;
                break;
            case Game.CompletionTime.JRPG:
                completion_time_weight = 1;
                break;
        }

        let COMPLETION_TIME_WEIGHTING = 20;
        total_factors += COMPLETION_TIME_WEIGHTING
        if (completion_time_weight != 0) {
            console.log(`Completion time: ${completion_time_weight * s.length_preference} (total weighting: ${COMPLETION_TIME_WEIGHTING})`);
            sum_factors += completion_time_weight * s.length_preference * COMPLETION_TIME_WEIGHTING;
        } else {
            console.log(`Completion time: ${s.live_service_preference} (total weighting: ${COMPLETION_TIME_WEIGHTING})`);
            sum_factors += s.live_service_preference * COMPLETION_TIME_WEIGHTING;
        }

        let avg_factors = sum_factors / total_factors;
        return avg_factors;
    }

    get_game_weighted_price(game, quality_ratings) {
        let preference = this.get_game_preference(game, quality_ratings);
        
        let weighted_price = (game.price / preference) / this.gamer_stats.gamerness;
        return weighted_price;
    }
}

// temp
let avg_game_qualities = {
    [Game.QualityType.Ui_Graphics]: 100,
    [Game.QualityType.Game_Graphics]: 100,
    [Game.QualityType.Audio_Design]: 100,
    [Game.QualityType.Soundtrack]: 100,
    [Game.QualityType.Overall_Gameplay]: 100,
    [Game.QualityType.Replayability]: 100,
} 

let test_game = null;
let test_person = null;

document.addEventListener("DOMContentLoaded", function(e) {
    test_game = new Game(
        "Scrimblo Adventures 2 Deluxe Platinum",
        [["zombies", 0.5], ["monsters", 0.5]],
        [[all_features[0], 1]],
        [["horror", 1]],
        [["postgame content", 1]],
        [[Game.PlayerMode.Singleplayer, 0.5], [Game.PlayerMode.Multiplayer, 0.5]],
        [[Game.MaturityRating.Violence, 4], [Game.MaturityRating.Dark_Themes, 1]],
        Game.CompletionTime.Medium, {
            [Game.QualityType.Ui_Graphics]: 23,
            [Game.QualityType.Game_Graphics]: 182,
            [Game.QualityType.Audio_Design]: 223,
            [Game.QualityType.Soundtrack]: 92,
            [Game.QualityType.Overall_Gameplay]: 192,
            [Game.QualityType.Replayability]: 50,
        }, 30
    )

    test_person = new Person(
        new P_SocialStats(0, 0, 0, 0),
        new P_GamerStats(
            0.7,
            Game.Theme.reduce((o, k) => ({...o, [k]: (Math.random() * 2) - 1}), {}),
            all_features.reduce((o, k) => ({...o, [k.name]: (Math.random() * 2) - 1}), {}),
            Game.Genre.reduce((o, k) => ({...o, [k]: (Math.random() * 2) - 1}), {}),
            Game.Structure.reduce((o, k) => ({...o, [k]: (Math.random() * 2) - 1}), {}),
            Object.values(Game.PlayerMode).reduce((o, k) => ({...o, [k]: Math.random() < 0.5 ? 0 : 1}), {}),
            Object.values(Game.MaturityRating).reduce((o, k) => ({...o, [k]: (Math.random() * 2) - 1}), {}),
            {
                [Game.QualityType.Ui_Graphics]: Math.random(),
                [Game.QualityType.Game_Graphics]: Math.random(),
                [Game.QualityType.Audio_Design]: Math.random(),
                [Game.QualityType.Soundtrack]: Math.random(),
                [Game.QualityType.Overall_Gameplay]: Math.random(),
                [Game.QualityType.Replayability]: Math.random(),
            },
            (Math.random() * 2) - 1,
            (Math.random() * 2) - 1,
            1
        ),
        new Job(
            "Chief Button Pressing Officer",
            50000, 5, 10, 15
        )
    )

    get_canvases();

    handle_resize();
});