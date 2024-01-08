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

// opacity = 0;
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

function bye() {
    document.getElementById("clickText").style.display = "none";
    document.getElementById("clickText1").style.display = "block";

    setTimeout(function() {
        
        // for (i=0; i < 2; i++) {   
        //     i= i-1;}
        }, 500);
}


