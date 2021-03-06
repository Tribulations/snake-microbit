/**
 * Virtual screen
 */
/**
 * Main
 */
/**
 * Render
 */
/**
 * Numbers
 */
function trackScore () {
    led.setBrightness(25)
    led.plotBarGraph(
    snake_length_goal__score,
    board.length
    )
}
// add error?
function vec (vector: any[], component: string) {
    if (component == "x") {
        return vector[0]
    } else if (component == "y") {
        return vector[1]
    }
}
/**
 * Radio
 */
function act_as_screen () {
    screens += 1
    // The increment of "screens" are broadcasted from screen-unit to other screen-units (if any) so that they will be assigned the next screenNo when B is pressed
    // The increment is also received by the controller so it can keep track of no of screens and set a correct "virtual screen size"
    radio.sendString("addscrn")
    screen_no = screens
    board_size = get_virtual_screen_size()
    board = []
    for (let index = 0; index < vec(board_size, "x") * vec(board_size, "y"); index++) {
        board.push(board_value("air"))
    }
    // screenNo is the units ID so it will know its position on the board (1 - 2 - 3)
    basic.showNumber(screen_no)
}
function set_vec (vector: any[], component: string, value: number) {
    if (component == "x") {
        vector[0] = value
    } else if (component == "y") {
        vector[1] = value
    }
}
function render_fruits () {
    for (let value of fruit_positions) {
        update_virtual_screen_pixel(vec_from_2d_index(value), Math.round(126 + Math.sin(input.runningTime() / 250) * 126))
    }
}
// Called whenever a button changes state. The button is identified by its X position where the logo is at 0.
function on_button (button: number, down: boolean) {
    if (role == "controller") {
        controller_on_button(button, down)
    } else if (role == "undetermined") {
        undetermined_on_button(button, down)
    }
}
control.onEvent(101, EventBusValue.MICROBIT_EVT_ANY, function () {
    act_as_screen()
})
function act_as_controller () {
    board_size = get_virtual_screen_size()
    // To avoid error if button is pressed before the game starts
    direction = x_y(0, 1)
    while (true) {
        do_round()
    }
}
function plotPos () {
    if (bright == 0) {
        led.unplot(x, y)
    } else {
        led.plotBrightness(x, y, bright)
    }
}
function board_get_at (pos: any[]) {
    getset_at_2d_index = _2d_index(pos)
    if (getset_at_2d_index == -1) {
        return -1
    }
    return board[getset_at_2d_index]
}
function controller_on_button (button: number, down: boolean) {
    if (down && running && last_traveled_direction == direction) {
        direction = rotate_vector(direction, button)
        queue_tone(466, 50)
    }
}
function do_round () {
    clear_board()
    snake_length_goal__score = 2
    snake_positions = [_2d_index(x_y(2, 0))]
    fruit_positions = []
    direction = x_y(0, 1)
    update_snake()
    spawn_fruit()
    while (!(input.buttonIsPressed(Button.A) || input.buttonIsPressed(Button.B))) {
        // To avoid stopping progress on tone queue
        basic.pause(5)
    }
    while (input.buttonIsPressed(Button.A) || input.buttonIsPressed(Button.B)) {
        basic.pause(5)
    }
    que_start_chime()
    running = true
    while (true) {
        basic.pause(16)
        render_fruits()
        if (input.runningTime() - last_snake_update > 350) {
            // In case the game is paused by shaking.
            if (running == true) {
                round_end_state = ""
                update_snake()
                last_snake_update = input.runningTime()
                if (round_end_state != "") {
                    end_round(round_end_state)
                    break;
                }
            }
        }
    }
    running = false
}
function board_set_at (pos: any[], value: number) {
    getset_at_2d_index = _2d_index(pos)
    if (getset_at_2d_index == -1) {
        return -1
    }
    board[getset_at_2d_index] = value
    update_virtual_screen_pixel(pos, value)
    return value
}
function spawn_random_n_of_fruits () {
    spawn_fruit()
    if (randint(1, 15) == 15) {
        spawn_random_n_of_fruits()
    }
}
function undetermined_on_button (button: number, down: boolean) {
    if (down) {
        if (button == -1) {
            menu += 1
            if (menu > menu_choices) {
                menu = 1
            }
            if (menu == 1) {
                // C = Controller
                images.createImage(`
                    . . # # .
                    . # . . .
                    . # . . .
                    . # . . .
                    . . # # .
                    `).showImage(0, 0)
            } else if (menu == 2) {
                // S = Screen
                images.createImage(`
                    . . # # .
                    . # . . .
                    . . # . .
                    . . . # .
                    . # # . .
                    `).showImage(0, 0)
            }
        } else if (button == 1) {
            if (menu == 1) {
                role = "controller"
                in_the_menu = false
                control.raiseEvent(
                100,
                EventBusValue.MICROBIT_EVT_ANY
                )
            } else if (menu == 2) {
                role = "screen"
                in_the_menu = false
                control.raiseEvent(
                101,
                EventBusValue.MICROBIT_EVT_ANY
                )
            }
        }
    }
}
function clear_board () {
    clear_virtual_screen()
    board = []
    for (let index = 0; index < vec(board_size, "x") * vec(board_size, "y"); index++) {
        board.push(board_value("air"))
    }
}
function update_virtual_screen_pixel (pos: any[], brightness: number) {
    x = vec(pos, "x")
    y = vec(board_size, "y") - 1 - vec(pos, "y")
    // Sends x,y & brightness to the Screens if at least 1 screen have been registered
    // Else: plots screen pixel on controller screen
    if (screens > 0) {
        radio.sendValue("pixel", _2d_index(pos) + brightness * board.length)
    } else {
        bright = brightness
        plotPos()
    }
}
function queue_tone (tone: number, duration: number) {
    tone_queue.push(tone)
    tone_queue.push(duration)
}
function vec_from_2d_index (_2d_index2: number) {
    return x_y(_2d_index2 % vec(board_size, "x"), Math.floor(_2d_index2 / vec(board_size, "x")))
}
function spawn_fruit () {
    while (true) {
        spawn_fruit_attempt = randint(0, board.length - 1)
        if (board[spawn_fruit_attempt] == board_value("air")) {
            board_set_at(vec_from_2d_index(spawn_fruit_attempt), board_value("fruit"))
            fruit_positions.push(spawn_fruit_attempt)
            break;
        }
    }
}
control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_EVT_ANY, function () {
    on_button(1, control.eventValue() == EventBusValue.MICROBIT_BUTTON_EVT_DOWN)
})
function que_start_chime () {
    queue_tone(262, 80)
    queue_tone(330, 80)
    queue_tone(392, 80)
}
function end_round (message_type: string) {
    fruit_positions = []
    led.setBrightness(255)
    basic.clearScreen()
    if (message_type == "win") {
        for (let index = 0; index < 2; index++) {
            queue_tone(262, 80)
            queue_tone(330, 80)
            queue_tone(392, 80)
            queue_tone(523, 200)
        }
        basic.showString("You win!")
    } else if (message_type == "loss") {
        queue_tone(200, 200)
        queue_tone(200 * 2 ** -1, 500)
        // This is supposed to be a skull...
        images.createImage(`
            . # # # .
            # . # . #
            # # . # #
            . # # # .
            . # . # .
            `).showImage(0, 400)
        basic.pause(700)
    }
    basic.clearScreen()
    basic.showNumber(snake_length_goal__score)
    basic.pause(700)
}
function clear_virtual_screen () {
    basic.clearScreen()
    radio.sendString("clrscrn")
}
/**
 * Board
 */
