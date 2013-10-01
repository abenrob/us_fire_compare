var open = 0;
$(".trigger" ).click(function() {
    if (open == 0) {
        $(".block" ).animate({ "left": "+=300px" }, "slow" );
        $(".trigger" ).animate({ "left": "+=300px" }, "slow" );
        open = 1;
    }
    else if (open == 1) {
        $(".block" ).animate({ "left": "-=300px" }, "slow" );
        $(".trigger" ).animate({ "left": "-=300px" }, "slow" );
        open = 0;
    }
});

var points_in, geojson, theWeek;

var dark = L.tileLayer(
  'http://api.tiles.mapbox.com/v3/abenrob.map-tiwbgcsw/{z}/{x}/{y}.png', {
    attribution: "<a href='http://mapbox.com'>Mapbox</a>"
    });

var streets = L.tileLayer(
  'http://api.tiles.mapbox.com/v3/abenrob.map-ivqurg3c/{z}/{x}/{y}.png', {
    attribution: "<a href='http://mapbox.com'>Mapbox</a>"
    });

var basemaps = {
  "Darkness": dark,
  "Mapbox Streets": streets
}

function addCommas(nStr){
  nStr += '';
  x = nStr.split('.');
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
}

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
}

function getRadius(n) {
    return n > 200000 ? 24 :
    n > 100000 ? 20 :
    n > 50000 ? 16 :
    n > 25000 ? 12 :
    n > 15000 ? 8 :
    n > 5000 ? 4 :
      2;
}

var colors = {
  red: '#BD0026',
  dkorange: '#F03B20',
  orange: '#FD8D3C',
  yellow: '#FECC5C',
  ltyellow: '#FFFFB2'
}

function getColor(d) {
  return d == 2009 ? colors.ltyellow :
         d == 2010 ? colors.yellow :
         d == 2011 ? colors.orange :
         d == 2012 ? colors.dkorange :
                     colors.red;
}

function geojsonMarkerOptions(feature,color) {
  return {
    radius: getRadius(feature.properties.area),
    color: getColor(new Date(feature.properties.pull_date).getFullYear()),
    fillColor: getColor(new Date(feature.properties.pull_date).getFullYear()),
    weight: 1,
    opacity: 1,
    fillOpacity: 0.5
  }
};

function filterFeatures(feature, layer) { 
  var value = $('#slider').slider('value');
  var _dateWk = new Date(feature.properties.pull_date).getWeek();
  theWeek.update(value);
  if (_dateWk == value){
    return true;
  }
  else return false;
};

function onEachFeature(feature, layer) {
  layer.bindPopup('<h2>' + feature.properties.fire_name + '</h2>'+ 
    '<strong>Fire Number: </strong>' + feature.properties.fire_number + '<br />' + 
    '<strong>Acres Burned: </strong>' + addCommas(feature.properties.area) + '<br />' + 
    '<strong>Report Date: </strong>' + feature.properties.report_date
    );
};

function changeValue(theValue){
  if (geojson != undefined){
    theWeek.update(theValue);
    map.removeLayer(geojson);
    geojson = L.geoJson(points_in, {
    //style: style,
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, geojsonMarkerOptions(feature,colors.red));
    },
    filter: filterFeatures
    }).addTo(map);
  }
};

var map = L.map('map');
dark.addTo(map);

L.control.layers(
  basemaps
).addTo(map);

// control that shows week info
theWeek = L.control({position: 'bottomright'});
theWeek.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'week');
  this._div.innerHTML = ('<b>Week: </b>1');
  return this._div;
};
theWeek.update = function (sliderval) {
  this._div.innerHTML = ('<b>Week: </b>' + sliderval);
};
theWeek.addTo(map);

// contol for slider
var slider = L.control({position: 'bottomright'});
slider.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'slider-box');
    this._div.innerHTML = ('<div id="slider"></div>');
    return this._div;
};
slider.addTo(map);

$('.slider-box').hover(
  function () {
    map.dragging.disable();
  },
  function () {
    map.dragging.enable();
  }
);
$("#slider").slider(
    {
      value:26,
      min: 1,
      max: 52,
      step: 1,
      slide: function( event, ui ) {
        changeValue(ui.value);
      }
    }
  );

$.getJSON($('link[rel="points"]').attr("href"), function(data) {
  points_in = data;
  geojson = L.geoJson(points_in, {
      onEachFeature: onEachFeature,
      pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, geojsonMarkerOptions(feature,colors.red));
      },
      filter: filterFeatures
  });
  

  //$('#sliderbar').val(26);
  //changeValue();
  geojson.addTo(map);
  map.fitBounds(geojson.getBounds());
});