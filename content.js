function map(value, fromLow, fromHigh, toLow, toHigh) { 
    return (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow; 
}

const kursor = document.createElement('div')
kursor.id = "kursor"
document.body.appendChild(kursor)

let posX = window.innerWidth / 2
let posY = window.innerHeight / 2
const speed = 15

//              up      down    left    right   click   copy    mode
const keys = ['KeyI', 'KeyK', 'KeyJ', 'KeyL', 'Space', 'KeyC', 'KeyM']

let buffer = ""
let enabled = false

let mode = "free"

let dx = 0
let dy = 0
const accel = 1

let up = false
let down = false
let left = false
let right = false

function updateKursor() {
    kursor.style.left = posX + "px"
    kursor.style.top = posY + "px"
    kursor.style.opacity = enabled ? 1 : 0.5;
}
updateKursor()
kursor.style.opacity = enabled ? 1 : 0.5;

function notif(text) {
    const notif = document.createElement('label')
    notif.className = "notif"
    notif.style.top = posY + "px"
    notif.style.left = posX + "px"
    notif.innerText = text
    document.body.append(notif)

    notif.offsetHeight
    requestAnimationFrame(() => {
        notif.style.opacity = 0
        notif.style.scale = 0
    })
    setTimeout(() => {
        notif.remove()
    }, 1000)
}

function detectInteractables() {
    const interactables = document.querySelectorAll("button, textarea, input, a, [role='button'], select")
    const array = Array.from(interactables)
    return interactables
}

function goToInteractables(direction) {
    const interactables = detectInteractables()
    let closest = null
    let closestDist = Infinity

    for (const ele of interactables) {
        const boundingRect = ele.getBoundingClientRect()
        const targetX = boundingRect.left + (boundingRect.width / 2)
        const targetY = boundingRect.top + (boundingRect.height / 2)
        
        let valid = false
        let dist = 0

        if (direction == "down" && boundingRect.top > posY) {
            valid = true
            dist = boundingRect.top - posY
        } else if (direction == "up" && boundingRect.bottom < posY) {
            valid = true
            dist = posY - boundingRect.bottom
        } else if (direction == "left" && boundingRect.right < posX) {
            valid = true
            dist = posX - boundingRect.right
        } else if (direction == "right" && boundingRect.left > posX) {
            valid = true
            dist = boundingRect.left - posX
        }

        if (valid) {
            const diffX = targetX - posX
            const diffY = targetY - posY
            dist = Math.sqrt((diffX ** 2) + (diffY ** 2))

            if (dist < closestDist) {
                closestDist = dist
                closest = ele
                interactables.forEach(el => el.style.outline = '');
                ele.style.outline = '3px solid dashed yellow';
            }
        }
    }

    if (closest) {
        const boundingRect = closest.getBoundingClientRect()
        posX = boundingRect.left + (boundingRect.width / 2)
        posY = boundingRect.top + (boundingRect.height / 2)
        updateKursor()
        closest.focus()
    }
}

window.addEventListener('keydown', (event) => {
    if (event.altKey && event.code == 'KeyK') {
        enabled = !enabled
        notif(enabled ? "Enabled!" : "Disabled!")
        kursor.style.opacity = enabled ? 1 : 0.5;
    }

    if (keys.includes(event.code) && enabled) {
        event.preventDefault()
        // console.log("hello, world!")
        if (event.code == keys[6]) {
            if (mode == "free") {
                mode = "detector"
            } else {
                mode = "free"
            }

            notif(mode)
        }

        if (mode == "grid") {
            if (event.code == keys[0]) posY = Math.max(0, posY - speed);
            if (event.code == keys[1]) posY = Math.min(window.innerHeight, posY + speed);
            if (event.code == keys[2]) posX = Math.max(0, posX - speed);
            if (event.code == keys[3]) posX = Math.min(window.innerWidth, posX + speed);
        } else if (mode == "free") {
            if (event.code == keys[0]) up = true;
            if (event.code == keys[1]) down = true;
            if (event.code == keys[2]) left = true;
            if (event.code == keys[3]) right = true;
        } else if (mode == "detector") {
            if (event.code == keys[0]) goToInteractables("up");
            if (event.code == keys[1]) goToInteractables("down");
            if (event.code == keys[2]) goToInteractables("left");
            if (event.code == keys[3]) goToInteractables("right");
        }

        if (mode == "free") {
            if (event.code == keys[4]) {
                const eleBelow = document.elementFromPoint(posX, posY)
                document.body.focus()
                if (eleBelow) {eleBelow.click(); eleBelow.focus();}

                kursor.style.width = "13px"
                setTimeout(() => {
                    kursor.style.width = "15px"
                }, 0.1 * 1000)
            }
            if (event.code == keys[5]) {
                const eleBelow = document.elementFromPoint(posX, posY)
                // document.body.focus()
                // if (eleBelow) {eleBelow.click(); eleBelow.focus();}

                const textEle = eleBelow.closest('p, h1, h2, h3, h4, h5, h6, span, li, a, td, button, code')
                const targetEle = textEle || eleBelow
                const textContent = (targetEle.innerText || targetEle.textContent || "").trim()

                // targetEle.select()
                navigator.clipboard.writeText(textContent)
                // alert("Copied Text!")
                notif("Copied!")

                kursor.style.width = "13px"
                setTimeout(() => {
                    kursor.style.width = "15px"
                }, 0.1 * 1000)
            }
        }

        updateKursor()
    }
})

window.addEventListener('keyup', (event) => {
    if (event.code == keys[0]) up = false;
    if (event.code == keys[1]) down = false;
    if (event.code == keys[2]) left = false;
    if (event.code == keys[3]) right = false;
})

function move() {
    if (mode == "free") {
        if (up) {
            dy -= accel
        }
        if (down) {
            dy += accel
        }
        if (left) {
            dx -= accel
        }
        if (right) {
            dx += accel
        }

        dx *= 0.85
        dy *= 0.85

        posX += dx
        posY += dy

        if (posX < 0) posX = 0;
        if (posX > window.innerWidth) posX = window.innerWidth;
        if (posY < 0) posY = 0;
        if (posY > window.innerHeight) posY = window.innerHeight;

        if (posY < 60) {
            window.scrollBy({
                top: -map(posY, 60, 0, 2, 7)
            })
        }

        if (posY > window.innerHeight - 60) {
            window.scrollBy({
                top: map(posY, window.innerHeight - 60, window.innerHeight, 2, 7)
            })
        }
        
    }
    requestAnimationFrame(move)
    updateKursor()
}

requestAnimationFrame(move)
