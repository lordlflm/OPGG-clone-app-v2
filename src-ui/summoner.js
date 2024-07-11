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

const tierValues = new Map([
    ['IRONS', 0],
    ['BRONZE', 1],
    ['SILVER', 2],
    ['GOLD', 3],
    ['PLATINUM', 4],
    ['EMERALD', 5],
    ['DIAMOND', 6],
    ['MASTER', 7],
    ['GRANDMASTER', 8],
    ['CHALLENGER', 9]
]);

let summoner = new Summoner();

document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);
    const queryParams = {};
    for (const [key, value] of params.entries()) {
        queryParams[key] = value;
    }
    summoner.puuid = queryParams["puuid"];
    summoner.gameName = queryParams["gameName"];
    summoner.tagLine = queryParams["tagLine"];
    summoner.server = queryParams["region"];

    try {
        // call to `/lol/summoner/v4/summoners/by-puuid/{encryptedPUUID}` endpoint
        await fetch_account();

        //call to `/lol/league/v4/entries/by-summoner/{encryptedSummonerId}` endpoint
        await fetch_leagues();

    } catch (error) {
        console.error('Error:', error);
    }

    console.debug(summoner)
    await displaySummoner();
});

document.getElementById("rank-type-select").addEventListener("change", () => {
    rankType = document.getElementById("rank-type-select").value;
    if (rankType === "flex") {
        displayFlexRank();
    } else {
        displaySoloRank();
    }
});

async function fetch_account() {
    const account = await invoke('get_account', { puuid: summoner.puuid, region: summoner.server});
    if (account.success === "true") {
        summoner.iconId = account.profileIconId;
        summoner.level = account.summonerLevel;
        summoner.id = account.id.slice(1, -1);
        summoner.accountId = account.accountId.slice(1, -1);
    } else {
        console.debug("Error while fetching endpoint `/lol/summoner/v4/summoners/by-puuid/{encryptedPUUID}`");
    }
}

async function fetch_leagues() {
    const leagues = await invoke('get_leagues', { summonerId: summoner.id, region: summoner.server });
    if (leagues[0].success === "true") {
        for (let league of leagues) {
            if (league.queueType && league.queueType.slice(1, -1) === "RANKED_SOLO_5x5") {
                summoner.soloLeague.leagueType = league.queueType.slice(1, -1);
                summoner.soloLeague.tier = league.tier.slice(1, -1);
                summoner.soloLeague.rank = league.rank.slice(1, -1);
                summoner.soloLeague.leaguePoints = league.leaguePoints;
                summoner.soloLeague.wins = league.wins;
                summoner.soloLeague.losses = league.losses;
                if (summoner.highestTier == null || tierValues.get(summoner.soloLeague.tier) > tierValues.get(summoner.highestTier)) {
                    summoner.highestTier = summoner.soloLeague.tier;
                }
            }
            if (league.queueType && league.queueType.slice(1, -1) === "RANKED_FLEX_SR") {
                summoner.flexLeague.leagueType = league.queueType.slice(1, -1);
                summoner.flexLeague.tier = league.tier.slice(1, -1);
                summoner.flexLeague.rank = league.rank.slice(1, -1);
                summoner.flexLeague.leaguePoints = league.leaguePoints;
                summoner.flexLeague.wins = league.wins;
                summoner.flexLeague.losses = league.losses;
                if (summoner.highestTier == null || tierValues.get(summoner.flexLeague.tier) > tierValues.get(summoner.highestTier)) {
                    summoner.highestTier = summoner.flexLeague.tier;
                }
            }
        }
    } else {
        console.debug("Error while fetching endpoint `/lol/league/v4/entries/by-summoner/{encryptedSummonerId}`");
    }
}

async function displaySummoner() {
    document.getElementById("ign").textContent = summoner.gameName;
    document.getElementById("tag").textContent = "#" + summoner.tagLine;
    document.getElementById("server").textContent = summoner.server;
    document.getElementById("level").textContent = summoner.level;
    document.getElementById("icon").src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summoner.iconId}.jpg`;
    if (summoner.highestTier) {
        // TODO this icon can be better
        document.getElementById("rank-icon").src = `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${summoner.highestTier.toLowerCase()}.png`;
    }
    displaySoloRank();
}

function displaySoloRank() {
    if (summoner.soloLeague.tier) {
        document.getElementById("rank").textContent = summoner.soloLeague.tier + " " + 
            summoner.soloLeague.rank + " " + summoner.soloLeague.leaguePoints + " LP";
            const winrate = Math.round(parseInt(summoner.soloLeague.wins, 10)/(parseInt(summoner.soloLeague.wins, 10)+parseInt(summoner.soloLeague.losses, 10))*100);
        document.getElementById("winrate").textContent = summoner.soloLeague.wins + " wins / " + 
            summoner.soloLeague.losses + " losses (" + winrate + "% winrate)";
    } else {
        document.getElementById("rank").textContent = "Unranked";
        document.getElementById("winrate").textContent = "";
    }
}

function displayFlexRank() {
    if (summoner.flexLeague.tier) {
        document.getElementById("rank").textContent = summoner.flexLeague.tier + " " + 
            summoner.flexLeague.rank + " " + summoner.flexLeague.leaguePoints + " LP";
            const winrate = Math.round(parseInt(summoner.flexLeague.wins, 10)/(parseInt(summoner.flexLeague.wins, 10)+parseInt(summoner.flexLeague.losses, 10))*100);
        document.getElementById("winrate").textContent = summoner.flexLeague.wins + " wins / " + 
            summoner.flexLeague.losses + " losses (" + winrate + "% winrate)";
    } else {
        document.getElementById("rank").textContent = "Unranked";
        document.getElementById("winrate").textContent = "";
    }
}