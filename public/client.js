document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const videoElement = document.getElementById('videoElement');
    const statusDiv = document.getElementById('status');
    const logDiv = document.getElementById('log');

    let ws;
    let mediaRecorder;

    async function startSession() {
        try {
            // 1. Minta akses kamera dan mikrofon (WebRTC)
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoElement.srcObject = stream;
            videoElement.onloadedmetadata = () => videoElement.play();

            // 2. Buat koneksi WebSocket
            ws = new WebSocket('ws://localhost:3001');

            ws.onopen = () => {
                logMessage('Koneksi WebSocket terbuka.');
                statusDiv.textContent = 'Terhubung. Berbicara dengan Gemini...';
                startButton.disabled = true;
                stopButton.disabled = false;

                // 3. Mulai merekam stream audio/video
                const options = { mimeType: 'video/webm; codecs=vp9,opus' };
                mediaRecorder = new MediaRecorder(stream, options);
                mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        // Kirim potongan data ke server melalui WebSocket
                        ws.send(event.data);
                    }
                };
                mediaRecorder.start(1000); // Kirim potongan setiap 1 detik
            };

            ws.onmessage = event => {
                // 4. Terima respons dari AI
                const responseText = event.data;
                logMessage(`Gemini: ${responseText}`);

                // 5. Ubah teks menjadi suara (Speech Synthesis)
                const utterance = new SpeechSynthesisUtterance(responseText);
                speechSynthesis.speak(utterance);
            };

            ws.onclose = () => {
                logMessage('Koneksi WebSocket terputus.');
                statusDiv.textContent = 'Terputus. Siap...';
                startButton.disabled = false;
                stopButton.disabled = true;
            };

            ws.onerror = error => {
                logMessage('WebSocket error:', error);
                statusDiv.textContent = 'Error. Siap...';
            };
        } catch (error) {
            logMessage('Gagal mengakses media perangkat:', error);
            statusDiv.textContent = 'Gagal. Silakan periksa izin kamera/mikrofon.';
        }
    }

    function stopSession() {
        if (ws) {
            ws.close();
        }
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
    }

    function logMessage(message) {
        const p = document.createElement('p');
        p.textContent = message;
        logDiv.appendChild(p);
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    startButton.addEventListener('click', startSession);
    stopButton.addEventListener('click', stopSession);
});
