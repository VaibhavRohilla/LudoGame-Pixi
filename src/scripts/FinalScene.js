import * as PIXI from "pixi.js";
import {  config } from "./appConfig";
import { DebugText } from "./DebugText";
import { GameEndStates, Globals } from "./Globals";
import { InstantReconnectScene } from "./InstantReconnectScene";
import { TextLabel } from "./TextLabel";

export class FinalScene {
    constructor(textToShow = null, alongWithButton = false, btnType=2) {
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

        const text = new DebugText("You've been disconnected", this.textBox.x, this.textBox.y, "#fff", 48, "Luckiest Guy");
        text.style.stroke = 0x081228;
        text.style.letterSpacing = 2;
        text.style.strokeThickness = 5;
        text.style.align = "center";
        text.style.wordWrap = true; 
        text.style.wordWrapWidth = this.textBox.width * 0.9;


        // textToShow = "Could not join the table : insufficient balance!";

        


        if(textToShow != null)
            text.text = textToShow;


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


        if(alongWithButton)
        {

            setTimeout(() => {
            const buttonBox = new PIXI.Sprite(Globals.resources.promptBox.texture);
            buttonBox.anchor.set(0.5, 0.5);
            buttonBox.scale.set(0.3);
            buttonBox.x = this.textBox.x;
            buttonBox.y = this.textBox.y + this.textBox.height/2;
            this.container.addChild(buttonBox);

            if(btnType===1){
                const text = new TextLabel(0, 0, 0.5, "Try Again", 92, "#89ffaa", "Luckiest Guy");
                buttonBox.addChild(text);
                buttonBox.interactive = true;
                buttonBox.on("pointerdown", () => {
                 this.onButtonClicked(); 
                });
            }else  if(btnType===2){
                const text = new TextLabel(0, 0, 0.5, "Exit", 92, "#89ffaa", "Luckiest Guy");
                buttonBox.addChild(text);
                buttonBox.interactive = true;
                buttonBox.on("pointerdown", () => {
                 this.onExit(); 
                });
            }

            }, 1000); // setTimeout because sometimes player need minimum 2secs to be removed from loadbalancer
            
        }



        
    

        // setTimeout(() => {
        //     location.reload();
        // },  3000);
    }

    onExit(){
        Globals.gameEndState = GameEndStates.LEFT
            try {
                if (JSBridge != undefined) {
                    
                    JSBridge.sendMessageToNative(JSON.stringify({"t" :"Exit"}));
                }
            } catch {
                console.log("JS Bridge Not Found!");
            }

            // ConvertToCashBalance(+Globals.connectionData[0]);

            if(Globals.socket && Globals.socket.socket)
            {
                console.log("Closing socket in FinalScene");
                Globals.socket.socket.close();
            }
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

    onButtonClicked()
    {
		Globals.scene.start(new InstantReconnectScene(true))
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