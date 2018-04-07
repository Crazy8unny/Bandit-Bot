exports.getRandomNumber = (min, max) =>
{
    return Math.floor(((Math.random() * max) + min));
}

exports.contains = (array, object)  =>
{
    for (var i = 0; i < array.length; i++)
    {
        if (array[i] == object)
        {
            return true;
        }
    }
    return false;
}

exports.randomItem = (array)  =>
{
    return array[Math.floor(Math.random() * array.length)];
}

exports.generateUID = (length, upper) => 
{
    var possibilities = "12345678900123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567891234567890abcdefghijklmnopqrstuvwxyz01234567890";
    possibilities = possibilities.split("");
    var possible = possibilities.length;
    
    var firstLength = Math.floor(length / 2);
		var lastLength  = Math.ceil (length / 2);
   
    var firstHalf = "";
    var lastHalf = "";
  
    for (var i = 0; i < firstLength; i++)
    {
        firstHalf += possibilities[exports.getRandomNumber(0, possible)];
    }
  
    for (var i = 0; i < lastLength; i++)
    {
        lastHalf += possibilities[exports.getRandomNumber(0, possible)];
    }
  
    var UID = (firstHalf + lastHalf);
    
    if (upper) UID = UID.toUpperCase();
  
    return UID;

}

exports.ucfirst = (string) =>
{
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

exports.getNumericalID = (content) =>
{
    var receiver = content.split(">")[0].trim();
    var ar = receiver.split("");
    var index = 0;
    for (var i = 0; i < ar.length; i++)
    {
        if (isNaN(ar[i]) === false)
        {
            index = i;
            break;
        }
    }
    receiver = receiver.substr(index);
    return receiver;
}

exports.round = (number, dp) =>
{
    return Math.floor(Math.round(number * Math.pow(10, dp))) / Math.pow(10, dp);
}

exports.dateDiff = function(datepart, fromdate, todate) 
{	
  datepart = datepart.toLowerCase();	
  var diff = todate - fromdate;	
  var types = { "w":604800000,
                "d":86400000,
                "h":3600000,
                "m":60000,
                "s":1000
              };	
  
  return Math.floor(diff / types[datepart]);
}

exports.hoursDiff = function(fromdate, todate) 
{	
    let fromYears = fromdate.getFullYear() * 8766;
    let fromMonths = (fromdate.getMonth() + 1) * 720 + fromYears;
    let fromDays = fromdate.getDate() * 24 + fromMonths;
    let fromHours = fromdate.getHours() + fromDays;
  
    let toYears = todate.getFullYear() * 8766;
    let toMonths = (todate.getMonth() + 1) * 720 + toYears;
    let toDays = todate.getDate() * 24 + toMonths;
    let toHours = todate.getHours() + toDays;
  
    return Math.abs(toHours - fromHours);
}

exports.randomColor = () =>
{
    return "#" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
}

exports.dayToDayname = (day) =>
{
    var days = {};
    days["0"] = "Sunday";
    days["1"] = "Monday";
    days["2"] = "Tuesday";
    days["3"] = "Wednesday";
    days["4"] = "Thursday";
    days["5"] = "Friday";
    days["6"] = "Saturday";
  
    return days[day.toString()];
}

exports.formatMinutes = (minutes) =>
{
    if (minutes.toString().length < 2) minutes = "0" + minutes.toString();
  
    return minutes;
}

exports.secondsToTime = (seconds) =>
{
    var hours = 0;
    var minutes = 0; 
  
    if (seconds > 60)
    {
        minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
    }
    
    if (minutes > 60)
    {
        hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
    }
  
    let returnValue = (hours != 0 ? exports.formatMinutes(hours) + ":" : "") + exports.formatMinutes(minutes) + ":" + exports.formatMinutes(seconds);
    
    return returnValue;
}

exports.replaceAll = (string, search, replicitor) =>
{
    return string.split(search).join(replicitor);
}

exports.formatNumber = (x) => 
{
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

exports.formatDate = (date) =>
{
    let ca2 = date.toString().split(' ');
    let cAF = ca2[1] + " " + ca2[2] + ", " + ca2[3] + " [" + ca2[4] + "]";
  
    return cAF;
}

exports.formatShortDate = (date) =>
{
    let short = exports.formatMinutes(date.getDate()) + "/" + exports.formatMinutes((date.getMonth() + 1)) + "/" + exports.formatMinutes(date.getFullYear());
  
    return short;
}

exports.formatShortTime = (date) =>
{
    let short = exports.formatMinutes(date.getHours()) + ":" + exports.formatMinutes(date.getMinutes()) + ":" + exports.formatMinutes(date.getSeconds());
  
    return short;
}

exports.formatShortDatetime = (date) =>
{
    let short = exports.formatShortDate(date) + "  " + exports.formatShortTime(date);
  
    return short;
}

exports.calculateAge = (birthdate) =>
{
    let seconds = (exports.dateDiff("s", birthdate, new Date()));
    
    var years = 0;
    var months = 0;
    var weeks = 0;
    var days = 0; 
    var hours = 0;
    var minutes = 0; 
  
    if (seconds > 60)
    {
        minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
    }
    
    if (minutes > 60)
    {
        hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
    }
    
    if (hours > 24)
    {
        days = Math.floor(hours / 24);
        hours = hours % 24;
    }
    
    if (days > 7)
    {
        weeks = Math.floor(days / 7);
        days = days % 7;
    }
    
    seconds = exports.round(seconds, 2);
    minutes = exports.round(minutes, 2);
    hours   = exports.round(hours  , 2);
    days    = exports.round(days   , 2);
  
    let returnValue = (weeks != 0 ? (weeks) + ":" : "") + (days != 0 ? (days) + ":" : "") + (hours != 0 ? (hours) + ":" : "") + (minutes) + ":" + (seconds);
  
    return returnValue;
}

exports.calculateWordAge = (birthdate) =>
{
    let ageString = exports.calculateAge(birthdate);
  
    let parts = ageString.toString().split(":");
    
    let seconds = parts.pop();
    let minutes = parts.pop();
    let hours = parts.pop();
    let days = parts.pop();
    let weeks = parts.pop();
    let months = parts.pop();
    let years = parts.pop();
  
    let wordAge = seconds + " Seconds";
  
    if (minutes) wordAge = minutes.toString() + ` Minute${minutes > 1 ? "s" : ""} and ` + wordAge;
    if (hours) wordAge = hours.toString() + ` Hour${hours > 1 ? "s" : ""}, ` + wordAge;
    if (days) wordAge = days.toString() + ` Day${days > 1 ? "s" : ""}, ` + wordAge;
    if (weeks) wordAge = weeks.toString() + ` Week${weeks > 1 ? "s" : ""}, ` + wordAge;
    if (months) wordAge = months.toString() + ` Month${months > 1 ? "s" : ""}, ` + wordAge;
    if (years) wordAge = years.toString() + ` Year${years > 1 ? "s" : ""}, ` + wordAge;
  
    return wordAge;
}