
let topValue = 56000;
let rightValue = 29700;
let leftValue = topValue - rightValue;
let currentScenario = "";
let deferredPrompt = null;

const scenarioTemplates = [
  (small, total) => `Di perpustakaan sekolah, terdapat ${formatNumber(small)} buah buku. Pihak sekolah menerima sumbangan beberapa buah buku lagi sehingga jumlah buku di perpustakaan menjadi ${formatNumber(total)} buah. Berapakah bilangan buku yang disumbangkan?`,
  (small, total) => `Koperasi sekolah mempunyai ${formatNumber(small)} botol air mineral. Kemudian, koperasi menerima bekalan baharu sehingga jumlah botol air menjadi ${formatNumber(total)} botol. Berapakah botol air yang diterima?`,
  (small, total) => `Stor sukan sekolah mempunyai ${formatNumber(small)} biji bola. Guru sukan membeli beberapa biji bola lagi sehingga jumlah semuanya menjadi ${formatNumber(total)} biji. Berapakah bilangan bola yang dibeli?`,
  (small, total) => `Di pusat sumber, terdapat ${formatNumber(small)} buah majalah. Beberapa buah majalah baharu tiba dan jumlah majalah menjadi ${formatNumber(total)} buah. Berapakah bilangan majalah baharu itu?`,
  (small, total) => `Sebelum waktu rehat, kantin sekolah telah menjual ${formatNumber(small)} keping kupon. Selepas itu, beberapa keping kupon lagi dijual sehingga jumlah keseluruhan menjadi ${formatNumber(total)} keping. Berapakah bilangan kupon yang dijual selepas itu?`,
  (small, total) => `Dewan sekolah mempunyai ${formatNumber(small)} buah kerusi yang telah disusun. Beberapa buah kerusi lagi dibawa masuk sehingga jumlah kerusi menjadi ${formatNumber(total)} buah. Berapakah bilangan kerusi yang dibawa masuk?`,
  (small, total) => `Taman sains sekolah mempunyai ${formatNumber(small)} pokok bunga. Murid-murid menanam beberapa pokok bunga lagi sehingga jumlah pokok bunga menjadi ${formatNumber(total)} pokok. Berapakah pokok bunga yang ditanam?`,
  (small, total) => `Seorang murid telah mengumpul ${formatNumber(small)} keping setem. Dia mendapat beberapa keping setem lagi daripada rakannya sehingga jumlah setemnya menjadi ${formatNumber(total)} keping. Berapakah bilangan setem yang diterima?`
];

function formatNumber(num) { return Number(num).toLocaleString('en-US'); }
function parseInput(value) { return Number(String(value).replace(/,/g, '').trim()); }
function isValidFourOrFiveDigits(num) { return num >= 1000 && num <= 99999; }

function setScenarioText() {
  const randomTemplate = scenarioTemplates[Math.floor(Math.random() * scenarioTemplates.length)];
  currentScenario = randomTemplate(rightValue, topValue);
  document.getElementById('scenarioText').textContent = currentScenario;
}

function updateDisplay() {
  document.getElementById('topNumber').textContent = formatNumber(topValue);
  document.getElementById('rightNumber').textContent = formatNumber(rightValue);
  document.getElementById('studentAnswer').value = "";
  document.getElementById('message').textContent = "";
  document.getElementById('workingBox').style.display = "none";
  document.getElementById('workingBox').innerHTML = "";
  document.getElementById('equationMessage').textContent = "";
  resetEquationBuilder();
}

function getEquationNumbers() { return [formatNumber(rightValue), formatNumber(topValue)]; }

function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function createTokenElement(text) {
  const token = document.createElement("div");
  token.className = "token";
  token.textContent = text;
  token.draggable = true;
  token.dataset.value = text;
  token.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", text); });
  return token;
}

function clearSlot(slot) {
  delete slot.dataset.value;
  slot.textContent = "?";
  slot.classList.remove("filled");
}

function removeTokenFromBank(value) {
  const tokens = document.querySelectorAll("#tokenBank .token");
  for (const token of tokens) {
    if (token.dataset.value === value) { token.remove(); break; }
  }
}

