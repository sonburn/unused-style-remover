var debugMode = false;

var remover = function(context) {
	var alertWindow = COSAlertWindow.new(),
		pluginIconPath = context.plugin.urlForResourceNamed("icon.png").path(),
		pluginIcon = NSImage.alloc().initByReferencingFile(pluginIconPath);

	alertWindow.setIcon(pluginIcon);
	alertWindow.setMessageText("Unused Style Remover");
	alertWindow.setInformativeText("Remove unused layer and text styles.");

	var contentFrameWidth = 300,
		contentFrameHeight = 192,
		contentFrameGutter = 15,
		listItemHeight = 24;

	var unusedLayerStyles = getUnusedStyles(0);

	if (unusedLayerStyles.length > 0) {
		var layerStyleTitle = createContentView(NSMakeRect(0,0,contentFrameWidth,18)),
			layerStyleCheckbox = createCheckbox({name:"",value:1},1,NSMakeRect(0,0,18,18)),
			layerStyleLabel = createBoldLabel("Unused Layer Styles (" + unusedLayerStyles.length + ")",12,NSMakeRect(22,0,contentFrameWidth-22,16));

		layerStyleCheckbox.setAction("callAction:");
		layerStyleCheckbox.setCOSJSTargetFunction(function(sender) {
			for (var i = 0; i < layerStyleCheckboxes.length; i++) {
				layerStyleCheckboxes[i].state = sender.state();
			}
		});

		layerStyleTitle.addSubview(layerStyleCheckbox);
		layerStyleTitle.addSubview(layerStyleLabel);

		alertWindow.addAccessoryView(layerStyleTitle);

		var layerStyleWidth = contentFrameWidth - contentFrameGutter,
			layerStyleFrameHeight = (unusedLayerStyles.length < 8) ? unusedLayerStyles.length * listItemHeight : contentFrameHeight,
			layerStyleFrame = createScrollView(NSMakeRect(0,0,contentFrameWidth,layerStyleFrameHeight)),
			layerStyleContent = createContentView(NSMakeRect(0,0,layerStyleWidth,unusedLayerStyles.length*listItemHeight)),
			layerStyleCount = 0,
			layerStyleCheckboxes = [];

		for (var i = 0; i < unusedLayerStyles.length; i++) {
			var unusedLayerStyle = createCheckbox({name:unusedLayerStyles[i].name(),value:i},1,NSMakeRect(0,listItemHeight*layerStyleCount,layerStyleWidth,listItemHeight));

			layerStyleCheckboxes.push(unusedLayerStyle);
			layerStyleContent.addSubview(unusedLayerStyle);

			layerStyleCount++;
		}

		layerStyleFrame.setDocumentView(layerStyleContent);

		alertWindow.addAccessoryView(layerStyleFrame);
	} else {
		var layerStyleLabel = createBoldLabel("Unused Layer Styles (" + unusedLayerStyles.length + ")",12,NSMakeRect(0,0,contentFrameWidth,16));

		alertWindow.addAccessoryView(layerStyleLabel);
	}

	var unusedTextStyles = getUnusedStyles(1);

	if (unusedTextStyles.length > 0) {
		var textStyleTitle = createContentView(NSMakeRect(0,0,contentFrameWidth,18)),
			textStyleCheckbox = createCheckbox({name:"",value:1},1,NSMakeRect(0,0,18,18)),
			textStyleLabel = createBoldLabel("Unused Text Styles (" + unusedTextStyles.length + ")",12,NSMakeRect(22,0,contentFrameWidth-22,16));

		textStyleCheckbox.setAction("callAction:");
		textStyleCheckbox.setCOSJSTargetFunction(function(sender) {
			for (var i = 0; i < textStyleCheckboxes.length; i++) {
				textStyleCheckboxes[i].state = sender.state();
			}
		});

		textStyleTitle.addSubview(textStyleCheckbox);
		textStyleTitle.addSubview(textStyleLabel);

		alertWindow.addAccessoryView(textStyleTitle);

		var textStyleWidth = contentFrameWidth - contentFrameGutter,
			textStyleFrameHeight = (unusedTextStyles.length < 8) ? unusedTextStyles.length * listItemHeight : contentFrameHeight,
			textStyleFrame = createScrollView(NSMakeRect(0,0,contentFrameWidth,textStyleFrameHeight)),
			textStyleContent = createContentView(NSMakeRect(0,0,textStyleWidth,unusedTextStyles.length*listItemHeight)),
			textStyleCount = 0,
			textStyleCheckboxes = [];

		for (var i = 0; i < unusedTextStyles.length; i++) {
			var unusedTextStyle = createCheckbox({name:unusedTextStyles[i].name(),value:i},1,NSMakeRect(0,listItemHeight*textStyleCount,textStyleWidth,listItemHeight));

			textStyleCheckboxes.push(unusedTextStyle);
			textStyleContent.addSubview(unusedTextStyle);

			textStyleCount++;
		}

		textStyleFrame.setDocumentView(textStyleContent);

		alertWindow.addAccessoryView(textStyleFrame);
	} else {
		var textStyleLabel = createBoldLabel("Unused Text Styles (" + unusedTextStyles.length + ")",12,NSMakeRect(0,0,contentFrameWidth,16));

		alertWindow.addAccessoryView(textStyleLabel);
	}

	if (unusedLayerStyles.length == 0 && unusedTextStyles.length == 0) {
		alertWindow.addButtonWithTitle("Close");
	} else {
		alertWindow.addButtonWithTitle("Remove Unused Styles");
		alertWindow.addButtonWithTitle("Cancel");
	}

	var alertResponse = alertWindow.runModal();

	if (alertResponse == 1000) {
		var layerStylesToRemove = NSMutableArray.array(),
			textStylesToRemove = NSMutableArray.array();

		for (var i = 0; i < unusedLayerStyles.length; i++) {
			if (layerStyleCheckboxes[i].state() == 1) layerStylesToRemove.addObject(unusedLayerStyles[i]);
		}

		for (var i = 0; i < unusedTextStyles.length; i++) {
			if (textStyleCheckboxes[i].state() == 1) textStylesToRemove.addObject(unusedTextStyles[i]);
		}

		for (var i = 0; i < layerStylesToRemove.length; i++) {
			var styles = context.document.documentData().layerStyles();

			if (styles.sharedStyleWithID) {
				styles.removeSharedStyle(styles.sharedStyleWithID(layerStylesToRemove[i].objectID()));
			} else {
				styles.removeSharedStyle(layerStylesToRemove[i]);
			}
		}

		for (var i = 0; i < textStylesToRemove.length; i++) {
			var styles = context.document.documentData().layerTextStyles();

			if (styles.sharedStyleWithID) {
				styles.removeSharedStyle(styles.sharedStyleWithID(textStylesToRemove[i].objectID()));
			} else {
				styles.removeSharedStyle(textStylesToRemove[i]);
			}
		}

		context.document.reloadInspector();

		context.document.showMessage(layerStylesToRemove.length + " layer styles, and " + textStylesToRemove.length + " text styles were removed");

		if (!debugMode) googleAnalytics(context,"remove","run");
	} else return false;
}

