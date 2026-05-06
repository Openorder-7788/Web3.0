const API_BASE = '/api/test';
const AUTH_BASE = '/api/auth';

let currentUser = null;
let authToken = null;

function loadSession() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    if (token && user) {
        try {
            authToken = token;
            currentUser = JSON.parse(user);
            return true;
        } catch (e) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        }
    }
    return false;
}

function saveSession(token, user) {
    authToken = token;
    currentUser = user;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
}

function clearSession() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
}

function authHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
}

const loginPage = document.getElementById('login-page');
const startPage = document.getElementById('start-page');
const testPage = document.getElementById('test-page');
const resultPage = document.getElementById('result-page');

function showLoginPage() {
    loginPage.classList.add('active');
    startPage.classList.remove('active');
    testPage.classList.remove('active');
    resultPage.classList.remove('active');
}

function showStartPage() {
    loginPage.classList.remove('active');
    startPage.classList.add('active');
    testPage.classList.remove('active');
    resultPage.classList.remove('active');
    updateUserBar();
}

function updateUserBar() {
    const userBar = document.getElementById('user-bar');
    const userInfo = document.getElementById('user-info');
    if (currentUser) {
        const display = currentUser.username || currentUser.email || currentUser.did || currentUser.datadidUid;
        userInfo.textContent = display;
        userBar.style.display = 'flex';
    } else {
        userBar.style.display = 'none';
    }
}

function showLoginError(msg) {
    const el = document.getElementById('login-error');
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
}

function hideLoginError() {
    document.getElementById('login-error').classList.add('hidden');
}

document.querySelectorAll('.login-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.login-form').forEach(f => f.classList.add('hidden'));
        const target = tab.getAttribute('data-tab');
        document.getElementById(`login-form-${target}`).classList.remove('hidden');
        hideLoginError();
    });
});

document.getElementById('ep-login-btn').addEventListener('click', async () => {
    const email = document.getElementById('ep-email').value.trim();
    const password = document.getElementById('ep-password').value;
    if (!email || !password) { showLoginError('Please enter email and password'); return; }

    const btn = document.getElementById('ep-login-btn');
    btn.disabled = true;
    btn.textContent = 'Logging in...';
    try {
        const res = await fetch(`${AUTH_BASE}/login/email-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
            saveSession(data.data.token, data.data.user);
            showStartPage();
        } else {
            showLoginError(data.message || 'Login failed');
        }
    } catch (e) {
        showLoginError('Network error, please try again');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Login';
    }
});

document.getElementById('ep-register-btn').addEventListener('click', () => {
    document.getElementById('register-overlay').classList.remove('hidden');
    hideLoginError();
});

document.getElementById('reg-cancel-btn').addEventListener('click', () => {
    document.getElementById('register-overlay').classList.add('hidden');
});

document.getElementById('reg-send-btn').addEventListener('click', async () => {
    const email = document.getElementById('reg-email').value.trim();
    if (!email) { showLoginError('Please enter your email'); return; }

    const btn = document.getElementById('reg-send-btn');
    btn.disabled = true;
    btn.textContent = 'Sent';
    try {
        const res = await fetch(`${AUTH_BASE}/send-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!data.success) showLoginError(data.message || 'Failed to send code');
    } catch (e) {
        showLoginError('Network error');
    } finally {
        setTimeout(() => { btn.disabled = false; btn.textContent = 'Send Code'; }, 60000);
    }
});

