import * as PIXI from "pixi.js";
import {config } from "./appConfig";
import { Background } from "./Background";
import { DebugCircle } from "./DebugCircle";
import { DebugText } from "./DebugText";
import { GameScene } from "./GameScene";
import { CurrentGameData, GameEndStates, Globals, stopRestartProcess  } from "./Globals";
import TWEEN, { Tween } from "@tweenjs/tween.js";
import { Button } from "./Button";
import { MainScene } from "./MainScene";
import { GetResizedTexture } from "./utility";
import {Socket} from "./Socket";
import {FinalScene} from "./FinalScene";
import { TextLabel } from "./TextLabel";
import { createWaitScreen } from "./TimerScreen";


export class GameEndScene {
    constructor() {

        this.sceneContainer = new PIXI.Container();

        this.container = new PIXI.Container();
      
        this.container.sortableChildren = true;

        this.container.scale.set(config.scaleFactor);

        this.container.x = config.leftX;
        this.container.y = config.topY;

        this.createBackground();

        this.sceneContainer.addChild(this.container);

     
        this.createWaitingScreen();
        this.createAvatars();

        Globals.gameData.tempPlayerData = {};

        Object.keys(Globals.gameData.players).forEach(key => {
            const player = Globals.gameData.players[key];
            Globals.gameData.tempPlayerData[key] = player;
            this.activateAvatarImage(player.pImage, this.avatars[parseInt(key)]);
        });

        this.createWonModal();

        // this.addExitButton();
        

        const btnPos = {
			x: config.logicalWidth / 2,
			y: config.logicalHeight - 100
		}
		// this.switchBtn = new Button(Globals.resources.yellowBtn.texture, "Switch", 0xffffff, btnPos);
        // this.switchBtn.buttonLabel.style.fontSize = 30;
        // this.switchBtn.scale.set(1.6);
		// this.switchBtn.setActive(false);
		// this.switchBtn.on("pointerdown", this.onSwitchBtnClick.bind(this));
		// this.container.addChild(this.switchBtn);

        this.createTableGameID();

   

    }

    createTableGameID()
	{
		
		this.tableIdText = new DebugText((CurrentGameData.gameRoundId), 0, 0, "#3657ff", 24, "Luckiest Guy");
		this.tableIdText.anchor.set(1);
		this.tableIdText.x  = config.logicalWidth;
		this.tableIdText.y = config.logicalHeight
		this.container.addChild(this.tableIdText);
	}

	updateTableGameID()
	{
		this.tableIdText.text =(CurrentGameData.tableGameID);
	}

    updateGameRoundID()
    {
        this.tableIdText.text =(CurrentGameData.gameRoundId); 
    }

    

    showResultBanner(hasWon, amount, score)
    {
        
        this.banner = new PIXI.Graphics();
        this.banner.beginFill(0xFEFBEA, 1);
        const width = 487 * 1.2; const height = 127 * 1.2;
        this.banner.drawRoundedRect(-width/2, -height/2, width, height, 15);
        this.banner.endFill();

        this.banner.x = config.logicalWidth / 2;
        this.banner.y = -300;

        const tween = new TWEEN.Tween(this.banner).to({
            position : {
                x : config.logicalWidth / 2,
                y : 170
            }
        }, 700).easing(TWEEN.Easing.Quadratic.Out).onComplete(() => {
            this.addCloseButton();
        }).start();

        // banner.x = config.logicalWidth / 2;
        // banner.y = 170;

        const status = new DebugText(
            hasWon ? "Congratulations" : "You Lost"
            , 0, 0, "#5E639F", 30, "Source Sans Pro Light");
        status.anchor.set(0, 0.5);
        status.x = -230;
        status.y = -30;
        this.banner.addChild(status);

        const scoreHead = new DebugText("Score", 0, 0, "#5E639F", 30, "Source Sans Pro Light");
        scoreHead.anchor.set(0.5);
        scoreHead.x = 180;
        scoreHead.y = -30;
        this.banner.addChild(scoreHead);

        const scoreAmt = new DebugText(score, 0, 0, "#181F77", 30, "Source Sans Pro Regular");
        scoreAmt.anchor.set(0.5);
        scoreAmt.x = 180;
        scoreAmt.y = 10;
        scoreAmt.style.fontWeight = "bold";
        this.banner.addChild(scoreAmt);

        //rupee sign - \u20B9
        const wonText = new DebugText(
            hasWon ? "You Won \u20B9" + amount: "Let's try again!" , 0, 0,
            hasWon ? "#48A067" : "#181F77", 30, "Source Sans Pro Regular");
        wonText.anchor.set(0, 0.5);
        wonText.style.fontWeight = "bold";
        wonText.x = -230;
        wonText.y = 10;
        this.banner.addChild(wonText);

        this.container.addChild(this.banner);

        
        // Globals.gameData.tempPlayerData = {};

    }


    


