import axios from "axios";

const BaseUrl = "http://localhost:8080/assignedsubject/";

function getSessionAccount(){
    const accountJson = sessionStorage.getItem("account");
    if(accountJson){
        return JSON.parse(accountJson);
    }
    return null;
}

async function getAllSubject(id){
    const account = getSessionAccount();
    if(account === null) return [];
    const data= {id};
    var basicAuth = 'Basic ' + btoa(account.username + ':' + account.password);
    const response = await axios.post(BaseUrl+"tchfind",data,{
        headers:{
            'Content-Type': 'application/json',
            'Authorization': basicAuth
        }
    });
    return response;
}

export const SubjectApi = {
    getAllSubject
}