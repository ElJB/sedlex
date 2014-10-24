var iconv = new require('iconv').Iconv('latin1', 'utf8'),
	iconv2 = new require('iconv').Iconv('utf8', 'latin1');

console.log(iconv.convert("éài").toString());
