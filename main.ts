/**
 * Main
 */
/**
 * Render
 */
/**
 * Numbers
 */
// add error?
function vec (vector: any[], component: string) {
    if (component == "x") {
        return vector[0]
    } else if (component == "y") {
        return vector[1]
    }
}
function act_as_screen () {
    screens += 1
    basic.showNumber(screens)
    screenPairing(screens)
}
function set_vec (vector: any[], component: string, value: number) {
    if (component == "x") {
        vector[0] = value
    } else if (component == "y") {
        vector[1] = value
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
// You cannot enter NaN. This can be used to enter it.
function NaN2 () {
    return 1 / 0
}
function act_as_controller () {
    board_size = get_virtual_screen_size()
    // To avoid error if button is pressed before the game starts
    direction = x_y(0, 1)
    radio.sendString("controller")
    while (true) {
        do_round()
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
    snake_length_goal = 2
    snake_positions = [_2d_index(x_y(2, 0))]
    spawn_fruit()
    direction = x_y(0, 1)
    round_loop()
    while (!(input.buttonIsPressed(Button.A) || input.buttonIsPressed(Button.B))) {
        // To avoid stopping progress on tone queue
        basic.pause(5)
    }
    que_start_chime()
    running = true
    while (true) {
        do_round_round_loop_result = round_loop()
        if (do_round_round_loop_result != "") {
            show_end_message(do_round_round_loop_result)
            break;
        }
        basic.pause(400)
    }
    running = false
}
function board_set_at (pos: any[], value: number) {
    getset_at_2d_index = _2d_index(pos)
    if (getset_at_2d_index == -1) {
        return -1
    }
    board[getset_at_2d_index] = value
    update_virtual_screen_pixel(pos, type__intensity[value])
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
            if (menu > menuChoices) {
                menu = 1
            }
            if (menu == 1) {
                images.createImage(`
                    . . # . .
                    . # # . .
                    . . # . .
                    . . # . .
                    . # # # .
                    `).showImage(0, 0)
            } else if (menu == 2) {
                images.createImage(`
                    . # # . .
                    . . . # .
                    . . # # .
                    . # . . .
                    . # # # .
                    `).showImage(0, 0)
            }
        } else if (button == 1) {
            if (menu == 1) {
                role = "controller"
                inTheMenu = false
                act_as_controller()
            } else if (menu == 2) {
                role = "screen"
                inTheMenu = false
                act_as_screen()
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
// needed because some functions like "array get value at index" complains
function coerce_to_number (probably_number: number) {
    return parseFloat(convertToText(probably_number))
}
// TODO: Spelet har abstraherat bort skärmen. Byt ut den här implementeringen av en "virtual screen" med en som stöder flera skärmar.
function update_virtual_screen_pixel (pos: any[], brightness: number) {
    x = vec(pos, "x")
    y = vec(board_size, "y") - 1 - vec(pos, "y")
    // Erik M, test att spegla skärm. Skickar x, y och brightness
    radio.sendValue("x", x)
    radio.sendValue("y", y)
    radio.sendValue("brightness", brightness)
    if (brightness == 0) {
        led.unplot(x, y)
    } else {
        led.plotBrightness(x, y, brightness)
    }
}
function queue_tone (tone: number, duration: number) {
    tone_queue.push(tone)
    tone_queue.push(duration)
}
function vec_from_2d_index (_2d_index2: number) {
    return x_y(_2d_index2 % vec(board_size, "x"), Math.floor(_2d_index2 / vec(board_size, "x")))
}
function show_end_message (_type: string) {
    led.setBrightness(255)
    basic.clearScreen()
    if (_type == "win") {
    	
    } else if (_type == "loss") {
        queue_tone(200, 200)
        queue_tone(200 * 2 ** -1, 500)
        // This is supposed to be a skull...
        images.createImage(`
            . # # # .
            # . # . #
            # # . # #
            . # # # .
            . # . # .
            `).showImage(0, image_blink_ms)
        basic.pause(700)
    }
}
function spawn_fruit () {
    while (true) {
        spawn_fruit_attempt = randint(0, board.length - 1)
        if (board[spawn_fruit_attempt] == board_value("air")) {
            board_set_at(vec_from_2d_index(spawn_fruit_attempt), board_value("fruit"))
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
function clear_virtual_screen () {
    basic.clearScreen()
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
    return coerce_to_number(vec(pos, "x") + vec(pos, "y") * vec(board_size, "x"))
}
radio.onReceivedString(function (receivedString) {
    if (receivedString == "controller" && role == "screen") {
        radio.sendNumber(screens)
        radio.sendString(screen_place)
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
function screenPairing (screen_number: number) {
    if (screen_number == 1) {
        screen_place = "left"
        // Erik M, tömmer skärm för att kunna ta emot pixlar
        basic.clearScreen()
    } else if (screen_number == 2) {
        screen_place = "right"
    }
}
radio.onReceivedValue(function (name, value) {
    if (name == "x") {
        Xreceived = value
    } else if (name == "y") {
        Yreceived = value
    } else if (name == "brightness") {
        Breceived = value
        // Erik M, plottar/unplottar när 3e parametern "brightness" är mottagen
        if (Breceived == 0) {
            led.unplot(Xreceived, Yreceived)
        } else {
            led.plotBrightness(Xreceived, Yreceived, Breceived)
        }
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
function on_eat_fruit () {
    queue_tone(523, 80)
    queue_tone(659, 40)
    queue_tone(698, 40)
    queue_tone(784, 40)
    snake_length_goal += 1
    spawn_random_n_of_fruits()
}
function round_loop () {
    head_pos = vec_from_2d_index(snake_positions[0])
    next_head_pos = add_vectors(head_pos, direction)
    if (last_traveled_direction != direction) {
        queue_tone(523, 20)
    }
    last_traveled_direction = direction
    next_head_pos_value = board_get_at(next_head_pos)
    if (next_head_pos_value != board_value("air")) {
        if (next_head_pos_value == board_value("fruit")) {
            on_eat_fruit()
            if (snake_length_goal >= board.length) {
                return "win"
            }
        } else {
            return "loss"
        }
    }
    snake_positions.unshift(_2d_index(next_head_pos))
    board_set_at(head_pos, board_value("tail"))
    board_set_at(next_head_pos, board_value("head"))
    if (!(snake_positions.length <= snake_length_goal)) {
        board_set_at(vec_from_2d_index(snake_positions.pop()), board_value("air"))
    }
    return ""
}
function get_virtual_screen_size () {
    // if screens = 3?
    if (screens == 0) {
        return x_y(5, 5)
    } else if (screens == 1) {
        return x_y(5, 5)
    } else if (screens == 2) {
        return x_y(10, 5)
    } else if (screens == 4) {
        return x_y(10, 10)
    } else {
        return x_y(5, 5)
    }
}
function blink_images (images2: any[], speed_multiplier: number) {
    basic.clearScreen()
    for (let index = 0; index <= images2.length - 1; index++) {
        images2[index].showImage(0)
        basic.pause(image_blink_ms * speed_multiplier)
    }
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
function show_main_menu () {
    // Nice
    radio.setGroup(69)
    basic.showLeds(`
        . # . . #
        # . # # #
        # # # . #
        # . # . #
        # . # . #
        `)
    menuChoices = 2
    menu = 0
    inTheMenu = true
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
let Breceived = 0
let Yreceived = 0
let Xreceived = 0
let rotate_vector_new: number[] = []
let screen_place = ""
let n: any = null
let spawn_fruit_attempt = 0
let y = 0
let x: any = null
let inTheMenu = false
let menuChoices = 0
let menu = 0
let do_round_round_loop_result = ""
let snake_positions: number[] = []
let snake_length_goal = 0
let last_traveled_direction: number[] = []
let running = false
let board: number[] = []
let getset_at_2d_index = 0
let direction: number[] = []
let board_size: number[] = []
let screens = 0
let role = ""
let type__intensity: number[] = []
let image_blink_ms = 0
let add_vectors_output: number[] = []
let tone_queue: number[] = []
let XY: string[] = []
XY = ["x", "y"]
tone_queue = []
add_vectors_output = [0, 0]
image_blink_ms = 300
// See "board value" function for the order / names of the types of objects that can be on the board.
type__intensity = [
0,
100,
200,
255
]
role = "undetermined"
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
