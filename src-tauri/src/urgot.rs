use urlencoding::encode;
use reqwest::Error;
use dotenv::dotenv;
use lazy_static::lazy_static;

use std::collections::HashMap;

lazy_static! {
  static ref RIOT_API_KEY: String = {
    dotenv().ok();
    std::env::var("RIOT_API_KEY").expect("Riot API key must be set in a .env file")
  };
}

#[tokio::main]
pub async fn get_puuid_from_gamename(summoner_name: String, summoner_tag: String, summoner_region: String) -> Result<String, Error> {
  //TODO not hard code region
  
  let url = format!("https://{region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{name}/{tag}?api_key={api_key}",
    region = "americas",
    name = encode(&summoner_name),
    tag = summoner_tag,
    api_key = *RIOT_API_KEY);

  let puuid_response = reqwest::get(url)
    .await?
    .json::<HashMap<String, String>>()
    .await?;

  Ok(puuid_response.get("puuid").unwrap().to_string())
}