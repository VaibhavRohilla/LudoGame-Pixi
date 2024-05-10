import * as PIXI from "pixi.js";
import TWEEN from "@tweenjs/tween.js";
import { Loader } from "./Loader";
import { MainScene } from "./MainScene";

import { APIURL, Globals } from "./Globals";
import { SceneManager } from "./SceneManager";
import { config } from "./appConfig";
import { GameScene } from "./GameScene";
import { MyEmitter } from "./MyEmitter";
import { GameEndScene } from "./GameEndScene";
import { FinalScene } from "./FinalScene";
import { ReconnectScene } from "./ReconnectScene";
import { InstantReconnectScene } from "./InstantReconnectScene";
import {getIdCall} from "./apiCalls";


export class App {
	run() {
		// create canvas
		PIXI.settings.RESOLUTION = window.devicePixelRatio || 1;

		console.log(PIXI.settings.RESOLUTION)
		console.log(window.innerWidth + "x" + window.innerHeight)
		let logicalWidth = 720
		let logicalHeight = 1280

		//{width : (window.innerWidth > gameConfig.maxWidth) ? gameConfig.maxWidth : window.innerWidth, height : window.innerHeight}
		this.app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight, antialias:true });
		document.body.appendChild(this.app.view);
		const scaleFactor = Math.min(
			window.innerWidth / logicalWidth,
			window.innerHeight / logicalHeight
		);
			
		config.scaleFactor = scaleFactor
		console.log("scale " + scaleFactor)
		const newWidth = Math.ceil(logicalWidth * scaleFactor);
		const newHeight = Math.ceil(logicalHeight * scaleFactor);

		//this.app.renderer.view.style.width = `${newWidth}px`;
		//this.app.renderer.view.style.height = `${newHeight}px`;
		this.app.renderer.view.style.width = `${window.innerWidth}px`;
		this.app.renderer.view.style.height = `${window.innerHeight}px`;
		this.app.renderer.resize(window.innerWidth, window.innerHeight);
		console.log(window.innerHeight)
		console.log(this.app.renderer.view);

		
		window.onresize = (e) => {

			const scaleFactor = Math.min(
				window.innerWidth / logicalWidth,
				window.innerHeight / logicalHeight
			);
				
			config.scaleFactor = scaleFactor

			this.app.renderer.view.style.width = `${window.innerWidth}px`;
			this.app.renderer.view.style.height = `${window.innerHeight}px`;
			this.app.renderer.resize(window.innerWidth, window.innerHeight);

			Globals.scene.resize();

		};



		this.addCommonEventListners();

		Globals.emitter = new MyEmitter();


		Globals.scene = new SceneManager();
		this.app.stage.addChild(Globals.scene.container);
		this.app.ticker.add(dt => Globals.scene.update(dt));

		// load sprites
		const loaderContainer = new PIXI.Container();
		this.app.stage.addChild(loaderContainer);

		//loaderContainer.scale.set(scaleFactor);

		this.loader = new Loader(this.app.loader, loaderContainer);

		//  this.pushSampleData();

		this.loader.preload().then(() => {
			setTimeout(() => {
				loaderContainer.destroy();

				// let boardData ={"1":[],"2":[],"3":["Y2"],"4":["Y4"],"5":[],"6":["Y3"],"7":[],"8":[],"9":[],"10":[],"11":[],"12":[],"13":[],"14":[],"15":[],"16":[],"17":[],"18":[],"19":[],"20":[],"21":[],"22":[],"23":[],"24":[],"25":[],"26":[],"27":[],"28":[],"29":[],"30":[],"31":["R4"],"32":[],"33":["R3"],"34":[],"35":[],"36":[],"37":[],"38":[],"39":[],"40":[],"41":[],"42":[],"43":[],"44":[],"45":[],"46":[],"47":[],"48":[],"49":[],"50":[],"51":[],"52":[],"53":[],"54":[],"55":[],"56":[],"57":[],"58":[],"59":[],"60":[],"61":[],"62":[],"63":[],"64":[],"65":[],"66":[],"67":[],"68":[],"69":[],"70":[],"71":[],"72":[],"73":[],"74":[],"75":[],"76":[]};


				Globals.scene.start(new MainScene());
				// Globals.scene.start(new FinalScene("Starting table game failed"));
				// Globals.scene.start(new GameScene(boardData));
				//    Globals.scene.start(new GameEndScene());
				// Globals.scene.start(new ReconnectScene())
				// Globals.scene.start(new InstantReconnectScene());


				try {
					if (JSBridge != undefined) {

						JSBridge.showMessageInNative("loadSuccess");
					}
				} catch {
					console.log("JS Bridge Not Found!");
				}


				// const apiURL = "https://loadbalancer.cap.gamesapp.co/api/getPlayerID";

				// getIdCall((data) => {
				// 	if(data) {
				// 		updateFromNative("{\"token\":{\"playerID\":\""+data+"\",\"tableTypeID\":\"2\"},\"username\":\"Player"+data+"\",\"entryFee\":\"10.00\",\"useravatar\":\"https://cccdn.b-cdn.net/1584464368856.png\"}");
				// 	}
				// })

				// fetch(APIURL+"/getPlayerID").then(response => response.json()).then(data => {
				// 	console.log(data);

				// 	if(data.code == 200)
				// 	{
				// 		updateFromNative("{\"token\":{\"playerID\":\""+data.result+"\",\"tableTypeID\":\"4\"},\"username\":\"Player1\",\"entryFee\":\"50.00\",\"useravatar\":\"https://cccdn.b-cdn.net/1584464368856.png\"}"); 
				// 	}
				// });


			}, 1000);


		});

		this.loader.preloadSounds();

	}

	pushSampleData() {
		Globals.gameData.plId = 0;
		for (let i = 0; i < 4; i++) {

			Globals.gameData.players[i] = {
				balance: "12",
				plId: i,
				pName: "Player " + i,
				pImage: "https://cccdn.b-cdn.net/1584464368856.png"
			};
		}

		Globals.gameData.currentTurn = 0;



	}

	addOrientationCheck() {
		if (PIXI.utils.isMobile) {
			// console.log(window.orientation);



			window.addEventListener("orientationchange", function() {
				if (window.orientation == 90 || window.orientation == -90) {
					Globals.scene.drawImageAbove();
				} else {
					Globals.scene.removeImageAbove();
				}
			});
		}
	}

	addCommonEventListners()
	{
		window.document.addEventListener("visibilitychange", () => {
			if (document.hidden) {
				Globals.emitter.Call("windowNotVisible")
			  }else
            {
                Globals.emitter.Call("windowVisible");
            }
        }); 
	}

}