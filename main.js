let stationListsURL = "http://10.101.0.12:8080/stations"  //all the stations
let stationInfo= "http://10.101.0.12:8080/stations/10" //information for a given station id (10 in this case)
//http://10.101.0.12:8080/path/Sainte-Dorothée/Bois-Franc //path from first station name (Sainte-Dorothée) to the oher (Bois-Franc)
//http://10.101.0.12:8080/schedule/Sainte-Dorothée //all passage times by segment 
//http://10.101.0.12:8080/distance/Sainte-Dorothée/Bois-Franc //distance in km between first station name (Sainte-Dorothée) to the oher (Bois-Franc)
//http://10.101.0.12:8080/averageTrainSpeed // the average speed in km/s for all trains in the network

async function GetStationLists (data,id)
{

    for (let i = 0; i < data.length; i++){
        let option = document.createElement("option");
        option.text = data[i].Name;
        option.value = data[i].Name;
        let start_end_Station = document.getElementById(id);
        start_end_Station.appendChild(option);
    }
}

function GetStationInfo (data){
    
}

Fetch3(stationListsURL,GetStationLists,"start-station") 
Fetch3(stationListsURL,GetStationLists,"end-station") 

async function Fetch2( url, doStuff,idElement){
    try {
        response= await fetch( url )
        response= await response.json()
        response=  doStuff(response,idElement)
    } catch (error) {
        console.log('Error:' , error);
    }
};

async function Fetch3( url, doStuff,idElement){
    try {
        response= await fetch( url )
        response= await response.json()
        response=  doStuff(response,idElement)
    } catch (error) {
        console.log('Error:' , error);
    }
};