import { Text } from "pixi.js";


export class TextLabel extends  Text
{
    constructor(x , y , anchor , textToShow  ,size ,defaultColor=  0xff7f50, font  = "Luckiest Guy") {
        super(textToShow);

        this.x = x;
        this.y = y;
        this.anchor.set(anchor);
        this.style = {
            fontFamily: font,
            fontSize: size,
            fill: [defaultColor],
            fontWeight : 100,
        };
        
        this.text = textToShow;
    }

    updateLabelText(text , color = this.defaultColor)
    {
        this.text = text;

        this.style.fill = [color];
    }
}