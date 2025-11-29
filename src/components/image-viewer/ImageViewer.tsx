import { useEffect, useEffectEvent, useState } from "react";
import { info } from "@tauri-apps/plugin-log";
import { useViewerSettings } from "@/contexts/ViewerSettingsContext";

interface ImageViewerProps {
  images: string[];
  onReset?(): void;
}

export default function ImageViewer({ images, onReset }: ImageViewerProps) {
  const [page, setPage] = useState(0);
  const { pageMode, updatePageMode, rtlMode, updateRtlMode } =
    useViewerSettings();

  const keydownEventHandler = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === "v") {
      const nextPage = page + (pageMode === "single" ? 1 : 2);

      if (nextPage <= images.length - 1) {
        setPage(nextPage);
      }
    } else if (event.key === "ArrowLeft" || event.key === "c") {
      const previousPage = page - (pageMode === "single" ? 1 : 2);

      if (0 <= previousPage) {
        setPage(previousPage);
      }
    } else if (event.key === "2") {
      updatePageMode("double");
    } else if (event.key === "1") {
      updatePageMode("single");
    } else if (event.key === "`" || event.key === "₩") {
      updateRtlMode(!rtlMode);
    } else if (event.key === "Escape") {
      onReset?.();
    }

    info(`keydown ${event.key}`);
  });

  useEffect(() => {
    window.addEventListener("keydown", keydownEventHandler);

    return () => {
      window.removeEventListener("keydown", keydownEventHandler);
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
          return index % 2 === 0 ? "justify-end" : "justify-start";
        })();

        return (
          <li
            key={image}
            className={`flex-1 ${visible ? "flex" : "hidden"} ${justifyStyle} ${
              rtlMode ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <img src={image} alt="" className="h-full object-contain" />
          </li>
        );
      })}
    </ol>
  );
}
