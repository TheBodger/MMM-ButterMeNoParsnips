//this.name String The name of the module.
//this.identifier String This is a unique identifier for the module instance.
//this.hidden Boolean This represents if the module is currently hidden(faded away).
//this.config Boolean The configuration of the module instance as set in the user's config.js file. This config will also contain the module's defaults if these properties are not over- written by the user config.
//this.data Object The data object contain additional metadata about the module instance. (See below)

//The this.data data object contain the following metadata:
//	data.classes - The classes which are added to the module dom wrapper.
//	data.file - The filename of the core module file.
//	data.path - The path of the module folder.
//	data.header - The header added to the module.
//	data.position - The position in which the instance will be shown.

Module.register("MMM-ButterMeNoParsnips", {

	defaults: {
		text: "MMM-ButterMeNoParsnips",
		consumerids: ["MMFC1"],
		id: "MMFP1",
		datarefreshinterval: 60000,

		payloadType: "RSS", //options RSS or NDTF

		oldestAge : null, // – in milliseconds – ignore anything older – default for ever ago / null / none
		youngestAge: null, // – in milliseconds – ignore anything younger than this – default now(null / none)
		Dedup: false, // true/false – remove duplicates, implies tracking
		trackTimestamp:false, // – use timestamp of incoming data true/false
		trackID: false, // – use(pseudo/ hash) id to track data
		trackField: [], // – where to look for the Data(s) to track, defined as json field or hard coded RSS fields

		showDOM: false, // show the data created in the on the MM display, location must be added into the module config if true otherwise MM will error out

		startDelay: 0,	    //start delay in milliseconds before the first fetch of data

	},

	getScripts: function () { 
		return ["https://unpkg.com/butterchurn-presets@3.0.0-beta.4/dist/base.min.js",
			"https://unpkg.com/butterchurn-presets@3.0.0-beta.4/dist/extra.min.js",
		]
	},

	sendNotificationToNodeHelper: function (notification, payload) {
		this.sendSocketNotification(notification, payload);
	},

	start: function () {

		this.templateContent = "Welcome Neil";

		Log.log(this.name + " Started " + this.identifier);

		this.sendNotificationToNodeHelper("CONFIG", { moduleinstance: this.identifier, config: this.config });
		this.sendNotificationToNodeHelper("STATUS", { moduleinstance: this.identifier });

	},

	//include this override if there are multiple levels within the config and/or the config contgains arrays of key/value pairs that need defaults added

	//setConfig: function (config) {

	//	this.config = this.mergeConfigs(this.defaults, config);

	//},

	mergeConfigs: function (defaults, config) {

		//basic merge the config and defaults
		var mergedConfig = Object.assign({}, defaults, config);

		//recurse through the merged config looking for any arrays.
		//for each array, use the default values to fill any missing key/value pairs in the array

		Object.keys(mergedConfig).forEach((key) => {
			if (Array.isArray(mergedConfig[key])) {
				mergedConfig[key] = this.fillArrayDefaults(mergedConfig[key], defaults[key][0])
			}
			else if (typeof mergedConfig[key] == 'object') {
				mergedConfig[key] = this.fillObjectDefaults(mergedConfig[key], defaults[key]);
			}
		});

		return mergedConfig;
	},

	fillArrayDefaults: function (array, defaults) {

		if (!Array.isArray(array)) {
			return array;
		}

		return array.map(item => {
			if (typeof item !== 'object' || item === null) {
				return item; // If it's not an object, return it as is
			}
			return this.fillObjectDefaults(item, defaults);
		});
	},

	fillObjectDefaults: function (config, defaults) {

		//iterate through the items in the object and fill in any missing keys with the defaults recursively
		for (const key in defaults) {
			if (defaults.hasOwnProperty(key)) {
				if (!config.hasOwnProperty(key)) {
					config[key] = defaults[key]; // If the key is missing, add it with the default value
				} else if (Array.isArray(config[key])) {
					config[key] = this.fillArrayDefaults(config[key], defaults[key][0]); // If it's an array, fill it with defaults
				} else if (typeof config[key] === 'object' && config[key] !== null) {
					config[key] = this.fillObjectDefaults(config[key], defaults[key]); // If it's an object, recurse
				}
			}
		}

		return config; // Return the modified object

	},

	myconsumer: function (consumerid) {

		//check if this is one of  my consumers

		if (this.config.consumerids.indexOf(consumerid) >= 0) {
			return true;
		}

		return false;

	},

	notificationReceived: function (notification, payload, sender) {

		if (sender) {
			Log.log(this.name + " received a module notification: " + notification + " from sender: " + sender.name);
		} else {
			Log.log(this.name + " received a system notification: " + notification);
		}

		//if we get a notification that there is a consumer out there, if it one of our consumers, start processing
		//and mimic a response - we also want to start our cycles here - may have to handle some case of multipel restarts to a cycle
		//when we get multiple consumers to look after

		if (notification == 'CONSUMER' && this.myconsumer(payload)) {

			var self = this

			if (this.config.startDelay > 0) setTimeout(() => { }, this.config.startDelay);

			//send an in initial request to get the ball rolling

			this.sendNotificationToNodeHelper("UPDATE", { moduleinstance: this.identifier });

			// set timeout for checking for any new data
			setInterval(() => this.sendNotificationToNodeHelper("UPDATE", { moduleinstance: this.identifier }), this.config.datarefreshinterval);

		}
	},

	socketNotificationReceived: function (notification, payload) {

		if (notification == "NEW_DATA") {
			if (this.identifier == payload.TargetInstanceID) { //only process updates that are for this module instance

				if (this.config.showDOM) {
					this.templateContent = `${JSON.stringify(payload.Payload)}`;
					this.updateDom();
				}

				//convert the node format payload to a consumer format payload
				var modulePayload = new InterModulePayload();
				modulePayload.SourceID = this.identifier; // the module instance that is sending the payload
				modulePayload.TargetID = this.config.consumerids[0]; // the module instance that is receiving the payload / may be a list of them !!
				modulePayload.PayloadType = payload.PayloadType; //options RSS or NDTF
				modulePayload.Payload = payload.Payload; // the payload itself, which is a JSON object

				this.sendNotification('PROVIDER_UPDATE', modulePayload);
				Log.log("Sent some new data @ ");
			}
		}
	},

	getDom() {


		const wrapper = document.createElement("div")

		const canvas = document.createElement("canvas");
		canvas.id = "canvas";
		canvas.style.width = "500px";
		canvas.style.height = "500px";
		canvas.style.border = "2px solid red";
		wrapper.appendChild(canvas);

		this.audioElement = document.createElement("audio");
		this.audioElement.id = "sndAudio";
		this.audioElement.controls = true;
		this.audioElement.crossOrigin = "anonymous";
		this.audioElement.autoplay = true;

		const audioEvents = [
			{ action: 'abort', required: false }, { action: 'canplay', required: false },
			{ action: 'canplaythrough', required: false }, { action: 'durationchange', required: false },
			{ action: 'emptied', required: false }, { action: 'ended', required: true },
			{ action: 'suspend', required: false }, { action: 'timeupdate', required: false },
			{ action: 'volumechange', required: true }, { action: 'waiting', required: false },
			{ action: 'playing', required: true }, { action: 'progress', required: false },
			{ action: 'ratechange', required: false }, { action: 'seeked', required: false },
			{ action: 'seeking', required: false }, { action: 'stalled', required: false },
			{ action: 'error', required: false }, { action: 'loadeddata', required: false },
			{ action: 'loadedmetadata', required: false }, { action: 'loadstart', required: false },
			{ action: 'pause', required: true }, { action: 'play', required: false },
		];

		var preEventType = "";

		// Attach listeners for each event if required

		audioEvents.forEach(eventType => {

			this.audioElement.addEventListener(eventType.action, (e) => {
					if (!(preEventType == eventType.action)) {
						const timestamp = new Date().toLocaleTimeString();
						this.addAudioEvent(`${timestamp} — ${eventType.action}`);
					}
					preEventType = eventType.action;
				});
			
		});

		wrapper.appendChild(this.audioElement);

		const buttermeBtn = document.createElement("button");
		buttermeBtn.id = "buttermeBtn";
		buttermeBtn.textContent = "butter me";
		wrapper.appendChild(buttermeBtn);

		const srcBtn = document.createElement("button");
		srcBtn.id = "srcBtn";
		srcBtn.textContent = "Swap source";
		wrapper.appendChild(srcBtn);

		const nowPlayingTxt = document.createElement("div");
		nowPlayingTxt.id = "nowPlaying";
		wrapper.appendChild(nowPlayingTxt);

		const prevbtn = document.createElement("button");
		prevbtn.id = "prevbtn";
		prevbtn.textContent = "<";
		wrapper.appendChild(prevbtn);

		const presetNameTxt = document.createElement("div");
		presetNameTxt.id = "presetName";
		wrapper.appendChild(presetNameTxt);

		const nextbtn = document.createElement("button");
		nextbtn.id = "nextbtn";
		nextbtn.textContent = ">";
		wrapper.appendChild(nextbtn);

		const fullScrnBtn = document.createElement("button");
		fullScrnBtn.id = "fullScrnBtn";
		fullScrnBtn.textContent = "FullScreen";
		wrapper.appendChild(fullScrnBtn);

		const info = document.createElement("p");
		info.textContent = "This demo needs a browser supporting the <audio> element.";
		wrapper.appendChild(info);

		const title = document.createElement("h1");
		title.textContent = "Web Audio API examples: MediaElementAudioSource()";
		wrapper.appendChild(title);

		const bmnpScript = document.createElement("script");
		bmnpScript.type = "module"; 
		bmnpScript.src = "modules/MMM-ButterMeNoParsnips/butterMeNoParsnips.js";
		wrapper.appendChild(bmnpScript);

		const events = document.createElement("div");
		events.id = "events";
		wrapper.appendChild(events);

		return wrapper
	},

	 addAudioEvent(msg) {
		const audioError = this.audioElement.error ? ` ( Error ${this.audioElement.error.code}: ${this.audioElement.error.message})` : "";
		this.addLogEntry(`${msg}${ audioError }`);
	},

	 addLogEntry(msg) {
		const eventLog = document.getElementById("events");
		const event = document.createElement("p");
		event.className = "event-log-body";
		event.innerText = msg;
		eventLog.prepend(event);
	},

});
