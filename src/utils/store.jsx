import { create } from "zustand";

const useStore = create((set, get) => ({
  tracks: [],
  setTracks: (tracks) => set({ tracks }),

  currentTrackIndex: null,
  setCurrentTrackIndex: (index) => set({ currentTrackIndex: index }),
  currentTrackId: null,
setCurrentTrackId: (id) => set({ currentTrackId: id }),

favoriteIds: JSON.parse(localStorage.getItem("favorites") || "[]"),
toggleFavorite: (id) =>
  set((state) => {
    const cleanId = typeof id === "object" ? id.id : id;
    const updatedFavorites = state.favoriteIds.includes(cleanId)
      ? state.favoriteIds.filter((favId) => favId !== cleanId)
      : [...state.favoriteIds, cleanId];

    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    return { favoriteIds: updatedFavorites };
  }),
}));

export default useStore;