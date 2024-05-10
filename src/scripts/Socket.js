import {FinalScene} from "./FinalScene";
import {
    CurrentGameData,
    GameEndStates,
    GlobalPlayerState,
    Globals,
    ListOfAvailableTables,
    StartRestartProcess,
    setGameStartMsg,
    stopRestartProcess
} from "./Globals";
import {ReconnectScene} from "./ReconnectScene";
import {CheckPlayerStatusAPI, ConvertToCashBalance, ConvertToGameBalance, GameOnOff, GetPlayerWalletAPI, GetUserBalance, getServerFromDistributor} from "./apiCalls";
import { Delay, sleep } from "./utility";
import 'regenerator-runtime/runtime'






export class Socket {
    constructor(credentials, serverDataForRestart) {
        console.log("Socket Created");

        console.log(`Credentials: ${JSON.stringify(credentials)}`);

        this.maxServersCount = 5
        this.maxGameWalletCheckCount = 20

        Globals.errorMsg = "";
        Globals.errorCode = 0;

        Globals.connectionData = {...credentials}


        console.log(Globals.connectionData);

        // const connectionData = {
        //     playerId: Globals.connectionData.playerId,
        //     entryFee: Globals.connectionData.entryFee,
        //     tableTypeId: Globals.connectionData.tableTypeID,
        //     name: Globals.connectionData.pName
        // }

        this.socket = null
        // console.log(connectionData)

        // this.checkPlayerStatus(connectionData);

        // await ConvertToCashBalance

        this.checkIfGameOnOff(11, credentials.playerId, serverDataForRestart)
    }

    async checkIfGameOnOff(gameId, playerId, serverDataForRestart){


        try{

            let canPlay = true
            let {status, msg} = await GameOnOff(gameId, playerId)
            console.log("checkIfGameOnOff", status, msg)
    
            if(status == 'off' || status == "banned" || status == 'error'){
                Globals.scene.start(new FinalScene(msg ? msg : "Game is under maintenance please try again later.", true, 2));
                canPlay = false
            }

            //start connection process if canPlaye is true
            if(canPlay){
                console.log("canPlay",canPlay)
                if(serverDataForRestart){
                    this.restartConnection(serverDataForRestart);
                }else{
                    this.startConnectProcess();
                }
            }
    
        }catch(err){
            console.log("checkIfGameOnOff",err)
        }
    }

    async restartConnection(serverData) {
        console.log("Restarting connection");
        let gameBalanceResponse = await ConvertToGameBalance(Globals.connectionData.playerId, Globals.connectionData.entryFee);

        if(!gameBalanceResponse.success) {
            Globals.scene.start(new FinalScene(gameBalanceResponse.message, true, 2));
            return;
        }

        try {
            const response = await this.tryServerConnection(serverData.address, Globals.connectionData.tableTypeID, Globals.connectionData.entryFee);
            this.defineSocketEvents();
        } catch (error) {
            console.log(error);
            console.log("Error in connecting to server");
            this.fetchServersAndConnect();
        }
    }

    async startConnectProcess() {
        
        let playerStatus = await CheckPlayerStatusAPI(Globals.connectionData.playerId);

        console.log("-----------------Player Status-----------------")
        console.log(playerStatus);
        console.log("----------------------------------")
        setGameStartMsg(`Fetching Player Details`);
        if(playerStatus.success) {
            setGameStartMsg(`Fetched Player Details`);
            try {

                setGameStartMsg(`Rejoining Table`)

                let connection = await this.tryServerConnection(playerStatus.data.serverAddress, playerStatus.data.tableType, playerStatus.data.entryFee);  

                if(connection) {
                   
                    this.defineSocketEvents();
                }
            } catch(error) {
                console.log(error);
                console.log("Error in connecting to server");
                Globals.scene.start(new FinalScene("Error in reconnecting \n"+error, true, 2));
            }

        } else {

            const checkUserBalance  = await GetUserBalance(Globals.connectionData.playerId, Globals.connectionData.entryFee);

            if(!checkUserBalance.success) {
                Globals.scene.start(new FinalScene(checkUserBalance.data, true, 2));
                return;
            }

            setGameStartMsg(`Converting Balance`);
            let isGameWalletCreated = false;
            console.log(`👹 Calling CashBalance API`);
            // let isCashBalanceCalled = await this.callCashBalanceAPIIfRequired();

            // if(isCashBalanceCalled) {
                
            //     this.maxGameWalletCheckCount = 20;
            //     let callGameBalance = await this.callGameBalanceAfterCashBalanceRemoved();

            //     if(callGameBalance) {
                        // isGameWalletCreated = true;
            //     }
            // } else {

                console.log(`👹 Calling GameBalance API`);
                let gameBalanceResponse = await ConvertToGameBalance(Globals.connectionData.playerId, Globals.connectionData.entryFee);

                if(!gameBalanceResponse.success) {
                    Globals.scene.start(new FinalScene(gameBalanceResponse.message, true, 2));
                    return;
                } else {
                    console.log(`👹 GameBalance API Success`);
                    isGameWalletCreated = true;
                }
            // }

            if(isGameWalletCreated) {
                setTimeout(() => {
                    this.maxGameWalletCheckCount = 20;
                    this.checkGameWalletStatusSuccess();
                }, 1000);
            } 
           
        }
    }

