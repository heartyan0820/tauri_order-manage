// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(desktop)]
mod desktop_tray {
    use tauri::{tray::{MouseButton, TrayIconBuilder, TrayIconEvent}, App, Manager};

    pub fn setup(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
        let tray = TrayIconBuilder::with_id("main-tray")
            .tooltip("订单管理系统")
            .icon(app.default_window_icon().unwrap().clone())
            .on_menu_event(|app, event| {
                match event.id().0.as_str() {
                    "show" => {
                        if let Some(win) = app.get_webview_window("main") {
                            let _ = win.show();
                            let _ = win.set_focus();
                            let _ = win.unminimize();
                        }
                    }
                    "hide" => {
                        if let Some(win) = app.get_webview_window("main") {
                            let _ = win.hide();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                }
            })
            .build(app)?;

        let app_handle = app.handle().clone();
        tray.on_tray_icon_event(move |_tray, event| {
            if let TrayIconEvent::Click { button: MouseButton::Left, .. } = event {
                if let Some(win) = app_handle.get_webview_window("main") {
                    if win.is_visible().unwrap_or(false) {
                        let _ = win.hide();
                    } else {
                        let _ = win.show();
                        let _ = win.set_focus();
                        let _ = win.unminimize();
                    }
                }
            }
        });

        if let Some(win) = app.get_webview_window("main") {
            let win_clone = win.clone();
            win.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = win_clone.hide();
                }
            });
        }

        Ok(())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    std::panic::set_hook(Box::new(|info| {
        let _ = std::fs::write("tauri-startup.log", format!("panic: {info}\n"));
    }));

    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init());

    if let Err(error) = builder
        .setup(|app| {
            #[cfg(desktop)]
            desktop_tray::setup(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
    {
        let _ = std::fs::write("tauri-startup.log", format!("{error:?}\n"));
        std::process::exit(1);
    }
}