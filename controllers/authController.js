const { DataClient } = require('datadid-sdk-js');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'web3-personality-test-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

const dataClient = DataClient.production();

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      datadidUid: user.datadid_uid,
      email: user.email,
      did: user.datadid_did
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

exports.sendEmailCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    await dataClient.sendEmailCode(email);
    res.json({ success: true, message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Send email code error:', error.message || error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send verification code' });
  }
};

exports.registerWithEmail = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) {
      return res.status(400).json({ success: false, message: 'Email, code, and password are required' });
    }

    const client = new DataClient({ baseURL: 'https://data-api.memolabs.net', disableAutoToken: true });
    const tokens = await client.registerWithEmail(email, code, password, 'Web');

    client.setAccessToken(tokens.accessToken);
    const me = await client.getMe();
    let userInfo = null;
    try {
      userInfo = await client.getUserInfo();
    } catch (e) {
      console.warn('Could not fetch full user info:', e.message);
    }

    const dbUser = await User.upsert({
      datadidUid: String(me.uid),
      datadidDid: userInfo?.did || '',
      email: userInfo?.email || email,
      username: userInfo?.name || '',
      avatar: userInfo?.avatar || '',
      loginMethod: 'email',
      accessToken: tokens.accessToken
    });

    const token = generateToken(dbUser);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: dbUser.id,
          datadidUid: dbUser.datadid_uid,
          did: dbUser.datadid_did,
          email: dbUser.email,
          username: dbUser.username,
          avatar: dbUser.avatar
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error.message || error);
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

exports.loginWithEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const client = new DataClient({ baseURL: 'https://data-api.memolabs.net', disableAutoToken: true });
    const tokens = await client.loginWithEmail(email, code, 'Web');

    client.setAccessToken(tokens.accessToken);
    const me = await client.getMe();
    let userInfo = null;
    try {
      userInfo = await client.getUserInfo();
    } catch (e) {
      console.warn('Could not fetch full user info:', e.message);
    }

    const dbUser = await User.upsert({
      datadidUid: String(me.uid),
      datadidDid: userInfo?.did || '',
      email: userInfo?.email || email,
      username: userInfo?.name || '',
      avatar: userInfo?.avatar || '',
      loginMethod: 'email_code',
      accessToken: tokens.accessToken
    });

    const token = generateToken(dbUser);
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: dbUser.id,
          datadidUid: dbUser.datadid_uid,
          did: dbUser.datadid_did,
          email: dbUser.email,
          username: dbUser.username,
          avatar: dbUser.avatar
        }
      }
    });
  } catch (error) {
    console.error('Login with email error:', error.message || error);
    res.status(401).json({ success: false, message: error.message || 'Login failed' });
  }
};

exports.loginWithEmailPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const client = new DataClient({ baseURL: 'https://data-api.memolabs.net', disableAutoToken: true });
    const tokens = await client.loginWithEmailPassword(email, password);

    client.setAccessToken(tokens.accessToken);
    const me = await client.getMe();
    let userInfo = null;
    try {
      userInfo = await client.getUserInfo();
    } catch (e) {
      console.warn('Could not fetch full user info:', e.message);
    }

    const dbUser = await User.upsert({
      datadidUid: String(me.uid),
      datadidDid: userInfo?.did || '',
      email: userInfo?.email || email,
      username: userInfo?.name || '',
      avatar: userInfo?.avatar || '',
      loginMethod: 'email_password',
      accessToken: tokens.accessToken
    });

    const token = generateToken(dbUser);
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: dbUser.id,
          datadidUid: dbUser.datadid_uid,
          did: dbUser.datadid_did,
          email: dbUser.email,
          username: dbUser.username,
          avatar: dbUser.avatar
        }
      }
    });
  } catch (error) {
    console.error('Login with email/password error:', error.message || error);
    res.status(401).json({ success: false, message: error.message || 'Login failed' });
  }
};

exports.getEvmChallenge = async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, message: 'Wallet address is required' });
    }

    const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
    const message = await dataClient.getEvmChallenge(address, 985, origin);
    res.json({ success: true, data: { message } });
  } catch (error) {
    console.error('Get EVM challenge error:', error.message || error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get challenge' });
  }
};

exports.loginWithEvm = async (req, res) => {
  try {
    const { message, signature } = req.body;
    if (!message || !signature) {
      return res.status(400).json({ success: false, message: 'Message and signature are required' });
    }

    const client = new DataClient({ baseURL: 'https://data-api.memolabs.net', disableAutoToken: true });
    const result = await client.loginWithEvm(message, signature, 'Web');

    client.setAccessToken(result.accessToken);
    const me = await client.getMe();
    let userInfo = null;
    try {
      userInfo = await client.getUserInfo();
    } catch (e) {
      console.warn('Could not fetch full user info:', e.message);
    }

    const dbUser = await User.upsert({
      datadidUid: String(me.uid),
      datadidDid: result.did || userInfo?.did || '',
      email: userInfo?.email || '',
      username: userInfo?.name || '',
      avatar: userInfo?.avatar || '',
      loginMethod: 'evm_wallet',
      accessToken: result.accessToken
    });

    const token = generateToken(dbUser);
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: dbUser.id,
          datadidUid: dbUser.datadid_uid,
          did: dbUser.datadid_did,
          email: dbUser.email,
          username: dbUser.username,
          avatar: dbUser.avatar
        }
      }
    });
  } catch (error) {
    console.error('Login with EVM error:', {
      message: error.message || String(error),
      statusCode: error.statusCode,
      responseBody: error.responseBody
    });
    res.status(401).json({
      success: false,
      message: error.message || 'Wallet login failed'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        datadidUid: user.datadid_uid,
        did: user.datadid_did,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        loginMethod: user.login_method
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
