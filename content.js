
/**
 * Display a statistic to the user.

 * @param  statsElem    The reference statistic element (e.g. "Totaal verbruik: 1.134,53 GB").
 * @param  spanElem     The reference span element (e.g. "1.134,53 GB"). (used to markup the value)
 * @param  key          The key value to show (e.g. "Piekuren").
 * @param  value        The value of the key to show (e.g. "556.51 GB / 650 GB").
 */
function displayStat(statsElem, spanElem, key, value) {
    var keyElem = statsElem.cloneNode(true);
    keyElem.innerText = key + ": ";
    keyElem.setAttribute("style", "margin:12px");
    var valueElem = spanElem.cloneNode(true);
    valueElem.innerText = value;
    keyElem.appendChild(valueElem);
    statsElem.parentNode.insertBefore(keyElem, statsElem.nextSibling);
}

/**
 * Display some additional Telemeter statistics.
 * (1) The peak usage progress
 * (2) The day progress
*/
function addStats() {

    // Get the peak usage html element
    const peakUsageElem = document.evaluate("//span[@data-byte-format='telemeterCtrl.selectedPeriod.usage.peakUsage']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    // Get the exact amount used
    const peakUsage = parseFloat(peakUsageElem.singleNodeValue.textContent.substr(0, 6).replace(',', '.'));

    // Get current number of days usage
    const daysUsage = document.evaluate("count(//*[contains(@class, 'TelenetUsageDetails') and contains(@class, 'NoMobile')]//*[local-name()='g' and contains(@class, 'nv-group') and contains(@class, 'nv-series-0')]/*)", document, null, XPathResult.NUMBER_TYPE, null).numberValue;

    // Get reset date
    const resetDateElem = document.evaluate("//span[@data-translate='telemeter.reset-volume']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent.split(" ");
    const resetDateString = resetDateElem[resetDateElem.length - 1];
    const dateParts = resetDateString.split("/");
    const resetDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);     // dd/mm/yyyy

    // Calculate remaining days in current period
    const diffTime = Math.abs(resetDate - new Date());
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));


    // Display new stats
    const currentPeriod = document.evaluate("//*[@class='currentPeriod']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    
    var totalUsage = document.evaluate("//*[@class='currentusage']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    totalUsage.setAttribute("style", "margin:12px");    // extra styling :)
    const span = document.evaluate("//*[@class='currentusage']/span", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    // Get language preference
    const language = document.evaluate("//*[@class='lang-selected']/span", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
    
    const totalDays = daysUsage + remainingDays - 1;
    const peakHoursLimit = daysUsage * (750 / totalDays);
    displayStat(totalUsage, span, (language == "nl" ? "Dag" : "Jour"), daysUsage + " / " + totalDays);
    displayStat(totalUsage, span, (language == "nl" ? "Piekuren" : "Heures pleines"), Math.round(peakUsage) + " GB / " + Math.round(peakHoursLimit) + " GB");

}

// Wait until the statistics are loaded
var checkExist = setInterval(function() {
   if (document.getElementsByClassName("nv-groups").length) {
        clearInterval(checkExist);
        addStats();
   }
}, 200);
