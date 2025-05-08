import { useState } from "react";
import scene from "../../webgl/Scene";
import s from "./Picker.module.scss";

const VISUALIZERS = [
  {
    name: "Board",
    index: 0,
  },
  {
    name: "Line",
    index: 1,
  },
  {
    name: "Logo Iut",
    index: 2,
  },
  {
    name: "Cover",
    index: 3,
  },
  {
    name: "Triangle",
    index: 4,
  },
  {
    name: "Sphere",
    index: 5,
  },

];

const Picker = () => {
  const [current, setCurrent] = useState(0);

  const pickVisualizer = (index) => {
    // changer visuellement la liste
    setCurrent(index);

    // appeler la méthode qui permet de changer d'objet 3D
    scene.pickVisualizer(index);
  };

  return (
    <div className={s.picker}>
      {VISUALIZERS.map((visualizer) => (
        <span
          key={visualizer.name}
          className={`${current === visualizer.index ? s.current : ""}`}
          onClick={() => pickVisualizer(visualizer.index)}
        >
          {visualizer.name}
        </span>
      ))}
    </div>
  );
};

export default Picker;
