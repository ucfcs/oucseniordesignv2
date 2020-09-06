var express = require("express"),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  path = require("path"),
  http = require("http"),
  webSocket = require("ws"),
  socketIO = require("socket.io"),
  url = require("url");

var app = express(),
  streamServer = http.createServer(app),
  channels = {},
  viewers = {},
  port = process.env.PORT || 3000;

function addValueToList(map, key, value) {
  //if the list is already created for the "key", then uses it
  //else creates new list for the "key" to store multiple values in it.
  map[key] = map[key] || [];
  map[key].push(value);
}

//sanity check

function createChannel(path) {
  tmpServer = new webSocket.Server({ noServer: true });
    tmpServer.on("connection", function connection(ws) {
      addValueToList(viewers, path, ws);
  });
  channels[path] = tmpServer
}

function initChannels() {
  createChannel("/stream1");
  createChannel("/stream2");
}

function route(viewerServer) {
  var router = express.Router();

  router.route("/:id").post((request, response) => {
    var locationID = request.params.id;
    console.log("location " + locationID + " connected");
    request.on("data", function (data) {
      pushData(locationID, data);
    });
  });
  return router;
}

function init_routes() {
  viewer = route(viewerServer);
  app.use("/cloudtrackinglivestream", viewer);
}

function pushData (toWho, data) {
  if (!viewers[toWho]) {
    return
  }
  viewers[toWho].foreach(function each(client) {
    if (client.readyState === webSocket.OPEN) {
      client.send(data);
    }
  });
};

function init() {
  /// todo: viewers = { }

  // viewerServer.on("connection", function connection(ws, req) {
  //   const location = url.parse(req.url, true);
  //   addValueToList(location.pathname.substring(1), ws);
  // });

  streamServer.on("upgrade", (req, socket, head) => {
    const pathname = url.parse(req.url).pathname;
    viewSrv = channels[pathname]; // local scope pls
    if (!viewSrv)
      console.log(
        "[error] viewer tried to access invalid strm path " + pathname
      );

    viewSrv.handleUpgrade(req, socket, head, function done(ws) {
      viewSrv.emit("connection", ws, request);
    });
  });

  initChannels();
  init_routes();
  // Serve the static files from the React app
  app.use(express.static(path.join(__dirname, "Front_End/build")));
  // Handles any requests that don't match the ones above
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/Front_End/build/index.html"));
  });

  //const port = process.env.PORT || 3000;
  //app.listen(port);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  streamServer.listen(port);
  console.log("App is listening on port " + port);
}
init();
