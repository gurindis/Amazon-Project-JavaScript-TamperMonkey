// ==UserScript==
// @name         ImproveSite
// @namespace    http://tampermonkey.net/
// @version      2024-04-19
// @description
// @author       gurindis
// @match        https://amazon.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';
    let v2AllDataHolderHTML = `
<div class="allDataHolderV2">
  <div class="leftBox">
  <div class = "stopsCompleted"> </div>
  <div class = "shiftCompleted"> </div>
   </div>
   <div class = "rightBox">
   <div class = "dpph"> </div>
  <div class = "oodtStops"> </div>
   </div>
</div>
`;
    var v2AllDataHolderStyle = `
.allDataHolderV2 {
    box-sizing: border-box;
    padding-top: 0px;
    padding-inline: 16px;
    padding-bottom: 16px;
    display: flex;
    align-items: flex-start;
   justify-content: flex-start;
}

.leftBox {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width:50%;
}

.rightBox {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width:50%;
}

.stopsCompleted, .shiftCompleted, .dpph, .oodtStops {
    width: 100%;
    box-sizing: border-box;
    padding: 0;
}

`;
    GM_addStyle(v2AllDataHolderStyle);

    let comboBoxHtml = `
 <div class="css-1234">
    <div>
        <div class="css-1234" role="combobox" id="comboBox">
            <div class="css-1234abc">
              <label class="css-1234abc">Sort by</label>
              <div class="css-1234abc">
                <div class="css-1234abc"id="selected-item">Route Progress</div>
              </div>
            </div>
            <div class="css-1234abc"></div>
            <div class ="dropdown-list" id="dropdown-content">
             <div class="dropdown-item">DPPH</div>
             <div class="dropdown-item">OODT</div>
             <div class="dropdown-item">Route Progress</div>
             </div>
        </div>
    </div>
 </div>`;
    var sortBoxStyle = `
.comboBox {
}
.selected-item {
   height: 60px;
  background-color: #fff;
  border: none;
  padding: 5px;
  cursor: pointer;
  width: 610px;
   display: flex;
  align-items: flex-end;
  padding-bottom: 10px;
  padding-left: 1px;
}
.dropdown-list {
 position: absolute;
  background-color: #fff;
  border: 1px solid #ccc;
  left: 0;
  width: 100%;
  top: 100%;
  margin-top:5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow-y: auto;
}

.dropdown-item {
padding: 5px 12px;
list-style-type: none; /* Removes bullet points */
font-size: 16px
}

`;

    GM_addStyle(sortBoxStyle);

    function appendSortButton(container) {
        //create image element
        const checkSortButton = document.querySelector('img[alt="Sort Button"]');
        if(!checkSortButton){
            var sortButton = document.createElement('img');
            sortButton.src = 'data:image/png;base64';
            sortButton.alt = 'Sort Button';
            sortButton.style.cursor = 'pointer';
            sortButton.style.position = 'relative';
        }
        //track current state
        var descending = true;

        //function to toggle between ascending & descending states
        function toggleSort(){
            let comboBox = document.querySelector("#comboBox");
            descending = !descending; //toggle the state
            if(descending){
                sortButton.src = 'data:image/png;base64';
                defaultSort(comboBox.querySelector("#selected-item").innerText,'descending');
                console.log('descending');
            }
            else{
                sortButton.src = 'data:image/png;base64,';
                defaultSort(comboBox.querySelector("#selected-item").innerText,'ascending');
                console.log('ascending');
            }
        }

        sortButton.addEventListener('click',toggleSort);
        container.appendChild(sortButton);
        sortButton.style.position = 'absolute';
        sortButton.style.left = (container.offsetWidth +0) + 'px';
    }
    function appendAllDataHolderHTML(daElement){
        if(daElement.querySelector('.allDataHolderV2')==null){
            let lastChild = daElement.children[0];
            lastChild.insertAdjacentHTML('beforeend',v2AllDataHolderHTML);
        }
    }
    function createTimeInputBox(){
        const targetElement = document.querySelector("#main > div > div> div.d > div> div");
        const existingInputBox = document.getElementById('DAPullTime');

        if (targetElement&&!existingInputBox) {
            const existingInput = document.querySelector("#main > div > div> div> div> div> div> span > div")
            const inputBox = document.createElement('input');
            inputBox.setAttribute('type','time');
            inputBox.id = 'DAPullTime';

            if(existingInput) {
                const inputStyles = getComputedStyle(existingInput);
                inputBox.style.fontFamily = inputStyles.fontFamily;
                inputBox.style.fontSize = inputStyles.fontSize;
                inputBox.style.padding = inputStyles.padding;
                inputBox.style.paddingLeft = "10px";
                inputBox.style.margin = inputStyles.margin;
                inputBox.style.width = '100%';
                inputBox.style.height = '40px';
                inputBox.style.border = inputStyles.border;
                inputBox.style.borderRadius = inputStyles.borderRadius;

                inputBox.addEventListener("blur", function() {
                    inputBox.style.boxShadow = inputStyles.boxShadow;
                    inputBox.style.borderColor = inputStyles.borderColor;
                });
                inputBox.addEventListener("input",function(){
                    localStorage.setItem("daPullTime", inputBox.value);
                    callAllOnLoad(false)
                });

            }else{
                console.log('existing input box NOT FOUND');
            }
            targetElement.appendChild(inputBox);
            if (document.querySelector('input[type=time]')) {
                const storedValue = localStorage.getItem("daPullTime");
                if (storedValue) {
                    inputBox.value = storedValue;
                }
            }
        }
    }

    function convertTimeToMilitaryTime(time) {
        // Split the time into hours, minutes, AM/PM
        const [timePart, meridiem] = time.split(" ");
        const [hours, minutes] = timePart.split(":");

        // Convert hours to military time
        let militaryHours = parseInt(hours);
        if (meridiem === "PM" && militaryHours !== 12) {
            militaryHours += 12;
        } else if (meridiem === "AM" && militaryHours === 12) {
            militaryHours = 0;
        }

        // Pad single-digit hours and minutes with leading zeros
        militaryHours = militaryHours.toString().padStart(2, "0");
        const militaryMinutes = minutes.padStart(2, "0");

        return `${militaryHours}:${militaryMinutes}`;
    }
    function convertTextToTimeToMilitaryTime(text) {
        // Extract the time from the text
        const timeRegex = /\b\d{1,2}:\d{2}\s(?:AM|PM)\b/;
        const extractedTime = text.match(timeRegex);
        if (extractedTime) {
            const time = extractedTime[0];
            // Convert time to military time
            const militaryTime = convertTimeToMilitaryTime(time);
            return militaryTime;
        } else {
            return null;
        }
    }
    function convertTimeToMinutes(timeString){
        const[hours,minutes] = timeString.split(':');
        return parseInt(hours)*60+parseInt(minutes);
    }
    function retryWithDelay(func) {
        const timeout = 3000;
        setTimeout(func, timeout);
    }
    function outOnRoadTime(appLoginTime,appLogoutTime,loggedOut){
        var appLoginTimeBuffer = 30;
        const currentTime = new Date().toLocaleTimeString();
        if(appLogoutTime&&loggedOut){
            var oorMinutes = convertTimeToMinutes(appLogoutTime)-(convertTimeToMinutes(appLoginTime));
        }
        else{
            oorMinutes = convertTimeToMinutes(convertTimeToMilitaryTime(currentTime))-(convertTimeToMinutes(appLoginTime));
        }
        return oorMinutes.toFixed(0);
    }
    function shiftLeftMinsCalcOrShiftCompPercentCalc(appLoginTime,daPullTime,valToReturn){
        var shiftDuration = 0;
        if (daPullTime == null || daPullTime.trim() == "") {
            shiftDuration = 600;
            var oorMinutes = outOnRoadTime(appLoginTime,false);
        }
        else{
            shiftDuration = convertTimeToMinutes(daPullTime)-(convertTimeToMinutes(appLoginTime));
            oorMinutes = outOnRoadTime(appLoginTime,false);
        }

        const shiftLeftMinutes = shiftDuration-oorMinutes;
        const shiftCompletedPercent = (oorMinutes/shiftDuration)*100;
        if(valToReturn=='shiftCompletedPercentCalc'){
            return shiftCompletedPercent.toFixed(0);
        }else{
            return shiftLeftMinutes.toFixed(0);
        }

    }

    function shiftCompletedCalcAndAppend(daElement) {
        var result = 0;
        var text = daElement.textContent;
        var daPullTime = document.querySelector("input[type=time]");
        if(daPullTime!=null){
            daPullTime=daPullTime.value;
        }
        var appLoginTimeArray = text.match(/App sign in \d{1,2}:\d{2} [AP]M/);
        if(appLoginTimeArray!==null){
            var appLoginTimeText = appLoginTimeArray[0];
            const appLoginTime = convertTextToTimeToMilitaryTime(appLoginTimeText);
            if(daElement.textContent.includes('App sign out')){
                result = 100;
            }else{
                //da pull time is ALREADY IN MILITARY TIME
                result = shiftLeftMinsCalcOrShiftCompPercentCalc(appLoginTime,daPullTime,'shiftCompletedPercentCalc');
            }
        }
        var resultElement = daElement.querySelector('.shiftCompleted');
        resultElement.textContent = 'Shift Completed: ' + result+ '%';
    }

    function OODTCalcAndAppend(daElement) {
        var oodtStops = 0;
        var stopsCompleted = 0;
        var totalStops = 0;
        var stopsLeft = 0;
        var shiftLeft = 0;
        var oorTime = 0;
        var stopsToBeCompletedByPullTime = 0;
        var dpphMins = 0;
        var daPullTime = document.querySelector("input[type=time]");
        if(daPullTime!=null){
            daPullTime = daPullTime.value
        }
        var text = daElement.textContent;
        var appLoginTimeArray =text.match(/App sign in \d{1,2}:\d{2} [AP]M/);
        if(appLoginTimeArray!=null){
            var appLoginTimeText = appLoginTimeArray[0];
            const appLoginTime = convertTextToTimeToMilitaryTime(appLoginTimeText);
            oorTime = outOnRoadTime(appLoginTime);
            shiftLeft = shiftLeftMinsCalcOrShiftCompPercentCalc(appLoginTime,daPullTime,'shiftLeftMinutesCalc');
            var textContent= text.match(/\d+\/\d+\s+stops/)[0];
            if (textContent.includes("stops")) {
                // Regular expression to match numbers
                var numbers = textContent.match(/\d+/g);
                if (numbers && numbers.length == 2) {
                    // Convert numbers from strings to integer
                    stopsCompleted = parseInt(numbers[0]);
                    totalStops = parseInt(numbers[1]);
                    if (totalStops !== 0) {
                        stopsLeft = totalStops-stopsCompleted;
                    }
                }
            }
            //subtract 30mins
            dpphMins = (stopsCompleted/(oorTime-30));
            if (stopsLeft!=0){
                stopsToBeCompletedByPullTime = shiftLeft*dpphMins;
            }
            if(shiftLeft<0){
                oodtStops=stopsLeft;
            }else{
                oodtStops = (stopsLeft-stopsToBeCompletedByPullTime).toFixed(0);
            }
            if (oodtStops<0){
                oodtStops = 0;
            }
        }

        var resultElement = daElement.querySelector('.oodtStops');
        resultElement.textContent = 'OODT Stops: ' + oodtStops;
    }
    function dpphCalcAndAppend(daElement) {
        var dpph = 0;
        var oorTime = 0;
        var stopsCompleted = 0;
        var text = daElement.textContent;
        var appLoginTimeArray = text.match(/App sign in \d{1,2}:\d{2} [AP]M/);
        if(appLoginTimeArray!==null){
            var appLoginTimeText = appLoginTimeArray[0];
            const appLoginTime = convertTextToTimeToMilitaryTime(appLoginTimeText);
            var appLogoutTimeArray = text.match(/App sign out \d{1,2}:\d{2} [AP]M/);
            if(daElement.textContent.includes('App sign out')&& appLogoutTimeArray!=null){
                var appLogoutTimeText = appLogoutTimeArray[0];
                const appLogoutTime = convertTextToTimeToMilitaryTime(appLogoutTimeText);
                oorTime = outOnRoadTime(appLoginTime,appLogoutTime,true);
            }else{
                oorTime = outOnRoadTime(appLoginTime);
            }
            var textContent= text.match(/\d+\/\d+\s+stops/)[0];
            if (textContent) {
                var numbers = textContent.match(/\d+/g);
                if (numbers && numbers.length == 2) {
                    // Convert numbers from strings to integer
                    stopsCompleted = parseInt(numbers[0]);
                }
            }
            dpph = ((stopsCompleted/(oorTime-30))*60).toFixed(0);
        }

        var resultElement = daElement.querySelector('.dpph');
        resultElement.textContent = 'DPPH: ' + dpph;
    }
    function stopsCompletedCalcAndAppend(daElement) {
        var result = 0;
        var stopsCompleted = 0;
        var totalStops = 0;
        var textContent = '';
        //use regex to find stops
        var text = daElement.textContent;
        textContent= text.match(/\d+\/\d+\s+stops/)[0];
        if (textContent.includes("stops")) {
            // Regular expression to match numbers
            var numbers = textContent.match(/\d+/g);
            if (numbers && numbers.length == 2) {
                // Convert numbers from strings to integer
                stopsCompleted = parseInt(numbers[0]);
                totalStops = parseInt(numbers[1]);
                if (totalStops !== 0) {
                    result = (stopsCompleted / totalStops) * 100;
                    result = result.toFixed(0);
                }
            }
        }

        var resultElement = daElement.querySelector('.stopsCompleted');
        resultElement.textContent = 'Stops Completed: ' + result + '%';
    }
    function callAllOnLoad(initialLoad=true){
        var targetNodes = document.querySelectorAll('.element_name');
        if(initialLoad){
            targetNodes.forEach(function(daElement) {
                appendAllDataHolderHTML(daElement);

                if (!daElement.textContent.includes('Flex')) {
                    shiftCompletedCalcAndAppend(daElement)
                    dpphCalcAndAppend(daElement)
                    OODTCalcAndAppend(daElement)
                }
                stopsCompletedCalcAndAppend(daElement)
            });
        }
        else{
            targetNodes.forEach(function(daElement) {
                if (!daElement.textContent.includes('Flex')) {
                    shiftCompletedCalcAndAppend(daElement)
                    OODTCalcAndAppend(daElement)
                }
                stopsCompletedCalcAndAppend(daElement)
            });
        }
        //sort at end
        let comboBox = document.querySelector("#comboBox");
        defaultSort(comboBox.querySelector("#selected-item").innerText,'descending');
    }
    function removeDefaultSortList(){
        const cortexLeftPanel = document.querySelector('.element_name');
        if (cortexLeftPanel) {
            var elements = cortexLeftPanel.querySelectorAll('.element_name');
            if (elements.length >= 2) {
                var secondElement = elements[1]; // Index 1 refers to the second element
                var secElemChild = secondElement.children[0];
                var child2 = secElemChild.children[0];
                child2.outerHTML = comboBoxHtml;
            }
        }
    }
    //havent used adjustdropdownlistposition yet. the code doesnt work
    function adjustDropdownListPosition() {
        let lastScrollTop = 0;
        let scrollDirection = 'down'; // Default to down

        window.addEventListener('scroll', function() {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > lastScrollTop) {
                scrollDirection = 'down';
            } else {
                scrollDirection = 'up';
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
        }, false);
        const comboBox = document.getElementById('comboBox');
        const dropdown = document.getElementById('dropdown-content');
        if (!comboBox || !dropdown) return;
        const comboBoxRect = comboBox.getBoundingClientRect();
        const dropdownHeight = dropdown.offsetHeight;

        if (scrollDirection === 'down') {
            dropdown.style.top = comboBoxRect.bottom + 'px';
        } else {
            dropdown.style.top = comboBoxRect.top - dropdownHeight + 'px';
        }
    }
    function appendSortList(){
        let targetDiv = document.querySelector('.element_name');
        if (targetDiv){
            removeDefaultSortList();
            let comboBox = document.querySelector("#comboBox");
            if (comboBox) {
                const storedValue = localStorage.getItem("sortOption");
                if (storedValue) {
                    comboBox.querySelector("#selected-item").innerText = storedValue;
                }
            }
            // Hide dropdown list initially
            comboBox.querySelector('#dropdown-content').style.display = "none";

            // Show/hide dropdown list
            comboBox.addEventListener('click', function() {
                let dropdown = document.querySelector("#dropdown-content");
                if (dropdown.style.display == "none") {
                    dropdown.style.display = "block";
                } else {
                    dropdown.style.display = "none";
                }
            });
            // Add event listeners to dropdown items
            let dropdownItems = document.querySelectorAll(".dropdown-item");
            dropdownItems.forEach(function(item) {
                item.addEventListener('click', function() {
                    var selectedItem = this.innerText;
                    localStorage.setItem("sortOption", selectedItem);
                    defaultSort(selectedItem,'ascending');
                    comboBox.querySelector("#selected-item").innerText = selectedItem;
                });
                comboBox.querySelector("#dropdown-content").style.display = "none";
            });

            //if i click on anything outside the dropdown list, make list go away
            document.addEventListener("click", function(event) {
                if (!comboBox.contains(event.target)) {
                    comboBox.querySelector(".dropdown-list").style.display = "none";
                }
            });
        }
        else{
            const mutationObserver = new MutationObserver(()=>{
                appendSortList();
                mutationObserver.disconnect();
            });
            mutationObserver.observe(document.body,{childList:true,subtree:true});
        }
    }
    function defaultSort(comboBoxText,sortCondition){
        if (comboBoxText==='DPPH')
        {
            sortElements('.dpph',sortCondition);
        }
        else if(comboBoxText==='Route Progress'){
            sortElements('.stopsCompleted',sortCondition);
        }
        else {
            sortElements('.oodtStops',sortCondition);
        }
    }
    function sortElements(containerSelector, sortCondition) {
        const container = document.querySelector('.element_name');
        if (!container) {
            console.error('Container not found');
            return;
        }
        function extractNum(text) {
            const match = text.match(/\d+/);
            if (match) {
                return parseInt(match[0]);
            }
            return 0;
        }
        const progressDivs = Array.from(container.children).slice(1);
        progressDivs.sort((a, b) => {
            var numA = 0;
            var numB = 0;
            if(a.querySelector(containerSelector)!==null && b.querySelector(containerSelector)!==null){

                numA = extractNum(a.querySelector(containerSelector).textContent);
                numB = extractNum(b.querySelector(containerSelector).textContent);
                if (sortCondition=="ascending") {
                    return numA - numB;
                } else if (sortCondition=="descending") {
                    return numB - numA;
                }
                else{console.error('sort state is neither ascending nor descending');
                     return;
                    }
            }
        });
        const firstChild = container.firstElementChild;
        // Remove existing elements from container
        container.innerHTML = '';
        container.appendChild(firstChild);
        // Append sorted elements to container
        progressDivs.forEach(div => {
            container.appendChild(div);
        });
    }

    function flexLgRowMt3ElementObserver() {
        const flexLgRowMt3 = document.querySelector("div.element_name");
        if (flexLgRowMt3) {
            const stopsAncestorMutationObserver = new MutationObserver(mutationsList => {
                for(const mutation of mutationsList) {
                    for(const addedNode of mutation.addedNodes) {
                        if (addedNode instanceof Element){
                            if(addedNode.className.includes("element_name")){
                                createTimeInputBox();
                                var targetDiv = document.evaluate("//div[contains(@class, 'element_name')]/div[1]/p", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                                if (targetDiv) {
                                    appendSortButton(targetDiv);
                                }
                                else{
                                    const loadObserver = new MutationObserver(() => {
                                        flexLgRowMt3ElementObserver();
                                        loadObserver.disconnect();
                                    });
                                    loadObserver.observe(document.body,{childList:true,subtree:true});
                                }
                                callAllOnLoad(true);
                            }
                            if((!addedNode.className.includes("element_name"))&& addedNode.querySelector('.element_name')){
                                appendAllDataHolderHTML(addedNode.querySelector('.element_name'));
                                if (!addedNode.textContent.includes('Flex')) {
                                    shiftCompletedCalcAndAppend(addedNode.querySelector('.element_name'))
                                    dpphCalcAndAppend(addedNode.querySelector('.element_name'))
                                    OODTCalcAndAppend(addedNode.querySelector('.element_name'))
                                    stopsCompletedCalcAndAppend(addedNode.querySelector('.element_name'))
                                }
                            }
                            if(addedNode.className.includes("element_name")){
                                createTimeInputBox();
                                appendSortList();
                                callAllOnLoad(true);
                                targetDiv = document.evaluate("//div[contains(@class, 'element_name')]/div[1]/p", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                                if (targetDiv) {
                                    appendSortButton(targetDiv);
                                }
                                else{
                                    const loadObserver = new MutationObserver(() => {
                                        flexLgRowMt3ElementObserver();
                                        loadObserver.disconnect();
                                    });
                                    loadObserver.observe(document.body,{childList:true,subtree:true});
                                }
                            }
                            if(addedNode.className.includes("itinerary-route-view-toggle")){
                                appendSortList();
                            }
                        }
                    }
                }
            });
            stopsAncestorMutationObserver.observe(flexLgRowMt3,{childList:true,subtree:true});
        }
        else {
            const loadObserver = new MutationObserver(() => {
                flexLgRowMt3ElementObserver();
                loadObserver.disconnect();
            });
            loadObserver.observe(document.body,{childList:true,subtree:true});
        }

    }
    flexLgRowMt3ElementObserver();


    //whenever stops completed updates on the webpage, this will observe & update OODT stops, DPPH, Stops Completed & Shift Completed.!!
    function setupNum1Observer() {
        const elementLoadingObserver = new MutationObserver(() => {
            var num1Elements = document.querySelectorAll('.element_name>div>div>div>div>p');
            if (num1Elements.length > 0) {
                elementLoadingObserver.disconnect();
                var stopsCompletedPercent = 0;
                const num1Observer = new MutationObserver((mutationsList) => {
                    mutationsList.forEach((mutation) => {
                        const target = mutation.target;
                        if (target.textContent.includes("stops")) {
                            var mutatedPTag = target.parentNode;
                            const ancestor = mutatedPTag.closest('.element_name');
                            shiftCompletedCalcAndAppend(ancestor);
                            stopsCompletedCalcAndAppend(ancestor);
                        }
                    });
                });
                num1Elements.forEach((element) => {
                    num1Observer.observe(element, {characterData: true, subtree: true });
                });
            }
        });
        elementLoadingObserver.observe(document.documentElement, { childList: true, subtree: true });
    }
    setupNum1Observer()
})();

