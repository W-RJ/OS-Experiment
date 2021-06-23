"use strict";

const ALGORITHM_SSTF = 0;
const ALGORITHM_SCAN = 1;

let algorithm = ALGORITHM_SSTF;

let chart;

let nextId = 1;

let maxPos = 16384;

let curPos = 8096;
let curDir = 1;
let curOrder = 1;

let ans = 0;

let continuous = false;
let running = false;

let delay = 500;

$(document).ready(function () {
    var ctx = document.getElementById('chart').getContext('2d');
    chart = new Chart(document.getElementById('chart'), {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: '',
                    data: [
                        {
                            x: curPos,
                            y: 0,
                        },
                    ],
                    backgroundColor: 'rgb(0,0,0,0)',
                    borderColor: '#3F5F7F',
                    tension: 0,
                },
            ],
        },
        options: {
            showLines: true,
            scales: {
                xAxes: [
                    {
                        type: 'linear',
                        position: 'top',
                        ticks: {
                            min: 0,
                            max: maxPos - 1,
                        },
                    },
                ],
                yAxes: [
                    {
                        type: 'linear',
                        ticks: {
                            reverse: "true",
                            // min: 0,
                            // max: 1,
                        },
                    },
                ],
            },
            animation: {
                duration: delay,
                easing: "linear",
            },
        },
    });
});

class DiskRequest {
    // 构造函数
    constructor(pos) {
        this.pos = pos; // 请求位置
        this.order = -1; // 服务顺序
        this.id = nextId++; // ID

        // 插入表格
        $('#info-pos').append('<td></td>');
        $('#info-order').append('<td></td>');
        // $('#info-op').append('<td style="padding: 12px;">' +
        //     '<button type="button" class="btn-close" aria-label="Close"></button>' +
        //     '</td>');

        // 插入磁盘图
        $('#disk').append('<div id="disk-' + this.id + '"></div>')
    }

    // 析构函数
    finalize() {
        $('#info-pos').children().last().remove();
        $('#info-order').children().last().remove();
        // $('#info-op').children().last().remove();
        $('#disk-' + this.id).remove();
    }

    // 显示请求
    show(i) {
        // 显示请求信息
        $('#info-pos').children('td').eq(i).html(this.pos);
        if (this.order >= 0) {
            $('#info-order').children('td').eq(i).html(this.order);
        } else {
            $('#info-order').children('td').eq(i).html('');
        }
        // $('#info-op').children('td').eq(i).children().on('click', function() {
        //     onDel(i);
        // });

        // 在磁盘图中显示请求
        $('#disk-' + this.id).css('left', 100 * this.pos / maxPos + '%');
        if (this.order >= 0) {
            $('#disk-' + this.id).css('border-color', 'green');
        } else {
            $('#disk-' + this.id).css('border-color', 'red');
        }
    }

    // 重置
    reset(i) {
        curOrder = 1;
        this.order = -1;
        this.show(i);
    }
}

let diskRequests = [];

function show() {
    for (let i in diskRequests) {
        diskRequests[i].show(i);
    }
}

function add(pos) {
    diskRequests.push(new DiskRequest(pos));
    reset();
    // chart.options.scales.yAxes[0].ticks.max = diskRequests.length;
    // chart.update();
    return true;
}

function del(i) {
    diskRequests[i].finalize();
    diskRequests.splice(i, 1);
    reset();
}

function reset() {
    diskRequests.sort(function (a, b) {
        return a.pos - b.pos;
    });
    for (let i in diskRequests) {
        diskRequests[i].reset(i);
    }
    chart.data.datasets[0].data = [{ x: curPos, y: 0 }];
    chart.update();
}

// 根据算法选择下一个服务的请求的编号
function select() {
    let res = -1;
    if (algorithm === ALGORITHM_SSTF) {
        // SSTF算法
        for (let i in diskRequests) {
            if (diskRequests[i].order >= 0) {
                continue;
            }
            if (res === -1 || Math.abs(diskRequests[res].pos - curPos) > Math.abs(diskRequests[i].pos - curPos)) {
                res = i;
            }
        }
        return res;
    } else {
        // SCAN算法
        // 首先寻找当前方向的最近的请求
        for (let i in diskRequests) {
            if (diskRequests[i].order >= 0 || diskRequests[i].pos * curDir < curPos * curDir) {
                continue;
            }
            if (res === -1 || Math.abs(diskRequests[res].pos - curPos) > Math.abs(diskRequests[i].pos - curPos)) {
                res = i;
            }
        }
        // 若没有
        if (res === -1) {
            // 改变方向
            curDir = -curDir;
            // 寻找新方向的最近的请求
            for (let i in diskRequests) {
                if (diskRequests[i].order >= 0 || diskRequests[i].pos * curDir < curPos * curDir) {
                    continue;
                }
                if (res === -1 || Math.abs(diskRequests[res].pos - curPos) > Math.abs(diskRequests[i].pos - curPos)) {
                    res = i;
                }
            }
        }
        return res;
    }
}

function forward() {
    running = true;

    let selectedI = select();
    if (selectedI < 0) {
        return false;
    } else {
        diskRequests[selectedI].order = curOrder;
        ans += Math.abs(diskRequests[selectedI].pos - curPos);
        curPos = diskRequests[selectedI].pos;
        $('#limiter').css('width', 100 * curPos / maxPos + '%');
        setTimeout(function () {
            $('#disk-' + diskRequests[selectedI].id).css('border-color', 'green');
        }, delay);
        show();
        chart.data.datasets[0].data.push({ x: curPos, y: curOrder });
        chart.update();
        curOrder++;
    }

    setTimeout('onTimer()', delay);
    return true;
}

function onTimer() {
    if (continuous && curOrder <= diskRequests.length) {
        forward();
    } else {
        running = false;
        doPause();
    }
}

function onAdd() {
    let pos = parseInt($('#add-pos').val());
    if (isNaN(pos) || pos < 0 || pos >= maxPos) {
        // TODO
        return;
    }
    else if (add(pos) === false) {
        // TODO
        return;
    }
}

function onDel(id) {
    del(id);
}

function onReset() {
    reset();
}

function onForward() {
    forward();
}

function onRandom() {
    add(Math.floor(Math.random() * maxPos));
}

function onRandomList() {
    for (let i = 0; i < 12; i++) {
        add(Math.floor(Math.random() * maxPos));
    }
}

function doPause() {
    continuous = false;
    $('#btn-continue').html('连续执行');
}

function doContinue() {
    continuous = true;
    $('#btn-continue').html('<<暂停>>');
    if (!running) {
        forward();
    }
}

function onContinue() {
    if (continuous) {
        doPause();
    } else {
        doContinue();
    }
}

function onSet() {
    let pos = parseInt($('#add-pos2').val());
    if (isNaN(pos) || pos < 0 || pos >= maxPos) {
        // TODO
        return;
    }
    else {
        curPos = pos;
        reset();
        $('#limiter').css('width', 100 * curPos / maxPos + '%');
    }
}

function sstf() {
    algorithm = ALGORITHM_SSTF;
    $('#navbarDropdown').html('SSTF');
    reset();
}

function scanL() {
    algorithm = ALGORITHM_SCAN;
    curDir = -1;
    $('#navbarDropdown').html('SCAN左');
    reset();
}

function scanR() {
    algorithm = ALGORITHM_SCAN;
    curDir = 1;
    $('#navbarDropdown').html('SCAN右');
    reset();
}
