var map, directionsService, iconImage, MM, RM, poly, polypoi, geocoder, placesList;
var PM = new Array();
var categories = new Array("restaurant", "asian|japanese|chinese+restaurant", "bar|pub|tavern", "buffet", "coffee|cafe", "fast+food", "ice+cream|yogurt", "italian", "mexican", "pizza", "sandwich|subs", "entertainment", "fun|amusement|bowling", "golf", "hotel|motel|inn|lodge", "movie+theater", "local+parks", "store");
var ck = new Array();
var lats = new Array();
var lons = new Array();
var addresses = new Array();
var adds = new Array();
var pr = new Object();
var mid, p, FS, mapLoaded, launchState, searchZoom, query, T;

var par, infoWindow;

var M = Math;

var M1 = 'No response was received for ';
var M2 = 'Be sure you are connected to the Internet';
var M3 = ' For best results, wait until the map has finished loading before ';
var M4 = ' then try again.';

var kRoute = "Route halfway point";
var kMid = "Midpoint";

var f1 = D("frm");
p = f1.places;
p.length = 0;
var f2 = D("frm2");
document.getElementById("copyyear").innerHTML = new Date().getFullYear();
f1.address.focus();

function initialize() {

    var script = document.createElement("script");
    script.src = "v3_epoly.js";
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);

    var slide=D("DM");
    slide.style.top= (window.innerHeight - 150)/2 + "px";

    infoWindow = new google.maps.InfoWindow({
        content: ""
    });
    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();
    placesList = document.getElementById("DT");

    var q, j, cl = "",
        cn = "",
        z = "",
        x = "",
        c = "",
        av = "",
        cx = "",
        e = "",
        latlng;

    var s = window.location.search.substring(1);
    s = s.replace(/\+/gi, " ");

    var a3 = s.split("&");

    if (a3.length > 0) {
        for (j = 0; j < a3.length; j++) {
            var a4 = a3[j].split("=");

            q = decodeURIComponent(a4[1]);

            switch (a4[0]) {
            case "ml":
                pr.ml = q;
                break;
            case "mn":
                pr.mn = q;
                break;
            case "rl":
                pr.rl = q;
                break;
            case "rn":
                pr.rn = q;
                break;
            case "l":
                lats = q.split("|");
                break;
            case "n":
                lons = q.split("|");
                break;
            case "a":
                addresses = q.split("|");
                break;
            case "cl":
                cl = q;
                break;
            case "cn":
                cn = q;
                break;
            case "z":
                z = parseInt(q);
                break;
            case "av":
                av = 1;
                f1.avoid.checked = (q == 1);
                break;
            case "cx":
                cx = 1;
                f2.category.selectedIndex = q;
                break;
            case "c":
                pr.c = q;
                break;
            case "name":
                pr.name = q;
                break;
            case "addr":
                pr.addr = q;
                break;
            case "pl":
                pr.lat = q;
                break;
            case "pn":
                pr.lng = q;
                break;
            case "u":
                pr.url = "https://plus.google.com/" + q;
                break;
            case "x":
                x = 1;
                f2.large.checked = (q == "1");
                switchMap();
                break;
            }
        }
    }

    readCookie('ckDataM');
    if (x == "") {
        f2.large.checked = (ck[0] == "1");
        switchMap()
    }
    if (av == "") {
        f1.avoid.checked = (ck[4] == 1);
    }

    if (cx == "") {
        f2.category.selectedIndex = M.max(ck[5], 0);
    }

    if (cl != "" && cn != "" && cl >= -90 && cl <= 90 && cn >= -180 && cn <= 180) {
        if (z == "") z = 3;
        pr.b = 1;
        latlng = new google.maps.LatLng(cl, cn);
    } else if (!isNaN(ck[1]) && !isNaN(ck[2])) {
        latlng = new google.maps.LatLng(ck[1], ck[2]);
        z = ck[3] * 1;
    } else {
        latlng = new google.maps.LatLng(39.17, -98.297);
        z = 3;
    }

    var options = {
        zoom: z,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(D("map"), options);

    google.maps.event.addListener(map, "tilesloaded", function () {
        mapLoaded = true;
    });

    setFocus(kMid);
    D("route").disabled = true;

    if (lats.length || !isNaN(pr.ml) || !isNaN(pr.rl) || !isNaN(pr.lat)) {
        var point, j, html;
        p.length = 0;

        for (i = 0; i < lats.length; i++) {
            var sText = addresses[i];
            appendOptionLast("places", sText);
            j = p.length - 1;
            p[j].lat = lats[j];
            p[j].lng = lons[j];
            html = splitAddress(addresses[j]);
            point = new google.maps.LatLng(p[j].lat, p[j].lng);
            p[j].marker = createMarker(point, formatInfo(addresses[j]), "", "");
            p[j].html = addresses[j];
        }
        if (j >= 0 && p.selectedIndex == -1) {
            p.selectedIndex = 0;
        }

        if (!isNaN(pr.ml) && !isNaN(pr.mn)) {
            FS = kMid;
            if (lats.length == 1) {
                point = new google.maps.LatLng(lats[0], lons[0]);
                html = formatInfo(addresses[0], null, null, 1);
                MM = createMarker(point, html, "", kMid);
                p[0].marker.setVisible(false);
            } else {
                var t = "";
                if (lats.length == 2) t = "  \'as the crow flies\'";
                var html = formatInfo("<b>Midpoint</b>" + t, pr.ml, pr.mn, 1);
                iconImage = 'images/paleblue_MarkerM.png';
                var point = new google.maps.LatLng(pr.ml, pr.mn);
                MM = createMarker(point, html, iconImage, kMid);
            }
            MM.html = html;
        }
        MM.startLatLng = point;
        addressCount();
        if (!isNaN(pr.lat) && !isNaN(pr.lng)) {
            pr.k = 1;
            searchCallback();
        }
        if (p.length == 2 && !isNaN(pr.rl) & !isNaN(pr.rn)) {
            par = 1;
            directions(p[1].lat, p[1].lng, 1, 0);
        }

        if (pr.c == 1) {
            pr.c = -1;
            setFocus(kRoute);
            D("route").disabled = false;
        } else if (pr.c == 0) {
            pr.c = -1;
            setFocus(kMid);
        }
    }
    parBounds();
}

