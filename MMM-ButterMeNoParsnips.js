Module.register("MMM-ButterMeNoParsnips", {

	defaults:
	{
		srcIdx:0,
		srcs: ["modules/MMM-ButterMeNoParsnips/music/rocku.mp3", "https://ice6.somafm.com/groovesalad-256-mp3", "modules/MMM-ButterMeNoParsnips/music/viper.mp3"]

	},

	getStyles() {
		return [
			"modules/MMM-ButterMeNoParsnips/demo.css",
			"https://unpkg.com/normalize.css/normalize.css",
		]
	},

	getScripts() {
		return [
			"https://unpkg.com/butterchurn-presets@3.0.0-beta.4/dist/base.min.js",
			"https://unpkg.com/butterchurn-presets@3.0.0-beta.4/dist/extra.min.js",
		]
	},
	 loadScript(src) {
		  return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = src;
			script.async = true;

			script.onload = () => resolve(script);
			script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

			document.head.appendChild(script);
		  });
	},

	getDom() 
	{

		let wrapper = document.getElementById("butterme");

		if (wrapper == null) { //make sure in this example that the wrapper is only created once

			wrapper = document.createElement("div");
			wrapper.id = "butterme";

			//safely load lodash first before adding the other code that requires it
			this.loadScript("https://unpkg.com/lodash")
			  .then(() => {
				console.log('Script loaded!');
					jquery = document.createElement("script");
					jquery.setAttribute("integrity", "sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=");
					jquery.setAttribute("crossorigin","anonymous");
					jquery.src = "https://code.jquery.com/jquery-3.1.1.min.js";
					document.head.appendChild(jquery);

					myscript = document.createElement("script");
					myscript.type = "module";
					myscript.src = "modules/MMM-ButterMeNoParsnips/demo.js";
					document.head.appendChild(myscript);
			  })
			  .catch(err => {
				console.error(err);
			  });

			audioSelectWrapper = document.createElement("div");    
			audioSelectWrapper.id = "audioSelectWrapper";

			localFileBut = document.createElement("div");
			localFileBut.id = "localFileBut";
			lfbspan = document.createElement("span");
			t0 = document.createTextNode("Load local files");
			t0.style.font = "10px";
			lfbspan.appendChild(t0);
			localFileBut.appendChild(lfbspan)

			streamingURLBut = document.createElement("div");
			streamingURLBut.id = "streamingURLBut";
			subspan = document.createElement("span");
			t00 = document.createTextNode("Load URL");
			subspan.appendChild(t00);
			streamingURLBut.appendChild(subspan)

			audioSelectWrapper.appendChild(localFileBut);
			audioSelectWrapper.appendChild(streamingURLBut);

			wrapper.appendChild(audioSelectWrapper);

			presetControls = document.createElement("div");
			presetControls.id = "presetControls";

			d1 = document.createElement("div");
			t1 = document.createTextNode("preset:");
			d1.appendChild(t1);
			s1 = document.createElement("select");
			s1.id = "presetSelect";
			d1.appendChild(s1);
			presetControls.appendChild(d1);

			d2 = document.createElement("div");
			t2 = document.createTextNode("cycle:");
			d2.appendChild(t2);
			i21 = document.createElement("INPUT");
			i21.setAttribute("type", "checkbox");
			i21.checked = true;

			i22 = document.createElement("input");
			i22.setAttribute("type", "number");
			i22.id = "presetCycleLength;"
			i22.step = 1;
			i22.defaultValue = 15;
			i22.min = 1;

			d2.appendChild(i21);
			d2.appendChild(i22);

			presetControls.appendChild(d2);

			d3 = document.createElement("div");
			t3 = document.createTextNode("random:");
			d3.appendChild(t3);
			i31 = document.createElement("input");
			i31.setAttribute("type", "checkbox")
			i31.id = "presetRandom;"
			i31.checked = true;
			d3.appendChild(i31);
			presetControls.appendChild(d3);

			wrapper.appendChild(presetControls);

			canvas = document.createElement("canvas");
			canvas.id = "canvas";
			canvas.width = 600;
			canvas.height = 300;

			wrapper.appendChild(canvas);

		}

		return wrapper;
	}
});
