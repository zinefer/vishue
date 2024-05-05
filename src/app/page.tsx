'use client';
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";

export type Effect = {
  name: string;
  code: string;
}

const defaultEffects = [
  {"name":"White","code":"function render(x, y) {\n  return 'rgb(255, 255, 255)';\n}"},
  {"name":"GoldenStarburst","code":"function render(x, y, state) {\n  // Calculate the center of the gradient based on state.beat\n  //const centerX = state.width / 2 + Math.cos(2 * Math.PI * state.beat) * state.width / 8;\n  //const centerY = state.height / 2 + Math.sin(2 * Math.PI * state.beat) * state.width / 8;\n\n  const centerX = state.centerX;\n  const centerY = state.centerY;\n\n  // Get the current time\n  const now = new Date();\n  \n  // Calculate the rotation angle based on the current time\n  const rotationAngle = ((now.getSeconds() + now.getMilliseconds() / 1000) * Math.PI / 30) * 3; // Convert seconds and milliseconds to radians\n\n  // Calculate the angle from the center to the current point and apply rotation\n  const angle = Math.atan2(y - centerY, x - centerX) + rotationAngle;\n\n  // Calculate the distance from the center to the current point\n  const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);\n\n  // Calculate the maximum distance from the center\n  const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);\n\n  // Normalize the distance to fit within the range of 0 to 1\n  const normalizedDistance = distance / maxDistance;\n\n  // Calculate the gradient value based on the distance and angle\n  const gradientValue = Math.abs(Math.cos(angle * 10) * normalizedDistance);\n\n  // Calculate the color based on the gradient value\n  const red = Math.round(gradientValue * 255);\n  const green = Math.round(gradientValue * 215); // Adjusted for a golden color\n  const blue = Math.round(gradientValue * 0);\n\n  // Return the color in rgb format\n  return `rgb(${red}, ${green}, ${blue})`;\n}"},
  {"name":"GoldenSpiral","code":"function render(x, y, state) {\n  // Define the center of the gradient\n  const centerX = state.width / 2;\n  const centerY = state.height / 2;\n\n  // Calculate the angle from the center to the current point\n  const angle = Math.atan2(y - centerY, x - centerX);\n\n  // Calculate the distance from the center to the current point\n  const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);\n\n  // Calculate the maximum distance from the center\n  const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);\n\n  // Normalize the distance to fit within the range of 0 to 1\n  const normalizedDistance = distance / maxDistance;\n\n  // Calculate the gradient value based on the distance and angle\n  const gradientValue = Math.abs(Math.sin(normalizedDistance * 10 + angle));\n\n  // Calculate the color based on the gradient value\n  const red = Math.round(gradientValue * 255);\n  const green = Math.round(gradientValue * 215); // Adjusted for a golden color\n  const blue = Math.round(gradientValue * 0);\n\n  // Return the color in rgb format\n  return `rgb(${red}, ${green}, ${blue})`;\n}"},
  {"name":"Black","code":"function render(x, y) {\n  return 'rgb(0, 0, 0)';\n}"}
];

const placeholder = `
// hsv(0, 100%, 100%)
// rgb(255, 255, 255)

function render(state, height, width, x, y) {
  rgb(255, 255, 255);
}
`;