    async callCashBalanceAPIIfRequired() {
    
        console.log(`👹 Calling PlayerWallet API inside CashBalance`);
        const response = await GetPlayerWalletAPI(Globals.connectionData.playerId);

        if(response.success) {
            console.log(`👹 Success`);
            let gameCashResponse = await ConvertToCashBalance(Globals.connectionData.playerId);
            return true;
        } else {
            console.log(`👹 Failed`);
            return false;
        }
    }

    async callGameBalanceAfterCashBalanceRemoved() {

        // if(this.maxGameWalletCheckCount <= 0) {

        //     Globals.scene.start(new FinalScene("Error in converting balance", true, 2));
        //     return;
        // }

        console.log(`👹 Calling PlayerWallet API inside GameBalance`);
        let getPlayerWallet = await GetPlayerWalletAPI(Globals.connectionData.playerId);

        if(getPlayerWallet.success) {
            console.log(`👹 Success`);
            await Delay(1000); // wait for 1 second
            console.log(`👹 Recursive Call`);
            // this.maxGameWalletCheckCount--;
            let recursiveCall = await this.callGameBalanceAfterCashBalanceRemoved();

            console.log(`👹 Recursive Call Result: ${recursiveCall}`);
            return recursiveCall; 
        } else {

            console.log(`👹 Failed`);

            console.log(`👹 Calling GameBalance API`);
            let gameBalanceResponse = await ConvertToGameBalance(Globals.connectionData.playerId, Globals.connectionData.entryFee);

            if(!gameBalanceResponse.success) {
                Globals.scene.start(new FinalScene(gameBalanceResponse.message, true, 2));
                return false;
            } else {
                return true;
            }
        }
    }

    async checkGameWalletStatusSuccess() {

        setGameStartMsg(`Checking Game Status`);
        if(this.maxGameWalletCheckCount <= 0) {
            console.log(`👹 Max count is ${this.maxGameWalletCheckCount}`);
            Globals.scene.start(new FinalScene("Error in Game Wallet Status,\nTry Again!" , true, 2));
            return;
        }
        console.log(`👹 Calling PlayerWallet API`);        
        const response = await GetPlayerWalletAPI(Globals.connectionData.playerId);

        console.log(response);
        if(response.success) {
            console.log(`👹 Success`);
            this.fetchServersAndConnect();
        } else {
            console.log(`👹 Failed`);
            console.log(response);
            console.log(`Max count is ${this.maxGameWalletCheckCount}`);
            this.maxGameWalletCheckCount--;
            setTimeout(() => {
                console.log(`Starting checkGameWalletStatus again`);
                this.checkGameWalletStatusSuccess();
            }, 1000);
        }
    }

    async fetchServersAndConnect() {

        setGameStartMsg(`Finding Game Server`);
        let data = await getServerFromDistributor(Globals.connectionData);

        if(!data.success) {
            console.log("fetchServersAndConnect",data.message)
            Globals.scene.start(new FinalScene(data.message, true, 2));
            return;
        }

        if(data.servers.length <1) {
            console.log("fetchServersAndConnect",data.servers.length)
            Globals.scene.start(new FinalScene("Game Servers not available.", true, 2));
            return;
        }

        console.log("serverData",data)
        this.loopThroughServers(data.servers);

    }

    

