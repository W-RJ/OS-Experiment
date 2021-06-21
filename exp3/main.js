"use strict";

const ALGORITHM_FF = 0;
const ALGORITHM_BF = 2;
const ALGORITHM_WF = 3;

let algorithm = ALGORITHM_FF;
let nfId = 0;

let bitmapColN = 16;
let bitN = 384;
let nextId = 1;

let delay = 1200;

let randomId = 1;

let colors = [
    { fg: 'hsl(330,100%,60%)', base: 330 },
    { fg: 'hsl(30,100%,50%)', base: 30 },
    { fg: 'hsl(60,100%,45%)', base: 60 },
    { fg: 'hsl(90,100%,50%)', base: 90 },
    { fg: 'hsl(120,100%,50%)', base: 120 },
    { fg: 'hsl(180,100%,45%)', base: 180 },
    { fg: 'hsl(210,100%,65%)', base: 210 },
    { fg: 'hsl(270,100%,65%)', base: 270 },
    { fg: 'hsl(300,100%,50%)', base: 300 },
];

class Block {
    constructor(start, len, tag, color, colorStd, colorBase, i) {
        this.id = nextId++;
        this.start = start;
        this.len = len;
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
        if (blocks.length === 0) {
            this.show();
        } else {
            let tmp = this;
            setTimeout(function () {
                tmp.show();
            }, 0);
        }

        this.showItem(i);

        checkHeight();
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
        let cnt = -1;
        for (let j = 0; j <= i; j++) {
            if (!((this.tag === null) ^ (blocks[j].tag === null))) {
                cnt++;
            }
        }
        if (this.tag === null) {
            let tmp = '<tr id="item-' + this.id + '">' +
                '<td class="item-start">' + this.start + '</td>' +
                '<td class="item-len">' + this.len + '</td>' +
                '</tr>';
            if (cnt === -1) {
                $('#empty-body').prepend(tmp);
            } else {
                $('#empty-body').children().eq(cnt).after(tmp);
            }
        } else {
            let tmp = '<tr id="item-' + this.id + '" style="background:' + this.color + '">' +
                '<td class="item-start">' + this.start + '</td>' +
                '<td class="item-len">' + this.len + '</td>' +
                '<td>' + this.tag + '</td>' +
                '<td style="padding: 2px;">' +
                '<button type="button" class="btn-close" aria-label="Close" onclick="onDelBlock(this)"></button>' +
                '</td>' +
                '</tr>';
            if (cnt === -1) {
                $('#full-body').prepend(tmp);
            } else {
                $('#full-body').children().eq(cnt).after(tmp);
            }
        }
        let item = $('#item-' + this.id);
        item.children().css('font-weight', '900');
        item.children().css('font-size', 'x-large');
        setTimeout(function () {
            item.children().css('font-weight', 'normal');
            item.children().css('font-size', 'normal');
        }, 500);
    }

    updateItem() {
        let item = $('#item-' + this.id);
        item.children('.item-start').html(this.start);
        item.children('.item-len').html(this.len);
        item.children().css('font-weight', '900');
        item.children().css('font-size', 'x-large');
        setTimeout(function () {
            item.children().css('font-weight', 'normal');
            item.children().css('font-size', 'normal');
        }, 500);
    }

    remove() {
        $('#memline-' + this.id).remove();
        $('#item-' + this.id).remove();

        checkHeight();
    }

