const { invoke } = window.__TAURI__.tauri;

class Summoner {
    constructor() {}
    puuid;
    id;
    accountId;
    gameName;
    tagLine;
    iconId;
    level;
    server;
    soloDuoLeague;
    flexLeague;
}

class League {
    constructor() {}
    leagueType;
    tier;
    rank;
    leaguePoints;
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
        const account = await invoke('get_account', { puuid: summoner.puuid, region: summoner.server});
        if (account.success === "true") {
            summoner.iconId = account.profileIconId;
            summoner.level = account.summonerLevel;
            summoner.id = account.id;
            summoner.accountId = account.accountId;
        } else {
            console.debug("Error while fetching endpoint `/lol/summoner/v4/summoners/by-puuid/{encryptedPUUID}`");
        }

        //call to `/lol/league/v4/entries/by-summoner/{encryptedSummonerId}` endpoint
        const league = await invoke('get_league', { summonerId: summoner.id, region: summoner.server });
        if (league.success === "true") {
            let soloDuoLeague = new League();
            console.debug(league);
        } else {
            console.debug("Error while fetching endpoint `/lol/league/v4/entries/by-summoner/{encryptedSummonerId}`");
        }
    } catch (error) {
        console.error('Error:', error);
    }

    console.debug(summoner)
    displaySummoner(summoner);
});

function displaySummoner(summoner) {
    document.getElementById("ign").textContent = summoner.ign;
    document.getElementById("tag").textContent = "#" + summoner.tag;
    document.getElementById("server").textContent = summoner.server;
    document.getElementById("level").textContent = summoner.level;
    document.getElementById("icon").src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summoner.iconId}.jpg`
}