document.getElementById('reg-submit-btn').addEventListener('click', async () => {
    const email = document.getElementById('reg-email').value.trim();
    const code = document.getElementById('reg-code').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (!email || !code || !password || !confirm) { showLoginError('Please fill in all fields'); return; }
    if (password !== confirm) { showLoginError('Passwords do not match'); return; }

    const btn = document.getElementById('reg-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Registering...';
    try {
        const res = await fetch(`${AUTH_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, password })
        });
        const data = await res.json();
        if (data.success) {
            saveSession(data.data.token, data.data.user);
            document.getElementById('register-overlay').classList.add('hidden');
            showStartPage();
        } else {
            showLoginError(data.message || 'Registration failed');
        }
    } catch (e) {
        showLoginError('Network error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Register';
    }
});

document.getElementById('ec-send-btn').addEventListener('click', async () => {
    const email = document.getElementById('ec-email').value.trim();
    if (!email) { showLoginError('Please enter your email'); return; }

    const btn = document.getElementById('ec-send-btn');
    btn.disabled = true;
    btn.textContent = 'Sent';
    try {
        const res = await fetch(`${AUTH_BASE}/send-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!data.success) showLoginError(data.message || 'Failed to send code');
    } catch (e) {
        showLoginError('Network error');
    } finally {
        setTimeout(() => { btn.disabled = false; btn.textContent = 'Send Code'; }, 60000);
    }
});

document.getElementById('ec-login-btn').addEventListener('click', async () => {
    const email = document.getElementById('ec-email').value.trim();
    const code = document.getElementById('ec-code').value.trim();
    if (!email || !code) { showLoginError('Please enter email and verification code'); return; }

    const btn = document.getElementById('ec-login-btn');
    btn.disabled = true;
    btn.textContent = 'Logging in...';
    try {
        const res = await fetch(`${AUTH_BASE}/login/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });
        const data = await res.json();
        if (data.success) {
            saveSession(data.data.token, data.data.user);
            showStartPage();
        } else {
            showLoginError(data.message || 'Login failed');
        }
    } catch (e) {
        showLoginError('Network error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Login';
    }
});

document.getElementById('evm-login-btn').addEventListener('click', async () => {
    if (!window.ethereum) {
        showLoginError('MetaMask not detected. Please install MetaMask extension.');
        return;
    }

    const btn = document.getElementById('evm-login-btn');
    btn.disabled = true;
    btn.textContent = 'Connecting...';

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];

        const challengeRes = await fetch(`${AUTH_BASE}/login/evm-challenge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address })
        });
        const challengeData = await challengeRes.json();
        if (!challengeData.success) {
            showLoginError(challengeData.message || 'Failed to get challenge');
            return;
        }

        const message = challengeData.data.message;
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, address]
        });

        const loginRes = await fetch(`${AUTH_BASE}/login/evm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, signature })
        });
        const loginData = await loginRes.json();
        if (loginData.success) {
            saveSession(loginData.data.token, loginData.data.user);
            showStartPage();
        } else {
            showLoginError(loginData.message || 'Wallet login failed');
        }
    } catch (e) {
        if (e.code === 4001) {
            showLoginError('You rejected the signature request');
        } else {
            showLoginError('Wallet connection failed: ' + (e.message || 'Unknown error'));
        }
    } finally {
        btn.disabled = false;
        btn.textContent = 'Connect Wallet';
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    clearSession();
    showLoginPage();
});

if (loadSession()) {
    showStartPage();
} else {
    showLoginPage();
}

const questionBank = {
    Risk: [
        {
            id: 'r1',
            text: 'Found a new project with no audit report, but KOLs are shilling it hard on Twitter. What do you do?',
            options: [
                { text: 'Go all in! Hesitating for a second is disrespectful to wealth. If it goes to zero, it\'s just tuition.', score: { degen: 2, safe: 0 } },
                { text: 'Dip 0.1 ETH to test the waters, watch community reaction, and pull out if it dumps.', score: { degen: 1, safe: 0 } },
                { text: 'Add to watchlist, wait three months to confirm no rug and an audit report exists.', score: { degen: 0, safe: 1 } },
                { text: 'I don\'t touch shitcoins. My money only goes into time-tested blue-chip projects.', score: { degen: 0, safe: 2 } }
            ]
        },
        {
            id: 'r2',
            text: 'Where do you usually store your private key mnemonic?',
            options: [
                { text: 'Don\'t bother memorizing — keep it in a hot wallet for easy access to shitcoins. Lose it, earn more.', score: { degen: 2, safe: 0 } },
                { text: 'Memorized or saved in phone notes, as long as I don\'t share it with anyone.', score: { degen: 1, safe: 0 } },
                { text: 'Written on paper, locked in a drawer, and occasionally use a hardware wallet.', score: { degen: 0, safe: 1 } },
                { text: 'Engraved on fireproof, magnetic-resistant steel, stored in a bank safe with multi-signature.', score: { degen: 0, safe: 2 } }
            ]
        },
        {
            id: 'r3',
            text: 'When you see a shitcoin mining pool on-chain with an APY of up to 50,000%, what is your first reaction?',
            options: [
                { text: 'Rush in immediately. Even if I only stay for a few minutes, I want to farm that wave of profit and run.', score: { degen: 2, safe: 0 } },
                { text: 'Throw in a little money to test the waters, see if I can break even.', score: { degen: 1, safe: 0 } },
                { text: 'This kind of high yield is definitely unsustainable, probably a Ponzi scheme. I\'m not participating.', score: { degen: 0, safe: 1 } },
                { text: 'I won\'t even click on that link, afraid my wallet will get drained by a malicious approval.', score: { degen: 0, safe: 2 } }
            ]
        },
        {
            id: 'r4',
            text: 'If a friend recommends a "guaranteed profit, zero risk" yield protocol to you, but the code is unaudited, what do you do?',
            options: [
                { text: 'Since a friend recommended it, it must be fine. Ape in directly!', score: { degen: 2, safe: 0 } },
                { text: 'I\'ll put in a small portion first to see if I can withdraw normally.', score: { degen: 1, safe: 0 } },
                { text: 'I\'ll ask my friend for the audit link, otherwise I won\'t trust it.', score: { degen: 0, safe: 1 } },
                { text: 'I\'ll tell them that unaudited code is a ticking time bomb, stay away from it.', score: { degen: 0, safe: 2 } }
            ]
        },
        {
            id: 'r5',
            text: 'When trading on a DEX, what is your usual slippage setting?',
            options: [
                { text: 'Above 10%. As long as the transaction goes through, I don\'t care about spending a bit extra!', score: { degen: 2, safe: 0 } },
                { text: 'Around 5%, adjust depending on the situation. As long as I can buy in, it\'s fine.', score: { degen: 1, safe: 0 } },
                { text: 'Around 1%. Try to execute at market price, don\'t want to spend extra.', score: { degen: 0, safe: 1 } },
                { text: 'Below 0.5%. I must precisely control costs, even if it means a few failed transactions.', score: { degen: 0, safe: 2 } }
            ]
        }
    ],
    Motivation: [
        {
            id: 'm1',
            text: 'What is your main reason for buying an NFT?',
            options: [
                { text: 'Clear roadmap with staking rewards and utility as in-game items.', score: { utility: 2, lore: 0 } },
                { text: 'Strong tech foundation or a domain on a major chain with practical use cases.', score: { utility: 1, lore: 0 } },
                { text: 'Amazing community vibes, everyone\'s making memes, and the art matches my aesthetic.', score: { utility: 0, lore: 1 } },
                { text: 'To support the artist and gain access to an exclusive circle and its story.', score: { utility: 0, lore: 2 } }
            ]
        },
        {
            id: 'm2',
            text: 'When you see "This is good for Crypto", what\'s your first reaction?',
            options: [
                { text: 'It\'s a technical catalyst. I need to research its impact on TPS or interoperability.', score: { utility: 2, lore: 0 } },
                { text: 'It\'s a market signal — money is incoming. Let\'s find which coin will pump.', score: { utility: 1, lore: 0 } },
                { text: 'Haha, meme time! Let\'s turn this into a sticker and spam the group chat.', score: { utility: 0, lore: 1 } },
                { text: 'It\'s a statement of faith. Whatever happens, as long as we\'re on-chain, it\'s good.', score: { utility: 0, lore: 2 } }
            ]
        },
        {
            id: 'm3',
            text: 'What is your take on "Meme coins" (like Doge, Shiba, etc.)?',
            options: [
                { text: 'They have no real utility, purely gambling tools. I don\'t touch them.', score: { utility: 2, lore: 0 } },
                { text: 'They are fun, but too risky. I\'ll only play with a very small amount of funds.', score: { utility: 1, lore: 0 } },
                { text: 'They represent the power of the community and internet culture; they hold value.', score: { utility: 0, lore: 1 } },
                { text: 'They are the embodiment of the Web3 spirit: decentralized and community-driven, way better than those VC coins!', score: { utility: 0, lore: 2 } }
            ]
        },
        {
            id: 'm4',
            text: 'What type of project are you more inclined to invest in?',
            options: [
                { text: 'DeFi protocols with mature products, steady revenue, and clear business models.', score: { utility: 2, lore: 0 } },
                { text: 'Layer 1 or Layer 2 blockchains with strong tech teams and clear roadmaps.', score: { utility: 1, lore: 0 } },
                { text: 'NFT projects with a unique worldview, strong community consensus, and rich derivative content.', score: { utility: 0, lore: 1 } },
                { text: 'Meme projects with distinct personalities, viral transmission capabilities, and deep cultural memes.', score: { utility: 0, lore: 2 } }
            ]
        },
        {
            id: 'm5',
            text: 'When browsing a project\'s whitepaper, what do you pay the most attention to?',
            options: [
                { text: 'Tokenomics model, inflation rate, vesting/unlocking schedule.', score: { utility: 2, lore: 0 } },
                { text: 'Technical architecture, consensus mechanism, performance metrics.', score: { utility: 1, lore: 0 } },
                { text: 'Team background, community vision, project lore/story.', score: { utility: 0, lore: 1 } },
                { text: 'Whether the logo looks good, if the website is cool, and if the community vibe is lively.', score: { utility: 0, lore: 2 } }
            ]
        }
    ],
    Time: [
        {
            id: 't1',
            text: 'What is your typical holding period?',
            options: [
                { text: 'Minutes to hours. I\'m a scalper — take profits and never hold overnight.', score: { sniper: 2, hodler: 0 } },
                { text: 'Days to weeks. I rotate with market trends and ride each wave.', score: { sniper: 1, hodler: 0 } },
                { text: 'Months to a year. I believe in this sector and will take profits at my target price.', score: { sniper: 0, hodler: 1 } },
                { text: 'Years, even planning to pass to my grandchildren. I won\'t sell unless Bitcoin dies.', score: { sniper: 0, hodler: 2 } }
            ]
        },
        {
            id: 't2',
            text: 'When the market crashes 50%, what do you do?',
            options: [
                { text: 'Quickly stop loss to preserve capital, or go short to profit from the crash.', score: { sniper: 2, hodler: 0 } },
                { text: 'Nervously watching the charts, looking for bounce opportunities to average down.', score: { sniper: 1, hodler: 0 } },
                { text: 'A bit panicked but choose to lie flat, close the app and go to work.', score: { sniper: 0, hodler: 1 } },
                { text: 'Excitedly change my wallpaper to "Buy the Dip" and deploy all my savings.', score: { sniper: 0, hodler: 2 } }
            ]
        },
        {
            id: 't3',
            text: 'How do you usually manage your portfolio?',
            options: [
                { text: 'I check prices at least three times a day and frequently rebalance based on market volatility.', score: { sniper: 2, hodler: 0 } },
                { text: 'I review once a week and adjust my positions based on market trends.', score: { sniper: 1, hodler: 0 } },
                { text: 'I check once a month. As long as the macro direction hasn\'t changed, I don\'t touch it.', score: { sniper: 0, hodler: 1 } },
                { text: 'I rarely check prices. I believe time is the friend of quality assets.', score: { sniper: 0, hodler: 2 } }
            ]
        },
        {
            id: 't4',
            text: 'A project you\'ve held long-term suddenly announces massive negative news (e.g., team disbands, core feature fails). What do you do?',
            options: [
                { text: 'Sell everything immediately, stop the loss, and look for the next opportunity.', score: { sniper: 2, hodler: 0 } },
                { text: 'Sell a portion first, observe subsequent developments before deciding.', score: { sniper: 1, hodler: 0 } },
                { text: 'I will continue to hold, believing the community can get through the hardship.', score: { sniper: 0, hodler: 1 } },
                { text: 'I might even add to my position, believing this is the final shakeout.', score: { sniper: 0, hodler: 2 } }
            ]
        },
        {
            id: 't5',
            text: 'What is your view on "Bull Markets" and "Bear Markets"?',
            options: [
                { text: 'Bull markets are for making money, bear markets are for losing it, so you must perfectly time the top and bottom.', score: { sniper: 2, hodler: 0 } },
                { text: 'Make more in a bull market, lose less in a bear market. Go with the flow.', score: { sniper: 1, hodler: 0 } },
                { text: 'Bull markets are bubbles, bear markets are opportunities. Be greedy when others are fearful.', score: { sniper: 0, hodler: 1 } },
                { text: 'Bull and bear are just cycles. True believers don\'t care about this, just keep holding.', score: { sniper: 0, hodler: 2 } }
            ]
        }
    ],
    Social: [
        {
            id: 's1',
            text: 'What is your usual status in Discord?',
            options: [
                { text: 'Always invisible. Only read announcements. Typing feels like wasting gas.', score: { anon: 2, public: 0 } },
                { text: 'Occasionally drop memes in general, or only speak when @mentioned.', score: { anon: 1, public: 0 } },
                { text: 'Frequently join discussions, help newcomers, and occasionally attend events.', score: { anon: 0, public: 1 } },
                { text: 'I\'m an admin or mod, actively organize events, even host AMAs in voice channels.', score: { anon: 0, public: 2 } }
            ]
        },
        {
            id: 's2',
            text: 'What is your Twitter profile like?',
            options: [
                { text: 'No avatar (or default), no bio, no tweets. Looks like a bot.', score: { anon: 2, public: 0 } },
                { text: 'Only retweets, no original content. Like a soulless shilling machine.', score: { anon: 1, public: 0 } },
                { text: 'Occasionally post about life or market views, with some interaction.', score: { anon: 0, public: 1 } },
                { text: 'Full of in-depth project analysis, profit screenshots, debates with other KOLs. More followers than following.', score: { anon: 0, public: 2 } }
            ]
        },
        {
            id: 's3',
            text: 'Are you willing to reveal your real identity or wallet address in public (like Twitter, Discord)?',
            options: [
                { text: 'Absolutely not. My anonymity is more important than anything.', score: { anon: 2, public: 0 } },
                { text: 'Only reveal it in a small circle of trust, but remain anonymous in public.', score: { anon: 1, public: 0 } },
                { text: 'If I\'m confident in a project, I\'ll publicly show my holdings to show support.', score: { anon: 0, public: 1 } },
                { text: 'Of course. I am who I am, I take responsibility for my words and investments. Transparency is the Web3 spirit.', score: { anon: 0, public: 2 } }
            ]
        },
        {
            id: 's4',
            text: 'When you see obvious misinformation or FUD (Fear, Uncertainty, Doubt) in the community, what do you do?',
            options: [
                { text: 'Scroll past silently, none of my business.', score: { anon: 2, public: 0 } },
                { text: 'Might privately warn friends, but won\'t publicly refute it.', score: { anon: 1, public: 0 } },
                { text: 'I will cite official docs or data to clarify it in public channels.', score: { anon: 0, public: 1 } },
                { text: 'I will write a long thread analyzing the facts in detail, and @ the project team and KOLs to debunk the rumors.', score: { anon: 0, public: 2 } }
            ]
        },
        {
            id: 's5',
            text: 'Which social experience do you enjoy more?',
            options: [
                { text: 'In an anonymous, decentralized forum, discussing purely based on content.', score: { anon: 2, public: 0 } },
                { text: 'In a semi-anonymous small group, having deep conversations with a few like-minded friends.', score: { anon: 1, public: 0 } },
                { text: 'In a public community, interacting with a large number of users and sharing opinions.', score: { anon: 0, public: 1 } },
                { text: 'Being the center of attention in the community, having a massive follower count, and being able to influence the community\'s direction.', score: { anon: 0, public: 2 } }
            ]
        }
    ]
};

const personalities = [
    { name: 'The Alpha Hunter', risk: 'Degen', motivation: 'Utility', time: 'Sniper', social: 'Public', description: 'Master of information. Uses public channels and information gaps to quickly discover early projects. Not only fast, but also loud about it. Dominates the info game and leverages every signal for maximum gain.' },
    { name: 'The Moonshot Degen', risk: 'Degen', motivation: 'Utility', time: 'Sniper', social: 'Anon', description: 'Risk believer. Silently chases shitcoins for 100x returns, doesn\'t care about community culture. Moves in silence, lets the gains speak for themselves.' },
    { name: 'The Yield Farmer', risk: 'Degen', motivation: 'Utility', time: 'HODLer', social: 'Public', description: 'On-chain bee. Long-term profits through compound interest across different protocols. Pursues maximum yield, carefully calculates every gas fee. Publicly shares farming strategies.' },
    { name: 'The Airdrop Farmer', risk: 'Degen', motivation: 'Utility', time: 'HODLer', social: 'Anon', description: 'Professional airdrop hunter. Silently uses scripts or multiple accounts to interact, long-term lurking and waiting for token drops. The unseen harvester of airdrops.' },
    { name: 'The FOMO King', risk: 'Degen', motivation: 'Lore', time: 'Sniper', social: 'Public', description: 'Publicly chases hot trends when seeing others make money. Always follows the last wave of hype, emotional trading, easy to get rekt. The loudest in the pump, the quietest in the dump.' },
    { name: 'The Exit Liquidity', risk: 'Degen', motivation: 'Lore', time: 'Sniper', social: 'Anon', description: 'Silently buys at the top, self-mocks as "liquidity provider", also a victim. The unsung hero who provides exit liquidity for others, always at the worst time.' },
    { name: 'The Bullish Dreamer', risk: 'Degen', motivation: 'Lore', time: 'HODLer', social: 'Public', description: 'Always bullish. Even at the end of the world, will tweet "This is good for Crypto". Blindly optimistic, uses faith to fight market volatility. The eternal optimist of Web3.' },
    { name: 'The Lore Master', risk: 'Degen', motivation: 'Lore', time: 'HODLer', social: 'Anon', description: 'Cultural scholar. Prefers studying whitepaper history and Web3 philosophical meaning over making money. An anonymous cultural guardian who preserves the soul of decentralization.' },
    { name: 'The Gas Guru', risk: 'Safe', motivation: 'Utility', time: 'Sniper', social: 'Public', description: 'Extremely sensitive to gas fees, publicly shares money-saving tips, always knows when transfers are cheapest, uses technical advantages to arbitrage. The master of on-chain efficiency.' },
    { name: 'The Shadow Dev', risk: 'Safe', motivation: 'Utility', time: 'Sniper', social: 'Anon', description: 'Protocol builder. Hides behind anonymous avatar, silently writes code, focuses on technical implementation, doesn\'t care about price. The invisible architect of Web3.' },
    { name: 'The Governance King', risk: 'Safe', motivation: 'Utility', time: 'HODLer', social: 'Public', description: 'Defender of democracy. Votes on every DAO proposal, committed to long-term decentralized governance. The voice of reason in on-chain governance chaos.' },
    { name: 'The Safe Player', risk: 'Safe', motivation: 'Utility', time: 'HODLer', social: 'Anon', description: 'Stablecoin enthusiast. Only silently earns interest on Aave or Compound, safety first, avoids volatile assets. The quiet guardian of capital preservation.' },
    { name: 'The Social Whale', risk: 'Safe', motivation: 'Lore', time: 'Sniper', social: 'Public', description: 'Opinion leader. Moves markets on Twitter, endorses projects with influence, sways short-term sentiment. The kingmaker of Web3 narratives.' },
    { name: 'The NFT Curator', risk: 'Safe', motivation: 'Lore', time: 'Sniper', social: 'Anon', description: 'Aesthetic collector. Buys NFTs not to sell, but to display taste and collection value. Focuses on aesthetics, not short-term speculation. The silent patron of digital art.' },
    { name: 'The Diamond Hand Pro', risk: 'Safe', motivation: 'Lore', time: 'HODLer', social: 'Public', description: 'Community cornerstone. Publicly expresses faith, spiritual pillar of the community, never sells. The unwavering beacon of conviction in turbulent markets.' },
    { name: 'The Zen HODLer', risk: 'Safe', motivation: 'Lore', time: 'HODLer', social: 'Anon', description: 'Diamond hands. Remains calm through countless crashes, long-term holder of mainstream coins, doesn\'t check charts. The enlightened one who has transcended market anxiety.' }
];

let currentQ = 0;
let selected = {};
let scores = { degen: 0, safe: 0, utility: 0, lore: 0, sniper: 0, hodler: 0, anon: 0, public: 0 };
let currentQuestions = [];

function pickRandom(arr, n) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
}

function generateQuiz() {
    const dims = ['Risk', 'Motivation', 'Time', 'Social'];
    const perDim = 2;
    let quiz = [];
    dims.forEach(dim => {
        const picked = pickRandom(questionBank[dim], perDim);
        picked.forEach(q => quiz.push({ ...q, dimension: dim }));
    });
    return quiz.sort(() => Math.random() - 0.5);
}

const startBtn = document.getElementById('start-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const retakeBtn = document.getElementById('retake-btn');
const shareBtn = document.getElementById('share-btn');
const questionNum = document.getElementById('question-num');
const dimTag = document.getElementById('dim-tag');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const progressFill = document.getElementById('progress-fill');
const personalityName = document.getElementById('personality-name');
const personalityDesc = document.getElementById('personality-desc');
const toast = document.getElementById('toast');

startBtn.addEventListener('click', startTest);
prevBtn.addEventListener('click', prevQuestion);
nextBtn.addEventListener('click', nextQuestion);
retakeBtn.addEventListener('click', retakeTest);
shareBtn.addEventListener('click', shareResult);

function startTest() {
    currentQuestions = generateQuiz();
    currentQ = 0;
    selected = {};
    scores = { degen: 0, safe: 0, utility: 0, lore: 0, sniper: 0, hodler: 0, anon: 0, public: 0 };
    startPage.classList.remove('active');
    testPage.classList.add('active');
    loadQuestion();
}

function loadQuestion() {
    const q = currentQuestions[currentQ];
    questionNum.textContent = `Q${currentQ + 1}`;
    dimTag.textContent = q.dimension;
    questionText.textContent = q.text;

    progressFill.style.width = `${((currentQ + 1) / currentQuestions.length) * 100}%`;

    optionsContainer.innerHTML = '';
    q.options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'option' + (selected[currentQ] === i ? ' selected' : '');
        div.innerHTML = `<input type="radio" name="opt" id="opt-${i}" value="${i}"${selected[currentQ] === i ? ' checked' : ''}><span class="option-text">${opt.text}</span>`;
        div.addEventListener('click', () => selectOpt(i));
        optionsContainer.appendChild(div);
    });

    prevBtn.disabled = currentQ === 0;
    nextBtn.textContent = currentQ === currentQuestions.length - 1 ? 'Submit' : 'Next';
}

function selectOpt(index) {
    selected[currentQ] = index;
    const opts = optionsContainer.querySelectorAll('.option');
    opts.forEach((el, i) => {
        el.classList.toggle('selected', i === index);
        el.querySelector('input').checked = i === index;
    });
}

function prevQuestion() {
    if (currentQ > 0) {
        currentQ--;
        loadQuestion();
    }
}

function nextQuestion() {
    if (selected[currentQ] === undefined) {
        alert('Please select an option to continue.');
        return;
    }

    if (currentQ < currentQuestions.length - 1) {
        currentQ++;
        loadQuestion();
    } else {
        calculateScores();
        showResult();
    }
}

function calculateScores() {
    scores = { degen: 0, safe: 0, utility: 0, lore: 0, sniper: 0, hodler: 0, anon: 0, public: 0 };
    for (let i = 0; i < currentQ + 1; i++) {
        if (selected[i] !== undefined) {
            const opt = currentQuestions[i].options[selected[i]];
            for (const [key, val] of Object.entries(opt.score)) {
                scores[key] += val;
            }
        }
    }
}

function showResult() {
    const riskType = scores.degen >= scores.safe ? 'Degen' : 'Safe';
    const motivationType = scores.utility >= scores.lore ? 'Utility' : 'Lore';
    const timeType = scores.sniper >= scores.hodler ? 'Sniper' : 'HODLer';
    const socialType = scores.anon >= scores.public ? 'Anon' : 'Public';

    const matched = personalities.find(p =>
        p.risk === riskType && p.motivation === motivationType && p.time === timeType && p.social === socialType
    );

    const typeCode = riskType[0] + motivationType[0] + timeType[0] + socialType[0];
    document.getElementById('type-code').textContent = typeCode;
    personalityName.textContent = matched.name;
    personalityDesc.textContent = matched.description;

    const tagsContainer = document.getElementById('dim-tags');
    tagsContainer.innerHTML = '';
    [riskType, motivationType, timeType, socialType].forEach(label => {
        const tag = document.createElement('span');
        tag.className = 'dim-tag-result';
        tag.textContent = label;
        tagsContainer.appendChild(tag);
    });

    updateBar('risk', scores.degen, scores.safe, 'Degen', 'Safe');
    updateBar('motivation', scores.utility, scores.lore, 'Utility', 'Lore');
    updateBar('time', scores.sniper, scores.hodler, 'Sniper', 'HODLer');
    updateBar('social', scores.anon, scores.public, 'Anon', 'Public');

    testPage.classList.remove('active');
    resultPage.classList.add('active');

    submitToBackend(matched, typeCode, riskType, motivationType, timeType, socialType);
}

async function submitToBackend(personality, typeCode, risk, motivation, time, social) {
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        const body = {
            personalityName: personality.name,
            typeCode: typeCode,
            dimensions: { risk, motivation, time, social },
            scores: scores,
            description: personality.description
        };
        if (currentUser) {
            body.userId = currentUser.id;
            body.datadidUid = currentUser.datadidUid;
        }
        const response = await fetch(`${API_BASE}/submit`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (data.success) {
            console.log('Result saved to server:', data.data.id);
        } else {
            console.warn('Server rejected result:', data.message);
        }
    } catch (error) {
        console.warn('Could not save result to server:', error.message);
    }
}

function updateBar(dim, leftScore, rightScore, leftLabel, rightLabel) {
    const total = leftScore + rightScore;
    const leftPct = total === 0 ? 50 : Math.round((leftScore / total) * 100);
    const rightPct = 100 - leftPct;

    const leftBar = document.getElementById(`${dim}-bar-left`);
    const rightBar = document.getElementById(`${dim}-bar-right`);
    const leftLbl = document.querySelector(`#score-${dim} .label-left`);
    const rightLbl = document.querySelector(`#score-${dim} .label-right`);
    const leftPctEl = document.getElementById(`${dim}-pct-left`);
    const rightPctEl = document.getElementById(`${dim}-pct-right`);

    leftPctEl.textContent = `${leftPct}%`;
    rightPctEl.textContent = `${rightPct}%`;

    setTimeout(() => {
        leftBar.style.width = `${leftPct}%`;
        rightBar.style.width = `${rightPct}%`;
    }, 100);

    if (leftPct >= rightPct) {
        leftLbl.classList.add('active');
        rightLbl.classList.remove('active');
        leftBar.classList.remove('losing');
        rightBar.classList.add('losing');
    } else {
        rightLbl.classList.add('active');
        leftLbl.classList.remove('active');
        rightBar.classList.remove('losing');
        leftBar.classList.add('losing');
    }
}

