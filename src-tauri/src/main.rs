// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod scuttle;

use std::collections::HashMap;

fn main() {
  tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![get_puuid, get_account, get_leagues])
  .run(tauri::generate_context!())
  .expect("error while running tauri application");
}

#[tauri::command]
fn get_puuid(data: HashMap<String, String>) -> Result<HashMap<String, String>, String> {
  let mut response = HashMap::new();
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
      summoner_tag = name[i+1..].to_string();
    },
    None => return Err("Something went wrong: No summoner name".to_string()),
  }

  match data.get("summoner-region") {
    Some(region) => summoner_region = region.to_string(),
    None => return Err("Something went wrong: No summoner region".to_string()),
  }

  match scuttle::get_puuid_from_gamename(&summoner_name, &summoner_tag) {
    Ok(summoner) => {
      response.insert("success".to_string(), "true".to_string());
      response.insert("region".to_string(), summoner_region);
      for (key, value) in &summoner {
        response.insert(key.to_string(), value.to_string());
      }
      return Ok(response);
    },
    Err(_) => {
      response.insert("success".to_string(), "false".to_string());
      return Ok(response);
    },
  }
}

#[tauri::command]
fn get_account(puuid: String, region: String) -> Result<HashMap<String, String>, String> {
  let mut response = HashMap::new();

  match scuttle::get_account_from_puuid(puuid, region) {
    Ok(account) => {
      if account.len() == 0 {
        response.insert("success".to_string(), "false".to_string());
        return Ok(response);
      }

      response.insert("success".to_string(), "true".to_string());
      for (key, value) in &account {
        response.insert(key.to_string(), value.to_string());
      }
      return Ok(response);
    },
    Err(_) => {
      response.insert("success".to_string(), "false".to_string());
      return Ok(response);
    },
  }
}

#[tauri::command]
fn get_leagues(summoner_id: String, region: String) -> Result<Vec<HashMap<String, String>>, String> {
  let mut response = Vec::new();
  let mut response_map = HashMap::new();

  match scuttle::get_league_from_summoner_id(summoner_id, region) {
    Ok(leagues) => {
      if leagues.len() == 0 {
        response_map.insert("success".to_string(), "false".to_string());
        response.push(response_map);
        return Ok(response);
      }

      response_map.insert("success".to_string(), "true".to_string());
      response.push(response_map);
      for entry in leagues {
        let mut tmp_map = HashMap::new();
        for (key, value) in entry {
          tmp_map.insert(key.to_string(), value.to_string());
        }
        response.push(tmp_map);
      }
      return Ok(response);
    },
    Err(_) => {
      response_map.insert("success".to_string(), "false".to_string());
      response.push(response_map);
      return Ok(response);
    },
  }
}