var report = function(context) {
	openUrl("https://github.com/sonburn/unused-style-remover/issues/new");

	if (!debugMode) googleAnalytics(context,"report","report");
}

var plugins = function(context) {
	openUrl("https://sonburn.github.io/");

	if (!debugMode) googleAnalytics(context,"plugins","plugins");
}

var donate = function(context) {
	openUrl("https://www.paypal.me/sonburn");

	if (!debugMode) googleAnalytics(context,"donate","donate");
}

function createBoldLabel(text,size,frame) {
	var label = NSTextField.alloc().initWithFrame(frame);

	label.setStringValue(text);
	label.setFont(NSFont.boldSystemFontOfSize(size));
	label.setBezeled(0);
	label.setDrawsBackground(0);
	label.setEditable(0);
	label.setSelectable(0);

	return label;
}

function createCheckbox(item,state,frame) {
	var checkbox = NSButton.alloc().initWithFrame(frame),
		state = (state == false) ? NSOffState : NSOnState;

	checkbox.setButtonType(NSSwitchButton);
	checkbox.setBezelStyle(0);
	checkbox.setTitle(item.name);
	checkbox.setTag(item.value);
	checkbox.setState(state);

	return checkbox;
}

function createContentView(frame) {
	var view = NSView.alloc().initWithFrame(frame);

	view.setFlipped(1);

	return view;
}

function createScrollView(frame) {
	var view = NSScrollView.alloc().initWithFrame(frame);

	view.setHasVerticalScroller(1);

	return view;
}

function getUnusedStyles(type) {
	var documentData = MSDocument.currentDocument().documentData();
	var unusedStyles = NSMutableArray.array();
	var styles = (type == 0) ? documentData.layerStyles().objects() : documentData.layerTextStyles().objects();

	styles.forEach(function(style) {
		var styles = style.allInstances();

		if (!styles.length) {
			unusedStyles.addObject(style);
		}
	});

	var sortByName = NSSortDescriptor.sortDescriptorWithKey_ascending("name",1);

	return unusedStyles.sortedArrayUsingDescriptors([sortByName]);
}

function googleAnalytics(context,category,action,label,value) {
	var trackingID = "UA-118988821-1",
		uuidKey = "google.analytics.uuid",
		uuid = NSUserDefaults.standardUserDefaults().objectForKey(uuidKey);

	if (!uuid) {
		uuid = NSUUID.UUID().UUIDString();
		NSUserDefaults.standardUserDefaults().setObject_forKey(uuid,uuidKey);
	}

	var url = "https://www.google-analytics.com/collect?v=1";
	// Tracking ID
	url += "&tid=" + trackingID;
	// Source
	url += "&ds=sketch" + MSApplicationMetadata.metadata().appVersion;
	// Client ID
	url += "&cid=" + uuid;
	// pageview, screenview, event, transaction, item, social, exception, timing
	url += "&t=event";
	// App Name
	url += "&an=" + encodeURI(context.plugin.name());
	// App ID
	url += "&aid=" + context.plugin.identifier();
	// App Version
	url += "&av=" + context.plugin.version();
	// Event category
	url += "&ec=" + encodeURI(category);
	// Event action
	url += "&ea=" + encodeURI(action);
	// Event label
	if (label) {
		url += "&el=" + encodeURI(label);
	}
	// Event value
	if (value) {
		url += "&ev=" + encodeURI(value);
	}

	var session = NSURLSession.sharedSession(),
		task = session.dataTaskWithURL(NSURL.URLWithString(NSString.stringWithString(url)));

	task.resume();
}

function openUrl(url) {
	NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
}
