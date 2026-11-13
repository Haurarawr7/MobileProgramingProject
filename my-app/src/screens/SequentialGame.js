import React, { useState } from 'react';
import { View } from 'react-native';
import { randomArray, randInt, sizeFor, maxFor, useStats } from './utils';
import { Tile, Row, Prompt, Msg, Btn } from './ui';

const ROUNDS = 3;
const makeRound = (level) => {
  const arr = randomArray(sizeFor(level), maxFor(level));
  return { arr, target: arr[randInt(0, arr.length - 1)], next: 0 };
};
const START = 'Buka kartu satu per satu, mulai dari yang paling kiri.';

export default function SequentialGame({ level, onFinish }) {
  const [round, setRound] = useState(1);
  const [d, setD] = useState(() => makeRound(level));
  const [stats, { ok, bad }] = useStats();
  const [msg, setMsg] = useState(START);
  const found = d.next > 0 && d.arr[d.next - 1] === d.target;

  const press = (i) => {
    if (found) return;
    if (i !== d.next) {
      bad();
      setMsg('Pencarian berurutan harus membuka kartu dari kiri, satu per satu.');
      return;
    }
    ok();
    setD({ ...d, next: i + 1 });
    setMsg(d.arr[i] === d.target ? `Ketemu setelah ${i + 1} langkah!` : 'Bukan itu. Lanjut ke kartu berikutnya.');
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
        {d.arr.map((v, i) => (
          <Tile
            key={i}
            value={v}
            hidden={i >= d.next}
            state={i < d.next ? (v === d.target ? 'good' : 'dim') : 'idle'}
            onPress={() => press(i)}
          />
        ))}
      </Row>
      <Msg>{msg}</Msg>
      {found && <Row><Btn label={round >= ROUNDS ? 'Lihat hasil' : 'Ronde berikutnya'} onPress={advance} /></Row>}
    </View>
  );
}