function returnToBank(value) {
  const bank = document.getElementById("tokenBank");
  bank.appendChild(createTokenElement(value));
}

function setupDropSlots() {
  const slots = document.querySelectorAll(".drop-slot");
  slots.forEach(slot => {
    slot.addEventListener("dragover", (e) => { e.preventDefault(); slot.classList.add("over"); });
    slot.addEventListener("dragleave", () => slot.classList.remove("over"));
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.classList.remove("over");
      const value = e.dataTransfer.getData("text/plain");
      if (!value) return;
      if (slot.dataset.value) returnToBank(slot.dataset.value);
      removeTokenFromBank(value);
      slot.dataset.value = value;
      slot.textContent = value;
      slot.classList.add("filled");
    });
    slot.addEventListener("click", () => {
      if (slot.dataset.value) {
        returnToBank(slot.dataset.value);
        clearSlot(slot);
      }
    });
  });
}

function resetEquationBuilder() {
  const bank = document.getElementById("tokenBank");
  bank.innerHTML = "";
  shuffleArray(getEquationNumbers()).forEach(tokenText => bank.appendChild(createTokenElement(tokenText)));
  document.querySelectorAll(".drop-slot").forEach(clearSlot);
  document.getElementById("equationMessage").textContent = "";
}

function checkEquation() {
  const knownSlot = document.querySelector('.drop-slot[data-slot="known"]');
  const totalSlot = document.querySelector('.drop-slot[data-slot="total"]');
  const msg = document.getElementById("equationMessage");
  if (!knownSlot.dataset.value || !totalSlot.dataset.value) {
    msg.style.color = "#c62828";
    msg.textContent = "Lengkapkan kedua-dua kotak nombor dahulu.";
    return;
  }
  const isCorrect = knownSlot.dataset.value === formatNumber(rightValue) && totalSlot.dataset.value === formatNumber(topValue);
  msg.style.color = isCorrect ? "#2e7d32" : "#c62828";
  msg.textContent = isCorrect ? "Bagus! Ayat matematik yang dibina adalah betul." : "Susunan nombor belum tepat. Cuba semula.";
}

function playSuccessSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99];
    let start = audioCtx.currentTime;
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.25, start + i * 0.18 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + i * 0.18 + 0.16);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start + i * 0.18);
      osc.stop(start + i * 0.18 + 0.16);
    });
  } catch (e) {}
}

function splitToFiveDigits(num) { return String(num).padStart(5, '0').split(''); }
function renderDigitCells(digits) { return digits.map(d => `<div class="digit-cell">${d}</div>`).join(''); }

function renderWorkingColumnLayout(topNum, knownNum, answerNum) {
  const topDigits = splitToFiveDigits(topNum);
  const knownDigits = splitToFiveDigits(knownNum);
  const answerDigits = splitToFiveDigits(answerNum);
  return `
    <div class="working-title">Jalan Kira</div>
    <div class="working-subtitle">Konsep pinjam hanya akan dipaparkan selepas butang “Dedahkan Jawapan” ditekan.</div>
    <div class="working-panel">
      <div class="working-step">Langkah 1: Tolak nombor pertama</div>
      <div class="column-layout">
        <div class="place-header">
          <div class="blank-cell"></div>
          <div class="place-cell">Puluh<br>Ribu</div>
          <div class="place-cell">Ribu</div>
          <div class="place-cell">Ratus</div>
          <div class="place-cell">Puluh</div>
          <div class="place-cell">Sa</div>
        </div>
        <div class="number-grid">
          <div class="sign-cell"></div>
          ${renderDigitCells(topDigits)}
        </div>
        <div class="number-grid">
          <div class="sign-cell">−</div>
          ${renderDigitCells(knownDigits)}
        </div>
        <div class="answer-line"></div>
        <div class="number-grid">
          <div class="sign-cell"></div>
          ${renderDigitCells(answerDigits)}
        </div>
      </div>
    </div>
  `;
}

