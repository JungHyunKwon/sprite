/**
 * @name sprite
 * @author JungHyunKwon
 * @since 2018-06-05
 */

'use strict';

const fs = require('fs'),
	  spriteSmith = require('spritesmith'), // {@link https://github.com/twolfson/spritesmith}
	  baseDirectory = './images/sprite',
	  imageExtensions = ['ase', 'art', 'bmp', 'blp', 'cd5', 'cit', 'cpt', 'cr2', 'cut', 'dds', 'dib', 'djvu', 'egt', 'exif', 'gif', 'gpl', 'grf', 'icns', 'ico', 'iff', 'jng', 'jpeg', 'jpg', 'jfif', 'jp2', 'jps', 'lbm', 'max', 'miff', 'mng', 'msp', 'nitf', 'ota', 'pbm', 'pc1', 'pc2', 'pc3', 'pcf', 'pcx', 'pdn', 'pgm', 'PI1', 'PI2', 'PI3', 'pict', 'pct', 'pnm', 'pns', 'ppm', 'psb', 'psd', 'pdd', 'psp', 'px', 'pxm', 'pxr', 'qfx', 'raw', 'rle', 'sct', 'sgi', 'rgb', 'int', 'bw', 'tga', 'tiff', 'tif', 'vtf', 'xbm', 'xcf', 'xpm', '3dv', 'amf', 'ai', 'awg', 'cgm', 'cdr', 'cmx', 'dxf', 'e2d', 'egt', 'eps', 'fs', 'gbr', 'odg', 'svg', 'stl', 'vrml', 'x3d', 'sxd', 'v2d', 'vnd', 'wmf', 'emf', 'art', 'xar', 'png', 'webp', 'jxr', 'hdp', 'wdp', 'cur', 'ecw', 'iff', 'lbm', 'liff', 'nrrd', 'pam', 'pcx', 'pgf', 'sgi', 'rgb', 'rgba', 'bw', 'int', 'inta', 'sid', 'ras', 'sun', 'tga'];

/**
 * @name 숫자 비교
 * @param {array} value
 * @return {array}
 * @since 2018-07-13
 */
Array.prototype.compareNumbers = function() {
	let array = this,
		arrayLength = array.length;

	return this.sort(function(a, b) {
		a = a.split('/');
		a = parseInt(a[a.length - 1].split('.')[0], 10) || arrayLength;

		b = b.split('/');
		b = parseInt(b[b.length - 1].split('.')[0], 10) || arrayLength;

		return a - b;
	});
};

/**
 * @name 정수 확인
 * @since 2017-12-06
 * @param {*} value
 * @return {boolean}
 */
