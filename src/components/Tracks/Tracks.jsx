import { useEffect, useState } from "react";
import Track from "../Track/Track";
import useStore from "../../utils/store";
import { fetchMetadata } from "../../utils/utils";
import TRACKS from "../../utils/TRACKS";
import audioController from "../../utils/AudioController";
import fetchJsonp from "fetch-jsonp";
import s from "./Tracks.module.scss";

const Tracks = () => {
  const [showTracks, setShowTracks] = useState(false);
  const { tracks, setTracks } = useStore();
  const currentTrackBPM = useStore((state) => state.currentTrackBPM);

  const [sortOption, setSortOption] = useState("none");
  const [filterText, setFilterText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isShuffle, setIsShuffle] = useState(false);

  
const toggleShuffleMode = () => {
  const newShuffleState = !isShuffle;
  setIsShuffle(newShuffleState);
  audioController.setShuffleMode(newShuffleState);
};

  const [volume, setVolume] = useState(.5); 

const handleVolumeChange = (val) => {
  const newVolume = parseFloat(val);
  setVolume(newVolume);
  audioController.setVolume(newVolume); 
};

const playRandomTrack = () => {
  const allTracks = getFilteredAndSortedTracks();
  if (allTracks.length === 0) return;

  const randomIndex = Math.floor(Math.random() * allTracks.length);
  const randomTrack = allTracks[randomIndex];


  audioController.play(randomTrack.preview, randomIndex, allTracks);
};

  useEffect(() => {
    if (tracks.length > TRACKS.length) {
      setShowTracks(true);
    }
  }, [tracks]);

  useEffect(() => {
    fetchMetadata(TRACKS, tracks, setTracks);
  }, []);

  useEffect(() => {
    if (filterText.trim() === "") {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(() => {
      getSongs(filterText);
    }, 500);

    return () => clearTimeout(delay);
  }, [filterText]);

  const onInputChange = (e) => {
    setFilterText(e.target.value);
  };

  const getSongs = async (query) => {
    let response = await fetchJsonp(
      `https://api.deezer.com/search?q=${query}&output=jsonp`
    );

    if (response.ok) {
      response = await response.json();
      setSearchResults(response.data);
    } else {
      setSearchResults([]);
    }
  };

  const getFilteredAndSortedTracks = () => {
    let base = searchResults.length > 0 ? searchResults : tracks;
    let filtered = base.filter((track) => {
      const text = filterText.toLowerCase();
      const title = track.title.toLowerCase();
      const artist = track.artist?.name?.toLowerCase() || "";
      return title.includes(text) || artist.includes(text);
    });

    switch (sortOption) {
      case "title":
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case "duration":
        return filtered.sort((a, b) => a.duration - b.duration);
      default:
        return filtered;
    }
  };

  return (
    <>
      <div
        className={s.toggleTracks}
        onClick={() => setShowTracks(!showTracks)}
      >
        tracklist
      </div>

      <section className={`${s.wrapper} ${showTracks ? s.wrapper_visible : ""}`}>
        <div className={s.tracks}>
          <div className={s.header}>
            <span className={s.order}>#</span>
            <span className={s.title}>Titre</span>
            <span className={s.duration}>Durée</span>
            <span className={s.bpm}>BPM</span>
          </div>
<select
  value={sortOption}
  onChange={(e) => setSortOption(e.target.value)}
  className={s.sortSelect}
>
  <option value="none">Tri par défaut</option>
  <option value="title">Trier par nom</option>
  <option value="duration">Trier par durée</option>
</select>
<div className={s.controls}>
<button
  onClick={toggleShuffleMode}
  className={`${s.randomButton} ${isShuffle ? s.active : ""}`}
>
  🎲
</button>

  <button onClick={() => audioController.playPrevious()} className={s.prevButton}>
    ⏮
  </button>

  <input
    type="text"
    placeholder="Rechercher un titre"
    value={filterText}
    onChange={onInputChange}
    className={s.searchInput}
  />

  <button onClick={() => audioController.playNext()} className={s.nextButton}>
    ⏭
  </button>
  <input
  type="range"
  min="0"
  max="1"
  step="0.01"
  value={volume}
  onChange={(e) => handleVolumeChange(e.target.value)}
  className={s.volumeSlider}
/>
</div>


          {getFilteredAndSortedTracks().map((track, i, array) => (
            <Track
              key={track.title + i}
              title={track.title}
              duration={track.duration}
              cover={track.album.cover_xl}
              artists={track.artist ? [track.artist] : []}
              src={track.preview}
              index={i}
              playlist={array}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default Tracks;
