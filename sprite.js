/**
 * @name sprite
 * @author JungHyunKwon
 * @since 2018-06-05
 */

'use strict';

const fs = require('fs'),
	  isImage = require('is-image'),
	  spriteSmith = require('spritesmith'),
	  stringifyObject = require('stringify-object'),
	  baseDirectory = './images/sprite';

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
		let files = fs.readdirSync(directory);
		
		//조회된 파일, 폴더 수 만큼 반복
		files.forEach((file, index, array) => {
			//폴더경로와 파일명 합성(./images/sprite/#.#)
			file = directory + '/' + file;
			
			//이미지 파일일때 파일경로 갱신
			if(fs.statSync(file).isFile() && isImage(file)) {
				files[index] = file;
			
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
						fileName = distFolder + '/' + directoryName + '_sprite',
						isDist = false;
					
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
						console.log(distFolder + '에 폴더를 생성 하였습니다.');
					}
					
					//png, json 파일 생성(./images/#/dist/)
					fs.writeFileSync(fileName + '.png', result.image);
					fs.writeFileSync(fileName + '.json', stringifyObject(result.coordinates));
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