    tryServerConnection(serverAddress, tableType, entryFee) { //promise

        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(serverAddress);

            this.socket.onopen = e => {
                console.log("Connection with socket made");

                const distmsg = {
                    t: "connect",
                    gid: Globals.connectionData.playerId,
                    tableGameId: "",
                    tableTypeID: tableType !== undefined ? tableType : Globals.connectionData.tableTypeID,
                    entryFee: entryFee !== undefined ? entryFee : Globals.connectionData.entryFee,
                    pName: Globals.connectionData.pName,
                    pImage: Globals.connectionData.pImage
                }

                console.log(distmsg)

                this.sendMessage(distmsg);
            };

            this.socket.onclose = e => {
                console.log("Socket closed");
                console.log(e);
                reject("Socket closed");
            };

            this.socket.onerror = e => {
                console.log("Socket error");
                console.log(e);

                reject("Socket error");
            };

            this.socket.onmessage = e => {
                console.log("Message Recieved in tryServerConnection  : " + e.data);

                const msg = JSON.parse(e.data);
                

                if (msg.t === "joined") {

                    Globals.hasJoinedTable = true;

                    Globals.gameData.tempPlayerData = {};

                    CurrentGameData.tableGameID = msg.tID;
                    Globals.emitter?.Call("updateTableGameID");

                    Globals.gameData.bal = msg.bal;

                    this.pingServer();

                    Object.keys(msg.snap).forEach(key => {
                        const data = msg.snap[key];

                        Globals.gameData.tempPlayerData[data.plId] = data;
                    });

                    // console.log(Globals.emitter);
                  
                    //log in bold red big letters
                    console.log(`%c Calling Emitter`, 'font-weight: bold; font-size: 20px; color: red;');
                    Globals.emitter.Call("joined", {plId: msg.plId});

                    console.log(`Successfully connected to server ${serverAddress}`);

                    resolve(true);


                    
                } else if (msg.t == "rejoined") {

                    this.pingServer();
                    console.log(msg)
                    Globals.hasJoinedTable = true;
                    CurrentGameData.tableGameID = msg.tID;
                    Globals.emitter?.Call("updateTableGameID");

                    Globals.gameData.bal = msg.bal;

                    Globals.gameData.plId = msg.plId;

                    Globals.gameData.players = {};

                    let leftplayer = msg.leftPls

                    let playerData = []
                    leftplayer.forEach(pldata =>{
                        let pl = {}
                        pl["pName"] = pldata.pname
                        pl["pImage"] = pldata.pImg
                        pl["plId"] = pldata.plId
                        pl["left"] = true
                        playerData.push(pl)
                    })
                    playerData = [...playerData, ...msg.snap]
                    Globals.gameData.players = {};

                    playerData.forEach(plData => {
                        Globals.gameData.players[plData.plId] = plData;
                    });

                    Globals.potData = msg.pot;

                    CurrentGameData.gameRoundId = msg.gameRoundId;
                    Globals.emitter?.Call("updateGameRoundID");


                    Globals.emitter.Call("rejoined", {
                        turn: msg.turn,
                        board: msg.board,
                        stats: msg.stats,
                        playerState: msg.state,
                        rollDiceVal: msg.rollDice,
                        movableTokens: msg.movableTokens
                    });

                    console.log(`Successfully connected to server ${serverAddress}`);
                    resolve(true);

               
                } else if (msg.t === "error") {
                    let msgtxt = msg.msg
                    let data = msg.data
                    let message =  msgtxt ? msgtxt : data
                    console.log("error",msgtxt, data)
                    reject(message);
                } 
            };

        });
    }

    async loopThroughServers(servers) {
        if (servers.length === 0) {

            console.log("No servers available");

            if(this.maxServersCount < 1){
                Globals.scene.start(new FinalScene("No Tables Available", true, 2));
                return;
            }
            
            this.maxServersCount--;
            getServerFromDistributor(Globals.connectionData)
        }

        const serverDetails = servers[0];
        servers.splice(0, 1);
   
        // console.log("maxServersCount", this.maxServersCount)

        try {

            setGameStartMsg(`Trying to connect ${serverDetails.serverId}}}`);

            let response = await this.tryServerConnection(serverDetails.address, undefined, undefined);

            if (response) {
                console.log("Connected to server");
                console.log(`%c Defining Socket`, 'font-weight: bold; font-size: 20px; color: red;');
                this.defineSocketEvents();

                return;
            }
        } catch(error ) {

            console.log(error)
            console.log("Connection failed");
            await sleep(100);
            this.loopThroughServers(servers);
        } 
    }

   

    defineSocketEvents() {

        this.socket.onmessage = e => {
            console.log("Message Recieved : " + e.data);
            let msg = JSON.parse(e.data);

            if (msg.t == "pAdd") {
                const plData = {
                    pName: msg.pName,
                    pImage: msg.pImage,
                    plId: msg.plId
                };


                Globals.gameData.tempPlayerData[msg.plId] = plData;


                // Globals.gameData.players[msg.plId] = {
                //     balance : msg.bal,
                //     plId : msg.plId,
                //     pName : msg.pName,
                //     pImage : msg.pImage
                // };

                Globals.emitter.Call("playerJoined", {index: msg.plId});

            } else if (msg.t == "gameStart") {
                Globals.gameData.plId = msg.plId;
                Globals.gameData.players = {};

                msg.snap.forEach(plData => {
                    Globals.gameData.players[plData.plId] = plData;
                });

                Globals.potData = msg.pot;

                CurrentGameData.gameRoundId = msg.gameRoundId;
                Globals.emitter?.Call("updateGameRoundID");

                Globals.emitter.Call("gameStart", {turn: msg.turn});
            } else if (msg.t == "pLeft") {
                console.log(msg)
                // RemovePlayerEvent{    DISCONNECTED,    LEFT,    KICKED,    SWITCHED,    ERRORED,    PRELEFT,    TIMEOUT}
                if (msg.reason === 0) //Disconnected
                    Globals.emitter.Call("playerDisconnected", {id: msg.data});
                else
                    Globals.emitter.Call("playerLeft", {id: msg.data});


                //Update Board with Player Left if game is running
            } else if (msg.t == "RollDiceResult") {
                //stop dice rolling animation

                if (msg.nextroll == null || msg.nextroll == undefined) {
                    Globals.emitter.Call("rollDiceResult", {id: msg.plId, value: msg.dice, pawnArr: msg.movable});
                } else {
                    Globals.emitter.Call("noValidMove", {nextRoll: msg.nextroll, plId: msg.plId, value: msg.dice});
                }

                //
            } else if (msg.t == "moveToken") {
                //cutId: msg.data[0].tokenId, cutMoveArr : msg.data[1].moveArr
                const cutData = msg.data.filter(data => data["isCut"] == true);
                console.log("Filtered Data : ");
                console.log(cutData);

                Globals.gameData.currentTurn = msg.nextroll;
                Globals.gameData.isCut = (cutData.length > 0);
                if (Globals.gameData.isCut) {
                    Globals.gameData.cutPawn = cutData[0];
                    console.log(Globals.gameData.cutPawn);
                }

                Globals.emitter.Call("movePawn", {
                    id: msg.data[cutData.length].tokenId,
                    moveArr: msg.data[cutData.length].pos,
                    scoreObj: msg.gState.score
                });


            } else if (msg.t == "turnSkipped") {

                Globals.emitter.Call("turnChanged", {nextRoll: msg.nextRoll, plId: msg.plId});

            } else if (msg.t == "nextTurn") {
                Globals.emitter.Call("nextTurn", {nextRoll: msg.nextRoll});
            } else if (msg.t == "turnTimer") {
                Globals.emitter.Call("turnTimer", {time: msg.data, id: msg.currPlTurn});
            } else if (msg.t == "timer") {
                Globals.emitter.Call("timer", {time: msg.data});
            } else if (msg.t == "threeSix") {

                Globals.emitter.Call("threeSix", {id: msg.plId, nextRoll: msg.nextRoll});
            } else if (msg.t === "invalidMove") {
                Globals.emitter.Call("choosePawnAgain", {});
            } else if (msg.t === "gameEnded") {
                Globals.gameData.winData = msg.winData

                //Addin left player to result
                if (msg.leftList) {
                    Globals.gameData.winData = msg.winData.concat(Object.values(msg.leftList).map(obj => ({
                        ...obj,
                        status: "left"
                    })));
                }



                let responseMsg = ""
                if (msg.msg == "moveToken") {
                    responseMsg = "Game Over";
                } else if (msg.msg == "threeSix") {
                    responseMsg = "Rolled Six Three Times.";
                } else if (msg.msg == "turnSkipped") {
                    responseMsg = "Timer Ended.";
                } else if (msg.msg == "noValidMove") {
                    responseMsg = "No valid move.";
                }  else if (msg.msg == "allOpponentLeft") {
                    responseMsg = "All opponents left.";
                } else if (msg.msg == "allTokensIn") {
                    Globals.gameEndState = GameEndStates.ALLTOKENSIN;
                    responseMsg = "All Tokens In.";
                }
                
                if (msg.data != null && Object.keys(msg.data).length != 0) {
                    const cutData = msg.data.filter(data => data["isCut"] == true);
                    console.log("Filtered Data : ", cutData);

                    Globals.gameData.isCut = (cutData.length > 0);
                    if (Globals.gameData.isCut) {
                        Globals.gameData.cutPawn = cutData[0];
                        console.log(Globals.gameData.cutPawn);
                    }

                    Globals.gameData.currentTurn = -2;
                    Globals.emitter.Call("movePawn", {
                        id: msg.data[cutData.length].tokenId,
                        moveArr: msg.data[cutData.length].pos,
                        scoreObj: msg.gState.score
                    });

                } 
                    // Globals.gameEndState = GameEndStates.ALLLEFT;
                
                Globals.emitter.Call("gameEnd", {reason: responseMsg});

            } else if (msg.t === "diceRollNotif") {
                Globals.emitter.Call("diceRollNotif", {id: msg.plId});
            } else if (msg.t === "waitTimer") {
                Globals.emitter.Call("waitTimer", {data: msg.data});
            } else if (msg.t === "threeSkips") {
                Globals.gameEndState = GameEndStates.THREESKIPS;
                console.log("Three Skips Close Connection");
                this.socket.close();
                // Globals.scene.start(new FinalScene());
            } else if (msg.t === "error") {
                Globals.gameEndState = GameEndStates.ERROR;
                Globals.errorMsg =  msg.msg; // changed from data to msg
                Globals.errorCode = msg.code;
                console.log("Error : ", msg.msg, msg.code);

                this.socket.close();

                // Globals.scene.start(new FinalScene(msg.data, msg.code == "Ez0003"));
            } else if (msg.t === "switchFailed") {
                Globals.emitter?.Call("onSwitchFailed");
            } else if (msg.t === "pong") {
                clearTimeout(this.showReconnectSceneTimeout);
                this.pingServer();
            } else if (msg.t === "plRejoined") {
                Globals.emitter.Call("removeDisconnectImage", {id: msg.plId});
            } else if (msg.t === "restartGame") {
                let serverData = msg.data
                console.log("restartGame",serverData)
                clearInterval(this.showReconnectSceneTimeout)
                StartRestartProcess(serverData);
            } else if (msg.t === "switchSuccess") {
                let serverId = msg.id;
                //connect with new distributer with new id
                //set oldServerId param to serverId

            }
        };

        this.socket.onclose = e => {
            clearInterval(this.pingIntervalId);
            if (e.wasClean) {
                clearTimeout(this.showReconnectSceneTimeout);
                console.log(`[close] Connection closed cleanly, code=${e.code} reason=${e.reason}`);
            } else {
                console.log(Globals.gameEndState);
                console.log(`[close] Connection Died abnormally, code=${e.code} reason=${e.reason}`);
            }

            if (Globals.gameEndState == GameEndStates.THREESKIPS) {
                clearTimeout(this.showReconnectSceneTimeout);
                setTimeout(() => {
                    Globals.scene.start(new FinalScene("You skipped three times!\nGet back.", true, 2));
                }, 2000);
                Globals.gameEndState = GameEndStates.NONE;
            } else if (Globals.gameEndState == GameEndStates.ERROR) {
                clearTimeout(this.showReconnectSceneTimeout);
                Globals.scene.start(new FinalScene(Globals.errorMsg, Globals.errorCode == "Ez0004", 1));
            } else if (Globals.gameEndState == GameEndStates.DISCONNECTED) {
                console.log("disconnected")
            } else if (Globals.gameEndState == GameEndStates.FOCUS_OFF) {
                //Do Nothing
            } else if (Globals.gameEndState == GameEndStates.LEFT) {
                clearTimeout(this.showReconnectSceneTimeout);
                stopRestartProcess();
                Globals.scene.start(new FinalScene("You have left the game! Go back to lobby.", true, 2));
            } else if (Globals.gameEndState == GameEndStates.RESTARTING) {
                clearTimeout(this.showReconnectSceneTimeout);
                //Do Nothing
            }  else {
                // clearTimeout(this.showReconnectSceneTimeout);
                Globals.gameEndState = GameEndStates.DISCONNECTED
                console.log("Internet Disconnected!");
                Globals.scene.start(new ReconnectScene());
            }
        };

        this.socket.onerror = e => {
            console.log(`[error] ${e.message}`);
        };

    }

    
    pingServer() {
        this.showReconnectSceneTimeout = setTimeout(() => {
            Globals.gameEndState = GameEndStates.DISCONNECTED
            console.log("Internet Disconnected!");
            Globals.scene.start(new ReconnectScene());
        }, 5000);

        this.pingIntervalId = setTimeout(() => {
            this.sendMessage({t: "ping"});
        }, 1000);
    }


    sendMessage(msg) {
        console.log("Message Sent : " + JSON.stringify(msg));
        this.socket.send(JSON.stringify(msg));
    }
}


