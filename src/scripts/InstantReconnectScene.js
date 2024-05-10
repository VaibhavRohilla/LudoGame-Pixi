import * as PIXI from "pixi.js";
import {  config } from "./appConfig";
import { DebugText } from "./DebugText";
import { FinalScene } from "./FinalScene";
import { GameScene } from "./GameScene";
import { GameEndStates, Globals } from "./Globals";
import { MainScene } from "./MainScene";
import { Socket } from "./Socket";

export class InstantReconnectScene {
    constructor(shouldConnectInstant = false) {
        this.sceneContainer = new PIXI.Container();

        this.container = new PIXI.Container();
        this.container.x = config.leftX;
        this.container.y = config.topY;
        this.container.scale.set(config.scaleFactor);

        this.createBackground();
        
        this.sceneContainer.addChild(this.container);

        this.textBox = new PIXI.Graphics();
        this.textBox.beginFill(0xbdc8e3, 1);
        let w = 550 ; let h = 300;
        this.textBox.drawRoundedRect(-w/2, -h/2,w, h, 25);
        this.textBox.endFill();
        this.textBox.x = config.logicalWidth/2;
        this.textBox.y = config.logicalHeight/2;
        this.container.addChild(this.textBox);

        const text = new DebugText("", this.textBox.x, this.textBox.y, "#fff", 48, "Luckiest Guy");
        text.style.stroke = 0x081228;
        text.style.letterSpacing = 2;
        text.style.strokeThickness = 5;
        text.style.align = "center";
        text.style.wordWrap = true; 
        text.style.wordWrapWidth = this.textBox.width * 0.9;

    
        text.text = "Reconnecting...";


        // console.log(text.getBounds().height > this.textBox.height * 0.9);

        while(text.getBounds().height > this.textBox.height * 0.9)
        {
            text.style.fontSize *= 0.99;
        }

        this.container.addChild(text);

        if(text.width > config.logicalWidth)
        {
            text.style.fontSize *= config.logicalWidth/text.width  * 0.9;
        }
        // console.log("window back in focus")


        if(shouldConnectInstant)
        {
              Globals.gameEndState = GameEndStates.NONE;

            // console.log("%c" + "😀 Rejoiinging!!", "color: #0f00ff; font-size: 16px;");

            // Globals.socket = new Socket(...Globals.connectionData)
        }

        this.hasCalledWS = false;
    }

    resize()
    {
        //TODO : resize functionality

        this.container.x = config.leftX;
        this.container.y = config.topY;
        this.container.scale.set(config.scaleFactor);

        this.fullbg.width = window.innerWidth;
        this.fullbg.height = window.innerHeight;

    }

    recievedMessage(msgType, msgParams)
    {
        if (msgType === "rejoined")
		{
			Globals.gameData.currentTurn = msgParams.turn;
			
			Globals.scene.start(new GameScene(msgParams.board, msgParams.stats,msgParams.playerState, msgParams.rollDiceVal, msgParams.movableTokens ));
			
		}  else if(msgType === "joined")
        {   
            Globals.scene.start(new MainScene(false, msgParams))
        } else if(msgType === "windowVisible") {

            if(!this.hasCalledWS)
            {
                this.hasCalledWS = true;
                Globals.socket = new Socket(Globals.connectionData);
            }
        }
    }
    

    createBackground() {
		this.fullbg = new PIXI.Sprite(Globals.resources.gameBg.texture);
		this.fullbg.width = window.innerWidth;
		this.fullbg.height = window.innerHeight;
		this.sceneContainer.addChild(this.fullbg);

		this.bg = new PIXI.Sprite(Globals.resources.gameBg.texture);
		this.bg.width = config.logicalWidth;
		this.bg.height = config.logicalHeight;
		this.container.addChild(this.bg);
	}

    clearValues() {
		
	}


}