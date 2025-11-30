import { useEffect, useEffectEvent, useState } from "react";
import "./App.css";
import { info } from "@tauri-apps/plugin-log";
import { readDir } from "@tauri-apps/plugin-fs";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { EventCallback, UnlistenFn } from "@tauri-apps/api/event";
import debounce from "lodash/debounce";
import ImageViewer from "./components/image-viewer/ImageViewer";
import { convertFileSrc } from "@tauri-apps/api/core";
import EmptyLogo from "./components/empty-logo/EmptyLogo";
import { getName } from "@tauri-apps/api/app";
import HelpOverlay from "./components/help-overlay/HelpOverlay";

interface ImageDirectory {
  path: string;
  images: string[];
}

export default function App() {
  const [dragging, setDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageDirectory, setImageDirectory] = useState<ImageDirectory | null>(
    null
  );

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
          .sort((lhs, rhs) => getFileNumber(lhs.name) - getFileNumber(rhs.name))
          .map((entry) => {
            const fullPath = [path, entry.name].join("/");
            return convertFileSrc(fullPath);
          });

        setCurrentPage(0);
        setImageDirectory({
          path,
          images: files,
        });
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

  useEffect(() => {
    (async () => {
      const currentWindow = await getCurrentWindow();
      const title = await (async () => {
        if (imageDirectory && imageDirectory.images.length > 0) {
          const directoryName =
            imageDirectory.path.split("/").slice(-1)[0] || "";

          return `${directoryName} - ${currentPage + 1} / ${
            imageDirectory.images.length
          }`;
        }
        return await getName();
      })();
      await currentWindow.setTitle(title);
    })();
  }, [imageDirectory, currentPage]);

  const handleReset = () => {
    setImageDirectory(null);
  };

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <main
      data-tauri-drag-region
      className={`flex h-full ${dragging ? "bg-gray-700" : "bg-gray-900"}`}
    >
      {!imageDirectory?.images.length ? (
        <EmptyLogo className="flex-1" />
      ) : (
        <ImageViewer
          key={imageDirectory.path}
          images={imageDirectory.images}
          page={currentPage}
          onChangePage={handleChangePage}
          onReset={handleReset}
        />
      )}
      <HelpOverlay />
    </main>
  );
}

function getFileNumber(name: string): number {
  return Number(name.replace(/\.[^.]+$/, "").replace(/\D/g, "")) || 0;
}
