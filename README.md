# sprite v1.0.0
NodeJS로 만들었으며 스프라이트 이미지 생성을 도와주는 도구입니다.

## CLI
node sprite.js

## 패턴
- 이미지가 10픽셀 간격으로 생성한다.
- 가로형 이미지로 생성한다.

## 규칙
1. sprite.js와 images폴더가 형제관계로 있어야 된다.
2. images 폴더안에 sprite폴더가 존재해야 한다. 
3. images 폴더안에 원하는 폴더명으로 폴더를 만든다.
4. ./images/#/ 안에 이미지 파일의 파일명을 01.#, 02.#...으로 짓는다.

## 유지보수
PSD가 있으면 손이 덜가지만 PSD가 없고 이 도구를 이용하고 컷팅된 파일들을 유지한다면 파일을 추가하면서 재생성한다면 스프라이트 이미지의 좌표값을 해치지 않고 형상유지를 할 수 있다.