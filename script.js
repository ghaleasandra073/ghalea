// Data dan Konfigurasi
let currentQueueNumber = 1;
let currentOperatorId = 1;
let callHistory = [];
let isSpeaking = false;

// Data operator
const operators = [
    { id: 1, name: "OPERATOR 01", desc: "Administrasi Umum", status: "available" },
    { id: 2, name: "OPERATOR 02", desc: "Verifikasi Berkas", status: "available" },
    { id: 3, name: "OPERATOR 03", desc: "Tes Akademik", status: "available" },
    { id: 4, name: "OPERATOR 04", desc: "Tes Wawancara", status: "available" },
    { id: 5, name: "OPERATOR 05", desc: "Psikotes", status: "available" },
    { id: 6, name: "OPERATOR 06", desc: "Pendaftaran Ulang", status: "available" },
    { id: 7, name: "OPERATOR 07", desc: "Pembayaran", status: "available" },
    { id: 8, name: "OPERATOR 08", desc: "Konsultasi", status: "available" }
];

// DOM Elements
const queueInput = document.getElementById('queue-input');
const operatorSelect = document.getElementById('operator-select');
const callBtn = document.getElementById('call-btn');
const repeatBtn = document.getElementById('repeat-btn');
const decreaseBtn = document.getElementById('decrease-btn');
const increaseBtn = document.getElementById('increase-btn');
const resetBtn = document.getElementById('reset-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const currentQueueElement = document.getElementById('current-queue');
const currentOperatorElement = document.getElementById('current-operator');
const operatorDescElement = document.getElementById('operator-desc');
const historyList = document.getElementById('history-list');
const historyCount = document.getElementById('history-count');
const operatorsGrid = document.getElementById('operators-grid');
const dateDisplay = document.getElementById('date-display');
const timeDisplay = document.getElementById('time-display');
const statusDisplay = document.getElementById('status-display');
const announcementSound = document.getElementById('announcement-sound');
const notificationSound = document.getElementById('notification-sound');

// Fungsi untuk update tanggal dan waktu
function updateDateTime() {
    const now = new Date();
    
    // Format tanggal Indonesia
    const optionsDate = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const formattedDate = now.toLocaleDateString('id-ID', optionsDate);
    dateDisplay.textContent = formattedDate;
    
    // Format waktu
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}

// Fungsi untuk memuat operator
function loadOperators() {
    operatorsGrid.innerHTML = '';
    
    operators.forEach(operator => {
        const operatorCard = document.createElement('div');
        operatorCard.className = `operator-card ${operator.id === currentOperatorId ? 'active' : ''}`;
        operatorCard.innerHTML = `
            <div class="operator-icon">
                <i class="fas fa-user-tie"></i>
            </div>
            <h4>${operator.name}</h4>
            <p>${operator.desc}</p>
            <div class="operator-status status-${operator.status}">
                ${operator.status === 'available' ? 'TERSEDIA' : 'SIBUK'}
            </div>
        `;
        
        operatorCard.addEventListener('click', () => {
            operatorSelect.value = operator.id;
            currentOperatorId = operator.id;
            updateDisplay();
            updateOperatorCards();
        });
        
        operatorsGrid.appendChild(operatorCard);
    });
}

// Fungsi untuk update tampilan operator
function updateOperatorCards() {
    const operatorCards = document.querySelectorAll('.operator-card');
    operatorCards.forEach((card, index) => {
        const operatorId = index + 1;
        if (operatorId === currentOperatorId) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

// Fungsi untuk update tampilan
function updateDisplay() {
    currentQueueElement.textContent = currentQueueNumber.toString().padStart(3, '0');
    queueInput.value = currentQueueNumber;
    
    const selectedOperator = operators.find(op => op.id === currentOperatorId);
    if (selectedOperator) {
        currentOperatorElement.textContent = selectedOperator.name;
        operatorDescElement.textContent = selectedOperator.desc;
    }
}

// Fungsi untuk memainkan suara pengumuman bandara
async function playAnnouncementSound() {
    try {
        // URL audio pengumuman bandara
        const audioUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-airport-announcement-875.mp3';
        
        // Set source audio
        announcementSound.src = audioUrl;
        
        // Play audio
        await announcementSound.play();
        
        // Tunggu audio selesai
        return new Promise(resolve => {
            announcementSound.onended = resolve;
        });
    } catch (error) {
        console.log("Error memainkan suara pengumuman:", error);
        return Promise.resolve();
    }
}

// Fungsi untuk membacakan nomor antrian
function speakQueueNumber(queueNumber, operatorName) {
    if (isSpeaking) {
        speechSynthesis.cancel();
    }
    
    const text = `Perhatian. Nomor antrian ${queueNumber}, silahkan menuju ke ${operatorName} untuk proses seleksi penerimaan siswa baru. Terima kasih.`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    
    // Cari suara wanita
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
        voice.lang.includes('id') || 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('woman')
    );
    
    if (femaleVoice) {
        utterance.voice = femaleVoice;
    }
    
    // Play notification sound before speaking
    notificationSound.currentTime = 0;
    notificationSound.play().catch(e => console.log("Notification sound error:", e));
    
    isSpeaking = true;
    
    utterance.onend = () => {
        isSpeaking = false;
    };
    
    speechSynthesis.speak(utterance);
}

// Fungsi untuk memanggil antrian
async function callQueue() {
    const queueNumber = currentQueueNumber.toString().padStart(3, '0');
    const operatorName = operators.find(op => op.id === currentOperatorId).name;
    const operatorDesc = operators.find(op => op.id === currentOperatorId).desc;
    
    // Update tampilan
    currentQueueElement.textContent = queueNumber;
    currentOperatorElement.textContent = operatorName;
    operatorDescElement.textContent = operatorDesc;
    statusDisplay.innerHTML = '<i class="fas fa-circle"></i> SEDANG DILAYANI';
    
    // Tambahkan ke riwayat
    addToHistory(queueNumber, operatorName);
    
    // Update status operator menjadi sibuk
    updateOperatorStatus(currentOperatorId, 'busy');
    
    // Mainkan suara pengumuman bandara terlebih dahulu
    await playAnnouncementSound();
    
    // Tunggu 1 detik sebelum membacakan nomor antrian
    setTimeout(() => {
        speakQueueNumber(queueNumber, operatorName);
    }, 1000);
    
    // Auto increment antrian
    currentQueueNumber++;
    updateDisplay();
    
    // Kembalikan status operator menjadi tersedia setelah 3 menit
    setTimeout(() => {
        updateOperatorStatus(currentOperatorId, 'available');
    }, 180000);
}

// Fungsi untuk update status operator
function updateOperatorStatus(operatorId, status) {
    const operator = operators.find(op => op.id === operatorId);
    if (operator) {
        operator.status = status;
        loadOperators();
    }
}

// Fungsi untuk menambahkan ke riwayat
function addToHistory(queueNumber, operatorName) {
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    const date = now.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    const historyItem = {
        id: Date.now(),
        time: `${date} ${time}`,
        queueNumber,
        operatorName
    };
    
    callHistory.unshift(historyItem);
    
    // Batasi riwayat menjadi 50 item
    if (callHistory.length > 50) {
        callHistory.pop();
    }
    
    updateHistoryDisplay();
    saveHistory();
}

// Fungsi untuk update tampilan riwayat
function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    if (callHistory.length === 0) {
        historyList.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-clock"></i>
                <p>Belum ada riwayat pemanggilan</p>
            </div>
        `;
    } else {
        callHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-time">${item.time}</div>
                <div class="history-queue">${item.queueNumber}</div>
                <div class="history-operator">${item.operatorName}</div>
            `;
            historyList.appendChild(historyItem);
        });
    }
    
    historyCount.textContent = callHistory.length;
}

