function createPopupChart(contextElement,labelData,dataSet,datasetStringValue,yAxisLabelStringValue,stepSizeValue){
    return new Chart(contextElement,{
        type:'line',
        data:{
            labels: labelData,
            datasets:[{
                label:datasetStringValue,
                data: dataSet,
                backgroundColor:'rgb(47,180,191)',
                pointRadius:0,
                borderWidth:1,
                borderColor:' rgb(47,180,191)',
                fill:false
            }]
        },
        options:{
            responsive:true,
            maintainAspectRatio: false,
            hover:{
                mode:'nearest',
                intersect:true
            }, 
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'תאריך',
                    },
                    ticks:{
                        maxTicksLimit:8,
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: yAxisLabelStringValue,
                    },
                    ticks:{
                        suggestedMin: 5,
                        stepSize: stepSizeValue
                    }
                }]
            },
            legend:{
                labels:{
                    boxWidth:0,
                    fontSize: 18,
                },
                reverse:true
            }
        }
    })
}
function createAChart(chartType,contextElement,dataSet1,dataSet2,labelData,fillValue){
    let stackedValue=true
    labelData=createLabelData(labelData)
    let fillValueDataset2=fillValue
    if(chartType==='line') {
        stackedValue=false
        if(fillValue===1)
            fillValueDataset2='origin'
    }
    let text="",labelStringValue="מספר מתחסנים"
    let ticksValue=6
    if(contextElement.canvas.id==="vacination-precentage-chart"){ 
        text="% "
        ticksValue=4
        labelStringValue="אחוז מתחסנים"
    }
    return new Chart(contextElement,{
        type:chartType,
        data:{
            labels: labelData,
            datasets:[{
                label:text+'מתחסנים מנה ראשונה ',
                data: dataSet1,
                backgroundColor:'rgb(35,125,125,0.8)',
                fill:fillValue,
                hoverBorderWidth:"10px"
            },{
                label: text+'מתחסנים מנה שנייה ',
                data: dataSet2,
                backgroundColor:'rgb(182,202,81,0.8)',
                fill:fillValueDataset2,
                hoverBorderWidth:"10px"
            }],
        },
        options:{
            responsive:true,
            maintainAspectRatio: false,
            hover:{
                mode:'nearest',
                intersect:true
            }, 
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                xAxes: [{
                    maxBarThickness:8,
                    stacked: stackedValue,
                    scaleLabel: {
                        display: true,
                        labelString: 'תאריך',
                    },
                    ticks:{
                        maxTicksLimit:8,
                        maxRotation: 0
                    },
                    gridLines: {
                        drawOnChartArea: false
                    }
                }],
                yAxes: [{
                    stacked: stackedValue,
                    ticks:{
                        maxTicksLimit:ticksValue,

                    },

                    scaleLabel: {
                        display: true,
                        labelString: labelStringValue,
                        fontSize:16
                    },
                }]
            },
            legend:{
                labels:{
                    usePointStyle: true,
                    boxWidth:8,
                    fontSize:15
                },
                reverse:true
            }
        }
    })
}
function createLabelData(labelData){
    for(let i=0;i<labelData.length;i++){
        const options = { month:'numeric',day:'numeric'};
        labelData[i]= new Date(labelData[i])
        labelData[i]=labelData[i].toLocaleDateString('he-IL',options)
    }
    return labelData
}
export {createPopupChart, createAChart,createLabelData}