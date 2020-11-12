const commandLineArgs = require('command-line-args');
const player = require('./lib/player');
const listen = require('./lib/listen');
const printer = require('./lib/cmd_line_printer');
const meta = require('./lib/metadata');
const { Song, PlayState } = require('./lib/domain');

printer.printClear();

const optionDefinitions = [
  { name: 'mode', alias: 'm', type: String },
  { name: 'src', type: String, multiple: false, defaultOption: true },
  { name: 'simulate', alias: 's', type: Boolean }
];

const opts = commandLineArgs(optionDefinitions);

(async () => {
  if (!opts.src) {
    console.log('You must specify at least one path');
  } else {
    if (!opts.simulate) {
      process.stdout.write('\n');

      await player.init(opts);
      await listen(player);

      await player.play();
    } else {
      let playState = PlayState(Song(opts.src));
      playState.mode = opts.mode;
      playState = await player.setState(playState);

      await meta.setMetadata(playState.playing);
      printer.printSong(playState);

      const i = setInterval(async function () {
        playState.playing = playState.next;
        playState = await player.setState(playState);

        if (!playState) {
          console.log('END PLAYING');
          clearInterval(i);
          return;
        }

        await meta.setMetadata(playState.playing);
        printer.printSong(playState);

        if (!playState.next.path) {
          console.log('END PLAYING');
          clearInterval(i);
        }
      }, 1000);
    }
  }
})().catch(e => {
  console.log(e);
  // Deal with the fact the chain failed
});
