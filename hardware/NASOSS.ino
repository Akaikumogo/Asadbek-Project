#include <WiFi.h>
#include <WebServer.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7735.h>
#include <PZEM004Tv30.h>
#include <NewPing.h>

// -------------------------------------------------------
// 1. AP (Access Point) sozlamalari
// -------------------------------------------------------
const char* AP_SSID = "ESP32_WaterSystem";
const char* AP_PASS = "water123";

// -------------------------------------------------------
// 2. TFT sozlamalari
// -------------------------------------------------------
#define TFT_CS    5
#define TFT_RST   4
#define TFT_DC    22
#define TFT_MOSI  23
#define TFT_SCLK  18
Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);

// --------------------------------------------------------
// 3. Ultrasonik sensor (NewPing)
// --------------------------------------------------------
#define TRIG_PIN      26
#define ECHO_PIN      27
#define MAX_DISTANCE 400
NewPing sonar(TRIG_PIN, ECHO_PIN, MAX_DISTANCE);

// -------------------------------------------------------
// 4. Flow sensor
// -------------------------------------------------------
#define FLOW_PIN     25
volatile int pulseCount = 0;
void IRAM_ATTR pulseCounter() {
  pulseCount++;
}

// -------------------------------------------------------
// 5. Motor pinlari
// -------------------------------------------------------
#define MOTOR1_PIN   2
#define MOTOR2_PIN  12

bool activeMotor2 = false;   // Qaysi motor faol
bool motorFault   = false;   // Ikkala motor ham nosoz bo‘lsa

const unsigned long motorStartDelay = 10000;  // 10 soniya tok tekshirish uchun kutish
const float minCurrent = 0.05;   // Minimal oqim (A)
const float maxCurrent = 10.0;   // Maksimal oqim (A)

unsigned long motorStartTime = 0;
bool motorStarted = false;

// --------------------------------------------------------
// 6. PZEM parametrlari
// --------------------------------------------------------
PZEM004Tv30 pzem(Serial2, 16, 17);  // RX=16, TX=17

// --------------------------------------------------------
// 7. Global o‘zgaruvchilar
// --------------------------------------------------------
float totalLitres      = 0.0;
float totalElectricity = 0.0;    // kW
int height             = 0;      // Belgilangan balandlik (cm)
int heightOld          = 0;
int waterDepth         = 0;      // O‘lchangan suv chuqurligi (cm)
int waterVolume        = 200;    // Litr

String motorState      = "OFF";  // Ayirboshlanadigan motor holati
bool motorNew          = false;  // Vebdan kelgan motor buyruq (ON/OFF)
bool motorOld          = false;

// --------------------------------------------------------
// 8. Timer uchun o‘zgaruvchilar
// --------------------------------------------------------
unsigned long timerEndTime      = 0;      // millis() + (timerSeconds*1000)
bool timerActive               = false;  // Timer ON bo‘lsa true
unsigned long timerDuration    = 0;      // Belgilangan timer (millisekundda)
String timerDisplay            = "00:00"; // “mm:ss” ko‘rinishidagi qolgan vaqt

// --------------------------------------------------------
// 9. TFT ekrani uchun oldingi qiymatlar (tejamkor yangilash uchun)
// --------------------------------------------------------
String prevWaterDepth       = "";
String prevHeight           = "";
String prevTotalLitres      = "";
String prevMotorState       = "";
String prevTotalElectricity = "";
String prevTimerDisplay     = "";

// --------------------------------------------------------
// 10. Vaqt o‘zgaruvchilari va interval parametrlar
// --------------------------------------------------------
unsigned long lastSensorTime    = 0;
unsigned long lastTFTTime       = 0;
const unsigned long sensorInterval   = 1000;  // 1 soniya
const unsigned long tftInterval      = 1000;  // 1 soniya

// --------------------------------------------------------
// 11. Ichki WebServer obyekti (80‐portda)
// --------------------------------------------------------
WebServer server(80);

// --------------------------------------------------------
// 12. Dastur prototiplari
// --------------------------------------------------------
void setupAP();
void handleRoot();            // “/” sahifa
void handleData();            // “/data” JSON ma’lumot qaytaradi
void handleCommand();         // “/command” buyruq qabul qiladi
void runSensor();             // Sensor + motor nazorati (har 1 s)
void runTFTDisplay();         // TFT yangilash (har 1 s)
void updateMotorState();      // Motor holatini yangilash (tok tekshirish)
void updateTimer();           // Timerni holatini tekshirish va qolgan vaqtni yangilash

