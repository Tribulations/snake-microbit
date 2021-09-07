function moveRight (xPos: number) {
    led.unplot(x, y)
    if (xPos >= 4) {
        x = 0
    } else {
        x += 1
    }
    led.plot(x, y)
}
function onBKey (_direction: string) {
    if (_direction == "horizontal") {
        moveRight(x)
    } else {
        moveDown(y)
    }
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
input.onButtonPressed(Button.A, function () {
    handleVerticalDirection(direction)
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
function handleVerticalDirection (_direction: string) {
    if (direction == "left") {
        direction = "down"
    } else if (direction == "right") {
        direction = "up"
    } else {
    	
    }
}
function moveSnakeRight (xPosition: number) {
	
}
input.onButtonPressed(Button.AB, function () {
	
})
input.onButtonPressed(Button.B, function () {
	
})
function onAKey (_direction: string) {
    if (_direction == "horizontal") {
        moveLeft(x)
    } else {
        moveUp(y)
    }
}
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
