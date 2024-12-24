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
- price

- quality:
    - ui graphics
    - game graphics
    - audio design
    - soundtrack
    - overall gameplay
    - gameplay split by each player-ness (if more than one)
    - replayability


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
- player-ness based
- mature themes based
- different quality affinity measures, all 0 - 1.

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

    constructor(title, themes, features, genres, playermodes, maturity_ratings, completion_time, quality, price) {
        this.title = title;

        this.themes = themes;
        this.features = features;
        this.genres = genres;
        this.playermodes = playermodes;
        this.maturity_ratings = maturity_ratings;
        this.completion_time = completion_time;
        this.quality = quality;
        this.price = price;

        this.description = this.get_description();
    }

    get_description() {

    }
}

document.addEventListener("DOMContentLoaded", function(e) {
    let test_game = new Game(

    )

    get_canvases();

    handle_resize();
});