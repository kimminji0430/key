// ---- 필요한 모듈 불러오기 ----
const express = require('express');      // 웹 서버용 (html, css 제공)
const http = require('http');            // Node.js HTTP 서버
const WebSocket = require('ws');         // 웹소켓(실시간 통신) 서버
const SerialPort = require('serialport'); // 아두이노와 시리얼 통신

// ---- 아두이노 연결 정보 ----
const SERIAL_PORT = 'COM4';   // 아두이노 연결 포트명 (PC마다 다름, 장치관리자에서 확인)
const BAUD_RATE = 9600;       // 아두이노 기본 속도

// ---- 웹 서버 만들기 ----
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // 웹소켓 서버(같은 포트로 사용)

// ---- public 폴더에서 정적 파일(index.html, style.css) 제공 ----
app.use(express.static(__dirname + '/public'));

// ---- 웹에서 온 클라이언트 연결 객체 저장 ----
let wsClient = null;

// ---- 웹소켓 연결(브라우저 접속)시 실행 ----
wss.on('connection', function connection(ws) {
  wsClient = ws; // 연결된 클라이언트 저장
  console.log("Web client connected.");
});

// ---- 아두이노 시리얼 포트 열기 ----
const port = new SerialPort(SERIAL_PORT, { baudRate: BAUD_RATE });
// 줄 단위로 시리얼 읽기
const parser = port.pipe(new SerialPort.parsers.Readline({ delimiter: '\r\n' }));

// ---- 아두이노에서 신호 들어올 때마다 실행 ----
parser.on('data', function(data) {
  console.log('Arduino:', data); // 콘솔에 출력
  // 웹에 접속한 클라이언트가 있으면 신호 전송
  if (wsClient && wsClient.readyState === 1) {
    wsClient.send(data);
  }
});

// ---- 서버 실행(8080포트에서 시작) ----
server.listen(8080, function() {
  console.log('WebSocket+HTTP server running at http://localhost:8080');
});
