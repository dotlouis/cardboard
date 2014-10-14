cardboard.filter('truncate', function () {
	return function (text, length, end) {
		if (isNaN(length))
			length = 40;
		
		if (end === undefined)
			end = "...";
		
		if (text.length <= length || text.length - end.length <= length) {
			return text;
		}
		else {
			return String(text).substring(0, length-end.length) + end;
		}
		
	};
});

cardboard.filter('fromNow', function() {
	return function(dateString) {
		return moment(new Date(dateString)).fromNow();
	};
});

cardboard.filter('bytes', function() {
	return function(bytes, precision) {
		if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
		if (typeof precision === 'undefined') precision = 1;
		var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
			number = Math.floor(Math.log(bytes) / Math.log(1024));
		return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
	}
});

cardboard.filter('filename', function() {
	return function(filename) {
		return filename.replace(/^.*[\\\/]/, '');
	}
});


cardboard.filter('host', function () {
  return function ( input ) {
    var matches,
        output = "",
        urls = /\w+:\/\/([\w|\.]+)/;

    matches = urls.exec( input );

    if ( matches !== null ) output = matches[1];

    return output;
  };
});