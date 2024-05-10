

import { App } from "./App";
import { Globals } from "./Globals";
import { Socket } from "./Socket";
import {Loader} from "pixi.js";
import {Spine, SpineParser } from "pixi-spine";



//SpineParser.registerLoaderPlugin();

const app = new App();
app.run();
app.addOrientationCheck();


global.updateFromNative = function updateFromNative(message)
{
    const jsonData = JSON.parse(message);

    // Globals.socket = new Socket(jsonData.token.playerID, jsonData.username,jsonData.entryFee, jsonData.token.tableTypeID, jsonData.useravatar);
    Globals.socket = new Socket({
        playerId : parseInt(jsonData.token.playerID),
        pName : jsonData.username,
        pImage : jsonData.useravatar,
        tableTypeID :  parseInt(jsonData.token.tableTypeID),
        entryFee : parseFloat(jsonData.entryFee),
    })

    Globals.emitter.Call("socketConnection", {});
}

// const apiURL = "https://loadbalancer.cap.gamesapp.co/api/getPlayerId";



//Sample Request
// updateFromNative("{\"token\":{\"playerID\":\"230775\",\"tableTypeID\":\"4\"},\"username\":\"Player1\",\"entryFee\":\"50.00\",\"useravatar\":\"https://cccdn.b-cdn.net/1584464368856.png\"}");


// const msgObj = {
//     "token" : {
//         "playerID" : "230773",
//         "tableTypeID" : "4"
//     },
//     "username" : "Player 1",
//     "entryFee" : "50.00",
//     "useravatar" : "https://cccdn.b-cdn.net/1584464368856.png",
// }

// console.log(JSON.stringify(msgObj)+ "")

//Globals.socket = new Socket();





