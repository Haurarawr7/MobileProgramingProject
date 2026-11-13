import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { randomArray, sizeFor, maxFor, useStats } from './utils';
import { Tile, Row, Prompt, Label, Msg, Btn } from './ui';

export default function QuickGame({ level, onFinish }) {
  const [arr] = useState(() => randomArray(sizeFor(level), maxFor(level)));
  const pivot = arr[arr.length - 1];
  const others = arr.slice(0, -1);
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);
  const [stats, { ok, bad }] = useStats();
  const [msg, setMsg] = useState('Angka lebih kecil dari pivot ke kiri, lebih besar ke kanan.');
  const done = idx >= others.length;
  const cur = others[idx];

  const choose = (side) => {
    if (done) return;
    const correct = cur < pivot ? 'L' : 'R';
    side === correct ? ok() : bad();
    (correct === 'L' ? setLeft : setRight)((a) => [...a, cur]);
    setIdx(idx + 1);
    setMsg(cur < pivot ? `${cur} < ${pivot}, masuk ke kiri.` : `${cur} > ${pivot}, masuk ke kanan.`);
  };

  return (
    <View>
      <Prompt>{done ? 'Partisi selesai!' : 'Kiri atau kanan pivot?'}</Prompt>
      <View style={s.top}>
        <View>
          <Label>Pivot</Label>
          <Tile value={pivot} state="active" size="big" />
        </View>
        {!done && (
          <View>
            <Label>Angka sekarang</Label>
            <Tile value={cur} size="big" />
          </View>
        )}
      </View>

      {!done && (
        <Row>
          <Btn label={`Kiri (< ${pivot})`} onPress={() => choose('L')} />
          <Btn label={`Kanan (> ${pivot})`} kind="secondary" onPress={() => choose('R')} />
        </Row>
      )}

      <View style={s.buckets}>
        <View style={s.bucket}>
          <Label>Kiri</Label>
          <Row wrap>{left.map((v, k) => <Tile key={k} value={v} size="small" state="good" />)}</Row>
        </View>
        <View style={s.bucket}>
          <Label>Kanan</Label>
          <Row wrap>{right.map((v, k) => <Tile key={k} value={v} size="small" state="dim" />)}</Row>
        </View>
      </View>

      <Msg>{msg}</Msg>
      {done && <Row><Btn label="Lihat hasil" onPress={() => onFinish(stats)} /></Row>}
    </View>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', gap: 24, marginBottom: 16 },
  buckets: { flexDirection: 'row', gap: 12 },
  bucket: { flex: 1, minHeight: 70 },
});
