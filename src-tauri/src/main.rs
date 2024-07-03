// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;
use lazy_static::lazy_static;

lazy_static! {
  static ref RIOT_API_KEY: String = {
    dotenv().ok();
    std::env::var("RIOT_API_KEY").expect("Riot API key must be set in a .env file")
  };
}


fn main() {
  tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![get_summoner])
  .run(tauri::generate_context!())
  .expect("error while running tauri application");
}

#[tauri::command]
fn get_summoner(data: std::collections::HashMap<String, String>) -> Result<String, String> {
  // 1. make riot api call
  // 2. if we get a summoner object render html page
  // 3. if not stay on page and render error msg
  println!("{}", *RIOT_API_KEY);

  Ok("Summoner found".to_string())
}
