const request = require('request');

// todo remove old underscore usage

exports.getCreators = function(count, callback) {
  const reqPath = 'https://archive.org/advancedsearch.php?q=mediatype:etree&fl[]=creator&sort[]=downloads+desc&rows=' + count + '&output=json'
  request(reqPath, function (err, response, body) {
    const resJson = JSON.parse(response.body)
    var rawCreators = resJson.response.docs
    callback(rawCreators)
  })
}

exports.fetchAllArtists = function fetchAllArtists() {
  getCreators(500, function(c) {
    const creators = _.chain(c)
      .map(function(creator){return creator['creator']})
      .uniq()
      .value()
  })
}

exports.fetchArtist = function fetchArtist(artist) {
  const creator = artist;

  // testId for testing routes
  const testId = 'gd87-04-03.sennme80.clark-miller.24898.sbeok.shnf';

  getMetaForIdentifier(testId, function (metadata) {
    const m = metadata['metadata']
    console.log('returned metadata')
    console.log(m['identifier'][0])
    console.log(m['title'][0])
    console.log(m['creator'][0])
    console.log(m['year'][0])
    console.log(m['date'][0])
    console.log(m['venue'][0])
    console.log(m['coverage'][0])
    console.log(m['collection'][0])
    console.log(m['has_mp3'][0])
  })

  // get files and isolate mp3s
  getFilesForIdentifier(testId, function (files) {
    const mp3s = selectMp3sFromFiles(files)
  })
}

// get specific number of creators
// todo add paging
function getCreators(count, callback) {
  const reqPath = 'https://archive.org/advancedsearch.php?q=mediatype:etree&fl[]=creator&sort[]=downloads+desc&rows=' + count + '&output=json'
  request(reqPath, function (err, response, body) {
    const resJson = JSON.parse(response.body)
    var rawCreators = resJson.response.docs
    callback(rawCreators)
  })
}

// get total number of identifiers before future queries
// for  paging or throttling purposes (e.g. grateful dead has 11k+)
function getIdentifierCountForCreator(creator, callback) {
  var reqPath = 'https://archive.org/advancedsearch.php?q=creator:' + creator + '&fl%5b%5D=numCount&output=json';
  request(reqPath, function (err, response, body) {
    var resJson = JSON.parse(response.body);
    var numFound = resJson.response.numFound;
    callback(numFound);
  });
}

// get an amount of identifiers for creator
// useful for general metadata searches
function getIdentifiersForCreator(creator, count, callback) {
  // TODO need to page this, &page=' + page + ', or insert count for big list
  var reqPath = 'https://archive.org/advancedsearch.php?q=creator:' + creator + '&fl%5b%5D=identifier&rows=' + count + '&output=json';
  request(reqPath, function (err, response, body) {
    var resJson = JSON.parse(response.body);
    var rawIdentifiers = resJson.response.docs;
    var identifiers = [];
    rawIdentifiers.forEach(function (r) {
      identifiers.push(r.identifier);
    });
    callback(identifiers);
  });
}

// get an amount of identifiers for creator where mp3s exist
// useful for generating a playable list or list of mp3 links
function getIdentifiersWithMp3ForCreator(creator, count, callback) {
  // TODO need to page this, &page=' + page + ', or insert count for big list
  var reqPath = 'https://archive.org/advancedsearch.php?q=creator:' + creator + '&has_mp3%281%29&fl%5b%5D=identifier&rows=' + 100 + '&output=json';
  request(reqPath, function (err, response, body) {
    var resJson = JSON.parse(response.body);
    var rawIdentifiers = resJson.response.docs;
    var identifiers = [];
    rawIdentifiers.forEach(function (r) {
      identifiers.push(r.identifier);
    });
    callback(identifiers);
  });
}

function getMetaForIdentifier(identifier, callback) {
  var reqPath = 'https://archive.org/download/' + identifier + '/' + identifier + '_meta.xml';
  request(reqPath, function (err, response, body) {
    var xml = response.body;
    parseXmlString(xml, function (err, result) {
      callback(result);
    });
  });
}

function getFilesForIdentifier(identifier, callback) {
  var reqPath = 'https://archive.org/download/' + identifier + '/' + identifier + '_files.xml';
  // console.log(reqPath);
  request(reqPath, function (err, response, body) {
    var xml = response.body;
    parseXmlString(xml, function (err, result) {
      callback(result);
    });
  });
}

function selectMp3sFromFiles(files) {
  let mp3s = []
  // each object & property is enclosed in array...
  // drill through to get actual file
  _.each(files, function (f1, i) {
    _.each(f1, function (f2, x) {
      _.each(f2, function (song, z) {
        const format = song['format']
        if (format[0] === 'VBR MP3') {
          mp3s.push(song)
        }
      })
    })
  })
  return mp3s
}

// not a useful route... consider removing
function getDataForIdentifier(identifier, callback) {
  var reqPath = 'https://archive.org/advancedsearch.php?q=identifier:' + identifier + '&output=json';
  request(reqPath, function (err, response, body) {
    var resJson = JSON.parse(response.body)
    callback(resJson)
  });
}