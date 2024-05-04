'use client';

import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";

export type Effect = {
  name: string;
  code: string;
}

export default function Home() {
  const projector = new BroadcastChannel("projector-visualizer");

  // A list of effects that the projector can render
  const [effects, setEffects] = useState<Effect[]>([]);

  // The current effect being edited
  const [currentEffect, setCurrentEffect] = useState<Effect | null>(null);

  // Load the current effect when the component mounts from local storage
  useEffect(() => {
    const savedEffect = localStorage.getItem("currentEffect");
    if (savedEffect) {
      setCurrentEffect(JSON.parse(savedEffect));
    }
  }, []);

  // Load the list of effects when the component mounts from local storage
  useEffect(() => {
    const savedEffects = localStorage.getItem("effects");
    if (savedEffects) {
      setEffects(JSON.parse(savedEffects));
    } else { 
      const effects = [{"name":"White","code":"function render(x, y) {\n  return 'rgb(255, 255, 255)';\n}"},{"name":"GoldenStarburst","code":"function render(x, y, state) {\n  // Calculate the center of the gradient based on state.beat\n  //const centerX = state.width / 2 + Math.cos(2 * Math.PI * state.beat) * state.width / 8;\n  //const centerY = state.height / 2 + Math.sin(2 * Math.PI * state.beat) * state.width / 8;\n\n  const centerX = state.centerX;\n  const centerY = state.centerY;\n\n  // Get the current time\n  const now = new Date();\n  \n  // Calculate the rotation angle based on the current time\n  const rotationAngle = ((now.getSeconds() + now.getMilliseconds() / 1000) * Math.PI / 30) * 3; // Convert seconds and milliseconds to radians\n\n  // Calculate the angle from the center to the current point and apply rotation\n  const angle = Math.atan2(y - centerY, x - centerX) + rotationAngle;\n\n  // Calculate the distance from the center to the current point\n  const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);\n\n  // Calculate the maximum distance from the center\n  const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);\n\n  // Normalize the distance to fit within the range of 0 to 1\n  const normalizedDistance = distance / maxDistance;\n\n  // Calculate the gradient value based on the distance and angle\n  const gradientValue = Math.abs(Math.cos(angle * 10) * normalizedDistance);\n\n  // Calculate the color based on the gradient value\n  const red = Math.round(gradientValue * 255);\n  const green = Math.round(gradientValue * 215); // Adjusted for a golden color\n  const blue = Math.round(gradientValue * 0);\n\n  // Return the color in rgb format\n  return `rgb(${red}, ${green}, ${blue})`;\n}"},{"name":"GoldenSpiral","code":"function render(x, y, state) {\n  // Define the center of the gradient\n  const centerX = state.width / 2;\n  const centerY = state.height / 2;\n\n  // Calculate the angle from the center to the current point\n  const angle = Math.atan2(y - centerY, x - centerX);\n\n  // Calculate the distance from the center to the current point\n  const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);\n\n  // Calculate the maximum distance from the center\n  const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);\n\n  // Normalize the distance to fit within the range of 0 to 1\n  const normalizedDistance = distance / maxDistance;\n\n  // Calculate the gradient value based on the distance and angle\n  const gradientValue = Math.abs(Math.sin(normalizedDistance * 10 + angle));\n\n  // Calculate the color based on the gradient value\n  const red = Math.round(gradientValue * 255);\n  const green = Math.round(gradientValue * 215); // Adjusted for a golden color\n  const blue = Math.round(gradientValue * 0);\n\n  // Return the color in rgb format\n  return `rgb(${red}, ${green}, ${blue})`;\n}"},{"name":"Black","code":"function render(x, y) {\n  return 'rgb(0, 0, 0)';\n}"}];
      localStorage.setItem("effects", JSON.stringify(effects));
      setEffects(effects);
    }
  }, []);

  // Set up the editor for the currentEffect
  useEffect(() => {
    const editor : HTMLInputElement | null = document.querySelector(".effect-editor textarea");
    if (editor && currentEffect) {
      editor.value = currentEffect.code;
    }
  }, [currentEffect]);

  const sendMessage = () => {
    projector.postMessage({
      effect: "example-effect",
    });
  }

  const sendOtherMessage = () => {
    projector.postMessage({
      effect: "other-example-effect",
      callback: () => {
        console.log("Callback from other example effect");
      }
    });
  }

  const placeholder = `
// hsv(0, 100%, 100%)
// rgb(255, 255, 255)

function render(state, height, width, x, y) {
  rgb(255, 255, 255);
}`;

  // On KeyDown for textarea, Ctrl + S saves the effect
  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.ctrlKey && event.key === "s") {
      const editor : HTMLInputElement | null = document.querySelector(".effect-editor textarea");
      if (editor && currentEffect) {
        // Find the current effect in the list of effects
        const effectRef = effects.find(effect => effect.name === currentEffect.name);
        if (!effectRef) return;
        // Update the code of the current effect
        effectRef.code = editor.value;
        setEffects([...effects]);
        localStorage.setItem("effects", JSON.stringify(effects));
        localStorage.setItem("currentEffect", JSON.stringify(effectRef));
      }
      event.preventDefault();
      return false;
    }
  }

  return (
    <main className={styles.main}>
      <div className="ui-container">
        <div className="effect-editor">
          <div className="project-button" onClick={() => {
            if (!currentEffect) return;
            projector.postMessage(currentEffect);
          }}>Project It</div>
          <textarea onKeyDown={handleTextareaKeyDown}>{placeholder}</textarea>
          <div className="save-button" onClick={() => {
            const editor : HTMLInputElement | null = document.querySelector(".effect-editor textarea");
            if (editor && currentEffect) {
              // Find the current effect in the list of effects
              const effectRef = effects.find(effect => effect.name === currentEffect.name);
              if (!effectRef) return;
              // Update the code of the current effect
              effectRef.code = editor.value;
              setCurrentEffect({ ...currentEffect, code: editor.value });
              setEffects([...effects]);
              localStorage.setItem("effects", JSON.stringify(effects));
              localStorage.setItem("currentEffect", JSON.stringify(effectRef));
            }
          }}>Save</div>
          <div className="rename-button" onClick={() => {
            const editor : HTMLInputElement | null = document.querySelector(".effect-editor textarea");
            if (editor && currentEffect) {
              // Find the current effect in the list of effects
              const effectRef = effects.find(effect => effect.name === currentEffect.name);
              if (!effectRef) return;
              // Update the name of the current effect
              const newName = prompt("Rename Effect?", effectRef.name);
              if (!newName) return;
              effectRef.name = newName;
              setCurrentEffect({ ...currentEffect, name: newName });
              setEffects([...effects]);
              localStorage.setItem("effects", JSON.stringify(effects));
              localStorage.setItem("currentEffect", JSON.stringify(effectRef));
            }
          }}>Rename</div>
          <div className="delete-button" onClick={() => {
            if (!currentEffect) return;
            // Remove the current effect from the list of effects
            setEffects(effects.filter(effect => effect.name !== currentEffect.name));
            localStorage.setItem("effects", JSON.stringify(effects));
            // Clear the current effect
            setCurrentEffect(null);
            localStorage.removeItem("currentEffect");
          }}>Delete</div>
        </div>
        <div className="right-bar">
          <div className="bpm-settings">BPM</div>
          <div className="effect-list">
            <p className="center">EffectList</p>

            <ul>
              <li onClick={
                // Create new effect
                () => {
                  // If New Effect already exists, throw error
                  if (effects.find(effect => effect.name === "New Effect")) {
                    alert("New Effect already exists, edit or delete it before creating a new one.");
                    return;
                  }

                  const newEffect = { name: "New Effect", code: placeholder };
                  setEffects([...effects, newEffect]);
                  localStorage.setItem("effects", JSON.stringify([...effects, newEffect]));
              }}>New</li>

              {effects.map(effect => (
                <li className={currentEffect?.name === effect.name ? "active" : ""}
                key={effect.name} onClick={
                  // Load effect for editing
                  () => {
                    setCurrentEffect(effect);
                    localStorage.setItem("currentEffect", JSON.stringify(effect));
                  }}>{effect.name}</li>
              ))}
            </ul>
          
            <div onMouseUp={sendMessage}>Send Message</div>
            <div onMouseUp={sendOtherMessage}>Send Other Message</div>
          </div>
        </div>
      </div>
    </main>
  );
}