function checkAnswer() {
  const studentValue = parseInput(document.getElementById('studentAnswer').value);
  const msg = document.getElementById('message');
  const working = document.getElementById('workingBox');
  if (isNaN(studentValue)) {
    msg.style.color = "#c62828";
    msg.textContent = "Sila masukkan jawapan dahulu.";
    working.style.display = "none";
    return;
  }
  if (studentValue === leftValue) {
    msg.style.color = "#2e7d32";
    msg.textContent = "Tahniah! Jawapan anda betul.";
    working.style.display = "block";
    working.innerHTML = `<strong>Ayat matematik:</strong><br>${formatNumber(rightValue)} + ${formatNumber(studentValue)} = ${formatNumber(topValue)}<br><br>${renderWorkingColumnLayout(topValue, rightValue, studentValue)}`;
    playSuccessSound();
  } else {
    msg.style.color = "#c62828";
    msg.textContent = "Belum tepat. Cuba lagi.";
    working.style.display = "block";
    working.innerHTML = `<strong>Petunjuk:</strong><br>Ayat matematik yang perlu dibina ialah ${formatNumber(rightValue)} + ____ = ${formatNumber(topValue)}.<br>Selepas itu, cari nilai anu dengan operasi tolak.`;
  }
}

function showAnswer() {
  const msg = document.getElementById('message');
  const working = document.getElementById('workingBox');
  document.getElementById('studentAnswer').value = formatNumber(leftValue);
  msg.style.color = "#ef6c00";
  msg.textContent = "Jawapan telah didedahkan.";
  working.style.display = "block";
  working.innerHTML = `<strong>Soalan penyelesaian masalah:</strong><br>${currentScenario}<br><br><strong>Ayat matematik yang betul:</strong><br>${formatNumber(rightValue)} + ${formatNumber(leftValue)} = ${formatNumber(topValue)}<br><br>${renderWorkingColumnLayout(topValue, rightValue, leftValue)}`;
}

function generateValidQuestion() {
  let valid = false;
  while (!valid) {
    const total = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
    const known = Math.floor(Math.random() * (total - 1000)) + 1000;
    const unknown = total - known;
    if (total <= 100000 && isValidFourOrFiveDigits(total) && isValidFourOrFiveDigits(known) && isValidFourOrFiveDigits(unknown)) {
      topValue = total;
      rightValue = known;
      leftValue = unknown;
      valid = true;
    }
  }
}

function generateNewQuestion() { generateValidQuestion(); setScenarioText(); updateDisplay(); }

function toggleTeacherPanel() {
  const panel = document.getElementById('teacherPanel');
  panel.style.display = panel.style.display === "flex" ? "none" : "flex";
}

function applyTeacherValues() {
  const newTop = parseInput(document.getElementById('teacherTop').value);
  const newRight = parseInput(document.getElementById('teacherRight').value);
  const msg = document.getElementById('message');
  if (isNaN(newTop) || isNaN(newRight) || newTop <= 0 || newRight < 0) {
    msg.style.color = "#c62828";
    msg.textContent = "Sila masukkan nombor yang sah.";
    return;
  }
  if (newRight >= newTop) {
    msg.style.color = "#c62828";
    msg.textContent = "Nombor bawah kanan mesti lebih kecil daripada nombor di atas.";
    return;
  }
  const newLeft = newTop - newRight;
  if (newTop > 100000 || !isValidFourOrFiveDigits(newTop) || !isValidFourOrFiveDigits(newRight) || !isValidFourOrFiveDigits(newLeft)) {
    msg.style.color = "#c62828";
    msg.textContent = "Gunakan nombor 4 atau 5 digit sahaja, dan jumlah mestilah tidak melebihi 100,000.";
    return;
  }
  topValue = newTop; rightValue = newRight; leftValue = newLeft;
  setScenarioText(); updateDisplay();
  msg.style.color = "#1565c0";
  msg.textContent = "Nilai baharu telah digunakan.";
}

function setupInstallPrompt() {
  const installBtn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'inline-block';
  });
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
  window.addEventListener('appinstalled', () => { installBtn.style.display = 'none'; });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

setupDropSlots();
setupInstallPrompt();
setScenarioText();
updateDisplay();
