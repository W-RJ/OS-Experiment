"use strict";

const STATUS_NOT_ARRIVED = 0;
const STATUS_READY = 1;
const STATUS_RUNNING = 2;
const STATUS_COMPLETED = 3;

const ALGORITHM_FCFS = 0;
const ALGORITHM_RR = 1;
const ALGORITHM_SJF = 2;
const ALGORITHM_HRN = 3;

const POS_NOT_ARRIVED_L = 624;
const POS_NOT_ARRIVED_T = 26;
const POS_NOT_ARRIVED_DL = 2;
const POS_NOT_ARRIVED_DT = 2;

const POS_READY_L = 6;
const POS_READY_T = 32;
const POS_READY_DL = 64;
const POS_READY_DT = 0;

const POS_RUNNING_L = 128;
const POS_RUNNING_T = 160;

const POS_COMPLETED_L = 320;
const POS_COMPLETED_T = 156;
const POS_COMPLETED_DL = 2;
const POS_COMPLETED_DT = 2;

let colors = [
    {fg: 'hsl(330,100%,60%)', bg: 'hsl(330,100%,85%)', base: 330},
    {fg: 'hsl(30,100%,50%)', bg: 'hsl(30,100%,85%)', base: 30},
    {fg: 'hsl(60,100%,45%)', bg: 'hsl(60,100%,85%)', base: 60},
    {fg: 'hsl(90,100%,50%)', bg: 'hsl(90,100%,85%)', base: 90},
    {fg: 'hsl(120,100%,50%)', bg: 'hsl(120,100%,85%)', base: 120},
    {fg: 'hsl(180,100%,45%)', bg: 'hsl(180,100%,85%)', base: 180},
    {fg: 'hsl(210,100%,65%)', bg: 'hsl(210,100%,85%)', base: 210},
    {fg: 'hsl(270,100%,65%)', bg: 'hsl(270,100%,85%)', base: 270},
    {fg: 'hsl(300,100%,50%)', bg: 'hsl(300,100%,85%)', base: 300},
];

let randomID = 1;

let algorithm = ALGORITHM_RR;

let running = false;
let continuous = false;

let curTime = 0;
let finalTime = 0;

let rrQ = 1;
let rrCur = 0;

let delay = 500;
let preDelay = -1;

class Process {
    constructor(name, colorFg, colorBg, colorStd, colorBase, arrivalTime, requiredTime) {
        this.name = name;
        this.colorFg = colorFg;
        this.colorBg = colorBg;
        this.colorStd = colorStd;
        this.colorBase = colorBase;

        this.arrivalTime = arrivalTime;
        this.requiredTime = requiredTime;
        this.servedTime = 0;
        this.completionTime = 0;

        this.status = STATUS_NOT_ARRIVED;
        this.queueID = -1;
    }

    finalize() {
        if (this.colorStd) {
            colors.push({fg: this.colorFg, bg: this.colorBg, base: this.colorBase});
        }
    }

    getResponse() {
        return (this.requiredTime - this.servedTime + curTime - this.arrivalTime) / this.requiredTime;
    }

    reset(pid) {
        let infotr = $('#infotable-' + this.name);
        let statuschartitem = $('#statuschart-' + this.name);
        this.servedTime = 0;
        this.completionTime = 0;
        this.status = STATUS_NOT_ARRIVED;
        infotr.css('border-color', '#00000000');
        infotr.css('background-position', '100%');
        infotr.children('.infotable-servedtime').html(0);
        infotr.children('.infotable-completiontime').html('');
        infotr.children('.infotable-totaltime').html('');
        infotr.children('.infotable-weightedtime').html('');
        infotr.children('.infotable-status').html('未到达');
        statuschartitem.css('left', POS_NOT_ARRIVED_L + pid * POS_NOT_ARRIVED_DL);
        statuschartitem.css('top', POS_NOT_ARRIVED_T + pid * POS_NOT_ARRIVED_DT);
        // TODO
    }

