function fadeIn() {
    let element = document.getElementById("fadeBody");
    let opacity = 0;
    let fadeIn = setInterval(() => {
        if (opacity >= 1) {
            clearInterval(fadeIn);
        }
        element.style.opacity = opacity;
        opacity += 0.015;
    }, 10);
}


function showNav() {
    document.getElementById("navBar").style.height = "50px";
}
function hideNav() { 
    document.getElementById("navBar").style.height = "0";
}

function showdropGalerie() {    
    document.getElementById("dropGalerie").style.display = "flex";
}
function hidedropGalerie() {
    document.getElementById("dropGalerie").style.display = "none";
}

function showdropProjekt() {    
    document.getElementById("dropProjekt").style.display = "flex";
}
function hidedropProjekt() {
    document.getElementById("dropProjekt").style.display = "none";
}

media = Boolean;
function mediaFunction() {
        if (media == false) {
            mediaDiv.style.display = "none";
            media = true;
        }
        else {
            mediaDiv.style.display = "flex";
            media = false;
        }
}

function bgKontakte() {
    document.getElementById("bgImage").style.backgroundImage="url(../image/bgButton.png)";
    document.getElementById("clickText").style.display = "block";
}

function bgWebgame() {
    document.getElementById("bgImage").style.backgroundImage="none";
    document.getElementById("clickText").style.display = "none";
}

function asteroidsGame() {
    document.getElementById("cookies").style.display="none";
    document.getElementById("spielablauf").style.display = "block";
    document.getElementById("btnBack").style.visibility = "visible";
}

function fullScreen() {
    document.getElementById("gameCanves").style.height = "100%";
    document.getElementById("gameCanves").style.width = "100%";
    document.getElementById("gameCanves").style.marginTop = "0";
    document.getElementById("bgImage").style.zIndex = "15";
    document.getElementById("btnFullScreen").style.display = "none";
    document.getElementById("btnBack").style.right = "1%";
    document.getElementById("btnBack").style.top = "0";
    document.getElementById("btnWindowScreen").style.display = "block";
}

function windowScreen() {
    document.getElementById("gameCanves").style.height = "75%";
    document.getElementById("gameCanves").style.width = "75%";
    document.getElementById("gameCanves").style.marginTop = "65px";
    document.getElementById("bgImage").style.zIndex = "-1";
    document.getElementById("btnFullScreen").style.display = "block";
    document.getElementById("btnBack").style.right = "13%";
    document.getElementById("btnBack").style.top = "14%";
    document.getElementById("btnWindowScreen").style.display = "none";
}

// function fullScreen(element) {
//     if(element.requestFullscreen) {
//       element.requestFullscreen();
//     } else if(element.msRequestFullscreen) {      // for IE11 (remove June 15, 2022)
//       element.msRequestFullscreen();
//     } else if(element.webkitRequestFullscreen) {  // iOS Safari
//       element.webkitRequestFullscreen();
//     }
//   }
// fullScreen(document.documentElement);
