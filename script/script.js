var _rep; // Temp variable for debugging, to display the api return in the console
var prevSearches=[];
var foreignLat;
var foreignLon;
var userLon;
var userLat;
var foreignTemp; // What temperature is it where the user is looking?
var foreignW; // What's the weather like where the user is looking?
$("body").ready(init);


function init(){ 

    // Also, just for fun, we can load up the weather in whatever city
    // the user is in right now.
    window.navigator.geolocation.getCurrentPosition(getUserCity);
}

function getUserCity(position){  
    // When the user clicks the #city-search button, call searchCity() 
    $("#city-search").on("submit",searchCity);
    userLon=position.coords.longitude;
    userLat=position.coords.latitude;    
    
    // If the user has done a search previously, then it will be
    // stores in localStorage. If so, we should go ahead and load
    // it as soon as the user opens the page.
    var lastCity;
    if(lastCity=localStorage.getItem("mostRecentCity")){
        $("#city-search")[0][0].value=lastCity;
        $("#city-search").submit();
    } 
    //searchUserCity(userLon, userLat);
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
function fromKelvin(temp){
    return Math.floor((temp-273.15)*(9/5)+32);
}
// <<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<
// <<vv>>                                                    >>vv<<
// <<vv>> API Responses                                      >>vv<<
// <<vv>>                                                    >>vv<<
// <<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<
// displayWeatherData()
// Fills in the weather data for the selected city, and stores
// the city in localStorage. Then it calls searchUV
function displayWeatherData(response){
    
    $("#city-header").empty();
    $("#date-header").empty();
    $("#icon-header").empty();
    foreignTemp=fromKelvin(response.main.temp);
    foreignW=response.weather[0].main;
    // _rep=response;
    var currentHumid=response.main.humidity;
    var currentWind=response.wind.speed;
    foreignLat=response.coord.lat;
    foreignLon=response.coord.lon;
    var icon=response.weather[0].icon;
    icon="http://openweathermap.org/img/wn/"+icon+".png";
    $("#city-header").text(response.name+", "+response.sys.country);
    $("#date-header").text(" ("+moment().format("MM/DD/YYYY")+")");
    $("#icon-header").append($("<img>").attr("src",icon));
    var temp=$("#temperature").html("Temperature: "+foreignTemp+"&deg;F");
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
    $("#prev-searches").empty();
    for(city of prevSearches){
        addToSearchHistory(city);
    }
    searchUV(foreignLat, foreignLon);
    search5Day(foreignLat, foreignLon);
    searchUserCity(userLat, userLon);
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
    // _rep=response;
    $("#forecast-container").empty();
    for(var i=0;i<5;i++){
        var thisDay=$("<div>").addClass("forecast-box");
        thisDay.empty();
        forecast=response.daily[i];
        var date=moment(forecast.dt*1000).format('MM/DD/YYYY');
        var temp=fromKelvin(forecast.temp.day);
        var humid=forecast.humidity;
        var icon=forecast.weather[0].icon;
        icon="http://openweathermap.org/img/wn/"+icon+".png";
        var lat=response.lat;
        var lon=response.lon;
        thisDay.append($("<p>").html("<strong>"+date+"</strong>"));
        thisDay.append($("<img>").attr("src",icon));
        thisDay.append($("<p>").html("Temperature: "+temp+"&deg;F"));
        thisDay.append($("<p>").text("Humidity: "+humid+"%"));

        $("#forecast-container").append(thisDay);
        $("#five-day-head").text("5-Day Forecast");
    }
}
function displayUserCity(response){
    $("#forecast-compare").empty();
    var userTemp=fromKelvin(response.current.temp);
    var userW=response.current.weather[0].main;    
     _rep=response;
    userLat=response.lat;
    userLon=response.lon;

    
    // The openWeather API gives geocoörds that are ever so slightly different from the
    // ones provided by the browser. But we don't want to tell the user that 
    // Chicago is just as hot and just a cloudy as Chicago. That's not useful!
    var latDiff=Math.abs(userLat-foreignLat);
    var lonDiff=Math.abs(userLon-foreignLon);
    if(latDiff>.2 && lonDiff>.2){
        var msg="";
        console.log("Dopin' it");
        if(foreignTemp>userTemp) msg="It's hotter there than it is here";
        else if(foreignTemp<userTemp) msg="It's colder there than it is here"
        else msg="It's the same temperature";
        if(foreignW===userW) msg+=", with similar "+userW.toLowerCase()+".";
        else if(foreignW!=userW){
            if(userW==="Clear")
                msg+=", with more "+foreignW.toLowerCase()+".";
            else  msg+=", with less "+userW.toLowerCase()+".";
        }
       
        $("#forecast-compare").append($("<p>").text(msg));
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
// Called from displayWeatherData, which passes the longitude
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
// Called from displayWeatherData, which passes the lat and 
// lon. This gets the five-day forecast, and then
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
// searchUserCity
// Called from displayWeatherData, which passes the latitude
// and longitude here from the user's browser. We compare this to the 
// city the user is searching, to advise them about what to expect!
function searchUserCity(lat, lon){
    
    var apiKey="fb387ced59c1ebda042a0c8fd0dabefe";
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&exclude=minutely,hourly,alerts&appid="+apiKey,
        "method": "GET"
    }    
    $.ajax(settings).done(function (response) {
        displayUserCity(response);
    });
}

