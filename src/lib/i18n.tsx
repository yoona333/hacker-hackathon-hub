import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    'header.connect': 'CONNECT',
    'header.dashboard': 'DASHBOARD',
    
    // Home page
    'home.title': 'AGENT_PAY_GUARD',
    'home.subtitle': 'SECURITY PROTOCOL v1.0.0',
    'home.status': 'System Status',
    'home.status.online': 'ONLINE',
    'home.status.security': 'SECURITY',
    'home.status.maximum': 'MAXIMUM',
    'home.status.network': 'NETWORK',
    'home.status.chainId': 'CHAIN_ID',
    'home.status.threshold': 'THRESHOLD',
    'home.status.multisig': '2/3 MULTISIG',
    'home.accessTerminal': 'ACCESS TERMINAL',
    'home.emergencyFreeze': 'EMERGENCY FREEZE',
    'home.connectWallet': 'CONNECT WALLET TO CONTINUE',
    'home.capabilities': 'Capabilities',
    'home.cap.pay': 'PAY',
    'home.cap.payDesc': 'Initiate payment (EOA/AA, backend API)',
    'home.cap.aiPay': 'AI PAY',
    'home.cap.aiPayDesc': 'Natural language payment with AI',
    'home.cap.multisig': 'MULTI-SIG',
    'home.cap.multisigDesc': '2/3 threshold protection',
    'home.cap.freeze': 'FREEZE',
    'home.cap.freezeDesc': 'Emergency address blocking',
    'home.cap.proposals': 'PROPOSALS',
    'home.cap.proposalsDesc': 'Decentralized governance',
    'home.footer.hackathon': '🛡️ HACKATHON 2024',
    'home.footer.chain': 'CHAIN 2368',
    
    // Pay page
    'pay.title': 'Pay',
    'pay.subtitle': 'Initiate Payment (AgentPayGuard API)',
    'pay.description': 'Request backend via pnpm server. Leave empty to use .env defaults.',
    'pay.recipient': 'Recipient Address',
    'pay.amount': 'Amount',
    'pay.mode': 'Payment Mode',
    'pay.executeOnchain': 'Execute real on-chain transaction',
    'pay.submit': 'Initiate Payment',
    'pay.submitting': 'Requesting...',
    'pay.success': 'Success',
    'pay.txHash': 'txHash:',
    'pay.userOpHash': 'userOpHash:',
    'pay.walletNotice': 'This page initiates payment via backend API (using .env private key). Wallet connection is only for network status display.',
    
    // AI Pay page
    'aiPay.title': 'AI Pay',
    'aiPay.subtitle': 'Natural Language Payment with AI',
    'aiPay.description': 'Describe your payment in natural language. AI will parse and assess risk automatically.',
    'aiPay.placeholder': 'e.g., "Pay 50 USDC to 0x... for server hosting"',
    'aiPay.submit': 'Parse & Pay',
    'aiPay.parsing': 'AI Parsing...',
    'aiPay.parsed': 'Parsed Intent',
    'aiPay.recipient': 'Recipient',
    'aiPay.amount': 'Amount',
    'aiPay.currency': 'Currency',
    'aiPay.purpose': 'Purpose',
    'aiPay.confidence': 'Confidence',
    'aiPay.riskAssessment': 'Risk Assessment',
    'aiPay.riskScore': 'Score',
    'aiPay.riskLevel': 'Level',
    'aiPay.riskReasons': 'Reasons',
    'aiPay.recommendations': 'Recommendations',
    'aiPay.policyCheck': 'Policy Check',
    'aiPay.approved': 'APPROVED',
    'aiPay.rejected': 'REJECTED',
    'aiPay.executeOnchain': 'Execute real on-chain transaction',
    'aiPay.confirm': 'Confirm Payment',
    'aiPay.executing': 'Executing...',
    'aiPay.aiDisabled': 'AI features disabled. Set ENABLE_AI_INTENT=1 and configure API key.',
    
    // Common
    'common.back': 'Back',
    'common.loading': 'Loading...',
    'common.error': 'Error',
  },
  zh: {
    // Header
    'header.connect': '连接钱包',
    'header.dashboard': '控制台',
    
    // Home page
    'home.title': 'AGENT_PAY_GUARD',
    'home.subtitle': '安全协议 v1.0.0',
    'home.status': '系统状态',
    'home.status.online': '在线',
    'home.status.security': '安全等级',
    'home.status.maximum': '最高',
    'home.status.network': '网络',
    'home.status.chainId': '链 ID',
    'home.status.threshold': '阈值',
    'home.status.multisig': '2/3 多签',
    'home.accessTerminal': '进入控制台',
    'home.emergencyFreeze': '紧急冻结',
    'home.connectWallet': '连接钱包以继续',
    'home.capabilities': '功能列表',
    'home.cap.pay': '支付',
    'home.cap.payDesc': '发起支付（EOA/AA，后端 API）',
    'home.cap.aiPay': 'AI 支付',
    'home.cap.aiPayDesc': '自然语言 AI 支付',
    'home.cap.multisig': '多签',
    'home.cap.multisigDesc': '2/3 阈值保护',
    'home.cap.freeze': '冻结',
    'home.cap.freezeDesc': '紧急地址封锁',
    'home.cap.proposals': '提案',
    'home.cap.proposalsDesc': '去中心化治理',
    'home.footer.hackathon': '🛡️ 黑客松 2024',
    'home.footer.chain': '链 2368',
    
    // Pay page
    'pay.title': '支付',
    'pay.subtitle': '发起支付（AgentPayGuard API）',
    'pay.description': '请求主仓后端 pnpm server，不填则使用 .env 默认值。',
    'pay.recipient': '收款地址',
    'pay.amount': '金额',
    'pay.mode': '支付模式',
    'pay.executeOnchain': '真实发链上交易',
    'pay.submit': '发起支付',
    'pay.submitting': '请求中...',
    'pay.success': '成功',
    'pay.txHash': '交易哈希：',
    'pay.userOpHash': '用户操作哈希：',
    'pay.walletNotice': '本页发起支付由后端 API 执行（使用 .env 私钥），连接钱包仅用于展示网络状态。',
    
    // AI Pay page
    'aiPay.title': 'AI 支付',
    'aiPay.subtitle': '自然语言 AI 支付',
    'aiPay.description': '用自然语言描述您的支付需求，AI 将自动解析并评估风险。',
    'aiPay.placeholder': '例如："支付 50 USDC 到 0x... 用于服务器托管"',
    'aiPay.submit': '解析并支付',
    'aiPay.parsing': 'AI 解析中...',
    'aiPay.parsed': '解析结果',
    'aiPay.recipient': '收款地址',
    'aiPay.amount': '金额',
    'aiPay.currency': '币种',
    'aiPay.purpose': '用途',
    'aiPay.confidence': '置信度',
    'aiPay.riskAssessment': '风险评估',
    'aiPay.riskScore': '评分',
    'aiPay.riskLevel': '等级',
    'aiPay.riskReasons': '原因',
    'aiPay.recommendations': '建议',
    'aiPay.policyCheck': '策略检查',
    'aiPay.approved': '已批准',
    'aiPay.rejected': '已拒绝',
    'aiPay.executeOnchain': '真实发链上交易',
    'aiPay.confirm': '确认支付',
    'aiPay.executing': '执行中...',
    'aiPay.aiDisabled': 'AI 功能未启用。请设置 ENABLE_AI_INTENT=1 并配置 API 密钥。',
    
    // Common
    'common.back': '返回',
    'common.loading': '加载中...',
    'common.error': '错误',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[lang][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