function shareResult() {
    const name = personalityName.textContent;
    const desc = personalityDesc.textContent;
    const shareText = `My Web3.0 Personality is **${name}**!\n${desc}\n\nTake the test: ${window.location.href}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(() => showToast()).catch(() => fallbackCopy(shareText));
    } else {
        fallbackCopy(shareText);
    }
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        showToast();
    } catch (e) {
        alert('Copy failed. Please copy manually.');
    }
    document.body.removeChild(ta);
}

function showToast() {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function retakeTest() {
    currentQ = 0;
    selected = {};
    scores = { degen: 0, safe: 0, utility: 0, lore: 0, sniper: 0, hodler: 0, anon: 0, public: 0 };

    document.querySelectorAll('.bar-left, .bar-right').forEach(b => {
        b.style.width = '0%';
        b.classList.remove('losing');
    });
    document.querySelectorAll('.label-left, .label-right').forEach(l => l.classList.remove('active'));
    document.getElementById('type-code').textContent = '----';
    document.getElementById('dim-tags').innerHTML = '';

    resultPage.classList.remove('active');
    startPage.classList.add('active');
}

(function initBg() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let stars = [];
    let particles = [];
    let W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function createStars() {
        stars = [];
        const count = Math.floor((W * H) / 9000);
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.4 + 0.2,
                a: Math.random() * 0.7 + 0.2,
                aSpeed: Math.random() * 0.006 + 0.002,
                aDir: Math.random() > 0.5 ? 1 : -1
            });
        }
    }

    function createParticles() {
        particles = [];
        const count = 5;
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                a: Math.random() * 0.3 + 0.08,
                type: Math.random() > 0.5 ? 'eth' : 'hex'
            });
        }
    }

    function drawEth(x, y, size, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.6, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size * 0.6, y);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - size * 0.6, y);
        ctx.lineTo(x, y - size * 0.3);
        ctx.lineTo(x + size * 0.6, y);
        ctx.stroke();
        ctx.restore();
    }

    function drawHex(x, y, size, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, W, H);

        for (const s of stars) {
            s.a += s.aSpeed * s.aDir;
            if (s.a >= 1) { s.a = 1; s.aDir = -1; }
            if (s.a <= 0.1) { s.a = 0.1; s.aDir = 1; }
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 0, ${s.a * 0.5})`;
            ctx.fill();
        }

        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -20) p.x = W + 20;
            if (p.x > W + 20) p.x = -20;
            if (p.y < -20) p.y = H + 20;
            if (p.y > H + 20) p.y = -20;
            p.type === 'eth' ? drawEth(p.x, p.y, p.r * 4, p.a) : drawHex(p.x, p.y, p.r * 4, p.a);
        }

        requestAnimationFrame(animate);
    }

    resize();
    createStars();
    createParticles();
    animate();

    window.addEventListener('resize', () => { resize(); createStars(); createParticles(); });
})();
