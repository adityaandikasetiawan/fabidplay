// Timer 5 detik dan redirect ke idplay.co.id dengan countdown
window.onload = function() {
    let timeLeft = 5;
    const timerDisplay = document.createElement('div');
    timerDisplay.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.7); color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px; transition: opacity 0.3s;';
    document.body.appendChild(timerDisplay);

    const countdown = setInterval(() => {
        timerDisplay.textContent = `Redirect dalam ${timeLeft} detik...`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(countdown);
            timerDisplay.style.opacity = '0';
            window.location.href = 'https://idplay.co.id';
        }
    }, 1000);
}