let citations = []

function htmlEscape(str) {
    return str 
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}


class WebCitation {
	constructor(
		authorLast,
		authorFirst,
		pageTitle,
		siteTitle,
		datePublished,
		dateAccessed,
		url,
		publisher=undefined
	){
		this.authorLast = authorLast
		this.authorFirst = authorFirst
		this.pageTitle = pageTitle
		this.siteTitle = siteTitle
		this.publisher = publisher
		this.datePublished = datePublished
		this.dateAccessed = dateAccessed
		this.url = url
  }

  get citationText() {
	  return `${this.authorLast}, ${this.authorFirst}. "${this.pageTitle}." \
${this.siteTitle}, ${this.publisher ? this.publisher + ', ' : ''}\
${this.datePublished}, ${this.dateAccessed}, ${this.url}`
  }
  get citationHTML(){
	  return `${this.authorLast}, ${this.authorFirst}. "${this.pageTitle}." \
<i>${this.siteTitle}</i>, ${this.publisher ? this.publisher + ', ' : ''}\
${this.datePublished}, ${this.dateAccessed}, <a href="http://${this.url}">${this.url}</a>`
  }
}


function updateCitationList() {
    let newCitationListHTML = ""
    citations.forEach(element => {
        newCitationListHTML += `<li> ${element.citationHTML} </li>
`
    })
    $("#citationList").html(newCitationListHTML)
}

function resetCitationList() {
    $("#citationList").html('Looks like you don\'t have any citations made yet!')
    citations = ""
}


function getMLADate(year, month, day) {
    let date = new Date(year, month - 1, day)
    return date.toLocaleDateString(
        "en-GB", 
        dateFormat = {day: "numeric", month: "long", year: "numeric"}
    )
}


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
    citations.push(new WebCitation(
        htmlEscape($("#authorLast").val()),
        htmlEscape($("#authorFirst").val()),
        htmlEscape($("#pageTitle").val()),
        htmlEscape($("#siteTitle").val()),
        datePublished,
        dateAccessed,
        htmlEscape($("#manualCiteURL").val())
    ))
    
    updateCitationList()
})
