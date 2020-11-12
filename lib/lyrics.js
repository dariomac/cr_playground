const fetch = require('node-fetch');
const urlencode = require('urlencode');
const fsx = require('fs-extra');
const printer  = require('./cmd_line_printer');
const { getLyrics } = require('genius-lyrics-api');
const clipboardy = require('clipboardy');

const startOfLyricsArea = '</div></div></div></div><div class="hwc"><div class="BNeawe tAd8D AP7Wnd"><div><div class="BNeawe tAd8D AP7Wnd">';
const endOfLyricsArea = /<\/div><\/div><\/div><\/div><\/div><div><span class=".*"><div class="BNeawe uEec3 AP7Wnd">/ig;

async function download (song) {
  let i;
  let attemptStr = '';
  try {
    attemptStr = `https://www.google.com/search?q=${urlencode(`${song.tags.artist} ${song.tags.title}`)}+lyrics`;
    i = await fetch(attemptStr);
    i = await i.textConverted();
    [, i] = i.split(startOfLyricsArea);
    [i] = i.split(endOfLyricsArea);
  } catch (m) {
    try {
      attemptStr = `https://www.google.com/search?q=${urlencode(`${song.tags.artist} ${song.tags.title}`)}+song+lyrics`;
      i = await fetch(attemptStr);
      i = await i.text();
      [, i] = i.split(startOfLyricsArea);
      [i] = i.split(endOfLyricsArea);
    } catch (n) {
      try {
        attemptStr = `https://www.google.com/search?q=${urlencode(`${song.tags.artist} ${song.tags.title}`)}+song`;
        i = await fetch(attemptStr);
        i = await i.text();
        [, i] = i.split(startOfLyricsArea);
        [i] = i.split(endOfLyricsArea);
      } catch (o) {
        try {
          attemptStr = `https://www.google.com/search?q=${urlencode(`${song.tags.artist} ${song.tags.title}`)}`;
          i = await fetch(attemptStr);
          i = await i.text();
          [, i] = i.split(startOfLyricsArea);
          [i] = i.split(endOfLyricsArea);
        } catch (p) {
          try {
            attemptStr = `https://genius.com/search?q=${urlencode(`${song.tags.artist} ${song.tags.title}`)}`;
            const options = {
              // Getted from here: https://genius.com/api-clients
              apiKey: '4MvSFEk80r1ZQp2QPRi-lXAREzT1u45JtSRWsXgquUY9_zMtWjf1vZOQy6ES-CWl',
              title: song.tags.title,
              artist: song.tags.artist,
              optimizeQuery: true
            };
            
            i = await getLyrics(options);
            if (i.length === 0) {
              i = null;
            }
          }
          catch(q) {
            i = null;
            attemptStr = null;
          }
        }
      }
    }
  }
  
  if (i) {
    printer.printMsg(`Lyrics downloaded from ${attemptStr}\n`);
  }
  
  return i;
}

function getLyricFilename (song) {
  return `${song.path.substr(0, song.path.lastIndexOf("."))}.txt`;
}

function hasLocal (song) {
  const lyricsFile = getLyricFilename(song);

  return fsx.existsSync(lyricsFile);
}

async function read (song) {
  const lyricsFile = getLyricFilename(song);
  
  try {
    return fsx.readFileSync(lyricsFile).toString().trim();
  }
  catch (err) {
    return 'There is no lyric file for this song';
  }
}

function save (song) {
  if (song.lyrics.words) {
    const lyricsFile = getLyricFilename(song);
    try {
      // Save
      fsx.writeFileSync(lyricsFile, song.lyrics.words);
      return true;
    }
    catch (err) {
      return false;
    }
  }
}

async function setLyrics (song){
  song.lyrics.local = hasLocal(song);

  if (song.lyrics.local) {
    song.lyrics.words = await read(song);
  }
  else {
    song.lyrics.words = await download(song);
    song.lyrics.local = save(song);
  }

  if (song.lyrics.words) {
    song.lyrics.words = song.lyrics.words.replace(/\r/g, '');
  }

  return song;
}

async function override (song, fromClipboard = true) {
  if (fromClipboard) {
    song.lyrics.words = clipboardy.readSync();
  }
  else {
    song.lyrics.words = await download(song);
  }
  
  song.lyrics.local = save(song);

  return song;
}

module.exports = {
  download,
  hasLocal,
  read,
  setLyrics,
  override
}
