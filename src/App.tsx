import { useEffect, useEffectEvent, useState } from "react";
import "./App.css";
import { info } from "@tauri-apps/plugin-log";
import { readDir } from "@tauri-apps/plugin-fs";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { EventCallback, UnlistenFn } from "@tauri-apps/api/event";
import debounce from "lodash/debounce";
import { convertFileSrc } from "@tauri-apps/api/core";

export default function App() {
  const [dragging, setDragging] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleDrop = useEffectEvent(
    debounce<EventCallback<{ paths: string[] }>>(async (event) => {
      const path = event.payload.paths[0];
      if (!path) return;

      try {
        const entries = await readDir(path);

        const files = entries
          .filter(
            (entry) =>
              entry.isFile &&
              !entry.isDirectory &&
              !entry.isSymlink &&
              entry.name.match(/\.(?:jpg|jpeg|png|gif|bmp|webp|avif)$/)
          )
          .map((entry) => {
            const fullPath = [path, entry.name].join("/");
            return convertFileSrc(fullPath);
          });

        setImages(files);
      } catch (error) {
        info(`drop error: ${error}`);
      }

      setDragging(false);
    }, 100)
  );
  const handleDragEnter = useEffectEvent<EventCallback<{ paths: string[] }>>(
    (event) => {
      if (event.payload.paths.length !== 1) return;

      setDragging(true);
    }
  );
  const handleDragLeave = useEffectEvent(() => {
    setDragging(false);
  });

  useEffect(() => {
    let disposeBag: UnlistenFn[] = [];

    (async () => {
      const currentWindow = getCurrentWindow();

      const disposeDragEnterEvent = await currentWindow.listen<{
        paths: string[];
      }>("tauri://drag-enter", handleDragEnter);

      const disposeDropEvent = await currentWindow.listen(
        "tauri://drag-drop",
        handleDrop
      );

      const disposeDragLeaveEvent = await currentWindow.listen<{
        paths: string[];
      }>("tauri://drag-leave", handleDragLeave);

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
      {images.length === 0 ? (
        <p>Drop drectory here to open</p>
      ) : (
        <ol>
          {images.map((image) => (
            <li key={image}>{image}</li>
          ))}
        </ol>
      )}
    </main>
  );
}
