// Add this to your HTML files after the existing scripts
function checkNavigation(event) {
    const userData = sessionStorage.getItem('userData');
    const currentPage = window.location.pathname;
    
    // Allow access to index.html always
    if (currentPage.includes('index.html')) return true;
    
    if (!userData && !currentPage.includes('index.html')) {
        event.preventDefault();
        alert('Silakan masukkan data diri Anda terlebih dahulu');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Add event listener to all navigation links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.getElementsByTagName('a');
    for (let link of links) {
        link.addEventListener('click', function(e) {
            if (!link.hasAttribute('data-skip-check')) {
                checkNavigation(e);
            }
        });
    }
});