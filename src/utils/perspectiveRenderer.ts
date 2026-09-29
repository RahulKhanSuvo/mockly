import { ScreenMapping } from "@/types/mockup";

/**
 * Calculates $3\times3$ homography matrix mapping unit square [0,1]^2 to quad (p0, p1, p2, p3)
 * where p0=topLeft, p1=topRight, p2=bottomRight, p3=bottomLeft
 */
export function getSquareToQuadHomography(screen: ScreenMapping): number[] {
  const x0 = screen.topLeft.x;
  const y0 = screen.topLeft.y;
  const x1 = screen.topRight.x;
  const y1 = screen.topRight.y;
  const x2 = screen.bottomRight.x;
  const y2 = screen.bottomRight.y;
  const x3 = screen.bottomLeft.x;
  const y3 = screen.bottomLeft.y;

  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const sx = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const sy = y0 - y1 + y2 - y3;

  if (Math.abs(sx) < 1e-5 && Math.abs(sy) < 1e-5) {
    return [
      x1 - x0, x3 - x0, x0,
      y1 - y0, y3 - y0, y0,
      0,       0,       1,
    ];
  }

  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < 1e-7) {
    return [
      x1 - x0, x3 - x0, x0,
      y1 - y0, y3 - y0, y0,
      0,       0,       1,
    ];
  }

  const g = (sx * dy2 - sy * dx2) / denom;
  const h = (dx1 * sy - dy1 * sx) / denom;

  return [
    x1 - x0 + g * x1, x3 - x0 + h * x3, x0,
    y1 - y0 + g * y1, y3 - y0 + h * y3, y0,
    g,                h,                1,
  ];
}

/**
 * Inverts a 3x3 matrix represented as a 9-element array
 */
export function invert3x3(m: number[]): number[] {
  const a00 = m[0], a01 = m[1], a02 = m[2];
  const a10 = m[3], a11 = m[4], a12 = m[5];
  const a20 = m[6], a21 = m[7], a22 = m[8];

  const b00 = a11 * a22 - a12 * a21;
  const b01 = a02 * a21 - a01 * a22;
  const b02 = a01 * a12 - a02 * a11;
  const b10 = a12 * a20 - a10 * a22;
  const b11 = a00 * a22 - a02 * a20;
  const b12 = a02 * a10 - a00 * a12;
  const b20 = a10 * a21 - a11 * a20;
  const b21 = a01 * a10 - a00 * a21;
  const b22 = a00 * a11 - a01 * a10;

  const det = a00 * b00 + a01 * b10 + a02 * b20;
  if (Math.abs(det) < 1e-10) {
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  const invDet = 1.0 / det;
  return [
    b00 * invDet, b01 * invDet, b02 * invDet,
    b10 * invDet, b11 * invDet, b12 * invDet,
    b20 * invDet, b21 * invDet, b22 * invDet,
  ];
}

const VERTEX_SHADER_SRC = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision highp float;
  uniform sampler2D u_texture;
  uniform mat3 u_h_inv;
  uniform vec2 u_canvas_size;

  void main() {
    // FragCoord y starts from bottom in WebGL, convert to top-left origin
    vec2 canvas_pt = vec2(gl_FragCoord.x, u_canvas_size.y - gl_FragCoord.y);
    vec3 uvw = u_h_inv * vec3(canvas_pt, 1.0);

    if (abs(uvw.z) < 1e-7) {
      discard;
    }

    vec2 uv = uvw.xy / uvw.z;

    if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
      gl_FragColor = texture2D(u_texture, uv);
    } else {
      discard;
    }
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Renders an image mapped onto a 4-point quadrilateral on an offscreen HTMLCanvasElement.
 */
export function renderPerspectiveScreenshot(
  img: HTMLImageElement | HTMLCanvasElement,
  screen: ScreenMapping,
  targetWidth: number,
  targetHeight: number,
  existingCanvas?: HTMLCanvasElement
): HTMLCanvasElement {
  const canvas = existingCanvas || document.createElement("canvas");
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true, preserveDrawingBuffer: true });

  if (!gl) {
    // Fallback: 2D Canvas Subdivision
    return renderPerspective2DFallback(img, screen, targetWidth, targetHeight, canvas);
  }

  gl.viewport(0, 0, targetWidth, targetHeight);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
  if (!vs || !fs) return canvas;

  const program = gl.createProgram();
  if (!program) return canvas;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    return canvas;
  }

  gl.useProgram(program);

  // Full-screen quad covering [-1, 1] clip space
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]),
    gl.STATIC_DRAW
  );

  const posLoc = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  // Homography computation
  const H = getSquareToQuadHomography(screen);
  const H_inv = invert3x3(H);

  // Column-major order for WebGL glUniformMatrix3fv
  const hInvColMajor = [
    H_inv[0], H_inv[3], H_inv[6],
    H_inv[1], H_inv[4], H_inv[7],
    H_inv[2], H_inv[5], H_inv[8],
  ];

  const hLoc = gl.getUniformLocation(program, "u_h_inv");
  const sizeLoc = gl.getUniformLocation(program, "u_canvas_size");
  gl.uniformMatrix3fv(hLoc, false, hInvColMajor);
  gl.uniform2f(sizeLoc, targetWidth, targetHeight);

  // Texture creation
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  return canvas;
}

