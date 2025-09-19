import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service worker disabled to prevent routing issues
// TODO: Implement proper service worker with correct routing handling

createRoot(document.getElementById("root")!).render(<App />);