    // onSwitchBtnClick()
	// {
	// 	if(Globals.gameData.plId == undefined)
	// 		return;

	// 	this.switchBtn.setActive(false);


    //     const payload = {
    //         t : "switchGame",
    //         plId : Globals.gameData.plId
    //     }

    //     Globals.socket?.sendMessage(payload);

	// 	this.resetAllData();
        
    //     Globals.scene.start(new MainScene(true));

	// }

	resetAllData()
	{
		Globals.hasJoinedTable = false;

	}


    recievedMessage(msgType, msgParams)
    {
        if(msgType == "gameStart")
        {
            Globals.gameData.currentTurn = msgParams.turn;
            console.log("Turn :" + Globals.gameData.currentTurn);
            Globals.scene.start(new GameScene());
        } else if (msgType == "joined") {

			//clear waiting screen
			for(let i = 0; i < this.avatars.length; i++) {
				if(this.avatars[i].plImage) {
                    //check if this._texture is null or not
                    if(this.avatars[i].plImage._texture !== null && this.avatars[i].plImage._texture !== undefined)
					    this.avatars[i].plImage.destroy()



                    
					this.avatars[i].plImage = undefined;
				} 
			}

			console.log("tempPlayerData",Globals.gameData.tempPlayerData);

			Object.values(Globals.gameData.tempPlayerData).forEach(player => {
				this.activateAvatarImage(player.pImage, this.avatars[player.plId]);
			});
        }
        else if (msgType == "waitTimer")
        {
            // this.updateTimer(msgParams.data);


            let btnState = true;

            if(Object.keys(Globals.gameData.tempPlayerData).length == 1)
            {
                this.waitingText.text = "Waiting for Others.. " + msgParams.data;
                this.gameEndText.text = "Waiting for Others.. " + msgParams.data;
            }
            else
            {
                this.gameEndText.text = "Next Game Starts in "+ msgParams.data;
                this.waitingText.text = "Game starting in.. " + msgParams.data;

                if(msgParams.data <= 2)
                {
                    btnState = false;
                }

                if(msgParams.data ==0){
					console.log("game is starting")
					this.container.destroy()
                    this.container = new PIXI.Container()
					this.container.scale.set(config.scaleFactor)
					this.container.y = config.topY;
					this.container.x = config.leftX;
					this.sceneContainer.addChild(this.container)
					createWaitScreen(this.container)
					this.createTableGameID()
				}
            }

            // if(this.switchBtn.renderable != btnState)
            //     this.switchBtn.setActive(btnState);

            
        }else if (msgType == "playerJoined")
        {
            this.activateAvatarImage(Globals.gameData.tempPlayerData[msgParams.index].pImage, this.avatars[msgParams.index]);

        } else if(msgType == "playerLeft")
        {
            delete Globals.gameData.tempPlayerData[msgParams.id];
            this.removePlayerAvatar(msgParams.id);
        } else if (msgType == "updateTableGameID")
        {
            this.updateTableGameID();
        } else if (msgType == "updateGameRoundID")
        {
            this.updateGameRoundID();
        }
    }

