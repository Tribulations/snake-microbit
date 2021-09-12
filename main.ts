/**
 * Radio
 */
/**
 * Virtual screen
 */
/**
 * Main
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
    // The increment of "screens" are broadcasted from screen-unit to other screen-units (if any) so that they will be assigned the next screenNo when B is pressed
    // The increment is also received by the controller so it can keep track of no of screens and set a correct "virtual screen size"
    radio.sendString("addscrn")
    screen_no = screens
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
        radio.sendValue("x", x)
        radio.sendValue("y", y)
        radio.sendValue("bright", brightness)
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
/**
 * Render
 */
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
            `).showImage(0, 400)
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
radio.onReceivedValue(function (name, value) {
    // Receives and saves the virtual screen pixel in variables of x,y & brightness sent from the controlle
    if (name == "x") {
        x = value
    } else if (name == "y") {
        y = value
    } else if (name == "bright") {
        bright = value
        // Checks if received pixel is part of actual screenNo and then calls for it to be plotted/unplotted.
        // 
        // If screenNo is 2 or 3, the x-value is adjusted from the "virtual x" to something that could be plotted on the  screen (0->4)
        if (screen_no == 1 && x <= 4) {
            plotPos()
        } else if (screen_no == 2 && (x <= 5 && x <= 9)) {
            x += -5
            plotPos()
        } else if (screen_no == 3 && x <= 10) {
            x += -10
            plotPos()
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
    if (screens == 0) {
        return x_y(5, 5)
    } else if (screens == 1) {
        return x_y(5, 5)
    } else if (screens == 2) {
        return x_y(10, 5)
    } else if (screens == 3) {
        return x_y(15, 5)
    } else {
        return x_y(5, 5)
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
let do_round_round_loop_result = ""
let snake_positions: number[] = []
let snake_length_goal = 0
let last_traveled_direction: number[] = []
let running = false
let board: number[] = []
let getset_at_2d_index = 0
let y = 0
let x: any = null
let bright = 0
let direction: number[] = []
let board_size: number[] = []
let screen_no = 0
let screens = 0
let role = ""
let type__intensity: number[] = []
let add_vectors_output: number[] = []
let tone_queue: number[] = []
let XY: string[] = []
XY = ["x", "y"]
tone_queue = []
add_vectors_output = [0, 0]
// See "board value" function for the order / names of the types of objects that can be on the board.
type__intensity = [
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
