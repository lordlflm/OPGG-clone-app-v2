const { invoke } = window.__TAURI__.tauri

validRegions = ["north america", "korea"]

document.getElementById("summoner-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    invalidFlag = 0;

    console.debug(data)

    // TODO make sure name is of valid length
    if (data["summoner-name"] == "") {
        document.getElementById("summoner-name-invalid").textContent = "invalid summoner name";
        invalidFlag++;
    } else {
        document.getElementById("summoner-name-invalid").textContent = "";
    }
    if (!data["summoner-name"].includes("#")) {
        document.getElementById("summoner-tag-invalid").textContent = "invalid #tagline";
        invalidFlag++;
    } else {
        document.getElementById("summoner-tag-invalid").textContent = "";
    }
    if (!validRegions.includes(data["summoner-region"])) {
        document.getElementById("summoner-region-invalid").textContent = "invalid region";
        invalidFlag++;
    } else {
        document.getElementById("summoner-region-invalid").textContent = "";
    }
    
    //TODO sanitize data for XSS/SQLi
    //TODO trim spaces
    //TODO make sure tagline is there, valid, of valid length

    if (invalidFlag == 0) {
        try {
            const response = await invoke('get_account', { data });
            console.debug(response)
            if (response.success) {
                document.getElementById("summoner-invalid").textContent = "";
                // TODO render summoner page and pass it arguments
            } else {
                document.getElementById("summoner-invalid").textContent = "This summoner does not exist";
            }
        } catch (error) {

        }
    }
});