    createBackground() {
		const fullbg = new PIXI.Sprite(Globals.resources.gameBg.texture);
        fullbg.width = window.innerWidth;
        fullbg.height = window.innerHeight;
		this.sceneContainer.addChild(fullbg);

		this.bg =  new PIXI.Sprite(Globals.resources.gameOverShade.texture);
		this.bg.width = config.logicalWidth;
		this.bg.height = config.logicalHeight;


        this.ludoBoard = new PIXI.Sprite(Globals.resources.board1.texture);
        this.ludoBoard.scale.set(0.66);
        this.ludoBoard.anchor.set(0.5);
        this.ludoBoard.position = new PIXI.Point(config.logicalWidth/2, config.logicalHeight/2);

        this.bgSpark = new PIXI.Sprite(Globals.resources.gameOverSpark.texture);
        this.bgSpark.scale.set(0.66);
        this.bgSpark.anchor.set(0.5);
        this.bgSpark.position = new PIXI.Point(config.logicalWidth/2, config.logicalHeight/2);

        const maskSpark = new PIXI.Graphics();
        maskSpark.beginFill(0x00ff00);
        maskSpark.drawRect(0, 0, this.bg.width, this.bg.height);
        maskSpark.endFill();

        this.bgSpark.mask = maskSpark;

        new TWEEN.Tween(this.bgSpark)
            .to({angle : 360}, 5000)
            .repeat(1000)
            .start();

        this.container.addChild(this.ludoBoard);
        this.container.addChild(this.bgSpark);
		this.container.addChild(this.bg);
        this.container.addChild(maskSpark);
	}

    createWonModal()
    {
        this.wonBlock = new PIXI.Sprite(Globals.resources.wonBlock.texture);
        this.wonBlock.anchor.set(0.5);
        this.wonBlock.x = config.logicalWidth/2;
        this.wonBlock.y = config.logicalHeight/2;
        
        this.wonBlock.zIndex = 20;

        // Globals.gameData.winData = [
        //     {name : "Abhishek Rana", win: "0", plId : 0, score : 10},
        //     {name : "Player 2", win: "23", plId : 1, score : 10},
        //     {name : "Player 3", win: "524", plId : 2, score : 10},
        //     {name : "Player 4", win: "123", plId : 3, score : 10},
        // ];
        // Globals.gameData.plId = 0;

        for (let i = 0; i < Globals.gameData.winData.length; i++) {
            const wonData = Globals.gameData.winData[i];
            wonData.isMine = (wonData.plId == Globals.gameData.plId);
            const wonPlayerBlock = new PIXI.Sprite(wonData.isMine ?
                Globals.resources.wonPlayerSelfBlock.texture :
                Globals.resources.wonPlayerBlock.texture 
                );

            wonPlayerBlock.anchor.set(0.5);
            
            wonPlayerBlock.y -= wonPlayerBlock.height * 0.3;

            
            
            const name = wonData.name.substr(0, 8).toUpperCase();

            if(wonData.name.length > 8)
                name += "...";
            wonPlayerBlock.playerText = new DebugText(name, 0, 0,wonData.isMine ? "#fff" : "#555", 58, "Luckiest Guy");
            
                
                
            wonPlayerBlock.playerText.anchor.set(0.5);
            wonPlayerBlock.playerText.x -= wonPlayerBlock.width * 0.27 ;
            wonPlayerBlock.addChild(wonPlayerBlock.playerText);

            const rank = new DebugText(wonData.score, wonPlayerBlock.width * 0.1, 0, wonData.isMine ? "#fff" : "#555", 58, "Luckiest Guy");
            wonPlayerBlock.addChild(rank);
            
            const prize = new DebugText("\u20B9 "+wonData.win, wonPlayerBlock.width * 0.34, 0, wonData.isMine ? "#fff" : "#555", 58, "Luckiest Guy");
            prize.anchor.set(0.5);
            wonPlayerBlock.addChild(prize);
            
            if(wonData.isMine)
            {
                wonPlayerBlock.playerText.style.stroke = "#be3638";
                wonPlayerBlock.playerText.style.strokeThickness = 8;

                rank.style.stroke = "#be3638";
                rank.style.strokeThickness = 8;

                prize.style.stroke = "#be3638";
                prize.style.strokeThickness = 8;


                this.showResultBanner(wonData.win > 0, wonData.win, wonData.score);
            }
            
            wonPlayerBlock.y +=  i * wonPlayerBlock.height * 1.17;
            if(wonData.status === "left"){
                wonPlayerBlock.tint = 0x979797
            }

            this.wonBlock.addChild(wonPlayerBlock);
        }

        const close = new PIXI.Sprite(Globals.resources.gameOverClose.texture);
        close.anchor.set(0.5, 0.3);
        
        close.x += this.wonBlock.width/2.1;
        close.y -= this.wonBlock.height/5;

        close.interactive = true;
        close.once("pointerdown", () => {
            this.wonBlock.destroy();
            this.gameEndText.destroy();
            this.addExitButton();
            if(this.closeBtn != null){
                this.closeBtn.destroy()
                this.closeBtn = null
            }
            // this.logo.renderable = true;
        }, this);
        this.wonBlock.addChild(close);

        this.wonBlock.scale.set(0.66);
        this.container.addChild(this.wonBlock);
        
        this.createGameEndText();
    }

