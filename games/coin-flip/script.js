document.addEventListener('DOMContentLoaded', () => {
    const coin = document.getElementById('coin');
    const flipButton = document.getElementById('flip-button');
    const statusMessage = document.getElementById('status-message');

    let lastResult = '';
    let consecutiveCount = 0;

    flipButton.addEventListener('click', () => {
        let result = '';

        if (consecutiveCount >= 2) {
            // Force a change after 2 consecutive results
            result = lastResult === 'heads' ? 'tails' : 'heads';
            consecutiveCount = 0;
        } else {
            result = Math.random() < 0.5 ? 'heads' : 'tails';
            if (result === lastResult) {
                consecutiveCount++;
            } else {
                consecutiveCount = 1;
            }
            lastResult = result;
        }

        const flipAnimationDuration = 3000;

        flipButton.disabled = true;
        statusMessage.textContent = "Flipping...";

        coin.style.transition = 'none';
        coin.style.transform = 'rotateY(0deg)';

        setTimeout(() => {
            coin.style.transition = `transform ${flipAnimationDuration / 1000}s cubic-bezier(0.68, -0.55, 0.27, 1.55)`;

            if (result === 'heads') {
                coin.style.transform = `rotateY(${360 * 10}deg)`;
            } else {
                coin.style.transform = `rotateY(${360 * 10 + 180}deg)`;
            }
        }, 50);

        setTimeout(() => {
            statusMessage.textContent = `It's ${result.toUpperCase()}!`;
            flipButton.disabled = false;
        }, flipAnimationDuration + 50);
    });
});
