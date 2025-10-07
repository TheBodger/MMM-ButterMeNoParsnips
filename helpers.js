var Helpers = {
	addBMConfig(audioID = "audioPlayer", showControls = true, butterMeDivID = "butterMeDiv") {

		configScript = document.createElement("script");
		configScript.type = "text/javascript";
		configScript.text = `window.butterMe = { config: { audioID: "${audioID}", showControls: ${showControls}, butterMeDivID: "${butterMeDivID}"} }`;
		document.head.appendChild(configScript);
	},
	addBMScript() {

		myScript = document.createElement("script");
		myScript.src = "modules/MMM-ButterMeNoParsnips/buttermenoparsnips-min.js";
		myScript.type = "module";
		document.head.appendChild(myScript);
	},
};
