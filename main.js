let allStationsURL = "http://10.101.0.12:8080/stations"  //all the stations
let stationInfo="http://10.101.0.12:8080/stations/" //information for a given station id (id is 10 in this example url)
let pathURL = "http://10.101.0.12:8080/path/" //path from first station  to the other the station
let stationNofication= "http://10.101.0.12:8080/notifications/" //all notifications for station id (id is 10 in this example url) 
let scheduleAtStationURL = "http://10.101.0.12:8080/schedule/" //all passage times by segment 
let DistanceBtw2Stations = "http://10.101.0.12:8080/distance/" //distance in km between first station name (Sainte-Dorothée) to the second station name (Bois-Franc)
let trainSpeedURL = "http://10.101.0.12:8080/averageTrainSpeed" // the average speed in km/hr for all trains in the network


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

async function Fetch3( url, doStuff,idElement){
    try {
        response= await fetch( url )
        response= await response.json()
        response=  doStuff(response,idElement)
    } catch (error) {
        console.log('Error:' , error);
    }
};


//when the button is click
document.getElementById("btn-Schedule").addEventListener("click", () =>{

    if(eStation.value===sStation.value){
        alert("ERROR The start-Station can not be end-Station")
    }
    else{
        pathBetweenStationsURL= pathURL+encodeURIComponent(sStation.value)+"/"+encodeURIComponent(eStation.value) //path from first station  to the other the station
        Fetch2(pathBetweenStationsURL,GetInfo)
    }
})



async function GetInfo(dataPath){

    let scheduleStationURL = scheduleAtStationURL + dataPath[0].Name

    time = await ReturnFetchResponse(scheduleStationURL)//all passage times by segment 
    time = await CleanTime(time,dataPath[0].SegmentId,userStartTime.value) //this will filter the time to the get the shedule that is closest or equal to the usertime entered 

    let startingTime = time[0].Time; // this getting the closest time of user
 
    await AppendToScreen(dataPath[0].SegmentId,dataPath[0].Name,startingTime,"stationPath")

    let nextTime = startingTime //this will be use get time for next station 
    let nameStation = "";
    let changeStation = "";
    let changesegment = 0;

    let speed = await GetSpeed() // this get the spped of the train 

    for (let i = 0; i < dataPath.length-1; i++){
        nameStation = dataPath[i+1].Name //second station on the path 
        if (nameStation !== changeStation){ // check if the coming station is not the terminal 
            
            let distance =await GetDistance(dataPath[i].Name,dataPath[i+1].Name)
            let OGtime = nextTime
            nextTime = await GetTime(OGtime,distance,speed)

            let result = await Promise.all([dataPath[i+1].SegmentId,dataPath[i+1].Name,nextTime,GetNotification(dataPath[i+1].StationId),GetStationInfo(dataPath[i+1].StationId)])
            console.log(result)
            await AppendAll(result,"stationPath");
            
        }
        else {
            if(changesegment == 0 ){
                await AppendToScreen(dataPath[i+1].SegmentId,dataPath[i+1].Name,nextTime,"stationPath")
                changesegment =1
            }
            else{
                let scheduleStationURL=scheduleAtStationURL+dataPath[i+1].Name

                time = await ReturnFetchResponse(scheduleStationURL)
                time = await CleanTime(time,dataPath[i+1].SegmentId,nextTime)
                nextTime = time[0].Time

                let result = await Promise.all([dataPath[i+1].SegmentId,dataPath[i+1].Name,nextTime,GetNotification(dataPath[i+1].StationId),GetStationInfo(dataPath[i+1].StationId)])
                await AppendAll(result,"stationPath");
            }
        }
        changeStation = nameStation                                                                                                 
    }
}


async function CleanTime(time,segmentid,STime){ // this will remove the extra bit form the time 
    let reformatTime = time.filter(function (time){ if( time.SegmentId === segmentid) // this remove extra bit in front of the time and after the time and it filter time
        {time.Time = time.Time.split("T").pop() // will remove the everything in front of the 'T'
        time.Time = time.Time.split(".").reverse().pop() // will reverse the array so the .000Z is in the front .pop will remove it
        if( time.Time >= STime)// this will filter the time to the get the shedule that is closest or equal to the usertime entered 
        { 
            return time
        }}});
        return reformatTime
}

async function GetSpeed(){
    
    let speedAVG = await ReturnFetchResponse(trainSpeedURL)
    return speedAVG[0].AverageSpeed
}

async function GetDistance(station1,station2){
    let DistanceBtw2StationsURL = DistanceBtw2Stations+encodeURIComponent(station1)+"/"+encodeURIComponent(station2)
    return await ReturnFetchResponse(DistanceBtw2StationsURL)
}


async function AppendToScreen(segmentId,stationName, time , appendId ){
    let node = document.createElement("LI");
    let textnode = document.createTextNode("Starting from this segment: "+segmentId+ "and station: " +stationName +"the new time will be: "+ time);
    node.appendChild(textnode); 
    return await new Promise ( function (resolve){  setTimeout(function(){ resolve(document.getElementById(appendId).appendChild(node)); }, 2* 1000);})
    
}

async function GetNotification (stationId){

     let stationNoficationURL = stationNofication+stationId
    let notificationsInfo= await ReturnFetchResponse(stationNoficationURL)
    console.log(notificationsInfo)
    return notificationsInfo
}

async function GetStationInfo(id){
    stationInfoURL= stationInfo+id
    let stationInfomation= await ReturnFetchResponse(stationInfoURL);
    return stationInfomation
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

async function GetTime(originalTime,distance,speed){
    let hms = originalTime;   // your input string
    let a = hms.split(':'); // split it at the colons
    let OGseconds =  (parseInt(a[0], 10) * 60 * 60) + (parseInt(a[1], 10) * 60 )+ (parseInt(a[2], 10)); 

    let time= distance/speed // km/(km/h)= ...hours
    time= (time*3600)+OGseconds;
    let hours= Math.floor(time / 3600) %24
    let minutes = Math.floor(( time - (hours * 3600)) / 60)%60; 
    let seconds =Math.floor(time - (hours * 3600) - (minutes * 60))%60;
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    let newtime = hours+":"+minutes+":"+seconds
    return newtime
}

async function AppendAll(data,appendId){
    
    let node = document.createElement("LI");
    if(data[3].length ===0 ){
        let textnode = document.createTextNode("Segment: "+data[0]+"and station: " +data[1] +"the new time will be: "+ data[2]+ "station Country: "+ data[4][0].Country);
    
        node.appendChild(textnode); 
        return await new Promise ( function (resolve){  setTimeout(function(){ resolve(document.getElementById(appendId).appendChild(node)); }, 2* 1000);})
    }
    else{
        let textnode = document.createTextNode("Segment: "+data[0]+"and station: " +data[1] +" the new time will be: "+ data[2]+" Notification: "+data[3][0].Name+","+data[3][0].Description+" station: "+ data[4][0].Country);
        node.appendChild(textnode); 
        return await new Promise ( function (resolve){  setTimeout(function(){ resolve(document.getElementById(appendId).appendChild(node)); }, 2* 1000);})
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