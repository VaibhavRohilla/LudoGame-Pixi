import { Globals } from "./Globals";


export class Automation
{
    constructor(playerRef)
    {
        this.player = playerRef;
    }

    RollDice(gameSceneRef)
    {
        
        if(gameSceneRef.players[Globals.gameData.plId].hasAutomation)
		{
			const distmsg = {
				t: "pDiceRoll"
			}
			Globals.socket.sendMessage(distmsg);
            
            if(Globals.debug.sound)
                Globals.soundResources.click.play();
			
			//Send Message to server
			gameSceneRef.playDiceAnimation();
		}
    }

    selectPawn()
    {

        //const selectableArr = Globals.pawns.filter(item => item.interactive == true);
        //this.player.pawnSelected(selectableArr[Math.ceil(Math.random() * selectableArr.length) - 1]);
        this.player.pawnSelected(this.player.activePawnsId[Math.ceil(Math.random() * this.player.activePawnsId.length) - 1]);
    }




}