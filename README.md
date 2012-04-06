These are my solutions to the challenges presented by Thumbtack
You can find the challenges here: http://www.thumbtack.com/challenges
I had fun doing the challenges, they were easy to understand, yet had a subtle complexity that made them interesting.

## Problem 1: Minesweeper
In Javascript, create a version of the classic game of Minesweeper.

# Rules of Minesweeper

Minesweeper is a grid of tiles, each of which may or may not cover hidden mines. The goal is to click on ever tile except those that have mines. When a user clicks a tile, one of two things happens. If the tile was covering a mine, the mine is revealed and the game ends in failure. If the tile was not covering a mine, it instead reveals the number of adjacent (including diagonals) tiles that are covering mines. When the user is confident that all tiles not containing mines have been clicked, the user presses a Validate button (often portrayed as a smiley-face icon) that checks the clicked tiles: if the user is correct, the game ends in victory, if not, the game ends in failure.

# Design constraints
* Use HTML, CSS, and Javascript (including jQuery, should you desire) to craft your solution.
* You may target your solution to a specific browser.
* The board should be an 8x8 grid and by default 10 hidden mines are randomly placed into the board.
* The interface should support these three functions:
* New Game - start a new, randomly generated game.
* Validate - check that a user has correctly marked all the tiles and end the game in either victory or failure.
* Cheat - in any manner you deem appropriate, reveal the locations of the mines without ending the game.

## Problem 2: Simple Database
You task is create a very simple database, which has a very limited command set. We aren't going to be storing that much data, so you don't have to worry about storing anything on disk; in-memory is fine. All of the commands are going to be fed to you one line at a time via stdin, and your job is the process the commands and perform whatever operation the command dictates. Here are the basic commands you need to handle:

* SET [name] [value]: Set a variable [name] to the value [value]. Neither variable names or values will ever contain spaces.
* GET [name]: Print out the value stored under the variable [name]. Print NULL if that variable name hasn't been set.
* UNSET [name]: Unset the variable [name]
* END: Exit the program
So here is a sample input:

SET a 10
GET a
UNSET a
GET a
END
And its corresponding output:

10
NULL
Now, as I said this was a database, and because of that we want to add in a few transactional features to help us maintain data integrity. So there are 3 additional commands you will need to support:

* BEGIN: Open a transactional block
* ROLLBACK: Rollback all of the commands from the most recent transaction block. If no transactional block is open, print out INVALID ROLLBACK
* COMMIT: Permanently store all of the operations from any presently open transactional blocks
Our database supports nested transactional blocks as you can tell by the above commands. Remember, ROLLBACK only rolls back the most recent transaction block, while COMMIT closes all open transactional blocks. Any command issued outside of a transactional block commits automatically.

Even though we aren't dealing with a ton of data, we still want to use memory efficiently. Typically, we will already have committed a lot of data when we begin a new transaction, but the transaction will only modify a few values. So, your solution should be efficient about how much memory is allocated for new transactions, i.e., it is bad if beginning a transaction nearly doubles your program's memory usage.

## Problem 4: Request Matching
Our goal here at Thumbtack is to connect consumers with quality service providers. You've been tasked with implementing the next generation fulfillment engine, which automatically chooses from among a database of service providers to fulfill a collection of requests.

You'll be given a list of service providers, each tagged with one or more categories. You'll also be given a list of requests, each with the the category of the service needed and the dates the service may be done. Every request can be done in a single day. Your goal is to determine how many requests can be fulfilled. A request can only be fulfilled by a service provider in the correct category, and each provider can only do one job per day.

For simplicity the days have been mapped to integers starting with one. A single day may be given, or a single contiguous range of days may be given. For example, "2-5" means 2, 3, 4 and 5. Such a request could be fulfilled on any one (but only one) of those days.

There can be up to 30 services, 40 categories, 20 days, and 150 requests.

# Input format:

* One line for each service, consisting of "service" followed by the name of the service and a list of category names.
* One line for each request, consisting of "request" followed by the name of the request, the category of the request, and the day or day range when the service is needed.
* One blank line between problems.
# Output format:

The (integer) number of requests that can be fulfilled on a line by itself, one line for each problem in the input.