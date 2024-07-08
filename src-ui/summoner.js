const { invoke } = window.__TAURI__.tauri;

class Summoner {
    constructor() {}
    puuid;
    id;
    accountId;
    ign;
    tag;
    iconId;
    level;
    server;
}

let summoner = new Summoner();

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const queryParams = {};
    for (const [key, value] of params.entries()) {
        queryParams[key] = value;
    }
    summoner.puuid = queryParams["puuid"];
    summoner.ign = queryParams["ign"];
    summoner.tag = queryParams["tag"];
    summoner.server = queryParams["region"];

    try {
        const account = await invoke('get_account', { puuid: summoner.puuid, region: summoner.server});
        console.debug(account);
        if (account.success === "true") {
            summoner.iconId = account.profileIconId;
            summoner.level = account.summonerLevel;
            summoner.id = account.id;
            summoner.accountId = account.accountId;
        } else {
            // TODO an error occured
            console.debug("NOT GOOD");
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