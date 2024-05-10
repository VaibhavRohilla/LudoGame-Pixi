import * as PIXI from "pixi.js";


export class Background {
	constructor(topImage, backImage = null, width = 0, height = 0) {
		this.container = new PIXI.Container();




		this.createSprite(topImage, width, height);
		if (backImage)
			this.createSprite(backImage, width, height);


	}


	createSprite(image, width, height) {
		const sprite = new PIXI.Sprite(image);
		sprite.width = width;
		sprite.height = height;
		this.container.addChild(sprite);
	}



}