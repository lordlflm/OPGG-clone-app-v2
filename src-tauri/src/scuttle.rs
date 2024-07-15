use serde_json::Value;
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

const VALID_REGIONS: [&str; 17] = ["north america", "korea", "middle east", "europe west", "europe nordic & east",
                                   "oceania", "japan", "brazil", "LAS", "LAN", "russia", "turkiye", "singapore",
                                   "philippines", "taiwan", "vietnam", "thailand"];

pub async fn get_account_from_gamename(summoner_name: &String, summoner_tag: &String) -> Result<HashMap<String, String>, Error> {
  let mut response = HashMap::new();
  
  let url = format!("https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{name}/{tag}?api_key={api_key}",
    name = encode(summoner_name),
    tag = summoner_tag,
    api_key = *RIOT_API_KEY);

  let puuid_response = reqwest::get(url)
    .await?
    .json::<HashMap<String, String>>()
    .await?;

  for (key, value) in &puuid_response {
    response.insert(key.to_string(), value.to_string());
  }

  Ok(response)
}

pub async fn get_summoner_from_puuid(puuid: String, region: String) -> Result<HashMap<String, String>, Error> {
  let mut response = HashMap::new();
  let region_tag: String;
  match get_region_tag(&region) {
    Ok(region_tag_string) => region_tag = region_tag_string,
    Err(_) => return Ok(response), // this could probably be done better but the Err return type is reqwest::Error
  }

  let url = format!("https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}?api_key={api_key}",
    region = region_tag,
    puuid = puuid,
    api_key = *RIOT_API_KEY);

  let account_response = reqwest::get(url)
    .await?
    .json::<HashMap<String, Value>>()
    .await?;

  for (key, value) in &account_response {
    response.insert(key.to_string(), value.to_string());
  }

  Ok(response)
}

pub async fn get_league_from_summoner_id(summoner_id: String, region: String) -> Result<Vec<HashMap<String, String>>, Error> {
  let mut response = Vec::new();
  let region_tag: String;
  match get_region_tag(&region) {
    Ok(region_tag_string) => region_tag = region_tag_string,
    Err(_) => return Ok(response), // this could probably be done better but the Err return type is reqwest::Error
  }

  let url = format!("https://{region}.api.riotgames.com/lol/league/v4/entries/by-summoner/{summoner_id}?api_key={api_key}",
    region = region_tag,
    summoner_id = summoner_id,
    api_key = *RIOT_API_KEY);

  let league_response = reqwest::get(url)
    .await?
    .json::<Vec<HashMap<String, Value>>>()
    .await?;

  for entry in league_response {
    let mut tmp_map = HashMap::new();
    for (key, value) in entry {
      tmp_map.insert(key.to_string(), value.to_string());
    }
    response.push(tmp_map);
  }

  Ok(response)
}

pub async fn get_challenger_players_from_queue(queue: &String, region_tag: &String) -> Result<Vec<HashMap<String, Value>>, Error> {
  let mut response = Vec::new();

  let url = format!("https://{region}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/{queue}?api_key={api_key}",
    region = region_tag,
    queue = queue,
    api_key = *RIOT_API_KEY);

  let challenger_players_response = reqwest::get(url)
    .await?
    .json::<HashMap<String, Value>>()
    .await?;

  for (key, value) in &challenger_players_response {
    if key == "entries" {
      let datas: Vec<HashMap<String, Value>> = serde_json::from_value(value.clone()).unwrap();
      for entry in datas.iter() {
        response.push(entry.clone());
      }
    }
  }

  Ok(response)

}

pub async fn get_summoner_from_summoner_id(id: String, region: String) -> Result<HashMap<String, String>, Error> {
  let mut response = HashMap::new();
  let region_tag: String;
  match get_region_tag(&region) {
    Ok(region_tag_string) => region_tag = region_tag_string,
    Err(_) => return Ok(response), // this could probably be done better but the Err return type is reqwest::Error
  }

  let url = format!("https://{region}.api.riotgames.com/lol/summoner/v4/summoners/{summoner_id}?api_key={api_key}",
    region = region_tag,
    summoner_id = id,
    api_key = *RIOT_API_KEY);

  let summoner_response = reqwest::get(url)
    .await?
    .json::<HashMap<String, Value>>()
    .await?;

  for (key, value) in &summoner_response {
    response.insert(key.to_string(), value.to_string());
  }

  Ok(response)
}

pub async fn get_account_from_puuid(puuid: String) -> Result<HashMap<String, String>, Error> {
  let mut response = HashMap::new();

  let url = format!("https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/{puuid}?api_key={api_key}",
    puuid = puuid,
    api_key = *RIOT_API_KEY);

  let account_response = reqwest::get(url)
    .await?
    .json::<HashMap<String, Value>>()
    .await?;

  for (key, value) in &account_response {
    response.insert(key.to_string(), value.to_string());
  }

  Ok(response)
}

fn get_region_tag(region: &String) -> Result<String, ()> {
  // if !VALID_REGIONS.contains(&region.as_str()) {
  //   return Err(());
  // }

  match region.as_str() {
    "north america" | "na1" => Ok("na1".to_string()),
    "brazil" | "br1" => Ok("br1".to_string()),
    "LAS" | "la2" => Ok("la2".to_string()),
    "LAN" | "la1" => Ok("la1".to_string()),
    "korea" | "kr" => Ok("kr".to_string()),
    "europe nordic & east" | "eun1" => Ok("eun1".to_string()),
    "europe west" | "euw1" => Ok("euw1".to_string()),
    "oceania" | "oc1" => Ok("oc1".to_string()),
    "japan" | "jp1" => Ok("jp1".to_string()),
    "russia" | "ru1" | "ru" => Ok("ru".to_string()),
    "turkiye" | "tr1" => Ok("tr1".to_string()),
    "middle east" | "me1" => Ok("me1".to_string()),
    "philippines" | "ph2" => Ok("ph2".to_string()),
    "singapore" | "sg2" => Ok("sg2".to_string()),
    "taiwan" | "tw2" => Ok("tw2".to_string()),
    "thailand" | "th2" => Ok("th2".to_string()),
    "vietnam" | "vn2" => Ok("vn2".to_string()),
    _ => return Err(()),
  }
}