import axios from "axios";

const BaseUrl = "http://localhost:8080/termsubject/";

function getSessionAccount(){
    const accountJson = sessionStorage.getItem("account");
    if(accountJson){
        return JSON.parse(accountJson);
    }
    return null;
}

async function getAll(){
    const account = getSessionAccount();
    if(account === null) return [];
    var basicAuth = 'Basic ' + btoa(account.username + ':' + account.password);
    try{
        const response = await axios.get(BaseUrl+"all",{
            headers:{
                'Content-Type': 'application/json',
                'Authorization': basicAuth
            }
        });
        return response.data;
    }catch(err){
        console.log(err);
        return [];
    }
}

export const StatisticApi = {
    getAll
}