import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";

export async function closeDirView() {
  invoke("create_main_view");

  await getCurrentWindow().close();
}
