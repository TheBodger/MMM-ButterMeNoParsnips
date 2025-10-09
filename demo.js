import butterchurn from 'https://unpkg.com/butterchurn@3.0.0-beta.5/dist/butterchurn.js';

$(function () {
	var visualizer = null;
	var rendering = false;
	var audioContext = null;
	var sourceNode = null;
	var delayedAudible = null;
	var cycleInterval = null;
	var presets = {};
	var presetKeys = [];
	var presetIndexHist = [];
	var presetIndex = 0;
	var presetCycle = true;
	var presetCycleLength = 15000;
	var presetRandom = true;
	var canvas = document.getElementById('canvas');

	function connectToAudioAnalyzer(sourceNode) {

		if (delayedAudible) {
			delayedAudible.disconnect();
		}

		delayedAudible = audioContext.createDelay();
		delayedAudible.delayTime.value = 0.26;

		sourceNode.connect(delayedAudible)
		delayedAudible.connect(audioContext.destination);

		visualizer.connectAudio(delayedAudible);
	}

	function startRenderer() {
		requestAnimationFrame(() => startRenderer());
		visualizer.render();
	}

	function loadLocalFiles(files, index = 0) {

		let audioElement = playStream(URL.createObjectURL(files[index]));

		setTimeout(() => {

			if (files.length > index + 1) {
				loadLocalFiles(files, index + 1);
			} else {
				audioElement.pause();              // Stop playback
				audioElement.currentTime = 0;      // Reset to beginning
				audioElement.src = "";             // Clear source to prevent reloading
				audioElement.load(); 
				$("#audioSelectWrapper").css('display', 'block');
			}
		}, 20*1000); //20 seconds

	}
	function playStream(url) {

		if (!rendering) {
			rendering = true;
			startRenderer();
		}

		audioContext.resume();

		const audio = new Audio();
		audio.crossOrigin = "anonymous";
		audio.src = url;
		audio.autoplay = true;

		const sourceNode = audioContext.createMediaElementSource(audio);
		connectToAudioAnalyzer(sourceNode); // analyzer hookup
		audio.play();
	
		resumeAudioContextIfSuspended();

		return audio;

	}

	async function resumeAudioContextIfSuspended() {
		if (audioContext.state === 'suspended') {
			try {
				await audioContext.resume();
				console.log('AudioContext resumed');
			} catch (err) {
				console.error('Failed to resume AudioContext:', err);
			}
		}
	}

	function nextPreset(blendTime = 5.7) {
		presetIndexHist.push(presetIndex);

		var numPresets = presetKeys.length;
		if (presetRandom) {
			presetIndex = Math.floor(Math.random() * presetKeys.length);
		} else {
			presetIndex = (presetIndex + 1) % numPresets;
		}

		visualizer.loadPreset(presets[presetKeys[presetIndex]], blendTime);
		$('#presetSelect').val(presetIndex);
	}

	function prevPreset(blendTime = 5.7) {
		var numPresets = presetKeys.length;
		if (presetIndexHist.length > 0) {
			presetIndex = presetIndexHist.pop();
		} else {
			presetIndex = ((presetIndex - 1) + numPresets) % numPresets;
		}

		visualizer.loadPreset(presets[presetKeys[presetIndex]], blendTime);
		$('#presetSelect').val(presetIndex);
	}

	function restartCycleInterval() {
		if (cycleInterval) {
			clearInterval(cycleInterval);
			cycleInterval = null;
		}

		if (presetCycle) {
			cycleInterval = setInterval(() => nextPreset(2.7), presetCycleLength);
		}
	}

	$(document).keydown((e) => {
		if (e.which === 32 || e.which === 39) {
			nextPreset();
		} else if (e.which === 8 || e.which === 37) {
			prevPreset();
		} else if (e.which === 72) {
			nextPreset(0);
		}
	});

	$('#presetSelect').change((evt) => {
		presetIndexHist.push(presetIndex);
		presetIndex = parseInt($('#presetSelect').val());
		visualizer.loadPreset(presets[presetKeys[presetIndex]], 5.7);
	});

	$('#presetCycle').change(() => {
		presetCycle = $('#presetCycle').is(':checked');
		restartCycleInterval();
	});

	$('#presetCycleLength').change((evt) => {
		presetCycleLength = parseInt($('#presetCycleLength').val() * 1000);
		restartCycleInterval();
	});

	$('#presetRandom').change(() => {
		presetRandom = $('#presetRandom').is(':checked');
	});

	$("#localFileBut").click(function () {
		$("#audioSelectWrapper").css('display', 'none');

		var fileSelector = $('<input type="file" accept="audio/*" multiple />');

		fileSelector[0].onchange = function (event) {
			loadLocalFiles(fileSelector[0].files);
		}

		fileSelector.click();
	});

	$("#streamingURLBut").click(function () {
		$("#audioSelectWrapper").css('display', 'none');

		playStream("https://ice6.somafm.com/groovesalad-256-mp3");

	});

	function initPlayer() {


		presets = {};
		if (window.base && window.base.default) {
			Object.assign(presets, window.base.default);
		}
		if (window.extra && window.extra.default) {
			Object.assign(presets, window.extra.default);
		}
		presets = _(presets).toPairs().sortBy(([k, v]) => k.toLowerCase()).fromPairs().value();
		presetKeys = _.keys(presets);
		presetIndex = Math.floor(Math.random() * presetKeys.length);

		var presetSelect = document.getElementById('presetSelect');
		for (var i = 0; i < presetKeys.length; i++) {
			var opt = document.createElement('option');
			opt.innerHTML = presetKeys[i].substring(0, 60) + (presetKeys[i].length > 60 ? '...' : '');
			opt.value = i;
			presetSelect.appendChild(opt);
		}

		audioContext = new AudioContext();
		visualizer = butterchurn.createVisualizer(audioContext, canvas, {
			width: 800,
			height: 600,
			pixelRatio: window.devicePixelRatio || 1,
			textureRatio: 1,
		});

		nextPreset(0);
		cycleInterval = setInterval(() => nextPreset(2.7), presetCycleLength);
	}

	initPlayer();
});
