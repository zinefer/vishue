"use client";

import { useEffect, useRef, useState } from "react";
import { Effect } from "../page";

import { animationInterval } from "@helpers/animationInterval";
import { Beat } from "@helpers/beat";

const scopedEval = (scope: any, code:string) => Function(`"use strict"; ${code}`).bind(scope)();

export default function Page() {
    const [currentEffect, setCurrentEffect] = useState<Effect>();

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const bc = new BroadcastChannel("projector-visualizer");

    const canvasStyle = {
      height: "100vh",
      width: "100vw",
    }

    useEffect(() => {
      console.log('setup effect', currentEffect);

      if (!currentEffect) {
        return;
      }

      const beat = new Beat({ perMinute: 120, startOffset: 0 });

      const render = eval(currentEffect.code + '; render;');

      const initialState = {
        height: canvasRef?.current?.height,
        width: canvasRef?.current?.width,
        centerX: (canvasRef?.current?.width || 0) / 2,
        centerY: (canvasRef?.current?.height || 0) / 2,
      }

      const controller = new AbortController();

      animationInterval(20, controller.signal, (time) => {
        const frameState = {
          ...initialState,
          beat: beat.get(time),
          time,
        };
        
        // Render current effect's code
        if (canvasRef.current && currentEffect) {
          const ctx = canvasRef.current.getContext("2d");
          if (!ctx) {
            return;
          }

          // Loop over every pixel of the canvas
          for (let x = 0; x < canvasRef.current.width; x++) {
            for (let y = 0; y < canvasRef.current.height; y++) {
              const pixelState = {
                ...frameState,
              }

              // Set the pixel's color based on the render function that was passed in
              ctx.fillStyle = render(x, y, pixelState);
              ctx.fillRect(x, y, 1, 1);
            }
          }
        }
      });
      
      return () => controller.abort();
    }, [currentEffect?.code]);

    bc.onmessage = (event) => {
      console.log('incoming', event.data);
      setCurrentEffect(event.data);
    };

    return <canvas ref={canvasRef} style={canvasStyle} />;
}