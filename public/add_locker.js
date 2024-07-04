let selectedLockerId = null;

document.addEventListener('DOMContentLoaded', function() {
    fetch('/getLockerData')
        .then(response => response.json())
        .then(data => {
            const lockerContainer = document.getElementById('lockerContainer');
            for (let i = 1; i <= 16; i++) {
                const locker = document.createElement('div');
                locker.className = 'locker';
                locker.textContent = `Locker ${i}`;
                const occupiedLocker = data.occupiedLockers.find(locker => locker.lockerId === i.toString());

                if (occupiedLocker) {
                    locker.classList.add('occupied');
                } else {
                    locker.addEventListener('click', function() {
                        if (selectedLockerId !== null) {
                            document.querySelector(`.locker.selected`).classList.remove('selected');
                        }
                        selectedLockerId = i;
                        locker.classList.add('selected');
                    });
                }
                lockerContainer.appendChild(locker);
            }
        })
        .catch(error => console.error('Error:', error));
});

function selectLocker() {
    const duration = document.getElementById('duration').value;
    if (!selectedLockerId) {
        alert('Please select a locker first.');
        return;
    }
    if (!duration || duration <= 0) {
        alert('Please enter a valid duration.');
        return;
    }

    fetch('/selectLocker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lockerId: selectedLockerId, duration: duration })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = 'main_page.html';
        } else {
            alert('Failed to select locker');
        }
    })
    .catch(error => console.error('Error:', error));
}
