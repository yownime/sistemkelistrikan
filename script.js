document.addEventListener('DOMContentLoaded', function() {
    // Initialize progress if not exists
    if (!localStorage.getItem('learningProgress')) {
        localStorage.setItem('learningProgress', JSON.stringify({
            panduan: false,
            materi: false,
            quiz: false,
            simulasi: false
        }));
    }

    const progress = JSON.parse(localStorage.getItem('learningProgress'));
    const menuCards = document.querySelectorAll('.menu-card');
    
    // Check and update menu states
    menuCards.forEach(card => {
        const menuType = card.getAttribute('data-menu');
        
        // Add click handler
        card.addEventListener('click', (e) => {
            if (card.classList.contains('locked')) {
                e.preventDefault();
                alert('Please complete the previous section first!');
            }
        });

        // Update menu state based on progress
        updateMenuState(card, menuType, progress);
    });
});

function updateMenuState(card, menuType, progress) {
    switch(menuType) {
        case 'panduan':
            // Panduan is always unlocked
            break;
        case 'materi':
            if (progress.panduan) {
                card.classList.remove('locked');
            }
            break;
        case 'quiz':
            if (progress.panduan && progress.materi) {
                card.classList.remove('locked');
            }
            break;
        case 'simulasi':
            if (progress.panduan && progress.materi && progress.quiz) {
                card.classList.remove('locked');
            }
            break;
    }
}

// Function to mark section as completed (call this at the end of each section)
function completeSection(sectionName) {
    const progress = JSON.parse(localStorage.getItem('learningProgress'));
    progress[sectionName] = true;
    localStorage.setItem('learningProgress', JSON.stringify(progress));
}