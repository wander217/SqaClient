import axios from "axios";

const BaseUrl = "http://localhost:8080/teacher/";

function getSessionAccount(){
    const accountJson = sessionStorage.getItem("account");
    if(accountJson){
        return JSON.parse(accountJson);
    }
    return null;
}

async function getAllAssigned(input){
    const account = getSessionAccount();
    if(account === null) return [];
    const data= {id:input.id};
    var basicAuth = 'Basic ' + btoa(account.username + ':' + account.password);
    const path = input.type==="remember"?"rfind":"ffind";
    try{
        const response = await axios.post(BaseUrl+path,data,{
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

async function getAllTeacher(){
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

export const TeacherApi = {
    getAllTeacher,getAllAssigned
}