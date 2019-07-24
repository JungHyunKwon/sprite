/**
 * @name sprite
 * @author JungHyunKwon
 * @since 2018-06-05
 */

'use strict';

const fs = require('fs'),
	  path = require('path'),
	  spriteSmith = require('spritesmith'), // {@link https://github.com/twolfson/spritesmith}
	  baseDirectory = './images/sprite',
	  imageExtensions = ['.gif', '.png', '.jpg'];

/**
 * @name 숫자 정렬
 * @param {array} value
 * @return {array}
 * @since 2018-07-13
 */
function sortNumber(value) {
	return value.filter((element, index, array) => {
		element = element.split('/');

		return(isNaN(element[element.length - 1].split('.')[0])) ? false : true;
	}).sort((a, b) => {
		a = a.split('/');
		b = b.split('/');

		return a[a.length - 1].split('.')[0] - b[b.length - 1].split('.')[0];
	});
}

/**
 * @name 숫자 확인
 * @since 2017-12-06
 * @param {*} value
 * @return {boolean}
 */
function isNumeric(value) {
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
	let result = NaN;

	//값이 숫자일 때
	if(isNumeric(value)) {
		result = value;
		
		//소수가 숫자일 때
		if(isNumeric(decimal)) {
			let splitValue = value.toString().split('.'),
				firstSplitValue = splitValue[1];
			
			//소수점이 있을 때
			if(firstSplitValue) {
				splitValue[1] = firstSplitValue.substring(0, decimal);
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

	//좌표가 숫자이면서 나미저 변수들이 숫자이면서 0 초과일 때
	if(isNumeric(size) && size > 0 && isNumeric(from) && from > 0 && isNumeric(to) && to > 0 && isNumeric(position)) {
		let ratio = from / to,
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

fs.readdir(baseDirectory, (err, directories) => {
	//오류가 있을 때
	if(err) {
		console.error(baseDirectory + '가 있는지 확인해주세요.');
	}else{
		let directoryLength = directories.length;

		(function loopDirectories(directoriesIndex) {
			//조회된 파일, 폴더 개수만큼 반복
			if(directoryLength > directoriesIndex) {
				let directory = directories[directoriesIndex],
					directoryName = directory;
				
				//기본 디렉토리와 폴더명과 합성(./images/sprite/#)
				directory = baseDirectory + '/' + directoryName;
				
				fs.stat(directory, (err, stats) => {
					let nextDirectoriesIndex = directoriesIndex + 1;

					//오류가 있을 때
					if(err) {
						console.error(directory + '를 조회 할 수 없습니다.');
						
						loopDirectories(nextDirectoriesIndex);

					//폴더일 때
					}else if(stats.isDirectory()) {
						fs.readdir(directory, (err, files) => {
							//오류가 있을 때
							if(err) {
								console.error(directory + ' 목록을 읽을 수 없습니다.');
								
								loopDirectories(nextDirectoriesIndex);
							}else{
								let filesLength = files.length,		
									imageFiles = [],
									imageNames = [];

								(function loopFiles(filesIndex) {
									//파일 개수만큼 반복
									if(filesLength > filesIndex) {
										let file = files[filesIndex],
											parsedFile = path.parse(file),
											fileName = parsedFile.name,
											fileExtensions = parsedFile.ext.toLowerCase();

										file = directory + '/' + file;

										fs.stat(file, (err, stats) => {
											//오류가 있을 때
											if(err) {
												console.error(file + '를 조회 할 수 없습니다.');
											
											//이미지 파일의 확장자를 가진 파일일 때
											}else if(stats.isFile() && imageExtensions.indexOf(fileExtensions) > -1) {
												imageFiles.push(file);
												imageNames.push(fileName);
											}

											loopFiles(filesIndex + 1);
										});
									
									//이미지 파일이 있을 때
									}else if(imageFiles.length) {
										//숫자 순으로 정렬
										imageFiles = sortNumber(imageFiles);
										imageNames = sortNumber(imageNames);

										spriteSmith.run({
											src : imageFiles,
											padding : 10,
											algorithm: 'top-down',
											algorithmOpts : {
											  sort : false
											}
										}, (err, result) => {
											//오류가 있을 때
											if(err) {
												console.error(directory + '에 스프라이트 이미지 생성 중 오류가 발생했습니다.');

												loopDirectories(nextDirectoriesIndex);
											}else{
												let distDirectory = directory + '/dist'; //폴더 경로와 dist 폴더명 합성(./images/sprite/#/dist)
												
												fs.stat(distDirectory, (err, stats) => {
													//오류가 있을 때
													if(err) {
														fs.mkdir(distDirectory, err => {
															//오류가 있을 때
															if(err) {
																console.error(distDirectory + '에 폴더를 생성하지 못했습니다.');

																loopDirectories(nextDirectoriesIndex);
															}else{
																loopDirectories(directoriesIndex);
															}
														});
													
													//폴더일 때
													}else if(stats.isDirectory()) {
														let spriteName = directoryName + '_sprite',
															saveDirectory = distDirectory + '/' + spriteName;

														//png 파일 생성(./images/#/dist/)
														fs.writeFile(saveDirectory + '.png', result.image, err => {
															//오류가 있을 때
															if(err) {
																console.error(distDirectory + '에 스프라이트 이미지 파일을 생성하지 못했습니다.');

																loopDirectories(nextDirectoriesIndex);
															}else{
																let coordinates = result.coordinates,
																	properties = result.properties,
																	imageWidth = properties.width,
																	imageHeight = properties.height,
																	pixelCode = '@charset "utf-8";\n',
																	percentCode = '\n\n/* 가변 크기 */',
																	counter = 0;

																for(let i in coordinates) {
																	let coordinate = coordinates[i],
																		width = coordinate.width,
																		height = coordinate.height,
																		x = coordinate.x,
																		y = coordinate.y,
																		horizontalPercent = calcSprite(imageWidth, width, width, x).percent,
																		horizontalPercentPosition = horizontalPercent.position,
																		horizontalPercentSize = horizontalPercent.size,
																		verticalPercent = calcSprite(imageHeight, height, height, y).percent,
																		verticalPercentPosition = verticalPercent.position,
																		verticalPercentSize = verticalPercent.size,
																		imageName = imageNames[counter];

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

																	pixelCode += '\n.' + imageName + ' {width:' + width + '; height:' + height + '; background:url(\'' + (spriteName + '.png') + '\') no-repeat ' + position + ';}';
																	
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

																	percentCode += '\n.' + imageName + ' {' + percentPosition + 'background-size:' + horizontalPercentSize + ' ' + verticalPercentSize + ';}';

																	counter++;
																}

																//css 파일 생성(./images/#/dist/)
																fs.writeFile(saveDirectory + '.css', pixelCode + percentCode, err => {
																	//오류가 있을 때
																	if(err) {
																		console.error(distDirectory + '에 css 파일을 생성하지 못했습니다.');
																	}else{
																		console.log(distDirectory + '에 생성하였습니다.');
																	}

																	//다음 반복 실행
																	loopDirectories(nextDirectoriesIndex);
																});

															}
														});
													}else{
														console.error(distDirectory + '가 폴더가 아닙니다.');

														loopDirectories(nextDirectoriesIndex);
													}
												});
											}
										});
									}else{
										console.error(directory + '에 이미지 파일이 없습니다.');

										loopDirectories(nextDirectoriesIndex);
									}
								})(0);
							}
						});
					}else{
						console.error(directory + '가 폴더가 아닙니다.');

						loopDirectories(nextDirectoriesIndex);
					}
				});
			}else{
				console.log('작업을 완료하였습니다.');
			}
		})(0);
	}
});