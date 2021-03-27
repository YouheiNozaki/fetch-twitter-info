require('dotenv').config()
const Twitter = require('twitter')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const client = new Twitter({
  consumer_key: `${process.env.TWITTER_CONSUMER_KEY}`,
  consumer_secret: `${process.env.TWITTER_CONSUMER_SECRET}`,
  access_token_key: `${process.env.TWITTER_ACCESS_TOKEN_KEY}`,
  access_token_secret: `${process.env.TWITTER_ACCESS_TOKEN_SECRE}`
})

const csvWriter = createCsvWriter({
  path: 'out.csv',
  header: [
    {id: 'id', title: 'ID'},
    {id: 'name', title: 'Name'},
    {id: 'screen_name', title: 'Screenname'},
    {id: 'image_url', title: 'Image'},
    {id: 'created_at', title: 'Created_at'},
    {id: 'text', title: 'Text'},
    {id: 'favorite_count', title: 'favorite_count'},
    {id: 'retweet_count', title: 'retweet_count'},
  ]
});

const data = []

async function searchTweet(count) {
  await client.get('search/tweets', {
    q: `キャンペーン フォロー min_faves:30 min_retweets:100 (filter:images OR filter:link)`,
    count: count,
    tweet_mode: 'extended'
  }, (error, searchData) => {
    if(error) {
      console.log("キャンペーンの一覧取得に失敗しました。")
      console.error(error)
      /*
        TODO：ここでSlackにエラー内容を送信
      */
      return error
    }
    searchData.statuses.forEach(tweet => {
      data.push({
        id: tweet.id,
        name: tweet.user.name,
        screen_name: tweet.user.screen_name,
        image_url: tweet.user.profile_image_url,
        created_at: tweet.created_at,
        text: tweet.full_text.replace(/\r?\n/g, ""),
        favorite_count: tweet.favorite_count,
        retweet_count: tweet.retweet_count
      })
    })
    // CSVに出力
    csvWriter
      .writeRecords(data)
      .then(()=> console.log('The CSV file was written successfully'))
    },
  );
}


searchTweet(100)

