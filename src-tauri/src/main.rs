// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod urgot;

use std::collections::HashMap;

fn main() {
  tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![get_account])
  .run(tauri::generate_context!())
  .expect("error while running tauri application");
}

#[tauri::command]
fn get_account(data: HashMap<String, String>) -> Result<HashMap<String, String>, String> {
  let summoner_name: String;
  let summoner_tag: String;
  let summoner_region: String;
  let summoner_puuid: String;
  let i: usize;

  match data.get("summoner-name") { 
    Some(name) => {
      match name.find("#") {
        Some(index) => i = index,
        None => return Err("Something went wrong: No summoner tag".to_string()),
      }
      summoner_name = name[..i].to_string();
      summoner_tag = name[i+1..].to_string();
    },
    None => return Err("Something went wrong: No summoner name".to_string()),
  }

  match data.get("summoner-region") {
    Some(region) => summoner_region = region.to_string(),
    None => return Err("Something went wrong: No summoner region".to_string()),
  }

  match urgot::get_puuid_from_gamename(summoner_name, summoner_tag) {
    Ok(puuid) => summoner_puuid = puuid,
    Err(_) => {
      let mut response = HashMap::new();
      response.insert("success".to_string(), "false".to_string());
      return Ok(response);
    },
  }

  let mut response = HashMap::new();
  response.insert("success".to_string(), "true".to_string());
  Ok(response)
}