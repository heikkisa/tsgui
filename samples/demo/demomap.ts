/// <reference path="demo.ts" />

//Use DefinetelyTyped if possible with third party libraries, in this demo 
//we skip type safety. So in here we just declare the Leaflet module as "any".
declare var L : any;

module layout {

var mapDiv : HTMLElement = null;
var leafletMap : any = null; 

function createMapElement() : HTMLElement {
    if (mapDiv !== null) {
        //Map is a heavy object, so create it only once and "recycle" it if needed.
        //We can do this because it is only used in one place.
        return mapDiv;
    }
    mapDiv = document.createElement("div");
    leafletMap = L.map(mapDiv).setView([61.447456, 23.857443], 14);
    
    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        maxZoom: 18
    }).addTo(leafletMap);
    
    return mapDiv;
}

export function createMapLayoutView() : LayoutData {
    return {
        ref: View,
        fillParent: true,
        children: [
        {
            ref: DomView,
            fillParent: true,
            margins: dip(20),
            element: createMapElement(),
            onLayoutReady: function(view : DomView) {
                //Notify the map that the size might have changed.
                leafletMap.invalidateSize();
            }
        }
        ]
    };
}

}
