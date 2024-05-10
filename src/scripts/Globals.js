import { Socket } from "./Socket";
import { ConvertToCashBalance, GetPlayerWalletAPI } from "./apiCalls";

export const GameEndStates = {
    NONE : 0,
    ALLTOKENSIN : 1,
    THREESKIPS : 2,
    ERROR : 3,
    DISCONNECTED:4,
    FOCUS_OFF:5,
    LEFT:6,
    RESTARTING:7,
};

let gameRestartTimeout = undefined;

export function StartRestartProcess(serverData) {

    Globals.gameEndState = GameEndStates.RESTARTING
    if(gameRestartTimeout !== undefined) 
        clearTimeout(gameRestartTimeout);
    
    gameRestartTimeout = setTimeout(() => {
        Globals.socket = new Socket(Globals.connectionData, serverData);
    }, 5000); 

    console.log("Restarting in 5 seconds");
}

export function stopRestartProcess() {
    if(gameRestartTimeout !== undefined) {

        clearTimeout(gameRestartTimeout);
        console.log("Restarting stopped");
    }
}

let gameStartMsg = `Joining the game`;

export function setGameStartMsg(msg) {
    gameStartMsg = msg;
}

export function getGameStartMsg() {
    return gameStartMsg;
}

export const GlobalPlayerState = {
    "IN_APP" : 0,
    "IN_LUDO" : 1,
    "IN_RUMMY" : 2,
    "IN_POKER" : 3,
}

export const PLAYERSTATE  = {
    WAITING : 0,
    ROLLDICE : 1,
    SELECTTOKEN : 2
}

export const Globals = {
    resources: {},
    soundResources : {},
    gridPoints : {},
    pawns : {},
    gameData : {
        players : {
            // 0 : {pName : "Abhishek", pDefaultId : 0,  pImage : "https://images.unsplash.com/photo-1670272504528-790c24957dda?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"},
            // 1 : {pName : "TestName2", pDefaultId : 1,  pImage : "https://images.unsplash.com/photo-1670272504528-790c24957dda?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"},
            // 2 : {pName : "TestName3", pDefaultId : 2,  pImage : "https://images.unsplash.com/photo-1670272504528-790c24957dda?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"},
            // 3 : {pName : "TestName3", pDefaultId : 2,  pImage : "https://images.unsplash.com/photo-1670272504528-790c24957dda?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"},
        },
        isCut : false,
        cutPawn : {},
        winData : [],
        // plId : 0,
    },
    connectionData : {
        playerId : -1,
        pName : '',
        pImage : '',
        tableTypeID : -1,
        entryFee : -1,
    },
    debug :
    {
        sound : true
    },
    gameEndState : GameEndStates.NONE,
    potData :[],
    turnTimerVal : 8,
    hasJoinedTable : false,
    errorMsg : "",
	errorCode : 0
};


export const CurrentGameData = {
    tableGameID : "",
}

export let ListOfAvailableTables = [];

export const currentEnv = "uat";


const APIURLS = {
    "dev" : "http://64.227.154.60:9091/api/",
    "uat" : "http://68.183.89.142:9091/api/",
    "prod" : "http://128.199.17.11:9091/api/"
}


export function getJuggler() {
    return APIURLS[currentEnv];
}

if(currentEnv == 'uat'){
    window.callCashBalance =  async (playerID) => {
    
        let id = playerID || Globals.connectionData.playerId
        console.log("playerId:", id)
        let gameCashResponse = await ConvertToCashBalance(id);
        console.log(gameCashResponse)
        return gameCashResponse
    }
}

// export const APIURL = "http://139.59.28.242:8083/api";//"http://localhost:8081/api";
// export const APIURL = "http://128.199.17.11:9091/api/" //prod
// export const APIURL = "http://68.183.89.142:9091/api/"; //uat
// export const APIURL = "http://64.227.154.60:9091/api/"; //dev
// export const APIURL = "http://prodludomaster.gamesapp.co/api";
//  export const APIURL = "http://139.59.74.147:8081/api" // testing

//  export const APIURL = "http://localhost:8081/api" // testing


// export const utf8_to_b64 = (str) => window.btoa(encodeURIComponent(str));
