exports.placeXO = function(message, games, i_X, i_O, basFunc)
{
    for (let gameID in games.XO)
    {
        let game = games.XO[gameID];
        if (game.players && game.players.includes(message.author.id))
        {
            let input = message.content;
            if (game.turn == game.players.indexOf(message.author.id) + 1)
            {
                if (game.board[input - 1] == "-")
                {
                    let marker = game.turn == 1 ? i_X : i_O;

                    let xCoord = ((input - 1) % 3) * 64 + ((input > 3 ? input - 3 > 3 ? input - 6 : input - 3 : input)) * 3;
                    let yCoord = Math.floor((input - 1) / 3) * 64 + Math.ceil(input / 3) * 3;

                    game.boardImage.composite(marker, xCoord, yCoord);
                    basFunc(game.boardImage, message, "Board:");

                    game.board[input - 1] = game.players.indexOf(message.author.id) == 0 ? "X" : "O";
                  
                    let winner = checkXOBoard(game.board);
                  
                    if (winner != "-")
                    {
                        if (winner == "X") 
                        {
                            message.channel.send("Well Done, " + game.players.);
                        }
                    }
                    
                    game.turn = 3 - game.turn;
                }
                else
                {
                    message.channel.send("That space is taken up already, " + message.author + "!");
                }
            }
            else
            {
                message.channel.send("It is not your turn, " + message.author + "!");
            }
        }
    }
}

function checkXOBoard(board)
{
    let marks = ["X", "O"];
    for (let i = 0; i < marks.length; i++)
    {
        let mark = marks[i];
        if (board[0] == mark && board[1] == mark && board[2] == mark)
        {
            return mark;
        }
        if (board[3] == mark && board[4] == mark && board[5] == mark)
        {
            return mark;
        }
        if (board[6] == mark && board[7] == mark && board[8] == mark)
        {
            return mark;
        }
        if (board[0] == mark && board[3] == mark && board[6] == mark)
        {
            return mark;
        }
        if (board[1] == mark && board[4] == mark && board[7] == mark)
        {
            return mark;
        }
        if (board[2] == mark && board[5] == mark && board[8] == mark)
        {
            return mark;
        }
        if (board[0] == mark && board[4] == mark && board[8] == mark)
        {
            return mark;
        }
        if (board[2] == mark && board[4] == mark && board[6] == mark)
        {
            return mark;
        }
    }
    return "-";
}