const checkInButton = document.getElementById('checkInButton');
const messageDisplay = document.getElementById('message');
const teamSelect = document.getElementById('teamSelect');
const passwordSection = document.getElementById('passwordSection');
const passwordSubmit = document.getElementById('passwordSubmit');
const teamPasswordInput = document.getElementById('teamPassword');

const correctPasswords = {
    'チームA': 'ni4EU',
    'チームB': 'dPLrO'
};

// 高松駅の座標
const locations = {
    "高松駅": { lat: 34.3428, lng: 134.0466 }
};

// LINE Notifyの設定
const LINE_NOTIFY_TOKEN = 'ELzCsKFE49loAcUaIIfSIOaZZPgDp45Hsn0JU13vslM'; // LINE Notifyのトークン

// チーム選択時にパスワード入力セクションを表示
teamSelect.addEventListener('change', () => {
    passwordSection.style.display = teamSelect.value ? 'block' : 'none';
    checkInButton.style.display = 'none'; // チェックインボタンは非表示に
    messageDisplay.textContent = ''; // メッセージをリセット
});

// パスワード確認処理
passwordSubmit.addEventListener('click', () => {
    const selectedTeam = teamSelect.value;
    const enteredPassword = teamPasswordInput.value;

    if (enteredPassword === correctPasswords[selectedTeam]) {
        messageDisplay.textContent = `${selectedTeam}のパスワードが正しいです。チェックイン可能です。`;
        checkInButton.style.display = 'block'; // パスワードが正しければチェックインボタンを表示
    } else {
        messageDisplay.textContent = 'パスワードが間違っています。';
        checkInButton.style.display = 'none'; // 間違っている場合はボタンを表示しない
    }
});

// チェックインボタンの処理
checkInButton.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        let checkedIn = false;

        for (const [locationName, coords] of Object.entries(locations)) {
            const distance = getDistance(userLat, userLng, coords.lat, coords.lng);
            if (distance <= 0.1) { // 半径100mを0.1kmとして計算
                sendLineNotify(`${teamSelect.value}が${locationName}にチェックインしました`);
                messageDisplay.textContent = `${teamSelect.value}が${locationName}にチェックインしました`;
                checkedIn = true;
                break;
            }
        }

        if (!checkedIn) {
            messageDisplay.textContent = 'チェックインできる位置ではありません。';
        }
    }, (error) => {
        messageDisplay.textContent = '位置情報の取得に失敗しました。';
        console.error(error);
    });
});

// 緯度・経度の距離を計算する関数
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球の半径 (km)
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 距離を返す (km)
}

// 度をラジアンに変換する関数
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// LINE Notifyにメッセージを送信する関数
function sendLineNotify(message) {
    fetch('https://notify-api.line.me/api/notify', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `message=${encodeURIComponent(message)}`,
    })
    .then(response => {
        if (!response.ok) {
            console.error('LINE Notify error:', response);
        }
    })
    .catch(error => console.error('Fetch error:', error));
}
