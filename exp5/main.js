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

class FileArea {
    constructor(name, start, showLen, color, colorStd, colorBase, i) {
        this.id = nextId++;
        this.start = start;
        this.len = Math.ceil(showLen / 2);
        this.showLen = showLen;
        this.name = name;
        this.color = color;
        this.colorStd = colorStd;
        this.colorBase = colorBase;

        i--;
        if (i === -1) {
            $('#memline').prepend('<div id="memline-' + this.id + '" style="background:lightgrey"></div>');
        } else {
            $('#memline').children().eq(i).after('<div id="memline-' + this.id + '" style="background:lightgrey"></div>');
        }
        if (fileAreas.length === 0) {
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
            if (!((this.name === null) ^ (fileAreas[j].name === null))) {
                cnt++;
            }
        }
        if (this.name === null) {
            let tmp = '<tr id="item-' + this.id + '">' +
                '<td class="item-start">' + this.start * 2 + 'K</td>' +
                '<td class="item-len">' + this.showLen + 'K</td>' +
                '</tr>';
            if (cnt === -1) {
                $('#empty-body').prepend(tmp);
            } else {
                $('#empty-body').children().eq(cnt).after(tmp);
            }
        } else {
            let tmp = '<tr id="item-' + this.id + '" style="background:' + this.color + '">' +
                '<td class="item-start">' + this.start * 2 + 'K</td>' +
                '<td class="item-len">' + this.showLen + 'K</td>' +
                '<td>' + this.name + '</td>' +
                '<td style="padding: 2px;">' +
                '<button type="button" class="btn-close" aria-label="Close" onclick="onDelFileArea(this)"></button>' +
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
        item.children('.item-start').html(this.start * 2 + 'K');
        item.children('.item-len').html(this.showLen + 'K');
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

    resetName(i, chColor) {
        this.name = null;
        this.showLen = this.len * 2;
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
        this.showLen = len * 2;
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

let fileAreas = [];

$(document).ready(function () {
    let bitmapHead = $('#bitmap-head');
    for (let i = 0; i < bitmapColN; i++) {
        bitmapHead.append('<div class="col">' + i + '</div>')
    }

    reset();
});

function checkColor(base) {
    for (let fileArea of fileAreas) {
        if (Math.abs(fileArea.colorBase - base) < Math.floor(160 / fileAreas.length)) {
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

function checkHeight(nest) {
    let diff = parseInt($('#main-container').css('height')) - parseInt($('#sec-container').css('height'));
    if (diff < 0) {
        $('#main-container').css('height', 'auto');
    } else if (fileAreas.length <= 48) {
        $('#main-container').css('height', '100%');
        if (!nest) {
            setTimeout(checkHeight, 0, true);
        }
    }
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
    for (let b of fileAreas) {
        if (b.name !== null) {
            b.resetName();
        }
        b.remove();
    }
    fileAreas = [new FileArea(null, 0, bitN * 2, 'lightgrey', false, 720, 0)];

    checkHeight();
}

function select(len) {
    let i;
    let bestId = -1;
    switch (algorithm) {
        case ALGORITHM_FF:
            for (i = 0; i < fileAreas.length; i++) {
                if (fileAreas[i].name !== null) {
                    continue;
                }
                if (fileAreas[i].len >= len) {
                    return i;
                }
            }
            return -1;
        case ALGORITHM_BF:
            for (i in fileAreas) {
                if (fileAreas[i].name !== null) {
                    continue;
                }
                if (fileAreas[i].len >= len && (bestId === -1 || fileAreas[i].len < fileAreas[bestId].len)) {
                    bestId = i;
                }
            }
            return bestId;
        case ALGORITHM_WF:
            for (i in fileAreas) {
                if (fileAreas[i].name !== null) {
                    continue;
                }
                if (fileAreas[i].len >= len && (bestId === -1 || fileAreas[i].len > fileAreas[bestId].len)) {
                    bestId = i;
                }
            }
            return bestId;
    }

}

function alloc(name, showLen) {
    let len = Math.ceil(showLen / 2);
    let selectedId = select(len);
    if (selectedId === -1) {
        // TODO
        return false;
    }
    let start = fileAreas[selectedId].start;
    fileAreas[selectedId].start += len;
    if (!fileAreas[selectedId].setLen(fileAreas[selectedId].len - len)) {
        fileAreas[selectedId].remove();
        fileAreas.splice(selectedId, 1);
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
    fileAreas.splice(selectedId, 0, new FileArea(name, start, showLen, colorFg, colorStd, colorBase, selectedId));
    return true;
}

function free(id) {
    let i;
    for (i = 0; i < fileAreas.length; i++) {
        if (fileAreas[i].id === id) {
            break;
        }
    }
    let preFree = i > 0 && fileAreas[i - 1].name === null;
    let postFree = i < fileAreas.length - 1 && fileAreas[i + 1].name === null;
    fileAreas[i].resetName(i, preFree || postFree);
    if (!preFree && !postFree) {
        // TODO
    } else if (!preFree && postFree) {
        setTimeout(function () {
            fileAreas[i].setLen(fileAreas[i].len + fileAreas[i + 1].len);
            fileAreas[i + 1].remove();
            fileAreas.splice(i + 1, 1);
        }, delay);
    } else if (preFree && !postFree) {
        setTimeout(function () {
            fileAreas[i - 1].setLen(fileAreas[i - 1].len + fileAreas[i].len);
            fileAreas[i].remove();
            fileAreas.splice(i, 1);
        }, delay);
    } else {
        setTimeout(function () {
            fileAreas[i - 1].setLen(fileAreas[i - 1].len + fileAreas[i].len + fileAreas[i + 1].len);
            fileAreas[i].remove();
            fileAreas[i + 1].remove();
            fileAreas.splice(i, 2);
        }, delay);
    }
}

function onReset() {
    reset();
}

function onAlloc() {
    let name = $('#add-name').val();
    let showLen = parseInt($('#add-len').val());
    if (!name || !name.match(/^[A-Za-z0-9_]+$/)) {
        // TODO
        return;
    } else if (isNaN(showLen) || showLen <= 0) {
        // TODO
        return;
    }
    else if (alloc(name, showLen) === false) {
        // TODO
        return;
    }
}

function onRandom() {
    let tmp = Math.ceil(Math.random() * 10);
    if (alloc('J' + randomId, tmp) === false) {
        // TODO
        return;
    }
    randomId++;
}

function onRandomList() {
    let tmp = Math.ceil(Math.random() * 10);
    while (alloc(randomId + '.txt', tmp)) {
        randomId++;
        if (fileAreas.length > 50) {
            break;
        }
        tmp = Math.ceil(Math.random() * 10);
    }
}

function onDelFileArea(which) {
    free(parseInt($(which).parent().parent().attr('id').substring(5)));
}

function onNext() {
    if (status === 0) {
        for (let i = 2; i <= 50; i += 2) {
            free(i);
        }
        status++;
        $('#btn-next').html('插入五个')
    } else {
        alloc('A.txt', 7);
        alloc('B.txt', 5);
        alloc('C.txt', 2);
        alloc('D.txt', 9);
        alloc('E.txt', 3.5);
    }
}
