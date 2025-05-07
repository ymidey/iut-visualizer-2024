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

  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatOne, setRepeatOne] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const favoriteIds = useStore((state) => state.favoriteIds);
  const [volume, setVolume] = useState(0.5);

  const [searchTextFavorites, setSearchTextFavorites] = useState("");
const [searchTextAll, setSearchTextAll] = useState("");  const [searchResults, setSearchResults] = useState([]);

const filterText = showFavorites ? searchTextFavorites : searchTextAll;
const setFilterText = showFavorites ? setSearchTextFavorites : setSearchTextAll;

  const toggleShuffleMode = () => {
    const newShuffleState = !isShuffle;
    setIsShuffle(newShuffleState);
    audioController.setShuffleMode(newShuffleState);
  };

  const fetchFavoriteTracks = async () => {
    const favorites = useStore.getState().favoriteIds;

    const results = await Promise.all(
      favorites.map(async (id) => {
        const trackId = typeof id === "object" ? id.id : id;
        if (!trackId) return null;

        try {
          const response = await fetchJsonp(
            `https://api.deezer.com/track/${trackId}?output=jsonp`
          );
          const data = await response.json();
          if (!data || typeof data.id !== "number") return null;
          return data;
        } catch (err) {
          console.error(`Erreur pour l'ID ${trackId}:`, err);
          return null;
        }
      })
    );

    const validResults = results.filter(
      (track) => track && typeof track.id === "number"
    );

    setTracks(validResults);
  };

  useEffect(() => {
    if (showFavorites) {
      fetchFavoriteTracks();
    } else {
      fetchMetadata(TRACKS, [], setTracks);
    }
  }, [showFavorites]);

  // // Réinitialiser le champ de recherche quand on change les favoris
  // useEffect(() => {
  //   setFilterText("");
  // }, [showFavorites]);

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
    let base;

    if (showFavorites) {
      const favoriteIds = JSON.parse(localStorage.getItem("favorites") || "[]");
      base = tracks.filter((track) => track && favoriteIds.includes(track.id));
    } else {
      base = searchResults.length > 0 ? searchResults : tracks;
    }

    let filtered = base;

    if (filterText.trim() !== "") {
      const text = filterText.toLowerCase();
      filtered = base.filter((track) => {
        const title = track?.title?.toLowerCase() || "";
        const artist = track?.artist?.name?.toLowerCase() || "";
        return title.includes(text) || artist.includes(text);
      });
    }

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
      <div className={s.toggleTracks} onClick={() => setShowTracks(!showTracks)}>
        tracklist
      </div>

      <section className={`${s.wrapper} ${showTracks ? s.wrapper_visible : ""}`}>
        <div className={s.tracks}>
          <div className={s.header}>
            <span className={s.order}>#</span>
            <span className={s.title}>Titre</span>
            <span className={s.duration}>Durée</span>
            <span className={s.favorite}>Favoris</span>
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

          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`${s.favoritesButton} ${showFavorites ? s.active : ""}`}
          >
            ❤️ Favoris
          </button>

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

            <button
              onClick={() => {
                const newRepeatState = !repeatOne;
                setRepeatOne(newRepeatState);
                audioController.setRepeatOne(newRepeatState);
              }}
              className={`${s.repeatButton} ${repeatOne ? s.active : ""}`}
            >
              🔂
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

          {getFilteredAndSortedTracks().map((track, i, array) =>
            track ? (
              <Track
                key={track.id ?? track.title + i}
                id={track.id}
                title={track.title}
                duration={track.duration}
                cover={track.album?.cover_xl}
                artists={track.artist ? [track.artist] : []}
                src={track.preview}
                index={i}
                playlist={array}
                bpm={track.bpm}
              />
            ) : null
          )}
        </div>
      </section>
    </>
  );
};

export default Tracks;