// --------------------------------------------------------
// 13. setup() funksiyasi
// --------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(100);

  // 1) Pinlarni sozlash
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(MOTOR1_PIN, OUTPUT);
  pinMode(MOTOR2_PIN, OUTPUT);
  digitalWrite(MOTOR1_PIN, LOW);
  digitalWrite(MOTOR2_PIN, LOW);

  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), pulseCounter, FALLING);

  // 2) TFT ekranini ishga tushiramiz
  tft.initR(INITR_BLACKTAB);
  tft.setRotation(1);
  tft.fillScreen(ST77XX_BLACK);
  tft.setTextColor(ST77XX_WHITE);
  tft.setTextSize(2);
  tft.setCursor(0, 0);
  tft.println("System starting...");

  // 3) Wi-Fi AP (Access Point) sifatida ishga tushiramiz
  setupAP();

  // 4) Serial2 (PZEM) ni ishga tushiramiz
  Serial2.begin(9600, SERIAL_8N1, 16, 17);

  // 5) WebServer uchun marshrutlarni qo‘shamiz
  server.on("/", handleRoot);
  server.on("/data", handleData);
  server.on("/command", handleCommand);
  server.begin();
  Serial.println("WebServer started at 192.168.4.1");
}

// --------------------------------------------------------
// 14. loop() funksiyasi
// --------------------------------------------------------
void loop() {
  unsigned long now = millis();

  // 1) Har 1 soniyada sensor va motor nazorati
  if (now - lastSensorTime >= sensorInterval) {
    lastSensorTime = now;
    runSensor();
  }

  // 2) Har 1 soniyada TFT ekranni yangilash (shu jumladan timerni yangilash)
  if (now - lastTFTTime >= tftInterval) {
    lastTFTTime = now;
    updateTimer();        // Avvalo timerni yangilaymiz
    runTFTDisplay();
  }

  // 3) Agar tarmoqdan (AP-ga ulangan mijoz bo‘lmasa), motorni o‘chirib qo‘yamiz
  //    WiFi.softAPgetStationNum() = AP-ga ulangan mijozlar soni
  if (WiFi.softAPgetStationNum() == 0 && motorState == "ON") {
    motorNew    = false;
    motorState  = "OFF";
    digitalWrite(MOTOR1_PIN, LOW);
    digitalWrite(MOTOR2_PIN, LOW);
    Serial.println("Hech kim ulanmagan: motor avtomatik o‘chirildi");
  }

  // 4) Web‐serverni boshqaramiz (HTTP so‘rovlarni qayta ishlaydi)
  server.handleClient();
}

// --------------------------------------------------------
// 15. Access Point sozlash
// --------------------------------------------------------
void setupAP() {
  WiFi.softAP(AP_SSID, AP_PASS);
  IPAddress IP = WiFi.softAPIP();
  Serial.print("Access Point IP: ");
  Serial.println(IP);

  tft.setCursor(0, 20);
  tft.setTextColor(ST77XX_GREEN);
  tft.print("AP IP: ");
  tft.println(IP);
}

