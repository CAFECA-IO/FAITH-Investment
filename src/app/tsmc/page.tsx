import yahooFinance from 'yahoo-finance2';
import ChartComponent from '@/components/charts';

interface HistoricalDataItem {
  date: string;
  close: number;
}

export default async function TsmcPage() {
  const symbol = '2330.TW';

  // 1. 取得即時股價資訊
  const quoteResult = await yahooFinance.quote(symbol);
  const currentPrice = quoteResult.regularMarketPrice ?? 0;
  const previousClose = quoteResult.regularMarketPreviousClose ?? 0;
  const dailyChange = currentPrice - previousClose;
  const dailyChangePercent = previousClose ? (dailyChange / previousClose) * 100 : 0;

  // 2. 取得近 30 日歷史股價資料
  const today = new Date();
  const past30Days = new Date();
  past30Days.setDate(today.getDate() - 30);

  // 取得每日資料 (interval 預設為 1d)
  const historicalRaw = await yahooFinance.historical(symbol, {
    period1: past30Days,
    period2: today,
  });

  // 整理資料：僅取日期與收盤價
  const historicalData: HistoricalDataItem[] = historicalRaw.map((item) => {
    const dateObj = new Date(item.date);
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');

    return {
      date: `${year}-${month}-${day}`,
      close: item.close ?? 0,
    };
  });

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 1rem' }}>
      <h1>台積電 (2330.TW) 股價資訊</h1>

      <div style={{ marginBottom: '20px' }}>
        <p>
          即時股價：<strong>{currentPrice}</strong>
        </p>
        <p>
          漲跌：
          <strong
            style={{
              color: dailyChange >= 0 ? 'red' : 'green',
              margin: '0 4px',
            }}
          >
            {dailyChange.toFixed(2)}
          </strong>
          ({dailyChangePercent.toFixed(2)}%)
        </p>
      </div>

      <div>
        <h2>近 30 日股價走勢</h2>
        <ChartComponent historicalData={historicalData} />
      </div>
    </div>
  );
}
