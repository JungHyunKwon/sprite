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
	return this.sort(function(a, b) {
		a = a.split('/');
		a = a[a.length - 1].split('.')[0];

		b = b.split('/');
		b = b[b.length - 1].split('.')[0];

		return a - b;
	});
};

/**
 * @name 소수점 절사
 * @param {array} value
 * @return {array}
 * @since 2018-07-13
 */
Number.prototype.toFixed = function(decimal) {
	let splitString = this.toString().split('.');
	
	//소수점이 있을 때
	if(splitString[1]) {
		splitString[1] = splitString[1].substring(0, decimal);
	}

	return splitString.join('.');
};

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
	let result = {
		pixel : {
			size : 0,
			position : 0
		},
		percent : {
			size : 0,
			position : 0
		}
	};
	
	//숫자형 변환
	from = parseFloat(from, 10);
	to = parseFloat(to, 10);
	
	//0초과일 때
	if(from > 0 && to > 0) {
		let ratio = from / to;
		
		size = parseFloat(size, 10);

		//0초과일 때
		if(size > 0) {
			result.pixel.size = size / ratio;
			result.percent.size = result.pixel.size / to * 100;
		}

		position = parseFloat(position, 10);

		//NaN이 아니면서 Infinity가 아닐 때
		if(position && position.toString().indexOf('Infinity') === -1) {
			result.pixel.position = position / ratio;
			result.percent.position = Math.abs(result.pixel.position / (result.pixel.size - to) * 100);
		}
	}

	return result;
}

let spriteDirectory = [];

// ./images/sprite 폴더 조회
try {
	spriteDirectory = fs.readdirSync(baseDirectory);
}catch(error) {
	console.error(baseDirectory + '가 있는지 확인해주세요.');
}

(function loopSpriteDirectory(index) {
	//조회된 파일, 폴더 수만큼 반복
	if(spriteDirectory.length > index) {
		//폴더 이름
		let directory = spriteDirectory[index],
			directoryName = directory;
		
		//기본 디렉토리와 폴더명과 합성(./images/sprite/#)
		directory = baseDirectory + '/' + directoryName;
		
		//폴더일 때
		if(fs.statSync(directory).isDirectory()) {
			//조회(./images/sprite/#/#.#)
			let files = fs.readdirSync(directory),
				filenames = [];
			
			//조회된 파일, 폴더 수 만큼 반복
			files.forEach((value, index, array) => {
				let splitValue = value.split('.');

				//폴더경로와 파일명 합성(./images/sprite/#.#)
				value = directory + '/' + value;
				
				//이미지 파일의 확장자를 가진 파일일 때 파일경로, 파일명 입력
				if(fs.statSync(value).isFile() && imageExtensions.indexOf(splitValue[1])) {
					files[index] = value;
					filenames.push(splitValue[0]);

				//아니면 배열 files에서 제거
				}else{
					files.splice(index, 1);
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
						let spriteWidth = result.properties.width,
							spriteHeight = result.properties.height,
							distDirectory = directory + '/' + 'dist', //폴더 경로와 dist 폴더명 합성(./images/sprite/#/dist)
							spriteName = directoryName + '_sprite',
							saveDirectory = distDirectory + '/' + spriteName,
							hasDistDirectory = false,
							code = {
								original : '@charset \'utf-8\';\n',
								percent : '\n\n/* 가변 크기 */'
							},
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

						for(let i in result.coordinates) {
							let coordinates = result.coordinates[i],
								width = coordinates.width,
								height = coordinates.height,
								x = coordinates.x,
								y = coordinates.y,
								filename = filenames[counter],
								percent = {
									horizontal : calcSprite(spriteWidth, width, width, x).percent,
									vertical : calcSprite(spriteHeight, height, height, y).percent
								},
								position = {
									original : x,
									percent : percent.horizontal.position
								},
								percentSize = percent.horizontal.size;
							
							//x 좌표값이 있을 때
							if(x) {
								x = '-' + x + 'px';
							}
							
							//y 좌표값이 있을 때
							if(y) {
								y = '-' + y + 'px';
							}
							
							//x 좌표값과 y 좌표값이 다를 때
							if(x !== y) {
								//x 좌표값이 없을 때
								if(!x) {
									x = 'left';
								}
								
								//y 좌표값이 없을 때
								if(!y) {
									y = 'top';
								}

								position.original = x + ' ' + y;
							}

							//넓이 값이 있을 때
							if(width) {
								width += 'px';
							}
							
							//높이 값이 있을 때
							if(height) {
								height += 'px';
							}
							
							code.original += '\n.' + filename + ' {width:' + width + '; height:' + height + '; background:url(\'' + (spriteName + '.png') + '\') no-repeat ' + position.original + ';}';

							//가로 위치가 있을 때
							if(percent.horizontal.position) {
								percent.horizontal.position = parseFloat(percent.horizontal.position.toFixed(2), 10) + '%';
							}
							
							//세로 위치가 있을 때
							if(percent.vertical.position) {
								percent.vertical.position = parseFloat(percent.vertical.position.toFixed(2) , 10) + '%';
							}
							
							//가로 위치와 세로 위치가 다를 때
							if(percent.horizontal.position !== percent.vertical.position) {
								//x 좌표값이 없을 때
								if(!percent.horizontal.position) {
									percent.horizontal.position = 'left';
								}
								
								//y 좌표값이 없을 때
								if(!percent.vertical.position) {
									percent.vertical.position = 'top';
								}

								position.percent = percent.horizontal.position + ' ' + percent.vertical.position;
							}
							
							//원본 위치와 퍼센트 위치와 다를때
							if(position.original === position.percent) {
								position.percent = '';
							}else{
								position.percent = 'background-position:' + position.percent + '; ';
							}

							//가로 크기가 있을 때
							if(percent.horizontal.size) {
								percent.horizontal.size = parseFloat(percent.horizontal.size.toFixed(2), 10) + '%';
							}
							
							//세로 크기가 있을 때
							if(percent.vertical.size) {
								percent.vertical.size = parseFloat(percent.vertical.size.toFixed(2), 10) + '%';
							}
							
							//가로 크기와 세로 크기가 다를 때
							if(percent.horizontal.size !== percent.vertical.size) {
								percentSize = percent.horizontal.size + ' ' + percent.vertical.size;
							}

							code.percent += '\n.' + filename + ' {' + position.percent + 'background-size:' + percentSize + ';}';
							
							counter++;
						}

						//css 파일 생성(./images/#/dist/)
						code = code.original + code.percent;
						fs.writeFileSync(saveDirectory + '.css', code);

						console.log(distDirectory + '에 생성하였습니다.');
					}

					//다음 반복 실행
					loopSpriteDirectory(index + 1);
				});
			}else{
				console.error(directory + '에 이미지 파일이 없습니다.');
			}
		}else{
			console.error(directory + '가 폴더가 아닙니다.');
		}
	}
})(0);