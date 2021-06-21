"use strict";

const ALGORITHM_FF = 0;
const ALGORITHM_BF = 2;
const ALGORITHM_WF = 3;

let algorithm = ALGORITHM_FF;
let nfId = 0;

let bitmapColN = 16;
let bitN = 500;
let nextId = 1;

let randomId = 1;

let status = 0;

let delay = 1200;

let colors = [
    {fg: 'hsl(330,100%,60%)', base: 330},
    {fg: 'hsl(30,100%,50%)', base: 30},
    {fg: 'hsl(60,100%,45%)', base: 60},
    {fg: 'hsl(90,100%,50%)', base: 90},
    {fg: 'hsl(120,100%,50%)', base: 120},
    {fg: 'hsl(180,100%,45%)', base: 180},
    {fg: 'hsl(210,100%,65%)', base: 210},
    {fg: 'hsl(270,100%,65%)', base: 270},
    {fg: 'hsl(300,100%,50%)', base: 300},
];

class File {
    constructor(start, len, tag, color, colorStd, colorBase, i, showLen) {
        this.id = nextId++;
        this.start = start;
        this.len = len;
        this.showLen = showLen;
        this.tag = tag;
        this.color = color;
        this.colorStd = colorStd;
        this.colorBase = colorBase;

        i--;
        if (i === -1) {
            $('#memline').prepend('<div id="memline-' + this.id + '" style="background:lightgrey"></div>');
        } else {
            $('#memline').children().eq(i).after('<div id="memline-' + this.id + '" style="background:lightgrey"></div>');
        }
        if (files.length === 0) {
            this.show();
        } else {
            let tmp = this;
            setTimeout(function() {
                tmp.show();
            }, 0);
        }

        this.showItem(i);
    }

    show() {
        $('#memline-' + this.id).css('flex-grow', this.len);
        $('#memline-' + this.id).css('background', this.color);
        let bit = $('#bitmap-body').children().eq(this.start);
        for (let i = 0; i < this.len; i++) {
            bit.css('background-color', this.color);
            bit = bit.next();
        }
    }

    showItem(i) {
        console.log(i);
        console.log('hello');
        let cnt = -1;
        for (let j = 0; j <= i; j++) {
            console.log(this.tag);
            console.log(files[j].tag)
            if (!((this.tag === null) ^ (files[j].tag === null))) {
                console.log('same');
                cnt++;
            }
        }
        console.log('hi');
        if (this.tag === null) {
            let tmp = '<tr id="item-' + this.id + '">' +
                '<td class="item-start">' + this.start + '</td>' +
                '<td class="item-len">' + this.showLen + '</td>' +
                '</tr>';
            console.log(tmp);
            console.log(this.start);
            console.log('cnt:', cnt);
            if (cnt === -1) {
                $('#empty-body').prepend(tmp);
            } else {
                $('#empty-body').children().eq(cnt).after(tmp);
            }
        } else {
            let tmp = '<tr id="item-' + this.id + '" style="background:' + this.color +'">' +
                '<td class="item-start">' + this.start + '</td>' +
                '<td class="item-len">' + this.showLen + '</td>' +
                '<td>' + this.tag + '</td>' +
                '<td style="padding: 2px;">' +
                '<button type="button" class="btn-close" aria-label="Close" onclick="onDelFile(this)"></button>' +
                '</td>' +
                '</tr>';
            console.log(tmp);
            console.log(this.start);
            console.log('cnt:', cnt);
            if (cnt === -1) {
                $('#full-body').prepend(tmp);
            } else {
                $('#full-body').children().eq(cnt).after(tmp);
            }
        }
        let item = $('#item-' + this.id);
        item.children().css('font-weight', '900');
        item.children().css('font-size', 'x-large');
        setTimeout(function() {
            item.children().css('font-weight', 'normal');
            item.children().css('font-size', 'normal');
        }, 500);
    }

