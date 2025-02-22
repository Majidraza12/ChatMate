import { create } from "zustand";

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("chat-theme") || "dark", // If no theme in local storage, default to "dark"
    setTheme: (theme) => {
        // First set the theme in Local Storage and then update the theme
        localStorage.setItem("chat-theme", theme); // Correct method for local storage
        set({ theme }); // Update the state in zustand
    },
}));
