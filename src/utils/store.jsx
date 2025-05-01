import { create } from "zustand";
import TRACKS from "./TRACKS";

const useStore = create((set) => ({
  tracks: [],
  setTracks: (_tracks) =>
    set(() => ({
      tracks: _tracks,
    })),

  currentTrackIndex: null,
  setCurrentTrackIndex: (index) =>
    set(() => ({
      currentTrackIndex: index,
    })),
}));

export default useStore;
