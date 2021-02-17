import {createPopupChart,createLabelData,createAChart} from "/utils/graph.js";
const moreInfoModals=document.getElementsByClassName("more-info")
const getDataURL=`http://localhost:2500/getUpdateObj`
const getCityDataURL=`http://localhost:2500/getAllCityData`
const getHospitalDataURL=`http://localhost:2500/getAllHospitalData`
const statsContainers=document.getElementsByClassName("stats-container")
const homeAmountText=document.getElementById("home")
const hotelAmountText=document.getElementById("hotel")
const hospitalAmountText=document.getElementById("hospital")
const vacinationDailyChart=document.getElementById("vacination-daily-chart").getContext('2d')
const vacinationTotalChart=document.getElementById("vacination-total-chart").getContext('2d')
const vacinationPrecentageChart=document.getElementById("vacination-precentage-chart").getContext('2d')
const deceasedDailyChart=document.getElementById("deceased-chart").getContext('2d')
const positivesDailyChart=document.getElementById("positives-chart").getContext('2d')
const deceasedChartButton=document.getElementById("deceased-button")
const positivesChartButton=document.getElementById("positives-button")
const displayButton=document.getElementById("display-button")
const vacinationDailyChartSelector=document.getElementById("vacination-daily-chart-selector")
const vacinationTotalChartSelector=document.getElementById("vacination-total-chart-selector")
const vacinationPrecentageChartSelector=document.getElementById("vacination-precentage-chart-selector")
const headerDate=document.getElementById("sub-title")
const patientConditionDiv=document.getElementById("patient-condition")
const popupChartContainers=document.getElementsByClassName("popup-chart-container")
const cityStatusTableBody=document.getElementById("city-vacine-body")
const stoplightTableBody=document.getElementById("stoplight-table-body")
const hospitalTableBody=document.getElementById("hospital-table-body")
const tableSearchBar=document.getElementById("search-bar-city")
const tableSearchStoplight=document.getElementById("search-bar-stoplight")
const tableHeaders=document.getElementsByTagName("th")


let totalSumFirst=0,totalSumSecond=0
let firstVacinationDailyTotalSum=[],secondVacinationDailyTotalSum=[]
let mainDataBase={},cityDataBase={}, hospitalDataBase={}
let firstVacinationArray=[],secondVacinationArray=[]
let firstVactionationPrecentage=[], secondVactionationPrecentage=[]
let vacinationDaily,vacinationTotal,vacinationPrecentage
let deceasedDaily, positivesDaily
let dateData=[]
const population=9000000