/**
 * Fallback 2D canvas mesh subdivision renderer
 */
function renderPerspective2DFallback(
  img: HTMLImageElement | HTMLCanvasElement,
  screen: ScreenMapping,
  targetWidth: number,
  targetHeight: number,
  canvas: HTMLCanvasElement
): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, targetWidth, targetHeight);

  const H = getSquareToQuadHomography(screen);
  const mapPoint = (u: number, v: number) => {
    const w = H[6] * u + H[7] * v + H[8];
    return {
      x: (H[0] * u + H[1] * v + H[2]) / w,
      y: (H[3] * u + H[4] * v + H[5]) / w,
    };
  };

  const rows = 12;
  const cols = 12;
  const imgW = img.width;
  const imgH = img.height;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u0 = c / cols,       v0 = r / rows;
      const u1 = (c + 1) / cols, v1 = (r + 1) / rows;

      const p00 = mapPoint(u0, v0);
      const p10 = mapPoint(u1, v0);
      const p01 = mapPoint(u0, v1);
      const p11 = mapPoint(u1, v1);

      // Draw Triangle 1 (p00, p10, p01)
      drawTriangle2D(
        ctx, img,
        u0 * imgW, v0 * imgH, u1 * imgW, v0 * imgH, u0 * imgW, v1 * imgH,
        p00.x, p00.y, p10.x, p10.y, p01.x, p01.y
      );

      // Draw Triangle 2 (p10, p11, p01)
      drawTriangle2D(
        ctx, img,
        u1 * imgW, v0 * imgH, u1 * imgW, v1 * imgH, u0 * imgW, v1 * imgH,
        p10.x, p10.y, p11.x, p11.y, p01.x, p01.y
      );
    }
  }

  return canvas;
}

function drawTriangle2D(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  sx0: number, sy0: number, sx1: number, sy1: number, sx2: number, sy2: number,
  dx0: number, dy0: number, dx1: number, dy1: number, dx2: number, dy2: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dx0, dy0);
  ctx.lineTo(dx1, dy1);
  ctx.lineTo(dx2, dy2);
  ctx.closePath();
  ctx.clip();

  const denom = sx0 * (sy1 - sy2) - sx1 * sy0 + sx1 * sy2 + sx2 * (sy0 - sy1);
  if (Math.abs(denom) < 1e-5) {
    ctx.restore();
    return;
  }

  const m11 = -(sy0 * (dx1 - dx2) - sy1 * dx0 + sy1 * dx2 + sy2 * (dx0 - dx1)) / denom;
  const m12 = (sy0 * (dy1 - dy2) - sy1 * dy0 + sy1 * dy2 + sy2 * (dy0 - dy1)) / denom;
  const m21 = (sx0 * (dx1 - dx2) - sx1 * dx0 + sx1 * dx2 + sx2 * (dx0 - dx1)) / denom;
  const m22 = -(sx0 * (dy1 - dy2) - sx1 * dy0 + sx1 * dy2 + sx2 * (dy0 - dy1)) / denom;
  const dx = (sx0 * (sy1 * dx2 - sy2 * dx1) + sy0 * (sx2 * dx1 - sx1 * dx2) + (sx1 * sy2 - sx2 * sy1) * dx0) / denom;
  const dy = (sx0 * (sy1 * dy2 - sy2 * dy1) + sy0 * (sx2 * dy1 - sx1 * dy2) + (sx1 * sy2 - sx2 * sy1) * dy0) / denom;

  ctx.transform(m11, m12, m21, m22, dx, dy);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}
