let allStationsURL = "http://10.101.0.12:8080/stations"  //all the stations
// STATION BY ID:  http://10.101.0.12:8080/stations/10 //information for a given station id (id is 10 in this example url)
let pathURL = "http://10.101.0.12:8080/path/"
// PATH: http://10.101.0.12:8080/path/Sainte-Dorothée/Bois-Franc //path from first station name (Sainte-Dorothée) to the other (Bois-Franc)
// NOTIFICATIONS FOR STATION: http://10.101.0.12:8080/notifications/10 //all notifications for station id (id is 10 in this example url)
// SCHEDULE AT STATION: http://10.101.0.12:8080/schedule/Sainte-Dorothée //all passage times by segment 
 let scheduleAtStationURL = "http://10.101.0.12:8080/schedule/" 

// DISTANCE BETWEEN TWO STATIONS: http://10.101.0.12:8080/distance/Sainte-Dorothée/Bois-Franc //distance in km between first station name (Sainte-Dorothée) to the second station name (Bois-Franc)
// TRAIN SPEED: http://10.101.0.12:8080/averageTrainSpeed // the average speed in km/hr for all trains in the network

// Not necessary for the project, but in case you are interested, this endpoint gives you all the segments in the network: http://10.101.0.12:8080/segments



























let sStation =document.getElementById("start-station")
let eStation =document.getElementById("end-station")
let startTime =document.getElementById("startTime")
let date = document.getElementById("date")





//this populate drop down menu

Fetch3(allStationsURL,GetStationDropMenu,"start-station") 
Fetch3(allStationsURL,GetStationDropMenu,"end-station") 

async function GetStationDropMenu (data,id)
{
    console.log(data);
    for (let i = 0; i < data.length; i++){
        let option = document.createElement("option");
        option.text = data[i].Name;
        option.value = data[i].Name;
        let start_end_Station = document.getElementById(id);
        start_end_Station.appendChild(option);
    }
}

//when the button is click
document.getElementById("btn-Schedule").addEventListener("click", () =>{
    console.log(sStation.value)
    console.log(eStation.value)
    pathBetweenStationsURL= pathURL+encodeURIComponent(sStation.value)+"/"+encodeURIComponent(eStation.value)

    Fetch2(pathBetweenStationsURL,GetPath)
})

async function GetPath(data){

    console.log(data)//this is my path

    console.log(data[0].Name)
    console.log(data[0].SegmentId)
    let scheduleStationURL=scheduleAtStationURL+data[0].Name

    time = await ReturnFetchResponse(scheduleStationURL)

    let reformatTime = time.filter(function (time){ if( time.SegmentId === data[0].SegmentId) 
        {time.Time = time.Time.split("T").pop()

        time.Time = time.Time.split(".").reverse().pop()

        if( time.Time >= startTime.value){
            return time
        }}});

    console.log(reformatTime);
}


async function ReturnFetchResponse(url){
    try {
        response= await fetch( url )
        response= await response.json()
        return response
    } catch (error) {
        console.log('Error:' , error);
    }
}

async function Fetch2( url, doStuff){ 
    try {
        response= await fetch( url )
        response= await response.json()
        response=  doStuff(response)
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


function getinfo(data){
    return data
}






































// async function GetPath(data){

//     console.log(data)//this is my path

//     console.log(data[0].Name)
//     console.log(data[0].SegmentId)
//     let scheduleStationURL=scheduleAtStationURL+data[0].Name

//     time = await ReturnFetchResponse(scheduleStationURL)

//     let result = time.filter(function (time){ if( time.SegmentId === data[0].SegmentId) {return time}});

//     let getStartstationSegment = await ReturnFetchResponse ("http://10.101.0.12:8080/segments")

//     let x = getStartstationSegment.find(function (SegmentId){ if( SegmentId.SegmentId === data[0].SegmentId) {return time}}


// }


























// function GetStationInfo (data,id){
//     for (let i = 0; i < data.length; i++){
//         let option = document.createElement("option");
//         option.text = data[i].Name;
//         option.value = data[i].Name;
//         let start_end_Station = document.getElementById(id);
//         start_end_Station.appendChild(option);
//     }
// }

// async function StationPath (data,id)
// {
//     console.log(data)
//     let nameStation = "";
//     let changeStation = "";
//     for (let i = 0; i < data.length; i++){
//         nameStation = data[i].Name
//         if (nameStation !== changeStation){
//             let node = document.createElement("LI");
//             let textnode = document.createTextNode(data[i].Name);
//             node.appendChild(textnode);
//             document.getElementById(id).appendChild(node);    
//         }
//         changeStation = nameStation
//     }
// };
  


// document.getElementById("btn-Schedule").addEventListener("click", () =>{
//     console.log(sStation.value)
//     console.log(eStation.value)
//     pathBetweenStationsURL= pathURL+encodeURIComponent(sStation.value)+"/"+encodeURIComponent(eStation.value)
//     Fetch3(pathBetweenStationsURL,StationPath,"stationPath")
// })

// async function StationPath (data,id)
// {
//     console.log(startTime.value)
//     console.log(data)
//     scheduleAtStationURL=scheduleAtStationURL+encodeURIComponent(sStation.value)
//     let time = await ReturnFetchResponse(scheduleAtStationURL)

//     time
// };
