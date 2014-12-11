mw-ticker
=========

News/Stock-style ticker widget that scrolls real-time weather observations.

Designed by Matt Lammers, matt.lammers@utah.edu, 10 December 2014.
The self-contained MesoWest Ob Ticker, running on MesoWest API V2.
**Requires JQuery. (<script src="//code.jquery.com/jquery-1.11.0.min.js"></script>).
**Requires the accompanying css file: mw-ticker.css.
Scrolls MesoWest-aggregated surface observations like a news/stock-ticker across a screen.

Required Input: 
	tdiv - the div id of the div that will be containing the ticker
Optional Input:
	options - object containing the following possible parameters:
		variable - defaults to 'air_temp', can be any of the following list: 'air_temp', 'relative_humidity', 'wind_speed', 'wind_gust', 'precip_accum_one_hour', 'snow_depth'.
		scrollSpeed - defaults to 50, in pixels per second, 100 is pretty fast, 25 is quite slow.
		color - defaults to MesoWest Red (#990000), but can be any css color string (although some of them might not look great...).
		network - optional, restricts stations to only those in the given network.
		state - optional, restricts stations to only those in the given state (accepts 2-letter US abbreviations).
		lat - optional, when included with "lon" and "radius", restricts stations to only those in the given radius.
		lon - optional, when included with "lat" and "radius", restricts stations to only those in the given radius.
		radius - optional, when included with "lat" and "lon", restricts stations to only those in the given radius.
		tabularLink - defaults to true, if true will make all Station IDs in the ticker links to their associated tabular observations page.
		
Note: Performance will suffer if you do not put any restrictions on network, state, or radius. Also, if you restrict to networks 1 (NWS/FAA), 2 (RAWS), or 65 (CWOP), 
a state or radius is also appropriate, as those networks are large.