    addCloseButton()
    {
        this.closeBtn = new PIXI.Sprite(Globals.resources.resultCloseBtn.texture);
        this.closeBtn.scale.set(0.66);
        this.closeBtn.anchor.set(0.5);

        this.closeBtn.x = config.logicalWidth/2;
        this.closeBtn.y = config.logicalHeight - 200;

        this.container.addChild(this.closeBtn);


        this.closeBtn.interactive = true;

        this.closeBtn.once("pointerdown", () => {
            this.wonBlock.renderable =false;
            this.gameEndText.renderable =false;
            this.addExitButton();
            if(this.closeBtn != null){
                this.closeBtn.destroy();
                this.closeBtn = null
            }
            this.banner.renderable =false;
        }, this);
    }

    addExitButton()
    {
        const exitButton = new PIXI.Sprite(Globals.resources.yellowBtn.texture);


        exitButton.anchor.set(0.5);
        exitButton.scale.set(2)


        exitButton.x = config.logicalWidth/2;
        exitButton.y = config.logicalHeight - 200;

        const exitBtnText = new DebugText("Exit Game", exitButton.x, exitButton.y - 5, "#fff", 42, "Luckiest Guy");

        // exitBtnText.style.dropShadow = true;
        // exitBtnText.style.dropShadowBlur = 5;
        // exitBtnText.style.dropShadowDistance = 6;
        exitBtnText.style.stroke = "#7e3e01";
        exitBtnText.style.strokeThickness = 6;



        this.container.addChild(exitButton);
        this.container.addChild(exitBtnText);

        exitButton.interactive = true;
        exitButton.once("pointerdown", () => {
		    Globals.gameEndState = GameEndStates.LEFT;

            stopRestartProcess();

            try {
                if (JSBridge != undefined) {
                    
                    JSBridge.sendMessageToNative(JSON.stringify({"t" :"Exit"}));
                }
            } catch {
                console.log("JS Bridge Not Found!");
            }

            // ConvertToCashBalance(+Globals.connectionData[0]);

            if(Globals.socket && Globals.socket.socket)
            {
                console.log("Closing socket with Exit button")
                Globals.socket.socket.close();
            } else {
                console.log("Socket not found");
                Globals.scene.start(new FinalScene("You have left the game! Go back to lobby.", true, 2));
            }

                exitButton.destroy();
                exitBtnText.destroy();
        });
    }

