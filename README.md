# And now, the Weather

Project URL: https://b-dionysus.github.io/homework6-Weather/

![screencap of project](https://github.com/B-Dionysus/homework6-Weather/blob/main/screenCap-demp.PNG?raw=true)

* The user types in the name of the city that they are thinking about visiting
* They get the current weather, a five-day-forcast, and a brief summary of how the weather there compares to the weather where they are now (unless they searched for where they are now, of course)
* Their searches are saved until they refresh, at which point only their last search is retained

# Known Bugs / ToDo

* The comparison langauge is tricky, because we want to say there is "less rain" but "fewer clouds". I think we'd have to custom code language for every possibility.
* There's no way for the user to specify *which* city. There are so many towns named "Washington" and "Lincoln", and I don't know how openWeather chooses which to display. The user only sees the city name and the country, so they don't even know which one is being displayed! A better way would be to use geo-coördinates, but that's outside the scope of this project.
