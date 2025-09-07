// Contract specifications service using Alpha Vantage API
const ALPHA_VANTAGE_API_KEY = "demo"; // You'll need to get a free API key from https://www.alphavantage.co/support/#api-key

// Cache for contract specifications to avoid repeated API calls
const contractSpecsCache = new Map();

// Comprehensive futures contract specifications database
// This is the authoritative source for contract specs
const CONTRACT_SPECS_DB = {
  // E-mini NASDAQ-100 (NQ) - All contract months
  NQ: {
    tickSize: 0.25,
    tickValue: 5,
    name: "E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  NQU5: {
    tickSize: 0.25,
    tickValue: 5,
    name: "E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "mini",
  },
  NQH25: {
    tickSize: 0.25,
    tickValue: 5,
    name: "E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  NQM25: {
    tickSize: 0.25,
    tickValue: 5,
    name: "E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  NQZ25: {
    tickSize: 0.25,
    tickValue: 5,
    name: "E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  NQH26: {
    tickSize: 0.25,
    tickValue: 5,
    name: "E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  NQM26: {
    tickSize: 0.25,
    tickValue: 5,
    name: "E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  NQZ26: {
    tickSize: 0.25,
    tickValue: 5,
    name: "E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },

  // E-mini S&P 500 (ES) - All contract months
  ES: {
    tickSize: 0.25,
    tickValue: 12.5,
    name: "E-mini S&P 500",
    exchange: "CME",
  },
  ESU5: {
    tickSize: 0.25,
    tickValue: 12.5,
    name: "E-mini S&P 500",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  ESH25: {
    tickSize: 0.25,
    tickValue: 12.5,
    name: "E-mini S&P 500",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  ESM25: {
    tickSize: 0.25,
    tickValue: 12.5,
    name: "E-mini S&P 500",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  ESZ25: {
    tickSize: 0.25,
    tickValue: 12.5,
    name: "E-mini S&P 500",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  ESH26: {
    tickSize: 0.25,
    tickValue: 12.5,
    name: "E-mini S&P 500",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  ESM26: {
    tickSize: 0.25,
    tickValue: 12.5,
    name: "E-mini S&P 500",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  ESZ26: {
    tickSize: 0.25,
    tickValue: 12.5,
    name: "E-mini S&P 500",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },

  // E-mini Dow Jones (YM) - All contract months
  YM: { tickSize: 1, tickValue: 5, name: "E-mini Dow Jones", exchange: "CME" },
  YMU5: {
    tickSize: 1,
    tickValue: 5,
    name: "E-mini Dow Jones",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  YMH25: {
    tickSize: 1,
    tickValue: 5,
    name: "E-mini Dow Jones",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  YMM25: {
    tickSize: 1,
    tickValue: 5,
    name: "E-mini Dow Jones",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  YMZ25: {
    tickSize: 1,
    tickValue: 5,
    name: "E-mini Dow Jones",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  YMH26: {
    tickSize: 1,
    tickValue: 5,
    name: "E-mini Dow Jones",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  YMM26: {
    tickSize: 1,
    tickValue: 5,
    name: "E-mini Dow Jones",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  YMZ26: {
    tickSize: 1,
    tickValue: 5,
    name: "E-mini Dow Jones",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },

  // E-mini Russell 2000 (RTY) - All contract months
  RTY: {
    tickSize: 0.1,
    tickValue: 5,
    name: "E-mini Russell 2000",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  RTYU5: {
    tickSize: 0.1,
    tickValue: 5,
    name: "E-mini Russell 2000",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  RTYH25: {
    tickSize: 0.1,
    tickValue: 5,
    name: "E-mini Russell 2000",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  RTYM25: {
    tickSize: 0.1,
    tickValue: 5,
    name: "E-mini Russell 2000",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  RTYZ25: {
    tickSize: 0.1,
    tickValue: 5,
    name: "E-mini Russell 2000",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  RTYH26: {
    tickSize: 0.1,
    tickValue: 5,
    name: "E-mini Russell 2000",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  RTYM26: {
    tickSize: 0.1,
    tickValue: 5,
    name: "E-mini Russell 2000",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  RTYZ26: {
    tickSize: 0.1,
    tickValue: 5,
    name: "E-mini Russell 2000",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },

  // Energy Futures
  CL: { tickSize: 0.01, tickValue: 10, name: "Crude Oil", exchange: "NYMEX" },
  CLU5: { tickSize: 0.01, tickValue: 10, name: "Crude Oil", exchange: "NYMEX" },
  CLH25: {
    tickSize: 0.01,
    tickValue: 10,
    name: "Crude Oil",
    exchange: "NYMEX",
    contractType: "mini",
    exchangeFee: 1.38, // NYMEX exchange fee
  },
  CLM25: {
    tickSize: 0.01,
    tickValue: 10,
    name: "Crude Oil",
    exchange: "NYMEX",
    contractType: "mini",
    exchangeFee: 1.38, // NYMEX exchange fee
  },
  CLZ25: {
    tickSize: 0.01,
    tickValue: 10,
    name: "Crude Oil",
    exchange: "NYMEX",
    contractType: "mini",
    exchangeFee: 1.38, // NYMEX exchange fee
  },

  NG: {
    tickSize: 0.001,
    tickValue: 10,
    name: "Natural Gas",
    exchange: "NYMEX",
    contractType: "mini",
    exchangeFee: 1.38, // NYMEX exchange fee
  },
  NGU5: {
    tickSize: 0.001,
    tickValue: 10,
    name: "Natural Gas",
    exchange: "NYMEX",
    contractType: "mini",
    exchangeFee: 1.38, // NYMEX exchange fee
  },
  NGH25: {
    tickSize: 0.001,
    tickValue: 10,
    name: "Natural Gas",
    exchange: "NYMEX",
    contractType: "mini",
    exchangeFee: 1.38, // NYMEX exchange fee
  },
  NGM25: {
    tickSize: 0.001,
    tickValue: 10,
    name: "Natural Gas",
    exchange: "NYMEX",
    contractType: "mini",
    exchangeFee: 1.38, // NYMEX exchange fee
  },
  NGZ25: {
    tickSize: 0.001,
    tickValue: 10,
    name: "Natural Gas",
    exchange: "NYMEX",
    contractType: "mini",
    exchangeFee: 1.38, // NYMEX exchange fee
  },

  // Precious Metals
  GC: { tickSize: 0.1, tickValue: 10, name: "Gold", exchange: "COMEX" },
  GCU5: { tickSize: 0.1, tickValue: 10, name: "Gold", exchange: "COMEX" },
  GCH25: { tickSize: 0.1, tickValue: 10, name: "Gold", exchange: "COMEX" },
  GCM25: { tickSize: 0.1, tickValue: 10, name: "Gold", exchange: "COMEX" },
  GCZ25: { tickSize: 0.1, tickValue: 10, name: "Gold", exchange: "COMEX" },

  SI: { tickSize: 0.005, tickValue: 25, name: "Silver", exchange: "COMEX" },
  SIU5: { tickSize: 0.005, tickValue: 25, name: "Silver", exchange: "COMEX" },
  SIH25: { tickSize: 0.005, tickValue: 25, name: "Silver", exchange: "COMEX" },
  SIM25: { tickSize: 0.005, tickValue: 25, name: "Silver", exchange: "COMEX" },
  SIZ25: { tickSize: 0.005, tickValue: 25, name: "Silver", exchange: "COMEX" },

  // Treasury Bonds
  ZB: {
    tickSize: 0.03125,
    tickValue: 31.25,
    name: "30-Year Treasury Bond",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZBU5: {
    tickSize: 0.03125,
    tickValue: 31.25,
    name: "30-Year Treasury Bond",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZBH25: {
    tickSize: 0.03125,
    tickValue: 31.25,
    name: "30-Year Treasury Bond",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZBM25: {
    tickSize: 0.03125,
    tickValue: 31.25,
    name: "30-Year Treasury Bond",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZBZ25: {
    tickSize: 0.03125,
    tickValue: 31.25,
    name: "30-Year Treasury Bond",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },

  ZN: {
    tickSize: 0.015625,
    tickValue: 15.625,
    name: "10-Year Treasury Note",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZNU5: {
    tickSize: 0.015625,
    tickValue: 15.625,
    name: "10-Year Treasury Note",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZNH25: {
    tickSize: 0.015625,
    tickValue: 15.625,
    name: "10-Year Treasury Note",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZNM25: {
    tickSize: 0.015625,
    tickValue: 15.625,
    name: "10-Year Treasury Note",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZNZ25: {
    tickSize: 0.015625,
    tickValue: 15.625,
    name: "10-Year Treasury Note",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },

  ZF: {
    tickSize: 0.0078125,
    tickValue: 7.8125,
    name: "5-Year Treasury Note",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZFU5: {
    tickSize: 0.0078125,
    tickValue: 7.8125,
    name: "5-Year Treasury Note",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZFH25: {
    tickSize: 0.0078125,
    tickValue: 7.8125,
    name: "5-Year Treasury Note",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZFM25: {
    tickSize: 0.0078125,
    tickValue: 7.8125,
    name: "5-Year Treasury Note",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZFZ25: {
    tickSize: 0.0078125,
    tickValue: 7.8125,
    name: "5-Year Treasury Note",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },

  ZT: {
    tickSize: 0.0078125,
    tickValue: 7.8125,
    name: "2-Year Treasury Note",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZTU5: {
    tickSize: 0.0078125,
    tickValue: 7.8125,
    name: "2-Year Treasury Note",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZTH25: {
    tickSize: 0.0078125,
    tickValue: 7.8125,
    name: "2-Year Treasury Note",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZTM25: {
    tickSize: 0.0078125,
    tickValue: 7.8125,
    name: "2-Year Treasury Note",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },
  ZTZ25: {
    tickSize: 0.0078125,
    tickValue: 7.8125,
    name: "2-Year Treasury Note",
    exchange: "CBOT",
    contractType: "mini",
    exchangeFee: 1.38, // CBOT exchange fee
  },

  // Currency Futures
  "6E": {
    tickSize: 0.00005,
    tickValue: 6.25,
    name: "Euro FX",
    exchange: "CME",
  },
  "6EU5": {
    tickSize: 0.00005,
    tickValue: 6.25,
    name: "Euro FX",
    exchange: "CME",
  },
  "6EH25": {
    tickSize: 0.00005,
    tickValue: 6.25,
    name: "Euro FX",
    exchange: "CME",
  },
  "6EM25": {
    tickSize: 0.00005,
    tickValue: 6.25,
    name: "Euro FX",
    exchange: "CME",
  },
  "6EZ25": {
    tickSize: 0.00005,
    tickValue: 6.25,
    name: "Euro FX",
    exchange: "CME",
  },

  "6J": {
    tickSize: 0.0000005,
    tickValue: 6.25,
    name: "Japanese Yen",
    exchange: "CME",
  },
  "6JU5": {
    tickSize: 0.0000005,
    tickValue: 6.25,
    name: "Japanese Yen",
    exchange: "CME",
  },
  "6JH25": {
    tickSize: 0.0000005,
    tickValue: 6.25,
    name: "Japanese Yen",
    exchange: "CME",
  },
  "6JM25": {
    tickSize: 0.0000005,
    tickValue: 6.25,
    name: "Japanese Yen",
    exchange: "CME",
  },
  "6JZ25": {
    tickSize: 0.0000005,
    tickValue: 6.25,
    name: "Japanese Yen",
    exchange: "CME",
  },

  "6B": {
    tickSize: 0.0001,
    tickValue: 6.25,
    name: "British Pound",
    exchange: "CME",
  },
  "6BU5": {
    tickSize: 0.0001,
    tickValue: 6.25,
    name: "British Pound",
    exchange: "CME",
  },
  "6BH25": {
    tickSize: 0.0001,
    tickValue: 6.25,
    name: "British Pound",
    exchange: "CME",
  },
  "6BM25": {
    tickSize: 0.0001,
    tickValue: 6.25,
    name: "British Pound",
    exchange: "CME",
  },
  "6BZ25": {
    tickSize: 0.0001,
    tickValue: 6.25,
    name: "British Pound",
    exchange: "CME",
  },

  "6A": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "Australian Dollar",
    exchange: "CME",
  },
  "6AU5": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "Australian Dollar",
    exchange: "CME",
  },
  "6AH25": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "Australian Dollar",
    exchange: "CME",
  },
  "6AM25": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "Australian Dollar",
    exchange: "CME",
  },
  "6AZ25": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "Australian Dollar",
    exchange: "CME",
  },

  "6C": {
    tickSize: 0.00005,
    tickValue: 10,
    name: "Canadian Dollar",
    exchange: "CME",
  },
  "6CU5": {
    tickSize: 0.00005,
    tickValue: 10,
    name: "Canadian Dollar",
    exchange: "CME",
  },
  "6CH25": {
    tickSize: 0.00005,
    tickValue: 10,
    name: "Canadian Dollar",
    exchange: "CME",
  },
  "6CM25": {
    tickSize: 0.00005,
    tickValue: 10,
    name: "Canadian Dollar",
    exchange: "CME",
  },
  "6CZ25": {
    tickSize: 0.00005,
    tickValue: 10,
    name: "Canadian Dollar",
    exchange: "CME",
  },

  "6S": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "Swiss Franc",
    exchange: "CME",
  },
  "6SU5": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "Swiss Franc",
    exchange: "CME",
  },
  "6SH25": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "Swiss Franc",
    exchange: "CME",
  },
  "6SM25": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "Swiss Franc",
    exchange: "CME",
  },
  "6SZ25": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "Swiss Franc",
    exchange: "CME",
  },

  "6N": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "New Zealand Dollar",
    exchange: "CME",
  },
  "6NU5": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "New Zealand Dollar",
    exchange: "CME",
  },
  "6NH25": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "New Zealand Dollar",
    exchange: "CME",
  },
  "6NM25": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "New Zealand Dollar",
    exchange: "CME",
  },
  "6NZ25": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "New Zealand Dollar",
    exchange: "CME",
  },

  "6M": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "Mexican Peso",
    exchange: "CME",
  },
  "6MU5": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "Mexican Peso",
    exchange: "CME",
  },
  "6MH25": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "Mexican Peso",
    exchange: "CME",
  },
  "6MM25": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "Mexican Peso",
    exchange: "CME",
  },
  "6MZ25": {
    tickSize: 0.0001,
    tickValue: 10,
    name: "Mexican Peso",
    exchange: "CME",
  },

  // Other major contracts
  NKD: {
    tickSize: 5,
    tickValue: 5,
    name: "Nikkei 225",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  NKDH25: {
    tickSize: 5,
    tickValue: 5,
    name: "Nikkei 225",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  NKDM25: {
    tickSize: 5,
    tickValue: 5,
    name: "Nikkei 225",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },
  NKDZ25: {
    tickSize: 5,
    tickValue: 5,
    name: "Nikkei 225",
    exchange: "CME",
    contractType: "mini",
    exchangeFee: 1.38, // CME exchange fee
  },

  // Micro E-mini Contracts
  // Micro E-mini NASDAQ-100 (MNQ)
  MNQ: {
    tickSize: 0.25,
    tickValue: 0.5,
    name: "Micro E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  MNQU5: {
    tickSize: 0.25,
    tickValue: 0.5,
    name: "Micro E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  MNQH25: {
    tickSize: 0.25,
    tickValue: 0.5,
    name: "Micro E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  MNQM25: {
    tickSize: 0.25,
    tickValue: 0.5,
    name: "Micro E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  MNQZ25: {
    tickSize: 0.25,
    tickValue: 0.5,
    name: "Micro E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  MNQH26: {
    tickSize: 0.25,
    tickValue: 0.5,
    name: "Micro E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  MNQM26: {
    tickSize: 0.25,
    tickValue: 0.5,
    name: "Micro E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  MNQZ26: {
    tickSize: 0.25,
    tickValue: 0.5,
    name: "Micro E-mini NASDAQ-100",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },

  // Micro E-mini S&P 500 (MES)
  MES: {
    tickSize: 0.25,
    tickValue: 1.25,
    name: "Micro E-mini S&P 500",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  MESU5: {
    tickSize: 0.25,
    tickValue: 1.25,
    name: "Micro E-mini S&P 500",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  MESH25: {
    tickSize: 0.25,
    tickValue: 1.25,
    name: "Micro E-mini S&P 500",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  MESM25: {
    tickSize: 0.25,
    tickValue: 1.25,
    name: "Micro E-mini S&P 500",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  MESZ25: {
    tickSize: 0.25,
    tickValue: 1.25,
    name: "Micro E-mini S&P 500",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  MESH26: {
    tickSize: 0.25,
    tickValue: 1.25,
    name: "Micro E-mini S&P 500",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  MESM26: {
    tickSize: 0.25,
    tickValue: 1.25,
    name: "Micro E-mini S&P 500",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  MESZ26: {
    tickSize: 0.25,
    tickValue: 1.25,
    name: "Micro E-mini S&P 500",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },

  // Micro E-mini Russell 2000 (M2K)
  M2K: {
    tickSize: 0.1,
    tickValue: 0.5,
    name: "Micro E-mini Russell 2000",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  M2KU5: {
    tickSize: 0.1,
    tickValue: 0.5,
    name: "Micro E-mini Russell 2000",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  M2KH25: {
    tickSize: 0.1,
    tickValue: 0.5,
    name: "Micro E-mini Russell 2000",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  M2KM25: {
    tickSize: 0.1,
    tickValue: 0.5,
    name: "Micro E-mini Russell 2000",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  M2KZ25: {
    tickSize: 0.1,
    tickValue: 0.5,
    name: "Micro E-mini Russell 2000",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  M2KH26: {
    tickSize: 0.1,
    tickValue: 0.5,
    name: "Micro E-mini Russell 2000",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  M2KM26: {
    tickSize: 0.1,
    tickValue: 0.5,
    name: "Micro E-mini Russell 2000",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },
  M2KZ26: {
    tickSize: 0.1,
    tickValue: 0.5,
    name: "Micro E-mini Russell 2000",
    exchange: "CME",
    contractType: "micro",
    exchangeFee: 0.35, // CME micro exchange fee
  },

  // Micro Gold (MGC)
  MGC: {
    tickSize: 0.1,
    tickValue: 1,
    name: "Micro Gold",
    exchange: "COMEX",
    contractType: "micro",
    exchangeFee: 0.35, // COMEX micro exchange fee
  },
  MGCU5: {
    tickSize: 0.1,
    tickValue: 1,
    name: "Micro Gold",
    exchange: "COMEX",
    contractType: "micro",
    exchangeFee: 0.35, // COMEX micro exchange fee
  },
  MGCH25: {
    tickSize: 0.1,
    tickValue: 1,
    name: "Micro Gold",
    exchange: "COMEX",
    contractType: "micro",
    exchangeFee: 0.35, // COMEX micro exchange fee
  },
  MGCM25: {
    tickSize: 0.1,
    tickValue: 1,
    name: "Micro Gold",
    exchange: "COMEX",
    contractType: "micro",
    exchangeFee: 0.35, // COMEX micro exchange fee
  },
  MGCZ25: {
    tickSize: 0.1,
    tickValue: 1,
    name: "Micro Gold",
    exchange: "COMEX",
    contractType: "micro",
    exchangeFee: 0.35, // COMEX micro exchange fee
  },
  MGCH26: {
    tickSize: 0.1,
    tickValue: 1,
    name: "Micro Gold",
    exchange: "COMEX",
    contractType: "micro",
    exchangeFee: 0.35, // COMEX micro exchange fee
  },
  MGCM26: {
    tickSize: 0.1,
    tickValue: 1,
    name: "Micro Gold",
    exchange: "COMEX",
    contractType: "micro",
    exchangeFee: 0.35, // COMEX micro exchange fee
  },
  MGCZ26: {
    tickSize: 0.1,
    tickValue: 1,
    name: "Micro Gold",
    exchange: "COMEX",
    contractType: "micro",
    exchangeFee: 0.35, // COMEX micro exchange fee
  },
};

/**
 * Get contract specifications for a symbol
 * @param {string} symbol - The contract symbol (e.g., 'NQ', 'ES')
 * @returns {Promise<Object>} Contract specifications with tickSize and tickValue
 */
export async function getContractSpecs(symbol) {
  // Check cache first
  if (contractSpecsCache.has(symbol)) {
    return contractSpecsCache.get(symbol);
  }

  // Check comprehensive database first
  if (CONTRACT_SPECS_DB[symbol]) {
    const specs = CONTRACT_SPECS_DB[symbol];
    contractSpecsCache.set(symbol, specs);
    console.log(`Found contract specs for ${symbol}:`, specs);
    return specs;
  }

  // Try pattern matching for unknown symbols
  const patternSpecs = getSpecsFromSymbol(symbol);
  if (patternSpecs) {
    contractSpecsCache.set(symbol, patternSpecs);
    return patternSpecs;
  }

  try {
    // Try to fetch from Alpha Vantage API (for future expansion)
    const specs = await fetchFromAlphaVantage(symbol);
    if (specs) {
      contractSpecsCache.set(symbol, specs);
      return specs;
    }
  } catch (error) {
    console.warn(
      `Failed to fetch contract specs for ${symbol} from API:`,
      error
    );
  }

  // Fallback to default specs if not found
  const defaultSpecs = {
    tickSize: 0.01,
    tickValue: 1,
    name: "Unknown Contract",
    exchange: "Unknown",
  };
  contractSpecsCache.set(symbol, defaultSpecs);
  console.warn(`Using default specs for unknown contract: ${symbol}`);
  return defaultSpecs;
}

/**
 * Fetch contract specifications from Alpha Vantage API
 * @param {string} symbol - The contract symbol
 * @returns {Promise<Object|null>} Contract specifications or null if not found
 */
async function fetchFromAlphaVantage(symbol) {
  try {
    // Use Alpha Vantage's futures quote endpoint
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data["Error Message"]) {
      throw new Error(data["Error Message"]);
    }

    if (data["Note"]) {
      throw new Error("API rate limit exceeded");
    }

    // Alpha Vantage doesn't provide contract specifications directly
    // We need to use a different approach or API
    console.log(`Alpha Vantage data for ${symbol}:`, data);

    // For now, we'll use a mapping approach based on symbol patterns
    return getSpecsFromSymbol(symbol);
  } catch (error) {
    console.error(`Error fetching contract specs for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get contract specifications based on symbol pattern
 * @param {string} symbol - The contract symbol
 * @returns {Object|null} Contract specifications or null if not found
 */
function getSpecsFromSymbol(symbol) {
  // Extract the base symbol (remove month/year codes)
  const baseSymbol = symbol.replace(/[0-9A-Z]{2,3}$/, "");

  // Look up the base symbol in our comprehensive database
  const specs = CONTRACT_SPECS_DB[baseSymbol];
  if (specs) {
    console.log(`Found specs for ${symbol} (base: ${baseSymbol}):`, specs);
    return specs;
  }

  console.log(`No specs found for ${symbol} (base: ${baseSymbol})`);
  return null;
}

/**
 * Calculate P&L for a trade using contract specifications
 * @param {Object} trade - Trade object with Symbol, Quantity, Price, Type
 * @param {Object} specs - Contract specifications with tickSize and tickValue
 * @returns {number} P&L in dollars
 */
export function calculateTradePnL(trade, specs) {
  const { Quantity, Price, Type } = trade;
  const { tickSize, tickValue } = specs;

  // For now, we'll use a simple calculation
  // In a real implementation, you'd need to know the entry price to calculate P&L
  // This is just a placeholder - the actual P&L calculation should be done in the position tracking logic

  return 0; // Placeholder
}

/**
 * Convert price difference to dollar value using contract specifications
 * @param {number} priceDifference - Price difference in points
 * @param {Object} specs - Contract specifications
 * @returns {number} Dollar value of the price difference
 */
export function priceDifferenceToDollars(priceDifference, specs) {
  const { tickSize, tickValue } = specs;
  const ticks = priceDifference / tickSize;
  const dollarValue = ticks * tickValue;
  console.log(
    `Price diff: ${priceDifference}, Tick size: ${tickSize}, Ticks: ${ticks}, Tick value: ${tickValue}, Dollar value: ${dollarValue}`
  );
  return dollarValue;
}

/**
 * Get all available contract symbols
 * @returns {Array<string>} Array of contract symbols
 */
export function getAvailableSymbols() {
  return Object.keys(CONTRACT_SPECS_DB);
}
