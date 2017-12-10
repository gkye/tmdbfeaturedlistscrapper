const express = require('express')
const app = express()
var port = process.env.PORT || 6666;

const apicache = require('apicache')
const redis = require('redis')

const rp = require('request-promise');
const cheerio = require('cheerio');
const options = {
uri: 'https://www.themoviedb.org',
transform: function (body) {
    return cheerio.load(body);
}
};

let cache = apicache.middleware

app.get('/', cache('3000 minutes'), (req, res) => {
    scrapeData(res)
})

function scrapeData(response){
    rp(options)
    .then(($) => {
        var body = $
        var section = $('body').find('#main').find('.sub_media')
        var lists = section.find('.lists').find('ul').find('li')
        // // Payload sent back
        var featuredList = []
        lists.each(function(i, elem) {
           var listId = parsePathForId("/", $(this).find('a').attr('href'))
            var image = parsePathForId("/", $(this).find('a').find('img').attr('data-src'))
            var title = $(this).find('h3').find('a').text()
            var subtitle = $(this).find('p').text()
            // Create json
            var list = {
            id: listId,
            imagePath: image,
            listTitle: title,
            overview: subtitle
            };
            featuredList.push(list)
        });
        response.json(featuredList)
    })
    .catch((err) => {
        response.status(500).send('Unable to parse results')
    });
}


function parsePathForId(substring,string){
    var substringIndexes=[],i=-1;
    while((i=string.indexOf(substring,i+1)) >= 0) substringIndexes.push(i);
    var lastSubstringIndex = substringIndexes[substringIndexes.length - 1] + 1
    let parsedId = string.substr(lastSubstringIndex, string.length);
    return parsedId
}

app.listen(port, function () {
    console.log("Listening on port... " + port)
})

