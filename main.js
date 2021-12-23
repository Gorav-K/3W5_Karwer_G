let allStationsURL = "http://10.101.0.12:8080/stations"  //all the stations
let stationInfo = "http://10.101.0.12:8080/stations/" //information for a given station id (id is 10 in this example url)
let pathURL = "http://10.101.0.12:8080/path/" //path from first station  to the other the station
let stationNofication = "http://10.101.0.12:8080/notifications/" //all notifications for station id (id is 10 in this example url) 
let scheduleAtStationURL = "http://10.101.0.12:8080/schedule/" //all passage times by segment 
let DistanceBtw2Stations = "http://10.101.0.12:8080/distance/" //distance in km between first station name (Sainte-Dorothée) to the second station name (Bois-Franc)
let trainSpeedURL = "http://10.101.0.12:8080/averageTrainSpeed" // the average speed in km/hr for all trains in the network


let sStation = document.getElementById("start-station")
let eStation = document.getElementById("end-station")
let userStartTime = document.getElementById("startTime")
let date = document.getElementById("date")


//this populate drop down menu
Fetch3(allStationsURL, GetStationDropMenu, "start-station")
Fetch3(allStationsURL, GetStationDropMenu, "end-station")


async function GetStationDropMenu(data, id) {
    console.log(data);
    for (let i = 0; i < data.length; i++) {
        let option = document.createElement("option");
        option.text = data[i].Name;
        option.value = data[i].Name;
        let start_end_Station = document.getElementById(id);
        start_end_Station.appendChild(option);
    }
}

async function Fetch3(url, doStuff, idElement) {
    try {
        response = await fetch(url)
        response = await response.json()
        response = doStuff(response, idElement)
    } catch (error) {
        console.log('Error:', error);
    }
};


//when the button is click
document.getElementById("btn-Schedule").addEventListener("click", () => {

    if (eStation.value === sStation.value) {
        alert("ERROR The start-Station can not be end-Station")
    }
    else {

        let list = document.getElementById("stationPath");   // Get the <ul> element with id="myList"
        console.log(list.childNodes.length)
        for (let i = 0; i < list.length; i++) {
            list.removeChild(list.childNodes[i]);
        }
        pathBetweenStationsURL = pathURL + encodeURIComponent(sStation.value) + "/" + encodeURIComponent(eStation.value) //path from first station  to the other the station
        Fetch2(pathBetweenStationsURL, GetInfo)
    }
})



async function GetInfo(dataPath) {

    let scheduleStationURL = scheduleAtStationURL + dataPath[0].Name
    time = await ReturnFetchResponse(scheduleStationURL)//all passage times by segment 
    time = await CleanTime(time, dataPath[0].SegmentId, userStartTime.value) //this will filter the time to the get the shedule that is closest or equal to the usertime entered 

    let startingTime = time[0].Time; // this getting the closest time of user

    let nextTime = startingTime //this will be use get time for next station 
    let nameStation = "";
    let changeStation = "";
    let changesegment = 0;

    let speed = await GetSpeed() // this get the spped of the train 

    for (let i = 0; i < dataPath.length; i++) {
        nameStation = dataPath[i].Name //second station on the path 
        if (nameStation !== changeStation) { // check if the coming station is not the terminal 
            let distance;
            if (dataPath.length === i + 1) {
                distance = await GetDistance(dataPath[i - 1].Name, dataPath[i].Name)
            }
            else {
                distance = await GetDistance(dataPath[i].Name, dataPath[i + 1].Name)
            }
            let OGtime = nextTime
            nextTime = await GetTime(OGtime, distance, speed)

            let result = await Promise.all([dataPath[i].SegmentId, dataPath[i].Name, nextTime, GetNotification(dataPath[i].StationId), GetStationInfo(dataPath[i].StationId)])
            console.log(result)
            await AppendAll(result, "stationPath");

        }
        else {
            if (changesegment == 0) {
                let scheduleStationURL = scheduleAtStationURL + dataPath[i].Name

                time = await ReturnFetchResponse(scheduleStationURL)
                time = await CleanTime(time, dataPath[i + 1].SegmentId, nextTime)
                nextTime = time[0].Time
                await AppendToScreen(dataPath[i].SegmentId, dataPath[i].Name, nextTime, "stationPath")
                changesegment = 1
            }
            else {

                let result = await Promise.all([dataPath[i].SegmentId, dataPath[i].Name, nextTime, GetNotification(dataPath[i + 1].StationId), GetStationInfo(dataPath[i + 1].StationId)])
                await AppendAll(result, "stationPath");
            }
        }
        changeStation = nameStation
    }
}


async function CleanTime(time, segmentid, STime) { // this will remove the extra bit form the time 
    let reformatTime = time.filter(function (time) {
        if (time.SegmentId === segmentid) // this remove extra bit in front of the time and after the time and it filter time
        {
            time.Time = time.Time.split("T").pop() // will remove the everything in front of the 'T'
            time.Time = time.Time.split(".").reverse().pop() // will reverse the array so the .000Z is in the front .pop will remove it
            if (time.Time >= STime)// this will filter the time to the get the shedule that is closest or equal to the usertime entered 
            {
                return time
            }
        }
    });
    return reformatTime
}

