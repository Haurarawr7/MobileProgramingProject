import React, { useState } from 'react';
import { View } from 'react-native';
import { randomArray, randInt, sizeFor, maxFor, useStats } from './utils';
import { Tile, Row, Prompt, Msg, Btn } from './ui';

const ROUNDS = 3;
const makeRound = (level) => {
  const arr = randomArray(sizeFor(level), maxFor(level)).sort((a, b) => a - b);
  return {
    arr,
    target: arr[randInt(0, arr.length - 1)],
    lo: 0,
    hi: arr.length - 1,
    opened: [],
    found: false,
  };
};
const START = 'Daftar sudah terurut. Buka kartu yang tepat di tengah rentang.';

export default function BinaryGame({ level, onFinish }) {
  const [round, setRound] = useState(1);
  const [d, setD] = useState(() => makeRound(level));
  const [stats, { ok, bad }] = useStats();
  const [msg, setMsg] = useState(START);

  const press = (i) => {
    if (d.found) return;
    const mid = Math.floor((d.lo + d.hi) / 2);
    if (i < d.lo || i > d.hi) {
      bad();
      setMsg('Kartu itu sudah dicoret. Pilih dari rentang yang masih terang.');
      return;
    }
    if (i !== mid) {
      bad();
      setMsg('Pilih kartu yang tepat di tengah rentang.');
      return;
    }
    ok();
    const v = d.arr[mid];
    const opened = [...d.opened, mid];
    if (v === d.target) {
      setD({ ...d, opened, found: true });
      setMsg(`Ketemu! Hanya butuh ${opened.length} langkah.`);
    } else if (v < d.target) {
      setD({ ...d, opened, lo: mid + 1 });
      setMsg(`${v} lebih kecil dari ${d.target}. Buang bagian kiri.`);
    } else {
      setD({ ...d, opened, hi: mid - 1 });
      setMsg(`${v} lebih besar dari ${d.target}. Buang bagian kanan.`);
    }
  };

  const advance = () => {
    if (round >= ROUNDS) return onFinish(stats);
    setRound(round + 1);
    setD(makeRound(level));
    setMsg(START);
  };

  return (
    <View>
      <Prompt>Ronde {round}/{ROUNDS}: cari angka {d.target}</Prompt>
      <Row wrap>
        {d.arr.map((v, i) => {
          let state = 'idle';
          if (i < d.lo || i > d.hi) state = 'dim';
          if (d.opened.includes(i)) state = v === d.target ? 'good' : 'bad';
          return <Tile key={i} value={v} state={state} onPress={() => press(i)} />;
        })}
      </Row>
      <Msg>{msg}</Msg>
      {d.found && <Row><Btn label={round >= ROUNDS ? 'Lihat hasil' : 'Ronde berikutnya'} onPress={advance} /></Row>}
    </View>
  );
}
