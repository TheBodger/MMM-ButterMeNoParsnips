/* global Module, MMM-Provider */

/* Magic Mirror
 * Module: node_helper
 *
 * By Neil Scott
 * MIT Licensed.
 */


//if the module calls a RESET, then the date tracking is reset and all data will be sent

//nodehelper stuff:
//this.name String The name of the module

const NodeHelper = require("node_helper");

const Structures = require("../MMM-Structures/MMM-Structures.js")
const Utilities = require("../MMM-Utilities/MMM-Utilities.js")

module.exports = NodeHelper.create({

  start: function () {
		this.configurations = new Structures.Configurations();
		this.payloadTracker = new Structures.PayloadTracker();
		this.debug = false;
		this.payloads = [];
		console.log(this.name + ' node_helper is started!');
		},

	stop: function () {
		console.log("Shutting down node_helper");
		this.connection.close();
	},

	setconfig: function (moduleinstance, config) {

		var self = this;

		this.configurations.addConfiguration(moduleinstance, config);

		this.payloadTracker.addTracker(moduleinstance);

		//note must have the payloadType set in the config for this to work, default is RSS

		this.payloads[moduleinstance] = new Structures.NodePayload(config.payloadType,moduleinstance,config.id);

	},

	socketNotificationReceived: function (notification, payload) {

		var self = this;

		console.log('Node Notification: ' + notification + ", Module:" + payload.moduleinstance);

		switch (notification) {
			case "CONFIG":
				this.setconfig(payload.moduleinstance, payload.config);
				break;
			case "STATUS":
				this.showstatus(payload.moduleinstance);
				break;
			case "UPDATE":
				this.update(payload.moduleinstance);
				break;
		}

	},

	sendUpdate: function (notification, payload) {
		this.sendSocketNotification(notification,payload)
	},


	showstatus: function (moduleinstance) {

		console.log('============================ start of status ========================================');

		console.log('config for provider: ' + moduleinstance);

		console.log(this.configurations.clone(moduleinstance));

		console.log('============================= end of status =========================================');
	},

	update: function (moduleinstance) {

		var self = this;

		this.payloads[moduleinstance].Payload.timestamp = new Date().toISOString(); // the time the RSS feed was last updated

		//always create a unique key for each item to track if it has been sent or not

		//RSS

		if (this.configurations.configuration[moduleinstance].payloadType == "RSS")
		{
			var title = "Testing RSS Item";
			var pubdate = new Date().toISOString();
			pubdate = new Date("2025-01-01").toISOString(); //force the same data so key is same so only 1 item is added

			var RSSItem = new Structures.RSSItem();

			//key

			RSSItem.id = RSSItem.gethashCode(title + pubdate);

			//check the tracker to see if this item has been sent before

			if (!this.payloadTracker.addItem(moduleinstance, RSSItem.id)) {
				console.log("Adding RSS Item: " + RSSItem.id);

				RSSItem.Title = title;
				RSSItem.PubDate = pubdate; // the time the RSS feed was last updated
				RSSItem.Description = "This is a test RSS item";

				this.payloads[moduleinstance].Payload.RSSFeedSource = moduleinstance;
				this.payloads[moduleinstance].Payload.Items.push(RSSItem);

			}
		}

		//NDTF - note additional keys array separate needs to be populated

		if (this.configurations.configuration[moduleinstance].payloadType == "NDTF")
		{

			var NDTFItem = new Structures.NDTFItem("Testing", "Module", new Date().toISOString(), moduleinstance);
			//testing tracking, fix the date here / use random date so we have a few coming through
			NDTFItem = new Structures.NDTFItem( "Testing",  "Module", new Date("2025-01-"+Math.floor(Math.random()*30)).toISOString(), moduleinstance );

			//key

			var key = NDTFItem.gethashCode(NDTFItem.subject + NDTFItem.object + NDTFItem.timestamp); //can include value if really needed

			if (!this.payloadTracker.addItem(moduleinstance, key)) {
				console.log("Adding NDTF Item: " + key);
				this.payloads[moduleinstance].Payload.NDTF.push(NDTFItem);
				this.payloads[moduleinstance].Payload.keys.push(key);
			}

		}

		var newpayload = this.payloads[moduleinstance].clone();

		//here we track the payload items to ensure that only unsent items are sent to the consumer, and mark them as sent
		newpayload.Payload = Utilities.trackPayloadItems(newpayload, this.payloadTracker, moduleinstance);

		//if the payload is empty, then we do not send it

		if ((newpayload.Payload.Items && newpayload.Payload.Items.length > 0) || (newpayload.Payload.NDTF && newpayload.Payload.NDTF.length > 0)) {

			this.sendUpdate("NEW_DATA", newpayload);
		}
	},

});
