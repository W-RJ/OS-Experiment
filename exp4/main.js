"use strict";

let chart;

let curPos = 8096;

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
