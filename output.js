require('dotenv').config()
const Twitter = require('twitter')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Twitterクライアント
const client = new Twitter({
  consumer_key: `${process.env.TWITTER_CONSUMER_KEY}`,
  consumer_secret: `${process.env.TWITTER_CONSUMER_SECRET}`,
  access_token_key: `${process.env.TWITTER_ACCESS_TOKEN_KEY}`,
  access_token_secret: `${process.env.TWITTER_ACCESS_TOKEN_SECRE}`
})

// CSVクライアント
const csvWriter = createCsvWriter({
  path: 'out.csv',
  header: [
    { id: "name", title: "name" },
    { id: "image_url", title: "image_url" },
    // { id: "prizes_text", title: "prizes_text" },
    { id: "site_url", title: "site_url" },
    { id: "due_date_text", title: "due_date_text" },
    { id: "end_at", title: "end_at" },
    {id: 'promoter_name', title: 'promoter_name'},
    // テスト用
    {id: 'text', title: 'text'},
  ]
});

async function searchTweet(count) {
  try {
    const searchData = await client.get('search/tweets', {
      q: `キャンペーン フォロー min_faves:30 min_retweets:100 (filter:images OR filter:link)`,
      count: count,
      tweet_mode: 'extended'
    })
    const data = searchData.statuses.map(tweet => {
      const dueDate = tweet.full_text.match(/(([1-9]|1[0-2])月([1-9]|[12][0-9]|3[01])日)|(([1-9]|1[0-2])\/([1-9]|[12][0-9]|3[01]))/) || [];
      const dueDateText = dueDate[0] || ""
      const endDate = dueDateText.replace("月", "/").replace("日",　"")
      const endDateAt = new Date(`2021/${endDate} 23:59`)


      const siteUrl = "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id;
      const campaignName = tweet.full_text.replace(/\r?\n/g, "").match(/(\D+)キャンペーン/) || []
      /*
      name → キャンペーン名 (option)
      image_url →  画像のURL
      prizes_text → 景品の情報  (option)
      site_url → https://twitter.com/okaponta_/status/1375674604409159680
      due_date_text → XX月XX日 10:00  (option)
      end_at → 2021-10-01 10:10  (option)
      promoter_name → 主催者のアカウント名
      */
      return {
        name: campaignName[0],
        image_url: tweet.user.profile_image_url,
        // prizes_text
        site_url: siteUrl,
        due_date_text: dueDate[0],
        end_at: endDateAt,
        promoter_name: tweet.user.name,
        text: tweet.full_text.replace(/\r?\n/g, ""),
      }
    })
    // CSVに出力
    await csvWriter.writeRecords(data)
    console.log('The CSV file was written successfully')
  } catch (error) {
    console.log("キャンペーンの一覧取得に失敗しました。")
    console.error(error)
    /*
      TODO：ここでSlackにエラー内容を送信する処理
    */
    throw new Error()
  }
}

searchTweet(100)