    updateItem() {
        console.log('updateItem');
        let item = $('#item-' + this.id);
        item.children('.item-start').html(this.start);
        item.children('.item-len').html(this.len);
        item.children().css('font-weight', '900');
        item.children().css('font-size', 'x-large');
        setTimeout(function() {
            item.children().css('font-weight', 'normal');
            item.children().css('font-size', 'normal');
        }, 500);
    }

    remove() {
        $('#memline-' + this.id).remove();
        $('#item-' + this.id).remove();
    }

    resetTag(i, chColor) {
        this.tag = null;
        if (this.colorStd) {
            colors.push({fg: this.color, base: this.colorBase});
        }
        if (chColor) {
            this.color = 'darkgrey';
        } else {
            this.color = 'lightgrey';
        }
        this.colorStd = false;
        this.colorBase = 720;

        // $('#memline-' + this.id).css('flex', '0');
        $('#memline-' + this.id).css('background-color', this.color);
        // setTimeout("$('#memline-" + this.id + "').remove();", delay);
        this.show();

        $('#item-' + this.id).remove();

        this.showItem(i-1);
    }

    setLen(len) {
        this.len = len;
        this.color = 'lightgrey';
        this.updateItem();
        if (this.len === 0) {
            // this.finalize();
            return false;
        } else {
            this.show();
            return true;
        }
    }
}

let files = [];

$(document).ready(function() {
    let bitmapHead = $('#bitmap-head');
    for (let i = 0; i < bitmapColN; i++) {
        bitmapHead.append('<div class="col">' + i + '</div>')
    }

    reset();
});

function checkColor(base) {
    for (let file of files) {
        if (Math.abs(file.colorBase - base) < Math.floor(160 / files.length)) {
            return false;
        }
    }
    return true;
}

function getRandomColor() {
    let h;
    do {
        h = Math.floor(Math.random() * 360);
    } while (h > 225 && h < 255 || !checkColor(h));
    console.log(h);
    if (h > 195 && h < 285)
    {
        return {fg: 'hsl(' + h + ',100%,65%)', base: h};
    } else if (h > 320 || h < 10) {
        return {fg: 'hsl(' + h + ',100%,60%)', base: h};
    } else if (h >= 50 && h <= 70 || h >= 170 && h <= 190) {
        return {fg: 'hsl(' + h + ',100%,45%)', base: h};
    } else {
        return {fg: 'hsl(' + h + ',100%,50%)', base: h};
    }
}

function setBitN(_bitN) {
    bitN = _bitN;
    reset();
}

function reset() {
    status = 0;
    let bitmapBody = $('#bitmap-body');
    bitmapBody.empty();
    for (let i = 0; i < bitN; i++) {
        bitmapBody.append('<div class="col" style="background-color: lightgrey;"></div>');
    }

    $('#col2').css('height', $('#col1').css('height'));
    $('#memline').css('height', parseInt($('#col1').css('height')) - 26);
    $('#memline').empty();
    $('#empty-body').empty();
    $('#full-body').empty();
    for (let b of files) {
        if (b.tag !== null) {
            b.resetTag();
        }
        b.remove();
    }
    files = [new File(0, bitN, null, 'lightgrey', false, 720, 0, bitN * 2)];
}

function select(len) {
    let i;
    let bestId = -1;
    switch (algorithm)
    {
        case ALGORITHM_FF:
            for (i = 0; i < files.length; i++) {
                if (files[i].tag !== null) {
                    continue;
                }
                if (files[i].len >= len) {
                    return i;
                }
            }
            return -1;
        case ALGORITHM_BF:
            for (i in files) {
                if (files[i].tag !== null) {
                    continue;
                }
                if (files[i].len >= len && (bestId === -1 || files[i].len < files[bestId].len)) {
                    bestId = i;
                }
            }
            return bestId;
        case ALGORITHM_WF:
            for (i in files) {
                if (files[i].tag !== null) {
                    continue;
                }
                if (files[i].len >= len && (bestId === -1 || files[i].len > files[bestId].len)) {
                    bestId = i;
                }
            }
            return bestId;
    }

}

