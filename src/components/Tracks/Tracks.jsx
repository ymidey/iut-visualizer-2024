import Track from "../Track/Track";
import track01 from "/dance-the-night.mp3";
import track02 from "/Benny Benassi - Satisfaction.mp3";

import s from "./Tracks.module.scss";
import { useEffect } from "react";
import useStore from "../../utils/store";

const rawTracks = [track01, track02];

const Tracks = () => {
  const { tracks, setTracks } = useStore();
  // TODO : Slider (infini ou non) pour sélectionner les tracks

  // TODO : Fonction de tri / filtre sur les tracks, par nom, durée...

  // TODO : Récupérer les tracks du store

  useEffect(() => {
    console.log(track02);

    rawTracks.map((rawTrack) => {
      const audio = new Audio(rawTrack);
      audio.addEventListener("loadedmetadata", () => {
        console.log(audio.duration);
      });
    });
  }, []);

  // const tracks = [
  //   {
  //     title:
  //       "New Drop SDlSd SD klQSKD QSdlk LKSDSLD SDK lSKD Sdlksdlksdk LDlskdlskl",
  //     duration: "147",
  //     artists: ["Don Toliver"],
  //     cover: "https://placehold.co/600x400",
  //   },
  //   {
  //     title: "New Drop",
  //     duration: "147",
  //     artists: ["Don Toliver"],
  //     cover: "https://placehold.co/600x400",
  //   },
  //   {
  //     title: "New Drop",
  //     duration: "147",
  //     artists: ["Don Toliver"],
  //     cover: "https://placehold.co/600x400",
  //   },
  //   {
  //     title: "New Drop",
  //     duration: "147",
  //     artists: ["Don Toliver"],
  //     cover: "https://placehold.co/600x400",
  //   },
  // ];

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
            index={i}
          />
        ))}
      </div>
    </section>
  );
};

export default Tracks;
