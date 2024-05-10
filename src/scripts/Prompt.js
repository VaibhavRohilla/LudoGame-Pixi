import * as PIXI from "pixi.js";
import { Globals } from "./Globals";
import TWEEN from "@tweenjs/tween.js";
import { DebugText } from "./DebugText";

export class Prompt
{
    constructor(text, position, size = "44", color = "#fff")
    {
        this.container = new PIXI.Container();
        

        this.createBackground();
        this.createForegroundText(text, size, color);

   
        console.log(position);
        this.finalPosition = new PIXI.Point(position.x, position.y);
        this.container.position = this.finalPosition // new PIXI.Point(this.finalPosition.x - this.container.width, this.finalPosition.y);

        console.log(this.container);

        // const fallBackTween = new TWEEN.Tween(this.container)
        //                     .to({x : this.finalPosition.x - this.container.width}, 100)
        //                     .onComplete()
        //                     .start();
            

        // const tween = new TWEEN.Tween(this.container)
        //             .to({x : this.finalPosition.x}, 300)
        //             .onComplete()
        //             .start();
    }


    createBackground()
    {
        this.background = new PIXI.Sprite(Globals.resources.promptBG.texture);
        this.background.anchor.set(0, 0.5);
        this.background.height = 60;
        this.container.addChild(this.background);
    }

    createForegroundText(text, size, color)
    {
        this.debugText  = new DebugText(text, 45, 0, color, size);
        this.debugText.anchor.set(0, 0.5);
        this.container.addChild(this.debugText);
    }
}