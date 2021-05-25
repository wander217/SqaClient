import axios from "axios";

const BaseUrl = "http://localhost:8080/registration/"

function getSessionAccount(){
    const accountJson = sessionStorage.getItem("account");
    if(accountJson){
        return JSON.parse(accountJson);
    }
    return null;
}

async function getByTeacher(id){
    const account = getSessionAccount();
    if(account === null) return [];
    const data= {id};
    console.log(id);
    var basicAuth = 'Basic ' + btoa(account.username + ':' + account.password);
    try{
        const response = await axios.post(BaseUrl+"tchfind",data,{
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

export const HistoryApi = {
    getByTeacher
}