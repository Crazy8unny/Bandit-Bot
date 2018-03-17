exports.XO = `
**Noughts and Crosses** (also known as **tic tac toe**, or **XO**) is a simple and fun game for two players, X and O, who take turns marking the spaces in a 3×3 grid. The player who succeeds in placing three of their marks in a horizontal, vertical, or diagonal row wins the game.

When you start a game of **Noughts and Crosses** with someone, you will need to place your marker (either an **X** or an **O**) on the grid. To do this, you must specify a number from 1-9. Each number represents a square on the grid. \`1\` would be top-left and \`9\`would be bottom right, \`5\` would be the middle square and so on. The person who initiates the game will be player 1 and will play as **X**. The second player will be playing as **O**. **X** will start the match by simply typing a message containing the number of the palce they want to play in _only_! If the message contains any characters other than a number between 1 and 9, nothing will happen. Whenever a new mark is placed, the bot will resend the image of the board. This way you can view the history of the game.

__**Note: You can only play in 1 game at once!**__
`

exports.TwentyOne = `
**Twenty One** (also known as **21**) is a turn-based game where each player can count up 3 consecutive numbers from the current number. The players have to try **not** to say **21**, beacause the user who has to say **21** immediately loses! 

When a game of **21** is initiated, other players need to join (you cannot play against yourself!) and so you are given a gameID. For other players to join your game, they need to write \`~join <game ID>\`, which automatically joins them to the game they specified. To play, you need to specify the number you wish to go to, but you can only go up by a maximum of 3! For example, if the number is 12 and I want to go to 15, instead of typeing \`13, 14, 15\`, I would simply write \`15\`! The turns are ordered chronologically in the way of joining (i.e. the turns are according to when you join - if you join the game second, you would have your turn second!). The player who initiates the game is always the first player.
`

exports.Coinflip = `
**Coinflip** is a very basic game - probably the most simple game ever! All it is is flipping a coin. When \`~coinflip\` is sent, the bot flips a coin for you and sends you back the result. This is a 1 player game.
`

exports.on = false;