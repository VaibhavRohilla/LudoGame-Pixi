import { TextLabel } from "./TextLabel"
import { Tween } from "@tweenjs/tween.js"
import { config } from "./appConfig"

export function createWaitScreen(sceneContainer){

    let text = "     Do not Leave! \nStarting Game in..."
    let note = "Pot amount has been deducted from your wallet. \nIf you leave game now the pot amount will be lost."
    console.log(text)
    let x =config.logicalWidth
    let y =config.logicalHeight
    const msg =  new TextLabel(x*0.5,y*0.2,0.5,text,64,0xffffff)
    const notemsg = new TextLabel(x*0.5,y*0.75,0.5,note,28,0xff1000)
    notemsg.style = {
        ...notemsg.style,
        align: "center",
    }
    sceneContainer.addChild(msg)
    sceneContainer.addChild(notemsg)
    
    let countDownText = new TextLabel(x*0.5,y*0.5-20,0.5,"4",320,0xffffff)
    countDownText.zIndex = 10000000
    sceneContainer.addChild(countDownText)

    let popOutTween = new Tween(countDownText.style)
                        .to({fontSize:320},200)
                        .onComplete(()=>{
                            countDownText.alpha = 0.9
                        })

    let popInTween = new Tween(countDownText.style)
                        .to({fontSize:350},800)
                        .onComplete(()=>{
                            countDownText.alpha = 0.4
                            popOutTween.start()
                        }) 

    //start Timer                    
    let countDown = 3
    let timer = setInterval(()=>{
        countDownText.updateLabelText(countDown, 0xffffff)
        popInTween.start()
        countDown--

        if(countDown <0){
            clearInterval(timer)
        }
    },1100)
}

