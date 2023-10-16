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

media = Boolean;
function mediaFunction(){
    if (!media) {
        mediaDiv.style.display = "none";
        media = true;
    }
    else {
        mediaDiv.style.display = "flex";
        media = false;
    }
}

function bgKontakt() {
    document.getElementById("bgImage").style.backgroundImage="url(../image/bgButton.png)";
    document.getElementById("clickText").style.display = "block";
}

function bgWebgame() {
    document.getElementById("bgImage").style.backgroundImage="none";
    document.getElementById("clickText").style.display = "none";
}


