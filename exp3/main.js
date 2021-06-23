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

let highlightDelay = 500;

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

class Partition {
    // 构造函数
    constructor(start, len, tag, color, colorStd, colorBase, i) {
        this.id = nextId++; // ID
        this.start = start; // 起始地址
        this.len = len; // 长度
        this.tag = tag; // 标签

        this.color = color; // 颜色
        this.colorStd = colorStd; // 是否为标准色
        this.colorBase = colorBase; // 色相

        // 修改位示图和内存映像图
        i--;
        if (i === -1) {
            $('#memline').prepend('<div id="memline-' + this.id + '" style="background:lightgrey"></div>');
        } else {
            $('#memline').children().eq(i).after('<div id="memline-' + this.id + '" style="background:lightgrey"></div>');
        }
        if (partitions.length === 0) {
            this.showMap();
        } else {
            let tmp = this;
            setTimeout(function () {
                tmp.showMap();
            }, 0);
        }

        // 在已分区表或空闲分区表中插入表项
        this.showItem(i);

        checkHeight();
    }

    // 在位示图和内存映像图中显示本分区
    showMap() {
        // 在内存映像图中显示本分区
        $('#memline-' + this.id).css('flex-grow', this.len);
        $('#memline-' + this.id).css('background', this.color);
        // 在位示图中显示本分区
        let bit = $('#bitmap-body').children().eq(this.start);
        for (let i = 0; i < this.len; i++) {
            bit.css('background-color', this.color);
            bit = bit.next();
        }
    }

    // 在已分区表或空闲分区表中插入表项
    showItem(i) {
        let cnt = -1;
        for (let j = 0; j <= i; j++) {
            if (!((this.tag === null) ^ (partitions[j].tag === null))) {
                cnt++;
            }
        }

        // 插入表项
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
                '<button type="button" class="btn-close" aria-label="Close" onclick="onDelPartition(this)"></button>' +
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

    // 修改已分区表或空闲分区表中的表项
    updateItem() {
        let item = $('#item-' + this.id);

        // 修改信息
        item.children('.item-start').html(this.start);
        item.children('.item-len').html(this.len);

        // 加大加粗指示
        item.children().css('font-weight', '900');
        item.children().css('font-size', 'x-large');
        setTimeout(function () {
            item.children().css('font-weight', 'normal');
            item.children().css('font-size', 'normal');
        }, highlightDelay);
    }

    // 在图表中移除本分区
    remove() {
        $('#memline-' + this.id).remove();
        $('#item-' + this.id).remove();

        checkHeight();
    }

    // 将本分区设为空闲
    resetTag(i, chColor) {
        this.tag = null;

        // 回收标准色
        if (this.colorStd) {
            colors.push({ fg: this.color, base: this.colorBase });
        }

        // 设置颜色
        if (chColor) { // 有合并分区效果
            this.color = 'darkgrey';
        } else { // 无合并分区效果
            this.color = 'lightgrey';
        }
        this.colorStd = false;
        this.colorBase = 720;

        $('#memline-' + this.id).css('background-color', this.color);
        this.showMap();

        // 更新已分区表和空闲分区表
        $('#item-' + this.id).remove();
        this.showItem(i - 1);
    }

    // 设置分区长度
    setLen(len) {
        this.len = len;
        this.color = 'lightgrey';
        this.updateItem();
        if (this.len === 0) {
            return false;
        } else {
            // 更新位示图和内存映像图
            this.showMap();
            return true;
        }
    }
}

let partitions = [];

$(document).ready(function () {
    let bitmapHead = $('#bitmap-head');
    for (let i = 0; i < bitmapColN; i++) {
        bitmapHead.append('<div class="col">' + i + '</div>')
    }

    reset();
});

function checkColor(base) {
    for (let partition of partitions) {
        if (Math.abs(partition.colorBase - base) < Math.floor(160 / partitions.length)) {
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
    } else if (partitions.length <= 48) {
        $('#main-container').css('height', '100%');
        if (!nest) {
            setTimeout(checkHeight, 0, true);
        }
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
    for (let b of partitions) {
        if (b.tag !== null) {
            b.resetTag();
        }
        b.remove();
    }
    partitions = [new Partition(0, bitN, null, 'lightgrey', false, 720, 0)];

    checkHeight();
}

// 根据算法选择空闲分区，返回分区编号
function select(len) {
    let i;
    let bestId = -1;
    switch (algorithm) {
        // 首次适应算法
        case ALGORITHM_FF:
            for (i = 0; i < partitions.length; i++) {
                if (partitions[i].tag !== null) {
                    continue;
                }
                if (partitions[i].len >= len) {
                    return i;
                }
            }
            return -1;

        // 最佳适应算法
        case ALGORITHM_BF:
            for (i in partitions) {
                if (partitions[i].tag !== null) {
                    continue;
                }
                if (partitions[i].len >= len && (bestId === -1 || partitions[i].len < partitions[bestId].len)) {
                    bestId = i;
                }
            }
            return bestId;

        // 最坏适应算法
        case ALGORITHM_WF:
            for (i in partitions) {
                if (partitions[i].tag !== null) {
                    continue;
                }
                if (partitions[i].len >= len && (bestId === -1 || partitions[i].len > partitions[bestId].len)) {
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
    let start = partitions[selectedId].start;
    partitions[selectedId].start += len;
    if (!partitions[selectedId].setLen(partitions[selectedId].len - len)) {
        partitions[selectedId].remove();
        partitions.splice(selectedId, 1);
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
    partitions.splice(selectedId, 0, new Partition(start, len, tag, colorFg, colorStd, colorBase, selectedId));
    return true;
}

// 释放指定ID对应的分区
function free(id) {
    let i;
    for (i = 0; i < partitions.length; i++) {
        if (partitions[i].id === id) {
            break;
        }
    }
    // 前面空闲
    let preFree = i > 0 && partitions[i - 1].tag === null;
    // 后面空闲
    let postFree = i < partitions.length - 1 && partitions[i + 1].tag === null;
    partitions[i].resetTag(i, preFree || postFree);
    if (!preFree && postFree) { // 与后面合并
        setTimeout(function () {
            partitions[i].setLen(partitions[i].len + partitions[i + 1].len);
            partitions[i + 1].remove();
            partitions.splice(i + 1, 1);
        }, delay);
    } else if (preFree && !postFree) { // 与前面合并
        setTimeout(function () {
            partitions[i - 1].setLen(partitions[i - 1].len + partitions[i].len);
            partitions[i].remove();
            partitions.splice(i, 1);
        }, delay);
    } else if (preFree && postFree) { // 与前后合并
        setTimeout(function () {
            partitions[i - 1].setLen(partitions[i - 1].len + partitions[i].len + partitions[i + 1].len);
            partitions[i].remove();
            partitions[i + 1].remove();
            partitions.splice(i, 2);
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
        if (partitions.length >= 9) {
            break;
        }
    }
}

function onDelPartition(which) {
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
