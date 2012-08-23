var tile = require('./tile');

module.exports = function(width, height) {
  var rows = [];
  var cols;
  var ascii = "";

  for(var i = 0; i < height; i++) {
    cols = [];
    ascii = "";
    for(var j = 0; j < width; j++) {
      cell = tile.random();
      cell.x = j;
      cell.y = i;
      cols.push(cell);
      ascii+= cell.navigable ? " " : "#";
    }
    rows.push(cols);
    //console.log(ascii);
  }

  return {
    cells: rows,
    random: function() {
      var found = false;
      while(!found) {
        row = rows[Math.floor(Math.random()*height)][Math.floor(Math.random()*width)];
        if(row.navigable) {
          return row; 
        }
      }
    },
    isNavigable: function(x, y) {
      if(x < 0 || x >= width || y < 0 || y >= height) return false;
      return rows[y][x].navigable;
    }
  }


  /*var show = function(cell, ascii) {
    if(ascii == null) ascii = "";
    if(cell.right) ascii = show(cell.right, ascii);
    return (cell.isNavigable() ? " " : "#") + (ascii ? ascii : "");
  };
  console.log(show(rows[0][0]));*/

};
