let allStationsURL = "http://10.101.0.12:8080/stations"  //all the stations
// STATION BY ID:  http://10.101.0.12:8080/stations/10 //information for a given station id (id is 10 in this example url)
let pathURL = "http://10.101.0.12:8080/path/"
// PATH: http://10.101.0.12:8080/path/Sainte-Dorothée/Bois-Franc //path from first station name (Sainte-Dorothée) to the other (Bois-Franc)
// NOTIFICATIONS FOR STATION: http://10.101.0.12:8080/notifications/10 //all notifications for station id (id is 10 in this example url)
// SCHEDULE AT STATION: http://10.101.0.12:8080/schedule/Sainte-Dorothée //all passage times by segment 
 let scheduleAtStationURL = "http://10.101.0.12:8080/schedule/" 

let DistanceBtw2Stations = "http://10.101.0.12:8080/distance/" //distance in km between first station name (Sainte-Dorothée) to the second station name (Bois-Franc)
let trainSpeedURL = "http://10.101.0.12:8080/averageTrainSpeed" // the average speed in km/hr for all trains in the network

// Not necessary for the project, but in case you are interested, this endpoint gives you all the segments in the network: http://10.101.0.12:8080/segments


let sStation =document.getElementById("start-station")
let eStation =document.getElementById("end-station")
let userStartTime =document.getElementById("startTime")
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

    let reformatTime = time.filter(function (time){ if( time.SegmentId === data[0].SegmentId) // this remove extra bit in front of the time and after the time and it filter time
        {time.Time = time.Time.split("T").pop()

        time.Time = time.Time.split(".").reverse().pop()

        if( time.Time >= userStartTime.value){
            return time
        }}});

    let speed = await GetSpeed()
    let startingTime = reformatTime[0].Time;

    console.log(data[0].Name +" Stating time: "+ startingTime)
    let nextTime = startingTime

    for (let i = 1; i < data.length; i++){
        
        let distance =await GetDistance(data[i-1].Name,data[i].Name)
     
        nextTime = await GetTime(nextTime,distance,speed)
     
        let x = nextTime.split(":")
     
        let ready = await new Promise ( function (resolve){  
            setTimeout(function(){ resolve(console.log(nextTime)); },x[1]* 1000);
        })

        //console.log(nextTime);

        console.log(data[i-1])
    
    }
    
}

async function GetSpeed(){
    
    let speedAVG = await ReturnFetchResponse(trainSpeedURL)
    return speedAVG[0].AverageSpeed
}

async function GetDistance(station1,station2){
        let DistanceBtw2StationsURL = DistanceBtw2Stations+encodeURIComponent(station1)+"/"+encodeURIComponent(station2)
        return await ReturnFetchResponse(DistanceBtw2StationsURL)
}
async function GetTime(originalTime,distance,speed){

    let time= distance/speed // km/(km/h)= ...hours
    time= time*3600;
    let hours= Math.floor(time / 3600)
    let minutes = Math.floor(( time - (hours * 3600)) / 60); 
    let seconds =Math.floor(time - (hours * 3600) - (minutes * 60));
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

   // let x = originalTime.split(":")
/// need to fix this
    // if( 60 >= (x[2] +seconds) ){
    //     x[1]=x[1]+1
    //     x[2]= (x[2] +seconds)-60
    // }
    // else{
    //     x[2]= x[2] +seconds
    // }
    // if( 60 >= x[1] +minutes ){
    //     x[0]=x[0]+1
    //     x[1]= (x[1] +minutes)-60
    // }
    // else{
    //     x[1]= x[1] +minutes
    // }
    // if( 24 >= x[0] + hours ){

    //     x[0] = 00
    //     x[0]= x[0]+hours;
    // }
    // else{
    //     x[0]= x[0] + minutes
    // }

    let newtime = hours+":"+minutes+":"+seconds
    return newtime
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
//     console.log(userStartTime.value)
//     console.log(data)
//     scheduleAtStationURL=scheduleAtStationURL+encodeURIComponent(sStation.value)
//     let time = await ReturnFetchResponse(scheduleAtStationURL)

//     time
// };
