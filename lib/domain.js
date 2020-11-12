
function PlayState (playingSong) {
  return {
    playing: playingSong,
    next: {},
    fullyPlayedDirs: [],
    topLevelDir: '',
    mode: ''
  };
}

function Song (path) {
  return {
    path,
    durationInSec: 0,
    duration: undefined,
    tags: {
      album: undefined,
      artist: undefined,
      genre: undefined,
      title: undefined,
      track: 0
    },
    pid: 0,
    rawMetadata: undefined,
    lyrics: {
      words: undefined,
      local: false
    }
  };
}

module.exports = {
  PlayState,
  Song
};
