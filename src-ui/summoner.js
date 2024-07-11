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
    displaySummoner();
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
            }
            if (league.queueType && league.queueType.slice(1, -1) === "RANKED_FLEX_SR") {
                summoner.flexLeague.leagueType = league.queueType.slice(1, -1);
                summoner.flexLeague.tier = league.tier.slice(1, -1);
                summoner.flexLeague.rank = league.rank.slice(1, -1);
                summoner.flexLeague.leaguePoints = league.leaguePoints;
                summoner.flexLeague.win = league.win;
                summoner.flexLeague.losses = league.losses;
            }
        }
    } else {
        console.debug("Error while fetching endpoint `/lol/league/v4/entries/by-summoner/{encryptedSummonerId}`");
    }
}

function displaySummoner() {
    document.getElementById("ign").textContent = summoner.gameName;
    document.getElementById("tag").textContent = "#" + summoner.tagLine;
    document.getElementById("server").textContent = summoner.server;
    document.getElementById("level").textContent = summoner.level;
    document.getElementById("icon").src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summoner.iconId}.jpg`
}