// --------------------------------------------------------
// 16. “/” – asosiy sahifa (HTML + JS) qaytarish
// --------------------------------------------------------
void handleRoot() {
  const char html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ESP32 ⇆ Web (AP + Timer)</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    header { background: #4CAF50; color: #fff; text-align: center; padding: 1rem; }
    main { padding: 1rem; max-width: 600px; margin: auto; }
    .status { margin-bottom: 1rem; font-weight: bold; }
    .data-item { margin: 0.5rem 0; }
    label { display: inline-block; width: 150px; }
    input[type="number"] { width: 100px; padding: 0.2rem; }
    button { padding: 0.5rem 1rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #45a049; }
    #msg { color: red; margin-top: 1rem; }
    hr { margin: 1rem 0; }
  </style>
</head>
<body>
  <header>
    <h1>ESP32 ⇆ Web (AP + Timer)</h1>
    <p class="status">Status: <span id="status-text">📶 Ulanish kutilyapti...</span></p>
  </header>
  <main>
    <div class="data-item"><label>Suv chuqurligi:</label><span id="depth-text">-- cm</span></div>
    <div class="data-item"><label>Belgilangan balandlik:</label><span id="height-text">-- cm</span></div>
    <div class="data-item"><label>Suv miqdori:</label><span id="litres-text">-- L</span></div>
    <div class="data-item"><label>Elektr:</label><span id="power-text">-- kW</span></div>
    <div class="data-item"><label>Motor holati:</label><span id="motor-text">--</span></div>
    <div class="data-item"><label>Timer qolgan:</label><span id="timer-text">--:--</span></div>

    <hr>

    <h3>Balandlik sozlash</h3>
    <div class="data-item">
      <label for="height-input">Yangi balandlik:</label>
      <input type="number" id="height-input" min="0" step="1"> cm
      <button onclick="setHeight()">SOZLASH</button>
    </div>

    <hr>

    <h3>Motor buyruqlari</h3>
    <div class="data-item">
      <button onclick="sendCommand('ON')">Motor ON</button>
      <button onclick="sendCommand('OFF')">Motor OFF</button>
    </div>

    <hr>

    <h3>Timer sozlash (soniya)</h3>
    <div class="data-item">
      <label for="timer-input">Timer (s):</label>
      <input type="number" id="timer-input" min="1" step="1"> s
      <button onclick="setTimer()">SET TIMER</button>
    </div>

    <div id="msg"></div>
  </main>

  <script>
    // Sahifa yuklanganda har 1 soniyada maʼlumotlarni olib kelamiz
    setInterval(fetchData, 1000);

    function setHeight() {
      const val = document.getElementById('height-input').value;
      if (val === '') return;
      fetch(`/command?height=` + val)
        .then(res => res.text())
        .then(txt => {
          document.getElementById('msg').textContent = 'Balandlik ' + val + ' cm ga o‘rnatildi';
        })
        .catch(err => {
          document.getElementById('msg').textContent = 'Xato: ' + err;
        });
    }

    function sendCommand(cmd) {
      fetch(`/command?motor=` + cmd)
        .then(res => res.text())
        .then(txt => {
          document.getElementById('msg').textContent = 'Motor buyrug‘i: ' + cmd;
        })
        .catch(err => {
          document.getElementById('msg').textContent = 'Xato: ' + err;
        });
    }

    function setTimer() {
      const val = document.getElementById('timer-input').value;
      if (val === '') return;
      fetch(`/command?timer=` + val)
        .then(res => res.text())
        .then(txt => {
          document.getElementById('msg').textContent = 'Timer ' + val + ' soniya qilib o‘rnatildi';
        })
        .catch(err => {
          document.getElementById('msg').textContent = 'Xato: ' + err;
        });
    }

    function fetchData() {
      fetch('/data')
        .then(res => res.json())
        .then(obj => {
          document.getElementById('status-text').textContent = '✅ Ulandi (AP)';
          document.getElementById('depth-text').textContent = obj.waterDepth + ' cm';
          document.getElementById('height-text').textContent = obj.height + ' cm';
          document.getElementById('litres-text').textContent = obj.totalLitres.toFixed(2) + ' L';
          document.getElementById('power-text').textContent = obj.totalElectricity.toFixed(2) + ' kW';
          document.getElementById('motor-text').textContent = obj.motorState;
          document.getElementById('timer-text').textContent = obj.timerRemaining;
        })
        .catch(err => {
          document.getElementById('status-text').textContent = '⚠️ Ulana olmadi';
        });
    }
  </script>
</body>
</html>
)rawliteral";

  server.send(200, "text/html", html);
}

// --------------------------------------------------------
// 17. “/data” – joriy sensor/holat maʼlumotlarini JSON qaytaradi
// --------------------------------------------------------
void handleData() {
  unsigned long now = millis();
  unsigned long remSec = 0;
  if (timerActive && now < timerEndTime) {
    remSec = (timerEndTime - now) / 1000;
  } else {
    remSec = 0;
    timerActive = false;
  }

  // mm:ss formatga aylantirib timerRemaining yozamiz
  unsigned long minutes = remSec / 60;
  unsigned long seconds = remSec % 60;
  char buf[6];  // "MM:SS"
  sprintf(buf, "%02lu:%02lu", minutes, seconds);
  timerDisplay = String(buf);

  String json = "{";
  json += "\"waterDepth\":" + String(waterDepth) + ",";
  json += "\"height\":" + String(height) + ",";
  json += "\"totalLitres\":" + String(totalLitres, 2) + ",";
  json += "\"totalElectricity\":" + String(totalElectricity, 2) + ",";
  json += "\"motorState\":\"" + motorState + "\",";
  json += "\"timerRemaining\":\"" + timerDisplay + "\"";
  json += "}";

  server.send(200, "application/json", json);
}

// --------------------------------------------------------
// 18. “/command” – vebdan buyruqlar oladi (height, motor, timer)
// --------------------------------------------------------
void handleCommand() {
  // 1) Height buyruq
  if (server.hasArg("height")) {
    String h = server.arg("height");
    height = h.toInt();
    Serial.print("Yangi balandlik: ");
    Serial.println(height);
  }
  // 2) Motor ON/OFF buyruq
  if (server.hasArg("motor")) {
    String m = server.arg("motor");
    if (m == "ON") {
      motorNew    = true;
      timerActive = false;   // manual buyruq kelsa timerni bekor qilamiz
      Serial.println("Veb: Motor ON buyrug‘i keldi");
    }
    else if (m == "OFF") {
      motorNew    = false;
      timerActive = false;   // manual buyrug‘ OFF bo‘lsa ham timerni bekor qilamiz
      Serial.println("Veb: Motor OFF buyrug‘i keldi");
    }
  }
  // 3) Timer buyruq (soniyalarda)
  if (server.hasArg("timer")) {
    String t = server.arg("timer");
    int tsec = t.toInt();
    if (tsec > 0) {
      timerDuration = (unsigned long)tsec * 1000;   // millisekund
      timerEndTime  = millis() + timerDuration;
      timerActive   = true;
      motorNew      = true;  // timer davomida motorni yoqib qo‘yamiz
      Serial.print("Veb: Timer o‘rnatildi (");
      Serial.print(tsec);
      Serial.println(" s)");
    }
  }

  server.send(200, "text/plain", "OK");
}

// --------------------------------------------------------
// 19. Sensor va motor nazorati (har 1 s da)
// --------------------------------------------------------
void runSensor() {
  // 1) Ultrasonik sensor: suv chuqurligini o‘qiymiz
  int measuredDepth = sonar.ping_cm();
  if (measuredDepth > 0) {
    waterDepth = measuredDepth;
  }

  // 2) Flow sensor: litr hisoblash
  float flowRate = (pulseCount / 7.5);         // L/min
  totalLitres += (flowRate / 60.0);            // L
  pulseCount = 0;

  // 3) PZEM: quvvat va oqimni o‘qiymiz
  float powerWatts = pzem.power();
  float currentVal = pzem.current();
  if (!isnan(powerWatts)) {
    float powerKW = powerWatts / 1000.0;
    totalElectricity = round(powerKW * 100.0) / 100.0; // 2 xonali aniqlik
  }

  // 4) Motor boshqarish shartlari:
  //    – Agar timerActive bo‘lsa, majburiy motorNew = true
  if (timerActive) {
    motorNew = true;
  }
  //    – Agar balandlik > chuqurlik va motorNew == true
  if ((motorNew || height != heightOld) && height > waterDepth && !motorFault) {
    motorState = "ON";
  }
  //    – Agar motorNew == false && balandlik farqi bo‘lsa
  else if (!motorNew && height != heightOld) {
    motorState = "ON";
  }
  //    – Aks holda
  else if (!motorNew || height <= 0 || height <= waterDepth) {
    motorState = "OFF";
  }

  // 5) Motorni yoqish / tokni tekshirish (har 10 s ichida)
  updateMotorState();

  heightOld = height;
  motorOld  = motorNew;
}

// --------------------------------------------------------
// 20. Motor holatini yangilash va tokni tekshirish
// --------------------------------------------------------
void updateMotorState() {
  static unsigned long startTime = 0;

  if (motorState == "ON" && !motorFault) {
    if (!motorStarted) {
      startTime    = millis();
      motorStarted = true;
      if (activeMotor2) {
        digitalWrite(MOTOR2_PIN, HIGH);
        digitalWrite(MOTOR1_PIN, LOW);
      } else {
        digitalWrite(MOTOR1_PIN, HIGH);
        digitalWrite(MOTOR2_PIN, LOW);
      }
    }
    // 10 soniyadan keyin tokni tekshiramiz
    if (millis() - startTime >= motorStartDelay) {
      float currentVal = pzem.current();
      if (!isnan(currentVal) && (currentVal < minCurrent || currentVal > maxCurrent)) {
        // Hato aniqlansa, motorni o‘chirib, boshqa motorni yoqamiz
        digitalWrite(MOTOR1_PIN, LOW);
        digitalWrite(MOTOR2_PIN, LOW);
        if (activeMotor2) {
          motorFault = true;        // Ikkala motor ham muvaffaqiyatsiz bo‘ldi
          motorState = "OFF";
        } else {
          activeMotor2 = true;      // Zaxira motorga o‘tamiz
          motorStarted = false;     // Yana yoqamiz
        }
      }
    }
  } else {
    // Motorni o‘chirib qo‘yamiz
    digitalWrite(MOTOR1_PIN, LOW);
    digitalWrite(MOTOR2_PIN, LOW);
    motorStarted = false;
  }

  // Agar ON holati bo‘lsa, motorni yoqamiz
  if (motorState == "ON" && !motorFault) {
    if (activeMotor2) {
      digitalWrite(MOTOR2_PIN, HIGH);
      digitalWrite(MOTOR1_PIN, LOW);
    } else {
      digitalWrite(MOTOR1_PIN, HIGH);
      digitalWrite(MOTOR2_PIN, LOW);
    }
  }
}

// --------------------------------------------------------
// 21. Timer holatini yangilash (har 1 s da) va qolgan vaqtni hisoblash
// --------------------------------------------------------
void updateTimer() {
  unsigned long now = millis();
  if (timerActive) {
    if (now >= timerEndTime) {
      // Timer tugadi: timerActive = false, motor majburiy OFF => false
      timerActive = false;
      motorNew    = false;
      // motorState => keyingi runSensor() bilan qayta hisoblanadi
      Serial.println("Timer tugadi – endi balandlikga mos ishlaydi");
    }
  }
}

// --------------------------------------------------------
// 22. TFT ekrani yangilash (har 1 s da)
// --------------------------------------------------------
void runTFTDisplay() {
  // 1) Suv chuqurligi
  String depthStr = String(waterDepth) + " cm";
  if (depthStr != prevWaterDepth) {
    tft.setCursor(0, 0 * 20);
    tft.fillRect(0, 0 * 20, 160, 20, ST77XX_BLACK);
    tft.print("Suv: ");
    tft.println(depthStr);
    prevWaterDepth = depthStr;
  }

  // 2) Balandlik
  String heightStr = String(height) + " cm";
  if (heightStr != prevHeight) {
    tft.setCursor(0, 1 * 20);
    tft.fillRect(0, 1 * 20, 160, 20, ST77XX_BLACK);
    tft.print("H: ");
    tft.println(heightStr);
    prevHeight = heightStr;
  }

  // 3) Suv miqdori
  String litresStr = String(totalLitres, 2) + " L";
  if (litresStr != prevTotalLitres) {
    tft.setCursor(0, 2 * 20);
    tft.fillRect(0, 2 * 20, 160, 20, ST77XX_BLACK);
    tft.print("Sarf: ");
    tft.println(litresStr);
    prevTotalLitres = litresStr;
  }

  // 4) Elektr
  String powerStr = String(totalElectricity, 2) + " kW";
  if (powerStr != prevTotalElectricity) {
    tft.setCursor(0, 3 * 20);
    tft.fillRect(0, 3 * 20, 160, 20, ST77XX_BLACK);
    tft.print("En: ");
    tft.println(powerStr);
    prevTotalElectricity = powerStr;
  }

  // 5) Motor holati
  if (motorState != prevMotorState) {
    tft.setCursor(0, 4 * 20);
    tft.fillRect(0, 4 * 20, 160, 20, ST77XX_BLACK);
    tft.print("Motor: ");
    tft.println(motorState);
    prevMotorState = motorState;
  }

  // 6) Timer qolgan vaqt (mm:ss formatida)
  unsigned long now = millis();
  unsigned long remSec = 0;
  if (timerActive && now < timerEndTime) {
    remSec = (timerEndTime - now) / 1000;
  } else {
    remSec = 0;
  }
  unsigned long minutes = remSec / 60;
  unsigned long seconds = remSec % 60;
  char buf[6];
  sprintf(buf, "%02lu:%02lu", minutes, seconds);
  String timerStr = String(buf);

  if (timerStr != prevTimerDisplay) {
    tft.setCursor(0, 5 * 20);
    tft.fillRect(0, 5 * 20, 160, 20, ST77XX_BLACK);
    tft.print("Timer: ");
    tft.println(timerStr);
    prevTimerDisplay = timerStr;
  }
}
