import * as PIXI from "pixi.js";
import { Globals } from "./Globals";
import TWEEN from "@tweenjs/tween.js";
import { GameScene } from "./GameScene";
import { Background } from "./Background";
import { appConfig, gameConfig } from "./appConfig";
export class MatchmakingScene {
    constructor() {
        this.container = new PIXI.Container();
        // Globals.resources.music.sound.play({
        //     loop: true,
        //     volume: 0.2
        // });

        this.createBackground();
        this.createLogo();
        this.createPlayBtn();
        
        Globals.emitter.once("gameStart", () => {
            this.logoTween.stop();
            Globals.scene.start(new GameScene());
        });
    }

    createBackground()
    {
        this.background = new Background(Globals.resources.background.texture, Globals.resources.bgFx1.texture);
        this.container.addChild(this.background.container);
    }

    createLogo()
    {
        this.logo = new PIXI.Sprite(Globals.resources.logo.texture);
        this.logo.scale.set(gameConfig.widthRatio);
        this.logo.anchor.set(0.5);
        this.logo.x = appConfig.width/2;
        this.logo.y = appConfig.height/2;

        this.logo.interactive = true;
        
        this.logoTween = new TWEEN.Tween(this.logo)
                                    .to({angle : 360 * 8 }, 4000)
                                    .repeat(10)
                                    .start();
        

        this.container.addChild(this.logo);
    }

    createPlayBtn()
    {

    }

    update(dt) {
        
    }

    clearValues() {
		
	}
}