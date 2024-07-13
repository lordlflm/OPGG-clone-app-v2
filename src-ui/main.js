const { invoke } = window.__TAURI__.tauri;

class Summoner {
    constructor() {
        this.puuid = null;
        this.id = null;
        this.accountId = null;
        this.gameName = null;
        this.tagLine = null;
        this.iconId = null;
        this.level = null;
        this.server = null;
        this.soloLeague = new League;
        this.flexLeague = new League;
        this.highestTier = null;
    }
}

class League {
    constructor() {
        this.leagueType = null;
        this.tier = null;
        this.rank = null;
        this.leaguePoints = null;
        this.wins = null;
        this.losses = null;
    }
}

validRegions = ["north america", "korea", "middle east", "europe west", "europe nordic & east", "oceania", "japan", "brazil",
                "LAS", "LAN", "russia", "turkiye", "singapore", "philippines", "taiwan", "vietnam", "thailand"];

let top_solo_players = new Array();
let top_flex_players = new Array();

document.getElementById("summoner-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    invalidFlag = 0;
    
    // TODO make sure name is of valid length
    if (data["summoner-name"] == "") {
        document.getElementById("summoner-invalid-div").style.display = "block";
        document.getElementById("summoner-name-invalid").textContent = "invalid summoner name";
        invalidFlag++;
    } else {
        document.getElementById("summoner-name-invalid").textContent = "";
    }
    //TODO make sure tagline is valid/of valid length
    if (!data["summoner-name"].includes("#")) {
        document.getElementById("summoner-invalid-div").style.display = "block";
        document.getElementById("summoner-tag-invalid").textContent = "invalid #tagline";
        invalidFlag++;
    } else {
        document.getElementById("summoner-tag-invalid").textContent = "";
    }
    if (!validRegions.includes(data["summoner-region"])) {
        document.getElementById("summoner-invalid-div").style.display = "block";
        document.getElementById("summoner-region-invalid").textContent = "invalid region";
        invalidFlag++;
    } else {
        document.getElementById("summoner-region-invalid").textContent = "";
    }
    
    //TODO sanitize data for XSS/SQLi
    //TODO trim spaces

    if (invalidFlag == 0) {
        try {
            const response = await invoke('get_puuid', { data });
            if (response.success === "true") {
                document.getElementById("summoner-invalid").textContent = "";
                const queryParams = new URLSearchParams();
                queryParams.append("gameName", response.gameName);
                queryParams.append("tagLine", response.tagLine);
                queryParams.append("region", response.region);
                queryParams.append("puuid", response.puuid);
                window.location.href = `summoner.html?${queryParams.toString()}`;
            } else {
                document.getElementById("summoner-invalid").textContent = "This summoner does not exist";
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const top_players = await invoke("get_top_players", { queue: "RANKED_SOLO_5x5" });
        if (top_players.length != 0) {
            for (let player of top_players) {
                let summoner_object = new Summoner();
                summoner_object.id = player.summonerId.slice(1, -1);
                summoner_object.server = player.region;
                summoner_object.soloLeague.leaguePoints = player.leaguePoints;
                summoner_object.soloLeague.wins = player.wins;
                summoner_object.soloLeague.losses = player.losses;
                top_solo_players.push(summoner_object);

                // const summoner = await invoke("")
            }

            console.debug(top_solo_players);
            display_top_players("RANKED_SOLO_5x5");
        } else {
            console.debug("NOOOOO");
        }

    } catch (error) {
        console.error('Error:', error);
    }
});

function display_top_players(queue) {
    if (queue == "RANKED_SOLO_5x5") {
        for (let summoner of top_solo_players) {
            let summoner_div = document.createElement("div");
            let region = document.createTextNode(`Top challenger of ${summoner.server}`);
            let winrate = document.createTextNode(`${summoner.soloLeague.wins} wins / ${summoner.soloLeague.losses} losses (${Math.round(parseInt(summoner.soloLeague.wins, 10)/(parseInt(summoner.soloLeague.wins, 10)+parseInt(summoner.soloLeague.losses, 10))*100)} winrate)`);
            let lp = document.createTextNode(`Challenger ${summoner.soloLeague.leaguePoints} LP`);
            summoner_div.appendChild(region);
            summoner_div.appendChild(document.createElement("br"));
            summoner_div.appendChild(lp)
            summoner_div.appendChild(document.createElement("br"));
            summoner_div.appendChild(winrate);
            document.getElementById("top-players-container-div").appendChild(summoner_div);
        }
    } else if (queue == "RANKED_FLEX_5x5") {

    } else {

    }
}