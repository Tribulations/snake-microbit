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
function set_vec (vector: any[], component: string, value: number) {
    if (component == "x") {
        vector[0] = value
    } else if (component == "y") {
        vector[1] = value
    }
}
// You cannot enter NaN. This can be used to enter it.
function NaN2 () {
    return 1 / 0
}
function do_round () {
    board = []
    snake_length_goal = 2
    snake_positions = [_2d_index(x_y(2, 2))]
    direction = x_y(1, 0)
    for (let index = 0; index < vec(board_size, "x") * vec(board_size, "y"); index++) {
        board.push(0)
    }
    spawn_fruit()
    while (round_loop() != "end") {
        render_board()
        basic.pause(500)
    }
}
input.onButtonPressed(Button.A, function () {
    direction = rotate_vector(direction, -1)
})
/**
 * Board
 */
function render_board () {
    for (let x = 0; x <= vec(board_size, "x") - 1; x++) {
        for (let y = 0; y <= vec(board_size, "y") - 1; y++) {
            // The LED in the top-left corner is (0, 0). Convert to "positive is up", as seen in math. It makes clockwise make sense in "rotate vector".
            render_y = vec(board_size, "y") - 1 - y
            cell_value = board[_2d_index(x_y(x, y))]
            led.unplot(x, render_y)
            // tail
            // head
            // fruit
            if (cell_value == 1) {
                led.plotBrightness(x, render_y, 99)
            } else if (cell_value == 2) {
                led.plotBrightness(x, render_y, 142)
            } else if (cell_value == 3) {
                led.plotBrightness(x, render_y, 255)
            }
        }
    }
}
// needed because some functions like "array get value at index" complains
function coerce_to_number (probably_number: number) {
    return parseFloat(convertToText(probably_number))
}
function vec_from_2d_index (_2d_index2: number) {
    return x_y(_2d_index2 % vec(board_size, "x"), Math.floor(_2d_index2 / vec(board_size, "x")))
}
function show_end_message (message: string) {
    led.setBrightness(255)
    basic.clearScreen()
    // FIXME: Text has inconsistent brightness
    basic.showString(message)
    basic.pause(2000)
}
function spawn_fruit () {
    while (true) {
        spawn_fruit_attempt = randint(0, board.length - 1)
        if (board[spawn_fruit_attempt] == 0) {
            board[spawn_fruit_attempt] = 3
            break;
        }
    }
}
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
input.onButtonPressed(Button.B, function () {
    direction = rotate_vector(direction, 1)
})
function is_pos_outside (pos: any[]) {
    return _2d_index(pos) == -1
}
function round_loop () {
    head_pos = vec_from_2d_index(snake_positions[0])
    next_head_pos = add_vectors(head_pos, direction)
    next_head_pos_value = board[_2d_index(next_head_pos)]
    if (next_head_pos_value != 0) {
        if (next_head_pos_value == 3) {
            snake_length_goal += 1
            if (snake_length_goal >= board.length) {
                show_end_message("WOW")
                return "end"
            }
            spawn_fruit()
        } else {
            show_end_message("RIP")
            return "end"
        }
    }
    snake_positions.unshift(_2d_index(next_head_pos))
    board[_2d_index(head_pos)] = 1
    board[_2d_index(next_head_pos)] = 2
    if (!(snake_positions.length <= snake_length_goal)) {
        board[snake_positions.pop()] = 0
    }
    return ""
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
let cell_value = 0
let render_y = 0
let direction: any = null
let snake_positions: number[] = []
let snake_length_goal = 0
let board: number[] = []
let board_size: number[] = []
let add_vectors_output: number[] = []
let XY: string[] = []
XY = ["x", "y"]
add_vectors_output = [0, 0]
board_size = x_y(5, 5)
basic.forever(function () {
    do_round()
})
