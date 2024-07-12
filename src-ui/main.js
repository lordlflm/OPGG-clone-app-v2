const { invoke } = window.__TAURI__.tauri;

validRegions = ["north america", "korea", "middle east", "europe west", "europe nordic & east", "oceania", "japan", "brazil",
                "LAS", "LAN", "russia", "turkiye", "singapore", "philippines", "taiwan", "vietnam", "thailand"];

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
        const top_solo_players = await invoke("get_top_players", { queue: "RANKED_SOLO_5x5" });
        if (top_players[0].success === "true") {
            console.debug("GOOOOD");
        } else {
            console.debug("NOOOOO");
        }

    } catch (error) {
        console.error('Error:', error);
    }
});