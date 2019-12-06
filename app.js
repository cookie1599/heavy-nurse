  const Discord = require('discord.js');
  const client = new Discord.Client();
  const https = require('https');
  const util = require('util');
  var Fuse = require('fuse.js');
  const talkedRecently = new Set();
  var parseString = require('xml2js').parseString;
  var prefix = '!gr ';

  client.on('ready', () => {
      //console.log(`Logged in as ${client.user.tag} with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
      client.user.setPresence({
          game: {
              name: 'with books | !gr help',
          },
          status: 'online'
      })
  });

  client.on('message', async msg => {
      if (msg.author.bot) return;
      if (msg.content === 'ping') {
          msg.channel.send('kong!');
      }

      if (!msg.content.startsWith(prefix) || (msg.author.bot && (msg.author.id !== 521799384644714496))) return;

      var grquery = msg.content.slice(prefix.length).trim();
      if (grquery != "help" && grquery != "example" && grquery != "Aevan" && grquery != "ping") {
          var uri = 'https://www.goodreads.com/search/index.xml?key=' + process.env.GRTOKEN + '&q=' + grquery;
          https.get(uri, (res) => {
              //Sorry Boson The invite Kick System Pls DM ME
              //whats your ID , Mineknight#9386
              //You Can Also Join The Server Back

              const statusCode = res.statusCode;
              const contentType = res.headers['content-type'];
              let error;
              if (statusCode !== 200) {
                  error = new Error('Request Failed.\n' +
                      `Status Code: ${statusCode}`);
              }
              if (error) {
                  console.log(error.message);
                  // consume response data to free up memory
                  res.resume();
                  return;
              }

              res.setEncoding('utf8');
              let rawData = '';
              res.on('data', (chunk) => rawData += chunk);
              res.on('end', () => {
                  try {
                      parseString(rawData, function(err, result) {
                          console.log(result)
                          var resultJSON = JSON.stringify(result);
                          var options = {
                              shouldSort: true,
                              tokenize: true,
                              threshold: 0.6,
                              location: 0,
                              distance: 100,
                              maxPatternLength: 42,
                              minMatchCharLength: 2,
                              keys: [
                                  "GoodreadsResponse.search.results.work.best_book.title",
                                  "GoodreadsResponse.search.results.work.best_book.author.name"
                                  // these are keys for fuzzy matching with fusejs.io
                              ]
                          };

                          // the goodreads response is xml, so I am converting it to json from xml2js module
                          // and then I am using fuzzy search (fusejs.io) to match title and author names from JSON
                          // anyone active to help????
                          //use chat.txt file
                          console.log(resultJSON);

                          var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                          function monthNumToName(monthnum) {
                              return months[monthnum - 1] || '';
                          }

                          var firstTitle = result.GoodreadsResponse.search[0].results[0].work[0].best_book[0].title[0];
                          var firstAuthor = result.GoodreadsResponse.search[0].results[0].work[0].best_book[0].author[0].name[0];
                          var firstTitleLink = "https://goodreads.com/book/show/" + result.GoodreadsResponse.search[0].results[0].work[0].best_book[0].id[0];
                          var firstAuthorLink = "https://goodreads.com/author/show/" + result.GoodreadsResponse.search[0].results[0].work[0].best_book[0].author[0].id[0];
                          var month = result.GoodreadsResponse.search[0].results[0].work[0].original_publication_month[0]._
                          var month = monthNumToName(month);
                          var firstDate = month + " " + result.GoodreadsResponse.search[0].results[0].work[0].original_publication_year[0]._;
                          var firstRatings = result.GoodreadsResponse.search[0].results[0].work[0].ratings_count[0]._;
                          var firstReviews = result.GoodreadsResponse.search[0].results[0].work[0].text_reviews_count[0]._;
                          var firstRating = result.GoodreadsResponse.search[0].results[0].work[0].average_rating[0];
                          var firstCover = result.GoodreadsResponse.search[0].results[0].work[0].best_book[0].image_url[0];
                          const replyEmbed = new Discord.RichEmbed()
                              .setColor(0x7DD121)
                              .setDescription("**[firstTitle](firstTitleLink)** by [firstAuthor](firstAuthorLink)", firstTitle, firstTitleLink, firstAuthor, firstAuthorLink)
                              .setImage(firstCover)
                              .addField("Published:", firstDate, true)
                              .addBlankField(true)
                              .addField("Rating:", firstRating, true)
                              .addField("No. of Reviews:", firstReviews, true)
                              .addBlankField(true)
                              .addField("No. of Ratings:", firstRatings, true);

                          msg.channel.send(replyEmbed);

                          var fuse = new Fuse(resultJSON, options);
                          var resultSort = fuse.search(grquery);
                          console.log(resultSort); //this is not showing any results
                          console.log(grquery);
                          console.log(result.GoodreadsResponse.search[0].results[0].work[0].best_book[0].title[0]);

                      });
                  } catch (e) {
                      console.log(e.message);
                  }
              });
          }).on('error', (e) => {
              console.log(`Got error: ${e.message}`);
          });
      }


      if (msg.content.startsWith(prefix + "ping")) {
          msg.channel.send(`One-way Latency is ${Math.round(client.ping)}ms`);
      }

      if (msg.content.startsWith(prefix + "help")) {
          const embed = new Discord.RichEmbed()
              .setColor(0x7DD121)
              .setDescription("**Search examples:**```\n!gr the fellowship of the ring``````\n!gr fellowship ring``````\n!gr fellowship ring tolkien``````\n!gr 9780618346257``````\n!gr example```\n\n")
              .addField("Cannot search your book?", "\'Check for typos\' or \'refine your search\'")
              .addField("Found a BUGGG!!! or missing an important feature?: ", "Mention or DM @Aevan")
          msg.channel.send(embed);
      };

      if (talkedRecently.has(msg.author.id))
          msg.reply('Speed Searcher');
      talkedRecently.add(msg.author.id);
      setTimeout(() => {
          // Removes the user from the set after 2.0 seconds
          talkedRecently.delete(msg.author.id);
      }, 2000);

      if (msg.content.startsWith(prefix + "eval")) {
          if (msg.author.id !== process.env.ownerID)
              return;
      }

      if (msg.content.startsWith(prefix + "example")) {
          const embed = new Discord.RichEmbed()

              .setColor(0x7DD121)
              .setDescription("**[The Fellowship of the Ring (The Lord of the Rings, #1)](https://www.goodreads.com/book/show/34)** by [J.R.R. Tolkien](https://www.goodreads.com/author/show/656983)")
              .setImage("https://images.gr-assets.com/books/1298411339m/34.jpg")
              .addField("Published:", "9 Jul 1954", true)
              .addBlankField(true)
              .addField("Rating:", "4.35", true)
              .addField("No. of Reviews:", "17637", true)
              .addBlankField(true)
              .addField("No. of Ratings:", "2028090", true);

          msg.channel.send(embed);
      }

      if (msg.content == "!gr Aevan") { msg.channel.send('Master! We got a Follower. @Aevan'); }
      if (msg.content == "!gr bug") {
          msg.author.send("DM or mention @Aevan")
      };
  });

  client.login(process.env.DISCORDTOKEN);

  //client.on("error", (e) => console.error(e));
  //client.on("warn", (e) => console.warn(e));
  // client.on("debug", (e) => console.info(e)););