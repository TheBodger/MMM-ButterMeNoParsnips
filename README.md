# MMM-ButterMeNoParsnips

Contains the neccessary code to support the [butterchurn](https://github.com/jberg/butterchurn) visualiser and using the butterchurn-presets default visualisations.

The core code is the buttermenoparsnips-min.js. 
The helpers.js provides some common modules used along with this module.

For more details and examples of usage, see [MMM-AudioProxy](https://github.com/TheBodger/MMM-AudioProxy) and [MMM-SimplePlayer](https://github.com/TheBodger/MMM-SimplePlayer).

To incorporate the visualiser within your own code, include the buttermenoparsnips-min.js as a type of Module. This is required to enable the importing of the butterchurn code module.

```js
<script type="module" src="buttermenoparsnips-min.js"></script>
```

use the helper functions to pass any config details such as the id of the audio tag.

Because this uses the MediaElementAudioSourceNode function, some combinations of browsers and streaming servers, especially DLNA servers may be blocked from working. Use the proxy in MMM-AudioProxy or other proxy server to get round this feature.

There are no dependencies.

Comedians like Joe Lycett have popularized the specific "butter me parsnips" version for comedic effect, often using it literally or as a humorous, nonsensical way to deliver a punchline. In this case it is a play on the butterchurn visualiser name.
