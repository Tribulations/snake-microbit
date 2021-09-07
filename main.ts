function onAButtonPressed (_direction: string) {
    if (direction == "left") {
        direction = "down"
    } else if (direction == "right") {
        direction = "up"
    } else if (direction == "down") {
        direction = "left"
    } else if (direction == "up") {
        direction = "left"
    } else {
    	
    }
}
function moveRight (xPos: number) {
    led.unplot(x, y)
    if (xPos >= 4) {
        x = 0
    } else {
        x += 1
    }
    led.plot(x, y)
}
function moveUp (yPos: number) {
    led.unplot(x, y)
    if (yPos <= 0) {
        y = 4
    } else {
        y += -1
    }
    led.plot(x, y)
}
function onBButtonPressed (_direction: string) {
    if (direction == "left") {
        direction = "up"
    } else if (direction == "right") {
        direction = "down"
    } else if (direction == "down") {
        direction = "right"
    } else if (direction == "up") {
        direction = "right"
    } else {
    	
    }
}
input.onButtonPressed(Button.A, function () {
    onAButtonPressed(direction)
})
function moveDown (yPos: number) {
    led.unplot(x, y)
    if (yPos >= 4) {
        y = 0
    } else {
        y += 1
    }
    led.plot(x, y)
}
input.onButtonPressed(Button.AB, function () {
	
})
input.onButtonPressed(Button.B, function () {
    onBButtonPressed(direction)
})
function moveLeft (xPos: number) {
    led.unplot(x, y)
    if (xPos <= 0) {
        x = 4
    } else {
        x += -1
    }
    led.plot(x, y)
}
let y = 0
let x = 0
let direction = ""
direction = "left"
x = 2
y = 2
led.plot(x, y)
basic.forever(function () {
	
})
loops.everyInterval(350, function () {
    if (direction == "left") {
        moveLeft(x)
    } else if (direction == "right") {
        moveRight(x)
    } else if (direction == "up") {
        moveUp(y)
    } else if (direction == "down") {
        moveDown(y)
    } else {
    	
    }
})
