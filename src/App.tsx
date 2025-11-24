import { useEffect, useEffectEvent, useState } from "react";
import "./App.css";
import { info } from "@tauri-apps/plugin-log";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { EventCallback, UnlistenFn } from "@tauri-apps/api/event";
import debounce from "lodash/debounce";

export default function App() {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useEffectEvent(
    debounce<EventCallback<{ paths: string[] }>>((event) => {
      info(`drop: ${event.payload.paths.join(", ")}`);
      setDragging(false);
    }, 100)
  );
  const handleDragEnter = useEffectEvent(() => {
    setDragging(true);
  });
  const handleDragLeave = useEffectEvent(() => {
    setDragging(false);
  });

  useEffect(() => {
    let disposeBag: UnlistenFn[] = [];

    (async () => {
      const currentWindow = getCurrentWindow();

      const disposeDragEnterEvent = await currentWindow.listen(
        "tauri://drag-enter",
        handleDragEnter
      );

      const disposeDropEvent = await currentWindow.listen<{ paths: string[] }>(
        "tauri://drag-drop",
        handleDrop
      );

      const disposeDragLeaveEvent = await currentWindow.listen(
        "tauri://drag-leave",
        handleDragLeave
      );

      disposeBag.push(
        disposeDragEnterEvent,
        disposeDropEvent,
        disposeDragLeaveEvent
      );
    })();

    return () => {
      disposeBag.forEach((dispose) => dispose());
      disposeBag = [];
    };
  }, []);

  return (
    <main className={`flex h-full ${dragging ? "bg-gray-700" : "bg-gray-800"}`}>
      <p>Drop drectory here to open</p>
    </main>
  );
}