// because arrays cannot store other arrays we are forced to flatten vectors to a single index
function _2d_index (pos: any[]) {
    for (let xy of XY) {
        n = vec(pos, xy)
        if (!(0 <= n && n < vec(board_size, xy))) {
            return -1
        }
    }
    return vec(pos, "x") + vec(pos, "y") * vec(board_size, "x")
}
radio.onReceivedString(function (receivedString) {
    if (receivedString == "addscrn") {
        screens += 1
    } else if (receivedString == "clrscrn") {
        basic.clearScreen()
    }
})
// Rotate in 90 degree turns.
// + clockwise
// - counter-clockwise
function rotate_vector (vector: any[], turns: number): any {
    if (turns == 0) {
        return vector
    }
    if (turns < 0) {
        rotate_vector_new = x_y(0 - vec(vector, "y"), vec(vector, "x"))
    } else {
        rotate_vector_new = x_y(vec(vector, "y"), 0 - vec(vector, "x"))
    }
    // We have rotated one turn closer to the base case of turns = 0. Recurse with one less turn in the same direction.
    return rotate_vector(rotate_vector_new, sign(turns) * (Math.abs(turns) - 1))
}
input.onGesture(Gesture.Shake, function () {
    if (running == true) {
        running = false
    } else {
        running = true
    }
})
function update_snake () {
    head_pos = vec_from_2d_index(snake_positions[0])
    next_head_pos = add_vectors(head_pos, direction)
    if (last_traveled_direction != direction) {
        queue_tone(523, 20)
    }
    last_traveled_direction = direction
    next_head_pos_value = board_get_at(next_head_pos)
    if (fruit_positions.indexOf(_2d_index(next_head_pos)) != -1) {
        on_eat_fruit(next_head_pos)
    } else if (next_head_pos_value != board_value("air")) {
        round_end_state = "loss"
    }
    if (snake_positions.length >= snake_length_goal__score) {
        board_set_at(vec_from_2d_index(snake_positions.pop()), board_value("air"))
    }
    snake_positions.unshift(_2d_index(next_head_pos))
    for (let index = 0; index <= snake_positions.length - 1; index++) {
        board_set_at(vec_from_2d_index(snake_positions[snake_positions.length - 1 - index]), index / (snake_positions.length - 1) * 255 + 1)
    }
}
radio.onReceivedValue(function (name, value) {
    // Receives and saves the virtual screen pixel in variables of x,y & brightness sent from the controlle
    if (name == "x") {
        x = value
    } else if (name == "y") {
        y = value
    } else if (name == "bright") {
        bright = value
    } else if (name == "pixel") {
        bright = Math.idiv(value, board.length)
        x = vec(vec_from_2d_index(value % board.length), "x")
        y = vec(vec_from_2d_index(value % board.length), "y")
    } else {
    	
    }
    x += -5 * (screen_no - 1)
    // Checks if received pixel is part of actual screenNo and then calls for it to be plotted/unplotted.
    // 
    // If screenNo is 2 or 3, the x-value is adjusted from the "virtual x" to something that could be plotted on the  screen (0->4)
    if (0 <= x && x < 5) {
        plotPos()
    }
})
function board_value (name: string) {
    if (name == "air") {
        return 0
    } else if (name == "tail") {
        return 1
    } else if (name == "head") {
        return 2
    } else if (name == "fruit") {
        return 3
    }
    return -1
}
control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_A, EventBusValue.MICROBIT_EVT_ANY, function () {
    on_button(-1, control.eventValue() == EventBusValue.MICROBIT_BUTTON_EVT_DOWN)
})
function on_eat_fruit (pos: any[]) {
    queue_tone(523, 80)
    queue_tone(659, 40)
    queue_tone(698, 40)
    queue_tone(784, 40)
    fruit_positions.removeAt(fruit_positions.indexOf(_2d_index(pos)))
    snake_length_goal__score += 1
    if (screens > 0) {
        trackScore()
    }
    if (snake_length_goal__score >= board.length) {
        round_end_state = "win"
    } else {
        spawn_fruit()
    }
}
function get_virtual_screen_size () {
    return x_y(screens * 5, 5)
}
function add_vectors (a: any[], b: any[]) {
    for (let xy of XY) {
        set_vec(add_vectors_output, xy, vec(a, xy) + vec(b, xy))
    }
    return add_vectors_output
}
function sign (n: number) {
    if (n > 0) {
        return 1
    } else if (n < 0) {
        return -1
    }
    return 0
}
control.onEvent(100, EventBusValue.MICROBIT_EVT_ANY, function () {
    act_as_controller()
})
function show_main_menu () {
    // Nice
    radio.setGroup(69)
    // For simulator only, to make 2nd Micro:bit appear
    radio.sendNumber(0)
    basic.showLeds(`
        . # . . #
        # . # # #
        # # # . #
        # . # . #
        # . # . #
        `)
    menu_choices = 2
    menu = 0
    in_the_menu = true
}
/**
 * Vector
 */
