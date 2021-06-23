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

let highlightDelay = 500;

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
    // 构造函数
    constructor(name, start, size, color, colorStd, colorBase, i) {
        this.id = nextId++; // ID
        this.name = name; // 文件名
        this.start = start; // 起始块
        this.len = Math.ceil(size / 2); // 占用块数
        this.size = size; // 大小

        this.color = color; // 颜色
        this.colorStd = colorStd; // 是否为标准色
        this.colorBase = colorBase; // 色相

        // 修改位示图和映像图
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

        // 插入表项
        this.showItem(i);

        checkHeight();
    }

    // 在位示图和映像图中显示本盘区
    show() {
        // 在映像图中显示本盘区
        $('#memline-' + this.id).css('flex-grow', this.len);
        $('#memline-' + this.id).css('background', this.color);
        // 在位示图中显示本盘区
        let bit = $('#bitmap-body').children().eq(this.start);
        for (let i = 0; i < this.len; i++) {
            bit.css('background-color', this.color);
            bit = bit.next();
        }
    }

    // 插入表项
    showItem(i) {
        let cnt = -1;
        for (let j = 0; j <= i; j++) {
            if (!((this.name === null) ^ (fileAreas[j].name === null))) {
                cnt++;
            }
        }

        // 插入表项
        if (this.name === null) {
            let tmp = '<tr id="item-' + this.id + '">' +
                '<td class="item-start">' + this.start * 2 + 'K</td>' +
                '<td class="item-len">' + this.size + 'K</td>' +
                '</tr>';
            if (cnt === -1) {
                $('#empty-body').prepend(tmp);
            } else {
                $('#empty-body').children().eq(cnt).after(tmp);
            }
        } else {
            let tmp = '<tr id="item-' + this.id + '" style="background:' + this.color + '">' +
                '<td class="item-start">' + this.start * 2 + 'K</td>' +
                '<td class="item-len">' + this.size + 'K</td>' +
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

        // 加大加粗指示
        let item = $('#item-' + this.id);
        item.children().css('font-weight', '900');
        item.children().css('font-size', 'x-large');
        setTimeout(function () {
            item.children().css('font-weight', 'normal');
            item.children().css('font-size', 'normal');
        }, highlightDelay);
    }

    // 更新表项
    updateItem() {
        let item = $('#item-' + this.id);

        // 修改信息
        item.children('.item-start').html(this.start * 2 + 'K');
        item.children('.item-len').html(this.size + 'K');

        // 加大加粗指示
        item.children().css('font-weight', '900');
        item.children().css('font-size', 'x-large');
        setTimeout(function () {
            item.children().css('font-weight', 'normal');
            item.children().css('font-size', 'normal');
        }, highlightDelay);
    }

    // 在图表中移除本盘区
    remove() {
        $('#memline-' + this.id).remove();
        $('#item-' + this.id).remove();

        checkHeight();
    }

    // 将本盘区设为空闲
    resetName(i, chColor) {
        this.name = null;

        // 回收标准色
        this.size = this.len * 2;
        if (this.colorStd) {
            colors.push({ fg: this.color, base: this.colorBase });
        }

        // 设置颜色
        if (chColor) { // 有合并盘区效果
            this.color = 'darkgrey';
        } else { // 无合并盘区效果
            this.color = 'lightgrey';
        }
        this.colorStd = false;
        this.colorBase = 720;

        $('#memline-' + this.id).css('background-color', this.color);
        this.show();

        // 更新表项
        $('#item-' + this.id).remove();
        this.showItem(i - 1);
    }

    // 设置盘区长度
    setLen(len) {
        this.len = len;
        this.size = len * 2;
        this.color = 'lightgrey';
        this.updateItem();
        if (this.len === 0) {
            return false;
        } else {
            // 更新位示图和映像图
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

function alloc(name, size) {
    let len = Math.ceil(size / 2);
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
    fileAreas.splice(selectedId, 0, new FileArea(name, start, size, colorFg, colorStd, colorBase, selectedId));
    return true;
}

// 删除指定ID对应的文件，释放盘区
function free(id) {
    let i;
    for (i = 0; i < fileAreas.length; i++) {
        if (fileAreas[i].id === id) {
            break;
        }
    }
    // 前面空闲
    let preFree = i > 0 && fileAreas[i - 1].name === null;
    // 后面空闲
    let postFree = i < fileAreas.length - 1 && fileAreas[i + 1].name === null;
    fileAreas[i].resetName(i, preFree || postFree);
    if (!preFree && postFree) { // 与后面合并
        setTimeout(function () {
            fileAreas[i].setLen(fileAreas[i].len + fileAreas[i + 1].len);
            fileAreas[i + 1].remove();
            fileAreas.splice(i + 1, 1);
        }, delay);
    } else if (preFree && !postFree) { // 与前面合并
        setTimeout(function () {
            fileAreas[i - 1].setLen(fileAreas[i - 1].len + fileAreas[i].len);
            fileAreas[i].remove();
            fileAreas.splice(i, 1);
        }, delay);
    } else if (preFree && postFree) { // 与前后合并
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
    let size = parseInt($('#add-len').val());
    if (!name || !name.match(/^[A-Za-z0-9_]+$/)) {
        // TODO
        return;
    } else if (isNaN(size) || size <= 0) {
        // TODO
        return;
    }
    else if (alloc(name, size) === false) {
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