function alloc(len, tag, showLen) {
    let selectedId = select(len);
    if (selectedId === -1) {
        // TODO
        return false;
    }
    let start = files[selectedId].start;
    files[selectedId].start += len;
    if (!files[selectedId].setLen(files[selectedId].len - len)) {
        files[selectedId].remove();
        files.splice(selectedId, 1);
    }
    let colorFg, colorBg, colorStd, colorBase;
    if (colors.length > 0) {
        colorFg = colors[0].fg;
        colorBase = colors[0].base;
        colors.shift();
        colorStd = true;
    } else {
        let ret = getRandomColor();
        colorFg = ret.fg;
        colorBase = ret.base;
        colorStd = false;
    }
    console.log(selectedId);
    files.splice(selectedId, 0, new File(start, len, tag, colorFg, colorStd, colorBase, selectedId, showLen));
    return true;
}

function free(id) {
    console.log('id:', id);
    let i;
    for (i = 0; i < files.length; i++) {
        if (files[i].id === id) {
            break;
        }
    }
    let preFree = i > 0 && files[i-1].tag === null;
    let postFree = i < files.length - 1 && files[i+1].tag === null;
    files[i].resetTag(i, preFree || postFree);
    if (!preFree && !postFree) {
        // TODO
    } else if (!preFree && postFree) {
        setTimeout(function() {
            files[i].setLen(files[i].len + files[i+1].len);
            files[i+1].remove();
            files.splice(i + 1, 1);
        }, delay);
    } else if (preFree && !postFree) {
        setTimeout(function() {
            files[i-1].setLen(files[i-1].len + files[i].len);
            files[i].remove();
            files.splice(i, 1);
        }, delay);
    } else {
        setTimeout(function() {
            files[i-1].setLen(files[i-1].len + files[i].len + files[i+1].len);
            files[i].remove();
            files[i+1].remove();
            files.splice(i, 2);
        }, delay);
    }
}

function onReset() {
    reset();
}

function onAlloc() {
    let tag = $('#add-tag').val();
    let showLen = parseInt($('#add-len').val());
    if (!tag || !tag.match(/^[A-Za-z0-9_]+$/)) {
        // TODO
        return;
    } else if (isNaN(showLen) || showLen <= 0) {
        // TODO
        return;
    }
    else if (alloc(Math.ceil(showLen / 2), tag, showLen) === false)
    {
        // TODO
        return;
    }
}

function onRandom() {
    let tmp = Math.ceil(Math.random() * 10);
    if (alloc(Math.ceil(tmp / 2), 'J' + randomId, tmp) === false) {
        // TODO
        return;
    }
    randomId++;
}

function onRandomList() {
    let tmp = Math.ceil(Math.random() * 10);
    while (alloc(Math.ceil(tmp / 2), randomId + '.txt', tmp)) {
        randomId++;
        if (files.length > 50) {
            break;
        }
        tmp = Math.ceil(Math.random() * 10);
    }
}

function onDelFile(which) {
    free(parseInt($(which).parent().parent().attr('id').substring(5)));
}

function onNext() {
    if (status === 0) {
        for (let i = 2; i <= 50; i += 2) {
            free(i);
        }
        status++;
        $('#btn-next').html('插入五个')
    // } else if (status === 1) {
    //     for (let i in files) {
    //         if (files[i].id >= 2 && files[i].id % 2 == 1) {
    //             files[i].color = 'grey';
    //             // files[i].show();
    //             files[i].updateItem();
    //         }
    //     }
    } else {
        alloc(4, 'A.txt', 7);
        alloc(3, 'B.txt', 5);
        alloc(1, 'C.txt', 2);
        alloc(5, 'D.txt', 9);
        alloc(2, 'E.txt', 3.5);
    }
}
