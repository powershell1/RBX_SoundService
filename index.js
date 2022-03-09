require("dotenv").config();
const express = require("express");
const expressws = require("express-ws");
const uuid = require("uuid");

const app = express();
expressws(app);

var port = process.env["PORT"] || 3000;
var connectserverobject = {};

function AddServer(placeid, gameid, jobid, secretkey) {
    var newuuidv4 = uuid.v4();
    if (connectserverobject[placeid] === undefined) {
        connectserverobject[placeid] = new Map();
        connectserverobject[placeid].set(gameid, {
            idjob: jobid,
            keysecret: secretkey,
            roomid: newuuidv4,
            timeout: setTimeout(function () {
                var currentserver;
                connectserverobject[placeid].forEach(function (value, key) {
                    if (value.idjob === jobid && value.keysecret === secretkey) {
                        currentserver = key;
                    };
                });
                delete currentserver
            }, 30000)
        });
        return newuuidv4;
    } else {
        connectserverobject[placeid].set(gameid, {
            idjob: jobid,
            keysecret: secretkey,
            roomid: newuuidv4,
            timeout: setTimeout(function () {
                var currentserver;
                console.log(connectserverobject[placeid].get(gameid));
                connectserverobject[placeid].forEach(function (value, key) {
                    if (value.idjob === jobid && value.keysecret === secretkey) {
                        currentserver = key;
                    };
                });
                delete currentserver
            }, 30000)
        });
        return newuuidv4;
    };
};

function IdleReplace(placeid, gameid, jobid, secretkey) {
    if (connectserverobject[placeid] !== undefined) {
        var currentserver;
        connectserverobject[placeid].get(gameid).forEach(function (value, key) {
            if (value.idjob === jobid && value.keysecret === secretkey) {
                currentserver = key;
            };
        });
        clearTimeout(currentserver.timeout);
        currentserver.timeout = setTimeout(function () {
            var currentserver;
            connectserverobject[placeid].get(gameid).forEach(function (value, key) {
                if (value.idjob === jobid && value.keysecret === secretkey) {
                    currentserver = key;
                };
            });
            delete currentserver
        }, 30000);
    };
}

app.get("/request-api/:placeid/:gameid/:jobid/:secretkey/", (req, res) => {
    var reutrnaddserver = AddServer(req.params.placeid, req.params.gameid, req.params.jobid, req.params.secretkey);
    res.send(req.params.secretkey + ":setup_success:roomuuid?=" + reutrnaddserver);
});

app.get("/update-api/:placeid/:gameid/:jobid/:secretkey/", (req, res) => {
    IdleReplace(req.params.placeid, req.params.gameid, req.params.jobid, req.params.secretkey);
    res.send(req.params.secretkey + ":update_success");
})

app.listen(port, () => {
    console.log("Server is started!");
});