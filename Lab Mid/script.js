const profilePic = document.getElementById('profile-pic');
const introText = document.getElementById('intro-text');

profilePic.addEventListener('mouseover', () => {
    introText.style.display = 'block'; // Show the introduction text
});

profilePic.addEventListener('mouseout', () => {
    introText.style.display = 'none'; // Hide the introduction text
});