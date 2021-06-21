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
                            y: 0
                        }
                    ],
                    backgroundColor: 'rgb(0,0,0,0)',
                    borderColor: '#3F5F7F',
                    tension: 0
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
                    },
                ],
                yAxes: [
                    {
                        type: 'linear',
                        ticks: {
                            reverse: "true"
                        }
                    },
                ],
            }
        }
    });
});

class Pos {
    constructor(pos) {
        this.pos = pos;
        this.order = -1;
        this.id = nextId++;
        $('#info-pos').append('<td></td>');
        $('#info-order').append('<td></td>');
        // $('#info-op').append('<td style="padding: 12px;">' +
        //     '<button type="button" class="btn-close" aria-label="Close"></button>' +
        //     '</td>');
        $('#disk').append('<div id="disk-' + this.id + '"></div>')
    }

    finalize() {
        $('#info-pos').children().last().remove();
        $('#info-order').children().last().remove();
        // $('#info-op').children().last().remove();
        $('#disk-' + this.id).remove();
    }

    show(i) {
        $('#info-pos').children('td').eq(i).html(this.pos);
        if (this.order >= 0) {
            $('#info-order').children('td').eq(i).html(this.order);
        } else {
            $('#info-order').children('td').eq(i).html('');
        }
        // $('#info-op').children('td').eq(i).children().on('click', function() {
        //     onDel(i);
        // });
        $('#disk-' + this.id).css('left', 100 * this.pos / maxPos + '%');
        if (this.order >= 0) {
            $('#disk-' + this.id).css('border-color', 'green');
        } else {
            $('#disk-' + this.id).css('border-color', 'red');
        }
    }

    reset(i) {
        curOrder = 1;
        this.order = -1;
        this.show(i);
        chart.data.datasets[0].data = [{ x: curPos, y: 0 }];
        chart.update();
    }
}

let poses = [];

function show() {
    for (let i in poses) {
        poses[i].show(i);
    }
}

function add(pos) {
    poses.push(new Pos(pos));
    reset();
    return true;
}

function del(i) {
    poses[i].finalize();
    poses.splice(i, 1);
    reset();
}

function reset() {
    poses.sort(function (a, b) {
        return a.pos - b.pos;
    });
    for (let i in poses) {
        poses[i].reset(i);
    }
}

function select() {
    let res = -1;
    if (algorithm === ALGORITHM_SSTF) {
        for (let i in poses) {
            if (poses[i].order >= 0) {
                continue;
            }
            if (res !== -1) {
                console.log(Math.abs(poses[res].pos - curPos), Math.abs(poses[i] - curPos));
            }
            if (res === -1 || Math.abs(poses[res].pos - curPos) > Math.abs(poses[i].pos - curPos)) {
                res = i;
            }
        }
        return res;
    } else {
        for (let i in poses) {
            if (poses[i].order >= 0 || poses[i].pos * curDir < curPos * curDir) {
                continue;
            }
            if (res === -1 || Math.abs(poses[res].pos - curPos) > Math.abs(poses[i].pos - curPos)) {
                res = i;
            }
        }
        if (res === -1) {
            curDir = -curDir;
            for (let i in poses) {
                if (poses[i].order >= 0 || poses[i].pos * curDir < curPos * curDir) {
                    continue;
                }
                if (res === -1 || Math.abs(poses[res].pos - curPos) > Math.abs(poses[i].pos - curPos)) {
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
        // TODO
    } else {
        poses[selectedI].order = curOrder;
        ans += Math.abs(poses[selectedI].pos - curPos);
        curPos = poses[selectedI].pos;
        $('#limiter').css('width', 100 * curPos / maxPos + '%');
        setTimeout(function () {
            $('#disk-' + poses[selectedI].id).css('border-color', 'green');
        }, delay);
        show();
        chart.data.datasets[0].data.push({ x: curPos, y: curOrder });
        chart.update();
        curOrder++;
    }

    setTimeout('onTimer()', delay);
}

function onTimer() {
    if (continuous && curOrder <= poses.length) {
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
