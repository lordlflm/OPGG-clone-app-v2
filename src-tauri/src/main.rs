// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;
use lazy_static::lazy_static;
use urlencoding::encode;
use reqwest::Error;
use serde::Deserialize;

lazy_static! {
  static ref RIOT_API_KEY: String = {
    dotenv().ok();
    std::env::var("RIOT_API_KEY").expect("Riot API key must be set in a .env file")
  };
}


fn main() {
  tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![get_account])
  .run(tauri::generate_context!())
  .expect("error while running tauri application");
}

#[tauri::command]
async fn get_account(data: std::collections::HashMap<String, String>) -> Result<std::collections::HashMap<String, String>, String> {
  let summoner_name: String;
  let summoner_tag: String;
  let summoner_region: String;
  let i: usize;

  match data.get("summoner-name") { 
    Some(name) => {
      match name.find("#") {
        Some(index) => i = index,
        None => return Err("Something went wrong: No summoner tag".to_string()),
      }
      summoner_name = name[..i].to_string();
      summoner_tag = name[i..].to_string();
    },
    None => return Err("Something went wrong: No summoner name".to_string()),
  }

  match data.get("summoner-region") {
    Some(region) => summoner_region = region.to_string(),
    None => return Err("Something went wrong: No summoner region".to_string()),
  }

  let puuid_response = reqwest::get(format!("https://{region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{name}/{tag}?api_key={api_key}",
                                          region = "americas",
                                          name = encode(&summoner_name),
                                          tag = summoner_tag,
                                          api_key = *RIOT_API_KEY))
    .await?;

  // #[derive(Deserialize, Debug)]
  // struct Puuid {
  //   puuid: std::collections::HashMap<String, String>,
  //   name: std::collections::HashMap<String, String>,
  //   tag: std::collections::HashMap<String, String>,
  // }

  // let pid: Vec<Puuid> = puuid_response.json();
  // println!("{:?}", pid);


  // 1. make riot api call
  // 2. if we get a summoner object render html page
  // 3. if not stay on page and render error msg

  let mut response = std::collections::HashMap::new();
  response.insert("success".to_string(), "true".to_string());
  Ok(response)
}