    forward(pid) {
        let infotr = $('#infotable-' + this.name);
        let timecharttr = $('#timechart-' + this.name);
        let statuschartitem = $('#statuschart-' + this.name);
        switch (this.status) {
            case STATUS_NOT_ARRIVED:
                infotr.css('border-color', '#00000000');
                infotr.children('.infotable-status').html('未到达');
                timecharttr.children().eq(curTime).css('background-color', '#00000000');
                // TODO
                break;
            case STATUS_READY:
                infotr.css('border-color', 'yellow');
                infotr.children('.infotable-status').html('就绪');
                timecharttr.children().eq(curTime).css('background-color', 'gainsboro');
                statuschartitem.css('left', POS_READY_L + this.queueID * POS_READY_DL);
                statuschartitem.css('top', POS_READY_T + this.queueID * POS_READY_DT);
                // TODO
                break;
            case STATUS_RUNNING:
                this.servedTime++;
                infotr.css('border-color', 'lightgreen');
                infotr.css('background-position', 100 - (100 * this.servedTime / this.requiredTime) + '%');
                infotr.children('.infotable-servedtime').html(this.servedTime);
                infotr.children('.infotable-status').html('执行');
                $('#timeline-tr').children().eq(curTime).css('background-color', this.colorFg);
                timecharttr.children().eq(curTime).css('background-color', this.colorFg);
                statuschartitem.css('left', POS_RUNNING_L);
                statuschartitem.css('top', POS_RUNNING_T);
                // TODO
                break;
            case STATUS_COMPLETED:
                if (this.completionTime === 0) {
                    this.completionTime = curTime;
                    infotr.children('.infotable-completiontime').html(this.completionTime);
                    infotr.children('.infotable-totaltime').html(this.completionTime - this.arrivalTime);
                    infotr.children('.infotable-weightedtime').html(((this.completionTime - this.arrivalTime) / this.requiredTime).toFixed(2));
                }
                infotr.css('border-color', '#00000000');
                infotr.children('.infotable-status').html('终止');
                timecharttr.children().eq(curTime).css('background-color', '#00000000');
                statuschartitem.css('left', POS_COMPLETED_L + pid * POS_COMPLETED_DL);
                statuschartitem.css('top', POS_COMPLETED_T + pid * POS_COMPLETED_DT);
                // TODO
                break;
        }
    }

    forwardComplete() {
        if (this.status === STATUS_RUNNING && this.servedTime === this.requiredTime) {
            let infotr = $('#infotable-' + this.name);
            this.completionTime = curTime;
            infotr.children('.infotable-completiontime').html(this.completionTime);
            infotr.children('.infotable-totaltime').html(this.completionTime - this.arrivalTime);
            infotr.children('.infotable-weightedtime').html(((this.completionTime - this.arrivalTime) / this.requiredTime).toFixed(2));
            return true;
        }
        return false;
    }

    backwardServedTime() {
        if (this.status === STATUS_RUNNING) {
            let infotr = $('#infotable-' + this.name);
            if (this.completionTime !== 0) {
                this.completionTime = 0;
                infotr.children('.infotable-completiontime').html('');
                infotr.children('.infotable-totaltime').html('');
                infotr.children('.infotable-weightedtime').html('');
            }
            this.servedTime--;
            infotr.css('background-position', 100 - (100 * this.servedTime / this.requiredTime) + '%');
        }
    }

    backward() {
        let infotr = $('#infotable-' + this.name);
        let statuschartitem = $('#statuschart-' + this.name);
        switch (this.status) {
            case STATUS_NOT_ARRIVED:
                infotr.css('border-color', '#00000000');
                infotr.children('.infotable-status').html('未到达');
                break;
            case STATUS_READY:
                infotr.css('border-color', 'yellow');
                infotr.children('.infotable-status').html('就绪');
                break;
            case STATUS_RUNNING:
                infotr.css('border-color', 'lightgreen');
                infotr.children('.infotable-servedtime').html(this.servedTime);
                infotr.children('.infotable-status').html('执行');
                break;
            case STATUS_COMPLETED:
                break;
        }
    }
}

let processes = [];
let readyProcessIDs = [];
let runningProcessID = -1;

$(document).ready(function() {

});

