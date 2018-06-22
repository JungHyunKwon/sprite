/**
 * @name sprite
 * @author JungHyunKwon
 * @since 2018-06-05
 */

'use strict';

const fs = require('fs'),
	  spriteSmith = require('spritesmith'),
	  baseDirectory = './images/sprite',
	  imageExtensions = ['ase', 'art', 'bmp', 'blp', 'cd5', 'cit', 'cpt', 'cr2', 'cut', 'dds', 'dib', 'djvu', 'egt', 'exif', 'gif', 'gpl', 'grf', 'icns', 'ico', 'iff', 'jng', 'jpeg', 'jpg', 'jfif', 'jp2', 'jps', 'lbm', 'max', 'miff', 'mng', 'msp', 'nitf', 'ota', 'pbm', 'pc1', 'pc2', 'pc3', 'pcf', 'pcx', 'pdn', 'pgm', 'PI1', 'PI2', 'PI3', 'pict', 'pct', 'pnm', 'pns', 'ppm', 'psb', 'psd', 'pdd', 'psp', 'px', 'pxm', 'pxr', 'qfx', 'raw', 'rle', 'sct', 'sgi', 'rgb', 'int', 'bw', 'tga', 'tiff', 'tif', 'vtf', 'xbm', 'xcf', 'xpm', '3dv', 'amf', 'ai', 'awg', 'cgm', 'cdr', 'cmx', 'dxf', 'e2d', 'egt', 'eps', 'fs', 'gbr', 'odg', 'svg', 'stl', 'vrml', 'x3d', 'sxd', 'v2d', 'vnd', 'wmf', 'emf', 'art', 'xar', 'png', 'webp', 'jxr', 'hdp', 'wdp', 'cur', 'ecw', 'iff', 'lbm', 'liff', 'nrrd', 'pam', 'pcx', 'pgf', 'sgi', 'rgb', 'rgba', 'bw', 'int', 'inta', 'sid', 'ras', 'sun', 'tga'];

let spriteFolder = [];

// ./images/sprite 폴더조회
try {
	spriteFolder = fs.readdirSync(baseDirectory);
}catch(error) {
	console.error(baseDirectory + '가 있는지 확인해주세요.');
}

//조회된 파일, 폴더 수 만큼 반복
spriteFolder.forEach((directory, index, array) => {
	//폴더명
	let directoryName = directory;
	
	//기본 디렉토리와 폴더명과 합성(./images/sprite/#)
	directory = baseDirectory + '/' + directoryName;
	
	//폴더일때
	if(fs.statSync(directory).isDirectory()) {
		//조회(./images/sprite/#/#.#)
		let files = fs.readdirSync(directory),
			fileName = [];
		
		//조회된 파일, 폴더 수 만큼 반복
		files.forEach((file, index, array) => {
			let fileSplit = file.split('.');

			//폴더경로와 파일명 합성(./images/sprite/#.#)
			file = directory + '/' + file;
			
			//이미지 파일의 확장자를 가진 파일일때 파일경로, 파일명 입력
			if(fs.statSync(file).isFile() && imageExtensions.indexOf(fileSplit[1])) {
				files[index] = file;
				fileName.push(fileSplit[0]);

			//아니면 배열 files에서 제거
			}else{
				files.splice(index, 1);
			}
		});
		
		//이미지 파일이 있을때
		if(files.length) {
			spriteSmith.run({
				src : files,
				padding : 10,
				algorithm: 'top-down',
				algorithmOpts : {
				  sort : false
				}
			}, (error, result) => {
				//오류가 있을때
				if(error) {
					console.error(error);
				}else{
					let distFolder = directory + '/' + 'dist', //폴더경로와 dist폴더명 합성(./images/sprite/#/dist)
						spriteName = directoryName + '_sprite',
						savePath = distFolder + '/' + spriteName,
						isDist = false,
						cssText = '@charset \'utf-8\';\n',
						index = 0;
					
					try {
						//변수 distFolder가 폴더일때
						if(fs.statSync(distFolder).isDirectory()) {
							isDist = true;
						}
					
					//변수 distFolder에 dist폴더가 없으면 오류발생
					}catch(e) {
						//console.log(distFolder + '에 폴더 생성 준비중입니다.');
					}
					
					//dist 폴더가 없을때 폴더생성
					if(!isDist) {
						fs.mkdirSync(distFolder);
						//console.log(distFolder + '에 폴더를 생성 하였습니다.');
					}
					
					//png 파일 생성(./images/#/dist/)
					fs.writeFileSync(savePath + '.png', result.image);

					for(var i in result.coordinates) {
						var coordinates = result.coordinates[i],
							top = 'top',
							left = 'left',
							width = ''
						
						//x 좌표값이 있을때
						if(coordinates.x) {
							left = '-' + coordinates.x + 'px';
						}
						
						//y 좌표값이 있을때
						if(coordinates.y) {
							top = '-' + coordinates.y + 'px';
						}
						
						//넓이값이 있을때
						if(coordinates.width) {
							coordinates.width += 'px';
						}
						
						//높이값이 있을때
						if(coordinates.height) {
							coordinates.height += 'px';
						}

						cssText += '\n.' + fileName[index] + ' {width:' + coordinates.width + '; height:' + coordinates.height + '; background:url(\'' + (spriteName + '.png') + '\') no-repeat ' + left + ' ' + top + ';}';
						index++;
					}
					
					//css 파일 생성(./images/#/dist/)
					fs.writeFileSync(savePath + '.css', cssText);

					console.log(distFolder + '에 생성하였습니다.');
				}
			});
		}else{
			console.error(directory + '에 이미지 파일이 없습니다.');
		}
	}else{
		console.error(directory + '폴더가 아닙니다.');
	}
});