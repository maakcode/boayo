import { useEffect, useEffectEvent, useState } from "react";
import { platform } from "@tauri-apps/plugin-os";

export default function HelpOverlay() {
  const [visible, setVisible] = useState(false);
  const currentPlatform = platform();
  const isApple = currentPlatform === "ios" || currentPlatform === "macos";

  const keydownEventHandler = useEffectEvent((event: KeyboardEvent) => {
    if (event.code === "F1") {
      setVisible(!visible);
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", keydownEventHandler);

    return () => {
      window.removeEventListener("keydown", keydownEventHandler);
    };
  }, []);

  return (
    <div
      inert
      className={`absolute left-0 right-0 bottom-0 flex justify-center bg-gray-900 pointer-events-none transition-opacity duration-300 ease-out ${
        visible ? "opacity-90" : "opacity-0"
      }`}
    >
      <ul className="text-right grid grid-flow-col grid-rows-2 gap-x-4 gap-y-1 p-4 text-gray-500">
        <li>
          Next page: <kbd>v</kbd>
        </li>
        <li>
          Previous page: <kbd>c</kbd>
        </li>
        <li>
          Next 1 page: <kbd>{isApple ? "⇧" : "shift + "}v</kbd>
        </li>
        <li>
          Previous 1 page: <kbd>{isApple ? "⇧" : "shift + "}c</kbd>
        </li>
        <li>
          Next 10 page: <kbd>b</kbd>
        </li>
        <li>
          Previous 10 page: <kbd>x</kbd>
        </li>
        <li>
          Single page mode: <kbd>1</kbd>
        </li>
        <li>
          Double page mode: <kbd>2</kbd>
        </li>
        <li>
          Toggle right to left: <kbd>`</kbd>
        </li>
      </ul>
    </div>
  );
}