export default function Home() {
  const projector = new BroadcastChannel("projector-visualizer");

  const [effects, setEffects] = useState<Effect[]>([]);
  const [currentEffect, setCurrentEffect] = useState<Effect | null>(null);

  useEffect(() => {
    const savedEffect = localStorage.getItem("currentEffect");
    if (savedEffect) {
      setCurrentEffect(JSON.parse(savedEffect));
    }
  }, []);

  useEffect(() => {
    const savedEffects = localStorage.getItem("effects");
    if (savedEffects) {
      setEffects(JSON.parse(savedEffects));
    } else { 
      localStorage.setItem("effects", JSON.stringify(defaultEffects));
      setEffects(defaultEffects);
    }
  }, []);

  useEffect(() => {
    const editor = document.querySelector(".effect-editor textarea") as HTMLInputElement | null;
    if (editor && currentEffect) {
      editor.value = currentEffect.code;
    }
  }, [currentEffect]);

  const saveEffect = () : Effect | null => {
    const editor = document.querySelector(".effect-editor textarea") as HTMLInputElement | null;
    if (editor && currentEffect) {
      const updatedEffects = effects.map(effect => {
        if (effect.name === currentEffect.name) {
          return { ...effect, code: editor.value };
        }
        return effect;
      });
      setEffects(updatedEffects);
      const newCurrentEffect = { ...currentEffect, code: editor.value };
      setCurrentEffect(newCurrentEffect);
      localStorage.setItem("effects", JSON.stringify(updatedEffects));
      localStorage.setItem("currentEffect", JSON.stringify(currentEffect));
      return newCurrentEffect;
    }
    return null;
  }

  const renameEffect = () => {
    const editor = document.querySelector(".effect-editor textarea") as HTMLInputElement | null;
    const newName = prompt("Rename Effect?", currentEffect?.name);
    if (!newName) return;
    if (editor && currentEffect) {
      const effect = effects.find(effect => effect.name === currentEffect?.name);
      if (!effect) return;
      const updatedEffects = effects.map(effect => {
        if (effect.name === currentEffect.name) {
          return { ...effect, name: newName };
        }
        return effect;
      });
      setEffects(updatedEffects);
      setCurrentEffect({ ...currentEffect, name: newName });
      localStorage.setItem("effects", JSON.stringify(updatedEffects));
      localStorage.setItem("currentEffect", JSON.stringify(currentEffect));
    }
  }

  const deleteEffect = () => {
    if (currentEffect) {
      const updatedEffects = effects.filter(effect => effect.name !== currentEffect.name);
      setEffects(updatedEffects);
      localStorage.setItem("effects", JSON.stringify(updatedEffects));
      setCurrentEffect(null);
      localStorage.removeItem("currentEffect");
    }
  }

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.ctrlKey && event.key === "s") {
      saveEffect();
      event.preventDefault();
      return false;
    }
  }

  const handleEffectClick = (effect: Effect) => {
    setCurrentEffect(effect);
    localStorage.setItem("currentEffect", JSON.stringify(effect));
  }

  const createNewEffect = () => {
    if (effects.find(effect => effect.name === "New Effect")) {
      alert("New Effect already exists, edit or delete it before creating a new one.");
      return;
    }
    const newEffect = { name: "New Effect", code: placeholder };
    setEffects([...effects, newEffect]);
    localStorage.setItem("effects", JSON.stringify([...effects, newEffect]));
  }

  const handleProjectButtonClick = () => {  
    if (!currentEffect) return;
    let localCurrentEffect = saveEffect();
    projector.postMessage(localCurrentEffect);
  }
  
  const sendMessage = (effect: string) => {
    projector.postMessage({ effect });
  }

  return (
    <main className={styles.main}>
      <div className="ui-container">
        <div className="effect-editor">
          <div className="project-button" onClick={handleProjectButtonClick}>Project It</div>
          <textarea onKeyDown={handleTextareaKeyDown}>{placeholder}</textarea>
          <div className="save-button" onClick={saveEffect}>Save</div>
          <div className="rename-button" onClick={renameEffect}>Rename</div>
          <div className="delete-button" onClick={deleteEffect}>Delete</div>
        </div>
        <div className="right-bar">
          <div className="bpm-settings">BPM</div>
          <div className="effect-list">
            <p className="center">EffectList</p>
            <ul>
              <li onClick={createNewEffect}>New</li>
              {effects.map(effect => (
                <li
                  className={currentEffect?.name === effect.name ? "active" : ""}
                  key={effect.name}
                  onClick={() => handleEffectClick(effect)}
                >
                  {effect.name}
                </li>
              ))}
            </ul>
            <div onMouseUp={() => sendMessage("example-effect")}>Send Message</div>
            <div onMouseUp={() => sendMessage("other-example-effect")}>Send Other Message</div>
          </div>
        </div>
      </div>
    </main>
  );
}