    createGameEndText()
    {
        this.gameEndText = new DebugText("", config.logicalWidth/2, config.logicalHeight/2, "#fff", 28, "Luckiest Guy")
        //this.gameEndText.x = this.wonBlock.x + this.wonBlock.width/2;
        this.gameEndText.anchor.set(0.5, 1);
        this.gameEndText.y = this.wonBlock.y + this.wonBlock.height/2 - this.gameEndText.height;
        this.gameEndText.zIndex = 20;
        this.container.addChild(this.gameEndText);

    }

    updateTimer(value)
    {
        this.gameEndText.text = "Next Game Starts in "+value;
    }

    createWaitingScreen()
    {

        const timerContainer = new PIXI.Container();
        const block = new PIXI.Sprite(Globals.resources.waitingTextBlock.texture);
        block.anchor.set(0.5);

        this.waitingText = new DebugText("Waiting for Others..",0,0, "#fff", 48, "Luckiest Guy");
        this.waitingText.style.fontWeight = 'normal'

        timerContainer.x = config.logicalWidth/2;
        timerContainer.y = config.logicalHeight/2;

        timerContainer.addChild(block);
        timerContainer.addChild(this.waitingText);

        timerContainer.scale.set(0.66);
        
        this.container.addChild(timerContainer);
    }

    createAvatars() {



		this.avatars = [];

		for (let i = 1; i <= 4; i++) {


			const avatar = new PIXI.Sprite(Globals.resources.avatar.texture);
			avatar.anchor.set(0.5);
			avatar.scale.set(0.66);

			avatar.x = (i * (config.logicalWidth / 5))// + config.logicalWidth/10;
			avatar.y = config.logicalHeight / 2;

			//avatar.x += i * (config.logicalWidth / 5);
			avatar.y += (avatar.height * 1.2);

			const searchingText = new DebugText("Searching..", 0,0, "#000", 16, "Luckiest Guy");
            avatar.addChild(searchingText)
			this.avatars.push(avatar);

			this.container.addChild(avatar);
			// this.container.addChild(searchingText);


			// this.activateAvatarImage("https://cccdn.b-cdn.net/1584464368856.png", avatar);


		}

		const logo = new PIXI.Sprite(Globals.resources.logo.texture);
		logo.scale.set(0.66);
		logo.anchor.set(0.5);
		logo.x = config.logicalWidth / 2;
		logo.y = config.logicalHeight * 0.38;

		this.container.addChild(logo);
	}

    activateAvatarImage(url, avatarParent)
    {
        console.log("activateAvatarImage",url, avatarParent)
        GetResizedTexture(url).then((texture) => {
        avatarParent.plImage = new PIXI.Sprite(texture)
        avatarParent.plImage.anchor.set(0.5);
        avatarParent.plImage.x = avatarParent.x;
        avatarParent.plImage.y = avatarParent.y;
        avatarParent.plImage.width = avatarParent.width;
        avatarParent.plImage.height = avatarParent.height;


        const maskGraphic = new PIXI.Graphics();
        maskGraphic.beginFill(0xFF3300);

        const widthPadding = (avatarParent.width * 0.07);
        const heightPadding = (avatarParent.height * 0.07);


        maskGraphic.drawRect(avatarParent.plImage.x - avatarParent.plImage.width/2  + widthPadding, (avatarParent.y - avatarParent.height/2) + heightPadding, avatarParent.width - widthPadding*2, avatarParent.height - heightPadding*2);
        maskGraphic.endFill();

        avatarParent.plImage.mask = maskGraphic;

        this.container.addChild(avatarParent.plImage);    
        this.container.addChild(maskGraphic);
        });
    }


   removePlayerAvatar(index) {
		if (this.avatars[index] != undefined && this.avatars[index] != null) {
			const avatar = this.avatars[index];

            if(avatar.plImage == undefined ||  avatar.plImage == null)
                return

            console.log("Avtar - image",avatar?.pImage)
			avatar?.plImage.destroy();
		}
	}

    clearValues() {
		
	}
}