"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    float t = u_time * 0.3;

    vec3 c1 = vec3(0.06, 0.87, 0.64) * 0.3; // Emerald
    vec3 c2 = vec3(0.01, 0.71, 0.83) * 0.3; // Cyan
    vec3 c3 = vec3(0.52, 0.17, 0.82) * 0.3; // Violet

    float n1 = sin(uv.x * 2.0 + t) * cos(uv.y * 2.0 - t);
    float n2 = sin(uv.y * 1.5 - t * 0.7) * cos(uv.x * 1.5 + t * 0.5);

    vec3 color = vec3(0.04);
    color += c1 * smoothstep(0.3, 0.7, n1);
    color += c2 * smoothstep(0.3, 0.7, n2);
    color += c3 * smoothstep(0.2, 0.8, n1 * n2);

    color *= (1.0 - length(uv - 0.5) * 0.6);

    gl_FragColor = vec4(color, 1.0);
}`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

interface AuroraBackgroundProps {
  className?: string;
}

/** Aurora-style animated WebGL background — two interfering sine/cosine noise fields blended
 *  across emerald/cyan/violet on a near-black base, with a vignette. Fills its parent; place
 *  inside a `relative overflow-hidden` container, absolutely positioned behind real content. */
export function AuroraBackground({ className }: AuroraBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = canvas!.clientWidth || 1;
      const h = canvas!.clientHeight || 1;
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }
    }

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(syncSize) : null;
    resizeObserver?.observe(canvas);
    syncSize();

    const contextOptions: WebGLContextAttributes = { preserveDrawingBuffer: true };
    const gl =
      canvas.getContext("webgl", contextOptions) ||
      (canvas.getContext("experimental-webgl", contextOptions) as WebGLRenderingContext | null);
    if (!gl) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");

    let animationId: number;
    function render(t: number) {
      if (!resizeObserver) syncSize();
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      if (uTime) gl!.uniform1f(uTime, t * 0.001);
      if (uRes) gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    }
    animationId = requestAnimationFrame(render);

    return () => {
      // Deliberately NOT calling the WEBGL_lose_context extension here: React 18 Strict Mode's
      // dev-only double-invoke (mount -> cleanup -> mount again) would lose the context on the
      // very first cleanup and then permanently fail to get a new one on the same <canvas> element
      // (a canvas can only ever hold one context of a given type) — confirmed via gl.getError()
      // returning CONTEXT_LOST_WEBGL and a fully transparent readback. Cancelling the rAF loop and
      // disconnecting the observer is enough; the browser reclaims the GPU context on its own once
      // the canvas element is actually removed from the DOM for good.
      cancelAnimationFrame(animationId);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <canvas ref={canvasRef} className={className} style={{ display: "block", width: "100%", height: "100%" }} />
  );
}
