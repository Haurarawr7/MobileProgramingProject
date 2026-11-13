import React, { useState } from 'react';
import { View } from 'react-native';
import { randomArray, sizeFor, maxFor, useStats } from './utils';
import { Tile, Row, Prompt, Msg, Btn } from './ui';

export default function BubbleGame({ level, onFinish }) {
  const [arr, setArr] = useState(() => randomArray(sizeFor(level), maxFor(level)));
  const [p, setP] = useState({ j: 0, pass: 0, swapped: false, done: false });
  const [stats, { ok, bad }] = useStats();
  const [msg, setMsg] = useState('Bandingkan dua angka yang disorot. Tukar jika kiri lebih besar.');
  const n = arr.length;

  const decide = (swap) => {
    if (p.done) return;
    const need = arr[p.j] > arr[p.j + 1];
    swap === need ? ok() : bad();

    const a = [...arr];
    if (need) [a[p.j], a[p.j + 1]] = [a[p.j + 1], a[p.j]];
    setArr(a);
    setMsg(
      need
        ? `${arr[p.j]} > ${arr[p.j + 1]}, jadi harus ditukar.`
        : `${arr[p.j]} < ${arr[p.j + 1]}, urutannya sudah benar.`,
    );

    const swapped = p.swapped || need;
    const nj = p.j + 1;
    if (nj >= n - 1 - p.pass) {
      // akhir satu putaran
      if (!swapped || p.pass + 1 >= n - 1) {
        setP({ ...p, swapped, done: true });
        setMsg('Selesai! Semua angka sudah terurut.');
      } else {
        setP({ j: 0, pass: p.pass + 1, swapped: false, done: false });
      }
    } else {
      setP({ ...p, j: nj, swapped });
    }
  };

  return (
    <View>
      <Prompt>{p.done ? 'Terurut!' : `Putaran ${p.pass + 1}: tukar atau lewati?`}</Prompt>
      <Row wrap>
        {arr.map((v, i) => {
          let state = 'idle';
          if (p.done || i >= n - p.pass) state = 'good';
          else if (i === p.j || i === p.j + 1) state = 'active';
          return <Tile key={i} value={v} state={state} />;
        })}
      </Row>
      <Msg>{msg}</Msg>
      {p.done ? (
        <Row><Btn label="Lihat hasil" onPress={() => onFinish(stats)} /></Row>
      ) : (
        <Row>
          <Btn label="Tukar" onPress={() => decide(true)} />
          <Btn label="Lewati" kind="secondary" onPress={() => decide(false)} />
        </Row>
      )}
    </View>
  );
}
