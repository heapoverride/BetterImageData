/**
 * Source: https://github.com/UnrealSecurity/BetterImageData
 */

const browser = !(typeof window === 'undefined');

class BetterImageData {
    /**
     * Create new instance of BetterImageData
     * @param {Uint8ClampedArray} buffer Raw pixel data
     * @param {Number} width Image width
     * @param {Number} height Image height
     * @returns {BetterImageData}
     */
    constructor(buffer, width, height) {
        this.width = width;
        this.height = height;

        const data = new Array(height);
        for (let y = 0; y < height; y++) {
            data[y] = new Array(width);
        }

        let i = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const [R, G, B, A] = buffer.slice(i, i + 4);

                data[y][x] = new Color(R, G, B, A);
                i += 4;
            }
        }

        this.data = data;
    }

    /**
     * Get BetterImageData from Image
     * @param {Image} image 
     * @returns {BetterImageData}
     */
    static fromImage(image) {
        let canvas;

        if (browser) {
            canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
        } else {
            canvas = Canvas.createCanvas(image.width, image.height);
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        return new BetterImageData(ctx.getImageData(0, 0,
            image.width, image.height).data,
            image.width, image.height);
    }

    /**
     * Get Color of single pixel at position
     * @param {Number} x 
     * @param {Number} y 
     */
    get(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.data[y][x];
        }
        return null;
    }

    /**
     * Set Color of single pixel at position
     * @param {Number} x
     * @param {Number} y
     * @param {Color} color 
     */
    set(x, y, color) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.data[y][x] = color;
        }
    }

    /**
     * Fill with color
     * @param {Color} color 
     */
    fill(color) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.data[y][x] = color;
            }
        }
    }

    /**
     * Clear image data
     */
    clear() {
        this.fill(new Color(0, 0, 0, 0));
    }

    /**
     * Invert image data
     */
    invert() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const color = this.data[y][x];
                color.R = 255 - color.R;
                color.G = 255 - color.G;
                color.B = 255 - color.B;
            }
        }
    }

    /**
     * Convert BetterImageData back to native ImageData
     * @returns {ImageData}
     */
    toImageData() {
        const data = new Uint8ClampedArray(this.width * this.height * 4);

        let x = 0, y = 0;
        for (let i = 0; i < data.length; i += 4) {
            const color = this.data[y][x];

            data[i] = color.R;
            data[i + 1] = color.G;
            data[i + 2] = color.B;
            data[i + 3] = color.A;

            x += 1;
            if (x === this.width) {
                x = 0;
                y++;
            }
        }

        return !browser ? Canvas.createImageData(data, this.width, this.height) : new ImageData(data, this.width, this.height);
    }
}

class Color {
    /** 
     * Create new instance of Color
     * @param {Number} R Red
     * @param {Number} G Green
     * @param {Number} B Blue
     * @param {Number} A Alpha
     * @returns {Color}
     */
    constructor(R, G, B, A = 255) {
        this.R = R;
        this.G = G;
        this.B = B;
        this.A = A;
    }

    /**
     * Get new Color instance from hexadecimal string
     * @param {String} hex #RRGGBBAA
     * @returns {Color}
     */
    static fromHex(hex) {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
        return m ? new Color(parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16), m[4] ? parseInt(m[4], 16) : 255) : new Color(0, 0, 0);
    }

    /**
     * Return hexadecimal string for this Color instance
     * @returns {String}
     */
    toHex() {
        const R = Color._hex_value(Math.floor(255 * this.R));
        const G = Color._hex_value(Math.floor(255 * this.G));
        const B = Color._hex_value(Math.floor(255 * this.B));
        const A = Color._hex_value(Math.floor(255 * this.A));
        return "#" + R + G + B + A;
    }

    /**
     * Get new Color instance from HSV
     * @param {*} H Hue (0-360)
     * @param {*} S Saturation (0-1)
     * @param {*} V Value (0-255)
     * @returns {Color}
     */
    static fromHSV(H, S, V) {
        let hh, p, q, t, ff, i, r, g, b;

        if (S <= 0.0) return [V, V, V];
        hh = H;

        if (hh >= 360.0) {
            hh = 0.0;
        }

        hh /= 60.0;
        i = Math.floor(hh);
        ff = hh - i;
        p = V * (1.0 - S);
        q = V * (1.0 - (S * ff));
        t = V * (1.0 - (S * (1.0 - ff)));

        switch (i) {
            case 0:
                r = V;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = V;
                b = p;
                break;
            case 2:
                r = p;
                g = V;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = V;
                break;
            case 4:
                r = t;
                g = p;
                b = V;
                break;
            case 5:
                r = V;
                g = p;
                b = q;
                break;
            default:
                r = V;
                g = p;
                b = q;
                break;
        }

        return new Color(r, g, b);
    }

    static _hex_value(n) {
        return ("0" + (Number(n).toString(16))).slice(-2).toUpperCase();
    }
}

if (!browser) {
    global.Canvas = require('canvas');
    module.exports = { BetterImageData, Color };
}