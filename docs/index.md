<link rel="stylesheet" href="http://devcenter.heroku.com/stylesheets/dev-center/base.css" />

# Oily T-Zone: A Tank Game
## Client Docs

### Incoming
#### `game-enter`
Fired as soon as the client successfully connects to the game server (and fired again following a reconnect).
##### Data
* `map` &mdash; An array of map tiles, which contain info useful when rendering the map
      
        {
          id: 't16',
          material: 'grass', // or 'rock'
          navigable: true // or false
        }

* `player` &mdash; The current player

        {
          alive: true
          dir: undefined
          id: "p1"
          lastMoved: null
          lastShot: null
          location: {
            id: "t133"
            material: "grass"
            navigable: true
            x: 23
            y: 17
          }
          nick: "depressed-oranges"
          speed: 5
        }

* `others` &mdash; An arrray of all other players. (See above for player object details.)

#### `player-moved`
Sent whenever a player moves (this includes the current player). Using the data provided, you can update the position of any player.
##### Data
* `player` A player object with a new `location` and (possibly) a new `dir`

        {
          alive: true,
          dir: "right",
          id: "p1",
          lastMoved: null,
          lastShot: null,
          location: {
            id: "t134",
            material: "grass",
            navigable: true,
            x: 24,
            y: 17
          },
          nick: "messy-watch",
          speed: 5
        }

#### `player-joined`
Sent whenever a new player joins the game. This can be used to keep an up-to-date list connected players.

#### `player-killed`
Sent whenever a player is killed. The data contains both the player that died as well as the killer (this is how you might track kill/death stats).

#### `player-nick-changed`
Sent whenever a player changes their nick. (See `player-nick`)

#### `player-quit`
Sent wen a player quits. This allows you to prune a list of connected players you may have created with the help of `player-joined`.

#### `bullet-moved`
Sent whenever a bullet moves. In a large game, this is sent *very often*. This allows you to animate a bullet to a new location. Bullets cannot change direction mid-flight, so if you moved it one box left before, you'll do it again on subsequent `bullet-moved` events.

#### `bullet-destroyed`
Sent whenever a bullet hits a wall or other player. This is where you get to make the bullet explode/shatter/burn up/etc.

#### `disconnect`
This is a built-in Socket.IO event, but if this happens, your connection to the server is lost as is your player. Hook this if you want to present a kill screen in the event that you lose your connection to the server (or the server fails).

#### `reconnect`
This is a built-in Socket.IO event, but if the user lost their connection and you showed a kill screen or something similar, this gives you a hook to remove the kill screen. Following this event, a `game-enter` will be sent to your client, so the game world, your player and other players should be re-rendered.

#### `error`
Whenever a requested action (`player-nick`) can't take effect, `error` is sent to the player that requested the action. Any number of actions could result in a general error, so this is your means to alert the player (if it's worthy of their time).

### Outgoing

#### `player-move`
When you want your player to move, send the `player-move` event. You can indicate your direction. If your move is allowed by the server, you'll get a `player-moved` event for your player. *You should not animate the movement of your player until you receive the `player-moved` event.*

#### `player-turn`
When you want to turn your player without `player-move`ing to an adjacent tile. This allows you to shoot in all four directions without leaving your tile.

#### `player-shoot`
Shooting is the name of the game (Well, it's actually Oily T-Zone). Fire this when you want to shoot. Whichever direction you're currently facing, the bullet will leave in that direction. It will be destroyed (see `bullet-destroyed`) when it hits a stone, a wall or another player. If it hits another player, a `played-killed` will be sent to all players.

#### `player-nick`
You get a sweet nickname whenever you connect to the server (immense-bean, sassy-doctor, bite-sized-deer, etc.). If you want to change it, you can send a `player-nick` with your desired nick, and if it's not in use, a `player-nick-changed` will be sent to all players.
