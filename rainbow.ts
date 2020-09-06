

const SATURATION = 0.8
const LIGHTNESS = 0.4
const STEPS = 1


const MCCOLORS = [0x1D1D21,0xB02E26,0x5E7C16,0x835432,0x3C44AA,0x8932B8,0x169C9C,0x9D9D97,0x474F52,0xF38BAA,0x80C71F,0xFED83D,0x3AB3DA,0xC74EBD,0xF9801D,0xF9FFFE]
const MCBLOCKS = {
    "#1D1D21":"Black Dye","#B02E26":"Red Dye","#5E7C16":"Green Dye","#835432":"Brown Dye","#3C44AA":"Blue Dye","#8932B8":"Purple Dye","#169C9C":"Cyan Dye","#9D9D97":"Light Gray Dye","#474F52":"Gray Dye","#F38BAA":"Pink Dye","#80C71F":"Lime Dye","#FED83D":"Yellow Dye","#3AB3DA":"Light Blue Dye","#C74EBD":"Magenta Dye","#F9801D":"Orange Dye","#F9FFFE":"White Dye"
}

interface Color {
    r: number, g: number, b: number
}

function parseColor(col: number): Color {
    var c = "#" + col.toString(16)
    var m = c.match(/^#([0-9a-f]{6})$/i)[1];
    return {
        r: parseInt(m.substr(0,2),16),
        g: parseInt(m.substr(2,2),16),
        b: parseInt(m.substr(4,2),16)
    }
}

function mixColors(colors: Array<Color>) {
    var col = {r:colors[0].r,g:colors[0].g,b:colors[0].b}
    for (const c of colors.slice(1)) {
        col.r = (c.r + col.r) / 2
        col.g = (c.g + col.g) / 2
        col.b = (c.b + col.b) / 2
    }
    return col
}

function getAllColors(): Array<[Array<Color>,Color]> {
    var o: Array<[Array<Color>,Color]> = []
    var mccolors_parsed = MCCOLORS.map(parseColor)
    
    for (const c1 of mccolors_parsed) {
        for (const c2 of mccolors_parsed) {
            for (const c3 of mccolors_parsed) {
                for (const c4 of mccolors_parsed) {
                    var cols = [c1,c2,c3,c4]
                    o.push([cols,mixColors(cols)])
                }
            }
        }
    }
    return o
}

function colorDifference(c1:Color,c2:Color): number {
    return Math.sqrt(
        Math.abs(Math.pow(c1.r,2) - Math.pow(c2.r,2)) +
        Math.abs(Math.pow(c1.g,2) - Math.pow(c2.g,2)) +
        Math.abs(Math.pow(c1.b,2) - Math.pow(c2.b,2))
    )
}

function findClosestColors(all: Array<[Array<Color>,Color]>, query: Color): Array<[Array<Color>,Color]> {
    all.sort((a,b) => {
        return colorDifference(query,a[1]) - colorDifference(query,b[1])
    })
    return all
}

function hslToRgb(h, s, l):Color {
    var r, g, b;

    if (s == 0) {
        r = g = b = l;
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return { r:r * 255, g:g * 255, b:b * 255 };
}

function rgbComponentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex({r,g,b}: Color) {
    return "#" + rgbComponentToHex(Math.round(r)) + rgbComponentToHex(Math.round(g)) + rgbComponentToHex(Math.round(b));
}
function equalColors(c1:Color,c2:Color): boolean {
    if (!c2) return false; if (!c1) return false
    return (c1.r == c2.r && c1.g == c2.g && c1.b == c2.b)
}
function blockToName(c: Color) {
    var cs = rgbToHex(c).toUpperCase()
    var o:string = "unknown"
    for (const cname in MCBLOCKS) {
        if (MCBLOCKS.hasOwnProperty(cname)) {
            if (cname == cs) o = MCBLOCKS[cname]
        }
    }
    return o
}


var allColors = getAllColors()
for (let i = 0; i < STEPS; i++) {
    var hue = i * 1 / STEPS
    var color = hslToRgb(hue,SATURATION,LIGHTNESS)
    var bestMatches = findClosestColors(allColors,color)
    for (const match of bestMatches.slice(0,3)) {
        while(equalColors(match[0][0], match[0][1])) match[0].shift() // Remove duplicate colors at the bottom
        var colString = rgbToHex(color)
        var blocks = match[0].map(blockToName)
        var diff = (100 - colorDifference(mixColors(match[0]),color) / Math.sqrt(Math.pow(255,2)*2) * 100).toFixed(1)
        var colMix = rgbToHex(mixColors(match[0]))
        console.log(`${colString} -> ${colMix} (${diff}%): ${blocks.join(", ")}`);   
    }
}
