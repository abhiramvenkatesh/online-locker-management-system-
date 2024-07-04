const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const userFilePath = path.join(__dirname, 'users.txt');
const lockerFilePath = path.join(__dirname, 'lockers.txt');
const lockerDataFilePath = path.join(__dirname, 'locker_data.txt');

app.use(bodyParser.json());
app.use(express.static('public'));

let currentUserPhone = '';

app.post('/login', (req, res) => {
    const { phone } = req.body;
    currentUserPhone = phone;

    if (!fs.existsSync(userFilePath)) {
        fs.writeFileSync(userFilePath, '', 'utf8');
    }

    const data = fs.readFileSync(userFilePath, 'utf8');
    const users = data.split('\n').filter(Boolean).map(line => {
        const [storedPhone, storedName] = line.split(',');
        return { phone: storedPhone, name: storedName };
    });

    const user = users.find(user => user.phone === phone);

    if (!user) {
        res.json({ success: true, newUser: true });
    } else {
        res.json({ success: true, newUser: false });
    }
});

app.post('/register', (req, res) => {
    const { phone, name } = req.body;

    const newUser = `${phone},${name}\n`;
    fs.appendFileSync(userFilePath, newUser, 'utf8');

    res.json({ success: true });
});

app.get('/getUserData', (req, res) => {
    if (!fs.existsSync(userFilePath)) {
        return res.json({ success: false, message: 'User file not found' });
    }

    const userData = fs.readFileSync(userFilePath, 'utf8');
    const users = userData.split('\n').filter(Boolean).map(line => {
        const [phone, name] = line.split(',');
        return { phone, name };
    });

    const user = users.find(user => user.phone === currentUserPhone);

    if (!fs.existsSync(lockerFilePath)) {
        fs.writeFileSync(lockerFilePath, '', 'utf8');
    }

    const lockerData = fs.readFileSync(lockerFilePath, 'utf8');
    const lockers = lockerData.split('\n').filter(Boolean).map(line => {
        const [phone, locker] = line.split(',');
        return { phone, locker };
    });

    const userLockers = lockers.filter(locker => locker.phone === currentUserPhone).map(locker => locker.locker);

    if (user) {
        res.json({ success: true, name: user.name, lockers: userLockers });
    } else {
        res.json({ success: false, message: 'User not found' });
    }
});

app.get('/getLockerData', (req, res) => {
    if (!fs.existsSync(lockerDataFilePath)) {
        fs.writeFileSync(lockerDataFilePath, '', 'utf8');
    }

    const lockerData = fs.readFileSync(lockerDataFilePath, 'utf8');
    const occupiedLockers = lockerData.split('\n').filter(Boolean).map(line => {
        const [lockerId, expiryTime] = line.split(',');
        return { lockerId, expiryTime };
    });

    res.json({ occupiedLockers });
});

app.get('/getLockerExpiryTime', (req, res) => {
    const { lockerId } = req.query;

    if (!fs.existsSync(lockerDataFilePath)) {
        fs.writeFileSync(lockerDataFilePath, '', 'utf8');
    }

    const lockerData = fs.readFileSync(lockerDataFilePath, 'utf8');
    const occupiedLockers = lockerData.split('\n').filter(Boolean).map(line => {
        const [id, expiryTime] = line.split(',');
        return { lockerId: id, expiryTime };
    });

    const locker = occupiedLockers.find(locker => locker.lockerId === lockerId);
    if (locker) {
        res.json(locker);
    } else {
        res.status(404).json({ success: false, message: 'Locker not found' });
    }
});

app.post('/selectLocker', (req, res) => {
    const { lockerId, duration } = req.body;
    const expiryTime = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();

    // Add the locker to locker_data.txt as occupied with expiry time
    fs.appendFileSync(lockerDataFilePath, `${lockerId},${expiryTime}\n`, 'utf8');

    // Add the locker to lockers.txt for the current user
    fs.appendFileSync(lockerFilePath, `${currentUserPhone},${lockerId}\n`, 'utf8');

    res.json({ success: true });
});

app.post('/releaseLocker', (req, res) => {
    const { lockerId } = req.body;

    // Remove locker from locker_data.txt
    const lockerData = fs.readFileSync(lockerDataFilePath, 'utf8');
    const updatedLockerData = lockerData.split('\n').filter(line => {
        return !line.startsWith(`${lockerId},`);
    }).join('\n') + '\n';
    fs.writeFileSync(lockerDataFilePath, updatedLockerData, 'utf8');

    // Remove locker from lockers.txt
    const lockerFileData = fs.readFileSync(lockerFilePath, 'utf8');
    const updatedLockerFileData = lockerFileData.split('\n').filter(line => {
        return !line.includes(`,${lockerId}`);
    }).join('\n') + '\n';
    fs.writeFileSync(lockerFilePath, updatedLockerFileData, 'utf8');

    res.json({ success: true });
});

app.post('/extendLocker', (req, res) => {
    const { lockerId } = req.body;

    const lockerData = fs.readFileSync(lockerDataFilePath, 'utf8');
    const updatedLockerData = lockerData.split('\n').filter(Boolean).map(line => {
        if (line.startsWith(`${lockerId},`)) {
            const [id, expiryTime] = line.split(',');
            const newExpiryTime = new Date(expiryTime);
            newExpiryTime.setHours(newExpiryTime.getHours() + 24);
            return `${id},${newExpiryTime.toISOString()}`;
        }
        return line;
    }).join('\n') + '\n';
    fs.writeFileSync(lockerDataFilePath, updatedLockerData, 'utf8');

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