    resetTag(i, chColor) {
        this.tag = null;
        if (this.colorStd) {
            colors.push({ fg: this.color, base: this.colorBase });
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

        this.showItem(i - 1);
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

let blocks = [];

$(document).ready(function () {
    let bitmapHead = $('#bitmap-head');
    for (let i = 0; i < bitmapColN; i++) {
        bitmapHead.append('<div class="col">' + i + '</div>')
    }

    reset();
});

function checkColor(base) {
    for (let block of blocks) {
        if (Math.abs(block.colorBase - base) < Math.floor(160 / blocks.length)) {
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
    if (h > 195 && h < 285) {
        return { fg: 'hsl(' + h + ',100%,65%)', base: h };
    } else if (h > 320 || h < 10) {
        return { fg: 'hsl(' + h + ',100%,60%)', base: h };
    } else if (h >= 50 && h <= 70 || h >= 170 && h <= 190) {
        return { fg: 'hsl(' + h + ',100%,45%)', base: h };
    } else {
        return { fg: 'hsl(' + h + ',100%,50%)', base: h };
    }
}

function setBitN(_bitN) {
    bitN = _bitN;
    reset();
}

function checkHeight() {
    let diff = parseInt($('#main-container').css('height')) - parseInt($('#sec-container').css('height'));
    if (diff < 0) {
        $('#main-container').css('height', 'auto');
    } else if (blocks.length <= 48) {
        $('#main-container').css('height', '100%');
        setTimeout(checkHeight, 0);
    }
}

function reset() {
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
    for (let b of blocks) {
        if (b.tag !== null) {
            b.resetTag();
        }
        b.remove();
    }
    blocks = [new Block(0, bitN, null, 'lightgrey', false, 720, 0)];

    checkHeight();
}

function select(len) {
    let i;
    let bestId = -1;
    switch (algorithm) {
        case ALGORITHM_FF:
            for (i = 0; i < blocks.length; i++) {
                if (blocks[i].tag !== null) {
                    continue;
                }
                if (blocks[i].len >= len) {
                    return i;
                }
            }
            return -1;
        case ALGORITHM_BF:
            for (i in blocks) {
                if (blocks[i].tag !== null) {
                    continue;
                }
                if (blocks[i].len >= len && (bestId === -1 || blocks[i].len < blocks[bestId].len)) {
                    bestId = i;
                }
            }
            return bestId;
        case ALGORITHM_WF:
            for (i in blocks) {
                if (blocks[i].tag !== null) {
                    continue;
                }
                if (blocks[i].len >= len && (bestId === -1 || blocks[i].len > blocks[bestId].len)) {
                    bestId = i;
                }
            }
            return bestId;
    }

}

function alloc(len, tag) {
    let selectedId = select(len);
    if (selectedId === -1) {
        // TODO
        return false;
    }
    let start = blocks[selectedId].start;
    blocks[selectedId].start += len;
    if (!blocks[selectedId].setLen(blocks[selectedId].len - len)) {
        blocks[selectedId].remove();
        blocks.splice(selectedId, 1);
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
    blocks.splice(selectedId, 0, new Block(start, len, tag, colorFg, colorStd, colorBase, selectedId));
    return true;
}

function free(id) {
    let i;
    for (i = 0; i < blocks.length; i++) {
        if (blocks[i].id === id) {
            break;
        }
    }
    let preFree = i > 0 && blocks[i - 1].tag === null;
    let postFree = i < blocks.length - 1 && blocks[i + 1].tag === null;
    blocks[i].resetTag(i, preFree || postFree);
    if (!preFree && !postFree) {
        // TODO
    } else if (!preFree && postFree) {
        setTimeout(function () {
            blocks[i].setLen(blocks[i].len + blocks[i + 1].len);
            blocks[i + 1].remove();
            blocks.splice(i + 1, 1);
        }, delay);
    } else if (preFree && !postFree) {
        setTimeout(function () {
            blocks[i - 1].setLen(blocks[i - 1].len + blocks[i].len);
            blocks[i].remove();
            blocks.splice(i, 1);
        }, delay);
    } else {
        setTimeout(function () {
            blocks[i - 1].setLen(blocks[i - 1].len + blocks[i].len + blocks[i + 1].len);
            blocks[i].remove();
            blocks[i + 1].remove();
            blocks.splice(i, 2);
        }, delay);
    }
}

function onReset() {
    reset();
}

function onAlloc() {
    let tag = $('#add-tag').val();
    let len = parseInt($('#add-len').val());
    if (!tag || !tag.match(/^[A-Za-z0-9_]+$/)) {
        // TODO
        return;
    } else if (isNaN(len) || len <= 0) {
        // TODO
        return;
    }
    else if (alloc(len, tag) === false) {
        // TODO
        return;
    }
}

function onRandom() {
    if (alloc(Math.ceil(Math.random() * 80), 'J' + randomId) === false) {
        // TODO
        return;
    }
    randomId++;
}

function onRandomList() {
    while (alloc(Math.ceil(Math.random() * 80), 'J' + randomId)) {
        randomId++;
        if (blocks.length >= 9) {
            break;
        }
    }
}

function onDelBlock(which) {
    free(parseInt($(which).parent().parent().attr('id').substring(5)));
}

function ff() {
    algorithm = ALGORITHM_FF;
    $('#navbarDropdown').html('FF');
    reset();
}

function bf() {
    algorithm = ALGORITHM_BF;
    $('#navbarDropdown').html('BF');
    reset();
}

function wf() {
    algorithm = ALGORITHM_WF;
    $('#navbarDropdown').html('WF');
    reset();
}
