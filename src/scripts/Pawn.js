import * as PIXI from "pixi.js";
import { Globals } from "./Globals";
import TWEEN from "@tweenjs/tween.js";
import { config } from "./appConfig";

export class Pawn extends PIXI.Sprite
{
    constructor(id, textureId, ludoBoard)
    {
        
        super(Globals.resources[textureId].texture);
        this.pawnID = id;
        


        this.zIndex = 1;

        this.currentPointIndex = null;
        this.widthByHeightRatio = this.width / this.height;
        this.currentWidth = ludoBoard.container.height * 0.07 * this.widthByHeightRatio;
        this.currentHeight = ludoBoard.container.height * 0.07;
        // this.width = this.currentWidth;
        // this.height = this.currentHeight;

        this.anchor.set(0.5, 0.8);
        this.width = this.currentWidth * 0.8;
        this.height = this.currentHeight * 0.8;
        // this.on('pointerdown', () => {
        //     this.emit("pawnSelected", this.pawnID);
        // }, this);

        this.isRemoved = false;
        
    }

    get globalPosition()
    {
        let point = new PIXI.Point();

        this.getGlobalPosition(point);

        return point;
    }

    
    

    reset(setPos = false)
    {
        console.log("reset");
        //if(this.squeezeTween.isPlaying)
        if(this.squeezeTween)
        {
            this.squeezeTween.stop();
            this.squeezeTween = null;
        }

        // this.width = this.currentWidth;
        // this.height = this.currentHeight;
        this.zIndex = 1;
        this.anchor.set(0.5, 0.8);

        if(setPos)
        {
            // console.log("setPos", this.currentPointIndex);
            const point = Globals.gridPoints[this.currentPointIndex].globalPosition;
            point.x -= this.parent.x;
            point.y -= this.parent.y;

            point.x /= config.scaleFactor;
            point.y /= config.scaleFactor;

            this.x = point.x;
            this.y = point.y;
            // console.log("setPos", this.currentPointIndex, this.x, this.y);
        }

        this.indication.x = this.x;
    }

    

    squeeze(pos, zIndex)
    {
        if(this.squeezeTween && this.squeezeTween.isPlaying())
        {
            //stop
            this.squeezeTween.stop();
            this.squeezeTween = null;
        }

        // console.log("squeeze", this.pawnID);
        if(this.isRemoved) return;

        this.zIndex = zIndex;
        
        pos.x -= this.parent.x;
		pos.y -=  this.parent.y;

		pos.x /= config.scaleFactor;
		pos.y /= config.scaleFactor;

        this.squeezeTween =  new TWEEN.Tween(this)
                                .to({width: this.currentWidth * 0.8, height : this.currentHeight * 0.8, x : pos.x, y : pos.y}, 100)
                                .onComplete(() => {
                                    this.squeezeTween =  null;
                                    console.log("squeeze complete for " + this.pawnID);
                                })
                                .start();

        this.indication.x = pos.x;
    }

    setPointIndex(index)
    {

        console.log("setPointIndex", index);
        this.currentPointIndex =  index;
        const point = Globals.gridPoints[index].globalPosition;       

        this.x = point.x;
        this.y = point.y;

        this.x -= this.parent.x;
		this.y -=  this.parent.y;

		this.x /= config.scaleFactor;
		this.y /= config.scaleFactor;

        this.indication.position = new PIXI.Point(this.x, this.y);
    }

    

    reachedFinalPosition()
    {
        this.isMoving = false;
        Globals.gridPoints[this.currentPointIndex].reached(this);
        // if(this.currentPointIndex != null)
        //     Globals.gridPoints[this.currentPointIndex].left(this);
                // Globals.gridPoints[index].reached(this);
    }

    beginMoving()
    {
        Globals.gridPoints[this.currentPointIndex].leave(this);
    }
    

    move(pointIndex, bounceEffect= true, distance)
    {
        let tweenTime = 50 // deflaut time

        //max time 1 sec
        if(distance && distance > 20){
            tweenTime = 1000/distance
        }

        if(bounceEffect){
            tweenTime = 200
        }
        
        if(!this.isMoving)
        {
            this.isMoving = true;
            this.beginMoving();
        }

        return new Promise((resolve, reject )=> {
            
            const point = Globals.gridPoints[pointIndex].globalPosition;
            
            point.x -= this.parent.x;
            point.y -=  this.parent.y;

            point.x /= config.scaleFactor;
            point.y /= config.scaleFactor;

            this.moveTween =  new TWEEN.Tween(this)
                                .to({x: point.x, y : point.y}, tweenTime)
                                .easing(TWEEN.Easing.Back.In)
                                .onComplete(() => {
                                        this.setPointIndex(pointIndex);
                                        resolve();
                                })
                                .onStop(()=>{
                                    reject();
                                })
                                .start();

            if(bounceEffect)
            {
                
                this.bounceTween =  new TWEEN.Tween(this)
                .to({width: this.currentWidth * 1.3, height : this.currentHeight * 1.3}, 100)
                .yoyo(true)
                .easing(TWEEN.Easing.Back.In)
                .onComplete(() => {
                    this.width = this.currentWidth * 0.8;
                    this.height = this.currentHeight * 0.8;
                    if(Globals.debug.sound)
                        Globals.soundResources.click.play();
                })
                .repeat(1)
                .start();
            }                    
            
        });
    }

    setInteractive()
    {
        this.indication.renderable = true;
        //this.indication.x = globalPosition.x + (this.anchor.x - 0.5) * this.width;
        this.indicationActiveTween = new TWEEN.Tween(this.indication)
                                .to({width: this.indication.defaultWidth, height : this.indication.defaultHeight},250)
                                .easing(TWEEN.Easing.Back.In)
                                .onComplete(() => {
                                    this.indication.interactive = true;
                                })
                                .start();
    }

    removeInteractive()
    {
        this.indication.interactive = false;
        this.indicationDeactiveTween = new TWEEN.Tween(this.indication)
        .to({width: this.indication.defaultWidth * 0.1, height : this.indication.defaultHeight * 0.1},300)
        .easing(TWEEN.Easing.Back.In)
        .onComplete(() => {
            this.indication.renderable = false;
        })
        .start();
    }


    stopTweens()
    {
        if(this.moveTween != null && this.moveTween != undefined)
            this.moveTween.stop();
        if(this.bounceTween != null && this.bounceTween != undefined)
            this.bounceTween.stop();
        if(this.indicationActiveTween != null && this.indicationActiveTween != undefined)
            this.indicationActiveTween.stop();
        if(this.indicationDeactiveTween != null && this.indicationDeactiveTween != undefined)
            this.indicationDeactiveTween.stop();
    }
}