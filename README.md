# BetterImageData
BetterImageData for browser and node canvas

## Simple example
```js
/* import stuff */
const fs = require('fs');
const Canvas = require('canvas');
const { BetterImageData, Color } = require('./BetterImageData');

/* create canvas */
const canvas = Canvas.createCanvas(800, 800);
const ctx = canvas.getContext('2d');

/* use better imagedata */
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const better = new BetterImageData(imageData.data, canvas.width, canvas.height);

/* fill with random colors */
for (let y = 0; y < better.height; y++) {
    for (let x = 0; x < better.width; x++) {
        const color = better.get(x, y);
        color.R = Math.round(Math.random()*255);
        color.G = Math.round(Math.random()*255);
        color.B = Math.round(Math.random()*255);
        color.A = 255;
    }
}

/* native image data */
ctx.putImageData(better.toImageData(), 0, 0);

/* save file */
fs.writeFileSync('output.png', canvas.toBuffer());
```
