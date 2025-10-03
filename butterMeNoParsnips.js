import butterchurn from 'https://unpkg.com/butterchurn@3.0.0-beta.5/dist/butterchurn.js';

let audioCtx;
let visualizer;
let source = null;

let presetIndex = 0;
let presets;

let srcType = 0;
let srcs = ["rocku.mp3", "https://ice6.somafm.com/groovesalad-256-mp3", "viper.mp3", "http://192.168.1.39:50002/m/MP3/33859.mp3"]

let audioElement = document.getElementById("sndAudio");
let resetBtn = document.getElementById("resetBtn");
let prevbtn = document.getElementById("prevbtn");
let nextbtn = document.getElementById("nextbtn");
let fullScrnBtn = document.getElementById("fullScrnBtn");

let srcBtn = document.getElementById("srcBtn");


const presetNameTxt = document.getElementById("presetName");

audioElement.src = srcs[srcType];

presets = {};
if (window.base && window.base.default) {
    Object.assign(presets, window.base.default);
}
if (window.extra && window.extra.default) {
    Object.assign(presets, window.extra.default);
}

// Step 1: Convert object to array of [key, value] pairs
let entries = Object.entries(presets);

// Step 2: Sort by lowercase key
entries.sort(([k1], [k2]) => k1.toLowerCase().localeCompare(k2.toLowerCase()));

// Step 3: Convert back to object
presets = Object.fromEntries(entries);

// Step 4: Get keys
let presetKeys = Object.keys(presets);

srcBtn.addEventListener("click", () => {
    srcType = (srcType + 1) % srcs.length;
    audioElement.src = srcs[srcType];
});

audioCtx = new AudioContext();
source = new MediaElementAudioSourceNode(audioCtx, { mediaElement: audioElement, });
let analyserNode = audioCtx.createAnalyser();
source.connect(analyserNode);
analyserNode.connect(audioCtx.destination);

audioElement.addEventListener("play", () => {

    visualizer = butterchurn.createVisualizer(audioCtx, canvas, { width: canvas.width, height: canvas.height });
    visualizer.connectAudio(analyserNode);

    visualizer.loadPreset(presets[presetKeys[presetIndex]], 5.0);
    presetNameTxt.textContent = presetKeys[presetIndex];
    startRenderer();

    nextbtn.addEventListener("click", () => {
        presetIndex = (presetIndex + 1) % Object.keys(presets).length;
        visualizer.loadPreset(presets[presetKeys[presetIndex]], 5.0);
        presetNameTxt.textContent = presetKeys[presetIndex];
    });

    prevbtn.addEventListener("click", () => {
        presetIndex = (presetIndex - 1 + Object.keys(presets).length) % Object.keys(presets).length;
        visualizer.loadPreset(presets[presetKeys[presetIndex]], 5.0);
        presetNameTxt.textContent = presetKeys[presetIndex];
    });

    fullScrnBtn.addEventListener("click", () => {
        canvas.style.width = "100%";
        canvas.style.height = "60%";
        visualizer.width = canvas.width;
        visualizer.height = canvas.height;
    });


});

function startRenderer() {
    requestAnimationFrame(() => startRenderer());
    visualizer.render();
}