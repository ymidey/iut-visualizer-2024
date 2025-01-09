import Track from "../Track/Track";
import track01 from "/dance-the-night.mp3";
import track02 from "/Benny Benassi - Satisfaction.mp3";

import s from "./Tracks.module.scss";
import { useEffect, useState } from "react";
import useStore from "../../utils/store";
import jsmediatags from "jsmediatags/dist/jsmediatags.min.js";

const TRACKS = [
  { id: 1, name: "Dance the Night", path: track01 },
  { id: 2, name: "Satisfaction", path: track02 },
];

const Tracks = () => {
  const { tracks, setTracks } = useStore();

  // TODO : Slider (infini ou non) pour sélectionner les tracks

  // TODO : Fonction de tri / filtre sur les tracks, par nom, durée...

  // TODO : Récupérer les tracks du store

  useEffect(() => {
    const fetchMetadata = async () => {
      const promises = TRACKS.map(
        (track) =>
          new Promise((resolve, reject) => {
            // get duration
            const audio = new Audio(track.path);
            audio.addEventListener("loadedmetadata", () => {
              console.log(audio.duration);
            });

            // Fetch the MP3 file as a Blob
            fetch(track.path)
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`Failed to fetch ${track.path}`);
                }
                return response.blob();
              })
              .then((blob) => {
                // Read metadata from the Blob
                jsmediatags.read(blob, {
                  onSuccess: (tag) => {
                    console.log(tag);
                    const { title, artist, album, picture } = tag.tags;
                    // Extract cover image if it exists
                    let cover = "https://placehold.co/600x400";
                    if (picture) {
                      const base64String = btoa(
                        picture.data
                          .map((char) => String.fromCharCode(char))
                          .join("")
                      );
                      cover = `data:${picture.format};base64,${base64String}`;
                    }
                    let _artists = [];
                    if (artist) {
                      _artists = artist.split(",");
                    }

                    resolve({
                      index: track.id,
                      name: track.name,
                      title: title || track.name,
                      duration: audio.duration,
                      artists: _artists || [],
                      album: album || "Unknown Album",
                      path: track.path,
                      cover,
                    });
                  },
                  onError: (error) => {
                    console.error(
                      `Error reading metadata for ${track.name}:`,
                      error
                    );
                    resolve({
                      index: track.id,
                      name: track.name,
                      title: track.name,
                      duration: audio.duration,
                      artists: [],
                      album: "Unknown Album",
                      path: track.path,
                      cover,
                    });
                  },
                });
              })
              .catch((error) => {
                console.error(`Failed to fetch ${track.name}:`, error);
                reject(error);
              });
          })
      );
      try {
        const results = await Promise.all(promises);
        setTracks(results);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };

    fetchMetadata();
  }, []);

  return (
    <section className={s.wrapper}>
      <div className={s.tracks}>
        <div className={s.header}>
          <span className={s.order}>#</span>
          <span className={s.title}>Titre</span>
          <span className={s.duration}>Durée</span>
        </div>

        {tracks.map((track, i) => (
          <Track
            key={track.title + i}
            title={track.title}
            duration={track.duration}
            cover={track.cover}
            artists={track.artists}
            src={track.path}
            index={i}
          />
        ))}
      </div>
    </section>
  );
};

export default Tracks;
