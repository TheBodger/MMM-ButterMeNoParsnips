import butterchurn from 'https://unpkg.com/butterchurn@3.0.0-beta.5/dist/butterchurn.js';

let audioCtx;
let visualizer;
let source = null;
let analyserNode;

let presetIndex = 0;
let presets;

let audioContextInitiated = false;

let srcType = 0;
//"http://192.168.1.39:50002/m/MP3/33859.mp3",
let srcs = ["https://ice6.somafm.com/groovesalad-256-mp3", "modules/MMM-ButterMeNoParsnips/music/viper.mp3",  "modules/MMM-ButterMeNoParsnips/music/rocku.mp3"]

let audioElement = document.getElementById("sndAudio");
let resetBtn = document.getElementById("resetBtn");
let prevbtn = document.getElementById("prevbtn");
let nextbtn = document.getElementById("nextbtn");
let fullScrnBtn = document.getElementById("fullScrnBtn");

let buttermeBtn = document.getElementById("buttermeBtn");

let nowPlayingTxt = document.getElementById("nowPlaying");

const presetNameTxt = document.getElementById("presetName");
const srcBtn = document.getElementById("srcBtn");

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

buttermeBtn.addEventListener("click", () => {


	initAudioContect();
	initButterMe();

});

audioElement.addEventListener("play", () => {

	nowPlayingTxt.innerHTML = "Now Playing: " + audioElement.src.split('/').pop();

	nextbtn.addEventListener("click", () => {
		presetIndex = (presetIndex + 1) % Object.keys(presets).length;
		visualizer.loadPreset(presets[presetKeys[presetIndex]], 5.0);
		presetNameTxt.innerHTML = presetKeys[presetIndex];
	});

	prevbtn.addEventListener("click", () => {
		presetIndex = (presetIndex - 1 + Object.keys(presets).length) % Object.keys(presets).length;
		visualizer.loadPreset(presets[presetKeys[presetIndex]], 5.0);
		presetNameTxt.innerHTML = presetKeys[presetIndex];
	});

	fullScrnBtn.addEventListener("click", () => {
		canvas.style.width = "100%";
		canvas.style.height = "60%";
		visualizer.width = canvas.width;
		visualizer.height = canvas.height;
	});

});

function initAudioContect() {

	if (audioContextInitiated) { return; }

	audioCtx = new AudioContext();

	// Ensure this is triggered by user interaction (e.g., a button click)
	source = audioCtx.createMediaElementSource(audioElement);
	analyserNode = audioCtx.createAnalyser();

	// Connect the nodes properly
	source.connect(analyserNode);
	analyserNode.connect(audioCtx.destination);

	// Optional: resume context if needed

	if (audioCtx.state === 'suspended') {
		audioCtx.resume();
	}

	audioContextInitiated = true;

}

function initButterMe() {


    visualizer = butterchurn.createVisualizer(audioCtx, canvas, { width: canvas.width, height: canvas.height });
    visualizer.connectAudio(analyserNode);
    visualizer.loadPreset(presets[presetKeys[presetIndex]], 5.0);
	presetNameTxt.innerHTML = presetKeys[presetIndex];
	startRenderer();

};

function startRenderer() {
    requestAnimationFrame(() => startRenderer());
    visualizer.render();
}