function isInt(value) {
	return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * @name 소수점 절사
 * @param {number} value
 * @param {number} decimal
 * @return {number}
 * @since 2018-07-13
 */
function toFixed(value, decimal) {
	var result = NaN;
	
	//값이 정수일 때
	if(isInt(value)) {
		result = value;
		
		//소수가 정수일 때
		if(isInt(decimal)) {
			var splitValue = value.toString().split('.'),
				splitValue1 = splitValue[1];
			
			//소수점이 있을 때
			if(splitValue1) {
				splitValue[1] = splitValue1.substring(0, decimal);
				result = parseFloat(splitValue.join('.'), 10);
			}
		}
	}

	return result;
}

/**
 * @name 스프라이트 계산
 * @since 2018-09-05
 * @param {number} size
 * @param {number} from
 * @param {number} to
 * @param {number} position
 * @return {object}
 */
function calcSprite(size, from, to, position) {
	var result = {
		pixel : {
			size : 0,
			position : 0
		},
		percent : {
			size : 0,
			position : 0
		}
	};

	//좌표가 정수이면서 나미저 변수들이 정수이면서 0 초과일 때
	if(isInt(size) && size > 0 && isInt(from) && from > 0 && isInt(to) && to > 0 && isInt(position)) {
		var ratio = from / to,
			pixel = result.pixel,
			pixelSize = size / ratio,
			pixelPosition = position / ratio,
			percent = result.percent;

		pixel.size = Math.round(pixelSize);
		percent.size = toFixed(pixelSize / to * 100, 2);
		pixel.position = Math.round(pixelPosition);
		percent.position = toFixed(Math.abs(pixelPosition / (pixelSize - to) * 100), 2);
	}

	return result;
}

let spriteDirectory = [];

// ./images/sprite 폴더 조회
try {
	spriteDirectory = fs.readdirSync(baseDirectory);
}catch(e) {
	console.error(baseDirectory + '가 있는지 확인해주세요.');
}

let spriteDirectoryLength = spriteDirectory.length;

(function loopSpriteDirectory(index) {
	//조회된 파일, 폴더 수만큼 반복
	if(spriteDirectoryLength > index) {
		//폴더 이름
		let directory = spriteDirectory[index],
			directoryName = directory,
			isError = false,
			nextIndex = index + 1;
		
		//기본 디렉토리와 폴더명과 합성(./images/sprite/#)
		directory = baseDirectory + '/' + directoryName;
		
		//폴더일 때
		if(fs.statSync(directory).isDirectory()) {
			//조회(./images/sprite/#/#.#)
			let files = fs.readdirSync(directory),
				filenames = [];
			
			//조회된 파일, 폴더 수 만큼 반복
			files.forEach((value, idx, array) => {
				let splitValue = value.split('.');

				//폴더경로와 파일명 합성(./images/sprite/#.#)
				value = directory + '/' + value;
				
				//이미지 파일의 확장자를 가진 파일일 때 파일경로, 파일명 입력
				if(fs.statSync(value).isFile() && imageExtensions.indexOf(splitValue[1])) {
					files[idx] = value;
					filenames.push(splitValue[0]);

				//아니면 배열 files에서 제거
				}else{
					files.splice(idx, 1);
				}
			});
			
			//이미지 파일이 있을 때
			if(files.length) {
				//숫자 순으로 정렬
				files = files.compareNumbers();
				filenames = filenames.compareNumbers();

				spriteSmith.run({
					src : files,
					padding : 10,
					algorithm: 'top-down',
					algorithmOpts : {
					  sort : false
					}
				}, (error, result) => {
					//오류가 있을 때
					if(error) {
						console.error(error);
					}else{
						let coordinates = result.coordinates,
							properties = result.properties,
							spriteWidth = properties.width,
							spriteHeight = properties.height,
							distDirectory = directory + '/' + 'dist', //폴더 경로와 dist 폴더명 합성(./images/sprite/#/dist)
							spriteName = directoryName + '_sprite',
							saveDirectory = distDirectory + '/' + spriteName,
							hasDistDirectory = false,
							pixelCode = '@charset \'utf-8\';\n',
							percentCode = '\n\n/* 가변 크기 */',
							counter = 0;
						
						try {
							//변수 distFolder가 폴더일 때
							if(fs.statSync(distDirectory).isDirectory()) {
								hasDistDirectory = true;
							}
						
						//변수 distFolder에 dist 폴더가 없으면 오류 발생
						}catch(e) {
							//console.error(directory + '에 dist 폴더가 없습니다.');
						}
						
						//dist 폴더가 없을 때 폴더 생성
						if(!hasDistDirectory) {
							fs.mkdirSync(distDirectory);
							//console.log(distDirectory + '에 폴더를 생성하였습니다.');
						}
						
						//png 파일 생성(./images/#/dist/)
						fs.writeFileSync(saveDirectory + '.png', result.image);

						for(let i in coordinates) {
							let coordinatesI = coordinates[i],
								width = coordinatesI.width,
								height = coordinatesI.height,
								x = coordinatesI.x,
								y = coordinatesI.y,
								horizontalPercent = calcSprite(spriteWidth, width, width, x).percent,
								horizontalPercentPosition = horizontalPercent.position,
								horizontalPercentSize = horizontalPercent.size,
								verticalPercent = calcSprite(spriteHeight, height, height, y).percent,
								verticalPercentPosition = verticalPercent.position,
								verticalPercentSize = verticalPercent.size,
								filename = filenames[counter];
							
							//x 좌표값이 있을때
							if(x) {
								x = '-' + x + 'px';
							}else{
								x = 'left';
							}
							
							//y 좌표값이 있을때
							if(y) {
								y = '-' + y + 'px';
							}else{
								y = 'top';
							}
							
							let position = x + ' ' + y;

							//넓이값이 있을때
							if(width) {
								width += 'px';
							}
							
							//높이값이 있을때
							if(height) {
								height += 'px';
							}

							pixelCode += '\n.' + filename + ' {width:' + width + '; height:' + height + '; background:url(\'' + (spriteName + '.png') + '\') no-repeat ' + position + ';}';
							
							//x 좌표값이 있을때
							if(horizontalPercentPosition) {
								horizontalPercentPosition = horizontalPercentPosition + '%';
							}else{
								horizontalPercentPosition = 'left';
							}
						
							//y 좌표값이 있을때
							if(verticalPercentPosition) {
								verticalPercentPosition = verticalPercentPosition + '%';
							}else{
								verticalPercentPosition = 'top';
							}

							let percentPosition = horizontalPercentPosition + ' ' + verticalPercentPosition;

							//원본 위치와 퍼센트 위치와 같을 때
							if(position === percentPosition) {
								percentPosition = '';
							}else{
								percentPosition = 'background-position:' + percentPosition + '; ';
							}

							//가로 크기가 있을 때
							if(horizontalPercentSize) {
								horizontalPercentSize = horizontalPercentSize + '%';
							}
							
							//세로 크기가 있을 때
							if(verticalPercentSize) {
								verticalPercentSize = verticalPercentSize + '%';
							}
							
							let percentSize = horizontalPercentSize + ' ' + verticalPercentSize;

							percentCode += '\n.' + filename + ' {' + percentPosition + 'background-size:' + percentSize + ';}';

							counter++;
						}

						//css 파일 생성(./images/#/dist/)
						fs.writeFileSync(saveDirectory + '.css', pixelCode + percentCode);

						console.log(distDirectory + '에 생성하였습니다.');
					}

					//다음 반복 실행
					loopSpriteDirectory(nextIndex);
				});
			}else{
				console.error(directory + '에 이미지 파일이 없습니다.');
				isError = true;
			}
		}else{
			console.error(directory + '가 폴더가 아닙니다.');
			isError = true;
		}
		
		//오류가 있을 때
		if(isError) {
			//다음 반복 실행
			loopSpriteDirectory(nextIndex);
		}
	}
})(0);