async function GetSpeed() // get the speed of the train 
{

    let speedAVG = await ReturnFetchResponse(trainSpeedURL)
    return speedAVG[0].AverageSpeed
}

async function GetDistance(station1, station2) // get the distance between the station 
{
    let DistanceBtw2StationsURL = DistanceBtw2Stations + encodeURIComponent(station1) + "/" + encodeURIComponent(station2)
    return await ReturnFetchResponse(DistanceBtw2StationsURL)
}

async function AppendToScreen(segmentId, stationName, time, appendId)// when we change segement is indencte a new start time 
{
    let node = document.createElement("LI");
    let textnode = document.createTextNode("Starting from this segment: " + segmentId + "and station: " + stationName + "the new time will be: " + time);
    node.appendChild(textnode);
    return await new Promise(function (resolve) { setTimeout(function () { resolve(document.getElementById(appendId).appendChild(node)); }, 2 * 1000); })

}

async function GetNotification(stationId) // get the notication of that station id that was pass in 
{

    let stationNoficationURL = stationNofication + stationId
    let notificationsInfo = await ReturnFetchResponse(stationNoficationURL)
    console.log(notificationsInfo)
    return notificationsInfo
}

async function GetStationInfo(id)//get the more info about the station of that station id that was pass in 
{
    stationInfoURL = stationInfo + id
    let stationInfomation = await ReturnFetchResponse(stationInfoURL);
    return stationInfomation
}

async function ReturnFetchResponse(url) {
    try {
        response = await fetch(url)
        response = await response.json()
        return response
    } catch (error) {
        console.log('Error:', error);
    }
}

async function GetTime(originalTime, distance, speed) {
    let hms = originalTime;   // your input string
    let a = hms.split(':'); // split it at the colons
    let OGseconds = (parseInt(a[0], 10) * 60 * 60) + (parseInt(a[1], 10) * 60) + (parseInt(a[2], 10));

    let time = distance / speed // km/(km/h)= ...hours
    time = (time * 3600) + OGseconds;
    let hours = Math.floor(time / 3600) % 24 //converting the get second in hours
    let minutes = Math.floor((time - (hours * 3600)) / 60) % 60;//getting from miniutes seconds -hours
    let seconds = Math.floor(time - (hours * 3600) - (minutes * 60)) % 60;//getting from seconds seconds -hours -minute
    if (hours < 10) { hours = "0" + hours; } // check if the hours is small than 10 if yes it add 0 to 1 EX: 1 = 01
    if (minutes < 10) { minutes = "0" + minutes; }// check if the minutes is small than 10 if yes it add 0 to 1 EX: 1 = 01
    if (seconds < 10) { seconds = "0" + seconds; }// check if the seconds  is small than 10 if yes it add 0 to 1 EX: 1 = 01

    let newtime = hours + ":" + minutes + ":" + seconds
    return newtime
}

async function AppendAll(data, appendId) {

    let addhere = document.getElementById(appendId)
    let StationListDiv = document.createElement("div")
    if (data[3].length === 0) {
        StationListDiv.id = data[1]
        StationListDiv.innerHTML = "<br>Segment: " + data[0] + ", Station: " + data[1] + ", the arrival time will be: " + data[2] +
            "<br>More Infomation :   Bicycle Availability: " + data[4][0].BicycleAvailability + ", Elevator: " + data[4][0].Elevator + ", Point of Sale: " + data[4][0].PointOfSale;

        return await new Promise(function (resolve) { setTimeout(function () { resolve(addhere.appendChild(StationListDiv)); }, 2 * 1000); })
    }
    else {

        let result;
        if (data[3].length > 1) {
            for (let i = 0; i < data[3].length - 2; i++) {
                text1 = "<br>Notification : Type :" + data[3][i].Name + ", Description:" + data[3][i].Description;
                let text2 = "<br>Notification : Type :" + data[3][i].Name + ", Description:" + data[3][i].Description
                result = text1.concat("", text2)
            }
        }
        else {
            result = "<br>Notification : Type :" + data[3][0].Name + ", Description:" + data[3][0].Description;
        }
        StationListDiv.innerHTML = "<br>Segment: " + data[0] + ", Station: " + data[1] + ", the arrival time will be: " + data[2] +
            "<br>More Infomation :   Bicycle Availability: " + data[4][0].BicycleAvailability + ", Elevator: " + data[4][0].Elevator + ", Point of Sale: " + data[4][0].PointOfSale +
            result;
        return await new Promise(function (resolve) { setTimeout(function () { resolve(addhere.appendChild(StationListDiv)); }, 2 * 1000); })
    }

}

async function Fetch2(url, doStuff) {
    try {
        response = await fetch(url)
        response = await response.json()
        response = doStuff(response)
    } catch (error) {
        console.log('Error:', error);
    }
};

function api() {
    let api = document.getElementById('api1');
    api.innerHTML = '<img src=https://corona.dnsforfamily.com/graph.png?c=CA width="720" height="405">'
}
api();