document.ondragover = function (event) {
	event.preventDefault();
};
document.ondrop = function (event) {
	event.preventDefault();
};
function dragover(event) {
	event.preventDefault();
}
function drop(event) {
	event.path[1].getElementsByTagName('input')[0].files = event.dataTransfer.files;
}
function loadMap(node, file) {
	var reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function () {
		var result = JSON.parse(this.result);
		result = result.events;
		var tArray = [], tmpTxt = '';
		result.forEach(function (events) {
			if (events!=null) {
				events.pages.forEach(function (pages) {
					pages.list.forEach(function (list) {
						if (list.code == 401 || list.code == 402 || list.code == 405) {
							tmpTxt += list.parameters[0]+'\n';
						}
						else if (list.code == 102) {
							for (var i=0;i<list.parameters[0].length;i++) {
								tmpTxt = list.parameters[0][i];
								if (tmpTxt.trim() != "") {
									tArray.push(tmpTxt.trim());
								}
							}
							tmpTxt = '';
						}
						else {
							if (tmpTxt.trim() != "") {
								tArray.push(tmpTxt.trim());
							}
							tmpTxt = '';
						}
					})
				});
			}
		});
		result = JSON.stringify(tArray);
		node.parentNode.getElementsByClassName('result')[0].innerHTML = result;
		node.parentNode.getElementsByTagName('textarea')[0].value = tArray[0];
	}
	bclear();
}
function loadCSV(node) {
	var reader = new FileReader();
	reader.readAsText(node.files[0]);
	reader.onload = function () {
		node.parentNode.getElementsByClassName('result')[0].innerHTML = JSON.stringify($.csv.toArrays(this.result));
	}
}
function left() {
	if ($('#lresult').html()=="") {
		alert('Specified file not loaded.');
	}
	else {
		var ldata = JSON.parse($('#lresult').html());
		var lcurrent = parseInt($('#lcurrent').val())+1;
		var lcount = ldata.length;
		if (lcurrent+1>lcount) {
			alert("Left Complete!");
		}
		$('#ltext').val(ldata[lcurrent]);
		$('#lcurrent').val(lcurrent);
	}
}
function right() {
	if ($('#rresult').html()=="") {
		alert('Right file not loaded.');
	}
	else {
		var rdata = JSON.parse($('#rresult').html());
		var rcurrent = parseInt($('#rcurrent').val())+1;
		var rcount = rdata.length;
		if (rcurrent+1>rcount) {
			alert("Right Complete!");
		}
		$('#rtext').val(rdata[rcurrent]);
		if (rdata[rcurrent]==$('#ltext').val()) {
			t2en($('#rtext'), rdata[rcurrent]);
		}
		$('#rcurrent').val(rcurrent);
	}
}
function next() {
	left();
	right();
	search();
}
function search() {
	if ($('#csvresult').html()=="") {
		alert('CSV file not loaded.');
	}
	else {
		var csvdata = JSON.parse($('#csvresult').html());
		for (var i=0;i<csvdata.length;i++) {
			if ($('#ltext').val().replace(/\n/g, '\r\n') == csvdata[i][1]) {
				$('#csvtext').val(JSON.stringify(csvdata[i]));
				if (csvdata[i][3]==$('#rtext').val().replace(/\n/g, '\r\n')) {
					$('#csvtext').css("background-color", "rgba(177,255,0,0.15)");
				}
				else {
					$('#csvtext').css("background-color", "rgba(102,204,255,0.15)");
				}
				$('#csvcurrent').html(i);
				break;
			}
			$('#csvtext').val('Nothing found! Try search manually.');
			$('#csvcurrent').html('-1');
		}
	}
}
function apply() {
	var csvdata = JSON.parse($('#csvresult').html());
	var csvcurrent = parseInt($('#csvcurrent').html());
	if (csvcurrent>0) {
		csvdata[csvcurrent][3] = $('#rtext').val().replace(/\n/g, '\r\n');
		$('#csvresult').html(JSON.stringify(csvdata));
	}
	next();
}
function save() {
	var csvdata = JSON.parse($('#csvresult').html());
	var csvresult = $.csv.fromArrays(csvdata);
	var a = document.getElementById('csvsave');
	a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csvresult);
	a.click();
}
function aclear() {
	$('#lcurrent').val('-1');
	$('#rcurrent').val('-1');
	$('#csvcurrent').html('0');
	$('#ltext').val('');
	$('#rtext').val('');
	$('#csvtext').val('');
	next();
}
function bclear() {
	$('#lcurrent').val('0');
	$('#rcurrent').val('0');
	$('#csvcurrent').html('0');
}
function align() {
	$('#rcurrent').val(parseInt($('#lcurrent').val())-1);
	right();
}
function fanyi() {
	t2en($('#rtext'), $('#ltext').val());
}
function showfn(cnode, tnode) {
	tnode.innerHTML = cnode.files[0].name;
}
function checkcsv() {
	if ($('#csvjson').html()=="") {
		alert('CSV file not loaded.');
	}
	else {
		var csvdata = JSON.parse($('#csvjson').html());
		var currentcsv = parseInt($('#currentcsv').val());
		for (var i=currentcsv+1;i<csvdata.length;i++) {
			if (csvdata[i][3]=="") {
				$('#display').val(JSON.stringify(csvdata[i]));
				$('#currentcsv').val(i);
				break;
			}
		}
	}
}
function modify() {
	var csvdata = JSON.parse($('#csvjson').html());
	var currentcsv = parseInt($('#currentcsv').val());
	csvdata[currentcsv][3] = $('#ncontent').val().replace(/\n/g, '\r\n');
	$('#csvjson').html(JSON.stringify(csvdata));
	$('#display').val('Modify Success!');
}