function parBounds() {
    if (!pr.b && lats.length) {
        setBounds(1, 1, 1, 1);
    }
    pr.b = 0;
}

function unload() {
    setCookie('ckDataM', f2.large.checked * 1, map.getCenter().lat(), map.getCenter().lng(), map.getZoom(), f1.avoid.checked * 1, f2.category.selectedIndex);
}

function readCookie(cookieName) {
    var theCookie = "" + document.cookie;
    var ind = theCookie.indexOf(cookieName);
    if (ind == -1 || cookieName == "") return "";
    var ind1 = theCookie.indexOf(';', ind);
    if (ind1 == -1) ind1 = theCookie.length;
    var s = unescape(theCookie.substring(ind + cookieName.length + 1, ind1));
    ck = s.split("|");
}

function setCookie(cookieName, x, cl, cn, z, av, cx, e) {
    var nDays = 2500;
    var today = new Date();
    var expire = new Date();
    expire.setTime(today.getTime() + 3600000 * 24 * nDays);
    var cookieValue = x + "|" + cl + "|" + cn + "|" + z + "|" + av + "|" + cx;
    document.cookie = cookieName + "=" + escape(cookieValue) + ";expires=" + expire.toGMTString();
}

function setFocus(focus) {
    if (pr.c >= 0) return;
    if (focus == kRoute) {
        D("route").checked = true;
    } else {
        D("midpoint").checked = true;
    }
    if (focus) FS = focus;
    for (i = 0; i < 2; i++) { // currently unused
    }
}

