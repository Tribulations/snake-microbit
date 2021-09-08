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
function board_get_at (pos: any[]) {
    getset_at_2d_index = _2d_index(pos)
    if (getset_at_2d_index == -1) {
        return -1
    }
    return board[getset_at_2d_index]
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
function board_set_at (pos: any[], value: number) {
    getset_at_2d_index = _2d_index(pos)
    if (getset_at_2d_index == -1) {
        return -1
    }
    board[getset_at_2d_index] = value
    return value
}
function init_image_lists () {
    image_list__score = [images.createImage(`
        . # . . #
        # . . # .
        . # . # .
        # . . . #
        . . . . .
        `), images.createImage(`
        # # . # #
        # # . # .
        # # . # .
        . . . . .
        . . . . .
        `), images.createImage(`
        . . . # .
        . . # . #
        . . # . .
        . . . # #
        . . . . .
        `)]
    image_list__RIP = [images.createImage(`
        # # . . #
        # . # . #
        # # . . #
        # . # . #
        # . # . #
        `), images.createImage(`
        . . # # .
        . . # . #
        . . # # .
        . . # . .
        . . # . .
        `)]
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
function show_end_message (_type: string) {
    led.setBrightness(255)
    basic.clearScreen()
    basic.showNumber(snake_length_goal)
    if (_type == "win") {
        blink_images(image_list__score, 1)
    } else if (_type == "loss") {
        blink_images(image_list__RIP, 1)
    }
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
function get_letter (letter: string) {
    if (letter == "W") {
        return images.createImage(`
            # . . . #
            # . . . #
            # . # . #
            # . # . #
            . # . # .
            `)
    } else if (letter == "O") {
        return images.createImage(`
            . . # . .
            . # . # .
            . # . # .
            . # . # .
            . . # . .
            `)
    } else if (letter == "R") {
        return images.createImage(`
            . # # . .
            . # . # .
            . # # . .
            . # . # .
            . # . # .
            `)
    } else if (letter == "I") {
        return images.createImage(`
            . # # # .
            . . # . .
            . . # . .
            . . # . .
            . # # # .
            `)
    } else if (letter == "P") {
        return images.createImage(`
            . # # # .
            . # . # .
            . # # # .
            . # . . .
            . # . . .
            `)
    } else {
        return images.createImage(`
            # . . . #
            . # . # .
            . . . . .
            . # . # .
            # . . . #
            `)
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
function animate_score_count () {
    while (true) {
        for (let index = 0; index <= board.length - 1; index++) {
            if (board[index] != 0) {
                let list: number[] = []
                for (let element of list) {
                	
                }
            }
        }
    }
}
function round_loop () {
    head_pos = vec_from_2d_index(snake_positions[0])
    next_head_pos = add_vectors(head_pos, direction)
    next_head_pos_value = board_get_at(next_head_pos)
    if (next_head_pos_value != 0) {
        if (next_head_pos_value == 3) {
            snake_length_goal += 1
            if (snake_length_goal >= board.length) {
                show_end_message("win")
                return "end"
            }
            spawn_fruit()
        } else {
            show_end_message("loss")
            return "end"
        }
    }
    snake_positions.unshift(_2d_index(next_head_pos))
    board_set_at(head_pos, 1)
    board_set_at(next_head_pos, 2)
    if (!(snake_positions.length <= snake_length_goal)) {
        board[snake_positions.pop()] = 0
    }
    return ""
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
function blink_letters (text: string, speed_multiplier: number) {
    blink_letters_letter_images = []
    for (let index = 0; index <= text.length - 1; index++) {
        blink_letters_letter_images.push(get_letter(text.charAt(index)))
    }
    blink_images(blink_letters_letter_images, speed_multiplier)
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
let blink_letters_letter_images: Image[] = []
let next_head_pos_value = 0
let next_head_pos: number[] = []
let head_pos: number[] = []
let rotate_vector_new: number[] = []
let n: any = null
let spawn_fruit_attempt = 0
let cell_value = 0
let render_y = 0
let image_list__RIP: Image[] = []
let image_list__score: Image[] = []
let direction: any = null
let snake_positions: number[] = []
let snake_length_goal = 0
let board: number[] = []
let getset_at_2d_index = 0
let image_blink_ms = 0
let board_size: number[] = []
let add_vectors_output: number[] = []
let XY: string[] = []
XY = ["x", "y"]
add_vectors_output = [0, 0]
board_size = x_y(5, 5)
init_image_lists()
image_blink_ms = 64
basic.forever(function () {
    do_round()
})
