var cb = require('clipboardy');

var Pusher = require('pusher');

var PusherClient = require('pusher-js/node');

// TODO: Change these values from https://pusher.com/
// I might delete the app that uses these creds.
var pusherSettings = {
  appId: '328790',
  key: '1a9b979527ac8ba54c3a',
  secret: '6f16b050243514c295fe',
  cluster: 'ap1',
  encrypted: true
};

var channelSettings = {
  name: 'cb-12345-abcd', // this should be unique to your session and anyone wants to access your clipboard
  event: 'copied'
};

var pusher = new Pusher(pusherSettings);

// initialize clipboard value
var clipboard = "";

// watch changes to clipboard
function listenClipboard() {
  var new_clip = cb.readSync();

  // only trigger handler if there are changes to clipboard
  if (new_clip !== clipboard) {
    clipboard = new_clip;
    handleClipboardChange(clipboard);
  }
  setTimeout(listenClipboard, 100);
}

// poll watcher
listenClipboard();

// clipboard change handler
function handleClipboardChange(clipboard) {
  console.log('local', clipboard);

  // Pusher publish
  pusher.trigger(channelSettings.name, channelSettings.event, {
    "message": clipboard
  });
}

// initialize Pusher client
var pusher_client = new PusherClient(pusherSettings.key, pusherSettings);

// Subscribe to unique channel, this translates to session of which the clipboard
// is globally available.
var channel = pusher_client.subscribe(channelSettings.name);

// listen to new clipboard values from Pusher sub
channel.bind(channelSettings.event, function(data) {
  console.log('remote', data.message);
  // write data to clipboard
  cb.writeSync(data.message);
});
