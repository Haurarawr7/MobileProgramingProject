import React, { useState } from 'react';
import { View } from 'react-native';
import { randomArray, sizeFor, maxFor, useStats } from './utils';
import { Tile, Row, Prompt, Msg, Btn } from './ui';

export default function SelectionGame({ level, onFinish }) {
  const [arr, setArr] = useState(() => randomArray(sizeFor(level), maxFor(level)));
  const [i, setI] = useState(0);
  const [stats, { ok, bad }] = useStats();
  const [msg, setMsg] = useState('Ketuk angka terkecil dari bagian yang belum terurut.');
  const done = i >= arr.length - 1;

  const press = (k) => {
    if (done || k < i) return;
    const sub = arr.slice(i);
    const minIdx = i + sub.indexOf(Math.min(...sub));
    if (k !== minIdx) {
      bad();
      setMsg(`${arr[k]} bukan yang terkecil. Cari lagi di bagian yang belum terurut.`);
      return;
    }
    ok();
    const a = [...arr];
    [a[i], a[k]] = [a[k], a[i]];
    setArr(a);
    setI(i + 1);
    setMsg(
      i + 1 >= arr.length - 1
        ? 'Selesai! Semua angka sudah terurut.'
        : `Benar! ${a[i]} dipindah ke posisi ${i + 1}.`,
    );
  };

  return (
    <View>
      <Prompt>{done ? 'Terurut!' : 'Pilih angka terkecil'}</Prompt>
      <Row wrap>
        {arr.map((v, k) => (
          <Tile
            key={k}
            value={v}
            state={done || k < i ? 'good' : 'idle'}
            onPress={() => press(k)}
          />
        ))}
      </Row>
      <Msg>{msg}</Msg>
      {done && <Row><Btn label="Lihat hasil" onPress={() => onFinish(stats)} /></Row>}
    </View>
  );
}
