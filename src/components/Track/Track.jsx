import React, { useState, useEffect } from "react";
import audioController from "../../utils/AudioController";
import scene from "../../webgl/Scene";
import s from "./Track.module.scss";
import useStore from "../../utils/store";

const Track = ({ title, cover, src, duration, artists, index, playlist, bpm }) => {
  const [isSelected, setIsSelected] = useState(false);
  const currentTrackIndex = useStore((state) => state.currentTrackIndex);

  useEffect(() => {
    setIsSelected(index === currentTrackIndex);
  }, [currentTrackIndex, index]);

  const getSeconds = () => {
    const minutes = Math.floor(duration / 60);
    let seconds = Math.round(duration - minutes * 60);

    if (seconds < 10) {
      seconds = "0" + seconds;
    }

    return minutes + ":" + seconds;
  };

  const onClick = () => {
    audioController.play(src, index, playlist);
    scene.cover.setCover(cover);
    setIsSelected(true);
  };

  return (
    <div
      className={`${s.track} ${isSelected ? s.selected : ""}`}
      onClick={onClick}
    >
      <span className={s.order}>{index + 1}</span>
      <div className={s.title}>
        <img src={cover} alt="" className={s.cover} />
        <div className={s.details}>
          <span className={s.trackName}>{title}</span>
          <span className={s.artistName}>
            {artists.map((artist, i) => (
              <span key={i}>
                {artist.name}
                {i < artists.length - 1 ? ", " : ""}
              </span>
            ))}
          </span>
          
        </div>
      </div>
      <span className={s.duration}>{getSeconds()}</span>
      {bpm && <span className={s.bpm}>BPM: {bpm}</span>}
    </div>
  );
};

export default Track;