function changeDisplayVisuals(){
    let link=document.createElement('link')
    link.rel="stylesheet"
    link.id="view-css"
    link.href="css/changeview.css"
    document.head.appendChild(link)
    displayButton.removeEventListener('click',changeDisplayVisuals)
    displayButton.addEventListener('click',revertDisplayVisuals)
    vacinationDaily.config.data.datasets[0].backgroundColor="rgb(159,250,130)"
    vacinationDaily.config.data.datasets[1].backgroundColor="rgb(253,130,100)"
    vacinationTotal.config.data.datasets[0].backgroundColor="rgb(159,250,130)"
    vacinationTotal.config.data.datasets[1].backgroundColor="rgb(253,130,100)"
    vacinationPrecentage.config.data.datasets[0].backgroundColor="rgb(159,250,130)"
    vacinationPrecentage.config.data.datasets[1].backgroundColor="rgb(253,130,100)"
    Chart.defaults.global.defaultFontColor="white"
    vacinationDaily.update()
    vacinationTotal.update()
    vacinationPrecentage.update()
    displayButton.innerHTML="לתצוגה רגילה"
}
function revertDisplayVisuals(){
    let link=document.getElementById("view-css")
    link.remove()
    displayButton.removeEventListener('click',revertDisplayVisuals)
    displayButton.addEventListener('click',changeDisplayVisuals)
    vacinationDaily.config.data.datasets[0].backgroundColor="rgb(28, 125, 126,0.8)"
    vacinationDaily.config.data.datasets[1].backgroundColor="rgb(182, 202, 81,0.8)"
    vacinationTotal.config.data.datasets[0].backgroundColor="rgb(28, 125, 126,0.8)"
    vacinationTotal.config.data.datasets[1].backgroundColor="rgb(182, 202, 81,0.8)"
    vacinationPrecentage.config.data.datasets[0].backgroundColor="rgb(28, 125, 126,0.8)"
    vacinationPrecentage.config.data.datasets[1].backgroundColor="rgb(182, 202, 81,0.8)"
    Chart.defaults.global.defaultFontColor="#666"
    vacinationDaily.update()
    vacinationTotal.update()
    vacinationPrecentage.update()
    displayButton.innerHTML="לתצוגה נגישה"
}
displayButton.addEventListener('click',changeDisplayVisuals)
function setTableHeaderClickEvents(){
    for(let header of tableHeaders){
        header.addEventListener('click',(event)=>{
            if(header.classList.contains("sorted"))
            {
                header.classList.remove("sorted")
                updateTableOrder(header,false)
                updateHospitalTableOrder(header,false)
            }
            else{
                header.classList.add("sorted")
                updateTableOrder(header,true)
                updateHospitalTableOrder(header,true)
            }
        })
    }
}
setTableHeaderClickEvents()
function updateHospitalTableOrder(currentHeader,highToLow){
    let value=1
    if(!highToLow) value=-1
    switch(currentHeader.innerHTML){
        case "בית חולים": 
        hospitalDataBase.sort(function(a,b){
            if(a.name<b.name) return -value
            if(a.name>b.name) return value
            return 0
        })
        break;
        case "% תפוסה כללי": 
            hospitalDataBase.sort(function(a,b){
                return (a.generalOccupancyPrecentage-b.generalOccupancyPrecentage)*value
            })
            break;
        case "% תפוסה קורונה":
            hospitalDataBase.sort(function(a,b){
                return (a.covidOccupancyPrecentage-b.covidOccupancyPrecentage)*value
            })
            break;
        case "אנשי צוות מאומתים ובבידוד":
            hospitalDataBase.sort(function(a,b){
                return (a.activeHospitalStaff-b.activeHospitalStaff)*value
            })
            break;
    }
    createHospitalStatusTable(hospitalDataBase)
}
function updateTableOrder(currentHeader,highToLow){
    let value=1
    if(!highToLow) value=-1
    switch(currentHeader.innerHTML){
        case "ישוב":
            cityDataBase.sort(function(a,b){
                if(a.name<b.name) return -value
                if(a.name>b.name) return value
                return 0});
            break;
        case "% מתחסנים מנה ראשונה":
            cityDataBase.sort(function(a,b){
                if((a.totalFirstVacinated/a.population)*100<(b.totalFirstVacinated/b.population)*100) return -value
                if((a.totalFirstVacinated/a.population)*100>(b.totalFirstVacinated/b.population)*100) return value
                return 0
            });
            break;
        case "% מתחסנים מנה שנייה":
            cityDataBase.sort(function(a,b){
                if((a.totalSecondVacinated/a.population)*100<(b.totalSecondVacinated/b.population)*100) return -value
                if((a.totalSecondVacinated/a.population)*100>(b.totalSecondVacinated/b.population)*100) return value
                return 0
            });
            break;
        case "חולים פעילים":
            cityDataBase.sort(function(a,b){
                return (a.totalPatients-b.totalPatients)*value
            });
            ;break;
        case "ציון יומי מחושב": case "ציון וצבע יומי":
            cityDataBase.sort(function(a,b){
                return (a.totalPatients-b.totalPatients)*value
            });
            ;break;
        case "חולים חדשים לכל 10000 נפש":
            cityDataBase.sort(function(a,b){
                let resultA=a.dailyStoplightData[a.dailyStoplightData.length-1].newActivePatientsDaily/(a.population/10000)
                let resultB=b.dailyStoplightData[b.dailyStoplightData.length-1].newActivePatientsDaily/(b.population/10000)
                return (resultA-resultB)*value
            });
            break;
        case "% הבדיקות החיוביות":
            cityDataBase.sort(function(a,b){
                return (a.dailyStoplightData[a.dailyStoplightData.length-1].positivesPrecentageDaily-b.dailyStoplightData[b.dailyStoplightData.length-1].positivesPrecentageDaily)*value
            })
            break;
        case "שיעור שינוי מאומתים":
            cityDataBase.sort(function(a,b){
                return (a.dailyStoplightData[a.dailyStoplightData.length-1].newActivePatientsDaily)/(a.dailyStoplightData[a.dailyStoplightData.length-2].newActivePatientsDaily)
                        -(b.dailyStoplightData[b.dailyStoplightData.length-1].newActivePatientsDaily)/(b.dailyStoplightData[b.dailyStoplightData.length-2].newActivePatientsDaily)*value
            })
            break;
        default:          
            cityDataBase.sort(function(a,b){
                return ((a.totalPatients/(a.population/10000))-(b.totalPatients/(b.population/10000)))*value
        });
        ;break;
    }
    if(currentHeader.parentElement.parentElement.classList.contains("city-vacine-header"))
        createCityTable(cityDataBase)
    else if(currentHeader.parentElement.parentElement.classList.contains("stoplight-header"))
        createStoplightTable(cityDataBase)
}
tableSearchStoplight.addEventListener('input',(event)=>{
    for(let row of stoplightTableBody.children){
        if(!row.firstElementChild.innerHTML.includes(tableSearchStoplight.value)){
            row.style.display="none"
            continue;
        }
        row.style.display="table-row"
    }
})
tableSearchBar.addEventListener('input',(event)=>{
    for(let row of cityStatusTableBody.children){
        if(!row.firstElementChild.innerHTML.includes(tableSearchBar.value)){
            row.style.display="none"
            continue;
        }
        row.style.display="table-row"
    }
})
async function getHospitalDataBase(){
    try{
        await fetch(getHospitalDataURL)
        .then((res) => {
            if (res.ok) {
                return res.json()
            } else {
                throw new Error(res)
            }
        }).then((jsonObj) =>{
            hospitalDataBase=jsonObj;
            createHospitalStatusTable(hospitalDataBase)
        }).catch((err)=>{
            console.log(err)
        })
    }catch(err){
        console.log(err)
    }
}
async function getDataBase(){
    try{
        await fetch(getDataURL)
        .then((res) => {
            if (res.ok) {
                return res.json()
            } else {
                throw new Error(res)
            }
        }).then((jsonObj) =>{
            mainDataBase=jsonObj;
            let updateIndex=mainDataBase.updateTests.length-1;
            updateDatabaseUI(updateIndex)
        }).catch((err)=>{
            console.log(err)
        })
    }catch(err){
        console.log(err)
    }
}
async function getCityDataBase(){
    try{
        await fetch(getCityDataURL)
        .then((res) => {
            if (res.ok) {
                return res.json()
            } else {
                throw new Error(res)
            }
        }).then((jsonObj) =>{
            cityDataBase=jsonObj;
            createCityTable(cityDataBase)
            createStoplightTable(cityDataBase)
        }).catch((err)=>{
            console.log(err)
        })
    }catch(err){
        console.log(err)
    }
}
function createTableData(currentRow){
    let data=document.createElement('td')
    data.classList.add("table-data")
    currentRow.appendChild(data)
    return data
}
function addDynamicBar(parent,precentage,scale=1){
    let bar=document.createElement('span')
    bar.classList.add('precentage-bar')
    bar.style.width=(scale*precentage)+"px"
    parent.innerHTML=precentage+"%"
    parent.appendChild(bar)
    return bar
}
function createHospitalStatusTable(currentHospitalDatabase){
    hospitalTableBody.innerHTML=""
    for(let i=0;i<currentHospitalDatabase.length;i++){
        let newRow=document.createElement('tr')
        if( i===currentHospitalDatabase.length-1) newRow.style.border="0px"
        let hospitalName=createTableData(newRow)
        hospitalName.innerHTML=currentHospitalDatabase[i].name
        let generalOccupancyPrecentageData=createTableData(newRow)
        let firstDynamicBar=addDynamicBar(generalOccupancyPrecentageData,currentHospitalDatabase[i].generalOccupancyPrecentage,0.2)
        firstDynamicBar.classList.add("first-vacine-color")
        let covidOccupancyPrecentageData=createTableData(newRow)
        let secondDynamicBar=addDynamicBar(covidOccupancyPrecentageData,currentHospitalDatabase[i].covidOccupancyPrecentage,0.2)
        secondDynamicBar.classList.add("second-vacine-color")
        let activeHospitalStaffData=createTableData(newRow)
        activeHospitalStaffData.innerHTML=currentHospitalDatabase[i].activeHospitalStaff
        hospitalTableBody.appendChild(newRow)
    }
}   
function createStoplightTable(currentStoplightDatabase){
    stoplightTableBody.innerHTML=""
    for(let i=0;i<currentStoplightDatabase.length;i++){
        let newRow=document.createElement('tr')
        if( i===currentStoplightDatabase.length-1) newRow.style.border="0px"
        let index=currentStoplightDatabase[i].dailyStoplightData.length-1
        let cityName=createTableData(newRow)
        cityName.innerHTML=currentStoplightDatabase[i].name;
        let stoplightResultData=createTableData(newRow)
        let gradeContainer=setStoplightColor(Math.floor((Math.random() * 100))/10);
        stoplightResultData.appendChild(gradeContainer)
        let totalPatientsFor10000Data=createTableData(newRow)
        totalPatientsFor10000Data.classList.add("bolder-data")
        totalPatientsFor10000Data.innerHTML=parseFloat(Math.round(((currentStoplightDatabase[i].dailyStoplightData[index].newActivePatientsDaily)/(currentStoplightDatabase[i].population/10000))* Math.pow(10, 2)) /Math.pow(10,2)).toFixed(2)
        let dailyPositivePrecentageData=createTableData(newRow)
        dailyPositivePrecentageData.classList.add("bolder-data")
        dailyPositivePrecentageData.innerHTML=currentStoplightDatabase[i].dailyStoplightData[index].positivesPrecentageDaily+"%"
        let dailyChangeRatePrecentage=createTableData(newRow)
        dailyChangeRatePrecentage.classList.add("bolder-data")
        let precentage=parseFloat(Math.round(((currentStoplightDatabase[i].dailyStoplightData[index].newActivePatientsDaily)/(currentStoplightDatabase[i].dailyStoplightData[index-1].newActivePatientsDaily)*100)* Math.pow(10, 2)) /Math.pow(10,2)).toFixed(2)
        currentStoplightDatabase[i].dailyStoplightData[index].newActivePatientsDaily>currentStoplightDatabase[i].dailyStoplightData[index-1].newActivePatientsDaily?precentage*=-1:precentage*=1
        dailyChangeRatePrecentage.innerHTML= precentage+"%"
        let totalPatientsData=createTableData(newRow)
        totalPatientsData.innerHTML=currentStoplightDatabase[i].totalPatients
        stoplightTableBody.appendChild(newRow)
    }
}
function createCityTable(currentCityDataBase){
    cityStatusTableBody.innerHTML=""
    for(let i=0;i<currentCityDataBase.length;i++){
        let newRow=document.createElement('tr')
        if( i===currentCityDataBase.length-1) newRow.style.border="0px"
        let cityName=createTableData(newRow)
        cityName.innerHTML=currentCityDataBase[i].name;
        let firstVacineData=createTableData(newRow)
        let precentage=parseFloat(Math.round(((currentCityDataBase[i].totalFirstVacinated /currentCityDataBase[i].population)*100) * Math.pow(10, 2)) /Math.pow(10,2)).toFixed(2)
        let firstDynamicBar=addDynamicBar(firstVacineData,precentage)
        firstDynamicBar.classList.add('first-vacine-color')
        let secondVacineData=createTableData(newRow)
        precentage=parseFloat(Math.round(((currentCityDataBase[i].totalSecondVacinated /currentCityDataBase[i].population)*100) * Math.pow(10, 2)) /Math.pow(10,2)).toFixed(2)
        let secondDynamicBar=addDynamicBar(secondVacineData,precentage)
        secondDynamicBar.classList.add('second-vacine-color')
        let totalPatientsData=createTableData(newRow)
        totalPatientsData.innerHTML=currentCityDataBase[i].totalPatients
        let totalPatientsFor10000Data=createTableData(newRow)
        totalPatientsFor10000Data.innerHTML=parseFloat(Math.round((currentCityDataBase[i].totalPatients/(currentCityDataBase[i].population/10000)) * Math.pow(10, 2)) /Math.pow(10,2)).toFixed(2)
        let stoplightResultData=createTableData(newRow)
        let gradeContainer=setStoplightColor(Math.floor((Math.random() * 100))/10);
        stoplightResultData.appendChild(gradeContainer)
        cityStatusTableBody.appendChild(newRow)
    }
}
function setStoplightColor(stoplightGrade){
    let gradeContainer=document.createElement('div')
    gradeContainer.classList.add("gradeContainer")
    if(stoplightGrade<2.5 &&stoplightGrade>0)
        gradeContainer.classList.add("stoplight-red")
    else if(stoplightGrade<5 && stoplightGrade> 2.5)
        gradeContainer.classList.add("stoplight-orange")
    else if(stoplightGrade<7.5 && stoplightGrade> 5)
        gradeContainer.classList.add("stoplight-yellow")
    else
        gradeContainer.classList.add("stoplight-green")
    gradeContainer.innerHTML=stoplightGrade
    return gradeContainer
}
function setModalEvents(){
    for(let modal of moreInfoModals){
        modal.addEventListener("mouseover",function(){
            modal.firstElementChild.style.display="block";

            setTimeout(() => {

                modal.firstElementChild.style.opacity=1;
            }, 10);
        })
        modal.addEventListener("mouseleave",function(){
            setTimeout(() => {
                modal.firstElementChild.style.opacity=0;
            }, 200);
            modal.firstElementChild.style.display="none";
        })
    }
}
getDataBase()
getCityDataBase()
getHospitalDataBase()
setModalEvents()
setChartButtonEvents()
function createVacinationCharts(){
    resetDataFirstChart()
    updateChartData(checkFilterValue(vacinationDailyChartSelector))
    vacinationDaily= createAChart('bar',vacinationDailyChart,firstVacinationArray,secondVacinationArray,dateData,1)
    checkIfAccessableView(vacinationDaily)
    resetDataStorage()
    updateChartData(checkFilterValue(vacinationTotalChartSelector),'second')
    vacinationTotal=createAChart('line',vacinationTotalChart,firstVacinationDailyTotalSum,secondVacinationDailyTotalSum,dateData,1)
    checkIfAccessableView(vacinationTotal)
    resetDataStorage()
    resetDataPrecentage()
    updateChartData(checkFilterValue(vacinationPrecentageChartSelector),'third')
    vacinationPrecentage=createAChart('line',vacinationPrecentageChart,firstVactionationPrecentage,secondVactionationPrecentage,dateData,false)
    checkIfAccessableView(vacinationPrecentage)
}
function checkFilterValue(selector){
    let filterIndex=mainDataBase.updateVacinations.length;
    switch (selector.value){
        case "last-month":   filterIndex>30?filterIndex=30:filterIndex+=0;break;
        case "last-week": filterIndex>7?filterIndex=7:filterIndex+=0;break;
        case "last-two-weeks": filterIndex>14?filterIndex=14:filterIndex+=0;break;
        case "all-time":  break;
    }
    return filterIndex
}
function updateChartData(filterIndex,whichChart){
    for(let i=0,j=mainDataBase.updateVacinations.length-filterIndex;i<filterIndex;i++,j++){
        if(!whichChart){
            firstVacinationArray.push(mainDataBase.updateVacinations[j].totalDailyVacinatedOnce)
            secondVacinationArray.push(mainDataBase.updateVacinations[j].totalDailyVacinatedTwice)
            totalSumFirst+=(firstVacinationArray[i]*1)
            totalSumSecond+=(secondVacinationArray[i]*1)
            firstVacinationDailyTotalSum.push(totalSumFirst)
            secondVacinationDailyTotalSum.push(totalSumSecond)
            firstVactionationPrecentage.push((totalSumFirst/population)*100)
            secondVactionationPrecentage.push((totalSumSecond/population)*100)
            dateData.push(mainDataBase.updateDates[j])
            continue;
        }
        if(whichChart==="first"){
            firstVacinationArray.push(mainDataBase.updateVacinations[j].totalDailyVacinatedOnce)
            secondVacinationArray.push(mainDataBase.updateVacinations[j].totalDailyVacinatedTwice)
        }
        else {
            totalSumFirst+=(mainDataBase.updateVacinations[j].totalDailyVacinatedOnce*1)
            totalSumSecond+=(mainDataBase.updateVacinations[j].totalDailyVacinatedTwice*1)
            if(whichChart==="second"){
                firstVacinationDailyTotalSum.push(totalSumFirst)
                secondVacinationDailyTotalSum.push(totalSumSecond)
            }   
            else{
                firstVactionationPrecentage.push((totalSumFirst/population)*100)
                secondVactionationPrecentage.push((totalSumSecond/population)*100)
            }
        }
        dateData.push(mainDataBase.updateDates[i+(mainDataBase.updateDates.length-filterIndex)])//nn to be i + (total-range)
    }
}
function updateDatabaseUI(updateIndex){
    updateDeceased()
    updateHeaderDate(updateIndex)
    updateVacinated(updateIndex)
    updateTests(updateIndex)
    updatePatients(updateIndex)
    createVacinationCharts()
    vacinationDailyChartSelector.addEventListener('change',(event)=>{
        resetDataFirstChart()
        updateChartData(checkFilterValue(vacinationDailyChartSelector),'first')
        vacinationDaily.destroy()
        vacinationDaily= createAChart('bar',vacinationDailyChart,firstVacinationArray,secondVacinationArray,dateData,1)
        checkIfAccessableView(vacinationDaily)
    })
    vacinationTotalChartSelector.addEventListener('change',(event)=>{
        resetDataStorage()
        updateChartData(checkFilterValue(vacinationTotalChartSelector),'second')
        vacinationTotal.destroy()
        vacinationTotal=createAChart('line',vacinationTotalChart,firstVacinationDailyTotalSum,secondVacinationDailyTotalSum,dateData,1)
        checkIfAccessableView(vacinationTotal)
    })
     vacinationPrecentageChartSelector.addEventListener('change',(event)=>{
        resetDataStorage()
        resetDataPrecentage()
        updateChartData(checkFilterValue(vacinationPrecentageChartSelector),'third')
        vacinationPrecentage.destroy()
        vacinationPrecentage=createAChart('line',vacinationPrecentageChart,firstVactionationPrecentage,secondVactionationPrecentage,dateData,false)
        checkIfAccessableView(vacinationPrecentage)
    })
}
function checkIfAccessableView(chart){
    if(document.getElementById("view-css")){
        chart.config.data.datasets[0].backgroundColor="lightgreen"
        chart.config.data.datasets[1].backgroundColor="red"
        chart.update()
    }
}
function updateHeaderDate(updateIndex){
    const options = { dateStyle:'full' };
    const date= new Date(mainDataBase.updateDates[updateIndex])
    headerDate.innerHTML= " עדכון אחרון:"+date.toLocaleDateString('he-IL',options)
}
function updateDeceased(){
    statsContainers[4].firstElementChild.nextElementSibling.innerHTML="<h2>"+mainDataBase.totalDeceased+"</h2>"
}
function updateVacinated(updateIndex){
    statsContainers[3].firstElementChild.firstElementChild.innerHTML=
    "<h4> מתחסנים מנה ראשונה </h4><h4 class='distance'>"+mainDataBase.totalVacinatedOnce+"</h4>"
    statsContainers[3].firstElementChild.lastElementChild.firstElementChild.innerHTML=
    "<span class='change bold'>"+mainDataBase.updateVacinations[updateIndex].totalDailyVacinatedOnce+"+ </span>מחצות"
    statsContainers[3].lastElementChild.firstElementChild.innerHTML=
    "<h4> מתחסנים מנה שנייה </h4><h4 class='distance'>"+mainDataBase.totalVacinatedTwice+"</h4>"
    statsContainers[3].lastElementChild.lastElementChild.firstElementChild.innerHTML=
    "<span class='change bold'>"+mainDataBase.updateVacinations[updateIndex].totalDailyVacinatedTwice+"+ </span>מחצות"
}
function updateTests(updateIndex){
    statsContainers[5].firstElementChild.nextElementSibling.innerHTML= "<h2>"+mainDataBase.updateTests[updateIndex].totalDailyPositivesPrecentage+"%</h2>"
    const yesterdayTestsDiv=document.createElement('div')
    yesterdayTestsDiv.style.marginTop="6px"
    yesterdayTestsDiv.innerHTML="<span class='bold'>"+mainDataBase.updateTests[updateIndex].totalDailyTests+"</span> בדיקות אתמול"
    statsContainers[5].firstElementChild.nextElementSibling.appendChild(yesterdayTestsDiv)
    statsContainers[0].lastElementChild.lastElementChild.firstElementChild.innerHTML=(mainDataBase.totalTests)+" "
    let totalPositives=Math.floor(mainDataBase.updateTests[updateIndex].totalDailyTests/mainDataBase.updateTests[updateIndex].totalDailyPositivesPrecentage)
    statsContainers[0].lastElementChild.firstElementChild.innerHTML="<h3 class='distance'>"+totalPositives+"</h3> "
    statsContainers[0].lastElementChild.firstElementChild.nextElementSibling.firstElementChild.innerHTML=Math.floor(mainDataBase.updateTests[updateIndex-1].totalDailyTests/mainDataBase.updateTests[updateIndex-1].totalDailyPositivesPrecentage)+"+ "
}
function updatePatients(updateIndex){
    statsContainers[1].firstElementChild.nextElementSibling.firstElementChild.innerHTML="<h3>"+mainDataBase.totalActive+"</h3> "
    statsContainers[1].firstElementChild.nextElementSibling.lastElementChild.firstElementChild.innerHTML=mainDataBase.updatePatients[updateIndex].totalDailyActive+" "
    statsContainers[2].lastElementChild.firstElementChild.innerHTML="<h3>"+mainDataBase.totalHospitalised+"</h3>"
    statsContainers[2].lastElementChild.firstElementChild.nextElementSibling.firstElementChild.innerHTML=mainDataBase.updatePatients[updateIndex].totalDailyHospitalised+" "
    patientConditionDiv.firstElementChild.lastElementChild.innerHTML=mainDataBase.totalCritical
    patientConditionDiv.lastElementChild.lastElementChild.innerHTML=mainDataBase.totalRessesitated
    homeAmountText.innerHTML= Math.floor(mainDataBase.totalActive* 0.84);
    hotelAmountText.innerHTML= Math.floor(mainDataBase.totalActive* 0.1);
    hospitalAmountText.innerHTML= Math.floor(mainDataBase.totalActive* 0.06);
}                                                                                                           
function resetDataStorage(){
    totalSumFirst=0
    totalSumSecond=0
    firstVacinationDailyTotalSum=[]
    secondVacinationDailyTotalSum=[]    
    dateData=[]
}
function resetDataFirstChart(){
    firstVacinationArray=[]
    secondVacinationArray=[]
    dateData=[]
}
function resetDataPrecentage(){
    firstVactionationPrecentage=[]
    secondVactionationPrecentage=[]
    dateData=[]
}
function setChartButtonEvents(){
    
    deceasedChartButton.addEventListener('click',openChart)
    positivesChartButton.addEventListener('click',openChart)
}
function openChart(event){
    event.preventDefault()
    let contextElement=positivesDailyChart
    let labelData=[]
    for(let i=0;i<mainDataBase.updateDates.length;i++){
        labelData.push(mainDataBase.updateDates[i])
    }
    labelData=createLabelData(labelData)
    let dataSet=[]
    if(event.target.id==="deceased-button"||event.target.parentElement.parentElement.id==="deceased-button"
    ||event.target.parentElement.id==="deceased-button"){
        for(let i=0;i<mainDataBase.updatePatients.length;i++){
            dataSet.push(mainDataBase.updatePatients[i].totalDailyDeceased)
        }
        contextElement=deceasedDailyChart
        deceasedDaily=createPopupChart(contextElement,labelData,dataSet,'נפטרים - שינוי יומי','כמות נפטרים' ,   25)
        popupChartContainers[0].classList.add("open")
        deceasedChartButton.addEventListener('click',closeChart)
        deceasedChartButton.removeEventListener('click',openChart)
        try{
            positivesDaily.destroy()
            popupChartContainers[1].classList.remove("open")
        }catch(err){}
    } 
    if(event.target.id==="positives-button"||event.target.parentElement.parentElement.id==="positives-button"
    ||event.target.parentElement.id==="positives-button"){
        for(let i=0;i<mainDataBase.updateTests.length;i++){
            dataSet.push(mainDataBase.updateTests[i].totalDailyTests)
        }
        contextElement=positivesDailyChart
        positivesDaily=createPopupChart(contextElement,labelData,dataSet,'בדיקות - מגמת שינוי יומית','מספר בדיקות יומיות', 25000)
        popupChartContainers[1].classList.add("open")
        positivesChartButton.addEventListener('click',closeChart)
        positivesChartButton.removeEventListener('click',openChart)
        try{
            deceasedDaily.destroy()
            popupChartContainers[0].classList.remove("open")
        }catch(err){}
    }
}
function closeChart(event){
    if(event.target.id==="deceased-button"||event.target.parentElement.parentElement.id==="deceased-button"
    ||event.target.parentElement.id==="deceased-button"){
        deceasedChartButton.addEventListener('click',openChart)
        deceasedChartButton.removeEventListener('click',closeChart)
        popupChartContainers[0].classList.remove("open")
    }
    if(event.target.id==="positives-button"||event.target.parentElement.parentElement.id==="positives-button"
    ||event.target.parentElement.id==="positives-button"){
        positivesChartButton.addEventListener('click',openChart)
        positivesChartButton.removeEventListener('click',closeChart)
        popupChartContainers[1].classList.remove("open")
    }
}
