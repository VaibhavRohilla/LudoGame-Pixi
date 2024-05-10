
import * as PIXI from "pixi.js";
import { outerPath, starsPosition } from "./boardConfig";
import { Globals } from "./Globals";
import { GridPoint } from "./GridPoint";



export class LudoBoard
{
    constructor(x,y)
    {
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;

        this.container.sortableChildren = true;

        this.createBoardSprite();
        
        this.createGrid();

        this.addStars();
        
        this.container.scale.set(0.66);    

        
    }

    rotateBoard(angleToRotateTo)
    {
        this.container.angle = angleToRotateTo;

        this.stars.forEach(star => {
            star.angle = -angleToRotateTo;
        });

    }

    createBoardSprite(angleToRotateTo)
    {
        const boardSprite = new PIXI.Sprite(Globals.resources.board1.texture);
        boardSprite.anchor.set(0.5);
        
        

        this.container.addChild(boardSprite);
    }

    createGrid()
    {
        let x = -462;
        let y = -462;

        outerPath.forEach(arrayElement => {
            y = -462;
            arrayElement.forEach(element => {
                if(element != 0)
                {
                    this.createGridPoint(element, x, y);
                }
                y+=66;
            });
            x+=66;
        });
    }

    addStars()
    {

        this.stars = [];

        starsPosition.forEach(element => {
        const houseStar = new PIXI.Sprite(Globals.resources.houseStar.texture);
        const laneStar = new PIXI.Sprite(Globals.resources.laneStar.texture);
        houseStar.anchor.set(0.5);
        laneStar.anchor.set(0.5);
        houseStar.scale.set(0.9);
        laneStar.scale.set(0.9);

        houseStar.position = Globals.gridPoints[element.housePosition];
        laneStar.position = Globals.gridPoints[element.lanePosition];

        this.container.addChild(houseStar);
        this.container.addChild(laneStar);

        this.stars.push(houseStar);
        this.stars.push(laneStar);
		});
    }

    createGridPoint(id, xPos, yPos)
    {
        const point = new GridPoint(id, xPos, yPos);
        this.container.addChild(point);
        // this.container.addChild(point.debugText);
    }
}