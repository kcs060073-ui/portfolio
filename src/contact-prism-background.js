(() => {
  const section = document.querySelector('.contactFinal');
  const mount = document.querySelector('.contactPrismBg');
  if (!section || !mount) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  const canvas = document.createElement('canvas');
  mount.appendChild(canvas);

  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false
  });

  if (!gl) {
    mount.classList.add('is-fallback');
    return;
  }

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.disable(gl.BLEND);

  const vertex = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragment = `
    precision highp float;

    uniform vec2  iResolution;
    uniform float iTime;
    uniform float uHeight;
    uniform float uBaseHalf;
    uniform mat3  uRot;
    uniform int   uUseBaseWobble;
    uniform float uGlow;
    uniform vec2  uOffsetPx;
    uniform float uNoise;
    uniform float uSaturation;
    uniform float uScale;
    uniform float uHueShift;
    uniform float uColorFreq;
    uniform float uBloom;
    uniform float uCenterShift;
    uniform float uInvBaseHalf;
    uniform float uInvHeight;
    uniform float uMinAxis;
    uniform float uPxScale;
    uniform float uTimeScale;
    uniform float uOpacity;

    vec4 tanh4(vec4 x){
      vec4 e2x = exp(2.0 * x);
      return (e2x - 1.0) / (e2x + 1.0);
    }

    float rand(vec2 co){
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    float sdOctaAnisoInv(vec3 p){
      vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
      float m = q.x + q.y + q.z - 1.0;
      return m * uMinAxis * 0.5773502691896258;
    }

    float sdPyramidUpInv(vec3 p){
      float oct = sdOctaAnisoInv(p);
      float halfSpace = -p.y;
      return max(oct, halfSpace);
    }

    mat3 hueRotation(float a){
      float c = cos(a), s = sin(a);
      mat3 W = mat3(
        0.299, 0.587, 0.114,
        0.299, 0.587, 0.114,
        0.299, 0.587, 0.114
      );
      mat3 U = mat3(
         0.701, -0.587, -0.114,
        -0.299,  0.413, -0.114,
        -0.300, -0.588,  0.886
      );
      mat3 V = mat3(
         0.168, -0.331,  0.500,
         0.328,  0.035, -0.500,
        -0.497,  0.296,  0.201
      );
      return W + U * c + V * s;
    }

    void main(){
      vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;
      float z = 5.0;
      float d = 0.0;
      vec3 p;
      vec4 o = vec4(0.0);
      float centerShift = uCenterShift;
      float cf = uColorFreq;

      mat2 wob = mat2(1.0);
      if (uUseBaseWobble == 1) {
        float t = iTime * uTimeScale;
        float c0 = cos(t + 0.0);
        float c1 = cos(t + 33.0);
        float c2 = cos(t + 11.0);
        wob = mat2(c0, c1, c2, c0);
      }

      const int STEPS = 100;
      for (int i = 0; i < STEPS; i++) {
        p = vec3(f, z);
        p.xz = p.xz * wob;
        p = uRot * p;
        vec3 q = p;
        q.y += centerShift;
        d = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
        z -= d;
        o += (sin((p.y + z) * cf + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
      }

      o = tanh4(o * o * (uGlow * uBloom) / 1e5);
      vec3 col = o.rgb;
      float n = rand(gl_FragCoord.xy + vec2(iTime));
      col += (n - 0.5) * uNoise;
      col = clamp(col, 0.0, 1.0);

      float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);

      if (abs(uHueShift) > 0.0001) {
        col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
      }

      float vignette = smoothstep(1.28, 0.28, length((gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0));
      float alpha = clamp((max(max(col.r, col.g), col.b) * 0.78 + o.a * 0.30) * vignette * uOpacity, 0.0, 0.86);
      gl_FragColor = vec4(col, alpha);
    }
  `;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vert = compile(gl.VERTEX_SHADER, vertex);
  const frag = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vert || !frag) return;

  const program = gl.createProgram();
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(program));
    return;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const loc = (name) => gl.getUniformLocation(program, name);
  const position = gl.getAttribLocation(program, 'position');
  const uniforms = {
    iResolution: loc('iResolution'),
    iTime: loc('iTime'),
    uHeight: loc('uHeight'),
    uBaseHalf: loc('uBaseHalf'),
    uRot: loc('uRot'),
    uUseBaseWobble: loc('uUseBaseWobble'),
    uGlow: loc('uGlow'),
    uOffsetPx: loc('uOffsetPx'),
    uNoise: loc('uNoise'),
    uSaturation: loc('uSaturation'),
    uScale: loc('uScale'),
    uHueShift: loc('uHueShift'),
    uColorFreq: loc('uColorFreq'),
    uBloom: loc('uBloom'),
    uCenterShift: loc('uCenterShift'),
    uInvBaseHalf: loc('uInvBaseHalf'),
    uInvHeight: loc('uInvHeight'),
    uMinAxis: loc('uMinAxis'),
    uPxScale: loc('uPxScale'),
    uTimeScale: loc('uTimeScale'),
    uOpacity: loc('uOpacity')
  };

  const H = 3.5;
  const BW = 5.5;
  const BASE_HALF = BW * 0.5;
  const SCALE = mobile ? 2.25 : 3.85;
  const GLOW = mobile ? 0.72 : 1.16;
  const BLOOM = mobile ? 0.86 : 1.18;
  const NOISE = 0.48;
  const SAT = 1.55;
  const CFREQ = 1.0;
  const TS = reduced ? 0.0 : 0.46;
  const HUE = 0.0;

  let width = 1;
  let height = 1;
  let dpr = 1;
  let raf = 0;
  let visible = false;
  let lastFrame = 0;
  const t0 = performance.now();
  const rotBuf = new Float32Array([1,0,0,0,1,0,0,0,1]);

  const setMat3FromEuler = (yawY, pitchX, rollZ, out) => {
    const cy = Math.cos(yawY), sy = Math.sin(yawY);
    const cx = Math.cos(pitchX), sx = Math.sin(pitchX);
    const cz = Math.cos(rollZ), sz = Math.sin(rollZ);
    out[0] = cy * cz + sy * sx * sz;
    out[1] = cx * sz;
    out[2] = -sy * cz + cy * sx * sz;
    out[3] = -cy * sz + sy * sx * cz;
    out[4] = cx * cz;
    out[5] = sy * sz + cy * sx * cz;
    out[6] = sy * cx;
    out[7] = -sx;
    out[8] = cy * cx;
    return out;
  };

  const resize = () => {
    const rect = mount.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.25);
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const render = (now) => {
    if (!visible || document.hidden) {
      raf = 0;
      return;
    }

    if (!reduced && now - lastFrame < 33) {
      raf = requestAnimationFrame(render);
      return;
    }
    lastFrame = now;

    const time = (now - t0) * 0.001;
    const tScaled = time * TS;
    setMat3FromEuler(
      Math.sin(tScaled * 0.35) * 0.18,
      Math.sin(tScaled * 0.27 + 1.1) * 0.12,
      Math.sin(tScaled * 0.20 + 2.2) * 0.08,
      rotBuf
    );

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(uniforms.iResolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.iTime, time);
    gl.uniform1f(uniforms.uHeight, H);
    gl.uniform1f(uniforms.uBaseHalf, BASE_HALF);
    gl.uniformMatrix3fv(uniforms.uRot, false, rotBuf);
    gl.uniform1i(uniforms.uUseBaseWobble, 1);
    gl.uniform1f(uniforms.uGlow, GLOW);
    gl.uniform2f(uniforms.uOffsetPx, (mobile ? 0 : 250) * dpr, (mobile ? -45 : -30) * dpr);
    gl.uniform1f(uniforms.uNoise, NOISE);
    gl.uniform1f(uniforms.uSaturation, SAT);
    gl.uniform1f(uniforms.uScale, SCALE);
    gl.uniform1f(uniforms.uHueShift, HUE);
    gl.uniform1f(uniforms.uColorFreq, CFREQ);
    gl.uniform1f(uniforms.uBloom, BLOOM);
    gl.uniform1f(uniforms.uCenterShift, H * 0.25);
    gl.uniform1f(uniforms.uInvBaseHalf, 1 / BASE_HALF);
    gl.uniform1f(uniforms.uInvHeight, 1 / H);
    gl.uniform1f(uniforms.uMinAxis, Math.min(BASE_HALF, H));
    gl.uniform1f(uniforms.uPxScale, 1 / ((canvas.height || 1) * 0.1 * SCALE));
    gl.uniform1f(uniforms.uTimeScale, TS);
    gl.uniform1f(uniforms.uOpacity, mobile ? 0.62 : 0.92);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = reduced ? 0 : requestAnimationFrame(render);
  };

  const startRender = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };

  const stopRender = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const observer = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    mount.classList.toggle('is-active', visible);
    if (visible) startRender();
    else stopRender();
  }, { threshold: 0.06 });

  observer.observe(section);
  const ro = new ResizeObserver(resize);
  ro.observe(mount);
  resize();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopRender();
    else if (visible) startRender();
  });
  startRender();
})();
