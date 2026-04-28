const TestResult = require('../models/TestResult');

const personalities = [
  { name: 'The Alpha Hunter', risk: 'Degen', motivation: 'Utility', time: 'Sniper', social: 'Public', description: 'Master of information. Uses public channels and information gaps to quickly discover early projects. Not only fast, but also loud about it.' },
  { name: 'The Moonshot Degen', risk: 'Degen', motivation: 'Utility', time: 'Sniper', social: 'Anon', description: 'Risk believer. Silently chases shitcoins for 100x returns, doesn\'t care about community culture.' },
  { name: 'The Yield Farmer', risk: 'Degen', motivation: 'Utility', time: 'HODLer', social: 'Public', description: 'On-chain bee. Long-term profits through compound interest across different protocols. Publicly shares farming strategies.' },
  { name: 'The Airdrop Farmer', risk: 'Degen', motivation: 'Utility', time: 'HODLer', social: 'Anon', description: 'Professional airdrop hunter. Silently uses scripts or multiple accounts to interact, long-term lurking and waiting for token drops.' },
  { name: 'The FOMO King', risk: 'Degen', motivation: 'Lore', time: 'Sniper', social: 'Public', description: 'Publicly chases hot trends when seeing others make money. Always follows the last wave of hype, emotional trading, easy to get rekt.' },
  { name: 'The Exit Liquidity', risk: 'Degen', motivation: 'Lore', time: 'Sniper', social: 'Anon', description: 'Silently buys at the top, self-mocks as "liquidity provider", also a victim. The unsung hero who provides exit liquidity for others.' },
  { name: 'The Bullish Dreamer', risk: 'Degen', motivation: 'Lore', time: 'HODLer', social: 'Public', description: 'Always bullish. Even at the end of the world, will tweet "This is good for Crypto". Blindly optimistic, uses faith to fight market volatility.' },
  { name: 'The Lore Master', risk: 'Degen', motivation: 'Lore', time: 'HODLer', social: 'Anon', description: 'Cultural scholar. Prefers studying whitepaper history and Web3 philosophical meaning over making money. An anonymous cultural guardian.' },
  { name: 'The Gas Guru', risk: 'Safe', motivation: 'Utility', time: 'Sniper', social: 'Public', description: 'Extremely sensitive to gas fees, publicly shares money-saving tips, always knows when transfers are cheapest, uses technical advantages to arbitrage.' },
  { name: 'The Shadow Dev', risk: 'Safe', motivation: 'Utility', time: 'Sniper', social: 'Anon', description: 'Protocol builder. Hides behind anonymous avatar, silently writes code, focuses on technical implementation, doesn\'t care about price.' },
  { name: 'The Governance King', risk: 'Safe', motivation: 'Utility', time: 'HODLer', social: 'Public', description: 'Defender of democracy. Votes on every DAO proposal, committed to long-term decentralized governance.' },
  { name: 'The Safe Player', risk: 'Safe', motivation: 'Utility', time: 'HODLer', social: 'Anon', description: 'Stablecoin enthusiast. Only silently earns interest on Aave or Compound, safety first, avoids volatile assets.' },
  { name: 'The Social Whale', risk: 'Safe', motivation: 'Lore', time: 'Sniper', social: 'Public', description: 'Opinion leader. Moves markets on Twitter, endorses projects with influence, sways short-term sentiment.' },
  { name: 'The NFT Curator', risk: 'Safe', motivation: 'Lore', time: 'Sniper', social: 'Anon', description: 'Aesthetic collector. Buys NFTs not to sell, but to display taste and collection value. Focuses on aesthetics, not short-term speculation.' },
  { name: 'The Diamond Hand Pro', risk: 'Safe', motivation: 'Lore', time: 'HODLer', social: 'Public', description: 'Community cornerstone. Publicly expresses faith, spiritual pillar of the community, never sells.' },
  { name: 'The Zen HODLer', risk: 'Safe', motivation: 'Lore', time: 'HODLer', social: 'Anon', description: 'Diamond hands. Remains calm through countless crashes, long-term holder of mainstream coins, doesn\'t check charts.' }
];

exports.submitResult = async (req, res) => {
  try {
    const { personalityName, typeCode, dimensions, scores, description } = req.body;

    if (!personalityName || !typeCode || !dimensions || !scores || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: personalityName, typeCode, dimensions, scores, description'
      });
    }

    const validDimensions = ['Degen', 'Safe', 'Utility', 'Lore', 'Sniper', 'HODLer', 'Anon', 'Public'];
    const dimValues = Object.values(dimensions);
    const invalidDims = dimValues.filter(v => !validDimensions.includes(v));
    if (invalidDims.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid dimension values: ${invalidDims.join(', ')}`
      });
    }

    const result = await TestResult.create({
      personalityName,
      typeCode,
      dimensions,
      scores,
      description,
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || ''
    });

    res.status(201).json({
      success: true,
      message: 'Test result submitted successfully',
      data: {
        id: result.id,
        personalityName: result.personalityName,
        typeCode: result.typeCode,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const totalTests = await TestResult.count();
    const personalityDistribution = await TestResult.countByPersonality();

    const dimensionDistribution = {
      risk: await TestResult.countByDimension('risk'),
      motivation: await TestResult.countByDimension('motivation'),
      time: await TestResult.countByDimension('time_dim'),
      social: await TestResult.countByDimension('social')
    };

    const recentResults = await TestResult.getRecent(10);

    res.json({
      success: true,
      data: {
        totalTests,
        personalityDistribution,
        dimensionDistribution,
        recentResults
      }
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getPersonalities = (req, res) => {
  res.json({
    success: true,
    data: personalities
  });
};
