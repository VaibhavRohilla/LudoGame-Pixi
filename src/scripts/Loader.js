import * as PIXI from 'pixi.js';
import { animationData, fontData, LoaderConfig, LoaderSoundConfig, preloaderConfig } from "./LoaderConfig";
import { Globals } from "./Globals";
import {config } from './appConfig';
import {DebugText} from './DebugText';
import {Howl, Howler} from 'howler';
import "pixi-spine";
import { Spine } from '@pixi-spine/runtime-3.8';
import * as FFC from 'fontfaceobserver';

export class Loader {
    constructor(loader, container) {
        this.loader = loader;
        
        
        this.createLoadingPage(container);
        
        this.resources = LoaderConfig;

        this.loader.add("spineAnim", "./animation/Ludo.json",
        {
            crossOriginIsolated: true
        });

        // const configAnim = require("../animation/Ludo.json");
        // this.loader.add(configAnim);
        
        // .load((loader, res) => {
        //     let spine = new Spine(res.spineAnim.spineData);

        //     console.log(spine);
        // });
    }

    createLoadingPage(container)
    {
        //background
        this.background = new PIXI.Sprite(PIXI.Texture.from('./background.png'));
        this.background.width = window.innerWidth;
        this.background.height = window.innerHeight;
        container.addChild(this.background);


        //loaderbar
        this.loaderBarContainer = new PIXI.Container();

        const logo = PIXI.Sprite.from('./Logo.png');
        
        logo.anchor.set(0.5, 1);
        logo.x = config.logicalWidth/2;
        logo.y = config.logicalHeight/2;

        const progressBox = new PIXI.Graphics()
        const progressBar = new PIXI.Graphics();

        const boxData = {
            width : (config.logicalWidth * 0.6),
            height : 20,
            x : config.logicalWidth/2,
            y : config.logicalHeight/2
        };
        

        progressBox.beginFill(0x3c3c3c, 0.8);
        progressBox.drawRect(boxData.x - boxData.width/2, boxData.y, boxData.width, boxData.height);
        progressBox.endFill();

        const progressText = new DebugText("0%", 0, 0, '#FFF');
        progressText.anchor.set(1, 0);
        progressText.position = new PIXI.Point(boxData.x + boxData.width/2, boxData.y + boxData.height);
        
        this.loaderBarContainer.addChild(logo);
        this.loaderBarContainer.addChild(progressBox);
        this.loaderBarContainer.addChild(progressBar);
        this.loaderBarContainer.addChild(progressText);

        this.loaderBarContainer.scale.set(config.scaleFactor);
        
        this.loaderBarContainer.x = config.leftX;
        this.loaderBarContainer.y = config.topY;

        container.addChild(this.loaderBarContainer);
        this.loader.onProgress.add((e) => {
            let value = e.progress / 100;
            progressBar.clear();
            progressBar.beginFill(0xffffff, 1);
            progressBar.drawRect(boxData.x - (boxData.width * 0.49), boxData.y + boxData.height/4, boxData.width * 0.98 * value, boxData.height/2);
            progressText.text = `${Math.ceil(e.progress)}%`;
            progressBar.endFill();
        });

        this.loader.onComplete.add((e) => {
            progressBar.clear();
            progressBar.beginFill(0xffffff, 1);
            progressBar.drawRect(boxData.x - (boxData.width * 0.49), boxData.y + boxData.height/4, boxData.width * 0.98, boxData.height/2);
            progressBar.endFill();
        });
    }



    preload() {
        return new Promise(resolve => {
            for (let key in this.resources) {
                this.loader.add(key, this.resources[key]);
            }

            // for(let key in animationData)
            // {
            //     this.loader.add(key, this.resources[key]);
            // }
    
            this.loader.load((loader, res) => {
                Globals.resources = res;  

                const fontArray =[];
                fontData.forEach(fontName => {
                    fontArray.push(new FFC(fontName).load());
                });

                Promise.all(fontArray).then(() => {
                    resolve();
                });

              
            });
        });
    }

    preloadSounds()
    {
        for (let key in LoaderSoundConfig)
        {
            const sound = new Howl({
                src : [LoaderSoundConfig[key]]
            });

            sound.on("load",() => {
                Globals.soundResources[key] = sound;
            }, this);
        }
    }

    

}