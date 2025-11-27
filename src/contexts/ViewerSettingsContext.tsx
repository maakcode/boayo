import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

type PageMode = "single" | "double";

interface ViewerSettingsContextType {
  pageMode: PageMode;
  setPageMode: (mode: PageMode) => void;
  rtlMode: boolean;
  setRtlMode: (mode: boolean) => void;
}

const ViewerSettingsContext = createContext<ViewerSettingsContextType | null>(
  null
);

export function ViewerSettingsProvider({ children }: PropsWithChildren) {
  const [pageMode, setPageMode] = useState<PageMode>("single");
  const [rtlMode, setRtlMode] = useState(false);

  return (
    <ViewerSettingsContext.Provider
      value={{ pageMode, setPageMode, rtlMode, setRtlMode }}
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
