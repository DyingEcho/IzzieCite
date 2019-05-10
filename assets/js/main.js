let citations = []

function htmlEscape(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

class CitationFormat{//Class for different types for citation formats (APA, MLA, etc.)
    constructor(
        name,           //Name of the citation format
        enabledElements, //Array of strings, HTML id's of each elements needed for the citation type
        format,           //String, with citation format, "$n" is to be replaced with input of index n from array above. $ being the escape character and n being the index of which to take value from. Index 0
        allowedElements=[]//Elements that are allowed but will not be fetched into the citation
    ){
        this.name = name;
        this.format = format;
        this.enabledElements = enabledElements;
        this.allowedElements = allowedElements;
    }
}
//Dictionary:
//authorFirst           authorLast
//PageTitle             siteTitle           manualCiteURL
//date[Published/Accessed][Day/Month/Year]
//MLA[Publish/Access]Date -> Hidden form with processed dates

let citationFormats = [
    new CitationFormat("MLA 7",
    ["authorFirst","authorLast","pageTitle","siteTitle","manualCiteURL","MLAPublishDate","MLAAccessDate"],
    "$1, $0. \"$2\" <i>$3</i>, $5, $6, <a href=\"$4\">$4</a>", ["datePublishedDay","datePublishedMonth","datePublishedYear","dateAccessedDay","dateAccessedMonth","dateAccessedYear"]),
    new CitationFormat("MLA 8",
    ["authorFirst","authorLast","pageTitle","siteTitle","manualCiteURL","MLAPublishDate"],
    "$1, $0. \"$2\" <i>$3</i>, $5, <a href=\"$4\">$4</a>",["datePublishedDay","datePublishedMonth","datePublishedYear"])
];//Array containing each type of citation

var citationIndex = 0;//Index of currently selected citation type

class WebCitation {
	constructor(
        citationIndex
	){
        this.values = [];
        //Set values[i] for every required id to the value of input with that id
        citationFormats[citationIndex].enabledElements.forEach(id =>{
            this.values.push(htmlEscape($("#"+id).val()));
        });
        this.citationIndex = citationIndex;
  }

  setValueAfter(values){
      this.values = values;
  }
  //get citationText() {
//	  return `${this.authorLast}, ${this.authorFirst}. "${this.pageTitle}." \
//${this.siteTitle}, ${this.publisher ? this.publisher + ', ' : ''}\
//${this.datePublished}, ${this.dateAccessed}, ${this.url}`
//  }
  get citationHTML(){
      let citationFormat = citationFormats[this.citationIndex].format;
      let returnString = "";
      var i =0;
      while(i < citationFormat.length){
          if(citationFormat[i]=="$"){//See if escape character is encountered
              i+=1;//The number after the escape character is the index for the appropriate value desired. We move i to number after $ in order to get this index
              //This also serves the double purpose of moving i past the $ character, then at the end of the loop i will be pushed past the number character, skipping parsing for this value again

              var valueIndex= parseInt(citationFormat[i], 10);//The index for the value we want to get stored in this.values
              returnString+=this.values[valueIndex];//Add that value to the return string
          }else{
              returnString+=citationFormat[i];
          }
          i+=1; //Move to next character
      }
	  return returnString;
  }
}

function constructCitationFromObj(obj){//Converts object to web citation
    return new WebCitation(obj.authorLast,obj.authorFirst,obj.pageTitle,obj.siteTitle,obj.datePublished,obj.dateAccessed,obj.url);
}

function updateCitationList() {
    var data = {data: citations} //Wrap citations in object
    var serialized = jQuery.param(data);//Serialize...
    //Cookies.set("cites", serialized);//Add to cookies
    let newCitationListHTML = ""
    citations.forEach(element => {
        newCitationListHTML += `<li> ${element.citationHTML} </li>
`
    })
    $("#citationList").html(newCitationListHTML)

}

function resetCitationList() {
    $("#citationList").html('Looks like you don\'t have any citations made yet!')
    citations = []
}


function getMLADate(year, month, day) {
    let date = new Date(year, month - 1, day)
    return date.toLocaleDateString(
        "en-GB",
        dateFormat = {day: "numeric", month: "long", year: "numeric"}
    )
}

function loadCitationParamString(data){//Loads citation from jQuery.param function
    var data = deparam(data)["data"];//Reverse the serialization, returns an array of objects
    for(var i in data){//Convert each object to webcitation, push into citation
        citations.push(constructCitationFromObj(data[i]));
    }

    updateCitationList();//Update citation list to display loaded citations
}
//Load citations from cookies (if cookies exist)
if(Cookies.get("cites") != undefined){
    loadCitationParamString(Cookies.get("cites"));
}

//Function that changes the type of citation
function setCitationType(i){
    citationIndex = i;
    //Disable all form elements
    $(".form-control").prop('disabled',true)

    //Enable elements inside specified citaiton type
    $.each(citationFormats[i].enabledElements, function(index, id){
        $("#"+id).prop('disabled', false);
    });
    $.each(citationFormats[i].allowedElements, function(index, id){
        $("#"+id).prop('disabled', false);
    });
}

//Populate dropdown with citation types
(function($) {
    $(function() {
        // We'll build the html for our <li> items
        var html = '';
        // Build the html:
        $.each(citationFormats, function(index, item) {
            if(item.name) {
                //Adds button that triggers function to change citation type, style to make button invisible
                html += '<li><button onclick="setCitationType('+index+')" id="dropDownButton">';
                html += item.name;
            }
            html += '</button></li>';
        });

        // Get the <ul> tag reference: (this is just one way; you could also add an "id" attribute to the <ul> directly and use that)
        var dropdown = $(".dropdown-menu");
        // replace it's internal html:
        dropdown.html(html);
    });
})(jQuery);

$(  // only start when DOM ready

    $("#submitButton").on("click", event => {
        event.preventDefault()
        // Handle dates
        let datePublished = getMLADate(
            htmlEscape($("#datePublishedYear").val()),
            htmlEscape($("#datePublishedMonth").val()) -1,
            htmlEscape($("#datePublishedDay").val())
        )
        let dateAccessed = getMLADate(
            htmlEscape($("#dateAccessedYear").val()),
            htmlEscape($("#dateAccessedMonth").val()) - 1,
            htmlEscape($("#dateAccessedDay").val())
        )

        //Set hiddden forms
        document.getElementById("MLAAccessDate").value = dateAccessed;
        document.getElementById("MLAPublishDate").value = datePublished;

        citations.push(new WebCitation(citationIndex));

        updateCitationList()
    })
)
