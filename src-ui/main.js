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

function region_tag_to_region(tag) {
    switch (tag) {
        case "na1":
            return "north america";
        case "br1": 
            return "brazil";
        case "kr":
            return "korea";
        case "la1":
            return "LAN";
        case "la2":
            return "LAS";
        case "eun1":
            return "europe nordic & east";
        case "euw1":
            return "europe west";
        case "oc1":
            return "oceania";
        case "jp1":
            return "japan";
        case "ru1", "ru":
            return "russia";
        case "tr1":
            return "turkiye";
        case "me1":
            return "middle east";
        case "ph2":
            return "philippines";
        case "sg2":
            return "singapore";
        case "tw2":
            return "taiwan";
        case "th2":
            return "thailand";
        case "vn2":
            return "vietnam"
        default:
            return "ERROR";
    }
}

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
            const response = await invoke('get_account_by_gamename', { data });
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
        if (top_solo_players.length == 0) {
            await populate_top_players_array(top_solo_players, "RANKED_SOLO_5x5");
        }
        display_top_players("RANKED_SOLO_5x5");
    } catch (error) {
        console.error('Error:', error);
    }
});

document.getElementById("rank-type-select").addEventListener("change", async () => {
    rankType = document.getElementById("rank-type-select").value;
    if (rankType === "flex") {
        if (top_flex_players.length == 0) {
            await populate_top_players_array(top_flex_players, "RANKED_FLEX_SR")
        }
        display_top_players("RANKED_FLEX_SR");
    } else {
        if (top_solo_players.length == 0) {
            await populate_top_players_array(top_solo_players, "RANKED_SOLO_5x5");
        }
        display_top_players("RANKED_SOLO_5x5");
    }
});

function display_top_players(queue) {
    if (document.getElementById("top-player-div")) {
        document.getElementById("top-player-div").remove();
    }
    if (queue == "RANKED_SOLO_5x5") {
        for (let summoner of top_solo_players) {
            display_summoner(summoner);
        }
    } else if (queue == "RANKED_FLEX_SR") {
        for (let summoner of top_flex_players) {
            display_summoner(summoner);
        }
    } else {
        //TODO display nothing?
    }
}

async function populate_top_players_array(top_players_array, queueType) {
    const top_players = await invoke("get_top_players", { queue: queueType });
    if (top_players.length != 0) {
        console.debug(top_players);
        for (let player of top_players) {
            if (player.success === "true") {
                let summoner_object = new Summoner();
                summoner_object.id = player.summonerId.slice(1, -1);
                summoner_object.server = region_tag_to_region(player.region);
                summoner_object.soloLeague.leaguePoints = player.leaguePoints;
                summoner_object.soloLeague.wins = player.wins;
                summoner_object.soloLeague.losses = player.losses;
                summoner_object.accountId = player.accountId.slice(1, -1);
                summoner_object.puuid = player.puuid.slice(1, -1);
                summoner_object.iconId = player.profileIconId;
                summoner_object.level = player.summonerLevel;
                summoner_object.gameName = player.gameName.slice(1, -1);
                summoner_object.tagLine = player.tagLine.slice(1, -1);
                
                top_players_array.push(summoner_object);
            }
        }
    } else {
        //TODO couldnt fetch any top players internal error
        console.debug("NOOOOO");
    }
}

//might rethink logic here after doing styles (e.g. remove br tags)
function display_summoner(summoner) {
    //this div is used to have a border for now since anchors dont display border as expected
    let summoner_div = document.createElement("div");
    summoner_div.id = "top-player-div";
    let summoner_anchor = document.createElement("a");
    summoner_anchor.href = `summoner.html?gameName=${encodeURIComponent(summoner.gameName)}&region=${encodeURIComponent(summoner.server)}&puuid=${summoner.puuid}`;
    let region = document.createTextNode(`Top challenger of ${summoner.server}`);
    let winrate = document.createTextNode(`${summoner.soloLeague.wins} wins / ${summoner.soloLeague.losses} losses (${Math.round(parseInt(summoner.soloLeague.wins, 10)/(parseInt(summoner.soloLeague.wins, 10)+parseInt(summoner.soloLeague.losses, 10))*100)}% winrate)`);
    let lp = document.createTextNode(`Challenger ${summoner.soloLeague.leaguePoints} LP`);
    let icon = document.createElement("img");
    icon.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summoner.iconId}.jpg`;
    let name = document.createTextNode(`${summoner.gameName}`);
    summoner_anchor.appendChild(icon);
    summoner_anchor.appendChild(document.createElement("br"));
    summoner_anchor.appendChild(region);
    summoner_anchor.appendChild(document.createElement("br"));
    summoner_anchor.appendChild(name);
    summoner_anchor.appendChild(document.createElement("br"));
    summoner_anchor.appendChild(lp)
    summoner_anchor.appendChild(document.createElement("br"));
    summoner_anchor.appendChild(winrate);
    summoner_div.appendChild(summoner_anchor);
    document.getElementById("top-players-container-div").appendChild(summoner_div);
}