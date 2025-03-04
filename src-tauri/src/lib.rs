// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![create_main_view])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn create_main_view(app: tauri::AppHandle) {
    tauri::WebviewWindowBuilder::from_config(
        &app,
        &app.config().app.windows.get(1).unwrap().clone(),
    )
    .unwrap()
    .build()
    .unwrap();
}
