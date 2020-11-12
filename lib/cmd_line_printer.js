const chalk = require('chalk');
const util = require('util');
const logUpdate = require('log-update');
const columns = require('cli-columns');
const _ = require('lodash');

let expanded = false;

const pidOffset = '       ';

function printSong (playState) {
  try {
    if (!playState.playing.duration || playState.playing.duration.indexOf('EISDIR') !== -1) {
      return;
    }
  } catch (err) {
    console.log(`PLaying ${playState.playing.path}`);
    console.log(err);
  }

  collapse();

  const tags = playState.playing.tags;
  process.stdout.write(chalk.grey(`[${playState.playing.pid}]`));
  process.stdout.write('\t');

  process.stdout.write(chalk.rgb(83, 81, 143)(`${tags.artist}`));
  process.stdout.write(' - ');
  process.stdout.write(chalk.rgb(83, 81, 143)(`${tags.album}`));
  process.stdout.write(chalk.grey(' // '));
  process.stdout.write(`${tags.track}.`);
  process.stdout.write(`${tags.title}`);
  process.stdout.write(' ');

  process.stdout.write(chalk.gray(`(${playState.playing.duration})`));
  process.stdout.write('\n');

  process.stdout.write(pidOffset);
  process.stdout.write(chalk.hex('#303030')(`${playState.playing.path.replace(playState.topLevelDir, '')}`));

  process.stdout.write('\n');
}

function printBye () {
  process.stdout.write(chalk.green('\nBye !!!\n'));
}

function printEOS () {
  process.stdout.write(chalk.green('\nThis is the end.\nNo more MP3s to play\n'));
}

function printDetails (playState) {
  const debugInfo = util.inspect(playState.playing.rawMetadata, { showHidden: false, depth: null });

  if (expanded) {
    collapse();
  } else {
    expand(chalk.yellow(`${debugInfo}\n`));
  }
}

function expand (content) {
  logUpdate(content);
  expanded = true;
}

function collapse () {
  if (expanded) {
    logUpdate.clear();
    logUpdate.done();
    expanded = false;
  }
}

function printErr (err) {
  process.stdout.write(chalk.red(`${err}`));
}

function printClear () {
  process.stdout.write('\x1bc');
}

function printLyrics (song) {
  if (expanded) {
    collapse();
  } else {
    let words = song.lyrics.words;
    if (words) {
      words = columns(_.chunk(words.replace(/\n\n/g, '\n \n').split('\n'), 1), {
        sort: false,
        width: process.stdout.columns
      });
      if (!song.lyrics.local) {
        words = `${words}\n\n${chalk.red('TEMPORAL LYRICS (downloaded but not saved)')}`;
      }
    } else {
      words = 'There is no lyric file for this song';
    }

    expand(chalk.yellow(`\n${words}\n`));
  }
}

function printMsg (msg) {
  process.stdout.write(msg);
}

module.exports = {
  printSong,
  printBye,
  printEOS,
  printDetails,
  printErr,
  printClear,
  printLyrics,
  printMsg,
  collapse,
  expand
};