function autoformat() {
	var csvdata = JSON.parse($('#csvjson').html());
	for (var i in csvdata) {
		var data = csvdata[i][3];
		data = data.split('\r\n');
		for (var line=0;line<data.length;line++) {
			if (data[line].replace(/\\[Nn]\[\d+?\]/, '123456789012345').replace(/\\[Cc]\[\d+?\]/, '').length>55) {
				var newTxt = "";
				var rlength = 0;
				var start = 0;
				for (var j=0;j<data[line].length;j++) {
					rlength += 1;
					if (data[line][j] == "\\") {
						var endChar = ["g", "{", "}", "$", ".", "|", "!", ">", "<", "^", "]"];
						if (data[line][j+1]=="n" || data[line][j+1]=="N") {
							rlength += 15;
						}
						if (data[line][j+1]=="c" || data[line][j+1]=="C") {
							rlength -= 1;
						}
						for (var k=j+1;k<data[line].length;k++) {
							if (endChar.indexOf(data[line][k])>0) {
								j=k;
								break;
							}
						}
					}
					if (rlength > 53) {
						newTxt += data[line].substring(start, j) + "\r\n";
						start = j;
						rlength = 0;
					}
				}
				newTxt += data[line].substring(start, data[line].length);
				data[line]=newTxt;
			}
		}
		csvdata[i][3] = data.join("\r\n");
		$('#csvjson').html(JSON.stringify(csvdata));
	}
}
function savecsv() {
	var csvdata = JSON.parse($('#csvjson').html());
	var csvresult = $.csv.fromArrays(csvdata);
	var a = document.getElementById('csvsave');
	a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csvresult);
	a.click();
}
function proccess() {
	var csvdata = JSON.parse($('#csvjson').html());
	var currentcsv = parseInt($('#currentcsv').val());
	var count = 0;
	for (var i=currentcsv+1;i<csvdata.length;i++) {
		if (csvdata[i][3]=="") {
			count++;
			//count+=csvdata[i][1].trim().length;
		}
	}
	var now = csvdata.length-count;
	var total = csvdata.length;
	$('#proccess').html(now+' / '+total+'&nbsp;&nbsp;'+(now/total*100).toFixed(2)+'%');
	//$('#proccess').html(count);
}
function bdtrans(DOM, query, to) {
	var appid = '20151111000005069';
	var key = 'uGCJfrRtlJvRCDMA56W3';
	var salt = (new Date).getTime();
	var from = 'auto';
	var str1 = appid + query + salt +key;
	var sign = MD5(str1);
	$.ajax({
		url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
		type: 'get',
		dataType: 'jsonp',
		data: {
			q: query,
			appid: appid,
			salt: salt,
			from: from,
			to: to,
			sign: sign
		},
		success: function (data) {
			if (!data.error_code) {
				var result = '';
				for (var i=0;i<data.trans_result.length;i++) {
					result += data.trans_result[i].dst+'\n';
				}
				DOM.val(result.trim());
			}
		}
	});
}
function gtrans(DOM, query, to) {
	var url = "https://translate.googleapis.com/translate_a/single";
	$.ajax({
		url: url,
		type: 'post',
		dataType: 'json',
		data: {
			client: 'gtx',
			sl: 'auto',
			tl: to,
			dt: 't',
			q: query
		},
		success: function(data) {
			var result = '';
			for (var i=0;i<data[0].length;i++) {
				result+=data[0][i][0];
			}
			DOM.val(result);
		}
	});
}
function t2en(DOM, query) {
	return gtrans(DOM, query, 'en');
}
function t2cn(DOM, query) {
	return gtrans(DOM, query, 'zh');
}
function loadAllMap(node, file) {
	$('#mapfn').html(file.name);
	var reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function () {
		var result = JSON.parse(this.result);
		result = result.events;
		var tArray = [], tmpTxt = '';
		result.forEach(function (events) {
			if (events!=null) {
				events.pages.forEach(function (pages) {
					pages.list.forEach(function (list) {
						if (list.code == 401 || list.code == 402 || list.code == 405) {
							tmpTxt += list.parameters[0]+'\n';
						}
						else if (list.code == 102) {
							for (var i=0;i<list.parameters[0].length;i++) {
								tmpTxt = list.parameters[0][i];
								if (tmpTxt.trim() != "") {
									tArray.push(tmpTxt.trim());
								}
							}
							tmpTxt = '';
						}
						else {
							if (tmpTxt.trim() != "") {
								tArray.push(tmpTxt.trim());
							}
							tmpTxt = '';
						}
					})
				});
			}
		});
		result = JSON.stringify(tArray);
		node.parentNode.getElementsByClassName('result')[0].innerHTML = result;
		$('#mapresult').html($('#mapjson').html());
	}
}
function reSearch(input) {
	var csvdata = JSON.parse($('#mmapcsvjson').html());
	for (var i=0;i<csvdata.length;i++) {
		if (input.replace(/\n/g, '\r\n') == csvdata[i][1]) {
			return csvdata[i][0];
		}
	}
}
function mapModifyLoad(node, file) {
	$('#mmap').html(file.name);
	var reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function () {
		var result = JSON.parse(this.result);
		result = result.events;
		var tArray = [];
		var tParam = [];
		var stTxt = '{"code":356,"indent":0,"parameters":["';
		var edTxt = '"]},';
		var tmpTxt = '';
		result.forEach(function (events) {
			if (events!=null) {
				events.pages.forEach(function (pages) {
					pages.list.forEach(function (list) {
						if (list.code == 101) {
							if (list.parameters[0]!="") {
								tArray.push(stTxt+"Face "+list.parameters[0]+" "+list.parameters[1]+edTxt);
							}
							tParam.push(list.code);
							tParam.push(list.parameters[3]);
							tParam.push(list.parameters[2]);
							if (tmpTxt != "") {
								console.log(tmpTxt.trim());
								var ctlCode = '';
								if (tParam[0] == 101) {
									ctlCode = 'Say';
								}
								else if (tParam[0] == 105) {
									ctlCode = 'Scroll';
								}
								if (ctlCode) {
									if (tParam[1]==2&&tParam[2]==0) {
										tArray.push(stTxt+ctlCode+" "+reSearch(tmpTxt.trim())+edTxt);
									}
									else {
										tArray.push(stTxt+ctlCode+" "+reSearch(tmpTxt.trim())+" "+tParam[1]+" "+tParam[2]+edTxt);
									}
								}
								tmpTxt = '';
							}
						}
						else if (list.code == 105) {
							tParam.push(list.code);
							tParam.push(list.parameters[0]);
							if (list.parameters[1]==true) {
								tParam.push(1);
							}
							else {
								tParam.push(0);
							}
							if (tmpTxt != "") {
								console.log(tmpTxt.trim());
								var ctlCode = '';
								if (tParam[0] == 101) {
									ctlCode = 'Say';
								}
								else if (tParam[0] == 105) {
									ctlCode = 'Scroll';
								}
								if (ctlCode) {
									if (tParam[1]==2&&tParam[2]==0) {
										tArray.push(stTxt+ctlCode+" "+reSearch(tmpTxt.trim())+edTxt);
									}
									else {
										tArray.push(stTxt+ctlCode+" "+reSearch(tmpTxt.trim())+" "+tParam[1]+" "+tParam[2]+edTxt);
									}
								}
							}
						}
						else if (list.code == 401 || list.code == 402 || list.code == 405) {
							tmpTxt += list.parameters[0]+'\n';
						}
						else {
							if (tmpTxt.trim() != "") {
								console.log(tmpTxt.trim());
								var ctlCode = '';
								if (tParam[0] == 101) {
									ctlCode = 'Say';
								}
								else if (tParam[0] == 105) {
									ctlCode = 'Scroll';
								}
								if (ctlCode) {
									if (tParam[1]==2&&tParam[2]==0) {
										tArray.push(stTxt+ctlCode+" "+reSearch(tmpTxt.trim())+edTxt);
									}
									else {
										tArray.push(stTxt+ctlCode+" "+reSearch(tmpTxt.trim())+" "+tParam[1]+" "+tParam[2]+edTxt);
									}
								}
							}
							tmpTxt = '';
							tParam = [];
						}
					});
				});
			}
		});
		for (var j=0;j<tArray.length;j++) {
			$('#mmapresult').val($('#mmapresult').val()+tArray[j]+'\n');
		}
	}
}