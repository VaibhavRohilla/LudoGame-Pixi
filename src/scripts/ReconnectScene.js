import * as PIXI from "pixi.js";
import {  config } from "./appConfig";
import { DebugText } from "./DebugText";
import { GameEndStates, Globals } from "./Globals";
import { ConfirmAction } from "./ConfirmAction";
import { Socket } from "./Socket";
import { TextLabel } from "./TextLabel";
import { GameScene } from "./GameScene";
import { MainScene } from "./MainScene";
import { FinalScene } from "./FinalScene";

export class ReconnectScene {
    constructor() {

        if(Globals.socket && Globals.socket.socket)
        {
            console.log("Closing socket with reconnect scene");
            Globals.socket.socket.close();
        }

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

        this.addText(`Waiting for networks...`)
        this.addButton()

        setTimeout(this.pingCheckConnection.bind(this), 1000)
    }

    pingCheckConnection()
    {
        if(window.navigator.onLine)
        {
            this.startTimer();
        } else
        {
            console.log("not online")
            setTimeout(this.pingCheckConnection.bind(this), 1000);
        }
    }

    startTimer(){
        this.text.updateLabelText("Reconnect Now", 0xffffff);
        this.setActive();
        console.log("Reconnecting----Now-----")
    }

    addText(string){
        this.text = new TextLabel(this.textBox.x,this.textBox.y,0.5, string,48,0xffffff,"Luckiest Guy");
        this.text.style.stroke = 0x081228;
        this.text.style.letterSpacing = 2;
        this.text.style.strokeThickness = 5;
        this.text.style.align = "center";
        this.text.style.wordWrap = true;
        this.text.style.wordWrapWidth = this.textBox.width * 0.9;

        this.container.addChild(this.text);
    }

    addButton(){
        this.promptBox = new PIXI.Sprite(Globals.resources.promptBox.texture);
        this.promptBox.anchor.set(0.5);
        this.promptBox.scale.set(0.4)
        this.promptBox.cursor = "pointer";
        this.promptBox.x = config.logicalWidth/2 ;
        this.promptBox.y = config.logicalHeight/2+ this.textBox.height*0.5;


        this.textReconnect = new TextLabel(0,0,0.5, "Reconnect",72,0x005601,"Luckiest Guy");
        this.textReconnect.style.align = "center";
        this.textReconnect.style.wordWrap = true;
        this.textReconnect.style.wordWrapWidth = this.promptBox.width - 50;

        this.promptBox.addChild(this.textReconnect);
        this.container.addChild(this.promptBox)
    }

    setActive(){
        this.textReconnect.updateLabelText("Reconnect", 0x00ff00)
        this.promptBox.interactive=true
        this.promptBox.once('pointerdown',()=>{this.onConfirm()})
    }

    onConfirm(){
        console.log("yes reconnect")

        console.log(Globals.connectionData);

        if(Globals.connectionData && Globals.connectionData.playerId !== -1) {
            Globals.socket = new Socket(Globals.connectionData)
        }else{
            Globals.scene.start(new FinalScene("Unable to Join Game!\nPlease join new game.",true,2));
        }
        this.promptBox.interactive = false
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

    resize()
    {
        this.container.x = config.leftX;
        this.container.y = config.topY;
        this.container.scale.set(config.scaleFactor);
        this.fullbg.width = window.innerWidth;
        this.fullbg.height = window.innerHeight;
    }

    recievedMessage(msgType, msgParams) {
        if(msgType === "rejoined")
        {
            Globals.gameData.currentTurn = msgParams.turn;
            Globals.scene.start(new GameScene(msgParams.board, msgParams.stats));
        }else if(msgType === "joined")
        {
            Globals.scene.start(new MainScene(false, msgParams))
        }
    }

    clearValues() {
		
	}

}