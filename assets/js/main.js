/*jslint
    es6
*/
const readline = require('readline-sync')
const moment = require('moment')

let citations = []
let userExit = false


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

while (true) {
	if (citations.length === 1) {
		console.log("Your citation so far is:")
		console.log(`	- ${citations[0].citationText}`)
	} else if (citations.length === 0) {
		console.log("You don't have any citations right now. Create one!")
	} else {
		console.log("Your citations so far are:")
		citations.forEach(function(citation) {
			console.log(`	- ${citation.citationText}`)
		})
	}
	userExit = !readline.keyInYN('Create a new citation?')
	if (userExit) {break}  // We do this instead of while(!userExit) to allow people to check citations without creating one

	// now we create a new citation
	citations.push(new WebCitation(
		readline.question("Author last (family) name > "),
		readline.question("Author first (given) name > "),
		readline.question("Page title > "),
		readline.question("Website title >"),
		moment.months(readline.keyInSelect(moment.months(), "Month published", cancel=false)) + " " + readline.question("Day of month published >") + " " + readline.question("Year published >"),
		moment.months(readline.keyInSelect(moment.months(), "Month accessed", cancel=false)) + " " + readline.question("Day of month accessed >") + " " + readline.question("Year accessed >"),
		readline.question("Page URL >"),
		publisher = readline.question("Publisher (leave blank if same as website title) >")
	))
}
