var _rep; // Temp variable for debugging, to display the api return in the console
var prevSearches=[];
$("body").ready(init);


function init(){    
    $("#city-search").on("submit",searchCity);
    var lastCity;
    if(lastCity=localStorage.getItem("mostRecentCity")){
        $("#city-search")[0][0].value=lastCity;
        $("#city-search").submit();
    } 
}
// <<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<
// <<vv>>                                                    >>vv<<
// <<vv>> UI Update Functions                                >>vv<<
// <<vv>>                                                    >>vv<<
// <<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<

function addToSearchHistory(city){
    var c=$("<button>").addClass("historyButton");
    c.text(city);
    // c.on("click",function(e){searchHistory(e);};
    $("#prev-searches").prepend(c);
    c.attr("id","history-search")
    c.on("click",searchCity);
}
// function searchHistory(e){
//     var city=e.target.innerText;
//     searchCity(city);
// }

// <<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<
// <<vv>>                                                    >>vv<<
// <<vv>> API Responses                                      >>vv<<
// <<vv>>                                                    >>vv<<
// <<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<
// displayWeatherData()
// Fills in the weather data for the selected city, and stores
// the city in localStorage. Then it calls searchUV
function displayWeatherData(response){
    var currentTemp=Math.floor((response.main.temp-273.15)*(9/5)+32);
    var currentHumid=response.main.humidity;
    var currentWind=response.wind.speed;
    var lat=response.coord.lat;
    var lon=response.coord.lon;
    
    $("#city-header").text(response.name+", "+response.sys.country);
    $("#date-header").text(" ("+moment().format("MM/DD/YYYY")+")");
    var temp=$("#temperature").html("Temperature: "+currentTemp+"&deg;F");
    var humid=$("#humidity").text("Humidity: "+currentHumid+"%");
    var wind=$("#wind").text("Wind Speed: "+currentWind+"MPH");

    localStorage.setItem("mostRecentCity",response.name);
    // If the city is already in the array, take it out. We want to make sure the most recent 
    // addition is at the top.
    var cityIndex=prevSearches.indexOf(response.name);
    if(cityIndex!=-1)
        prevSearches.splice(cityIndex,1);
    prevSearches.push(response.name);
    // Populate the search history  
    $("#prev-searches").html("");
    for(city of prevSearches){
        addToSearchHistory(city);
    }
    searchUV(lat, lon);
    search5Day(lat, lon);
}

function displayUVData(response){
    var uv=response.value;
    var uvClass="";
    // The World Health Orginzation has five categories for UV severity
    // https://www.who.int/news-room/q-a-detail/ultraviolet-(uv)-index
    if(uv>=11) uvClass="extreme";
    else if(uv>=8) uvClass="very-high";
    else if(uv>=6) uvClass="high";
    else if(uv>=3) uvClass="moderate";
    else if(uv>=1) uvClass="low";
    else uvClass="unknown";
    var newUVDiv=$("<span>").addClass("uv "+uvClass);
    newUVDiv.text(uv);
    
    $("#uv").html("UV Index:&nbsp");
    $("#uv").append(newUVDiv);
}
function displayForecast(response){
    $("#forecast-container").html("");
    for(var i=0;i<5;i++){
        forecast=response.daily[i];
        var date=moment(forecast.dt*1000).format('MM/DD/YYYY');
        var temp=Math.floor((forecast.temp.day-273.15)*(9/5)+32);
        var humid=forecast.humidity;
        var icon=forecast.weather[0].main;
        var thisDay=$("<div>").addClass("forecast-box");
        thisDay.append($("<p>").html("<strong>"+date+"</strong>"));
        thisDay.append($("<p>").text(icon));
        thisDay.append($("<p>").html("Temperature: "+temp+"&deg;F"));
        thisDay.append($("<p>").text("Humidity: "+humid+"%"));

        $("#forecast-container").append(thisDay);
    }
}
// <<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<
// <<vv>>                                                    >>vv<<
// <<vv>> API Calls                                          >>vv<<
// <<vv>>                                                    >>vv<<
// <<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<

// searchCity
// Called from form submission or from History button
// history button sends a string with the city name
// form submission sends an event
// Asks openWeather for the city weather and then calls
// displayWeather once we have it
function searchCity(e){
    if(e.target.id==="city-search"){
        e.preventDefault();
        console.log("Searching: "+e.currentTarget[0].value);
        var city=e.currentTarget[0].value;
        console.log(city);
    }
    else if(e.target.id==="history-search"){
        var city=e.target.innerText;
    }
    var apiKey="fb387ced59c1ebda042a0c8fd0dabefe";
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid="+apiKey,
        "method": "GET"
    }    
    $.ajax(settings).done(function (response) {
        displayWeatherData(response);
    });

}
// searchUV
// Called from displayWeather, which passes the longitude
// and latitude here. This gets the UV index, and then
// calls displayUVData() when it has it.
function searchUV(lat, lon){
    var apiKey="fb387ced59c1ebda042a0c8fd0dabefe";
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://api.openweathermap.org/data/2.5/uvi?lat="+lat+"&lon="+lon+"&appid="+apiKey,
        "method": "GET"
    }    
    $.ajax(settings).done(function (response) {
        displayUVData(response);
    });
}
// search5Day
// Called from displayWeatherData, which passes the city
// name here. This gets the five-day forecast, and then
// calls displayForecast() when it has it.
function search5Day(lat, lon){
    
    var apiKey="fb387ced59c1ebda042a0c8fd0dabefe";
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&exclude=current,minutely,hourly,alerts&appid="+apiKey,
        "method": "GET"
    }    
    $.ajax(settings).done(function (response) {
        displayForecast(response);
    });
}

