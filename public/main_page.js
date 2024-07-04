document.addEventListener('DOMContentLoaded', function() {
    fetch('/getUserData')
        .then(response => response.json())
        .then(data => {
            document.getElementById('welcomeMessage').textContent = `Welcome, ${data.name}`;
            const lockerList = document.getElementById('lockerList');

            if (data.lockers.length > 0) {
                data.lockers.forEach(locker => {
                    // Create list item for locker
                    const listItem = document.createElement('li');
                    listItem.textContent = `Locker ID: ${locker}`;
                    
                    // Create buttons for operations
                    const releaseButton = document.createElement('button');
                    releaseButton.textContent = 'Release';
                    releaseButton.onclick = function() {
                        handleReleaseLocker(locker);
                    };

                    const extendButton = document.createElement('button');
                    extendButton.textContent = 'Extend';
                    extendButton.onclick = function() {
                        handleExtendLocker(locker);
                    };

                    // Create span for remaining time
                    const remainingTimeSpan = document.createElement('span');
                    remainingTimeSpan.className = 'remaining-time';
                    updateRemainingTime(locker, remainingTimeSpan);

                    // Append buttons and remaining time to list item
                    listItem.appendChild(releaseButton);
                    listItem.appendChild(extendButton);
                    listItem.appendChild(remainingTimeSpan);

                    // Append list item to lockerList
                    lockerList.appendChild(listItem);
                });
            } else {
                lockerList.textContent = 'No lockers assigned.';
            }
        })
        .catch(error => console.error('Error:', error));
});

function handleReleaseLocker(lockerId) {
    fetch('/releaseLocker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lockerId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Locker released successfully');
            refreshPage();
        } else {
            alert('Failed to release locker');
        }
    })
    .catch(error => console.error('Error:', error));
}

function handleExtendLocker(lockerId) {
    fetch('/extendLocker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lockerId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Locker extended successfully');
            refreshPage();
        } else {
            alert('Failed to extend locker');
        }
    })
    .catch(error => console.error('Error:', error));
}

//function updateRemainingTime(lockerId, remainingTimeElement) {
//    fetch(`/getLockerExpiryTime?lockerId=${lockerId}`)
//        .then(response => response.json())
//        .then(data => {
//            if (data.expiryTime) {
//                const expiryTime = new Date(data.expiryTime);
//                const currentTime = new Date();
//                const timeDifference = expiryTime.getTime() - currentTime.getTime();
//                if (timeDifference <= 0) {
//                    handleReleaseLocker(lockerId);
//                } else {
//                    const remainingHours = Math.floor(timeDifference / (1000 * 60 * 60));
//                    const remainingMinutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
//                    element.textContent = `Remaining Time: ${remainingHours}h ${remainingMinutes}m`;
//                    requestAnimationFrame(update);
//                }
//                remainingTimeElement.textContent = `Remaining Time: ${remainingHours}h ${remainingMinutes}m`;
//            } else {
//                remainingTimeElement.textContent = 'Expiry time not available';
//            }
//        })
//        .catch(error => {
//            console.error('Error fetching remaining time:', error);
//            remainingTimeElement.textContent = 'Error fetching remaining time';
//        });
//}
function updateRemainingTime(lockerId, remainingTimeElement) {
    fetch(`/getLockerExpiryTime?lockerId=${lockerId}`)
        .then(response => response.json())
        .then(data => {
            if (data.expiryTime) {
                const expiryTime = new Date(data.expiryTime);
                const currentTime = new Date();
                const timeDifference = expiryTime.getTime() - currentTime.getTime();

                if (timeDifference <= 0) {
                    handleReleaseLocker(lockerId);
                    remainingTimeElement.textContent = 'Locker released'; // Example message, adjust as needed
                } else {
                    const remainingHours = Math.floor(timeDifference / (1000 * 60 * 60));
                    const remainingMinutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
                    remainingTimeElement.textContent = `Remaining Time: ${remainingHours}h ${remainingMinutes}m`;
                    
                    // Request animation frame to update remaining time continuously
                    requestAnimationFrame(() => {
                        updateRemainingTime(lockerId, remainingTimeElement);
                    });
                }
            } else {
                remainingTimeElement.textContent = 'Expiry time not available';
            }
        })
        .catch(error => {
            console.error('Error fetching remaining time:', error);
            remainingTimeElement.textContent = 'Error fetching remaining time';
        });
}

function refreshPage() {
    window.location.reload();
}
