game_id = "trade";

let settlement = null;
let industry = null;

document.addEventListener("DOMContentLoaded", function(e) {
    settlement = new Settlement(
        "Scrimbloton", [
            new Industry(industry_template_list["Food Company"], settlement, 250)
        ]
    );

    industry = settlement.industries[0];
});