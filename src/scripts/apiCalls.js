
import 'regenerator-runtime/runtime'
import { GlobalPlayerState, currentEnv, getJuggler } from './Globals';
import { async } from 'regenerator-runtime';




const cashConverionAPIs = {
    convertToGameBalance : "https://togamebalance.gamesapp.co/",
    // convertToGameBalance : "https://togamebalance-prod.gamesapp.co/",
    convertToCashBalance : "https://tocashbalance.gamesapp.co/",
    // convertToCashBalance : "https://tocashbalance-prod.gamesapp.co/",
    getPlayerWallet : "https://getplayerwallet.gamesapp.in/",
    // getPlayerWallet : "http://getplayerwallet-prod.gamesapp.in/",
}


const GetUserAPI = `http://getuserwallet.gamesapp.in/`;

const CheckPlayerStatusAPIURL = {
    dev : {
        url : "https://users.abinab.workers.dev/"
    },
    uat : {
        url : "https://users-uat.abhishekrana.workers.dev/"
    },
    prod : {
        url : "----"
    }
}

const GameOnOffAPI = "https://gameonoff-uat.abhishekrana.workers.dev/";
// const GameOnOffAPI = "https://gameonoff-prod.gamesapp.in/";//prod

export async function GetPlayerWalletAPI(playerId) {
    console.log("GetPlayerWalletAPI")

    const url = cashConverionAPIs.getPlayerWallet;
    const options = {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            // "api-key" : "02420f63-b153-413f-a890-ee5529c448f0"
        },
        body : JSON.stringify({
            playerId : playerId + ""
        })
    };

    try {
            
            const response = await fetch(url, options); 
            
            const data = await response.json();
            console.log("GetPlayerWalletAPI", response, data)
    
            if(response.status === 200) {
                return {
                    success : true,
                    data : data.data
                }
            } else {
                return {
                    success : false,
                    message : data.data
                }
            }

    } catch (error) {
        return {
            success : false,
            message : "Error in getting player wallet"
        }
    }
}



export async function CheckPlayerStatusAPI(playerId) {
    console.log("CheckPlayerStatusAPI")

    const options = {
        method : "GET",
        headers : {
            "Content-Type" : "application/json",
        }
        // body : JSON.stringify({
        //     userId : playerId
        // })
    };

    try {

        const response = await fetch(`${CheckPlayerStatusAPIURL[currentEnv].url}?userId=${playerId}`, options); 
        
        const {data} = await response.json();

        // console.log("CheckPlayerStatusAPI", response.status, response, data, data.state, GlobalPlayerState['IN_LUDO'], data.state === GlobalPlayerState['IN_LUDO']);

        if(response.status === 200) {
            if(data.state === GlobalPlayerState['IN_LUDO']) {
                return {
                    success : true,
                    data : {
                        serverAddress : data.serverAddress,
                        tableType : data.tableType,
                        entryFee : data.entryFee
                    }
                }
            } else {
                return {
                    success : false,
                    message : "Player is not in Ludo"
                }
            }
        } else {
            return {
                success : false,
                message : 'Error in getting player status'
            }
        }


    } catch (error) {

        return {
            success : false,
            message : "Error in getting player status"
        }
    }

}


export async function getServerFromDistributor(connectionData) {

    console.log(JSON.stringify({
        "playerId": connectionData.playerId,
        "entryFee": connectionData.entryFee,
        "tableTypeId": connectionData.tableTypeID,
        "name": connectionData.pName,
    }));

    const options = {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify({
            "playerId": connectionData.playerId,
            "entryFee": connectionData.entryFee,
            "tableTypeId": connectionData.tableTypeID,
            "name": connectionData.pName,
        })
    };

    let url = getJuggler();

    try {

        const response = await fetch(url+ "gameServers", options); 

        const data = await response.json();
        if(response.status !== 200) {
            return {
                success : false,
                message : data.message
            }
        } 

        console.log(data.data)
        return {
            
            success : true,
            servers : data.data
        }

    } catch (error) {

        return {
            success : false,
            message : "Error in getting server from distributor"
        }
    }
}



export async function ConvertToGameBalance(playerId, entryFee) {

    const options = {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            // "api-key" : "cfec2599-d162-4c5a-893a-853712497b40"
        },
        body : JSON.stringify({
            playerId : playerId,
            amount : entryFee
        })
    };

    try {
        const response = await fetch(cashConverionAPIs.convertToGameBalance, options);
        console.log("convertToGameBalance",response)

        const data = await response.json();

        console.log(response.status, data)
        if(response.status !== 200) {
            return {
                success : false,
                message :  "Error \n"+ JSON.stringify(data)
            }
        } else {
            return {
                success : true,
                message : data.message
            }
        }

    } catch (error) {
        console.log(error)
        return {
            success : false,
            message : "Error in converting to game balance\n"
        }
    }

}

export async function ConvertToCashBalance(playerId , callback) {

    const options = {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            // "api-key" : "27a66aaf-df39-4cb3-a77a-1ce5647fdcd6"
        },
        body : JSON.stringify({
            playerId : playerId+"",
            from : {
                src : "gameClient"
            }
        })
    };

    try {
        const response = await fetch(cashConverionAPIs.convertToCashBalance, options);
        
        const data = await response.json();
        console.log("ConvertToCashBalance",response, data)

        if(response.status !== 200) {
            return {
                success : false,
                message : data.data ? data.data : "Error "+ JSON.stringify(data)
            }
        } else {
            return {
                success : true,
                message : data.message
            }
        }

    } catch (error) {
        console.log(error)
        return {
            success : false,
            message : "Error in converting to game balance\n"
        }
    }
}

export async function GetUserBalance(playerId, entryFee) {

    try {
        const url = `${GetUserAPI}`;

        const options = {
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
            },
            body : JSON.stringify({
                playerId : playerId+"",
            })
        }

        console.log("GetUserBalance", url, options)

        const response = await fetch(url, options);

        console.log("GetUserBalance", response.status);

        const data = await response.json();


        if(!response.ok && response.status !== 200) {

            
            return {
                success : false,
                data : data
            }
        } else {


            console.log(data)

            let amount = data.depositBal + data.withdrawalBal + data.bonusBal;

            amount = Math.round(amount * 100) / 100;



            console.log("GetUserBalance", amount)
            if(amount < entryFee) {
                return {
                    success : false,
                    data : "Insufficient balance"
                }
            } else {
                return {
                    success : true,
                    data : amount
                }
            }
            
        }
    } catch (error) {
        return {
            success : false,
            data: "Error in getting user balance"
        }
    }


}

export async function GameOnOff(gameId, playerId){

    try{

        const url = `${GameOnOffAPI}?gameId=${gameId}&playerId=${playerId}`
        const res = await fetch(url)
        let data =  await res.json() 
        console.log("GameOnOff",res, data)
        return data
    }catch(err){
        console.log("GameOnOff",err)
        return {status:"error", msg:"Some error occured during API call."}
    }
}
