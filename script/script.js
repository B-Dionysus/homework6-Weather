var _rep; // Temp variable for debugging, to display the api return in the console

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

// displayWeatherData()
// Fills in the weather data for the selected city, and stores
// the city in localStorage. Then it calls searchUV
function displayWeatherData(response){
    var currentTemp=Math.floor((response.main.temp-273.15)*(9/5)+32);
    var currentHumid=response.main.humidity;
    var currentWind=response.wind.speed;
    var lat=response.coord.lat;
    var lon=response.coord.lon;
    // var currentUV=response.
    var temp=$("#temperature").html("Temperature: "+currentTemp+"&deg;F");
    var humid=$("#humidity").text("Humidity: "+currentHumid+"%");
    var wind=$("#wind").text("Wind Speed: "+currentWind+"MPH");

    localStorage.setItem("mostRecentCity",response.name)

    searchUV(lat, lon);
}

function displayUVData(response){
    _rep=response;
    console.log(response);
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
    var newUVDiv=$("<span>").addClass(uvClass);
    newUVDiv.text(uv);
    $("#uv").append(newUVDiv);
}


// <<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<
// <<vv>>                                                    >>vv<<
// <<vv>> API Calls                                          >>vv<<
// <<vv>>                                                    >>vv<<
// <<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<<<vv>>^^^^>>vv<<

// searchCity
// Called from form submission
// Asks openWeather for the city weather and then calls
// displayWeather once we have it
function searchCity(e){
    e.preventDefault();
    console.log(e.currentTarget[0].value);
    var city=e.currentTarget[0].value;
    console.log(city);
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