function x_y (x: number, y: number) {
    return [x, y]
}
// -1 because as starting at 0 means the total number of iterations is n + 1
// (kind of weird to have everything start at zero but not add a cleaner way to iterate up to but not including a number like length of an array)
// -1 because we have already added a zero in the beginning to help with type inference
let next_head_pos_value = 0
let next_head_pos: number[] = []
let head_pos: number[] = []
let rotate_vector_new: number[] = []
let n: any = null
let spawn_fruit_attempt = 0
let in_the_menu = false
let menu_choices = 0
let menu = 0
let round_end_state = ""
let last_snake_update = 0
let snake_positions: number[] = []
let last_traveled_direction: number[] = []
let running = false
let getset_at_2d_index = 0
let y = 0
let x: any = null
let bright = 0
let direction: number[] = []
let fruit_positions: number[] = []
let board_size: number[] = []
let screen_no = 0
let board: number[] = []
let snake_length_goal__score = 0
let screens = 0
let role = ""
let add_vectors_output: number[] = []
let tone_queue: number[] = []
let XY: string[] = []
XY = ["x", "y"]
tone_queue = []
add_vectors_output = [0, 0]
// See "board value" function for the order / names of the types of objects that can be on the board.
let type__intensity = [
0,
150,
255,
25
]
role = "undetermined"
screens = 0
show_main_menu()
control.inBackground(function () {
    while (true) {
        if (tone_queue.length >= 2) {
            music.ringTone(tone_queue.shift())
            basic.pause(tone_queue.shift())
        } else {
            music.stopAllSounds()
            basic.pause(1)
        }
    }
})
