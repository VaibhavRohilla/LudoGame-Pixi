import * as PIXI from "pixi.js";
import { config } from "./appConfig";
import { DebugText } from "./DebugText";
import { Globals } from "./Globals";

export class GridPoint extends PIXI.DisplayObject
{
    constructor(id, x, y)
    {
        super();
        this.x = x;
        this.y = y;
        this.pointID = id;
        this.pawnsOnIt = [];
        this.renderable = false;
        this.logPosition();

        Globals.gridPoints[this.pointID] = this;

    }

    render()
    {
        
    }

    reached(pawn)
    {

        if(this.pawnsOnIt.indexOf(pawn) == -1)
        {
            this.pawnsOnIt.push(pawn);

            if(this.pawnsOnIt.length > 1)
            {
               this.resemablePawns();
            } else if (this.pawnsOnIt.length == 1)
            {
                pawn.squeeze(this.globalPosition, 1);
            }
        }   
    }

    leave(pawn)
    {
        
        this.pawnsOnIt = this.pawnsOnIt.filter(item => item !== pawn);
        
        if(this.pawnsOnIt.length > 1)
        {
            this.resemablePawns();
        } else if (this.pawnsOnIt.length == 1)
        {
            // console.log("reseting " + this.pawnsOnIt[0].pawnID);
            this.pawnsOnIt[0].reset(true);
        }
        pawn.reset();

    }

    resemablePawns()
    {
        // console.log("resemablePawns", this.pawnsOnIt.length, this.pointID);
        for (let i = 0; i < this.pawnsOnIt.length; i++) {
            const pawn = this.pawnsOnIt[i];
            // console.log("resemablePawns", pawn.pawnID);
            switch(i)
            {
                case 0:
                    pawn.squeeze(this.leftX, 2);
                    break;
                case 1: 
                    pawn.squeeze(this.rightX, 2);
                    break;
                case 2: 
                    pawn.squeeze(this.downY, 3);
                    break;
                case 3:
                    pawn.squeeze(this.upY, 1);
                    break;
            }
        }
    }

    get leftX()
    {
        return new PIXI.Point(this.globalPosition.x - 5, this.globalPosition.y);
    }

    get rightX()
    {
        return new PIXI.Point(this.globalPosition.x + 5, this.globalPosition.y);
    }

    get upY()
    {
        return new PIXI.Point(this.globalPosition.x, this.globalPosition.y - 5);
    }

    get downY()
    {
        return new PIXI.Point(this.globalPosition.x, this.globalPosition.y + 6);
    }
    
    get globalPosition()
    {
        let point = new PIXI.Point();
        this.getGlobalPosition(point);
        return point;
    }

    logPosition()
    {
        
        this.debugText = new DebugText(this.pointID, this.x, this.y);
    }
}