function selectText(myDiv) {
    if (window.getSelection) {
        var selection = window.getSelection();
        if (selection.setBaseAndExtent) {
            selection.setBaseAndExtent(myDiv, 0, myDiv, 1);
        } else {
            var range = document.createRange();
            range.selectNodeContents(myDiv);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    } else {
        var range = document.body.createTextRange();
        range.moveToElementText(myDiv);
        range.select();
    }
}

function setBounds(addresses, pois, mid, route) {
    if (pr.b) return;
    var bounds = new google.maps.LatLngBounds();
    var point, z;
    if (mid && MM) {
        point = MM.getPosition();
        bounds.extend(point);
    }
    if (route && RM) {
        point = RM.getPosition();
        bounds.extend(point);
    }
    if (pois) {
        for (i = 0; i < PM.length; i++) {
            point = PM[i].getPosition();
            bounds.extend(point);
        }
    }
    if (addresses) {
        for (i = 0; i < p.length; i++) {
            var point = new google.maps.LatLng(p[i].lat, p[i].lng);
            bounds.extend(point);
        }
    }
    mapLoaded = false;
    map.fitBounds(bounds);
    if (map.getZoom() > 15) map.setZoom(15);
}

function dirError1() {
    if (directionsService.display) {
        displayError('Driving directions could not be found for this point of interest.', 0);
    } else {
        displayError('A route could not be found for these points.', 0);
    }
    clearTimeout(T);
}

function dirTimeout() {
    clearTimeout(T);
    if (D("DD").style.display == 'none') {
        if (!launchState) {
            displayError(M1 + 'your directions request.' + M3 + 'requesting directions.', 0);
        }
    }
}

function directions(poiLat, poiLng, forward, display, addressIndex) {

    var i = p.selectedIndex;
    if (display == 0) {
        var startPoint = new google.maps.LatLng(p[0].lat, p[0].lng);
    } else {
        if (i == -1) {
            displayError('You must select a starting address.', 0);
            p.focus();
            return false;
        }
        var startPoint = new google.maps.LatLng(p[i].lat, p[i].lng);
    }
    var poiPoint = new google.maps.LatLng(poiLat, poiLng);
    directionsService.display = display;
    if (forward) {
        if (display) directionsService.addressLine = adds[addressIndex];

        var request = {
            origin: startPoint,
            destination: poiPoint,
            travelMode: google.maps.TravelMode.DRIVING,
            avoidHighways: f1.avoid.checked
        }
    } else {
        directionsService.addressLine = p[i].text;

        var request = {
            origin: poiPoint,
            destination: startPoint,
            travelMode: google.maps.TravelMode.DRIVING,
            avoidHighways: f1.avoid.checked
        }
    }
    directionsService.route(request, directionsCallback);
    launchState = mapLoaded;
    clearTimeout(T);
    T = window.setTimeout(dirTimeout, 8000);
}

function directionsCallback(result, status) {
    clearTimeout(T);
    if (status == google.maps.DirectionsStatus.OK) {
        closeInfo();
        if (p.length == 1) MM.setPosition(MM.startLatLng);
        if (p.length == 2 && directionsService.display == 0) {
            if (poly) poly.setMap(null);
            var path = result.routes[0].overview_path;
            createPoly(path);
            if (poly) {
                var d2 = poly.Distance() / 2;
                mid = poly.GetPointAtDistance(d2);
                if (RM) RM = remove(RM);
                if (!par) {
                    var point = new google.maps.LatLng(mid.lat(), mid.lng());
                } else {
                    var point = new google.maps.LatLng(pr.rl, pr.rn);
                }
                var html = formatInfo('<b>Route halfway point</b>', point.lat(), point.lng(), 1);
                iconImage = 'images/purple_MarkerR.png';
                RM = createMarker(point, html, iconImage, kRoute);
                setFocus(kRoute);
                D("route").disabled = false;
                RM.html = html;
                RM.startLatLng = point;
                geocoder.geocode({
                    'latLng': point
                }, revGeoCallback);
            }
            toggleDivs(["DX", "DE", "DS"], 1);
            par = 0;
        } else {
            var r = result.routes[0].legs[0].steps;
            var h = '';
            for (i = 0; i < r.length; i++) {
                h += '<p style="width: 15.6em; margin: auto 0.3em auto auto; padding: 2px; border-top: #C0C0C0 solid 1px">' + (i + 1) + '. ' + trim(r[i].instructions) + '  ' + trim(r[i].distance.text) + '</p>';
            }
            h += '<p style="margin: 0">' + directionsService.addressLine + '</p>';
            h += '<p style="margin: 0">Total distance: ' + result.routes[0].legs[0].distance.text + '</p>';
            h += '<p style="margin: 0">' + result.routes[0].copyrights + '</p>';
            h += '<p style="margin: 0"><a class="bluelink" href="javascript:hideDirections()" style="margin-left: 2px">Hide directions</a></p>';
            D("DD").innerHTML = h;
            toggleDivs(["DD", "DC", "DT", "DX", "DE", "DS"], 1);
            if (polypoi) polypoi.setMap(null);
            path = result.routes[0].overview_path;
            createPolypoi(path);
            var bounds = result.routes[0].bounds;
            if (bounds) {
                mapLoaded = false;
                map.fitBounds(bounds);
                if (map.getZoom() > 15) map.setZoom(15);
            }
        }
    } else {
        dirError1();
    }
}

function revGeoCallback(results, status) {
    if (results && status == google.maps.GeocoderStatus.OK) {
        var html = "<b>Route halfway point</b>";
        var point = RM.startLatLng;
        var near = "Nearest address: <br>" + splitAddress(results[0].formatted_address);
        html = formatInfo(html, point.lat(), point.lng(), 1, near);
        RM.setMap(null);
        RM = createMarker(point, html, iconImage, kRoute);
        RM.startLatLng = point;
        RM.html = html;
    }
}

function hideDirections() {
    if (D("DD").style.display == "block") {
        toggleDivs(["DT", "DX", "DC", "DD", "DS", "DE"], 1);
        if (polypoi) polypoi.setMap(null);
        setBounds(0, 1, 0, 0);
    }
}

function getDragHtml(s) {
    var m, m1;
    if (FS == kMid) {
        m = MM;
        m1 = 'MM';
    } else {
        m = RM;
        m1 = 'RM';
    }
    var h = "<div><div style='float:right; margin-right: 3px;' onclick=' closeSlide()'>X</div>";
    h += '<a class="bluelink" href="javascript:closeInfo();closeSlide(); if (PM.length>0) setBounds(0,1,0,0)">Zoom to points of interest</a><br>';
    h += 'Current location:<br>';
    h += 'Latitude: ' + roundx(m.getPosition().lat(), 7) + '<br>Longitude: ' + roundx(m.getPosition().lng(), 7) + '<br>';
    h += '<a class="bluelink" href="javascript:closeSlide();' + m1 + '.dragHtml=undefined; ' + m1 + '.setPosition(' + m1 + '.startLatLng); clearResults(1); setBounds(1,0,1,1)">Reset to ' + FS + '</a></div>';
    m.dragHtml = h;
    if (s) {
        searchZoom = 0;
        search();
    }
}

function searchTimeout() {
    clearTimeout(T);
    if (D("DT").style.display == 'none') {
        if (!launchState) {
            displayError(M1 + 'your search.' + M3 + 'starting a search.', 0);
        }
    }
}

function search() {
    if (p.length == 0 && !MM) {
        displayError('You must add one or more addresses before searching for points of interest.', 0);
        if (D("DA").style.display != 'none') f1.address.focus();
        return;
    }
    var point, query;
    var i = f2.category.selectedIndex;
    if (i > -1) {
        query = categories[i];
    } else {
        query = trim(f2.categoryedit.value);
    }
    if (!query) {
        displayError('A search category must be selected or entered.', 8);
        f2.categoryedit.focus();
        return;
    }

    if (RM && FS == kRoute) {
        point = RM.getPosition();
    } else if (MM && FS == kMid) {
        point = MM.getPosition();
    } else {
        point = new google.maps.LatLng(p[0].lat, p[0].lng);
    }

    var request = {
        location: point,
        radius: 10,
        query: query
    }

    clearGeocode();
    clearResults(0);
    t5();
    pr.k = 0;
    var service = new google.maps.places.PlacesService(map);
    service.textSearch(request, searchCallback);

    launchState = mapLoaded;
    clearTimeout(T);
    T = window.setTimeout(searchTimeout, 8000);
}

function searchCallback(results1, status) {
    if (!pr.k && status != google.maps.places.PlacesServiceStatus.OK) {
        displayError('No search results were found near this location.', 8);
        return;
    } else {
        if (!pr.k) {
            var results = results1;
        } else {

            var results = new Array();
            results[0] = {
                geometry: {
                    location: new google.maps.LatLng(pr.lat, pr.lng)
                },
                name: pr.name,
                formatted_address: pr.addr,
                opening_hours: {
                    open_now: 0
                }
            };
        }

        D("DP").style.display = "none";
        toggleDivs(["DT", "DC", "DD", "DX", "DE", "DS"], 1);
        var index, pl, html, marker;

        for (var i = 0; i < results.length; i++) {
            index = i;
            pl = results[i].geometry.location;
            adds[index] = results[i].formatted_address;
            html = '<div><div style="float:right; margin-right: 3px;" onclick=" closeSlide()">X</div>' + results[i].name + '<br>' + splitAddress(results[i].formatted_address) + '<br>Directions: <a class="bluelink" href="javascript:closeSlide();directions(' + pl.lat() + ',' + pl.lng() + ',1,1,' + index + ')">To here</a> - <a class="bluelink" href="javascript:closeSlide();directions(' + pl.lat() + ',' + pl.lng() + ',0,1,' + index + ')">From here</a>';

            if (results[i].rating >= 0) {
                html += '<br>Rating: ' + results[i].rating;
            }
            if (results[i].opening_hours && results[i].opening_hours.open_now) {
                html += '<br>Open now: Yes'
            }
            html += '<br><a class="bluelink" href="javascript:closeSlide();more(' + index + ',0)">Info page</a>';
            html += '       <a class="bluelink" href="javascript:closeSlide();more(' + index + ',1)">Send</a>';
            if (!pr.k) html += '       <a class="bluelink" href="javascript:closeSlide();more(' + index + ',2)">Save</a>';
            html += '</div>';
            var iconImage = "images/blue_Marker" + String.fromCharCode(i + 65) + ".png";
            marker = createMarker(pl, "", iconImage, "");
            marker.html = html;
            marker.reference = results[i].reference;
            marker.i = index;
            PM.push(marker);
            placesList.innerHTML += '<a class="bluelink" href="javascript:google.maps.event.trigger(PM[' + (index) + '], \'click\')">' + String.fromCharCode(i + 65) + '</a>&nbsp;' + results[i].name + '<br />';
        }

        switch (searchZoom) {
        case 0:
            getDragHtml(0);
            break;
        case 1:
            if (FS == kMid) {
                setBounds(0, 1, 1, 0);
            } else {
                setBounds(0, 1, 0, 1);
            }
            break;
        case 2:
            setBounds(0, 1, 0, 0);
        }
    }
}


function createPoly(path) {
    poly = new google.maps.Polyline({
        path: [],
        strokeColor: '#0000FF',
        strokeWeight: 5
    });
    for (j = 0; j < path.length; j++) {
        poly.getPath().push(path[j]);
    }
    poly.setMap(map);
}

function createPolypoi(path) {
    polypoi = new google.maps.Polyline({
        path: [],
        strokeColor: '#00FF00',
        strokeWeight: 5
    });
    for (j = 0; j < path.length; j++) {
        polypoi.getPath().push(path[j]);
    }
    polypoi.setMap(map);
}

function createMarker(point, html, iconPath, dragText) {
    var icon = null,
        shadow = null,
        visible = true;
    if (iconPath) {
        icon = iconPath;
        shadow = {
            url: 'images/shadow50.png',
            size: new google.maps.Size(37, 34),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(10, 34)
        };
    }
    var marker = new google.maps.Marker({
        position: point,
        map: map,
        icon: icon,
        shadow: shadow,
        visible: visible
    });
    if (dragText) marker.setDraggable(true);

    google.maps.event.addListener(marker, "click", function () {
        if (marker.dragHtml) {
            infoWindow.content = marker.dragHtml;
        } else if (marker.html) {
            infoWindow.content = marker.html;
        } else {
            infoWindow.content = html;
        }
    slideMessage(infoWindow.content);
//displayError(infoWindow.content, 0);
        //infoWindow.open(map, marker);
        if (dragText) setFocus(dragText);
    });
    google.maps.event.addListener(marker, "dragstart", function () {
       closeInfo();
        setFocus(dragText);
    });
    google.maps.event.addListener(marker, "dragend", function () {
        getDragHtml(1);
    });
    return marker;
}

function slideMessage(h) {
D("all").style.display="block";
var slide= D("DM");
slide.style.display = "block";
slide.innerHTML = h;
var endLeft=(window.innerWidth - 275) / 2;
var currentLeft = -290;
var intervalDiv= setInterval(function () { 
if (currentLeft >= endLeft) {
clearInterval(intervalDiv);
slide.style.left = endLeft + "px";
} else {
currentLeft += 20;
slide.style.left = currentLeft + "px";
}
}, 10);
}


function closeSlide() {
D("all").style.display="none";
var slide= D("DM");
slide.style.display ="none";
slide.innerHTML = "";
slide.style.left = "-280px";
}

function closeInfo() {
D("DE").style.display= "none";
}

function triggerMid() {
    if (MM && p.length > 1) {
        clearResults(0);
        google.maps.event.trigger(MM, 'click');
    }
}

function triggerRoute() {
    if (RM) {
        clearResults(0);
        google.maps.event.trigger(RM, 'click');
    }
}

function clearResults(redraw) {
    clearTimeout(T);
    for (i = PM.length - 1; i >= 0; i--) {
        PM[i].setMap(null);
    }
    PM.length = 0;
    closeInfo();
    if (polypoi) polypoi.setMap(null);
    D("DD").innerHTML = "";
    D("DT").innerHTML = "";
    D("DBR").style.display = "none";
    toggleDivs(["DX", "DC", "DT", "DD", "DE", "DS"], 2);
    if (redraw) setBounds(1, 0, 1, 1);
}

function clearAll() {
    clearResults(0);
    for (i = p.length - 1; i >= 0; i--) {
        p[i].marker.setMap(null);
    }
    p.length = 0;
    addressCount();
    MM = remove(MM);
    RM = remove(RM);
    setFocus(kMid);
    D("route").disabled = true;
    if (poly) poly.setMap(null);
    clearGeocode();
    FS = kMid;
}

function clearGeocode() {
    f1.address.value = "";
    toggleDivs(["DA", "DB", "DR", "DB2"], 2);
    f1.results.length = 0;
}

function removeOptionSelected() {
    var i = p.selectedIndex;
    if (i >= 0) {
        clearTimeout(T);
        p[i].marker.setMap(null);
        p.remove(i);
        addressCount();
        if (p.length > 0 && p.selectedIndex == -1) {
            p.selectedIndex = 0;
        }
        switch (p.length) {
        case 0:
            clearAll();
            return false;
            break;
        case 1:
            RM = remove(RM);
            setFocus(kMid);
            D("route").disabled = true;
            if (poly) poly.setMap(null);
            p[0].marker.setVisible(false);
            clearResults(1);
            break;
        case 2:
            clearResults(1);
            directions(p[1].lat, p[1].lng, 1, 0);
        }
        calculate();
    }
}

function appendToList() {
    var r = f1.results;
    var i = M.max(r.selectedIndex, 0);
    var sText = r[i].text;
    clearResults(0);
    appendOptionLast("places", sText);
    var j = p.length - 1;
    p[j].lat = r[i].lat;
    p[j].lng = r[i].lng;
    clearGeocode();
    if (j >= 0 && p.selectedIndex == -1) {
        p.selectedIndex = 0;
    }
    if (j == 1) {
        p[0].marker.setVisible(true);
        directions(p[1].lat, p[1].lng, 1, 0);
    } else if (j == 2) {
        if (poly) poly.setMap(null);
        RM = remove(RM);
        setFocus(kMid);
        D("route").disabled = true;
    }
    var point = new google.maps.LatLng(p[j].lat, p[j].lng);
    var html = splitAddress(sText);
    p[j].marker = createMarker(point, formatInfo(html), "", "");
    p[j].marker.setMap(map);
    p[j].html = html;
    if (j == 0) {
        p[j].marker.setVisible(false);
    }
    toggleDivs(["DX", "DE", "DS"], 1);
    calculate();
    addressCount();
    setBounds(1, 0, 1, 1);
}

function calculate() {
    var midlat = 0;
    var midlng = 0;
    var x = 0;
    var y = 0;
    var z = 0;
    var x1, y1, z1;
    var lat1, lon1;
    var length = p.length;
    for (i = 0; i < p.length; i++) {
        lat1 = rad(p[i].lat);
        lon1 = rad(p[i].lng);
        x1 = M.cos(lat1) * M.cos(lon1);
        y1 = M.cos(lat1) * M.sin(lon1);
        z1 = M.sin(lat1);
        x += x1;
        y += y1;
        z += z1;
    }
    x = x / length;
    y = y / length;
    z = z / length;
    midlng = M.atan2(y, x);
    hyp = M.sqrt(x * x + y * y);
    midlat = M.atan2(z, hyp);
    if (M.abs(x) < 1.0e-9 && M.abs(y) < 1.0e-9 && M.abs(z) < 1.0e-9) {
        displayError('The midpoint is the center of the earth.', 8);
        return false;
    } else {
        midlat = deg(midlat);
        midlng = deg(midlng);
        MM = remove(MM);
        var point = new google.maps.LatLng(midlat, midlng);
        if (length == 1) {
            html = formatInfo(p[0].html, null, null, 1);
            MM = createMarker(point, html, "", kMid);
        } else {
            var t = "";
            if (length == 2) t = "  \'as the crow flies\'";
            html = formatInfo("<b>Midpoint</b>" + t, midlat, midlng, 1);
            iconImage = 'images/paleblue_MarkerM.png';
            MM = createMarker(point, html, iconImage, kMid);
        }
        MM.setMap(map);
        setFocus(kMid);
        D("route").disabled = true;
        MM.startLatLng = point;
        MM.html = html;
    }
}

function formatInfo(s, lat, lng, drag, near) {
    var h = '<div><div style="float:right; margin-right: 3px;" onclick=" closeSlide()">X</div>';
    h += s;
    if (drag) {
        h += '<br><a class="bluelink" href="javascript:closeSlide();searchZoom=1; search()">Search near here</a>';
    }
    if (near) {
        h += '<br>' + near;
    }
    if (lat != undefined && lat != null) {
        h += '<br>Latitude: ' + roundx(lat, 7) + '<br>Longitude: ' + roundx(lng, 7);
    }
    if (drag) {
        h += '<br><b>Drag me</b> to search other locations';
    }
    h += '</div>';
    return h;
}

function remove(obj) {
    if (obj) {
        obj.setMap(null);
        return null;
    }
}

function appendOptionLast(combo, item) {
    var elOptNew = document.createElement('option');
    elOptNew.text = item;
    elOptNew.value = item;
    var elSel = D(combo);
    try {
        elSel.add(elOptNew, null);
    } catch (ex) {
        elSel.add(elOptNew);
    }
}

function displayError(e, m) {
    D("DEF").innerHTML = e;
    D("DEF").style.margin = m + "px 0";
    toggleDivs(["DE", "DX", "DS"], 1);
}

function addressCount() {
    D("address1").innerHTML = "Address " + (p.length + 1) + ":";
    switch (p.length) {
    case 0:
        D("place1").innerHTML = "Your addresses:";
        break;
    case 1:
        D("place1").innerHTML = "Your 1 address:";
        break
    default:
        D("place1").innerHTML = "Your " + p.length + " addresses:";
    }
}

function checkKeycode(e) {
    var c = f2.categoryedit.value;
    if (trim(c) != "") {
        f2.category.selectedIndex = -1;
    }
}

function rad(dg) {
    return (dg * M.PI / 180);
}

function deg(rd) {
    return (rd * 180 / M.PI);
}

function splitAddress(s) {
    var t = s.split(/\s*,\s*/);
    if (s.length > 30 || t.length > 3 || (t.length == 3 && /\d/.test(t[0]))) {
        s = s.replace(/\s*,\s*/, '<br>');
    }
    s = s.replace(", United States", "");
    return s;
}

function trim(s) {
    if (s.charCodeAt(0) > 32 && s.charCodeAt(s.length - 1) > 32)
        return s;
    else
        return s.replace(/^\s+|\s+$/g, '');
}

function roundx(n, exp) {
    return M.round(n * M.pow(10, exp)) / M.pow(10, exp);
}

function toggleDivs(divs, block) {
    for (i = 0; i < divs.length; i++) {
        if (i < block) {
            D(divs[i]).style.display = "block";
        } else {
            D(divs[i]).style.display = "none";
        }
    }
}

function switchMap() {
    if (f2.large.checked) {
        D("map").style.width = "100%";
        D("map").style.height = "29.4em";
    } else {
        D("map").style.width = "31.25em";
        D("map").style.height = "24.69em";
    }
    if (map) {
        google.maps.event.trigger(map, 'resize');
    }
    if (p.length > 0) {
        setBounds(1, 1, 1, 1);
    }
}

function t5() {
    toggleDivs(["DS", "DX", "DE"], 1);
}

function D(id) {
    return document.getElementById(id);
}

function geoTimeout() {
    clearTimeout(T);
    if (!launchState) {
        displayError(M1 + 'this address.' + M3 + 'adding an address.', 0);
    }
}

function launchGeocode() {
    if (!map) {
        displayError('Please be sure you are connected to the Internet and that the page is fully loaded. If necessary, reload the page.', 0);
        return false;
    }
    query = trim(f1.address.value);
    var l = query.length;
    if (l == 0) {
        displayError('You must enter an address, city or other place to search for.', 8);
        f1.address.focus();
        return false;
    }

    var p1 = query.split(",");
    if (p1.length == 2) {
        l = trim(p1[0]);
        var m = trim(p1[1]);
        if (l == parseFloat(l) && l >= -90 && l <= 90 && m == parseFloat(m) && m >= -180 && m <= 180) {
            var r = f1.results;
            r.length = 1;
            r[0].text = l + ", " + m;
            r[0].lat = l;
            r[0].lng = m;
            appendToList();
            return false;
        }
    }
    geocoder.geocode({
        'address': query
    }, gCallback);
    toggleDivs(["DS", "DC", "DX", "DE", "DT", "DD"], 2);
    launchState = mapLoaded;
    clearTimeout(T);
    T = window.setTimeout(geoTimeout, 6000);
}

function gCallback(res, status) {
    var r = f1.results;
    r.length = 0;
    clearTimeout(T);

    if (status != "OK") {
        switch (status) {
        case "ZERO_RESULTS":
            displayError('Address not found.', 0);
            break;
        case "QUERY_OVER_LIMIT":
            break;
        case "REQUEST_DENIED":
            break;
        case "INVALID_REQUEST":
        }
        return;
    }
    for (i = 0; i < res.length; i++) {
        addr = res[i].formatted_address;
        appendOptionLast("results", addr.replace(", USA", ""));
        r[r.length - 1].lat = res[i].geometry.location.lat();
        r[r.length - 1].lng = res[i].geometry.location.lng();
    }
    setResultsBox(r.length);
}

function setResultsBox(r) {
    if (r == 1) {
        appendToList();
    } else {
        toggleDivs(["DR", "DB2", "DX", "DA", "DB", "DE", "DS"], 3);
        D("resultslabel").innerHTML = "Select from " + r + " results:";
        f1.results.focus();
    }
}

function mail(result) {
    if (!pr.k) {
        pr.name = result.name;
        pr.addr = result.formatted_address;
        pr.url = result.url;
    }
    var mail = pr.name + '<br>' + splitAddress(pr.addr) + '<br>';
    mail = mail.replace(/<br>/gi, '\n');
    mail = mail.replace(/<.*?>/g, '');
    mail = mail.replace(/<.*?>/g, '');
    var mailto = 'mailto:?subject=' + encodeURI("Let's get together") + '&body=' + encodeURIComponent(mail + "\nMap and information\n").replace(/&/g, "%26") + pr.url.replace(/&/g, "%26");
    window.open(mailto);
}


function more(i, n) {
    if (pr.k) {
        if (n == 0) {
            window.open(pr.url);
        } else if (n == 1) {
            mail();
        }
        return;
    }
    pr.n = n;
    var request = {
        reference: PM[i].reference
    }
    var service = new google.maps.places.PlacesService(map);
    service.getDetails(request, moreCallback);
}

function moreCallback(result, status) {
    if (status != google.maps.places.PlacesServiceStatus.OK) {
        return;
    }
    switch (pr.n) {
    case 0:
        window.open(result.url);
        break;
    case 1:
        mail(result);
        break;
    case 2:
        var r, ph = "",
            u = "",
            u2, u3, l = "",
            n = "",
            a = "",
            m1 = "",
            m2 = "",
            pl = p.length;
        r = result;

        u2 = "cl=" + roundx(map.getCenter().lat(), 6) + "&cn=" + roundx(map.getCenter().lng(), 6) + "&z=" + map.getZoom() + "&x=" + f2.large.checked * 1 + "&c=" + (FS == kRoute) * 1 + "&av=" + f1.avoid.checked * 1 + "&cx=" + f2.category.selectedIndex;

        u2 += "&name=" + encode(r.name) + "&addr=" + encode(r.formatted_address) + "&pl=" + r.geometry.location.lat() + "&pn=" + r.geometry.location.lng();

        u3 = "&u=" + encode(r.url.substring(24));

        if (pl > 0) {
            if (MM) {
                u = "ml=" + roundx(MM.getPosition().lat(), 7) + "&mn=" + roundx(MM.getPosition().lng(), 7) + "&";
            }

            if (RM) {
                u += "rl=" + roundx(RM.getPosition().lat(), 7) + "&rn=" + roundx(RM.getPosition().lng(), 7) + "&";
            }

            var e = "Microsoft Internet Explorer";
            var h = location.href + "?";
            h = h.substring(0, h.indexOf("?"));

            var limit = 2083 + 1927 * (navigator.appName != e) - h.length - u.length - u2.length - u3.length - 10;

            i = 0;
            var a1 = getLength(i, "");
            while (i < pl && l.length + n.length + a.length + a1.tot.length < limit) {
                l += a1.l;
                n += a1.n;
                a += a1.a;
                i++;
                if (i < pl) a1 = getLength(i, "|");
            }

            u += "l=" + l + "&n=" + n + "&a=" + a;
        }

        if (u.length > 2) u += "&";
        u += u2 + u3;
        if (i < pl) {
            m2 += " Your browser can save this point of interest, the midpoint for all places, and the first " + i + " place markers.";
        }

        m1 = "Click ok to refresh the page. You can then save the page/map in your Bookmarks/Favorites.";
        a = confirm(m1 + m2);
        if (a) window.location.search = "?" + u;
    }
}


function getLength(i, v) {
    var a1 = new Object();
    a1.l = v + p[i].marker.getPosition().lat();
    a1.n = v + p[i].marker.getPosition().lng();
    a1.a = v + encode(p[i].text);
    a1.tot = a1.l + a1.n + a1.a;
    return a1;
}

function encode(s) {
    s = encodeURIComponent(s.replace(/United States/gi, "USA"));
    s = s.replace(/%2c/gi, ",");
    return s.replace(/%20/gi, "+");
}

google.maps.event.addDomListener(window, 'load', initialize);