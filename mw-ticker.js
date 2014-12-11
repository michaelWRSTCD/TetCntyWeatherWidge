/*
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
*/

function ticker(tdiv,options) {
	var oldat;
	if (tdiv === undefined) {
		return false
	}
	var varSel = options.variable || 'air_temp';
	if (varSel === 'air_temp') {
		varUnit = 'F ';
		varText = 'Temperature';
	} else if (varSel === 'relative_humidity') {
		varUnit = '% ';
		varText = 'Relative Humidity';
	} else if (varSel === 'wind_speed' || varSel === 'wind_gust') {
		varUnit = 'kts ';
		varText = 'Wind Speed';
	} else if (varSel === 'precip_accum_one_hour' || varSel === 'snow_depth') {
		varUnit = 'in ';
		varText = 'Depth';
	}
	var selScroll = options.scrollSpeed || '50';
	var selColor = options.color || "#990000";
	var wrapper = $('#'+tdiv);
	wrapper.addClass('ticker');
	$('.ticker').css('backgroundColor',selColor);
	wrapper.append('<div class="scroller"></div>');
	var ticker = $('.scroller');
	var cback = setInterval(getOldData,5*60000);
	var restofquery = '';
	if (options.network) {
		restofquery += '&network='+options.network;
	}
	if (options.state) {
		restofquery += '&state='+options.state;
	}
	if (options.lat) {
		if (options.lon) {
			if (options.radius) {
				restofquery += '&radius='+options.lat+','+options.lon+','+options.radius;
			} else {
				restofquery += '&radius='+options.lat+','+options.lon+',50';
			}
		}
	}
	var idLink = options.tabularLink || true;
	getOldData();
	function getData() {
		$.ajax({url: 'http://api.mesowest.net/v2/stations/nearesttime?token=1234567890&within=180&showemptystations=1&status=active&units=english&vars='+varSel+restofquery,
			success: function(data) {
				console.log('New Data Came In');
				ticker.stop();
				ticker.empty();
				ticker.data(data);
				ticker.css('width', ticker.data().STATION.length*170);
				for (var i=0;i<ticker.data().STATION.length;i++) {
					var stndat = ticker.data("STATION")[i];
					if (stndat.OBSERVATIONS[varSel+'_value_1']) {
						var icon = '<span class="arrow-right">&rArr;</span>';
						if (oldat!==undefined) {
							try {
								if (oldat["STATION"][i].OBSERVATIONS[varSel+'_value_1'].value-stndat.OBSERVATIONS[varSel+'_value_1'].value<-1) {
									icon = '<span class="arrow-up">&uArr;</span>';
								} else if (oldat["STATION"][i].OBSERVATIONS[varSel+'_value_1'].value-stndat.OBSERVATIONS[varSel+'_value_1'].value>1) {
									icon = '<span class="arrow-down">&dArr;</span>';
								}
							} catch (TypeError) {
								2+2;
							}
						}
						if (idLink) {
							ticker.append('<div><span class="tick" title="'+stndat.NAME+'"><a href="http://meso1.chpc.utah.edu/mw2/meso_base.html#/station?stid='+stndat.STID+'" target="_blank"><u>'+stndat.STID+'</u></a></span>: '+stndat.OBSERVATIONS[varSel+'_value_1'].value+varUnit+icon+'</div>');
						} else {
							ticker.append('<div><span class="tick" title="'+stndat.NAME+'"><u>'+stndat.STID+'</u></span>: '+stndat.OBSERVATIONS[varSel+'_value_1'].value+varUnit+icon+'</div>');
						}
					} else {
						if (idLink) {
							ticker.append('<div><span class="untick" title="'+stndat.NAME+'"><a href="http://meso1.chpc.utah.edu/mw2/meso_base.html#/station?stid='+stndat.STID+'" target="_blank"><u>'+stndat.STID+'</u></a></span>: No Value</div>');
						} else {
							ticker.append('<div><span class="untick" title="'+stndat.NAME+'"><u>'+stndat.STID+'</u></span>: No Value</div>');
						}
					}
				}
				scrollz();
				ticker.hover(function() {ticker.stop();},function() {scrollz();});
			},
			dataType: 'jsonp'
		});
	}
	
	function getOldData() {
		var now = new Date();
		var hourago = mwDate(new Date(now-3600*1000));
		$.ajax({url: 'http://api.mesowest.net/v2/stations/nearesttime?token=1234567890&within=180&showemptystations=1&status=active&units=english&vars='+varSel+'&attime='+hourago+restofquery,
			success: function(data) {
				console.log('Old Data Came In');
				oldat = data;
				getData();
			},
			dataType: 'jsonp'
		});
	}
	
	function scrollz() {
		if (parseInt(ticker.css('left').replace('px',''))<(parseInt(wrapper.css('width').replace('px',''))-100)-ticker.data().STATION.length*170) {
			ticker.css('left',0);
		}
		ticker.animate({'left': '-='+selScroll+'px'},1000,'linear',scrollz);
	};
	
	function mwDate(jsdate) {
		var nowyr = jsdate.getUTCFullYear();
		var nowmon = jsdate.getUTCMonth()+1;
		if (nowmon<10) {
			nowmon = '0'+nowmon;
		}
		var nowday = jsdate.getUTCDate();
		if (nowday<10) {
			nowday = '0'+nowday;
		}
		var nowhr = jsdate.getUTCHours();
		if (nowhr<10) {
			nowhr = '0'+nowhr;
		}
		var nowmin = jsdate.getUTCMinutes();
		if (nowmin<10) {
			nowmin = '0'+nowmin;
		}
		console.log(''+nowyr+nowmon+nowday+nowhr+nowmin);
		return ''+nowyr+nowmon+nowday+nowhr+nowmin;
	};
};
