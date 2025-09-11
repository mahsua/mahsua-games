// JavaScript functionality for handling game launches
document.addEventListener('DOMContentLoaded', () => {
    const startPlayingBtn = document.getElementById('startPlayingBtn');
    const gameCards = document.querySelectorAll('.game-card');
    const modal = document.getElementById('gameModal');
    const gameFrame = document.getElementById('gameFrame');
    const closeBtn = document.querySelector('.close-btn');

    // Opens the modal with the first game URL when "Start Playing Now" is clicked
    startPlayingBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Prevents the link from navigating
        const firstGameUrl = gameCards[0]?.getAttribute('data-game-url');
        if (firstGameUrl) {
            gameFrame.src = firstGameUrl;
            modal.style.display = 'flex';
        }
    });

    // Loop through each game card and add a click event listener
    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const gameUrl = card.getAttribute('data-game-url');
            if (gameUrl) {
                // Set the iframe's source to the game URL
                gameFrame.src = gameUrl;
                // Display the modal
                modal.style.display = 'flex';
            }
        });
    });

    // Close the modal when the close button is clicked
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        // Stop the game by setting the iframe src to an empty string
        gameFrame.src = '';
    });

    // Close the modal if the user clicks anywhere outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            gameFrame.src = '';
        }
    });
});
