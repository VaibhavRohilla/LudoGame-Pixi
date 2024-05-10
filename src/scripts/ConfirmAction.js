import { Sprite } from "pixi.js";
import { Globals } from "./Globals";
import { TextLabel } from "./TextLabel";
import { config } from "./appConfig";

export class ConfirmAction extends Sprite
{

    constructor(textToShow , callBackResponse, toggle )
    {
        super(Globals.resources.promptBg.texture)
        this.interactive = true
        this.zIndex = 100
        this.width = config.logicalWidth
        this.height = config.logicalHeight
        this.callBackResponse = callBackResponse
        this.toggle = toggle

        // Globals.soundResources.popup.play();
        this.promptBox = new Sprite(Globals.resources.promptBox.texture);
        this.promptBox.anchor.set(0.5);
        this.promptBox.x = config.logicalWidth*0.8
        this.promptBox.y = config.logicalHeight*0.7 

        const label = new TextLabel(0, -50, 0.5, textToShow, 44, 0xffffff);
        label.style.align = "center";
        label.style.wordWrap = true;
        label.style.wordWrapWidth = this.promptBox.width - 50;
    

        this.addChild(this.promptBox);
        this.promptBox.addChild(label);

        
        this.addConfirmButton();
    }

    addConfirmButton()
    {
        const yesBtn = new Sprite(Globals.resources.yesBtn.texture);
        yesBtn.anchor.set(0.5);
        yesBtn.x = -100;
        yesBtn.y =  50;
        yesBtn.interactive = true;
        yesBtn.once("pointerdown", () => {
            this.callBackResponse();
            this.toggle()
            this.destroy();
        });
        
        const noBtn = new Sprite(Globals.resources.noBtn.texture);
        noBtn.anchor.set(0.5);
        noBtn.x = 100;
        noBtn.y = 50;
        noBtn.interactive = true;
        noBtn.once("pointerdown", () => {
            this.toggle()
            this.destroy();
        });

        this.promptBox.addChild(yesBtn);
        this.promptBox.addChild(noBtn);
    }
   
}