// Fungsi untuk menyimpan riwayat ke localStorage
function saveHistory() {
    localStorage.setItem('queueHistory', JSON.stringify(callHistory));
}

// Fungsi untuk memuat riwayat dari localStorage
function loadHistory() {
    const savedHistory = localStorage.getItem('queueHistory');
    if (savedHistory) {
        callHistory = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
}

// Fungsi untuk mengulangi panggilan terakhir
function repeatLastCall() {
    if (callHistory.length > 0) {
        const lastCall = callHistory[0];
        
        // Update tampilan dengan data terakhir
        currentQueueElement.textContent = lastCall.queueNumber;
        currentOperatorElement.textContent = lastCall.operatorName;
        
        // Mainkan suara pengumuman dan baca nomor antrian
        playAnnouncementSound().then(() => {
            setTimeout(() => {
                speakQueueNumber(lastCall.queueNumber, lastCall.operatorName);
            }, 1000);
        });
    } else {
        alert("Belum ada riwayat pemanggilan untuk diulang.");
    }
}

// Event Listeners
callBtn.addEventListener('click', callQueue);

repeatBtn.addEventListener('click', repeatLastCall);

decreaseBtn.addEventListener('click', () => {
    if (currentQueueNumber > 1) {
        currentQueueNumber--;
        updateDisplay();
    }
});

increaseBtn.addEventListener('click', () => {
    if (currentQueueNumber < 999) {
        currentQueueNumber++;
        updateDisplay();
    }
});

resetBtn.addEventListener('click', () => {
    if (confirm("Reset nomor antrian ke 1?")) {
        currentQueueNumber = 1;
        updateDisplay();
    }
});

queueInput.addEventListener('change', () => {
    let value