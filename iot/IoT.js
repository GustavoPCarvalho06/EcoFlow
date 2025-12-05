// ---------- PINOS (sua montagem) ----------
const TRIG_MEIO  = D26; // sensor meio (direita)
const ECHO_MEIO  = D27;
const TRIG_CHEIO = D18; // sensor cheio (esquerda)
const ECHO_CHEIO = D19;
const LED = D12;

// ---------- CONFIGURA PINS ----------
pinMode(TRIG_MEIO,  "output");
pinMode(TRIG_CHEIO, "output");
pinMode(ECHO_MEIO,  "input");
pinMode(ECHO_CHEIO, "input");
pinMode(LED, "output");
digitalWrite(LED, 0);

// ---------- PARÂMETROS ----------
const TIMEOUT_SEC = 0.03; // 30 ms timeout para cada fase (ajuste se quiser)
const THRESHOLD_CM = 5;   // seu requisito: < 5 cm para ativar

// ---------- FUNÇÃO BLOQUEANTE (sem setWatch) ----------
function medirBlocking(trig, echo) {
  // Garante trig baixo
  digitalWrite(trig, 0);
  // curto delay para estabilizar
  var t0 = getTime();
  while (getTime() - t0 < 0.00002) {} // 20us

  // envia pulso de 10us no TRIG
  digitalPulse(trig, 1, 10);

  // espera subida (rising) com timeout
  var startWait = getTime();
  while (digitalRead(echo) === 0) {
    if (getTime() - startWait > TIMEOUT_SEC) return null;
  }
  var tRise = getTime();

  // espera a queda (falling) com timeout
  var startFall = getTime();
  while (digitalRead(echo) === 1) {
    if (getTime() - startFall > TIMEOUT_SEC) return null;
  }
  var tFall = getTime();

  var dur = tFall - tRise; // em segundos
  var dist = (dur * 34300) / 2; // cm
  return dist;
}

// ---------- LOOP PRINCIPAL (sequencial, seguro) ----------
function loopOnce() {
  // mede sensor MEIO
  var dMeio = medirBlocking(TRIG_MEIO, ECHO_MEIO);
  // espera um pouco antes do próximo trigger
  var t = getTime();
  while (getTime() - t < 0.03) {} // 30 ms

  // mede sensor CHEIO
  var dCheio = medirBlocking(TRIG_CHEIO, ECHO_CHEIO);

  // log amigável
  console.log("MEIO:", dMeio !== null ? dMeio.toFixed(1)+" cm" : "timeout",
              "| CHEIO:", dCheio !== null ? dCheio.toFixed(1)+" cm" : "timeout");

  // lógica do LED: acende só se AMBOS < THRESHOLD_CM
  if (dMeio !== null && dCheio !== null && dMeio < THRESHOLD_CM && dCheio < THRESHOLD_CM) {
    digitalWrite(LED, 1);
  } else {
    digitalWrite(LED, 0);
  }
}

// roda repetidamente com intervalo controlado
var mainInterval = setInterval(loopOnce, 400); // a cada 400 ms
