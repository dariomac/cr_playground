const mm = require('music-metadata');

function _str_pad_left (string, pad, length) {
  return (new Array(length + 1).join(pad) + string).slice(-length);
}

async function setMetadata (song) {
  try {
    const metadata = await mm.parseFile(song.path, { duration: true });

    song.tags.album = metadata.common.album;
    song.tags.artist = metadata.common.artist;
    song.tags.genre = metadata.common.genre;
    song.tags.title = metadata.common.title;
    song.tags.track = metadata.common.track.no;

    const durationInSec = metadata.format.duration;

    const minutes = Math.floor(durationInSec / 60);
    const seconds = Math.floor(durationInSec % 60);
    const finalTime = _str_pad_left(minutes, '0', 2) + ':' + _str_pad_left(seconds, '0', 2);
    song.durationInSec = durationInSec;
    song.duration = finalTime;

    song.rawMetadata = metadata;
  } catch (err) {
    song.rawMetadata = err;
  }

  return song;
}

module.exports = {
  setMetadata
};
