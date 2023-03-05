peers = document.createElement("div");
peers.setAttribute("class", "peers");
document.body.appendChild(peers);

serverButton = document.createElement("button");
serverButton.appendChild(document.createTextNode(`Server`));
server = document.createElement("div");
server.setAttribute("class", "server");
server.appendChild(serverButton);
document.body.appendChild(server);

client = document.createElement("div");
client.setAttribute("class", "client");
document.body.appendChild(client);

canvas = document.createElement("canvas");
canvas.setAttribute("id", "c");
canvas.setAttribute("width", "1500");
canvas.setAttribute("height", "720");
canvas_2d_context = canvas.getContext("2d");
document.body.appendChild(canvas);

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}

for (var i = 0; i <6 ; i++) {
    peerButton = document.createElement("button");
    peers_div = document.getElementsByTagName("div")[0];
    peers_div.appendChild(peerButton);
}
clientButton = document.createElement("button");
client_div = document.getElementsByTagName("div")[2];
client_div.appendChild(clientButton);

httpGetAsync(`https://mostafa36a2.pythonanywhere.com/names`, function (response) {
    json_names = JSON.parse(response);
    for(var i = 0; i < 6; i++) {
        peerButton = peers_div.getElementsByTagName("button")[i];
        peerButton.appendChild(document.createTextNode(
            `#${json_names.peers[i].id}-${json_names.peers[i].name}`
            ));
            peerButton.setAttribute("id", `peer-${json_names.peers[i].id}`);
            peerButton.setAttribute("onclick", `draw_peer_arrow(this,${json_names.peers[i].id})`);
        }
        clientButton = client_div.getElementsByTagName("button")[0];
        clientButton.appendChild(document.createTextNode(
            `#${json_names.client[0].id}-${json_names.client[0].name}`
            ))
        })

setInterval(function() {
for (var i = 1; i <= 6; i++) {
    httpGetAsync(`https://mostafa36a2.pythonanywhere.com/status/peer/in/${i}`,
    function(iterable) {
    return function (response) {
        json_obj = JSON.parse(response);
        peerButton = peers_div.getElementsByTagName("button")[iterable-1];
        peerButton.setAttribute("title", json_obj.msg);
        draw_peer_arrow(peerButton,json_obj.direction,json_obj.state, iterable);
    }
}(i)
)
}
}, 5000);

setInterval(function() {
for (var i = 1; i <= 6; i++) {
    httpGetAsync(`https://mostafa36a2.pythonanywhere.com/status/peer/out/${i}`,
    function(iterable) {
    return function (response) {
        json_obj = JSON.parse(response);
        peerButton = peers_div.getElementsByTagName("button")[iterable-1];
        peerButton.setAttribute("title", json_obj.msg);
        draw_peer_arrow(peerButton,json_obj.direction,json_obj.state, iterable);
    }
}(i)
)
}
}, 5000);
setInterval(function() {
httpGetAsync(`https://mostafa36a2.pythonanywhere.com/status/client/in/${i}`, function (response) {
    json_obj = JSON.parse(response);
    console.log(json_obj)
    clientButton = client_div.getElementsByTagName("button")[0];
    clientButton.setAttribute("title", json_obj.msg);
    console.log(clientButton.classList);
    draw_client_arrow(clientButton,json_obj.direction,json_obj.state);
})
}, 5000);

setInterval(function() {
httpGetAsync(`https://mostafa36a2.pythonanywhere.com/status/client/out/${i}`, function (response) {
    json_obj = JSON.parse(response);
    console.log(json_obj)
    clientButton = client_div.getElementsByTagName("button")[0];
    clientButton.setAttribute("title", json_obj.msg);
    console.log(clientButton.classList)
    draw_client_arrow(clientButton,json_obj.direction,json_obj.state)
})
}, 5000);
function draw_canvas_arrow(context, fromX, fromY, toX, toY, color) {
    canvas_2d_context.beginPath();
    var headLen = 15; // length of head in pixels
    var dx = toX - fromX;
    var dy = toY - fromY;
    var angle = Math.atan2(dy, dx);
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    context.moveTo(toX, toY);
    context.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    context.strokeStyle = color;
    context.save();
    canvas_2d_context.stroke();
}

function draw_client_arrow(e,direction,state) {
    if (direction == 'in') {
        fromX = 305;
        fromY = 300;
        toX = 650;
        toY = 300;
    }
    else if (direction == 'out') {
        fromX = 650;
        fromY = 360;
        toX = 305;
        toY = 360;
    }

    if (state == `connected`)
        color = "green";
    else if (state == `diconnected`)
        color = "red";
    else
        color = "gray";

    draw_canvas_arrow(canvas_2d_context, fromX, fromY, toX, toY, color);
}

function draw_peer_arrow(e,direction,state, peer_id) {
    peerButton = document.querySelector(`#peer-${peer_id}`)
    serverButton = document.querySelector(`.server`)
    var peerRect = peerButton.getBoundingClientRect();
    var serverRect = serverButton.getBoundingClientRect();
    if (direction == 'in') {
        fromX = peerRect.left;
        fromY = peerRect.top;
        toX = serverRect.right;
        toY = serverRect.top;
    }
    else if (direction == 'out') {
        fromX = serverRect.right;
        fromY = serverRect.bottom;
        toX = peerRect.left;
        toY = peerRect.bottom;
    }
    if (state === 'connected') 
        color = "green";
    else if (state === 'diconnected')
        color = "red";
    else
        color = "gray";

    draw_canvas_arrow(canvas_2d_context, fromX, fromY, toX, toY, color);
}
