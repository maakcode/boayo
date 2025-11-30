import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { load as storeLoad, type Store } from "@tauri-apps/plugin-store";

type PageMode = "single" | "double";

interface ViewerSettingsContextType {
  pageMode: PageMode;
  updatePageMode(mode: PageMode): void;
  rtlMode: boolean;
  updateRtlMode(mode: boolean): void;
  scaleMode: boolean;
  updateScaleMode(mode: boolean): void;
}

const STORE_CONFIG = {
  PATH: "settings.json",
  KEYS: {
    PAGE_MODE: "page-mode",
    RTL_MODE: "rtl-mode",
    SCALE_MODE: "scale-mode",
  },
} as const;

const ViewerSettingsContext = createContext<ViewerSettingsContextType | null>(
  null
);

export function ViewerSettingsProvider({ children }: PropsWithChildren) {
  const [pageMode, setPageMode] = useState<PageMode>("single");
  const [rtlMode, setRtlMode] = useState(false);
  const [scaleMode, setScaleMode] = useState(true);
  const storeRef = useRef<Store | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!mounted) return;

      storeRef.current = await storeLoad(STORE_CONFIG.PATH);
      const storedPageMode = await storeRef.current.get<PageMode>(
        STORE_CONFIG.KEYS.PAGE_MODE
      );
      const storedRtlMode = await storeRef.current.get<boolean>(
        STORE_CONFIG.KEYS.RTL_MODE
      );
      const storedScaleMode = await storeRef.current.get<boolean>(
        STORE_CONFIG.KEYS.SCALE_MODE
      );

      if (storedPageMode !== undefined) {
        setPageMode(storedPageMode);
      }
      if (storedRtlMode !== undefined) {
        setRtlMode(storedRtlMode);
      }
      if (storedScaleMode !== undefined) {
        setScaleMode(storedScaleMode);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const updatePageMode = (mode: PageMode) => {
    setPageMode(mode);
    storeRef.current?.set(STORE_CONFIG.KEYS.PAGE_MODE, mode).then(() => {
      storeRef.current?.save();
    });
  };

  const updateRtlMode = (mode: boolean) => {
    setRtlMode(mode);
    storeRef.current?.set(STORE_CONFIG.KEYS.RTL_MODE, mode).then(() => {
      storeRef.current?.save();
    });
  };

  const updateScaleMode = (mode: boolean) => {
    setScaleMode(mode);
    storeRef.current?.set(STORE_CONFIG.KEYS.SCALE_MODE, mode).then(() => {
      storeRef.current?.save();
    });
  };

  return (
    <ViewerSettingsContext.Provider
      value={{
        pageMode,
        updatePageMode,
        rtlMode,
        updateRtlMode,
        scaleMode,
        updateScaleMode,
      }}
    >
      {children}
    </ViewerSettingsContext.Provider>
  );
}

export function useViewerSettings() {
  const context = useContext(ViewerSettingsContext);
  if (!context) {
    throw new Error(
      "useViewerSettings must be used within a ViewerSettingsProvider"
    );
  }
  return context;
}
