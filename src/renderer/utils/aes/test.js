const crypto = require("crypto");
const key = "qwemoQAPydFvWWLq";
const iv = "wOzCypMUYVuiQO9f";

function encrypt(data) {
  try {
    let cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
    let crypted = cipher.update(data, "utf8", "binary");
    crypted += cipher.final("binary");
    crypted = new Buffer(crypted, "binary").toString("base64");
    return crypted;
  } catch (e) {}
}
function decrypt(crypted) {
  try {
    crypted = new Buffer(crypted, "base64").toString("binary");
    let decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
    let decoded = decipher.update(crypted, "binary", "utf8");
    decoded += decipher.final("utf8");
    return decoded;
  } catch (e) {}
}

let decode = decrypt(
  "nsLOrNE0FBAol3XJ0Ppx8KQxhVCZxDtcagC0Nryx0dwKoQHteoA5MjozZemyTY6TNvDliMNqZVp83IWOPB25lAA3xLK2Sgz11LEFJp9la9yclYC4rgaqUy3BLolasaUT8tn+eWGzaiEj8IGtGiIjHlqRhIuK2yTZkRcJ7xO7IwaCalxawW4jqGyurqe/PPocqP0WTyvKCoQaFRWdzecqlz1a7ld6qtvfKInfGZuiXceNQVmkHCfgduT6AApnwqqdf7AZ2nM8lSL6GD+2Gi9YNqB4hUz43bKoMnFl+Etxe6RkdEDW7F5NfJTM2fLRVRrs2nIm6KYq71id5YbOX8Ukc79a7ROm8yOleQyTvCaWJmNV0K6j5iO2Zo7tI6mv1QoCZwe9XvScAnh7YZj0YUhNcStNPP3780JrGMy9d8gO4Db5O+rXrJWPq3APq2fm7vJpczc2wsk+cNzGb29rB1Zg5axFs3xLXBGRL9Tk/5XNlfoQ1LjhXdBpCyhYfH6kGUZQGNK7dvWgvB8f1vywQLmULXXFHFespw7UkZ+88UIVlg3qZAt+c7XYMTgregwWa0XpfFaF+wb98jgzt2Ci0L1iuv34nAFClMiXSUh9EzQp4rLkVHGNhDcE7oup3jerhRgt2+D4JQG0nbH6RmChs5r6L42vbUyTH0IT0wOdZpKPc+BSX7u+WH6QokCb4W/iX/gU9ff0ykWpvtdci+ZQWPjsXGpBIpt+wciDSTFRv7YmnzH0/lbBMLH4ZBomGIe0PD+yPMgWsb5JKIdVjmqtO2kJNB+haIXzKPBPKbo39xBU9/PGOMWe2HQl7p2MsgTnyuMJ6LUVIJZb2fX24wIpdtBV/D5zv6sa/7Ayeqt5rtJYTj5B9FHhR0M//tLwPYuig6oppHX5NtW0bj/e5X+HedqwsHkLIUT7H3oIhN9nD/brhrp5+sgho+8EczZ6LbsNkvkCOcCRI6V8by6RESPAkSvLXB/PiZ4MfRb/sdHHrt64pPwTmRKEShtSNhreTgC5yhLVPi/BOOueZsWLbQOd018TzOPdB/mPgm2ZI6aQJeP1eo2RmxduH05RRtyFVn+r6PbN"
);
console.log(decode);

let str = `SELECT * FROM(

  SELECT   
  $IPGJ$ GJMC,
  $IPSF$ SFMC,
  ( CASE WHEN LENGTH ( ipcs ) > 1 THEN ipcs ELSE '' END ) CSMC,
  
                                                   COUNT(1) ALLCOUNT,
  
                                                   SUM(CASE JDBZ WHEN '进' THEN 1 ELSE 0 END) INCOUNT,
  
                                                   SUM(CASE JDBZ WHEN '进' THEN JYJE ELSE 0 END) JZJE ,
  
                                                   SUM(CASE JDBZ WHEN '出' THEN 1 ELSE 0 END) OUTCOUNT, 
  
                                                   SUM(CASE JDBZ WHEN '出' THEN JYJE ELSE 0 END) CZJE 
               FROM $MODEL_FILTER_GROUP$ WHERE AJID=$AJID$ AND IPGJ=$IPGJ$ AND IPSF=$IPSF$ $MODEL_FILTER$
  GROUP BY  CSMC $SQLORDERBY$)A WHERE 1=1 $MODEL_FILTER_CHILD$`;

str = encrypt(str);
console.log(str);