function checkColor(base) {
    for (let process of processes) {
        if (Math.abs(process.colorBase - base) < Math.floor(160 / process.length)) {
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
    if (h > 195 && h < 285)
    {
        return {fg: 'hsl(' + h + ',100%,65%)', bg: 'hsl(' + h + ',100%,85%)', base: h};
    } else {
        return {fg: 'hsl(' + h + ',100%,50%)', bg: 'hsl(' + h + ',100%,85%)', base: h};
    }
}

function calFinalTime() {
    let sortedIDs = [];
    for (let i in processes) {
        sortedIDs.push(i);
    }
    sortedIDs.sort(function(a, b) {
        return processes[a].arrivalTime - processes[b].arrivalTime;
    });
    finalTime = 0;
    for (let i of sortedIDs) {
        finalTime = Math.max(finalTime, processes[i].arrivalTime);
        finalTime += processes[i].requiredTime;
    }
}

function createTimeCharts() {
    let timechartrs = $('#timechart-body').children();
    let timelinetr = $('#timeline-tr');
    let timechartaxis = $('#timechart-axis');
    timechartrs.empty();
    timelinetr.empty();
    timechartaxis.empty();
    for (let i = 0; i < finalTime; i++) {
        timechartrs.append('<td></td>');
        timelinetr.append('<td></td>');
        timechartaxis.append('<td>' + i + '</td>');
    }
}

function reset() {
    for (let id in processes) {
        processes[id].reset(id);
    }
    $('#timeline-limiter').css('width', '0%');
    $('#timechart-limiter').css('width', '0%');
    let diff = parseInt($('#main-container').css('height')) - parseInt($('#sec-container').css('height'));
    if (diff <= 0) {
        $('#main-container').css('height', 'auto');
    } else if (processes.length <= 12) {
        $('#main-container').css('height', '100%');
        setTimeout(reset, 0);
    }
    readyProcessIDs.splice(0, readyProcessIDs.length);
    runningProcessID = -1;
    curTime = 0;
    rrCur = 0;
    doPause();
}

function ready(id) {
    if (algorithm === ALGORITHM_SJF) {
        let i = 0;
        let n = readyProcessIDs.length;
        for (i = 0; i < n; i++) {
            if (processes[readyProcessIDs[i]].requiredTime > processes[id].requiredTime) {
                break;
            }
        }
        readyProcessIDs.splice(i, 0, id);
    } else {
        readyProcessIDs.push(id);
    }
    processes[id].status = STATUS_READY;
}

function forward() {
    running = true;

    if (curTime === 0) {
        calFinalTime();
        createTimeCharts();
    }

    $('timeline-tr').children().eq(curTime).css('background-color', '#00000000');

    for (let i in processes) {
        if (processes[i].arrivalTime === curTime) {
            ready(i);
        }
    }

    if (runningProcessID >= 0 && processes[runningProcessID].servedTime === processes[runningProcessID].requiredTime) {
        processes[runningProcessID].status = STATUS_COMPLETED;
        runningProcessID = -1;
        rrCur = 0;
    }

    if (rrCur >= rrQ) {
        ready(runningProcessID);
        runningProcessID = -1;
        rrCur = 0;
    }

    if (runningProcessID === -1 && readyProcessIDs.length > 0) {
        switch (algorithm) {
            case ALGORITHM_FCFS:
            case ALGORITHM_SJF:
            case ALGORITHM_RR:
                runningProcessID = readyProcessIDs.shift();
                break;
            case ALGORITHM_HRN:
                let readyID = 0;
                for (let i in readyProcessIDs) {
                    if (processes[readyProcessIDs[i]].getResponse() > processes[readyProcessIDs[readyID]].getResponse()) {
                        readyID = i;
                    }
                }
                runningProcessID = readyProcessIDs[readyID];
                readyProcessIDs.splice(readyID, 1);
                break;
        }

        processes[runningProcessID].status = STATUS_RUNNING;
    }

    if (runningProcessID >= 0 && algorithm === ALGORITHM_RR) {
        rrCur++;
    }

    for (let i in readyProcessIDs) {
        processes[readyProcessIDs[i]].queueID = i;
    }

    for (let id in processes) {
        processes[id].forward(id);
    }

    curTime++;

    $('#timeline-limiter').css('width', 100 * curTime / finalTime + '%');
    $('#timechart-limiter').css('width', 100 * curTime / finalTime + '%');

    setTimeout('onTimer()', delay);
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

function setDelay(_delay) {
    delay = _delay;
    $('#infotable-body').children().css('transition-duration', delay / 1000 + 's');
    $('#timeline-limiter').css('transition-duration', delay / 1000 + 's');
    $('#timechart-limiter').css('transition-duration', delay / 1000 + 's');
    $('.statuschart-item').css('transition-duration', delay / 2000 + 's');
}

function addProcess(name, arrivalTime, requiredTime) {
    for (let process of processes) {
        if (name === process.name) {
            return false;
        }
    }
    let colorFg, colorBg, colorStd, colorBase;
    if (colors.length > 0) {
        colorFg = colors[0].fg;
        colorBg = colors[0].bg;
        colorBase = colors[0].base;
        colors.shift();
        colorStd = true;
    } else {
        let ret = getRandomColor();
        colorFg = ret.fg;
        colorBg = ret.bg;
        colorBase = ret.base;
        colorStd = false;
    }
    processes.push(new Process(name, colorFg, colorBg, colorStd, colorBase,
        arrivalTime, requiredTime));
    $('#infotable-body').append('\
        <tr id="infotable-' + name + '" style="background-image: linear-gradient(to right, ' + colorFg + ' 50%, ' + colorBg + ' 50%);">\
            <th scope="row" class="infotable-name">' + name + '</th>\
            <td>' + arrivalTime + '</td>\
            <td>' + requiredTime + '</td>\
            <td class="infotable-servedtime">0</td>\
            <td class="infotable-completiontime"></td>\
            <td class="infotable-totaltime"></td>\
            <td class="infotable-weightedtime"></td>\
            <td class="infotable-status">未到达</td>\
            <td style="padding: 2px;">\
                <button type="button" class="btn-close" aria-label="Close" onclick="onDelProcess(this)"></button>\
            </td>\
        </tr>\
    ');
    $('#timechart-body').append('<tr id="timechart-' + name + '"></tr>');
    $('#statuschart-container').append('<div id="statuschart-' + name + '" class="statuschart-item" '
        + 'style="left:' + (POS_NOT_ARRIVED_L + (processes.length - 1) * POS_NOT_ARRIVED_DL) + 'px;'
        + 'top:' + (POS_NOT_ARRIVED_T + (processes.length - 1) * POS_NOT_ARRIVED_DT) + 'px;'
        + 'background-color:' + colorFg + ';"><p><b>' + name + '</b></p></div>');
    calFinalTime();
    createTimeCharts();
    // TODO
    reset();
    return true;
}

function delProcess(name) {
    for (let i in processes) {
        if (processes[i].name === name) {
            processes[i].finalize();
            processes.splice(i, 1);
            break;
        }
    }
    $('#infotable-' + name).remove();
    $('#timechart-' + name).remove();
    $('#statuschart-' + name).remove();
    calFinalTime();
    createTimeCharts();
    reset();
}

function onTimer() {
    if (runningProcessID >= 0) {
        processes[runningProcessID].forwardComplete();
    }

    if (continuous && curTime <= finalTime) {
        forward();
    } else {
        running = false;
        doPause();
        if (preDelay !== -1) {
            setDelay(preDelay);
            preDelay = -1;
        }
    }
}

function onAddProcess() {
    let name = $('#modal-add-name').val();
    let arrivalTime = parseInt($('#modal-add-arrivaltime').val());
    let requiredTime = parseInt($('#modal-add-requiredtime').val());
    if (!name || !name.match(/^[A-Za-z0-9_]+$/)) {
        // TODO
        return;
    } else if (isNaN(arrivalTime) || arrivalTime < 0) {
        // TODO
        return;
    } else if (isNaN(requiredTime) || requiredTime <= 0) {
        // TODO
        return;
    }
    else if (addProcess(name, arrivalTime, requiredTime) === false)
    {
        // TODO
        return;
    }
    $('#modal-add').modal('hide');
}

function onDelProcess(which) {
    let name = $(which).parents('tr').find('.infotable-name').text();
    delProcess(name);
}

function onRandom() {
    if (processes.length === 0) {
        addProcess('P1', 0, Math.floor(Math.random() * 8 + 1));
        randomID = 2;
    }
    let n = Math.round(Math.random() * 2 + 6) + randomID;
    let div = n - randomID + processes.length;
    for (; randomID < n; randomID++) {
        addProcess('P' + randomID, Math.floor(Math.random() * 12), Math.floor(Math.random() * 60 / div + 1));
    }
}

function onReset() {
    reset();
}

function onForward() {
    if (!(continuous && running)) {
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

function onComplete() {
    if (preDelay === -1) {
        preDelay = delay;
        setDelay(0);
        continuous = true;
        forward();
    }
}

function fcfs() {
    algorithm = ALGORITHM_FCFS;
    $('#navbarDropdown').html('FCFS');
    reset();
}

function rr() {
    algorithm = ALGORITHM_RR;
    $('#navbarDropdown').html('RR');
    reset();
}

function sjf() {
    algorithm = ALGORITHM_SJF;
    $('#navbarDropdown').html('SJF');
    reset();
}

function hrn() {
    algorithm = ALGORITHM_HRN;
    $('#navbarDropdown').html('HRN');
    reset();
}
