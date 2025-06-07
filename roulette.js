// Roulette Game Configuration
const rewards = [
    { type: 'diamond', amount: 100, image: 'https://i.imgur.com/XkuVJUe.png' },
    { type: 'code', amount: 1, image: 'https://i.imgur.com/pLC9Cx9.png' },
    { type: 'pass', amount: 1, image: 'https://i.imgur.com/m5QZaSx.png' },
    { type: 'diamond', amount: 500, image: 'https://i.imgur.com/XkuVJUe.png' },
    { type: 'code', amount: 2, image: 'https://i.imgur.com/pLC9Cx9.png' },
    { type: 'diamond', amount: 1000, image: 'https://i.imgur.com/XkuVJUe.png' }
];

let userBalance = 0;
let isSpinning = false;

// Initialize roulette
function initRoulette() {
    const roulette = document.querySelector('.roulette');
    const spinButton = document.querySelector('.spin-button');
    const balanceAmount = document.querySelector('.balance-amount');
    const reloadBalance = document.querySelector('.reload-balance');
    const paymentModal = document.querySelector('.payment-modal');
    const confirmPayment = document.querySelector('.confirm-payment');
    const cancelPayment = document.querySelector('.cancel-payment');

    if (!roulette || !spinButton || !balanceAmount || !reloadBalance) {
        console.error('Required elements not found');
        return;
    }

    // Create initial roulette items
    roulette.innerHTML = '';
    rewards.forEach(reward => {
        const item = document.createElement('div');
        item.className = `roulette-item ${reward.type}`;
        item.innerHTML = `
            <img src="${reward.image}" alt="${reward.type}">
            <span>${reward.type === 'diamond' ? `${reward.amount} 💎` : 
                   reward.type === 'code' ? `${reward.amount} Código${reward.amount > 1 ? 's' : ''}` :
                   `${reward.amount} Passe`}</span>
        `;
        roulette.appendChild(item);
    });

    // Add event listeners
    reloadBalance.addEventListener('click', () => {
        const amount = prompt('Digite o valor a adicionar ($):');
        if (amount && !isNaN(amount)) {
            userBalance += parseInt(amount);
            updateBalance();
        }
    });

    spinButton.addEventListener('click', () => {
        if (userBalance >= 50 && !isSpinning) {
            if (paymentModal) {
                paymentModal.classList.add('show');
            } else {
                startSpin();
            }
        } else if (userBalance < 50) {
            alert('Saldo insuficiente! Adicione mais saldo para girar.');
        }
    });

    if (confirmPayment) {
        confirmPayment.addEventListener('click', () => {
            paymentModal.classList.remove('show');
            startSpin();
        });
    }

    if (cancelPayment) {
        cancelPayment.addEventListener('click', () => {
            paymentModal.classList.remove('show');
        });
    }

    // Update initial UI
    updateBalance();
}

// Update balance display
function updateBalance() {
    const balanceAmount = document.querySelector('.balance-amount');
    const spinButton = document.querySelector('.spin-button');
    if (balanceAmount) {
        balanceAmount.textContent = `$${userBalance}`;
    }
    if (spinButton) {
        spinButton.disabled = userBalance < 50 || isSpinning;
    }
}

// Start the spin animation
function startSpin() {
    if (isSpinning || userBalance < 50) return;
    
    const roulette = document.querySelector('.roulette');
    const spinResult = document.querySelector('.spin-result');
    
    if (!roulette || !spinResult) return;
    
    isSpinning = true;
    userBalance -= 50;
    updateBalance();
    
    // Reset classes and hide previous result
    roulette.className = 'roulette spinning';
    spinResult.classList.remove('show');
    
    // Randomly select a reward
    const winningIndex = Math.floor(Math.random() * rewards.length);
    const winningReward = rewards[winningIndex];
    
    // Calculate final position to show the winning reward
    setTimeout(() => {
        isSpinning = false;
        roulette.className = 'roulette';
        displayWinningResult(winningReward);
        updateBalance();
    }, 3000);
}

// Display the winning result
function displayWinningResult(reward) {
    const spinResult = document.querySelector('.spin-result');
    if (!spinResult) return;
    
    spinResult.innerHTML = `
        <img src="${reward.image}" alt="${reward.type}" style="height: 30px; vertical-align: middle;">
        Parabéns! Você ganhou ${reward.type === 'diamond' ? `${reward.amount} Diamantes` : 
                               reward.type === 'code' ? `${reward.amount} Código${reward.amount > 1 ? 's' : ''}` :
                               `${reward.amount} Passe de Batalha`}!
    `;
    spinResult.classList.add('show');
    
    // Save the reward to localStorage
    saveReward(reward);
}

// Save reward to localStorage
function saveReward(reward) {
    const rewards = JSON.parse(localStorage.getItem('rewards') || '[]');
    rewards.push({
        ...reward,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('rewards', JSON.stringify(rewards));
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', initRoulette);
