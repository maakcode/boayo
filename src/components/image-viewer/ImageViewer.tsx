import { useEffect, useEffectEvent, useRef } from "react";
import { info } from "@tauri-apps/plugin-log";
import { useViewerSettings } from "@/contexts/ViewerSettingsContext";

interface ImageViewerProps {
  images: string[];
  page: number;
  onChangePage?(page: number): void;
  onReset?(): void;
}

export default function ImageViewer({
  images,
  page,
  onChangePage,
  onReset,
}: ImageViewerProps) {
  const {
    pageMode,
    updatePageMode,
    rtlMode,
    updateRtlMode,
    scaleMode,
    updateScaleMode,
  } = useViewerSettings();
  const lastUpdateAt = useRef(0);

  const keydownEventHandler = useEffectEvent((event: KeyboardEvent) => {
    if (event.code === "ArrowRight" || event.code === "KeyV") {
      const step = (() => {
        if (pageMode === "single" || event.shiftKey) return 1;

        return 2;
      })();

      const nextPage = page + step;

      if (nextPage <= images.length - 1) {
        onChangePage?.(nextPage);
      }
    } else if (event.code === "ArrowLeft" || event.code === "KeyC") {
      const step = (() => {
        if (pageMode === "single" || event.shiftKey) return 1;

        return 2;
      })();

      const previousPage = page - step;

      if (0 <= previousPage) {
        onChangePage?.(previousPage);
      }
    } else if (event.code === "KeyB") {
      let nextPage = page + 10;
      if (images.length - 1 < nextPage) {
        nextPage = images.length - (pageMode === "single" ? 1 : 2);
      }
      onChangePage?.(nextPage);
    } else if (event.code === "KeyX") {
      let previousPage = page - 10;
      if (previousPage < 0) {
        previousPage = 0;
      }
      onChangePage?.(previousPage);
    } else if (event.code === "KeyZ") {
      updateScaleMode(!scaleMode);
    } else if (event.code === "Digit2") {
      updatePageMode("double");
    } else if (event.code === "Digit1") {
      updatePageMode("single");
    } else if (event.code === "Backquote") {
      updateRtlMode(!rtlMode);
    } else if (event.code === "Escape") {
      onReset?.();
    }

    info(`keydown ${event.code}`);
  });

  const mouseWheelHandler = useEffectEvent((event: WheelEvent) => {
    if (Date.now() - lastUpdateAt.current < 100) return;

    lastUpdateAt.current = Date.now();

    if (event.deltaY < -4 || event.deltaX < -4) {
      const step = (() => {
        if (pageMode === "single" || event.shiftKey) return 1;
        return 2;
      })();
      const nextPage = page + step;
      if (nextPage <= images.length - 1) {
        onChangePage?.(nextPage);
      }
    } else if (event.deltaY > 4 || event.deltaX > 4) {
      const step = (() => {
        if (pageMode === "single" || event.shiftKey) return 1;
        return 2;
      })();
      const previousPage = page - step;
      if (0 <= previousPage) {
        onChangePage?.(previousPage);
      }
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", keydownEventHandler);
    window.addEventListener("wheel", mouseWheelHandler);

    return () => {
      window.removeEventListener("keydown", keydownEventHandler);
      window.removeEventListener("wheel", mouseWheelHandler);
    };
  }, []);

  return (
    <ol
      className={`flex flex-1 pointer-events-none ${
        rtlMode ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {images.map((image, index) => {
        const visible = (() => {
          if (pageMode === "single") {
            return index === page;
          }

          return index === page || index === page + 1;
        })();

        const justifyStyle = (() => {
          if (pageMode === "single") {
            return "justify-center";
          }

          if (index === images.length - 1 && page % 2 !== images.length % 2) {
            return "justify-center";
          }

          return index % 2 === page % 2 ? "justify-end" : "justify-start";
        })();

        return (
          <li
            key={image}
            className={`flex-1 ${visible ? "flex" : "hidden"} ${justifyStyle} ${
              rtlMode ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <img
              src={image}
              alt=""
              className={`object-contain ${scaleMode ? "h-full" : ""}`}
            />
          </li>
        );
      })}
    </ol>
  );
}
