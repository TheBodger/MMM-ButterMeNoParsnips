// minimal buttermenoparsnips
//
//expects all activity to do with audio to be handled in the hosting html page
//
// config is passed via the html page in window.butterMe.config
//
// if not set or missing then default values are used

//defaults

let canvasID = "butterCanvas";
let audioID = "audioPlayer";
let showControls = true;
let butterMeDivID = "butterMeDiv";

let useMMDiv = false;

if (typeof window.butterMe === "undefined" || window.butterMe === null)
{
    console.log("butterMe is not set or is null");
}
else
{
    let config = window.butterMe.config;
	
	canvasID = config.canvasID ?? canvasID;
	audioID = config.audioID ?? audioID;
	showControls = config.showControls ?? canvasID;
	butterMeDivID = config.butterMeDivID ?? butterMeDivID; useMMDiv = true;
}

import butterchurn from 'https://unpkg.com/butterchurn@3.0.0-beta.5/dist/butterchurn.js';

let audioCtx;
let visualizer;
let source = null;

let presetIndex = 0;
let presets;

let audioElement = document.getElementById(audioID);

if (!useMMDiv)
{

	let butterMeDiv = document.createElement("div");
	butterMeDiv.id = butterMeDivID;
}
else
{
	let butterMeDiv = document.getElementById(butterMeDivID);
}

let canvas = document.createElement("canvas");
canvas.id = canvasID;
canvas.width = 400;
canvas.height = 400;
butterMeDiv.appendChild(canvas);

let resetBtn;
let prevbtn;
let nextbtn;
let fullScrnBtn;

let presetNameTxt;

function addButton(id,name,parentDiv)
{
	let tempBTN = document.createElement("button");
	tempBTN.textContent = (name);
	tempBTN.id = (id);
	parentDiv.appendChild(tempBTN);

	return tempBTN;

}

if (showControls) {

	let controlsDiv = document.createElement("div");
	controlsDiv.id = "controlsDiv";
	controlsDiv.className = "button-overlay";

	let btnName = ""; let btnText = "";

	btnText = "Reset"; btnName = "resetBtn"; resetBtn = addButton(btnName, btnText, controlsDiv);
	btnText = "Next"; btnName = "prevbtn"; prevbtn = addButton(btnName, btnText, controlsDiv);
	btnText = "Prev"; btnName = "nextbtn"; nextbtn = addButton(btnName, btnText, controlsDiv);
	btnText = "Xpand"; btnName = "fullScrnBtn"; fullScrnBtn = addButton(btnName, btnText, controlsDiv);

	presetNameTxt = document.createElement("textarea"); presetNameTxt.id = "presetName";
	let brk = document.createElement("br");
	controlsDiv.appendChild(brk);
	controlsDiv.appendChild(presetNameTxt);

	butterMeDiv.appendChild(controlsDiv);

}

//document.body.appendChild(butterMeDiv);

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

audioCtx = new AudioContext();
source = new MediaElementAudioSourceNode(audioCtx, { mediaElement: audioElement, });
let analyserNode = audioCtx.createAnalyser();
source.connect(analyserNode);
analyserNode.connect(audioCtx.destination);

audioElement.addEventListener("play", () => {

    visualizer = butterchurn.createVisualizer(audioCtx, canvas, { width: canvas.width, height: canvas.height });
    visualizer.connectAudio(analyserNode);

    visualizer.loadPreset(presets[presetKeys[presetIndex]], 5.0);
    if (showControls) { presetNameTxt.textContent = presetKeys[presetIndex]; }
    startRenderer();

    if (showControls) {

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
			canvas.style.transform = "scale(2)";
            visualizer.width = canvas.width;
            visualizer.height = canvas.height;
		});

		resetBtn.addEventListener("click", () => {
			canvas.style.transform = "scale(1)";
			visualizer.width = canvas.width;
			visualizer.height = canvas.height;
		});

	}

	resumeAudioContextIfSuspended();

});

async function resumeAudioContextIfSuspended() {
	if (audioCtx.state === 'suspended') {
		try {
			await audioCtx.resume();
			console.log('AudioContext resumed');
		} catch (err) {
			console.error('Failed to resume AudioContext:', err);
		}
	}
}

function startRenderer() {
    requestAnimationFrame(() => startRenderer());
	visualizer.render();
	//console.log(audioCtx.state);
}
